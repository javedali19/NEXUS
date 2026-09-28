-- Migration: 0041_cicd_deployment_telemetry.sql
-- Description: CI/CD Pipeline Runs, 10-Domain Validation Gates, GCP Workload Identity Federation Telemetry, and Deployments

-- 1. CI/CD Pipeline Runs
CREATE TABLE IF NOT EXISTS cicd_pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    run_number INT NOT NULL,
    pipeline_type VARCHAR(32) NOT NULL, -- 'ci', 'cd'
    status VARCHAR(32) NOT NULL, -- 'queued', 'in_progress', 'passed', 'failed', 'cancelled'
    branch VARCHAR(128) NOT NULL DEFAULT 'main',
    commit_sha VARCHAR(64) NOT NULL,
    commit_message TEXT,
    trigger_event VARCHAR(64) NOT NULL DEFAULT 'push', -- 'push', 'pull_request', 'workflow_dispatch'
    triggered_by VARCHAR(128) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    gates_total INT NOT NULL DEFAULT 10,
    gates_passed INT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cicd_runs_org_status ON cicd_pipeline_runs(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cicd_runs_commit ON cicd_pipeline_runs(commit_sha);

-- 2. 10 Validation Gates per Pipeline Run
CREATE TABLE IF NOT EXISTS cicd_validation_gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_run_id UUID NOT NULL REFERENCES cicd_pipeline_runs(id) ON DELETE CASCADE,
    gate_name VARCHAR(64) NOT NULL, -- 'frontend_build', 'typescript', 'lint', 'rust', 'tests', 'migrations', 'security', 'vulnerabilities', 'containers', 'terraform'
    display_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'pending', 'running', 'passed', 'failed', 'skipped'
    duration_seconds INT NOT NULL DEFAULT 0,
    error_log TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_run_gate UNIQUE (pipeline_run_id, gate_name)
);

CREATE INDEX IF NOT EXISTS idx_validation_gates_run ON cicd_validation_gates(pipeline_run_id, status);

-- 3. GCP Workload Identity Federation Deployments
CREATE TABLE IF NOT EXISTS cicd_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_run_id UUID REFERENCES cicd_pipeline_runs(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service_name VARCHAR(64) NOT NULL, -- 'platform-web', 'platform-api-gateway', 'platform-worker'
    gcp_region VARCHAR(64) NOT NULL DEFAULT 'us-central1',
    image_tag VARCHAR(128) NOT NULL,
    image_digest VARCHAR(256),
    workload_identity_pool VARCHAR(256) NOT NULL,
    workload_identity_provider VARCHAR(256) NOT NULL,
    service_account_email VARCHAR(256) NOT NULL,
    auth_mechanism VARCHAR(32) NOT NULL DEFAULT 'wif_oidc',
    status VARCHAR(32) NOT NULL, -- 'deploying', 'healthy', 'failed', 'rolled_back'
    traffic_percent INT NOT NULL DEFAULT 100,
    endpoint_url TEXT,
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cicd_deployments_org_service ON cicd_deployments(organization_id, service_name, deployed_at DESC);

-- Seed Initial Pipeline Run and 10 Gates for Active Organization
INSERT INTO cicd_pipeline_runs (
    id, organization_id, run_number, pipeline_type, status, branch, commit_sha, commit_message, trigger_event, triggered_by, duration_seconds, gates_total, gates_passed, completed_at
)
SELECT 
    'd8a221f0-7988-4c90-9519-21a48c4078a1'::uuid,
    id,
    148,
    'ci',
    'passed',
    'main',
    '8f32acb9e110294b8e2190f845a7c293b6e82a91',
    'feat(cicd): enforce GCP Workload Identity Federation and 10-domain verification gates',
    'push',
    'platform-architect@nexus-erp.com',
    214,
    10,
    10,
    NOW()
FROM organizations
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Seed 10 Validation Gates
INSERT INTO cicd_validation_gates (pipeline_run_id, gate_name, display_name, status, duration_seconds, details)
VALUES
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'frontend_build', '1. Frontend Build', 'passed', 32, '{"engine": "nextjs 15.1.0", "output": "standalone", "bundle_size_kb": 2420}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'typescript', '2. TypeScript Strict Check', 'passed', 18, '{"tsc_version": "5.7.0", "diagnostics": 0, "strict": true}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'lint', '3. Code Quality & Linting', 'passed', 14, '{"eslint_passed": true, "prettier_passed": true, "rustfmt_passed": true}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'rust', '4. Rust Cargo Check & Clippy', 'passed', 42, '{"rustc_version": "1.80.0", "targets_checked": 24, "clippy_warnings_denied": 0}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'tests', '5. Automated Test Suites', 'passed', 36, '{"rust_tests_passed": 142, "frontend_tests_passed": 58, "failures": 0}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'migrations', '6. Database Migrations Verification', 'passed', 12, '{"total_migrations_verified": 41, "dry_run_status": "applied_cleanly"}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'security', '7. Security & Zero Keys Gate', 'passed', 15, '{"secret_scanner": "gitleaks", "long_lived_gcp_keys_found": 0, "policy": "workload_identity_federation_enforced"}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'vulnerabilities', '8. Dependency Vulnerabilities Audit', 'passed', 16, '{"npm_audit_critical": 0, "cargo_audit_vulnerabilities": 0}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'containers', '9. Container Multi-Stage Builds', 'passed', 44, '{"images_built": ["apps/web/Dockerfile", "backend/Dockerfile"], "builder": "buildx"}'::jsonb),
    ('d8a221f0-7988-4c90-9519-21a48c4078a1'::uuid, 'terraform', '10. Terraform Validation & Security', 'passed', 11, '{"terraform_fmt": "clean", "terraform_validate": "success", "wif_resources_checked": true}'::jsonb)
ON CONFLICT (pipeline_run_id, gate_name) DO NOTHING;

-- Seed Active Cloud Run Deployments via WIF
INSERT INTO cicd_deployments (
    id, pipeline_run_id, organization_id, service_name, gcp_region, image_tag, workload_identity_pool, workload_identity_provider, service_account_email, auth_mechanism, status, traffic_percent, endpoint_url
)
SELECT 
    'f192b034-7221-4770-bc29-450a80e4612d'::uuid,
    'd8a221f0-7988-4c90-9519-21a48c4078a1'::uuid,
    id,
    'platform-api-gateway',
    'us-central1',
    '8f32acb9e110294b8e2190f845a7c293b6e82a91',
    'projects/109283746501/locations/global/workloadIdentityPools/github-actions-pool',
    'projects/109283746501/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider',
    'sa-github-deployer@nexus-erp-prod.iam.gserviceaccount.com',
    'wif_oidc',
    'healthy',
    100,
    'https://platform-api-gateway-us-central1.run.app'
FROM organizations
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO cicd_deployments (
    id, pipeline_run_id, organization_id, service_name, gcp_region, image_tag, workload_identity_pool, workload_identity_provider, service_account_email, auth_mechanism, status, traffic_percent, endpoint_url
)
SELECT 
    'c294b150-1928-4ba2-8012-740e51b32941'::uuid,
    'd8a221f0-7988-4c90-9519-21a48c4078a1'::uuid,
    id,
    'platform-web',
    'us-central1',
    '8f32acb9e110294b8e2190f845a7c293b6e82a91',
    'projects/109283746501/locations/global/workloadIdentityPools/github-actions-pool',
    'projects/109283746501/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider',
    'sa-github-deployer@nexus-erp-prod.iam.gserviceaccount.com',
    'wif_oidc',
    'healthy',
    100,
    'https://platform-web-us-central1.run.app'
FROM organizations
LIMIT 1
ON CONFLICT (id) DO NOTHING;
