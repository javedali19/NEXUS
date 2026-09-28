-- ============================================================================
-- Migration 0016: Unified Omnichannel Inbox & Customer Conversations Engine
-- Multi-channel thread consolidation (WhatsApp, Email, SMS, Voice, Support, AI)
-- ============================================================================

-- 1. Omnichannel Conversation Threads
CREATE TABLE IF NOT EXISTS omnichannel_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    business_unit_id UUID,
    customer_id UUID,
    contact_id UUID,
    primary_channel VARCHAR(32) NOT NULL DEFAULT 'whatsapp', -- whatsapp, email, sms, voice, support, ai_chat
    title VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'open', -- open, pending, resolved, closed
    priority VARCHAR(16) NOT NULL DEFAULT 'medium', -- urgent, high, medium, low
    assigned_agent_id UUID,
    assigned_team_id UUID,
    sla_due_at TIMESTAMPTZ,
    is_sla_breached BOOLEAN NOT NULL DEFAULT false,
    sentiment_score NUMERIC(3, 2) DEFAULT 0.00, -- -1.00 (Extremely Negative) to +1.00 (Extremely Positive)
    ai_summary TEXT,
    ai_intent VARCHAR(64),
    unread_count INT NOT NULL DEFAULT 0,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_preview TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Omnichannel Messages & Timeline Activities
CREATE TABLE IF NOT EXISTS omnichannel_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    thread_id UUID NOT NULL REFERENCES omnichannel_threads(id) ON DELETE CASCADE,
    channel VARCHAR(32) NOT NULL, -- whatsapp, email, sms, voice, support, internal_note
    direction VARCHAR(16) NOT NULL, -- inbound, outbound
    sender_type VARCHAR(32) NOT NULL DEFAULT 'customer', -- customer, agent, ai_copilot, system
    sender_id UUID,
    sender_name VARCHAR(255),
    is_internal_note BOOLEAN NOT NULL DEFAULT false,
    subject VARCHAR(255),
    body_text TEXT NOT NULL,
    body_html TEXT,
    media_attachments JSONB DEFAULT '[]'::jsonb, -- Array of { filename, url, mime_type, size_bytes }
    channel_metadata JSONB DEFAULT '{}'::jsonb, -- e.g. wamid, email message-id, call duration, audio_url
    delivery_status VARCHAR(32) NOT NULL DEFAULT 'sent', -- pending, sent, delivered, read, failed
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    correlation_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Dynamic Classification Tags
CREATE TABLE IF NOT EXISTS omnichannel_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(64) NOT NULL,
    color_hex VARCHAR(16) NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_omnichannel_tag_name UNIQUE (organization_id, name)
);

-- 4. Thread Tag Associations
CREATE TABLE IF NOT EXISTS omnichannel_thread_tags (
    thread_id UUID NOT NULL REFERENCES omnichannel_threads(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES omnichannel_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, tag_id)
);

-- Indexes for high-performance inbox filtering & timeline ordering
CREATE INDEX IF NOT EXISTS idx_omni_threads_org_status ON omnichannel_threads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_omni_threads_org_channel ON omnichannel_threads(organization_id, primary_channel);
CREATE INDEX IF NOT EXISTS idx_omni_threads_customer ON omnichannel_threads(customer_id);
CREATE INDEX IF NOT EXISTS idx_omni_messages_thread_created ON omnichannel_messages(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_omni_messages_org_created ON omnichannel_messages(organization_id, created_at DESC);

-- Enable Row-Level Security (RLS)
ALTER TABLE omnichannel_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE omnichannel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE omnichannel_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE omnichannel_thread_tags ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY omnichannel_threads_tenant_isolation ON omnichannel_threads
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY omnichannel_messages_tenant_isolation ON omnichannel_messages
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY omnichannel_tags_tenant_isolation ON omnichannel_tags
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY omnichannel_thread_tags_tenant_isolation ON omnichannel_thread_tags
    USING (EXISTS (
        SELECT 1 FROM omnichannel_threads t
        WHERE t.id = omnichannel_thread_tags.thread_id
        AND t.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
    ));
