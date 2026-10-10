-- ============================================================================
-- Migration 0045: Ticket Raising Module (Connected to Support Cases, Voice Calls, Customer 360)
-- ============================================================================

-- 1. Support Tickets Table (Primary ticket raising entity)
-- Tickets are lightweight action items that link back into the full support case system
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ticket_number VARCHAR(100) NOT NULL UNIQUE,
    -- Core Ticket Fields
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ticket_type VARCHAR(100) NOT NULL DEFAULT 'general', -- general, billing, technical, feature_request, complaint, voice_call_followup, escalation
    priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- new, assigned, in_progress, pending_customer, on_hold, resolved, closed, cancelled
    -- Source Tracking (Omnichannel Origin)
    source_channel VARCHAR(50) NOT NULL DEFAULT 'portal', -- portal, voice_call, whatsapp, email, api, ai_agent
    source_reference_id VARCHAR(255) NULL, -- e.g. call SID, WhatsApp session ID, email thread ID
    -- Customer Association
    customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NULL,
    customer_phone VARCHAR(50) NULL,
    company_name VARCHAR(255) NULL,
    -- Assignment
    assigned_department VARCHAR(100) NULL,
    assigned_agent_id UUID NULL,
    assigned_agent_name VARCHAR(150) NULL,
    -- Linked Entities (Full Project Integration)
    linked_support_case_id UUID NULL REFERENCES support_cases(id) ON DELETE SET NULL,
    linked_call_id UUID NULL REFERENCES telephony_calls(id) ON DELETE SET NULL,
    linked_invoice_id UUID NULL REFERENCES invoices(id) ON DELETE SET NULL,
    linked_workflow_id UUID NULL,
    -- SLA
    sla_response_due_at TIMESTAMPTZ NULL,
    sla_resolution_due_at TIMESTAMPTZ NULL,
    sla_first_responded_at TIMESTAMPTZ NULL,
    sla_resolved_at TIMESTAMPTZ NULL,
    -- Resolution
    resolution_notes TEXT NULL,
    resolution_category VARCHAR(100) NULL,
    -- Tags & Metadata
    tags TEXT[] NULL DEFAULT '{}',
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Timestamps
    created_by VARCHAR(150) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_org_status 
    ON support_tickets(organization_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer 
    ON support_tickets(organization_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_source 
    ON support_tickets(organization_id, source_channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned 
    ON support_tickets(organization_id, assigned_agent_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_linked_case 
    ON support_tickets(linked_support_case_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_linked_call 
    ON support_tickets(linked_call_id);

-- 2. Ticket Activity Log (Append-only audit of all ticket changes)
CREATE TABLE IF NOT EXISTS support_ticket_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- created, assigned, status_changed, priority_changed, comment_added, escalated, resolved, closed, reopened
    actor_type VARCHAR(50) NOT NULL, -- system, agent, customer, ai_agent, supervisor
    actor_name VARCHAR(150) NOT NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    comment TEXT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_activities 
    ON support_ticket_activities(organization_id, ticket_id, occurred_at ASC);

-- 3. Ticket Comments Thread
CREATE TABLE IF NOT EXISTS support_ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_type VARCHAR(50) NOT NULL, -- agent, customer, ai_copilot, system
    author_name VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT false, -- internal notes not visible to customer
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_comments 
    ON support_ticket_comments(organization_id, ticket_id, created_at ASC);

-- 4. Row-Level Security Policies (Tenant Isolation)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_activities FORCE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments FORCE ROW LEVEL SECURITY;

CREATE POLICY support_tickets_tenant_isolation ON support_tickets
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY support_ticket_activities_tenant_isolation ON support_ticket_activities
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY support_ticket_comments_tenant_isolation ON support_ticket_comments
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
