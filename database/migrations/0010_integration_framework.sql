-- ============================================================================
-- Migration 0010: Generic External Integration Framework
-- ============================================================================

-- 1. Enhance integration_connections table with full connector architecture
ALTER TABLE integration_connections
    ADD COLUMN IF NOT EXISTS auth_type VARCHAR(50) NOT NULL DEFAULT 'api_key', -- oauth2, api_key, hmac_signature, mutual_tls, basic_auth
    ADD COLUMN IF NOT EXISTS auth_credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS webhook_endpoint_url VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS webhook_secret VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS webhook_signature_header VARCHAR(100) DEFAULT 'x-hub-signature-256',
    ADD COLUMN IF NOT EXISTS rate_limit_per_minute INT NOT NULL DEFAULT 600,
    ADD COLUMN IF NOT EXISTS capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS health_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured', -- healthy, degraded, disconnected, unconfigured
    ADD COLUMN IF NOT EXISTS last_health_check_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS last_health_error TEXT NULL,
    ADD COLUMN IF NOT EXISTS consecutive_failure_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS environment VARCHAR(50) NOT NULL DEFAULT 'sandbox'; -- sandbox, production

CREATE INDEX IF NOT EXISTS idx_integrations_health ON integration_connections(organization_id, health_status);
CREATE INDEX IF NOT EXISTS idx_integrations_auth_type ON integration_connections(organization_id, auth_type);

-- 2. Webhook Deliveries & Ingestion Log
CREATE TABLE IF NOT EXISTS integration_webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    payload JSONB NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    idempotency_key VARCHAR(255) NULL,
    normalized_event_type VARCHAR(100) NULL,
    normalized_payload JSONB NULL,
    processing_status VARCHAR(50) NOT NULL DEFAULT 'received', -- received, normalized, dispatched, failed, rejected
    error_message TEXT NULL,
    ip_address VARCHAR(50) NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE integration_webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_webhook_deliveries FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_webhook_deliveries ON integration_webhook_deliveries
    FOR ALL
    USING (organization_id = current_tenant_id())
    WITH CHECK (organization_id = current_tenant_id());

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_conn ON integration_webhook_deliveries(integration_connection_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_idemp ON integration_webhook_deliveries(organization_id, idempotency_key);
