-- ============================================================================
-- Migration 0023: Autonomous Collections Workflow
-- 13-stage autonomous debt recovery orchestrator:
-- Invoice Overdue -> Policy Evaluation -> Consent Check -> Customer Lookup ->
-- WhatsApp Reminder -> Payment Link -> Customer Response -> Payment Webhook ->
-- Workflow Cancellation -> Accounting Sync -> Timeline -> Analytics -> Audit
-- ============================================================================

-- 1. Autonomous Collections Run Master Table
CREATE TABLE IF NOT EXISTS autonomous_collections_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    current_stage VARCHAR(32) NOT NULL DEFAULT 'invoice_overdue',
    run_status VARCHAR(32) NOT NULL DEFAULT 'running'
        CHECK (run_status IN ('running', 'completed', 'cancelled_on_payment', 'failed', 'hold_dispute')),
    correlation_id VARCHAR(128) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    payment_reference VARCHAR(128),
    cancellation_reason VARCHAR(64),
    provider_gating_status JSONB NOT NULL DEFAULT '{
        "whatsapp_live": false,
        "payment_provider_live": false,
        "accounting_live": false,
        "is_dry_run_simulation": true
    }'::jsonb,
    stages_completed INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_auton_col_run_idem UNIQUE (organization_id, idempotency_key)
);

-- 2. Stage Execution Telemetry Logs (13-Stage Audit Trail)
CREATE TABLE IF NOT EXISTS autonomous_collections_stage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    run_id UUID NOT NULL REFERENCES autonomous_collections_runs(id) ON DELETE CASCADE,
    stage_index INT NOT NULL,
    stage_name VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'completed'
        CHECK (status IN ('completed', 'cancelled', 'suppressed', 'failed', 'waiting')),
    duration_ms INT NOT NULL DEFAULT 0,
    input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    provider_response_code INT,
    provider_raw_message TEXT,
    cryptographic_sha256_hash VARCHAR(64) NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast lookup and dashboard streaming
CREATE INDEX IF NOT EXISTS idx_auton_col_runs_org_status ON autonomous_collections_runs(organization_id, run_status);
CREATE INDEX IF NOT EXISTS idx_auton_col_runs_invoice ON autonomous_collections_runs(organization_id, invoice_id);
CREATE INDEX IF NOT EXISTS idx_auton_col_stage_logs_run ON autonomous_collections_stage_logs(run_id, stage_index ASC);

-- 4. Row Level Security Policies
ALTER TABLE autonomous_collections_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomous_collections_stage_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'autonomous_collections_runs' AND policyname = 'auton_col_runs_tenant_isolation'
    ) THEN
        CREATE POLICY auton_col_runs_tenant_isolation ON autonomous_collections_runs
            FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'autonomous_collections_stage_logs' AND policyname = 'auton_col_logs_tenant_isolation'
    ) THEN
        CREATE POLICY auton_col_logs_tenant_isolation ON autonomous_collections_stage_logs
            FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;
END $$;
