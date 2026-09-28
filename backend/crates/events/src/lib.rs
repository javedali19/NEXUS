pub mod domain_events;
pub mod envelope;
pub mod idempotency;
pub mod outbox;
pub mod publisher;
pub mod versioning;

pub use domain_events::*;
pub use envelope::{CloudEventMessage, EventEnvelope, EventEnvelopeRaw, TraceContext};
pub use idempotency::{ConsumerDeduplicator, IdempotencyResult, IdempotencyService};
pub use outbox::{save_outbox_event_tx, OutboxEventRecord, OutboxProcessor, OutboxRepository};
pub use publisher::{CompositePublisher, EventPublisher, GcpPubSubPublisher, InMemoryEventPublisher};
pub use versioning::{EventUpcasterRegistry, SchemaVersion};

use platform_common::TenantContext;
use serde::Serialize;
use uuid::Uuid;

/// Transactional helper to create and stage a canonical event envelope in the outbox
pub fn create_event_envelope<T: Serialize>(
    context: &TenantContext,
    event_type: impl Into<String>,
    entity_type: impl Into<String>,
    entity_id: Uuid,
    source_system: impl Into<String>,
    schema_version: impl Into<String>,
    trace_context: Option<&TraceContext>,
    payload: T,
) -> EventEnvelope<T> {
    EventEnvelope::new(
        event_type,
        context.tenant_id,
        context.business_unit_id,
        entity_type,
        entity_id,
        source_system,
        schema_version,
        trace_context,
        payload,
    )
}
