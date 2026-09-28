-- ============================================================================
-- Migration 0027: AI WhatsApp Sales/Support Agent & Triple-Gate Engine
-- ============================================================================

-- 1. AI WhatsApp Agent Configuration & Triple-Gate Invariant
CREATE TABLE IF NOT EXISTS ai_whatsapp_agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_name VARCHAR(150) NOT NULL DEFAULT 'Nexus AI WhatsApp Commercial & Support Copilot',
    waba_id VARCHAR(100) NULL,
    phone_number_id VARCHAR(100) NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'openai', -- openai, gemini, anthropic
    model_name VARCHAR(100) NOT NULL DEFAULT 'gpt-4o',
    temperature NUMERIC(3,2) NOT NULL DEFAULT 0.2,
    -- Triple-Gating Status:
    -- Invariant: Autonomous messaging is enabled ONLY when all 3 gates pass.
    whatsapp_connection_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured', -- unconfigured, validated, failed
    ai_provider_connection_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured', -- unconfigured, validated, failed
    consent_enforced BOOLEAN NOT NULL DEFAULT true,
    is_autonomous_enabled BOOLEAN NOT NULL DEFAULT false,
    last_gating_check_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ai_whatsapp_agent_config UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_whatsapp_configs_status 
    ON ai_whatsapp_agent_configs(organization_id, is_autonomous_enabled);

-- 2. AI WhatsApp Active Sessions & 24h Customer Care Windows
CREATE TABLE IF NOT EXISTS ai_whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL, -- E.164 formatted
    customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
    lead_id UUID NULL REFERENCES ai_sales_leads(id) ON DELETE SET NULL,
    thread_id UUID NULL REFERENCES omnichannel_threads(id) ON DELETE SET NULL,
    current_intent VARCHAR(50) NOT NULL DEFAULT 'general_inquiry', -- sales_inquiry, support_case, billing_payment, human_escalation
    consent_verified BOOLEAN NOT NULL DEFAULT false,
    dnc_flagged BOOLEAN NOT NULL DEFAULT false,
    window_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    active_quote_id VARCHAR(100) NULL,
    active_payment_link_id VARCHAR(100) NULL,
    active_case_id VARCHAR(100) NULL,
    messages_count INT NOT NULL DEFAULT 0,
    last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ai_whatsapp_session UNIQUE(organization_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_ai_whatsapp_sessions_phone 
    ON ai_whatsapp_sessions(organization_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_ai_whatsapp_sessions_customer 
    ON ai_whatsapp_sessions(organization_id, customer_id);

-- 3. AI WhatsApp Support Cases & Ticket Tracking
CREATE TABLE IF NOT EXISTS ai_whatsapp_support_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
    phone_number VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL, -- billing_dispute, api_integration, service_outage, account_access
    severity VARCHAR(50) NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- open, investigating, waiting_customer, resolved
    summary TEXT NOT NULL,
    resolution_notes TEXT NULL,
    sla_target_at TIMESTAMPTZ NOT NULL,
    assigned_rep_name VARCHAR(150) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_whatsapp_support_cases_status 
    ON ai_whatsapp_support_cases(organization_id, status, severity);

-- 4. AI WhatsApp Flow Audit Logs (Cryptographic Tamper-Evident Ledger)
CREATE TABLE IF NOT EXISTS ai_whatsapp_flow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES ai_whatsapp_sessions(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    message_text TEXT NOT NULL,
    template_name VARCHAR(100) NULL,
    gate_status VARCHAR(50) NOT NULL, -- PASSED, BLOCKED_CONSENT, BLOCKED_WHATSAPP, BLOCKED_AI_PROVIDER
    tool_calls JSONB NOT NULL DEFAULT '[]'::jsonb,
    duration_ms INT NOT NULL DEFAULT 0,
    sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_whatsapp_flow_logs_session 
    ON ai_whatsapp_flow_logs(organization_id, session_id, created_at DESC);

-- 5. Row-Level Security Policies
ALTER TABLE ai_whatsapp_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_whatsapp_support_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_whatsapp_flow_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_whatsapp_configs_tenant_isolation ON ai_whatsapp_agent_configs
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_whatsapp_sessions_tenant_isolation ON ai_whatsapp_sessions
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_whatsapp_support_cases_tenant_isolation ON ai_whatsapp_support_cases
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_whatsapp_flow_logs_tenant_isolation ON ai_whatsapp_flow_logs
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
