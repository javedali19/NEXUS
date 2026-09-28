-- ============================================================================
-- Migration 0038: Complete End-to-End Sales Lifecycle Flow Orchestrator
-- Unifies Lead -> Contact/Company -> Deal -> Quote -> Invoice -> Payment Link -> Payment -> Timeline -> Analytics
-- ============================================================================

-- 1. Sales Flow Master Instances
CREATE TABLE IF NOT EXISTS sales_flow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    
    flow_number VARCHAR(64) NOT NULL, -- e.g. SF-2026-0001
    current_stage VARCHAR(32) NOT NULL DEFAULT 'lead' CHECK (
        current_stage IN (
            'lead', 
            'contact_company', 
            'deal', 
            'quote', 
            'invoice', 
            'payment_link', 
            'payment', 
            'customer_timeline', 
            'analytics_completed'
        )
    ),
    
    -- Linked Entity References across the Platform
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    payment_link_id UUID REFERENCES payment_links(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    
    -- Financials & Attribution
    total_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    actor_type VARCHAR(20) NOT NULL DEFAULT 'human' CHECK (actor_type IN ('human', 'ai_agent', 'hybrid')),
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_ai_agent_id UUID,
    
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress' CHECK (
        status IN ('in_progress', 'completed', 'blocked', 'cancelled')
    ),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_sales_flow_org_number UNIQUE (organization_id, flow_number)
);

CREATE INDEX IF NOT EXISTS idx_sales_flow_org_stage ON sales_flow_instances(organization_id, current_stage);
CREATE INDEX IF NOT EXISTS idx_sales_flow_customer ON sales_flow_instances(organization_id, customer_id);

-- 2. Stage Transition Log (Immutable Progression Ledger)
CREATE TABLE IF NOT EXISTS sales_flow_stage_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    flow_instance_id UUID NOT NULL REFERENCES sales_flow_instances(id) ON DELETE CASCADE,
    
    from_stage VARCHAR(32) NOT NULL,
    to_stage VARCHAR(32) NOT NULL,
    actor_type VARCHAR(20) NOT NULL DEFAULT 'human',
    actor_id UUID,
    actor_name VARCHAR(150) NOT NULL DEFAULT 'System Operator',
    
    action_name VARCHAR(100) NOT NULL,
    input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    timeline_event_id UUID REFERENCES customer_timeline_events(id) ON DELETE SET NULL,
    
    duration_ms INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked_guardrail')),
    error_message TEXT,
    
    transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_flow_transitions_instance ON sales_flow_stage_transitions(flow_instance_id, transitioned_at DESC);

-- ============================================================================
-- Row-Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE sales_flow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_flow_instances FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_sales_flow_instances ON sales_flow_instances
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

ALTER TABLE sales_flow_stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_flow_stage_transitions FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_sales_flow_transitions ON sales_flow_stage_transitions
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
