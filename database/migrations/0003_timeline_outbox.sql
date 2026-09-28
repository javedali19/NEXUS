-- ============================================================================
-- Migration 0003: Unified Customer Timeline & Transactional Outbox Engine
-- ============================================================================

-- 1. Unified Customer Timeline Entries
-- Centralized event stream containing CRM, ERP, and AI Comms touchpoints
CREATE TABLE IF NOT EXISTS timeline_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    source_module VARCHAR(50) NOT NULL, -- 'crm', 'erp', 'ai_comms', 'workflow', 'system'
    entry_type VARCHAR(100) NOT NULL,   -- 'invoice_paid', 'call_recorded', 'email_sent', 'lead_converted'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_timeline ON timeline_entries
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE INDEX idx_timeline_customer ON timeline_entries (tenant_id, customer_id, created_at DESC);

-- 2. Transactional Outbox Events Table
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ NULL
);

ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_outbox ON outbox_events
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE INDEX idx_outbox_unpub ON outbox_events (published_at) WHERE published_at IS NULL;
