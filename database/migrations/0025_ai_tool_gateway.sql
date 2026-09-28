-- ============================================================================
-- Migration 0025: AI Tool Gateway & Safe Execution Sandbox
-- ============================================================================

-- 1. Master Tool Catalog
CREATE TABLE IF NOT EXISTS ai_tool_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- crm, finance, communications, automation, intelligence
    safety_tier VARCHAR(50) NOT NULL DEFAULT 'read_only', -- read_only, idempotent_write, sensitive_mutation
    required_capability VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    parameters_schema JSONB NOT NULL,
    returns_schema JSONB NOT NULL,
    rate_limit_per_minute INT NOT NULL DEFAULT 60,
    is_idempotent BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Idempotency Key Cache (24-hour TTL replay defense)
CREATE TABLE IF NOT EXISTS ai_tool_idempotency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- in_progress, completed, failed
    response_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    CONSTRAINT uq_ai_tool_idempotency UNIQUE(organization_id, tool_name, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_tool_idempotency_lookup 
    ON ai_tool_idempotency(organization_id, tool_name, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_ai_tool_idempotency_expires 
    ON ai_tool_idempotency(expires_at);

-- 3. Rate Limit Sliding Window State
CREATE TABLE IF NOT EXISTS ai_tool_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ai_tool_rate_limit_bucket UNIQUE(organization_id, agent_id, tool_name, window_start)
);

CREATE INDEX IF NOT EXISTS idx_ai_tool_rate_limits_window 
    ON ai_tool_rate_limits(organization_id, tool_name, window_start);

-- 4. Gateway Invocations & Telemetry
CREATE TABLE IF NOT EXISTS ai_tool_invocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID NULL REFERENCES ai_agents(id) ON DELETE SET NULL,
    tool_name VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) NULL,
    correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
    caller_role VARCHAR(100) NOT NULL DEFAULT 'autonomous_agent',
    status VARCHAR(50) NOT NULL, -- success, policy_blocked, unauthorized, validation_failed, rate_limited, error
    input_payload JSONB NOT NULL,
    output_payload JSONB NULL,
    error_message TEXT NULL,
    duration_ms INT NOT NULL DEFAULT 0,
    was_cached_replay BOOLEAN NOT NULL DEFAULT false,
    policies_evaluated JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tool_invocations_tenant 
    ON ai_tool_invocations(organization_id, tool_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tool_invocations_correlation 
    ON ai_tool_invocations(organization_id, correlation_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_invocations_status 
    ON ai_tool_invocations(organization_id, status);

-- 5. Append-Only Cryptographic Audit Trail
CREATE TABLE IF NOT EXISTS ai_tool_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invocation_id UUID NOT NULL REFERENCES ai_tool_invocations(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    actor_id VARCHAR(100) NOT NULL,
    correlation_id UUID NOT NULL,
    input_snapshot JSONB NOT NULL,
    output_snapshot JSONB NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Strict Immutability Trigger on ai_tool_audit_trail
CREATE OR REPLACE FUNCTION prevent_ai_tool_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'AI Tool Audit Trail is strictly append-only. Modification and deletion are prohibited by security policy.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_tool_audit_immutable ON ai_tool_audit_trail;
CREATE TRIGGER trg_ai_tool_audit_immutable
    BEFORE UPDATE OR DELETE ON ai_tool_audit_trail
    FOR EACH ROW
    EXECUTE FUNCTION prevent_ai_tool_audit_tampering();

-- 6. Row-Level Security Policies
ALTER TABLE ai_tool_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_invocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_tool_idempotency_tenant_isolation ON ai_tool_idempotency
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_tool_rate_limits_tenant_isolation ON ai_tool_rate_limits
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_tool_invocations_tenant_isolation ON ai_tool_invocations
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY ai_tool_audit_trail_tenant_isolation ON ai_tool_audit_trail
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- 7. Seed The 12 Safe Tools Definitions
INSERT INTO ai_tool_catalog (
    tool_name, display_name, category, safety_tier, required_capability, 
    description, parameters_schema, returns_schema, rate_limit_per_minute, is_idempotent
) VALUES
(
    'customer_search',
    'Customer Search',
    'crm',
    'read_only',
    'customers:read',
    'Search customers across the unified 360 database by name, email, phone, company, or tax ID.',
    '{
        "type": "object",
        "required": ["query"],
        "properties": {
            "query": {"type": "string", "description": "Search query text (name, email, or tax ID)"},
            "limit": {"type": "integer", "default": 10, "maximum": 50},
            "include_financials": {"type": "boolean", "default": false}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"customers": {"type": "array"}, "total_count": {"type": "integer"}}}'::jsonb,
    120,
    false
),
(
    'customer_timeline',
    'Customer Activity Timeline',
    'crm',
    'read_only',
    'timeline:read',
    'Retrieve chronological interaction history (calls, WhatsApp, invoices, payments, exceptions) for a customer.',
    '{
        "type": "object",
        "required": ["customer_id"],
        "properties": {
            "customer_id": {"type": "string", "format": "uuid"},
            "limit": {"type": "integer", "default": 20},
            "event_categories": {"type": "array", "items": {"type": "string"}}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"events": {"type": "array"}, "customer_id": {"type": "string"}}}'::jsonb,
    100,
    false
),
(
    'invoice_lookup',
    'Invoice Lookup',
    'finance',
    'read_only',
    'invoices:read',
    'Retrieve invoice balance, status, line items, payment terms, and aging days past due.',
    '{
        "type": "object",
        "required": ["invoice_number"],
        "properties": {
            "invoice_number": {"type": "string", "description": "Canonical invoice identifier (e.g. INV-2026-0041)"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"invoice_number": {"type": "string"}, "total_amount": {"type": "number"}, "balance_due": {"type": "number"}, "status": {"type": "string"}}}'::jsonb,
    120,
    false
),
(
    'quote_creation',
    'Quote Creation',
    'finance',
    'idempotent_write',
    'quotes:write',
    'Generate a commercial quote/estimate with line items, tax, discounts, and expiration date.',
    '{
        "type": "object",
        "required": ["customer_id", "items", "valid_until"],
        "properties": {
            "customer_id": {"type": "string", "format": "uuid"},
            "title": {"type": "string"},
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["description", "quantity", "unit_price"],
                    "properties": {
                        "description": {"type": "string"},
                        "quantity": {"type": "number", "minimum": 1},
                        "unit_price": {"type": "number", "minimum": 0}
                    }
                }
            },
            "discount_percentage": {"type": "number", "minimum": 0, "maximum": 50},
            "valid_until": {"type": "string", "format": "date"},
            "idempotency_key": {"type": "string"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"quote_id": {"type": "string"}, "quote_number": {"type": "string"}, "subtotal": {"type": "number"}, "total": {"type": "number"}}}'::jsonb,
    30,
    true
),
(
    'payment_link_creation',
    'Payment Link Creation',
    'finance',
    'idempotent_write',
    'payments:generate_link',
    'Create dynamic Razorpay/Stripe checkout payment link with expiry and invoice association.',
    '{
        "type": "object",
        "required": ["customer_id", "amount", "currency"],
        "properties": {
            "customer_id": {"type": "string", "format": "uuid"},
            "invoice_id": {"type": "string", "format": "uuid"},
            "amount": {"type": "number", "minimum": 1},
            "currency": {"type": "string", "default": "USD"},
            "description": {"type": "string"},
            "expires_in_hours": {"type": "integer", "default": 72},
            "idempotency_key": {"type": "string"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"payment_link_id": {"type": "string"}, "checkout_url": {"type": "string"}, "amount": {"type": "number"}}}'::jsonb,
    60,
    true
),
(
    'whatsapp_sending',
    'WhatsApp Message Dispatch',
    'communications',
    'sensitive_mutation',
    'whatsapp:send',
    'Dispatch WhatsApp HSM template or session message after verifying customer consent and DNC compliance.',
    '{
        "type": "object",
        "required": ["phone_number", "template_name"],
        "properties": {
            "phone_number": {"type": "string", "description": "E.164 formatted telephone number"},
            "template_name": {"type": "string"},
            "parameters": {"type": "object"},
            "consent_verified": {"type": "boolean", "default": true},
            "idempotency_key": {"type": "string"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"message_id": {"type": "string"}, "status": {"type": "string"}, "recipient": {"type": "string"}}}'::jsonb,
    40,
    true
),
(
    'call_scheduling',
    'Voice Call Scheduling',
    'communications',
    'sensitive_mutation',
    'telephony:schedule',
    'Schedule automated AI voice call or human representative callback within legal communication hours.',
    '{
        "type": "object",
        "required": ["phone_number", "scheduled_time", "purpose"],
        "properties": {
            "phone_number": {"type": "string"},
            "customer_id": {"type": "string", "format": "uuid"},
            "scheduled_time": {"type": "string", "format": "date-time"},
            "purpose": {"type": "string"},
            "call_script_id": {"type": "string"},
            "idempotency_key": {"type": "string"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"call_id": {"type": "string"}, "scheduled_at": {"type": "string"}, "status": {"type": "string"}}}'::jsonb,
    20,
    true
),
(
    'task_creation',
    'CRM Task Creation',
    'crm',
    'idempotent_write',
    'tasks:write',
    'Create actionable CRM task with priority, due date, and assign to agent queue or user.',
    '{
        "type": "object",
        "required": ["title", "due_date"],
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "customer_id": {"type": "string", "format": "uuid"},
            "priority": {"type": "string", "enum": ["low", "normal", "high", "urgent"], "default": "normal"},
            "assigned_to": {"type": "string"},
            "due_date": {"type": "string", "format": "date-time"},
            "idempotency_key": {"type": "string"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"task_id": {"type": "string"}, "title": {"type": "string"}, "status": {"type": "string"}}}'::jsonb,
    80,
    true
),
(
    'crm_updates',
    'CRM Field Updates',
    'crm',
    'idempotent_write',
    'crm:update',
    'Update whitelisted fields on customer, lead, or deal records without exposing direct table writes.',
    '{
        "type": "object",
        "required": ["entity_type", "entity_id", "fields_to_update"],
        "properties": {
            "entity_type": {"type": "string", "enum": ["customer", "lead", "deal", "contact"]},
            "entity_id": {"type": "string", "format": "uuid"},
            "fields_to_update": {
                "type": "object",
                "description": "Whitelisted properties only (e.g. stage, status, tags, notes, next_contact_date)"
            },
            "idempotency_key": {"type": "string"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"entity_id": {"type": "string"}, "updated_fields": {"type": "array"}, "status": {"type": "string"}}}'::jsonb,
    60,
    true
),
(
    'workflow_execution',
    'Workflow Execution Trigger',
    'automation',
    'idempotent_write',
    'workflows:execute',
    'Trigger a workflow automation DAG with an input payload and correlation ID.',
    '{
        "type": "object",
        "required": ["workflow_slug", "trigger_payload"],
        "properties": {
            "workflow_slug": {"type": "string"},
            "trigger_payload": {"type": "object"},
            "idempotency_key": {"type": "string"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"execution_id": {"type": "string"}, "workflow_slug": {"type": "string"}, "status": {"type": "string"}}}'::jsonb,
    30,
    true
),
(
    'analytics_lookup',
    'Analytics & KPIs Lookup',
    'intelligence',
    'read_only',
    'analytics:read',
    'Query high-level financial and operational metrics (DSO, recovery rate, pipeline, revenue).',
    '{
        "type": "object",
        "required": ["metric_category"],
        "properties": {
            "metric_category": {"type": "string", "enum": ["dso", "collections_recovery", "pipeline_summary", "cash_flow"]},
            "timeframe": {"type": "string", "enum": ["7d", "30d", "90d", "ytd"], "default": "30d"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"metric_category": {"type": "string"}, "metrics": {"type": "object"}}}'::jsonb,
    60,
    false
),
(
    'exception_creation',
    'Platform Exception Logging',
    'automation',
    'idempotent_write',
    'exceptions:write',
    'Create structured system or business domain exception with severity, correlation ID, and remediation task.',
    '{
        "type": "object",
        "required": ["category", "severity", "description"],
        "properties": {
            "category": {"type": "string"},
            "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
            "description": {"type": "string"},
            "entity_type": {"type": "string"},
            "entity_id": {"type": "string"},
            "error_code": {"type": "string"},
            "idempotency_key": {"type": "string"}
        }
    }'::jsonb,
    '{"type": "object", "properties": {"exception_id": {"type": "string"}, "category": {"type": "string"}, "severity": {"type": "string"}}}'::jsonb,
    50,
    true
)
ON CONFLICT (tool_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    category = EXCLUDED.category,
    safety_tier = EXCLUDED.safety_tier,
    required_capability = EXCLUDED.required_capability,
    description = EXCLUDED.description,
    parameters_schema = EXCLUDED.parameters_schema,
    returns_schema = EXCLUDED.returns_schema,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    is_idempotent = EXCLUDED.is_idempotent,
    updated_at = NOW();
