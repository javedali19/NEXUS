-- ============================================================================
-- Migration 0008: Event Architecture, Outbox Engine, and Idempotency Ledger
-- ============================================================================

-- 1. Extend and align outbox_events with canonical Event Envelope
ALTER TABLE outbox_events 
    ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100) DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS entity_id UUID NULL,
    ADD COLUMN IF NOT EXISTS source_system VARCHAR(100) DEFAULT 'platform_core',
    ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS schema_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    ADD COLUMN IF NOT EXISTS correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS causation_id UUID NULL,
    ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_error TEXT NULL;

-- Backfill entity_type / entity_id from aggregate_type / aggregate_id where needed
UPDATE outbox_events 
SET entity_type = aggregate_type, entity_id = aggregate_id 
WHERE entity_type = 'unknown' AND aggregate_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_correlation ON outbox_events(organization_id, correlation_id);
CREATE INDEX IF NOT EXISTS idx_outbox_entity ON outbox_events(organization_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_outbox_retry ON outbox_events(published_at, retry_count) WHERE published_at IS NULL;

-- 2. Idempotency Keys (API & Mutation Protection)
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(255) NOT NULL,
    request_hash VARCHAR(255) NOT NULL,
    response_status INT NULL,
    response_body JSONB NULL,
    locked_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_idempotency_key_org UNIQUE (organization_id, idempotency_key)
);

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_idempotency_keys ON idempotency_keys
    FOR ALL
    USING (organization_id = current_tenant_id())
    WITH CHECK (organization_id = current_tenant_id());

CREATE INDEX IF NOT EXISTS idx_idempotency_org_key ON idempotency_keys(organization_id, idempotency_key);

-- 3. Processed Events (Consumer Deduplication Ledger)
CREATE TABLE IF NOT EXISTS processed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    consumer_name VARCHAR(100) NOT NULL,
    event_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_processed_consumer_event UNIQUE (organization_id, consumer_name, event_id)
);

ALTER TABLE processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_events FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_processed_events ON processed_events
    FOR ALL
    USING (organization_id = current_tenant_id())
    WITH CHECK (organization_id = current_tenant_id());

CREATE INDEX IF NOT EXISTS idx_processed_events_consumer ON processed_events(organization_id, consumer_name, event_id);
