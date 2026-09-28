-- Migration: 0039_global_search_universal_commands.sql
-- Description: Unified Global Search across 13 entities and Universal Command Engine with Tool Gateway integration

-- 1. Create Search Entity Type Enum
DO $$ BEGIN
    CREATE TYPE search_entity_type AS ENUM (
        'customer',
        'company',
        'contact',
        'lead',
        'deal',
        'quote',
        'invoice',
        'payment',
        'conversation',
        'call',
        'document',
        'workflow',
        'ai_agent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Unified Polymorphic Search Index Table
CREATE TABLE IF NOT EXISTS search_index_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    entity_type search_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    snippet TEXT,
    deep_link VARCHAR(512) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    search_vector TSVECTOR,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_search_entity UNIQUE (organization_id, entity_type, entity_id)
);

-- Indexes for ultra-fast multi-entity search
CREATE INDEX IF NOT EXISTS idx_search_index_org_entity ON search_index_entries(organization_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_search_index_vector ON search_index_entries USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_index_tags ON search_index_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_search_index_title_trgm ON search_index_entries USING GIN(title gin_trgm_ops);

-- Trigger to maintain search_vector automatically
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.subtitle, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.snippet, '')), 'C') ||
        setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'B');
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_search_vector_update ON search_index_entries;
CREATE TRIGGER trg_search_vector_update
    BEFORE INSERT OR UPDATE ON search_index_entries
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- 3. Universal Commands Registry
CREATE TABLE IF NOT EXISTS universal_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command_slug VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL, -- 'crm', 'erp', 'communications', 'automation', 'intelligence', 'system'
    icon_name VARCHAR(64) NOT NULL DEFAULT 'Sparkles',
    shortcut VARCHAR(32),
    target_tool_name VARCHAR(64) NOT NULL, -- references tool in AiToolGateway
    default_parameters JSONB DEFAULT '{}'::jsonb,
    required_roles TEXT[] NOT NULL DEFAULT '{"admin","manager","sales_agent","finance_officer"}',
    required_capability VARCHAR(128) NOT NULL,
    is_autonomous_allowed BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_universal_commands_category ON universal_commands(category);
CREATE INDEX IF NOT EXISTS idx_universal_commands_tool ON universal_commands(target_tool_name);

-- 4. Command Execution Audit Log
CREATE TABLE IF NOT EXISTS command_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    command_slug VARCHAR(64) NOT NULL,
    tool_name VARCHAR(64) NOT NULL,
    actor_id UUID,
    actor_email VARCHAR(255) NOT NULL,
    actor_type VARCHAR(32) NOT NULL DEFAULT 'human', -- 'human', 'ai_agent'
    arguments JSONB NOT NULL DEFAULT '{}'::jsonb,
    execution_status VARCHAR(32) NOT NULL, -- 'success', 'policy_blocked', 'failed'
    execution_duration_ms INT NOT NULL DEFAULT 0,
    sha256_audit_hash VARCHAR(128) NOT NULL,
    correlation_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_command_audit_org_created ON command_audit_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_command_audit_slug ON command_audit_log(command_slug);

-- 5. Row-Level Security (RLS) Policies
ALTER TABLE search_index_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY search_index_tenant_isolation ON search_index_entries
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY universal_commands_public_read ON universal_commands
    FOR SELECT
    USING (is_active = true);

CREATE POLICY command_audit_tenant_isolation ON command_audit_log
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

-- 6. Seed Core Universal Commands Mapped to Existing Tool Gateway Tools
INSERT INTO universal_commands (command_slug, title, description, category, icon_name, shortcut, target_tool_name, default_parameters, required_capability)
VALUES
    ('create-quote', 'Create Commercial Quote', 'Generate price quote with line items, tax, and inventory check', 'erp', 'FileCheck', 'N Q', 'quote_creation', '{"discount_percentage": 0.0}', 'quotes:write'),
    ('create-payment-link', 'Generate Payment Link', 'Create hosted Razorpay / Stripe payment checkout URL', 'erp', 'Link2', 'N P', 'payment_link_creation', '{"currency": "USD"}', 'payments:generate_link'),
    ('search-customer-360', 'Search Customer 360', 'Search across unified accounts, contacts, and lifetime value', 'crm', 'Users', 'G C', 'customer_search', '{}', 'customers:read'),
    ('lookup-invoice', 'Lookup Invoice Status', 'Check aging, outstanding balance, and line items', 'erp', 'DollarSign', 'L I', 'invoice_lookup', '{}', 'invoices:read'),
    ('lookup-inventory-stock', 'Check Inventory & Stock', 'Query SKU warehouse availability, reserved and on-hand units', 'erp', 'FolderGit2', 'L S', 'inventory_lookup', '{"warehouse_code": "WH-SG-01"}', 'inventory:read'),
    ('create-procurement-po', 'Create Purchase Order', 'Draft ERP purchase order to replenish low stock from supplier', 'erp', 'Package', 'N O', 'create_procurement_po', '{"warehouse_code": "WH-SG-01"}', 'procurement:create'),
    ('advance-sales-flow', 'Advance Sales Flow Stage', 'Progress lead through the 9-stage Lead-to-Cash sales cycle', 'crm', 'TrendingUp', 'A F', 'sales_flow_advance', '{}', 'sales:advance_flow'),
    ('send-whatsapp-notice', 'Send WhatsApp Notification', 'Dispatch HSM approved message template with consent check', 'communications', 'MessageCircle', 'S W', 'whatsapp_sending', '{"consent_verified": true}', 'whatsapp:send'),
    ('schedule-voice-call', 'Schedule AI Voice Call', 'Schedule telephony call or human callback in calling window', 'communications', 'PhoneCall', 'S C', 'call_scheduling', '{}', 'telephony:schedule'),
    ('trigger-workflow', 'Execute Workflow Automation', 'Trigger DAG automation pipeline with input event payload', 'automation', 'GitBranch', 'E W', 'workflow_execution', '{}', 'workflows:execute'),
    ('query-analytics-roi', 'View Analytics & Financial KPIs', 'Retrieve live DSO, recovery rate, ARR, and pipeline conversion', 'intelligence', 'BarChart3', 'Q A', 'analytics_lookup', '{"metric_category": "executive_summary"}', 'analytics:read'),
    ('log-platform-exception', 'Log Exception & Remediation', 'Create platform exception ticket with severity and correlation ID', 'system', 'AlertTriangle', 'L E', 'exception_creation', '{"severity": "medium"}', 'exceptions:write')
ON CONFLICT (command_slug) DO NOTHING;
