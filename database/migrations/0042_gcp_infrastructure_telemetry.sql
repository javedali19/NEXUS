-- Migration: 0042_gcp_infrastructure_telemetry.sql
-- Description: Production GCP Infrastructure Resources, Multi-Environment Configs, and Secret Manager Vault Catalog

-- 1. GCP Infrastructure Resources
CREATE TABLE IF NOT EXISTS gcp_infrastructure_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    environment VARCHAR(32) NOT NULL, -- 'development', 'staging', 'production'
    service_type VARCHAR(64) NOT NULL, -- 'cloud_run', 'cloud_sql', 'pubsub', 'cloud_tasks', 'cloud_scheduler', 'cloud_storage', 'secret_manager', 'cloud_kms', 'artifact_registry', 'iam', 'networking', 'monitoring', 'cloud_armor'
    resource_name VARCHAR(128) NOT NULL,
    gcp_region VARCHAR(64) NOT NULL DEFAULT 'us-central1',
    status VARCHAR(32) NOT NULL DEFAULT 'provisioned', -- 'provisioned', 'updating', 'healthy', 'degraded'
    cmek_key_id TEXT,
    is_ha_enabled BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    provisioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gcp_resources_org_env ON gcp_infrastructure_resources(organization_id, environment, service_type);

-- 2. GCP Environment Configurations
CREATE TABLE IF NOT EXISTS gcp_environment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    environment VARCHAR(32) NOT NULL, -- 'development', 'staging', 'production'
    project_id VARCHAR(128) NOT NULL,
    region VARCHAR(64) NOT NULL DEFAULT 'us-central1',
    db_tier VARCHAR(64) NOT NULL,
    vpc_cidr VARCHAR(32) NOT NULL,
    waf_enabled BOOLEAN NOT NULL DEFAULT true,
    cmek_enabled BOOLEAN NOT NULL DEFAULT true,
    wif_pool_id VARCHAR(256) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_env_org UNIQUE (organization_id, environment)
);

CREATE INDEX IF NOT EXISTS idx_gcp_env_configs_org ON gcp_environment_configs(organization_id, environment);

-- 3. Secret Manager Vault Catalog (References Only - Zero Plaintext Credentials Stored)
CREATE TABLE IF NOT EXISTS gcp_secret_vault_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    environment VARCHAR(32) NOT NULL,
    secret_id VARCHAR(128) NOT NULL,
    provider_name VARCHAR(64) NOT NULL, -- 'stripe', 'razorpay', 'twilio', 'meta_whatsapp', 'gemini_ai', 'elevenlabs', 'deepgram', 'sentry', 'cloud_sql'
    referencing_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    version_count INT NOT NULL DEFAULT 1,
    rotation_days INT NOT NULL DEFAULT 90,
    last_rotated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_secret_env_org UNIQUE (organization_id, environment, secret_id)
);

CREATE INDEX IF NOT EXISTS idx_gcp_secret_catalog ON gcp_secret_vault_catalog(organization_id, environment, provider_name);

-- Seed Environments for Default Organization
INSERT INTO gcp_environment_configs (
    id, organization_id, environment, project_id, region, db_tier, vpc_cidr, waf_enabled, cmek_enabled, wif_pool_id, status
)
SELECT 
    'e182a091-8812-4cf0-9412-817290128371'::uuid,
    id,
    'development',
    'nexus-erp-dev',
    'us-central1',
    'db-f1-micro',
    '10.20.0.0/20',
    false,
    true,
    'projects/109283746501/locations/global/workloadIdentityPools/github-actions-pool',
    'active'
FROM organizations
LIMIT 1
ON CONFLICT (organization_id, environment) DO NOTHING;

INSERT INTO gcp_environment_configs (
    id, organization_id, environment, project_id, region, db_tier, vpc_cidr, waf_enabled, cmek_enabled, wif_pool_id, status
)
SELECT 
    'e282a091-8812-4cf0-9412-817290128372'::uuid,
    id,
    'staging',
    'nexus-erp-staging',
    'us-central1',
    'db-custom-2-7680',
    '10.30.0.0/20',
    true,
    true,
    'projects/109283746501/locations/global/workloadIdentityPools/github-actions-pool',
    'active'
FROM organizations
LIMIT 1
ON CONFLICT (organization_id, environment) DO NOTHING;

INSERT INTO gcp_environment_configs (
    id, organization_id, environment, project_id, region, db_tier, vpc_cidr, waf_enabled, cmek_enabled, wif_pool_id, status
)
SELECT 
    'e382a091-8812-4cf0-9412-817290128373'::uuid,
    id,
    'production',
    'nexus-erp-prod',
    'us-central1',
    'db-custom-4-15360',
    '10.10.0.0/20',
    true,
    true,
    'projects/109283746501/locations/global/workloadIdentityPools/github-actions-pool',
    'active'
FROM organizations
LIMIT 1
ON CONFLICT (organization_id, environment) DO NOTHING;

-- Seed All 13 Infrastructure Services for Production Environment
INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'cloud_run',
    'production-platform-api-gateway',
    'us-central1',
    'healthy',
    NULL,
    true,
    '{"min_instances": 2, "max_instances": 20, "cpu": 2, "memory": "2Gi", "vpc_access": "private_ranges_only"}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'cloud_sql',
    'production-platform-postgres-v15',
    'us-central1',
    'healthy',
    'projects/nexus-erp-prod/locations/us-central1/keyRings/production-platform-keyring/cryptoKeys/production-sql-key',
    true,
    '{"engine": "PostgreSQL 15", "tier": "db-custom-4-15360", "availability": "REGIONAL", "private_ip": true, "public_ipv4": false}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'pubsub',
    'production-platform-events-topic',
    'us-central1',
    'healthy',
    NULL,
    true,
    '{"subscriptions": ["production-platform-events-sub"], "dead_letter_topic": "production-platform-deadletter-topic"}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'cloud_tasks',
    'production-platform-default-queue',
    'us-central1',
    'healthy',
    NULL,
    true,
    '{"max_dispatches_per_sec": 500, "priority_queue": true, "dlq_queue": true}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'cloud_scheduler',
    'production-platform-outbox-cron',
    'us-central1',
    'healthy',
    NULL,
    false,
    '{"schedule": "* * * * *", "auth_mechanism": "oidc_token", "target": "/tasks/outbox-publisher"}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'cloud_storage',
    'nexus-erp-prod-production-tenant-assets',
    'us-central1',
    'healthy',
    'projects/nexus-erp-prod/locations/us-central1/keyRings/production-platform-keyring/cryptoKeys/production-storage-key',
    true,
    '{"ubla": true, "versioning": true, "nearline_days": 90, "coldline_days": 365}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'secret_manager',
    'production-secrets-vault',
    'us-central1',
    'healthy',
    NULL,
    true,
    '{"secrets_count": 10, "accessor_role": "roles/secretmanager.secretAccessor", "zero_plaintext": true}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'cloud_kms',
    'production-platform-keyring',
    'us-central1',
    'healthy',
    NULL,
    true,
    '{"crypto_keys": ["sql-key", "storage-key", "app-data-key"], "rotation_period_days": 90}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'artifact_registry',
    'production-platform',
    'us-central1',
    'healthy',
    NULL,
    true,
    '{"format": "DOCKER", "vulnerability_scanning": true, "cleanup_policy": "keep_10_recent"}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'iam',
    'production-iam-service-identities',
    'global',
    'healthy',
    NULL,
    true,
    '{"service_accounts": ["sa-github-deployer", "sa-platform-runner", "sa-tasks-invoker"], "least_privilege": true}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'networking',
    'production-platform-vpc',
    'us-central1',
    'healthy',
    NULL,
    true,
    '{"vpc_cidr": "10.10.0.0/20", "serverless_connector": "production-vpc-conn", "cloud_nat": true}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'monitoring',
    'production-platform-observability',
    'us-central1',
    'healthy',
    NULL,
    true,
    '{"alerts_count": 3, "dashboard_id": "production-platform-dashboard", "notification_channel": "email"}'::jsonb
FROM organizations LIMIT 1;

INSERT INTO gcp_infrastructure_resources (
    organization_id, environment, service_type, resource_name, gcp_region, status, cmek_key_id, is_ha_enabled, metadata
)
SELECT 
    id,
    'production',
    'cloud_armor',
    'production-cloud-armor-policy',
    'global',
    'healthy',
    NULL,
    true,
    '{"rules": ["sqli-v33", "xss-v33", "lfi-v33", "rce-v33"], "rate_limit": "1000/min", "action": "deny(403)"}'::jsonb
FROM organizations LIMIT 1;

-- Seed Secret Vault Catalog for Third-Party API Keys
INSERT INTO gcp_secret_vault_catalog (organization_id, environment, secret_id, provider_name, referencing_services, version_count)
SELECT 
    id,
    'production',
    'production-stripe-secret-key',
    'stripe',
    '["platform-api-gateway", "platform-worker"]'::jsonb,
    1
FROM organizations LIMIT 1
ON CONFLICT (organization_id, environment, secret_id) DO NOTHING;

INSERT INTO gcp_secret_vault_catalog (organization_id, environment, secret_id, provider_name, referencing_services, version_count)
SELECT 
    id,
    'production',
    'production-razorpay-key-secret',
    'razorpay',
    '["platform-api-gateway"]'::jsonb,
    1
FROM organizations LIMIT 1
ON CONFLICT (organization_id, environment, secret_id) DO NOTHING;

INSERT INTO gcp_secret_vault_catalog (organization_id, environment, secret_id, provider_name, referencing_services, version_count)
SELECT 
    id,
    'production',
    'production-twilio-auth-token',
    'twilio',
    '["platform-api-gateway", "platform-worker"]'::jsonb,
    1
FROM organizations LIMIT 1
ON CONFLICT (organization_id, environment, secret_id) DO NOTHING;

INSERT INTO gcp_secret_vault_catalog (organization_id, environment, secret_id, provider_name, referencing_services, version_count)
SELECT 
    id,
    'production',
    'production-meta-whatsapp-token',
    'meta_whatsapp',
    '["platform-api-gateway", "platform-worker"]'::jsonb,
    1
FROM organizations LIMIT 1
ON CONFLICT (organization_id, environment, secret_id) DO NOTHING;

INSERT INTO gcp_secret_vault_catalog (organization_id, environment, secret_id, provider_name, referencing_services, version_count)
SELECT 
    id,
    'production',
    'production-gemini-api-key',
    'gemini_ai',
    '["platform-api-gateway", "platform-worker"]'::jsonb,
    1
FROM organizations LIMIT 1
ON CONFLICT (organization_id, environment, secret_id) DO NOTHING;

INSERT INTO gcp_secret_vault_catalog (organization_id, environment, secret_id, provider_name, referencing_services, version_count)
SELECT 
    id,
    'production',
    'production-sentry-dsn',
    'sentry',
    '["platform-api-gateway", "platform-web", "platform-worker"]'::jsonb,
    1
FROM organizations LIMIT 1
ON CONFLICT (organization_id, environment, secret_id) DO NOTHING;
