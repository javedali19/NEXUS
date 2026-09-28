-- ============================================================================
-- Migration: 0032_executive_command_center.sql
-- Description: Multi-tenant Executive Command Center KPI snapshots & operational alerts
-- ============================================================================

-- 1. Executive KPI Snapshots table (storing real-time aggregated metrics across all 14 dimensions)
CREATE TABLE IF NOT EXISTS executive_kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    timeframe VARCHAR(20) NOT NULL DEFAULT '30d', -- '24h', '7d', '30d', 'qtd', 'ytd'
    snapshot_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- 1. Revenue
    total_invoiced_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    recognized_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    pending_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    revenue_mom_growth_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    revenue_trend_sparkline JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- 2. Collections
    total_collections_recovered NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    autonomous_collections_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    manual_collections_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    collections_recovery_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    promise_to_pay_fulfillment_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- 3. Outstanding Receivables
    total_accounts_receivable NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    days_sales_outstanding NUMERIC(5, 1) NOT NULL DEFAULT 0.0,
    ar_aging_current_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ar_aging_31_60_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ar_aging_61_90_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ar_aging_90_plus_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- 4. Overdue Invoices
    overdue_invoices_count INT NOT NULL DEFAULT 0,
    overdue_amount_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    high_risk_overdue_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    active_disputes_count INT NOT NULL DEFAULT 0,

    -- 5. Payment Conversion
    payment_link_conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    avg_payment_clearance_hours NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    wire_clearance_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    auto_retry_success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- 6. Pipeline
    active_pipeline_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    pipeline_stage_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    blended_win_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- 7. Leads
    in_flight_leads_count INT NOT NULL DEFAULT 0,
    ai_qualified_leads_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    inbound_leads_today INT NOT NULL DEFAULT 0,
    lead_to_opp_velocity_days NUMERIC(4, 1) NOT NULL DEFAULT 0.0,

    -- 8. Customer Activity
    active_unified_accounts INT NOT NULL DEFAULT 0,
    monthly_active_customers INT NOT NULL DEFAULT 0,
    customer_health_healthy_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    customer_health_at_risk_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    customer_health_churn_threat_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    avg_engagement_score NUMERIC(3, 1) NOT NULL DEFAULT 0.0,

    -- 9. WhatsApp Performance
    whatsapp_dispatched_count INT NOT NULL DEFAULT 0,
    whatsapp_delivery_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    whatsapp_read_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    whatsapp_customer_reply_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    whatsapp_autonomous_handling_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- 10. Call Performance
    total_telephony_calls INT NOT NULL DEFAULT 0,
    autonomous_call_completion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    avg_call_duration_seconds INT NOT NULL DEFAULT 0,
    sentiment_index_score NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    supervisor_transfer_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- 11. Workflow Health
    total_workflow_runs INT NOT NULL DEFAULT 0,
    workflow_success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    workflow_failed_runs_count INT NOT NULL DEFAULT 0,
    pending_approval_gates_count INT NOT NULL DEFAULT 0,

    -- 12. AI Activity
    ai_tool_invocations_count INT NOT NULL DEFAULT 0,
    ai_safe_gateway_pass_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    ai_direct_db_violations_count INT NOT NULL DEFAULT 0,
    avg_ai_latency_ms INT NOT NULL DEFAULT 0,
    autonomous_action_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    -- 13. Exceptions
    open_exceptions_count INT NOT NULL DEFAULT 0,
    exceptions_by_domain JSONB NOT NULL DEFAULT '{}'::jsonb,
    exceptions_auto_remediated_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Executive Operational Alerts table
CREATE TABLE IF NOT EXISTS executive_operational_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'critical', 'warning', 'info'
    domain VARCHAR(50) NOT NULL,   -- 'financials', 'collections', 'telephony', 'whatsapp', 'workflows', 'ai_gateway', 'governance'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
    action_label VARCHAR(100) NOT NULL,
    action_href VARCHAR(255) NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ NULL,
    acknowledged_by VARCHAR(100) NULL,
    resolved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_org_time
ON executive_kpi_snapshots(organization_id, timeframe, snapshot_time DESC);

CREATE INDEX IF NOT EXISTS idx_operational_alerts_org_status
ON executive_operational_alerts(organization_id, status, severity, occurred_at DESC);

-- Enable Row-Level Security
ALTER TABLE executive_kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_operational_alerts ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY kpi_snapshots_tenant_isolation ON executive_kpi_snapshots
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY operational_alerts_tenant_isolation ON executive_operational_alerts
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);
