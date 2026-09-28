-- ============================================================================
-- Migration 0015: Meta WhatsApp Business Platform Integration
-- Enterprise WhatsApp Cloud API v20.0+, HSM Templates, Inbound/Outbound Messages,
-- Delivery/Read Telemetry, 24-hr Service Window, and Opt-In Consent Tracking
-- ============================================================================

-- 1. WhatsApp Configuration & WABA Account Bindings
CREATE TABLE IF NOT EXISTS whatsapp_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    business_unit_id UUID,
    waba_id VARCHAR(64) NOT NULL,
    phone_number_id VARCHAR(64) NOT NULL,
    display_phone_number VARCHAR(32) NOT NULL,
    verified_name VARCHAR(255),
    quality_rating VARCHAR(32) NOT NULL DEFAULT 'GREEN', -- GREEN, YELLOW, RED, UNKNOWN
    access_token_secret_ref VARCHAR(255) NOT NULL, -- Google Secret Manager Resource Path
    app_secret_ref VARCHAR(255) NOT NULL,          -- Google Secret Manager Resource Path
    webhook_verify_token VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'validating', -- unvalidated, validating, operational, degraded, suspended
    last_validated_at TIMESTAMPTZ,
    last_error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_whatsapp_phone_number UNIQUE (organization_id, phone_number_id)
);

-- 2. HSM Approved Templates Catalog
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    template_name VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'UTILITY', -- MARKETING, UTILITY, AUTHENTICATION
    language_code VARCHAR(16) NOT NULL DEFAULT 'en_US',
    header_type VARCHAR(32), -- TEXT, IMAGE, DOCUMENT, VIDEO, NONE
    header_content TEXT,
    body_text TEXT NOT NULL,
    footer_text TEXT,
    buttons JSONB DEFAULT '[]'::jsonb, -- Quick reply, URL, Phone CTA buttons
    variable_count INT NOT NULL DEFAULT 0,
    variable_definitions JSONB DEFAULT '[]'::jsonb,
    meta_status VARCHAR(32) NOT NULL DEFAULT 'APPROVED', -- APPROVED, PENDING, REJECTED, PAUSED
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_whatsapp_template_name UNIQUE (organization_id, template_name, language_code)
);

-- 3. WhatsApp Conversations (with 24-hr Service Window Tracking)
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    customer_id UUID,
    contact_id UUID,
    customer_phone VARCHAR(32) NOT NULL, -- E.164 formatted (+15551234567)
    display_name VARCHAR(255),
    window_expires_at TIMESTAMPTZ,       -- 24-hr service window end timestamp
    is_window_active BOOLEAN NOT NULL DEFAULT false,
    unread_count INT NOT NULL DEFAULT 0,
    last_message_preview TEXT,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_direction VARCHAR(16) NOT NULL DEFAULT 'inbound', -- inbound, outbound
    assigned_agent_id UUID,
    ai_copilot_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_whatsapp_customer_conv UNIQUE (organization_id, customer_phone)
);

-- 4. WhatsApp Messages (Inbound, Outbound, Media, Delivery Telemetry)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    wamid VARCHAR(128) NOT NULL,          -- Meta WhatsApp Message ID (e.g. wamid.HBgLMTU1N...)
    direction VARCHAR(16) NOT NULL,       -- inbound, outbound
    message_type VARCHAR(32) NOT NULL,    -- text, image, document, audio, video, template, interactive, location
    status VARCHAR(32) NOT NULL DEFAULT 'sent', -- pending, sent, delivered, read, failed
    body_text TEXT,
    media_id VARCHAR(128),
    media_url TEXT,
    media_mime_type VARCHAR(128),
    media_filename VARCHAR(255),
    template_name VARCHAR(128),
    template_params JSONB,
    interactive_response JSONB,
    error_code VARCHAR(64),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    correlation_id VARCHAR(128),
    causation_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_whatsapp_wamid UNIQUE (organization_id, wamid)
);

-- 5. WhatsApp Contact Consent & Opt-In Compliance Ledger
CREATE TABLE IF NOT EXISTS whatsapp_contacts_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    phone_number VARCHAR(32) NOT NULL,    -- E.164 format
    customer_id UUID,
    consent_status VARCHAR(32) NOT NULL DEFAULT 'OPTED_IN', -- OPTED_IN, OPTED_OUT, PENDING
    opt_in_source VARCHAR(64) NOT NULL DEFAULT 'web_form',  -- web_form, invoice_checkout, crm_agreement, inbound_keyword
    proof_of_consent TEXT,
    opted_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    opted_out_at TIMESTAMPTZ,
    opt_out_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_whatsapp_phone_consent UNIQUE (organization_id, phone_number)
);

-- 6. Raw Webhook Events Ledger for Deduplication & Audit
CREATE TABLE IF NOT EXISTS whatsapp_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payload_hash VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    raw_payload JSONB NOT NULL,
    signature VARCHAR(128),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    processing_status VARCHAR(32) NOT NULL DEFAULT 'processed', -- received, processed, failed, ignored
    error_details TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-throughput messaging & telemetry lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_org_phone ON whatsapp_conversations(organization_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_conv_created ON whatsapp_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_wamid ON whatsapp_messages(wamid);
CREATE INDEX IF NOT EXISTS idx_whatsapp_consent_phone ON whatsapp_contacts_consent(organization_id, phone_number);

-- Enable Row-Level Security (RLS)
ALTER TABLE whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY whatsapp_configs_tenant_isolation ON whatsapp_configs
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY whatsapp_templates_tenant_isolation ON whatsapp_templates
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY whatsapp_conversations_tenant_isolation ON whatsapp_conversations
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY whatsapp_messages_tenant_isolation ON whatsapp_messages
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY whatsapp_consent_tenant_isolation ON whatsapp_contacts_consent
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY whatsapp_webhooks_tenant_isolation ON whatsapp_webhook_events
    USING (organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
