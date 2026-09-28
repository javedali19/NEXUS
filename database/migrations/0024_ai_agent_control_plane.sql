-- ============================================================================
-- Migration 0024: AI Agent Control Plane
-- Unified governance, semantic versioning, typed tool sandboxing,
-- policy guardrails, execution runs, human-in-the-loop approvals,
-- failure diagnostics, and tamper-evident audit ledger.
-- ARCHITECTURAL GUARANTEE: Agents never have unrestricted database access.
-- ============================================================================

-- 1. AI Agents Master Registry
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(64) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'copilot', -- collections_copilot, lead_qualifier, invoice_auditor, support_bot, dispatch_optimizer
    description TEXT,
    system_instructions TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'draft', 'paused', 'deprecated')),
    current_version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_ai_agent_slug UNIQUE (organization_id, slug)
);

-- 2. Semantic Agent Versions & Prompt Snapshots
CREATE TABLE IF NOT EXISTS ai_agent_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    version_number VARCHAR(32) NOT NULL, -- v1.0.0, v1.1.0
    environment VARCHAR(32) NOT NULL DEFAULT 'production'
        CHECK (environment IN ('production', 'staging', 'development', 'archived')),
    model_provider VARCHAR(64) NOT NULL DEFAULT 'openai', -- openai, anthropic, google_gemini
    model_name VARCHAR(64) NOT NULL DEFAULT 'gpt-4o',
    temperature NUMERIC(3, 2) NOT NULL DEFAULT 0.20,
    max_tokens INT NOT NULL DEFAULT 2048,
    prompt_snapshot TEXT NOT NULL,
    changelog TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_agent_version UNIQUE (agent_id, version_number)
);

-- 3. Agent Capabilities (High-level permission scopes)
CREATE TABLE IF NOT EXISTS ai_agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    capability_name VARCHAR(64) NOT NULL, -- invoices:read, payments:generate_link, whatsapp:send_notice, crm:read_contacts
    description TEXT,
    is_granted BOOLEAN NOT NULL DEFAULT true,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_agent_capability UNIQUE (agent_id, capability_name)
);

-- 4. Typed Tools Registry (Zero direct SQL - JSON-schema mediated only)
CREATE TABLE IF NOT EXISTS ai_agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    tool_name VARCHAR(64) NOT NULL, -- lookup_invoice, generate_payment_link, send_whatsapp_template, create_crm_task
    tool_type VARCHAR(32) NOT NULL DEFAULT 'read_only'
        CHECK (tool_type IN ('read_only', 'idempotent_write', 'sensitive_mutation')),
    description TEXT NOT NULL,
    parameters_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_approval_required BOOLEAN NOT NULL DEFAULT false,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_agent_tool UNIQUE (agent_id, tool_name)
);

-- 5. Granular Permissions & Constraints
CREATE TABLE IF NOT EXISTS ai_agent_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    resource_type VARCHAR(64) NOT NULL, -- invoice, customer, payment_link, communication
    access_level VARCHAR(32) NOT NULL DEFAULT 'read'
        CHECK (access_level IN ('read', 'write', 'execute')),
    constraints JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"max_discount_pct": 15, "max_amount": 10000}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Policy Guardrails & Safety Governance
CREATE TABLE IF NOT EXISTS ai_agent_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    policy_name VARCHAR(128) NOT NULL,
    policy_type VARCHAR(64) NOT NULL, -- rate_limit, budget_cap, pii_masking, approval_threshold, banned_topics
    rules JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"max_actions_per_hour": 50, "require_approval_if_amount_over": 500}
    is_enforced BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Master Execution Runs
CREATE TABLE IF NOT EXISTS ai_agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    version_id UUID REFERENCES ai_agent_versions(id) ON DELETE SET NULL,
    correlation_id VARCHAR(128) NOT NULL,
    trigger_source VARCHAR(64) NOT NULL DEFAULT 'workflow_autonomous', -- workflow_autonomous, user_chat, scheduled_cron, api_call
    status VARCHAR(32) NOT NULL DEFAULT 'running'
        CHECK (status IN ('queued', 'running', 'awaiting_approval', 'completed', 'failed', 'cancelled')),
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
    duration_ms INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT uk_agent_run_corr UNIQUE (organization_id, correlation_id)
);

-- 8. Executed or Proposed Agent Actions
CREATE TABLE IF NOT EXISTS ai_agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    run_id UUID NOT NULL REFERENCES ai_agent_runs(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES ai_agent_tools(id) ON DELETE SET NULL,
    tool_name VARCHAR(64) NOT NULL,
    arguments JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'proposed'
        CHECK (status IN ('proposed', 'approved', 'rejected', 'executed', 'failed')),
    execution_order INT NOT NULL DEFAULT 1,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    duration_ms INT NOT NULL DEFAULT 0,
    executed_at TIMESTAMPTZ
);

-- 9. Action Execution Results (Scrubbed Outputs)
CREATE TABLE IF NOT EXISTS ai_agent_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    action_id UUID NOT NULL REFERENCES ai_agent_actions(id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES ai_agent_runs(id) ON DELETE CASCADE,
    result_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Human-in-the-Loop Approvals Queue
CREATE TABLE IF NOT EXISTS ai_agent_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    action_id UUID NOT NULL REFERENCES ai_agent_actions(id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES ai_agent_runs(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    requested_action VARCHAR(64) NOT NULL,
    risk_level VARCHAR(16) NOT NULL DEFAULT 'medium'
        CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
    proposed_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    approver_user_id UUID,
    approver_name VARCHAR(255),
    decision_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Failure Taxonomy & Root Cause Ledger
CREATE TABLE IF NOT EXISTS ai_agent_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    run_id UUID NOT NULL REFERENCES ai_agent_runs(id) ON DELETE CASCADE,
    action_id UUID REFERENCES ai_agent_actions(id) ON DELETE SET NULL,
    failure_category VARCHAR(64) NOT NULL, -- tool_timeout, schema_validation, policy_blocked, rate_limit_exceeded, model_error, permission_denied
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    remediation_hint TEXT,
    is_retryable BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Cryptographic Append-Only Audit Trail
CREATE TABLE IF NOT EXISTS ai_agent_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    run_id UUID REFERENCES ai_agent_runs(id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL, -- agent_created, version_promoted, tool_invoked, policy_violation, approval_granted, action_rejected
    actor_type VARCHAR(32) NOT NULL DEFAULT 'agent', -- agent, user, system, policy_engine
    actor_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    payload_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    cryptographic_sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. High-Throughput Indexes
CREATE INDEX IF NOT EXISTS idx_ai_agents_org_role ON ai_agents(organization_id, role, status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_versions_agent ON ai_agent_versions(agent_id, environment);
CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_status ON ai_agent_runs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_approvals_status ON ai_agent_approvals(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_audit_created ON ai_agent_audit_logs(organization_id, created_at DESC);

-- 14. Row-Level Security Policies
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_agents' AND policyname = 'ai_agents_tenant_isolation') THEN
        CREATE POLICY ai_agents_tenant_isolation ON ai_agents FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_agent_runs' AND policyname = 'ai_runs_tenant_isolation') THEN
        CREATE POLICY ai_runs_tenant_isolation ON ai_agent_runs FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_agent_approvals' AND policyname = 'ai_approvals_tenant_isolation') THEN
        CREATE POLICY ai_approvals_tenant_isolation ON ai_agent_approvals FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_agent_audit_logs' AND policyname = 'ai_audit_tenant_isolation') THEN
        CREATE POLICY ai_audit_tenant_isolation ON ai_agent_audit_logs FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;
END $$;
