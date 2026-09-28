-- ============================================================================
-- Migration 0030: Call Center Extensions & Telephony Audit Trail
-- ============================================================================

-- 1. Extend telephony_calls with operational Call Center fields
ALTER TABLE telephony_calls 
    ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en-US',
    ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    ADD COLUMN IF NOT EXISTS agent_persona VARCHAR(100) NOT NULL DEFAULT 'Rachel (AI Solutions Advisor)',
    ADD COLUMN IF NOT EXISTS intent VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS promise_to_pay JSONB NULL,
    ADD COLUMN IF NOT EXISTS follow_up JSONB NULL;

CREATE INDEX IF NOT EXISTS idx_telephony_calls_priority 
    ON telephony_calls(organization_id, priority, status);

CREATE INDEX IF NOT EXISTS idx_telephony_calls_scheduled 
    ON telephony_calls(organization_id, scheduled_time) 
    WHERE scheduled_time IS NOT NULL;

-- 2. Append-Only Call Center Audit Events Ledger
CREATE TABLE IF NOT EXISTS telephony_call_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES telephony_calls(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- call_queued, consent_disclosed, stt_initialized, promise_to_pay_logged, warm_transfer_initiated, call_completed
    actor_type VARCHAR(50) NOT NULL, -- system, ai_agent, supervisor, customer
    actor_name VARCHAR(150) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telephony_call_audit_events 
    ON telephony_call_audit_events(organization_id, call_id, occurred_at ASC);

-- 3. Row-Level Security for Call Audit Events
ALTER TABLE telephony_call_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY telephony_call_audit_tenant_isolation ON telephony_call_audit_events
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
