-- ============================================================================
-- Migration 0047: Remove Twilio Dependency & Transition to Provider-Neutral Telephony
-- ============================================================================

-- 1. Telephony Configs: Convert default provider from 'twilio' to 'provider_neutral'
ALTER TABLE telephony_configs 
    ALTER COLUMN provider SET DEFAULT 'provider_neutral';

UPDATE telephony_configs 
SET provider = 'provider_neutral' 
WHERE provider = 'twilio';

-- 2. Telephony Provisioned Numbers: Remove 'twilio' default
ALTER TABLE telephony_phone_numbers 
    ALTER COLUMN provider SET DEFAULT 'provider_neutral';

UPDATE telephony_phone_numbers 
SET provider = 'provider_neutral' 
WHERE provider = 'twilio';

-- 3. Voice Agent Configurations: Remove 'twilio' default in telephony_provider
ALTER TABLE voice_agent_configs 
    ALTER COLUMN telephony_provider SET DEFAULT 'provider_neutral';

UPDATE voice_agent_configs 
SET telephony_provider = 'provider_neutral' 
WHERE telephony_provider = 'twilio';

-- 4. Voice Agent Pipelines: Ensure stream identifier is flexible/nullable
ALTER TABLE voice_agent_pipelines 
    ALTER COLUMN twilio_stream_sid DROP NOT NULL;

-- 5. Purge Twilio Provider Credentials from voice_provider_credentials
DELETE FROM voice_provider_credentials 
WHERE provider = 'twilio';

-- 6. Purge Twilio Provider Telemetry from audit tables if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'audit_provider_probes'
    ) THEN
        DELETE FROM audit_provider_probes WHERE provider_name = 'twilio';
    END IF;
END $$;
