-- ============================================================================
-- Migration 0022: Collections Policy Engine
-- Multi-criteria debt collection evaluation, regulatory compliance (DNC, TCPA, TRAI),
-- communication windows, promise-to-pay tracking, and action execution ledger
-- ============================================================================

-- 1. Collections Policy Definitions per Organization & Segment
CREATE TABLE IF NOT EXISTS collections_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    policy_name VARCHAR(128) NOT NULL,
    customer_segment VARCHAR(32) NOT NULL DEFAULT 'smb'
        CHECK (customer_segment IN ('enterprise_tier_1', 'mid_market', 'smb', 'high_risk')),
    min_dpd INT NOT NULL DEFAULT 0,
    max_dpd INT,
    min_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    max_amount NUMERIC(15, 2),
    target_action VARCHAR(32) NOT NULL
        CHECK (target_action IN ('whatsapp', 'payment_link', 'task', 'reminder', 'call', 'escalation', 'pause', 'exception')),
    cooldown_hours INT NOT NULL DEFAULT 48,
    priority INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Active Collections Cases (Debtors & Invoices in dunning)
CREATE TABLE IF NOT EXISTS collections_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    case_status VARCHAR(32) NOT NULL DEFAULT 'active'
        CHECK (case_status IN ('active', 'paused_ptp', 'disputed', 'escalated', 'settled', 'written_off')),
    total_overdue_amount NUMERIC(15, 2) NOT NULL,
    days_past_due INT NOT NULL DEFAULT 0,
    current_dunning_stage VARCHAR(32) NOT NULL DEFAULT 'early_reminder',
    last_action_type VARCHAR(32),
    last_contacted_at TIMESTAMPTZ,
    next_action_due TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_collections_case_invoice UNIQUE (organization_id, invoice_id)
);

-- 3. Promise-to-Pay (PTP) Commitments
CREATE TABLE IF NOT EXISTS collections_promises_to_pay (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    case_id UUID NOT NULL REFERENCES collections_cases(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    ptp_amount NUMERIC(15, 2) NOT NULL,
    promised_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'honored', 'broken', 'cancelled')),
    recorded_by UUID,
    actor_name VARCHAR(255) NOT NULL DEFAULT 'Collections Specialist',
    notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Collections Execution & Compliance Audit Ledger
CREATE TABLE IF NOT EXISTS collections_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    case_id UUID NOT NULL REFERENCES collections_cases(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    action_type VARCHAR(32) NOT NULL
        CHECK (action_type IN ('whatsapp', 'payment_link', 'task', 'reminder', 'call', 'escalation', 'pause', 'exception')),
    status VARCHAR(32) NOT NULL DEFAULT 'executed'
        CHECK (status IN ('executed', 'suppressed_dnc', 'suppressed_outside_window', 'suppressed_ptp_active', 'suppressed_cooldown', 'suppressed_no_consent', 'scheduled_window')),
    suppression_reason TEXT,
    recipient_phone VARCHAR(32),
    recipient_email VARCHAR(255),
    recipient_country VARCHAR(8) DEFAULT 'US',
    recipient_local_time VARCHAR(16),
    scheduled_for TIMESTAMPTZ,
    policy_id UUID REFERENCES collections_policies(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_collections_policies_org_segment ON collections_policies(organization_id, customer_segment, is_active);
CREATE INDEX IF NOT EXISTS idx_collections_cases_org_status ON collections_cases(organization_id, case_status);
CREATE INDEX IF NOT EXISTS idx_collections_ptp_case ON collections_promises_to_pay(case_id, status);
CREATE INDEX IF NOT EXISTS idx_collections_exec_case ON collections_executions(case_id, created_at DESC);

-- 6. Row Level Security Policies
ALTER TABLE collections_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_promises_to_pay ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_executions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'collections_policies' AND policyname = 'collections_policies_tenant_isolation'
    ) THEN
        CREATE POLICY collections_policies_tenant_isolation ON collections_policies
            FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'collections_cases' AND policyname = 'collections_cases_tenant_isolation'
    ) THEN
        CREATE POLICY collections_cases_tenant_isolation ON collections_cases
            FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'collections_promises_to_pay' AND policyname = 'collections_ptp_tenant_isolation'
    ) THEN
        CREATE POLICY collections_ptp_tenant_isolation ON collections_promises_to_pay
            FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'collections_executions' AND policyname = 'collections_exec_tenant_isolation'
    ) THEN
        CREATE POLICY collections_exec_tenant_isolation ON collections_executions
            FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;
END $$;
