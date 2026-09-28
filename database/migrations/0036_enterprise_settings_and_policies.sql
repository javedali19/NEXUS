-- ============================================================================
-- Migration 0036: Enterprise Settings and Policy Center
-- Multi-tenant settings, RBAC roles, DNC suppression, and data retention schedules
-- ============================================================================

-- 1. Tenant Master Settings and Policies Table
CREATE TABLE IF NOT EXISTS tenant_settings_and_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    organization_profile JSONB NOT NULL DEFAULT '{
        "legal_name": "Acme Global Solutions Pte Ltd",
        "trading_name": "Acme Global Solutions",
        "tax_identifier": "201812345M",
        "tax_authority": "IRAS",
        "domain": "acmeglobal.com",
        "hq_address": "1 Marina Boulevard, #28-00, Marina Bay Financial Centre, Singapore 018989",
        "contact_email": "admin@acmeglobal.com",
        "contact_phone": "+65 6789 0123",
        "base_currency": "SGD",
        "brand_primary_color": "#0ea5e9",
        "brand_dark_mode": true
    }'::jsonb,
    business_units JSONB NOT NULL DEFAULT '[
        {
            "code": "BU-SG-HQ",
            "name": "Singapore APAC Headquarters",
            "region": "Singapore",
            "branch_code": "00000",
            "currency": "SGD",
            "manager_name": "Alex Morgan",
            "manager_email": "alex.morgan@acmeglobal.com",
            "is_default": true,
            "status": "active"
        },
        {
            "code": "BU-MY-OPS",
            "name": "Malaysia Operations Branch",
            "region": "Malaysia",
            "branch_code": "00001",
            "currency": "MYR",
            "manager_name": "Siti Nurhaliza",
            "manager_email": "siti.my@acmeglobal.com",
            "is_default": false,
            "status": "active"
        },
        {
            "code": "BU-TH-RET",
            "name": "Thailand Commercial & Retail",
            "region": "Thailand",
            "branch_code": "00002",
            "currency": "THB",
            "manager_name": "Somchai Prasert",
            "manager_email": "somchai.th@acmeglobal.com",
            "is_default": false,
            "status": "active"
        }
    ]'::jsonb,
    consent_policy JSONB NOT NULL DEFAULT '{
        "gdpr_enabled": true,
        "pdpa_singapore_enabled": true,
        "pdpa_thailand_enabled": true,
        "voice_recording_consent_required": true,
        "whatsapp_opt_in_required": true,
        "sms_mandatory_opt_out_keyword": "STOP",
        "consent_retention_months": 24,
        "require_explicit_dunning_consent": true
    }'::jsonb,
    notification_policy JSONB NOT NULL DEFAULT '{
        "default_email_recipient": "ops-alerts@acmeglobal.com",
        "slack_webhook_configured": true,
        "slack_channel": "#secops-monitoring",
        "sms_urgent_pager_number": "+65 9123 4567",
        "notify_on_payment_failure": true,
        "notify_on_dnc_violation": true,
        "notify_on_sla_breach": true,
        "notify_on_ai_guardrail_trip": true,
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "07:00",
        "quiet_hours_timezone": "Asia/Singapore"
    }'::jsonb,
    security_policy JSONB NOT NULL DEFAULT '{
        "mfa_enforced": true,
        "min_password_length": 14,
        "require_special_characters": true,
        "session_idle_timeout_minutes": 30,
        "max_concurrent_sessions_per_user": 3,
        "ip_whitelisting_enabled": false,
        "allowed_cidr_blocks": ["203.0.113.0/24", "198.51.100.0/24"],
        "sso_provider": "google_identity_platform",
        "sso_enforced": false,
        "saml_entity_id": "urn:acmeglobal:auth:saml2",
        "token_signing_algorithm": "Ed25519",
        "token_expiry_hours": 24
    }'::jsonb,
    audit_policy JSONB NOT NULL DEFAULT '{
        "immutable_append_only": true,
        "sha256_hash_chaining": true,
        "log_level": "INFO",
        "tamper_detection_enabled": true,
        "siem_syslog_forwarding_enabled": false,
        "siem_endpoint": "syslog.corp.acmeglobal.com:6514",
        "alert_on_bulk_export": true
    }'::jsonb,
    retention_policy JSONB NOT NULL DEFAULT '{
        "tax_invoices_retention_years": 7,
        "payments_retention_years": 7,
        "call_recordings_retention_days": 90,
        "ai_transcripts_retention_days": 180,
        "support_tickets_retention_years": 3,
        "audit_logs_retention_years": 7,
        "auto_purge_action": "cold_archive",
        "legal_hold_active": false
    }'::jsonb,
    dnc_policy JSONB NOT NULL DEFAULT '{
        "enforce_singapore_pdpc_dnc": true,
        "enforce_malaysia_mcmc_dnc": true,
        "enforce_thailand_nbtc_dnc": true,
        "cooling_off_period_days": 30,
        "hard_block_telephony_on_dnc": true,
        "allow_agent_override": false,
        "opt_out_keywords": ["STOP", "BATAL", "ยกเลิก", "UNSUBSCRIBE"]
    }'::jsonb,
    regional_policy JSONB NOT NULL DEFAULT '{
        "default_country_pack": "SG",
        "available_country_packs": ["SG", "MY", "TH"],
        "base_reporting_currency": "SGD",
        "calendar_system": "gregorian",
        "date_format": "YYYY-MM-DD",
        "time_format": "24h",
        "number_format": "en-SG"
    }'::jsonb,
    ai_policy JSONB NOT NULL DEFAULT '{
        "allowed_models": ["claude-3-5-sonnet", "gemini-1-5-pro", "gpt-4o"],
        "max_temperature_cap": 0.5,
        "pii_redactor_enabled": true,
        "redact_credit_cards": true,
        "redact_nric_and_tin": true,
        "prompt_injection_defense": true,
        "adversarial_score_threshold": 0.85,
        "escalate_on_sentiment_threshold": -0.65,
        "escalate_on_dispute_amount_threshold": 2500.0,
        "prohibit_executive_deepfakes": true
    }'::jsonb,
    workflow_policy JSONB NOT NULL DEFAULT '{
        "max_concurrent_executions": 500,
        "step_timeout_seconds": 300,
        "max_retries": 5,
        "retry_backoff_base_seconds": 2,
        "circuit_breaker_error_threshold_percent": 15,
        "emergency_killswitch_active": false,
        "auto_route_failed_to_exceptions": true
    }'::jsonb,
    billing_metadata JSONB NOT NULL DEFAULT '{
        "plan_tier": "enterprise_sea_unlimited",
        "plan_name": "Enterprise SEA Unlimited",
        "billing_cycle": "annual",
        "current_period_start": "2026-01-01T00:00:00Z",
        "current_period_end": "2027-01-01T00:00:00Z",
        "payment_method": "DBS Corporate Direct Debit (FAST)",
        "payment_method_last4": "4242",
        "billing_email": "finance@acmeglobal.com",
        "vat_reverse_charge_applicable": false,
        "metered_usage": {
            "ai_inference_tokens": { "used": 14250000, "limit": 50000000, "unit": "tokens" },
            "voice_telephony_minutes": { "used": 8450, "limit": 25000, "unit": "minutes" },
            "whatsapp_conversations": { "used": 4320, "limit": 10000, "unit": "sessions" },
            "document_ocr_pages": { "used": 1890, "limit": 5000, "unit": "pages" }
        }
    }'::jsonb,
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for tenant_settings_and_policies
ALTER TABLE tenant_settings_and_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings_and_policies FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_settings_and_policies ON tenant_settings_and_policies
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE INDEX IF NOT EXISTS idx_tenant_settings_org ON tenant_settings_and_policies(organization_id);

-- 2. Tenant Custom Roles and RBAC Capabilities
CREATE TABLE IF NOT EXISTS tenant_custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_key VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, role_key)
);

ALTER TABLE tenant_custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_custom_roles FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_custom_roles ON tenant_custom_roles
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE INDEX IF NOT EXISTS idx_tenant_roles_org_key ON tenant_custom_roles(organization_id, role_key);

-- 3. Tenant DNC Suppression List (Real-time Blacklist & Regulatory Opt-Outs)
CREATE TABLE IF NOT EXISTS tenant_dnc_suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    phone_e164 VARCHAR(32) NOT NULL,
    country_code VARCHAR(8) NOT NULL DEFAULT 'SG',
    source VARCHAR(64) NOT NULL DEFAULT 'customer_opt_out', -- 'customer_opt_out', 'national_registry_sg', 'national_registry_my', 'national_registry_th', 'manual_admin'
    reason VARCHAR(255) NOT NULL DEFAULT 'Customer requested opt-out',
    opted_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL = permanent
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, phone_e164)
);

ALTER TABLE tenant_dnc_suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_dnc_suppression_list FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_dnc_suppression ON tenant_dnc_suppression_list
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE INDEX IF NOT EXISTS idx_dnc_suppression_lookup ON tenant_dnc_suppression_list(organization_id, phone_e164) WHERE is_active = true;

-- 4. Tenant Retention Schedules (Statutory and Enterprise Data Lifecycles)
CREATE TABLE IF NOT EXISTS tenant_retention_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(64) NOT NULL, -- 'invoices', 'payments', 'call_recordings', 'ai_transcripts', 'support_tickets', 'audit_logs'
    retention_days INT NOT NULL,
    purge_action VARCHAR(32) NOT NULL DEFAULT 'cold_archive', -- 'cold_archive', 'soft_delete', 'hard_purge'
    legal_hold BOOLEAN NOT NULL DEFAULT false,
    statutory_basis VARCHAR(128) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, entity_type)
);

ALTER TABLE tenant_retention_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_retention_schedules FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_retention_schedules ON tenant_retention_schedules
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE INDEX IF NOT EXISTS idx_retention_schedules_org ON tenant_retention_schedules(organization_id, entity_type);
