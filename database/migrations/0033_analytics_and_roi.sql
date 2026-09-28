-- ============================================================================
-- Migration: 0033_analytics_and_roi.sql
-- Description: Analytics snapshots, multi-touch attribution, and AI agent ROI impact ledger
-- ============================================================================

-- 1. Analytics Snapshots table (storing daily/hourly aggregated metrics across all 16 dimensions)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    timeframe VARCHAR(20) NOT NULL DEFAULT '30d', -- '24h', '7d', '30d', 'qtd', 'ytd'
    snapshot_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Financial Analytics
    revenue_collected NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    revenue_influenced NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    outstanding_receivables NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    recovery_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    dso_days NUMERIC(5, 1) NOT NULL DEFAULT 0.0,
    aging_breakdown JSONB NOT NULL DEFAULT '{"current": 64.0, "days_31_60": 21.0, "days_61_90": 11.0, "days_90_plus": 4.0}'::jsonb,
    payment_link_conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    payment_link_funnel JSONB NOT NULL DEFAULT '{"dispatched": 420, "opened": 380, "clicked": 352, "paid": 329}'::jsonb,

    -- Omnichannel Communications Telemetry
    whatsapp_dispatched INT NOT NULL DEFAULT 0,
    whatsapp_delivered_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    whatsapp_read_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    whatsapp_reply_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    whatsapp_autonomous_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    call_sessions_total INT NOT NULL DEFAULT 0,
    call_connected_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    call_avg_handle_time_seconds INT NOT NULL DEFAULT 0,
    call_net_sentiment NUMERIC(4, 2) NOT NULL DEFAULT 0.00,

    promise_to_pay_total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    promise_to_pay_kept_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    promise_to_pay_fulfillment_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- Commercial Sales Funnel
    sales_funnel JSONB NOT NULL DEFAULT '{"leads": 142, "mql": 97, "sql": 64, "proposal": 32, "won": 18}'::jsonb,
    funnel_velocity_days NUMERIC(4, 1) NOT NULL DEFAULT 0.0,

    -- Multi-Touch Attribution Summary
    attribution_weights JSONB NOT NULL DEFAULT '{"whatsapp": 38.0, "voice_agent": 34.0, "portal_quote": 28.0}'::jsonb,

    -- AI Agent ROI & Savings
    agent_activity_total_runs INT NOT NULL DEFAULT 0,
    agent_assisted_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    agent_assisted_hours_saved INT NOT NULL DEFAULT 0,
    agent_assisted_net_savings NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    agent_compute_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    roi_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- Workflow Engine Health
    workflow_runs_total INT NOT NULL DEFAULT 0,
    workflow_success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    workflow_avg_step_latency_ms INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Multi-Touch Attribution Ledger
CREATE TABLE IF NOT EXISTS analytics_touchpoint_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'deal', 'collected_invoice'
    entity_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    total_attributed_amount NUMERIC(15, 2) NOT NULL,
    touchpoint_channel VARCHAR(50) NOT NULL, -- 'whatsapp', 'voice_agent', 'inbound_call', 'quote', 'support'
    touchpoint_timestamp TIMESTAMPTZ NOT NULL,
    first_touch_weight NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    last_touch_weight NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    linear_weight NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ai_multi_touch_weight NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AI Agent ROI Impact Ledger
CREATE TABLE IF NOT EXISTS roi_agent_impact_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    agent_persona VARCHAR(100) NOT NULL, -- 'Rachel (AI Sales)', 'Adam (AI Collections)', 'Nicole (AI Billing)', 'Support Copilot'
    action_type VARCHAR(50) NOT NULL,    -- 'deal_qualified', 'invoice_recovered', 'dispute_resolved', 'document_extracted'
    target_entity_id UUID NOT NULL,
    assisted_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    labor_minutes_saved INT NOT NULL DEFAULT 0,
    labor_cost_savings NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    token_compute_expense NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    net_financial_gain NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_org_time
ON analytics_snapshots(organization_id, timeframe, snapshot_time DESC);

CREATE INDEX IF NOT EXISTS idx_touchpoint_attributions_org_entity
ON analytics_touchpoint_attributions(organization_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_roi_agent_impact_org_persona
ON roi_agent_impact_ledger(organization_id, agent_persona, occurred_at DESC);

-- Enable Row-Level Security
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_touchpoint_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_agent_impact_ledger ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY analytics_snapshots_tenant_isolation ON analytics_snapshots
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY touchpoint_attributions_tenant_isolation ON analytics_touchpoint_attributions
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY roi_impact_ledger_tenant_isolation ON roi_agent_impact_ledger
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);
