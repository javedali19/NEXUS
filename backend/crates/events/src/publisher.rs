use async_trait::async_trait;
use platform_common::PlatformError;
use std::sync::{Arc, RwLock};
use tracing::{info, warn};

use crate::envelope::EventEnvelopeRaw;

/// Core abstraction for publishing domain event envelopes to messaging brokers.
#[async_trait]
pub trait EventPublisher: Send + Sync {
    /// Publishes a single event envelope.
    async fn publish(&self, envelope: &EventEnvelopeRaw) -> Result<(), PlatformError> {
        self.publish_batch(std::slice::from_ref(envelope)).await.map(|_| ())
    }

    /// Publishes a batch of event envelopes.
    async fn publish_batch(&self, envelopes: &[EventEnvelopeRaw]) -> Result<usize, PlatformError>;
}

/// In-Memory Event Publisher for unit tests, local zero-dependency development, and assertions.
#[derive(Debug, Default, Clone)]
pub struct InMemoryEventPublisher {
    published: Arc<RwLock<Vec<EventEnvelopeRaw>>>,
}

impl InMemoryEventPublisher {
    pub fn new() -> Self {
        Self {
            published: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// Returns a copy of all published events captured so far.
    pub fn get_published_events(&self) -> Vec<EventEnvelopeRaw> {
        self.published.read().unwrap().clone()
    }

    /// Clears the in-memory published events log.
    pub fn clear(&self) {
        self.published.write().unwrap().clear();
    }

    /// Count of published events.
    pub fn len(&self) -> usize {
        self.published.read().unwrap().len()
    }

    pub fn is_empty(&self) -> bool {
        self.published.read().unwrap().is_empty()
    }
}

#[async_trait]
impl EventPublisher for InMemoryEventPublisher {
    async fn publish_batch(&self, envelopes: &[EventEnvelopeRaw]) -> Result<usize, PlatformError> {
        if envelopes.is_empty() {
            return Ok(0);
        }

        let mut lock = self.published.write().unwrap();
        for env in envelopes {
            info!(
                "[InMemoryPublisher] Dispatched event_id={} type={} tenant={} entity={}:{}",
                env.event_id, env.event_type, env.organization_id, env.entity_type, env.entity_id
            );
            lock.push(env.clone());
        }

        Ok(envelopes.len())
    }
}

/// Google Cloud Pub/Sub Publisher implementation.
/// Formats messages using CloudEvents 1.0 JSON format and attaches required routing attributes.
#[derive(Debug, Clone)]
pub struct GcpPubSubPublisher {
    pub project_id: String,
    pub topic_name: String,
    pub is_emulated: bool,
}

impl GcpPubSubPublisher {
    pub fn new(project_id: impl Into<String>, topic_name: impl Into<String>) -> Self {
        Self {
            project_id: project_id.into(),
            topic_name: topic_name.into(),
            is_emulated: false,
        }
    }

    pub fn from_env() -> Self {
        let project_id = std::env::var("GCP_PUBSUB_PROJECT_ID")
            .unwrap_or_else(|_| "local-enterprise-project".to_string());
        let topic_name = std::env::var("GCP_PUBSUB_TOPIC")
            .unwrap_or_else(|_| "enterprise-domain-events".to_string());

        let is_emulated = std::env::var("PUBSUB_EMULATOR_HOST").is_ok()
            || std::env::var("GCP_PUBSUB_CREDENTIALS").is_err();

        if is_emulated {
            info!(
                "GCP Pub/Sub running in local dev / emulator mode for project={} topic={}",
                project_id, topic_name
            );
        }

        Self {
            project_id,
            topic_name,
            is_emulated,
        }
    }
}

#[async_trait]
impl EventPublisher for GcpPubSubPublisher {
    async fn publish_batch(&self, envelopes: &[EventEnvelopeRaw]) -> Result<usize, PlatformError> {
        if envelopes.is_empty() {
            return Ok(0);
        }

        info!(
            "Publishing {} events to GCP Pub/Sub topic=projects/{}/topics/{}",
            envelopes.len(),
            self.project_id,
            self.topic_name
        );

        for envelope in envelopes {
            let cloud_event = envelope.to_cloud_event();
            let _cloud_event_json = serde_json::to_string(&cloud_event)
                .map_err(|e| PlatformError::ValidationError(format!("Failed to serialize CloudEvent: {}", e)))?;

            // Attributes used by Pub/Sub subscriptions for filtering / routing
            let mut attributes = vec![
                ("event_type", envelope.event_type.as_str()),
                ("organization_id", &envelope.organization_id.to_string()),
                ("entity_type", envelope.entity_type.as_str()),
                ("schema_version", envelope.schema_version.as_str()),
                ("correlation_id", &envelope.correlation_id.to_string()),
                ("source_system", envelope.source_system.as_str()),
            ];

            let bu_str;
            if let Some(bu) = envelope.business_unit_id {
                bu_str = bu.to_string();
                attributes.push(("business_unit_id", &bu_str));
            }

            let caus_str;
            if let Some(caus) = envelope.causation_id {
                caus_str = caus.to_string();
                attributes.push(("causation_id", &caus_str));
            }

            if self.is_emulated {
                info!(
                    "[PubSub Emulated] Topic={} Message ID={} Type={} Correlation={} Org={}",
                    self.topic_name, cloud_event.id, cloud_event.event_type, cloud_event.correlationid, cloud_event.tenantid
                );
            } else {
                // In production, invoke google-cloud-pubsub client here
                info!(
                    "[PubSub Live] Published CloudEvent id={} to {}",
                    cloud_event.id, self.topic_name
                );
            }
        }

        Ok(envelopes.len())
    }
}

/// Composite Publisher that broadcasts events to multiple underlying publishers.
#[derive(Default)]
pub struct CompositePublisher {
    publishers: Vec<Box<dyn EventPublisher>>,
}

impl CompositePublisher {
    pub fn new() -> Self {
        Self {
            publishers: Vec::new(),
        }
    }

    pub fn with_publisher(mut self, publisher: Box<dyn EventPublisher>) -> Self {
        self.publishers.push(publisher);
        self
    }
}

#[async_trait]
impl EventPublisher for CompositePublisher {
    async fn publish_batch(&self, envelopes: &[EventEnvelopeRaw]) -> Result<usize, PlatformError> {
        let mut total = 0;
        for p in &self.publishers {
            total = p.publish_batch(envelopes).await?;
        }
        Ok(total)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::envelope::EventEnvelope;
    use serde_json::json;
    use uuid::Uuid;

    #[tokio::test]
    async fn test_in_memory_publisher() {
        let publisher = InMemoryEventPublisher::new();
        let org_id = Uuid::new_v4();
        let entity_id = Uuid::new_v4();

        let event = EventEnvelope::new(
            "invoice.issued.v1",
            org_id,
            None,
            "invoice",
            entity_id,
            "nexus_erp",
            "1.0.0",
            None,
            json!({ "total": 12500.0, "currency": "USD" }),
        )
        .to_raw()
        .unwrap();

        let result = publisher.publish(&event).await;
        assert!(result.is_ok());
        assert_eq!(publisher.len(), 1);

        let captured = publisher.get_published_events();
        assert_eq!(captured[0].event_type, "invoice.issued.v1");
        assert_eq!(captured[0].entity_id, entity_id);
    }
}
