-- ============================================================================
-- Migration 0029: AI Voice-Agent Integration (Telephony -> STT -> LLM -> ElevenLabs -> Telephony)
-- ============================================================================

-- 1. Voice Agent Tenant Configurations & Quad-Gate State
CREATE TABLE IF NOT EXISTS voice_agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_name VARCHAR(150) NOT NULL DEFAULT 'Nexus AI Voice Agent',
    telephony_provider VARCHAR(50) NOT NULL DEFAULT 'twilio',
    stt_provider VARCHAR(50) NOT NULL DEFAULT 'deepgram',
    stt_model VARCHAR(50) NOT NULL DEFAULT 'nova-2',
    ai_reasoning_provider VARCHAR(50) NOT NULL DEFAULT 'openai', -- openai, gemini, anthropic
    ai_model_name VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
    tts_provider VARCHAR(50) NOT NULL DEFAULT 'elevenlabs',
    elevenlabs_voice_id VARCHAR(100) NOT NULL DEFAULT '21m00Tcm4TlvDq8ikWAM', -- Rachel default
    elevenlabs_model_id VARCHAR(100) NOT NULL DEFAULT 'eleven_turbo_v2_5',
    elevenlabs_stability NUMERIC(3,2) NOT NULL DEFAULT 0.50,
    elevenlabs_similarity_boost NUMERIC(3,2) NOT NULL DEFAULT 0.75,
    latency_optimization_tier VARCHAR(50) NOT NULL DEFAULT 'ultra_low_latency',
    -- Quad-Gate States:
    telephony_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured', -- unconfigured, validated, failed
    stt_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured',
    ai_provider_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured',
    tts_status VARCHAR(50) NOT NULL DEFAULT 'unconfigured',
    policy_checks_passed BOOLEAN NOT NULL DEFAULT false,
    is_live_calling_authorized BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_voice_agent_config UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_voice_agent_configs_auth 
    ON voice_agent_configs(organization_id, is_live_calling_authorized);

-- 2. Voice Agent Full-Duplex Pipeline Sessions
CREATE TABLE IF NOT EXISTS voice_agent_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES telephony_calls(id) ON DELETE CASCADE,
    pipeline_session_id VARCHAR(150) NOT NULL,
    twilio_stream_sid VARCHAR(100) NULL,
    deepgram_connection_id VARCHAR(100) NULL,
    elevenlabs_stream_id VARCHAR(100) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- connecting, active, paused, closed
    total_turns_count INT NOT NULL DEFAULT 0,
    avg_turn_latency_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_voice_pipelines_call 
    ON voice_agent_pipelines(organization_id, call_id);

-- 3. Turn-by-Turn Telemetry & Latency Waterfall
CREATE TABLE IF NOT EXISTS voice_agent_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pipeline_id UUID NOT NULL REFERENCES voice_agent_pipelines(id) ON DELETE CASCADE,
    turn_index INT NOT NULL,
    customer_speech_text TEXT NOT NULL,
    ai_response_text TEXT NOT NULL,
    stt_latency_ms INT NOT NULL DEFAULT 0,
    llm_reasoning_latency_ms INT NOT NULL DEFAULT 0,
    elevenlabs_tts_latency_ms INT NOT NULL DEFAULT 0,
    total_roundtrip_latency_ms INT NOT NULL DEFAULT 0,
    elevenlabs_audio_bytes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_turns_pipeline 
    ON voice_agent_turns(organization_id, pipeline_id, turn_index);

-- 4. Google Secret Manager Provider Credential References
CREATE TABLE IF NOT EXISTS voice_provider_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- elevenlabs, deepgram, twilio, openai
    secret_manager_ref VARCHAR(255) NOT NULL, -- e.g. 'gsm://elevenlabs-api-key'
    is_validated BOOLEAN NOT NULL DEFAULT false,
    last_validated_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_voice_provider_cred UNIQUE(organization_id, provider)
);

-- 5. Row-Level Security Policies (Tenant Isolation)
ALTER TABLE voice_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_agent_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_agent_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_provider_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY voice_agent_configs_tenant_isolation ON voice_agent_configs
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY voice_agent_pipelines_tenant_isolation ON voice_agent_pipelines
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY voice_agent_turns_tenant_isolation ON voice_agent_turns
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY voice_provider_credentials_tenant_isolation ON voice_provider_credentials
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
