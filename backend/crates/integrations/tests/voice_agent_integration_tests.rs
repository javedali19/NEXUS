use platform_common::PlatformError;
use platform_domain::{
    AiProvider, CallComplianceCheckResult, ProviderConnectionStatus, QuadGateEvaluation,
    QuadGateValidator, VoiceAgentConfig, VoiceAgentPipelineOrchestrator, VoiceProviderStatus,
};
use uuid::Uuid;

fn sample_cleared_tcpa_compliance() -> CallComplianceCheckResult {
    CallComplianceCheckResult {
        is_permitted: true,
        is_within_calling_window: true,
        is_dnc_suppressed: false,
        current_local_hour: 14,
        timezone: "America/New_York".to_string(),
        rejection_reason: None,
    }
}

fn sample_rejected_tcpa_compliance() -> CallComplianceCheckResult {
    CallComplianceCheckResult {
        is_permitted: false,
        is_within_calling_window: false,
        is_dnc_suppressed: false,
        current_local_hour: 23,
        timezone: "America/New_York".to_string(),
        rejection_reason: Some("Call aborted: Outside TCPA legal hours (08:00 - 21:00).".to_string()),
    }
}

fn sample_fully_validated_config() -> VoiceAgentConfig {
    VoiceAgentConfig {
        organization_id: Uuid::new_v4(),
        agent_name: "Nexus Autonomous Voice Agent".to_string(),
        telephony_provider: "twilio".to_string(),
        telephony_status: VoiceProviderStatus::Validated,
        stt_provider: "deepgram".to_string(),
        stt_model: "nova-2".to_string(),
        stt_status: VoiceProviderStatus::Validated,
        ai_provider: AiProvider::Openai,
        ai_model_name: "gpt-4o".to_string(),
        ai_provider_status: ProviderConnectionStatus::Validated,
        tts_provider: "elevenlabs".to_string(),
        elevenlabs_voice_id: "21m00Tcm4TlvDq8ikWAM".to_string(),
        elevenlabs_model_id: "eleven_turbo_v2_5".to_string(),
        elevenlabs_stability: 0.50,
        elevenlabs_similarity_boost: 0.75,
        tts_status: VoiceProviderStatus::Validated,
        policy_checks_passed: true,
        is_live_calling_authorized: true,
    }
}

#[test]
fn test_quad_gate_blocks_if_elevenlabs_unconfigured() {
    let mut config = sample_fully_validated_config();
    config.tts_status = VoiceProviderStatus::Unconfigured; // Gate 4 fail

    let compliance = sample_cleared_tcpa_compliance();
    let eval = QuadGateValidator::evaluate(&config, &compliance);

    assert!(!eval.is_fully_authorized, "Must block live calls when ElevenLabs is unconfigured");
    assert!(!eval.tts_passed);
    assert!(eval.blocking_reasons.iter().any(|r| r.contains("ElevenLabs")));
}

#[test]
fn test_quad_gate_blocks_if_deepgram_unconfigured() {
    let mut config = sample_fully_validated_config();
    config.stt_status = VoiceProviderStatus::Unconfigured; // Gate 2 fail

    let compliance = sample_cleared_tcpa_compliance();
    let eval = QuadGateValidator::evaluate(&config, &compliance);

    assert!(!eval.is_fully_authorized, "Must block live calls when Deepgram STT is unconfigured");
    assert!(!eval.stt_passed);
    assert!(eval.blocking_reasons.iter().any(|r| r.contains("Deepgram")));
}

#[test]
fn test_quad_gate_blocks_if_ai_provider_unconfigured() {
    let mut config = sample_fully_validated_config();
    config.ai_provider_status = ProviderConnectionStatus::Unconfigured; // Gate 3 fail

    let compliance = sample_cleared_tcpa_compliance();
    let eval = QuadGateValidator::evaluate(&config, &compliance);

    assert!(!eval.is_fully_authorized, "Must block live calls when AI reasoning is unconfigured");
    assert!(!eval.ai_provider_passed);
    assert!(eval.blocking_reasons.iter().any(|r| r.contains("AI Decision Layer")));
}

#[test]
fn test_quad_gate_blocks_if_telephony_unconfigured() {
    let mut config = sample_fully_validated_config();
    config.telephony_status = VoiceProviderStatus::Unconfigured; // Gate 1 fail

    let compliance = sample_cleared_tcpa_compliance();
    let eval = QuadGateValidator::evaluate(&config, &compliance);

    assert!(!eval.is_fully_authorized, "Must block live calls when Twilio is unconfigured");
    assert!(!eval.telephony_passed);
    assert!(eval.blocking_reasons.iter().any(|r| r.contains("Twilio")));
}

#[test]
fn test_quad_gate_blocks_if_tcpa_policy_violated() {
    let config = sample_fully_validated_config();
    let compliance = sample_rejected_tcpa_compliance(); // Policy gate fail

    let eval = QuadGateValidator::evaluate(&config, &compliance);

    assert!(!eval.is_fully_authorized, "Must block live calls when TCPA hours are violated");
    assert!(!eval.policy_passed);
    assert!(eval.blocking_reasons.iter().any(|r| r.contains("TCPA legal hours")));
}

#[test]
fn test_quad_gate_permits_when_all_four_providers_and_tcpa_validated() {
    let config = sample_fully_validated_config();
    let compliance = sample_cleared_tcpa_compliance();

    let eval = QuadGateValidator::evaluate(&config, &compliance);

    assert!(eval.is_fully_authorized, "Must permit live calls when all 4 providers and policy are validated");
    assert!(eval.telephony_passed);
    assert!(eval.stt_passed);
    assert!(eval.ai_provider_passed);
    assert!(eval.tts_passed);
    assert!(eval.policy_passed);
    assert!(eval.blocking_reasons.is_empty());
}

#[test]
fn test_full_duplex_conversational_turn_pipeline() {
    let config = sample_fully_validated_config();
    let compliance = sample_cleared_tcpa_compliance();

    // Inbound customer speech: "Can you send the payment link for our invoice?"
    let result = VoiceAgentPipelineOrchestrator::process_turn(
        &config,
        &compliance,
        1,
        Some("Can you send the payment link for our invoice?"),
        "Acme Global Solutions",
    ).unwrap();

    assert_eq!(result.turn_index, 1);
    assert!(result.customer_speech_transcript.contains("payment link"));
    assert!(result.ai_response_text.contains("Razorpay checkout link"));
    assert!(result.tool_calls_executed.contains(&"payments:generate_link".to_string()));
    assert!(result.elevenlabs_audio_bytes > 0, "Audio bytes must be generated by ElevenLabs stage");
    assert!(result.sentiment_score > 0.0);
}

#[test]
fn test_latency_telemetry_reporting_and_sla() {
    let config = sample_fully_validated_config();
    let compliance = sample_cleared_tcpa_compliance();

    let result = VoiceAgentPipelineOrchestrator::process_turn(
        &config,
        &compliance,
        1,
        Some("When does our contract renewal take effect?"),
        "Vanguard Logistics",
    ).unwrap();

    // Verify STT + LLM + ElevenLabs TTS latency telemetry breakdown
    assert!(result.latency.stt_latency_ms > 0);
    assert!(result.latency.llm_latency_ms > 0);
    assert!(result.latency.elevenlabs_tts_latency_ms > 0);
    assert_eq!(
        result.latency.total_roundtrip_ms,
        result.latency.stt_latency_ms + result.latency.llm_latency_ms + result.latency.elevenlabs_tts_latency_ms
    );
    // SLA target: total round-trip time < 800ms
    assert!(result.latency.meets_sla, "Pipeline must meet ultra-low latency SLA (< 800ms)");
}

#[test]
fn test_pipeline_aborts_if_gate_fails() {
    let mut unconfigured_config = sample_fully_validated_config();
    unconfigured_config.tts_status = VoiceProviderStatus::Unconfigured; // ElevenLabs missing

    let compliance = sample_cleared_tcpa_compliance();
    let result = VoiceAgentPipelineOrchestrator::process_turn(
        &unconfigured_config,
        &compliance,
        1,
        Some("Hello?"),
        "Acme",
    );

    assert!(result.is_err(), "Must reject turn execution when Quad-Gate fails");
    match result.unwrap_err() {
        PlatformError::PolicyViolation(msg) => {
            assert!(msg.contains("Quad-Gate invariant"));
        }
        other => panic!("Expected PolicyViolation, got {:?}", other),
    }
}
