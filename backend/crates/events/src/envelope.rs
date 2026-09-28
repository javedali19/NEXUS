use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

/// Distributed Trace Context carrying root correlation and immediate causation.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TraceContext {
    pub correlation_id: Uuid,
    pub causation_id: Option<Uuid>,
}

impl TraceContext {
    /// Creates a new root trace context with a newly generated correlation ID.
    pub fn new_root() -> Self {
        Self {
            correlation_id: Uuid::new_v4(),
            causation_id: None,
        }
    }

    /// Creates a trace context with a specific correlation ID and optional causation ID.
    pub fn from_ids(correlation_id: Uuid, causation_id: Option<Uuid>) -> Self {
        Self {
            correlation_id,
            causation_id,
        }
    }

    /// Derives a child trace context where causation becomes the given event ID.
    pub fn derive_child(&self, parent_event_id: Uuid) -> Self {
        Self {
            correlation_id: self.correlation_id,
            causation_id: Some(parent_event_id),
        }
    }
}

impl Default for TraceContext {
    fn default() -> Self {
        Self::new_root()
    }
}

/// Canonical Event Envelope matching enterprise specification.
/// Strongly typed over payload `T`.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EventEnvelope<T> {
    pub event_id: Uuid,
    pub event_type: String,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub entity_type: String,
    pub entity_id: Uuid,
    pub source_system: String,
    pub occurred_at: DateTime<Utc>,
    pub schema_version: String,
    pub correlation_id: Uuid,
    pub causation_id: Option<Uuid>,
    pub payload: T,
}

/// Raw untyped Event Envelope holding JSON payload for outbox persistence and transport.
pub type EventEnvelopeRaw = EventEnvelope<Value>;

impl<T: Serialize> EventEnvelope<T> {
    /// Builder to create a new canonical Event Envelope.
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        event_type: impl Into<String>,
        organization_id: Uuid,
        business_unit_id: Option<Uuid>,
        entity_type: impl Into<String>,
        entity_id: Uuid,
        source_system: impl Into<String>,
        schema_version: impl Into<String>,
        trace_context: Option<&TraceContext>,
        payload: T,
    ) -> Self {
        let default_trace = TraceContext::new_root();
        let trace = trace_context.unwrap_or(&default_trace);

        Self {
            event_id: Uuid::new_v4(),
            event_type: event_type.into(),
            organization_id,
            business_unit_id,
            entity_type: entity_type.into(),
            entity_id,
            source_system: source_system.into(),
            occurred_at: Utc::now(),
            schema_version: schema_version.into(),
            correlation_id: trace.correlation_id,
            causation_id: trace.causation_id,
            payload,
        }
    }

    /// Converts this typed event envelope into a raw JSON `EventEnvelopeRaw`.
    pub fn to_raw(&self) -> Result<EventEnvelopeRaw, serde_json::Error> {
        let payload_value = serde_json::to_value(&self.payload)?;
        Ok(EventEnvelopeRaw {
            event_id: self.event_id,
            event_type: self.event_type.clone(),
            organization_id: self.organization_id,
            business_unit_id: self.business_unit_id,
            entity_type: self.entity_type.clone(),
            entity_id: self.entity_id,
            source_system: self.source_system.clone(),
            occurred_at: self.occurred_at,
            schema_version: self.schema_version.clone(),
            correlation_id: self.correlation_id,
            causation_id: self.causation_id,
            payload: payload_value,
        })
    }

    /// Derives a child event from this event envelope, linking causation to `self.event_id`
    /// and preserving the root `correlation_id`.
    pub fn derive_child<C: Serialize>(
        &self,
        event_type: impl Into<String>,
        entity_type: impl Into<String>,
        entity_id: Uuid,
        source_system: impl Into<String>,
        schema_version: impl Into<String>,
        child_payload: C,
    ) -> EventEnvelope<C> {
        EventEnvelope {
            event_id: Uuid::new_v4(),
            event_type: event_type.into(),
            organization_id: self.organization_id,
            business_unit_id: self.business_unit_id,
            entity_type: entity_type.into(),
            entity_id,
            source_system: source_system.into(),
            occurred_at: Utc::now(),
            schema_version: schema_version.into(),
            correlation_id: self.correlation_id,
            causation_id: Some(self.event_id),
            payload: child_payload,
        }
    }

    /// Converts this envelope to a standardized CloudEvents 1.0 JSON representation.
    pub fn to_cloud_event(&self) -> CloudEventMessage {
        let payload_json = serde_json::to_value(&self.payload).unwrap_or(Value::Null);
        CloudEventMessage {
            specversion: "1.0".to_string(),
            id: self.event_id.to_string(),
            source: format!("//platform.enterprise/tenant/{}", self.organization_id),
            event_type: self.event_type.clone(),
            datacontenttype: "application/json".to_string(),
            time: self.occurred_at.to_rfc3339(),
            tenantid: self.organization_id.to_string(),
            businessunitid: self.business_unit_id.map(|bu| bu.to_string()),
            entitytype: self.entity_type.clone(),
            entityid: self.entity_id.to_string(),
            schemaversion: self.schema_version.clone(),
            correlationid: self.correlation_id.to_string(),
            causationid: self.causation_id.map(|c| c.to_string()),
            data: payload_json,
        }
    }
}

/// Standard CloudEvents 1.0 structure with enterprise multi-tenant extensions.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CloudEventMessage {
    pub specversion: String,
    pub id: String,
    pub source: String,
    #[serde(rename = "type")]
    pub event_type: String,
    pub datacontenttype: String,
    pub time: String,
    pub tenantid: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub businessunitid: Option<String>,
    pub entitytype: String,
    pub entityid: String,
    pub schemaversion: String,
    pub correlationid: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub causationid: Option<String>,
    pub data: Value,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_event_envelope_creation_and_cloud_event() {
        let org_id = Uuid::new_v4();
        let bu_id = Uuid::new_v4();
        let entity_id = Uuid::new_v4();
        let trace = TraceContext::new_root();

        let envelope = EventEnvelope::new(
            "customer.created.v1",
            org_id,
            Some(bu_id),
            "customer",
            entity_id,
            "nexus_crm",
            "1.0.0",
            Some(&trace),
            json!({ "name": "Acme Corp", "tier": "enterprise" }),
        );

        assert_eq!(envelope.organization_id, org_id);
        assert_eq!(envelope.business_unit_id, Some(bu_id));
        assert_eq!(envelope.entity_type, "customer");
        assert_eq!(envelope.entity_id, entity_id);
        assert_eq!(envelope.correlation_id, trace.correlation_id);
        assert_eq!(envelope.causation_id, None);

        let cloud_event = envelope.to_cloud_event();
        assert_eq!(cloud_event.specversion, "1.0");
        assert_eq!(cloud_event.event_type, "customer.created.v1");
        assert_eq!(cloud_event.tenantid, org_id.to_string());
        assert_eq!(cloud_event.entityid, entity_id.to_string());
    }

    #[test]
    fn test_correlation_and_causation_chain() {
        let org_id = Uuid::new_v4();
        let parent_id = Uuid::new_v4();

        // 1. Root event (e.g. Call Completed)
        let root_event = EventEnvelope::new(
            "call.completed.v1",
            org_id,
            None,
            "call",
            parent_id,
            "nexus_telephony",
            "1.0.0",
            None,
            json!({ "duration_sec": 340 }),
        );

        // 2. Child event triggered by root (e.g. AI Sentiment Analyzed)
        let child_event = root_event.derive_child(
            "sentiment.analyzed.v1",
            "call",
            parent_id,
            "nexus_ai",
            "1.0.0",
            json!({ "score": 0.92, "label": "positive" }),
        );

        assert_eq!(child_event.correlation_id, root_event.correlation_id);
        assert_eq!(child_event.causation_id, Some(root_event.event_id));

        // 3. Grandchild event triggered by sentiment (e.g. Deal Stage Advanced)
        let deal_id = Uuid::new_v4();
        let grandchild_event = child_event.derive_child(
            "deal.stage_advanced.v1",
            "deal",
            deal_id,
            "nexus_crm",
            "1.0.0",
            json!({ "new_stage": "proposal" }),
        );

        assert_eq!(grandchild_event.correlation_id, root_event.correlation_id);
        assert_eq!(grandchild_event.causation_id, Some(child_event.event_id));
    }
}
