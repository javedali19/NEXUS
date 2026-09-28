-- ============================================================================
-- Migration 0031: Customer Support Module (SLA Architecture, Omnichannel Cases, Audit)
-- ============================================================================

-- 1. Master Support Cases Table
CREATE TABLE IF NOT EXISTS support_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
    contact_id UUID NULL REFERENCES contacts(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- billing_dispute, technical_bug, feature_request, service_outage, account_access, onboarding
    priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- open, in_progress, waiting_on_customer, escalated, resolved, closed
    -- Assignment
    assigned_team VARCHAR(100) NULL, -- Tier 1 Support, Tier 2 Engineering, Billing Operations
    assigned_agent_id UUID NULL,
    assigned_agent_name VARCHAR(150) NULL,
    assigned_ai_persona VARCHAR(100) NULL, -- Rachel (AI Support Copilot)
    -- SLA Architecture
    sla_policy_id VARCHAR(50) NOT NULL DEFAULT 'enterprise_standard',
    first_response_due_at TIMESTAMPTZ NOT NULL,
    first_responded_at TIMESTAMPTZ NULL,
    resolution_due_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ NULL,
    sla_status VARCHAR(50) NOT NULL DEFAULT 'within_sla', -- within_sla, at_risk, breached
    -- Escalation
    is_escalated BOOLEAN NOT NULL DEFAULT false,
    escalated_to_supervisor_name VARCHAR(150) NULL,
    escalation_reason VARCHAR(255) NULL,
    escalated_at TIMESTAMPTZ NULL,
    -- Resolution
    resolution_summary TEXT NULL,
    root_cause_category VARCHAR(100) NULL,
    csat_score INT NULL, -- 1 to 5 star rating
    -- Omnichannel Connections
    whatsapp_session_id VARCHAR(100) NULL,
    linked_call_id UUID NULL REFERENCES telephony_calls(id) ON DELETE SET NULL,
    linked_invoice_id UUID NULL REFERENCES invoices(id) ON DELETE SET NULL,
    workflow_execution_id UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_cases_tenant_status 
    ON support_cases(organization_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_support_cases_customer 
    ON support_cases(organization_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_support_cases_sla 
    ON support_cases(organization_id, sla_status, resolution_due_at);

-- 2. Omnichannel Support Case Messages (Conversations)
CREATE TABLE IF NOT EXISTS support_case_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- customer, agent, ai_copilot, system
    sender_name VARCHAR(150) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'portal', -- portal, whatsapp, phone_transcript, email
    content TEXT NOT NULL,
    external_message_id VARCHAR(150) NULL, -- e.g. WhatsApp WAMID
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_case_messages_case 
    ON support_case_messages(organization_id, case_id, sent_at ASC);

-- 3. Staff-Only Internal Notes (Private to Organization)
CREATE TABLE IF NOT EXISTS support_case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
    author_id UUID NULL,
    author_name VARCHAR(150) NOT NULL,
    note_text TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_case_notes_case 
    ON support_case_notes(organization_id, case_id, created_at DESC);

-- 4. Case Attachments & Document Storage References (GCS)
CREATE TABLE IF NOT EXISTS support_case_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
    document_id UUID NULL REFERENCES documents(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
    storage_uri VARCHAR(255) NOT NULL, -- e.g. gs://nexus-tenant-assets/...
    uploader_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_case_attachments_case 
    ON support_case_attachments(organization_id, case_id);

-- 5. Append-Only Support Case Audit Events Ledger
CREATE TABLE IF NOT EXISTS support_case_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- case_created, assigned, priority_changed, status_changed, sla_breached, escalated, resolved, csat_submitted
    actor_type VARCHAR(50) NOT NULL, -- system, agent, supervisor, customer, ai_copilot
    actor_name VARCHAR(150) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_case_audit_events 
    ON support_case_audit_events(organization_id, case_id, occurred_at ASC);

-- 6. Row-Level Security Policies (Tenant Isolation)
ALTER TABLE support_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_case_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY support_cases_tenant_isolation ON support_cases
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY support_case_messages_tenant_isolation ON support_case_messages
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY support_case_notes_tenant_isolation ON support_case_notes
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY support_case_attachments_tenant_isolation ON support_case_attachments
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY support_case_audit_tenant_isolation ON support_case_audit_events
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
