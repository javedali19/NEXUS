-- ============================================================================
-- Migration: 0034_regional_country_pack_engine.sql
-- Description: Multi-tenant Regional Country Pack engine configuration & e-invoicing ledger
-- ============================================================================

-- 1. Tenant Country Pack Configuration table
CREATE TABLE IF NOT EXISTS tenant_country_pack_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    country_code VARCHAR(10) NOT NULL, -- 'SG', 'MY', 'TH'
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Currency & Timezone overrides
    default_currency VARCHAR(10) NOT NULL, -- 'SGD', 'MYR', 'THB'
    timezone VARCHAR(50) NOT NULL,         -- 'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Asia/Bangkok'
    
    -- Tax Registration
    tax_authority VARCHAR(50) NOT NULL,    -- 'IRAS', 'LHDN', 'Revenue Department'
    tax_id_number VARCHAR(100) NOT NULL,   -- UEN/GST (SG), TIN/BRN (MY), 13-digit Tax ID (TH)
    tax_rate_percent NUMERIC(5, 2) NOT NULL, -- 9.0 (SG), 8.0 (MY), 7.0 (TH)
    branch_code VARCHAR(20) DEFAULT '00000', -- Thailand Branch Code (00000 Head Office)
    
    -- E-Invoicing Credentials & Status
    einvoicing_framework VARCHAR(50) NOT NULL, -- 'invoicenow_peppol', 'lhdn_myinvois', 'thai_rd_etax'
    einvoicing_participant_id VARCHAR(100) NULL, -- e.g. '0195:SGUEN...'
    einvoicing_status VARCHAR(20) NOT NULL DEFAULT 'ready', -- 'pending', 'ready', 'certified'
    einvoicing_digital_certificate_ref VARCHAR(255) NULL,
    
    -- Telephony & Calling Window Rules
    dnc_integration_enabled BOOLEAN NOT NULL DEFAULT true,
    calling_window_start TIME NOT NULL DEFAULT '09:00:00',
    calling_window_end TIME NOT NULL DEFAULT '21:00:00',
    sunday_calling_allowed BOOLEAN NOT NULL DEFAULT false,
    
    -- Languages & Communication Rules
    primary_language VARCHAR(10) NOT NULL, -- 'en-SG', 'ms-MY', 'th-TH'
    secondary_languages JSONB NOT NULL DEFAULT '[]'::jsonb,
    mandatory_opt_out_keyword VARCHAR(50) NOT NULL, -- 'STOP', 'BATAL', 'ยกเลิก'
    
    -- Regional Payment Rails
    enabled_payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_country UNIQUE (organization_id, country_code)
);

-- 2. Regional E-Invoicing Transmission Ledger
CREATE TABLE IF NOT EXISTS einvoice_transmission_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    invoice_id UUID NOT NULL,
    framework VARCHAR(50) NOT NULL, -- 'invoicenow_peppol', 'lhdn_myinvois', 'thai_rd_etax'
    
    -- Transmission identifiers
    submission_uuid VARCHAR(100) NOT NULL,
    irbm_unique_identifier VARCHAR(100) NULL, -- LHDN UUID / Peppol message ID / Thai RD code
    validation_qr_url TEXT NULL,
    
    -- Document content
    payload_format VARCHAR(20) NOT NULL, -- 'ubl_xml', 'lhdn_json', 'etda_xml'
    payload_storage_uri TEXT NOT NULL,
    digital_signature_hash VARCHAR(255) NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'submitted', -- 'submitted', 'validated', 'rejected', 'cancelled'
    validation_errors JSONB NULL,
    transmitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validated_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_country_pack_org_code
ON tenant_country_pack_configs(organization_id, country_code);

CREATE INDEX IF NOT EXISTS idx_einvoice_ledger_org_invoice
ON einvoice_transmission_ledger(organization_id, invoice_id, country_code);

CREATE INDEX IF NOT EXISTS idx_einvoice_ledger_status
ON einvoice_transmission_ledger(organization_id, status, transmitted_at DESC);

-- Enable Row-Level Security
ALTER TABLE tenant_country_pack_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE einvoice_transmission_ledger ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY country_pack_configs_tenant_isolation ON tenant_country_pack_configs
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY einvoice_ledger_tenant_isolation ON einvoice_transmission_ledger
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);
