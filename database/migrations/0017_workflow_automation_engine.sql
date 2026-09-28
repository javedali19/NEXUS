-- ============================================================================
-- Migration 0017: Enterprise Workflow Automation Engine
-- Event triggers, conditions, branches, actions, delays, retries, idempotency,
-- failure exceptions, and step-level execution history
-- ============================================================================

-- 1. Workflow Definitions Table (DAG Pipeline Models)
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    business_unit_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(64) NOT NULL, -- invoice.created, invoice.overdue, payment.received, lead.created, message.received, call.completed, document.ocr_completed, customer.updated
    trigger_filter JSONB DEFAULT '{}'::jsonb, -- e.g. { "amount": { "gt": 10000 }, "channel": "whatsapp" }
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb, -- DAG Graph of Nodes: Trigger, Condition, Action, Delay, Branch
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INT NOT NULL DEFAULT 1,
    required_permission VARCHAR(64) DEFAULT 'workflow.execute',
    retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff_multiplier": 2, "initial_delay_seconds": 30}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Workflow Executions & Step Traces
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    workflow_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(255) NOT NULL, -- {org_id}:{workflow_id}:{trigger_event_id}
    trigger_event_id VARCHAR(128) NOT NULL,
    trigger_event_type VARCHAR(64) NOT NULL,
    trigger_payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'running', -- pending, running, waiting_delay, completed, failed, retrying, cancelled
    current_node_id VARCHAR(64),
    step_results JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { node_id, node_type, action_name, status, input, output, duration_ms, error }
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    correlation_id VARCHAR(128),
    causation_id VARCHAR(128),
    CONSTRAINT uk_workflow_idempotency UNIQUE (organization_id, idempotency_key)
);

-- 3. Workflow Audit Logs (Append-Only)
CREATE TABLE IF NOT EXISTS workflow_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    workflow_id UUID REFERENCES workflow_definitions(id) ON DELETE SET NULL,
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE SET NULL,
    actor_id UUID,
    actor_name VARCHAR(255),
    action VARCHAR(64) NOT NULL, -- created, modified, activated, paused, replayed, override_step
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast trigger evaluation and execution trace lookup
CREATE INDEX IF NOT EXISTS idx_workflow_def_org_trigger ON workflow_definitions(organization_id, trigger_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workflow_exec_org_status ON workflow_executions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_workflow ON workflow_executions(workflow_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_idempotency ON workflow_executions(idempotency_key);

-- Enable Row-Level Security (RLS)
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY workflow_definitions_tenant_isolation ON workflow_definitions
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY workflow_executions_tenant_isolation ON workflow_executions
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY workflow_audit_tenant_isolation ON workflow_audit_logs
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
