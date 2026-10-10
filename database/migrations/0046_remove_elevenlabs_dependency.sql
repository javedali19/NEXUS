-- ============================================================================
-- Migration 0046: Remove ElevenLabs Dependency & Stabilize Voice Pipeline
-- ============================================================================

-- 1. Voice Agent Configs: Neutralize TTS Provider default & relax provider-specific columns
ALTER TABLE voice_agent_configs 
    ALTER COLUMN tts_provider SET DEFAULT 'disabled',
    ALTER COLUMN elevenlabs_voice_id DROP NOT NULL,
    ALTER COLUMN elevenlabs_voice_id SET DEFAULT NULL,
    ALTER COLUMN elevenlabs_model_id DROP NOT NULL,
    ALTER COLUMN elevenlabs_model_id SET DEFAULT NULL,
    ALTER COLUMN elevenlabs_stability DROP NOT NULL,
    ALTER COLUMN elevenlabs_similarity_boost DROP NOT NULL;

-- 2. Voice Agent Pipelines: Relax elevenlabs_stream_id
ALTER TABLE voice_agent_pipelines 
    ALTER COLUMN elevenlabs_stream_id DROP NOT NULL;

-- 3. Voice Agent Turns: Add provider-neutral latency and audio byte columns if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'voice_agent_turns' AND column_name = 'tts_latency_ms'
    ) THEN
        ALTER TABLE voice_agent_turns ADD COLUMN tts_latency_ms INT NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'voice_agent_turns' AND column_name = 'audio_bytes'
    ) THEN
        ALTER TABLE voice_agent_turns ADD COLUMN audio_bytes INT NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 4. Purge ElevenLabs Provider Credentials from voice_provider_credentials
DELETE FROM voice_provider_credentials WHERE provider = 'elevenlabs';

-- 5. Purge ElevenLabs Provider Telemetry from audit tables if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'audit_provider_probes'
    ) THEN
        DELETE FROM audit_provider_probes WHERE provider_name = 'elevenlabs';
    END IF;
END $$;
