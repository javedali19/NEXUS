-- ============================================================================
-- Migration 0028: AI Voice & Telephony Foundation (Twilio Provider Standard)
-- ============================================================================

-- 1. Organization Telephony Configuration
CREATE TABLE IF NOT EXISTS telephony_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'twilio',
    account_sid VARCHAR(100) NULL,
    auth_token_secret_ref VARCHAR(255) NULL,
    primary_phone_number VARCHAR(50) NULL,
    health_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured', -- unconfigured, healthy, error
    last_tested_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_telephony_config UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_telephony_configs_status 
    ON telephony_configs(organization_id, health_status);

-- 2. Telephony Routing Queues
CREATE TABLE IF NOT EXISTS telephony_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    routing_strategy VARCHAR(50) NOT NULL DEFAULT 'skills_based', -- round_robin, skills_based, longest_idle
    max_queue_size INT NOT NULL DEFAULT 50,
    max_wait_seconds INT NOT NULL DEFAULT 300,
    hold_music_url VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_telephony_queue_slug UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_telephony_queues_active 
    ON telephony_queues(organization_id, is_active);

-- 3. Provisioned Phone Numbers Catalog
CREATE TABLE IF NOT EXISTS telephony_phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL, -- E.164
    friendly_name VARCHAR(150) NOT NULL,
    country_code VARCHAR(10) NOT NULL DEFAULT 'US',
    provider VARCHAR(50) NOT NULL DEFAULT 'twilio',
    capabilities JSONB NOT NULL DEFAULT '["voice", "sms"]'::jsonb,
    assigned_queue_id UUID NULL REFERENCES telephony_queues(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, released, suspended
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_telephony_number UNIQUE(organization_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_telephony_numbers_status 
    ON telephony_phone_numbers(organization_id, status);

-- 4. Master Calls Ledger
CREATE TABLE IF NOT EXISTS telephony_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider_call_sid VARCHAR(100) NULL, -- Twilio Call SID 'CA...'
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    queue_id UUID NULL REFERENCES telephony_queues(id) ON DELETE SET NULL,
    customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
    purpose VARCHAR(100) NOT NULL DEFAULT 'inbound_lead_qualification', 
    -- collections_dunning, inbound_lead_qualification, contract_renewal, customer_support_dispute, onboarding_kickoff
    status VARCHAR(50) NOT NULL DEFAULT 'queued', 
    -- queued, ringing, in_progress, completed, busy, no_answer, failed, canceled
    outcome VARCHAR(100) NULL, 
    -- promise_to_pay_secured, qualified_opportunity_created, callback_scheduled, voicemail_left, wrong_number, dispute_ticket_opened, transferred_to_human_agent
    duration_seconds INT NOT NULL DEFAULT 0,
    cost_usd NUMERIC(8,4) NOT NULL DEFAULT 0.0000,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telephony_calls_tenant_status 
    ON telephony_calls(organization_id, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_customer 
    ON telephony_calls(organization_id, customer_id);

-- 5. Active Media Sessions & WebRTC Streaming
CREATE TABLE IF NOT EXISTS telephony_call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES telephony_calls(id) ON DELETE CASCADE,
    session_token VARCHAR(150) NOT NULL,
    media_stream_url VARCHAR(255) NULL,
    audio_codec VARCHAR(50) NOT NULL DEFAULT 'PCMU',
    latency_ms INT NOT NULL DEFAULT 0,
    stream_status VARCHAR(50) NOT NULL DEFAULT 'streaming', -- connecting, streaming, paused, closed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telephony_sessions_call 
    ON telephony_call_sessions(organization_id, call_id);

-- 6. Encrypted Call Recordings Reference
CREATE TABLE IF NOT EXISTS telephony_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES telephony_calls(id) ON DELETE CASCADE,
    provider_recording_sid VARCHAR(100) NULL, -- Twilio Recording SID 'RE...'
    storage_uri VARCHAR(255) NOT NULL, -- GCS URI 'gs://...'
    duration_seconds INT NOT NULL DEFAULT 0,
    media_format VARCHAR(20) NOT NULL DEFAULT 'audio/wav',
    is_encrypted BOOLEAN NOT NULL DEFAULT true,
    retention_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telephony_recordings_call 
    ON telephony_recordings(organization_id, call_id);

-- 7. Speaker-Diarized Transcripts
CREATE TABLE IF NOT EXISTS telephony_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES telephony_calls(id) ON DELETE CASCADE,
    speaker VARCHAR(20) NOT NULL, -- agent, customer
    turn_index INT NOT NULL,
    start_ms INT NOT NULL,
    end_ms INT NOT NULL,
    text TEXT NOT NULL,
    confidence NUMERIC(4,3) NOT NULL DEFAULT 0.950,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telephony_transcripts_call 
    ON telephony_transcripts(organization_id, call_id, turn_index);

-- 8. AI Summaries & Sentiment Scoring
CREATE TABLE IF NOT EXISTS telephony_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES telephony_calls(id) ON DELETE CASCADE,
    executive_summary TEXT NOT NULL,
    sentiment_score NUMERIC(3,2) NOT NULL DEFAULT 0.00, -- -1.00 (Frustrated) to +1.00 (Delighted)
    action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    buying_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    churn_risk_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_telephony_summary UNIQUE(call_id)
);

CREATE INDEX IF NOT EXISTS idx_telephony_summaries_sentiment 
    ON telephony_summaries(organization_id, sentiment_score);

-- 9. Voice Call Consent & DNC Verification
CREATE TABLE IF NOT EXISTS telephony_consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES telephony_calls(id) ON DELETE CASCADE,
    recipient_phone VARCHAR(50) NOT NULL,
    consent_disclosure_played BOOLEAN NOT NULL DEFAULT true,
    recording_consent_granted BOOLEAN NOT NULL DEFAULT true,
    dnc_verified BOOLEAN NOT NULL DEFAULT true,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telephony_consent_phone 
    ON telephony_consent_records(organization_id, recipient_phone);

-- 10. Legal Calling Windows (TCPA Compliance)
CREATE TABLE IF NOT EXISTS telephony_calling_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    country_code VARCHAR(10) NOT NULL DEFAULT 'US',
    state_code VARCHAR(10) NULL,
    start_hour_local INT NOT NULL DEFAULT 8,  -- 08:00 AM
    end_hour_local INT NOT NULL DEFAULT 21,   -- 09:00 PM
    allow_weekends BOOLEAN NOT NULL DEFAULT false,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Supervisor Escalation & Warm Transfer
CREATE TABLE IF NOT EXISTS telephony_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES telephony_calls(id) ON DELETE CASCADE,
    trigger_reason VARCHAR(100) NOT NULL, -- explicit_customer_request, sentiment_threshold, high_value_deal, complex_dispute
    priority VARCHAR(50) NOT NULL DEFAULT 'high', -- standard, high, urgent
    target_queue_id UUID NULL REFERENCES telephony_queues(id) ON DELETE SET NULL,
    assigned_supervisor_name VARCHAR(150) NULL,
    handoff_packet JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, completed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telephony_escalations_status 
    ON telephony_escalations(organization_id, status, priority);

-- 12. Row-Level Security Policies
ALTER TABLE telephony_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_calling_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY telephony_configs_tenant_isolation ON telephony_configs
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_queues_tenant_isolation ON telephony_queues
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_phone_numbers_tenant_isolation ON telephony_phone_numbers
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_calls_tenant_isolation ON telephony_calls
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_call_sessions_tenant_isolation ON telephony_call_sessions
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_recordings_tenant_isolation ON telephony_recordings
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_transcripts_tenant_isolation ON telephony_transcripts
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_summaries_tenant_isolation ON telephony_summaries
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_consent_records_tenant_isolation ON telephony_consent_records
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_calling_windows_tenant_isolation ON telephony_calling_windows
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY telephony_escalations_tenant_isolation ON telephony_escalations
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
