-- ============================================================================
-- Migration 0019: Secure Document Storage Architecture (Google Cloud Storage)
-- Metadata, immutable version trees, customer & invoice associations,
-- access control, retention policies, legal holds, and audit logging
-- ============================================================================

-- 1. Documents Master Registry
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    business_unit_id UUID,
    customer_id UUID,
    invoice_id UUID,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'general', -- invoice, contract, quote, tax_document, receipt, general
    access_level VARCHAR(32) NOT NULL DEFAULT 'internal_only', -- internal_only, signed_url_public, confidential_restricted
    retention_policy VARCHAR(64) NOT NULL DEFAULT '7_years_tax', -- 7_years_tax, 3_years_contract, permanent, custom
    retention_until TIMESTAMPTZ,
    is_legal_hold BOOLEAN NOT NULL DEFAULT false,
    current_version_number INT NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'ready', -- uploaded, processing, ocr_extracted, ready, archived
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Immutable Document Version Tree
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    gcs_bucket VARCHAR(128) NOT NULL,
    gcs_object_key VARCHAR(512) NOT NULL, -- tenants/{org_id}/{category}/{year}/{doc_id}/v{version}/{filename}
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    scan_status VARCHAR(32) NOT NULL DEFAULT 'clean', -- pending, clean, quarantined
    change_summary TEXT,
    created_by UUID,
    created_by_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_document_version_number UNIQUE (document_id, version_number)
);

-- 3. Document Access & Audit Ledger (Append-Only)
CREATE TABLE IF NOT EXISTS document_access_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
    actor_id UUID,
    actor_name VARCHAR(255) NOT NULL,
    action VARCHAR(64) NOT NULL, -- uploaded, signed_url_generated, downloaded, version_created, metadata_updated, legal_hold_toggled
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast customer, invoice, and retention queries
CREATE INDEX IF NOT EXISTS idx_documents_org_category ON documents(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_documents_customer ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_invoice ON documents(invoice_id);
CREATE INDEX IF NOT EXISTS idx_documents_retention ON documents(retention_until) WHERE is_legal_hold = false;
CREATE INDEX IF NOT EXISTS idx_doc_versions_doc_id ON document_versions(document_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_doc_audits_doc_id ON document_access_audits(document_id, created_at DESC);

-- Enable Row-Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_audits ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY documents_tenant_isolation ON documents
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY document_versions_tenant_isolation ON document_versions
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY document_audits_tenant_isolation ON document_access_audits
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
