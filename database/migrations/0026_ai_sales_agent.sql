-- ============================================================================
-- Migration 0026: AI Sales Agent & Commercial Qualification Engine
-- ============================================================================

-- 1. AI Sales Agent Configuration & Provider Gating
CREATE TABLE IF NOT EXISTS ai_sales_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_name VARCHAR(150) NOT NULL DEFAULT 'Nexus AI Commercial Sales Agent',
    provider VARCHAR(50) NOT NULL DEFAULT 'openai', -- openai, gemini, anthropic
    model_name VARCHAR(100) NOT NULL DEFAULT 'gpt-4o',
    temperature NUMERIC(3,2) NOT NULL DEFAULT 0.2,
    system_persona TEXT NOT NULL,
    -- Qualification & BANT Criteria
    min_intent_score_mql INT NOT NULL DEFAULT 50,
    min_intent_score_sql INT NOT NULL DEFAULT 75,
    max_autonomous_discount_pct NUMERIC(5,2) NOT NULL DEFAULT 15.0,
    max_autonomous_quote_amount NUMERIC(12,2) NOT NULL DEFAULT 50000.0,
    -- External Provider Connection Gating
    -- Invariant: Agent must remain DISABLED until connection_status = 'validated'
    connection_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured', -- unconfigured, validation_failed, validated
    last_validated_at TIMESTAMPTZ NULL,
    validation_error TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ai_sales_config_org UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_sales_configs_status 
    ON ai_sales_configs(organization_id, connection_status, is_active);

-- 2. AI Sales Leads & BANT Scorecards
CREATE TABLE IF NOT EXISTS ai_sales_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(200) NOT NULL,
    contact_phone VARCHAR(50) NULL,
    source_channel VARCHAR(50) NOT NULL DEFAULT 'inbound_web', -- inbound_web, whatsapp, voice_callback
    -- BANT Qualification Dimensions
    budget_range VARCHAR(100) NULL,
    budget_confirmed BOOLEAN NOT NULL DEFAULT false,
    authority_role VARCHAR(100) NULL, -- c_level, vp_director, team_lead, evaluator
    need_description TEXT NULL,
    timeline_expectation VARCHAR(100) NULL, -- immediate, within_30_days, within_90_days, exploratory
    -- Scoring & Status
    intent_score INT NOT NULL DEFAULT 0, -- 0 to 100
    qualification_status VARCHAR(50) NOT NULL DEFAULT 'evaluating', -- unqualified, evaluating, marketing_qualified, sales_qualified, disqualified
    assigned_ae_id UUID NULL,
    assigned_ae_name VARCHAR(150) NULL,
    active_quote_id VARCHAR(100) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_sales_leads_org_status 
    ON ai_sales_leads(organization_id, qualification_status, intent_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_sales_leads_customer 
    ON ai_sales_leads(organization_id, customer_id);

-- 3. AI Sales Multi-Turn Conversations
CREATE TABLE IF NOT EXISTS ai_sales_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES ai_sales_leads(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'web_chat',
    detected_sentiment VARCHAR(50) NOT NULL DEFAULT 'neutral', -- positive, neutral, cautious, frustrated
    objections_raised JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["pricing", "timeline", "compliance"]
    buying_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    handoff_status VARCHAR(50) NOT NULL DEFAULT 'autonomous', -- autonomous, handoff_requested, transferred_to_human
    turns_count INT NOT NULL DEFAULT 0,
    last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_sales_conversations_lead 
    ON ai_sales_conversations(organization_id, lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_sales_conversations_handoff 
    ON ai_sales_conversations(organization_id, handoff_status);

-- 4. Human Handoff Escalation Packets
CREATE TABLE IF NOT EXISTS ai_sales_handoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES ai_sales_leads(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES ai_sales_conversations(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL, -- explicit_user_request, high_intent_threshold, complex_custom_deal, frustration_risk
    priority VARCHAR(50) NOT NULL DEFAULT 'high', -- standard, high, urgent
    context_summary TEXT NOT NULL,
    bant_summary JSONB NOT NULL,
    recommended_ae_strategy TEXT NOT NULL,
    assigned_rep_name VARCHAR(150) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, completed
    acknowledged_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_sales_handoffs_status 
    ON ai_sales_handoffs(organization_id, status, priority);

-- 5. Row-Level Security Policies
ALTER TABLE ai_sales_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sales_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sales_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_sales_configs_tenant_isolation ON ai_sales_configs
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_sales_leads_tenant_isolation ON ai_sales_leads
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_sales_conversations_tenant_isolation ON ai_sales_conversations
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_sales_handoffs_tenant_isolation ON ai_sales_handoffs
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
