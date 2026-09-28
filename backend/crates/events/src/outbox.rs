use chrono::{DateTime, Utc};
use platform_common::PlatformError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{Postgres, Transaction};
use tracing::{error, info, warn};
use uuid::Uuid;

use crate::envelope::{EventEnvelope, EventEnvelopeRaw};
use crate::publisher::EventPublisher;

/// Exact database row structure corresponding to canonical `outbox_events` table.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct OutboxEventRecord {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub event_type: String,
    pub aggregate_type: String,
    pub aggregate_id: Uuid,
    pub entity_type: String,
    pub entity_id: Option<Uuid>,
    pub source_system: String,
    pub occurred_at: DateTime<Utc>,
    pub schema_version: String,
    pub correlation_id: Uuid,
    pub causation_id: Option<Uuid>,
    pub payload: Value,
    pub metadata: Value,
    pub retry_count: i32,
    pub last_error: Option<String>,
    pub created_at: DateTime<Utc>,
    pub published_at: Option<DateTime<Utc>>,
}

impl OutboxEventRecord {
    /// Converts this database record into a raw EventEnvelope for dispatching.
    pub fn to_envelope_raw(&self) -> EventEnvelopeRaw {
        EventEnvelopeRaw {
            event_id: self.id,
            event_type: self.event_type.clone(),
            organization_id: self.tenant_id,
            business_unit_id: self.business_unit_id,
            entity_type: self.entity_type.clone(),
            entity_id: self.entity_id.unwrap_or(self.aggregate_id),
            source_system: self.source_system.clone(),
            occurred_at: self.occurred_at,
            schema_version: self.schema_version.clone(),
            correlation_id: self.correlation_id,
            causation_id: self.causation_id,
            payload: self.payload.clone(),
        }
    }
}

/// Atomically persists a canonical Event Envelope inside an active PostgreSQL database transaction.
/// Ensures 100% transactional consistency between entity state mutation and outbox persistence.
pub async fn save_outbox_event_tx<T: Serialize + Send + Sync>(
    tx: &mut Transaction<'_, Postgres>,
    envelope: &EventEnvelope<T>,
) -> Result<Uuid, PlatformError> {
    let payload_json = serde_json::to_value(&envelope.payload)
        .map_err(|e| PlatformError::ValidationError(format!("Failed to serialize event payload: {}", e)))?;

    let metadata_json = serde_json::json!({
        "correlation_id": envelope.correlation_id,
        "causation_id": envelope.causation_id,
        "schema_version": envelope.schema_version,
        "source_system": envelope.source_system,
    });

    sqlx::query(
        r#"
        INSERT INTO outbox_events (
            id,
            tenant_id,
            business_unit_id,
            event_type,
            aggregate_type,
            aggregate_id,
            entity_type,
            entity_id,
            source_system,
            occurred_at,
            schema_version,
            correlation_id,
            causation_id,
            payload,
            metadata,
            retry_count,
            created_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 0, NOW()
        )
        "#
    )
    .bind(envelope.event_id)
    .bind(envelope.organization_id)
    .bind(envelope.business_unit_id)
    .bind(&envelope.event_type)
    .bind(&envelope.entity_type)
    .bind(envelope.entity_id)
    .bind(&envelope.entity_type)
    .bind(envelope.entity_id)
    .bind(&envelope.source_system)
    .bind(envelope.occurred_at)
    .bind(&envelope.schema_version)
    .bind(envelope.correlation_id)
    .bind(envelope.causation_id)
    .bind(payload_json)
    .bind(metadata_json)
    .execute(&mut **tx)
    .await
    .map_err(|e| PlatformError::DatabaseError(format!("Failed to persist outbox event: {}", e)))?;

    Ok(envelope.event_id)
}

/// Outbox Repository with concurrent lock-free fetching via Postgres `FOR UPDATE SKIP LOCKED`.
pub struct OutboxRepository;

impl OutboxRepository {
    /// Locks and fetches a batch of unpublished outbox events across active tenants.
    pub async fn fetch_unpublished_batch(
        tx: &mut Transaction<'_, Postgres>,
        batch_size: i64,
        max_retries: i32,
    ) -> Result<Vec<OutboxEventRecord>, PlatformError> {
        let records = sqlx::query_as::<_, OutboxEventRecord>(
            r#"
            SELECT 
                id,
                tenant_id,
                business_unit_id,
                event_type,
                aggregate_type,
                aggregate_id,
                COALESCE(entity_type, aggregate_type) as entity_type,
                COALESCE(entity_id, aggregate_id) as entity_id,
                COALESCE(source_system, 'platform_core') as source_system,
                COALESCE(occurred_at, created_at) as occurred_at,
                COALESCE(schema_version, '1.0.0') as schema_version,
                COALESCE(correlation_id, gen_random_uuid()) as correlation_id,
                causation_id,
                payload,
                metadata,
                COALESCE(retry_count, 0) as retry_count,
                last_error,
                created_at,
                published_at
            FROM outbox_events
            WHERE published_at IS NULL AND retry_count < $1
            ORDER BY created_at ASC
            LIMIT $2
            FOR UPDATE SKIP LOCKED
            "#
        )
        .bind(max_retries)
        .bind(batch_size)
        .fetch_all(&mut **tx)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to query outbox events: {}", e)))?;

        Ok(records)
    }

    /// Marks an event as successfully published.
    pub async fn mark_as_published(
        tx: &mut Transaction<'_, Postgres>,
        event_id: Uuid,
    ) -> Result<(), PlatformError> {
        sqlx::query(
            r#"
            UPDATE outbox_events
            SET published_at = NOW(),
                last_error = NULL
            WHERE id = $1
            "#
        )
        .bind(event_id)
        .execute(&mut **tx)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to mark outbox event as published: {}", e)))?;

        Ok(())
    }

    /// Increments retry count and stores last error message for an outbox event.
    pub async fn record_failure(
        tx: &mut Transaction<'_, Postgres>,
        event_id: Uuid,
        error_msg: &str,
    ) -> Result<(), PlatformError> {
        sqlx::query(
            r#"
            UPDATE outbox_events
            SET retry_count = retry_count + 1,
                last_error = $2
            WHERE id = $1
            "#
        )
        .bind(event_id)
        .bind(error_msg)
        .execute(&mut **tx)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to record outbox event failure: {}", e)))?;

        Ok(())
    }
}

/// Background Outbox Processor running atomic batch publishing.
pub struct OutboxProcessor<P: EventPublisher> {
    publisher: P,
    batch_size: i64,
    max_retries: i32,
}

impl<P: EventPublisher> OutboxProcessor<P> {
    pub fn new(publisher: P, batch_size: i64, max_retries: i32) -> Self {
        Self {
            publisher,
            batch_size,
            max_retries,
        }
    }

    /// Processes a single batch of unpublished outbox events within a transaction.
    pub async fn process_next_batch(
        &self,
        pool: &sqlx::PgPool,
    ) -> Result<usize, PlatformError> {
        let mut tx = pool
            .begin()
            .await
            .map_err(|e| PlatformError::DatabaseError(e.to_string()))?;

        let batch = OutboxRepository::fetch_unpublished_batch(&mut tx, self.batch_size, self.max_retries).await?;

        if batch.is_empty() {
            tx.rollback().await.map_err(|e| PlatformError::DatabaseError(e.to_string()))?;
            return Ok(0);
        }

        let count = batch.len();
        let envelopes: Vec<EventEnvelopeRaw> = batch.iter().map(|r| r.to_envelope_raw()).collect();

        // Attempt publishing batch to broker/pubsub
        match self.publisher.publish_batch(&envelopes).await {
            Ok(_) => {
                for record in &batch {
                    OutboxRepository::mark_as_published(&mut tx, record.id).await?;
                }
                tx.commit().await.map_err(|e| PlatformError::DatabaseError(e.to_string()))?;
                info!("Successfully published and marked {} outbox events", count);
                Ok(count)
            }
            Err(err) => {
                warn!("Failed to publish outbox batch: {}. Recording failure per event.", err);
                for record in &batch {
                    OutboxRepository::record_failure(&mut tx, record.id, &err.to_string()).await?;
                }
                tx.commit().await.map_err(|e| PlatformError::DatabaseError(e.to_string()))?;
                Err(err)
            }
        }
    }
}
