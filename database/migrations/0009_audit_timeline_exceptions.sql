-- ============================================================================
-- Migration 0009: Platform-wide Audit, Timeline, and Exception Engine
-- ============================================================================

-- 1. Enhance audit_events table with source, correlation_id, outcome
ALTER TABLE audit_events
    ADD COLUMN IF NOT EXISTS source VARCHAR(100) NOT NULL DEFAULT 'web_ui',
    ADD COLUMN IF NOT EXISTS correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS outcome VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS entity_id UUID NULL;

-- Backfill entity_type / entity_id from resource_type / resource_id where needed
UPDATE audit_events
SET entity_type = resource_type, entity_id = resource_id
WHERE entity_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_events(organization_id, correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_outcome ON audit_events(organization_id, outcome);
CREATE INDEX IF NOT EXISTS idx_audit_source ON audit_events(organization_id, source);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(organization_id, entity_type, entity_id);

-- 2. Strict Append-Only Immutability Trigger on audit_events
-- Rejects all UPDATE and DELETE statements to ensure tamper-proof compliance
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'CANNOT UPDATE OR DELETE FROM AUDIT_EVENTS: Audit records are strictly immutable and append-only.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_events_immutable ON audit_events;
CREATE TRIGGER trg_audit_events_immutable
    BEFORE UPDATE OR DELETE ON audit_events
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_tampering();

-- 3. Enhance exceptions table for multi-domain exception management
ALTER TABLE exceptions
    ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'integration_failure',
    ADD COLUMN IF NOT EXISTS correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS entity_id UUID NULL,
    ADD COLUMN IF NOT EXISTS error_code VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS request_payload JSONB NULL,
    ADD COLUMN IF NOT EXISTS response_payload JSONB NULL,
    ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_retries INT NOT NULL DEFAULT 3,
    ADD COLUMN IF NOT EXISTS last_attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_exceptions_category ON exceptions(organization_id, category, status);
CREATE INDEX IF NOT EXISTS idx_exceptions_correlation ON exceptions(organization_id, correlation_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_severity ON exceptions(organization_id, severity);

-- 4. Universal Customer Timeline Events table
CREATE TABLE IF NOT EXISTS customer_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    source_module VARCHAR(100) NOT NULL, -- 'crm', 'erp', 'telephony', 'whatsapp', 'ocr', 'workflow', 'audit'
    event_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    entity_type VARCHAR(100) NULL,
    entity_id UUID NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL DEFAULT 'System',
    correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE customer_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_timeline_events FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_customer_timeline ON customer_timeline_events
    FOR ALL
    USING (organization_id = current_tenant_id())
    WITH CHECK (organization_id = current_tenant_id());

CREATE INDEX IF NOT EXISTS idx_timeline_customer_occurred ON customer_timeline_events(organization_id, customer_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_source_module ON customer_timeline_events(organization_id, source_module);
CREATE INDEX IF NOT EXISTS idx_timeline_correlation ON customer_timeline_events(organization_id, correlation_id);
