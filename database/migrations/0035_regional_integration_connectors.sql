-- ============================================================================
-- Migration: 0035_regional_integration_connectors.sql
-- Description: Multi-tenant configuration and audit log for Southeast Asia regional connectors
-- ============================================================================

-- 1. Regional Connector Configurations table
CREATE TABLE IF NOT EXISTS regional_connector_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    connector_id VARCHAR(50) NOT NULL, -- 'singapore_payments', 'malaysia_payments_einvoicing', 'thailand_payments_etax', 'line_thailand', 'regional_messaging', 'local_comms_services'
    connector_type VARCHAR(50) NOT NULL, -- 'payment', 'einvoicing', 'messaging', 'telephony'
    country_code VARCHAR(10) NOT NULL,   -- 'SG', 'MY', 'TH', 'SEA'
    
    -- Activation & Health State
    status VARCHAR(30) NOT NULL DEFAULT 'pending_credentials', -- 'pending_credentials', 'configured', 'active', 'degraded', 'disabled'
    auth_type VARCHAR(30) NOT NULL DEFAULT 'api_key',           -- 'api_key', 'oauth2', 'hmac_sha256', 'mutual_tls'
    credentials_vault_ref VARCHAR(255) NULL,                   -- Reference to Secret Manager secret
    
    -- Webhook Configuration
    webhook_endpoint_url TEXT NULL,
    webhook_secret VARCHAR(255) NULL,
    
    -- Rate Limiting & Capabilities
    rate_limit_per_min INT NOT NULL DEFAULT 60,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Telemetry
    last_health_check_at TIMESTAMPTZ NULL,
    last_error TEXT NULL,
    consecutive_failures INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_regional_connector UNIQUE (organization_id, connector_id)
);

-- 2. Regional Integration Audit Log table
CREATE TABLE IF NOT EXISTS regional_integration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    connector_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'credential_validation', 'outbound_dispatch', 'inbound_webhook', 'rate_limit_exceeded', 'status_changed'
    status VARCHAR(20) NOT NULL,      -- 'success', 'failed', 'blocked_no_credentials'
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_regional_connector_org_status
ON regional_connector_configurations(organization_id, status, country_code);

CREATE INDEX IF NOT EXISTS idx_regional_audit_org_connector
ON regional_integration_audit_log(organization_id, connector_id, occurred_at DESC);

-- Enable Row-Level Security
ALTER TABLE regional_connector_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_integration_audit_log ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY regional_connectors_tenant_isolation ON regional_connector_configurations
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY regional_audit_tenant_isolation ON regional_integration_audit_log
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);
