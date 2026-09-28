-- Migration: 0013_accounting_connectors.sql
-- Description: Multi-tenant Accounting Connector Framework (Xero, Zoho Books, QuickBooks, Entity Mappings, Sync Logs, RLS)

CREATE TABLE IF NOT EXISTS accounting_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    provider VARCHAR(32) NOT NULL CHECK (
        provider IN ('xero', 'zoho_books', 'quickbooks')
    ),
    display_name VARCHAR(128) NOT NULL,
    
    -- Multi-Tenant External IDs & Realm/Org Scopes
    external_tenant_id VARCHAR(128), -- Xero Tenant ID or Zoho Org ID
    realm_id VARCHAR(128),           -- QuickBooks Company / Realm ID
    
    -- Authentication & Vault Secrets Reference
    auth_type VARCHAR(32) NOT NULL DEFAULT 'oauth2',
    credentials_vault_ref VARCHAR(255) NOT NULL,
    token_expires_at TIMESTAMPTZ,
    
    -- Sync Schedule & Config
    sync_status VARCHAR(32) NOT NULL DEFAULT 'idle' CHECK (
        sync_status IN ('idle', 'in_progress', 'synced', 'error', 'partial_failure')
    ),
    auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
    sync_frequency_minutes INT NOT NULL DEFAULT 60,
    sync_customers BOOLEAN NOT NULL DEFAULT true,
    sync_invoices BOOLEAN NOT NULL DEFAULT true,
    sync_payments BOOLEAN NOT NULL DEFAULT true,
    
    -- Webhook Security
    webhook_endpoint_url VARCHAR(512),
    webhook_secret_vault_ref VARCHAR(255),
    
    -- Diagnostics
    last_synced_at TIMESTAMPTZ,
    last_sync_error TEXT,
    consecutive_errors INT NOT NULL DEFAULT 0,
    
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_accounting_org_provider UNIQUE (organization_id, provider)
);

CREATE TABLE IF NOT EXISTS accounting_entity_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES accounting_connections(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL,
    
    -- Local Entity
    entity_type VARCHAR(32) NOT NULL CHECK (
        entity_type IN ('customer', 'invoice', 'payment', 'tax_rate', 'account_code')
    ),
    local_entity_id UUID NOT NULL,
    
    -- Remote Accounting Entity
    remote_entity_id VARCHAR(128) NOT NULL,
    remote_entity_number VARCHAR(64),
    
    -- Sync Metadata & Checksum for Change Detection
    sync_direction VARCHAR(16) NOT NULL DEFAULT 'bidirectional' CHECK (
        sync_direction IN ('inbound', 'outbound', 'bidirectional')
    ),
    local_checksum VARCHAR(64),
    remote_checksum VARCHAR(64),
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(32) NOT NULL DEFAULT 'synced' CHECK (
        sync_status IN ('synced', 'pending_push', 'pending_pull', 'conflict', 'error')
    ),
    last_error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_accounting_mapping_local UNIQUE (organization_id, provider, entity_type, local_entity_id),
    CONSTRAINT uq_accounting_mapping_remote UNIQUE (organization_id, provider, entity_type, remote_entity_id)
);

CREATE TABLE IF NOT EXISTS accounting_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES accounting_connections(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL,
    
    sync_batch_id UUID NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    sync_direction VARCHAR(16) NOT NULL,
    
    entities_processed INT NOT NULL DEFAULT 0,
    entities_created INT NOT NULL DEFAULT 0,
    entities_updated INT NOT NULL DEFAULT 0,
    entities_failed INT NOT NULL DEFAULT 0,
    
    status VARCHAR(32) NOT NULL CHECK (
        status IN ('in_progress', 'succeeded', 'failed', 'retrying')
    ),
    error_summary TEXT,
    detailed_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    duration_ms INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accounting_reconciliation_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES accounting_connections(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL,
    
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    erp_total_receivables NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    accounting_total_receivables NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discrepancy_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    
    status VARCHAR(32) NOT NULL DEFAULT 'balanced' CHECK (
        status IN ('balanced', 'discrepancy_detected', 'under_review', 'reconciled')
    ),
    unmapped_local_invoices_count INT NOT NULL DEFAULT 0,
    unmapped_remote_invoices_count INT NOT NULL DEFAULT 0,
    discrepancy_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    reconciled_by UUID,
    reconciled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_accounting_conn_org ON accounting_connections(organization_id, provider);
CREATE INDEX IF NOT EXISTS idx_accounting_map_local ON accounting_entity_mappings(local_entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_accounting_map_remote ON accounting_entity_mappings(remote_entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_accounting_logs_conn ON accounting_sync_logs(connection_id, started_at DESC);

-- Enable RLS
ALTER TABLE accounting_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entity_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_reconciliation_ledgers ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY tenant_isolation_accounting_conn ON accounting_connections
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_accounting_map ON accounting_entity_mappings
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_accounting_logs ON accounting_sync_logs
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_accounting_recon ON accounting_reconciliation_ledgers
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
