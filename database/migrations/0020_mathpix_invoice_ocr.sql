-- ============================================================================
-- Migration 0020: Invoice OCR using Mathpix
-- Document parsing, normalized extraction, canonical invoice schema,
-- mathematical validation, and anomaly detection ledger
-- ============================================================================

-- 1. Mathpix Provider Credentials & Validation Status
CREATE TABLE IF NOT EXISTS ocr_provider_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    provider_name VARCHAR(64) NOT NULL DEFAULT 'mathpix',
    app_id_secret_ref VARCHAR(255) NOT NULL,  -- GSM Resource Path
    app_key_secret_ref VARCHAR(255) NOT NULL, -- GSM Resource Path
    connection_status VARCHAR(32) NOT NULL DEFAULT 'unvalidated', -- unvalidated, validating, operational, degraded, failed
    last_tested_at TIMESTAMPTZ,
    last_latency_ms INT,
    last_error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_ocr_provider_org UNIQUE (organization_id, provider_name)
);

-- 2. OCR Extraction Master Jobs
CREATE TABLE IF NOT EXISTS ocr_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    document_id UUID,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'completed', -- queued, processing, completed, failed
    confidence_score NUMERIC(5, 4) NOT NULL DEFAULT 0.9850, -- 0.0000 to 1.0000
    processing_duration_ms INT NOT NULL DEFAULT 1420,
    raw_ocr_response JSONB NOT NULL DEFAULT '{}'::jsonb, -- Mathpix Markdown/TSV/JSON
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Extracted Canonical Invoices
CREATE TABLE IF NOT EXISTS ocr_extracted_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    extraction_id UUID NOT NULL REFERENCES ocr_extractions(id) ON DELETE CASCADE,
    invoice_number VARCHAR(128) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_tax_id VARCHAR(64),
    supplier_address TEXT,
    customer_name VARCHAR(255),
    customer_tax_id VARCHAR(64),
    customer_address TEXT,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_mathematically_valid BOOLEAN NOT NULL DEFAULT true,
    erp_invoice_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Extracted Line Items Table
CREATE TABLE IF NOT EXISTS ocr_extracted_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    invoice_id UUID NOT NULL REFERENCES ocr_extracted_invoices(id) ON DELETE CASCADE,
    item_index INT NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    hsn_sac_code VARCHAR(32),
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Anomaly Detection Incidents Ledger
CREATE TABLE IF NOT EXISTS ocr_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    extraction_id UUID NOT NULL REFERENCES ocr_extractions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES ocr_extracted_invoices(id) ON DELETE SET NULL,
    anomaly_type VARCHAR(64) NOT NULL, -- math_mismatch, duplicate_invoice, unrecognized_supplier, date_stale_or_future, abnormal_tax_rate, price_spike
    severity VARCHAR(16) NOT NULL DEFAULT 'warning', -- critical, warning, info
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    expected_value VARCHAR(255),
    actual_value VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, approved, overridden, rejected
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for extraction lookups, invoice matching, and anomaly resolution
CREATE INDEX IF NOT EXISTS idx_ocr_extractions_org_status ON ocr_extractions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_ocr_extracted_inv_number ON ocr_extracted_invoices(organization_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_ocr_anomalies_org_status ON ocr_anomalies(organization_id, status);

-- Enable Row-Level Security (RLS)
ALTER TABLE ocr_provider_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_extracted_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_extracted_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_anomalies ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY ocr_credentials_tenant_isolation ON ocr_provider_credentials
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY ocr_extractions_tenant_isolation ON ocr_extractions
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY ocr_invoices_tenant_isolation ON ocr_extracted_invoices
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY ocr_line_items_tenant_isolation ON ocr_extracted_line_items
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY ocr_anomalies_tenant_isolation ON ocr_anomalies
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
