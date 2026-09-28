-- ============================================================================
-- Migration 0006: Comprehensive Production RLS & ABAC Security Policies
-- ============================================================================

-- 1. Helper Functions for Context Extraction
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_business_unit_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_business_unit_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS VARCHAR AS $$
BEGIN
    RETURN COALESCE(NULLIF(current_setting('app.current_user_role', true), ''), 'agent');
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Enable and Force RLS across all Core Tables
DO $$
DECLARE
    tbl_name TEXT;
    table_list TEXT[] := ARRAY[
        'accounts',
        'customers',
        'timeline_entries',
        'erp_invoices',
        'crm_deals',
        'ai_communications',
        'workflows',
        'audit_logs',
        'outbox_events',
        'business_units'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY table_list LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl_name);
            EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl_name);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Dedicated Multi-Tenant RLS Policies
-- Customer & Accounts RLS
DROP POLICY IF EXISTS tenant_isolation_customers ON customers;
CREATE POLICY tenant_isolation_customers ON customers
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_accounts ON accounts;
CREATE POLICY tenant_isolation_accounts ON accounts
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Financial & ERP RLS
DROP POLICY IF EXISTS tenant_isolation_invoices ON erp_invoices;
CREATE POLICY tenant_isolation_invoices ON erp_invoices
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- CRM & Deals RLS
DROP POLICY IF EXISTS tenant_isolation_deals ON crm_deals;
CREATE POLICY tenant_isolation_deals ON crm_deals
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- AI Comms RLS
DROP POLICY IF EXISTS tenant_isolation_ai_comms ON ai_communications;
CREATE POLICY tenant_isolation_ai_comms ON ai_communications
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Outbox Events RLS
DROP POLICY IF EXISTS tenant_isolation_outbox ON outbox_events;
CREATE POLICY tenant_isolation_outbox ON outbox_events
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Immutable Audit Log RLS (Only allows append or read for current tenant)
DROP POLICY IF EXISTS tenant_isolation_audit ON audit_logs;
CREATE POLICY tenant_isolation_audit ON audit_logs
    FOR SELECT
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_audit_insert ON audit_logs
    FOR INSERT
    WITH CHECK (tenant_id = current_tenant_id());
