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
        telephony_provider: "provider_neutral".to_string(),
        telephony_status: VoiceProviderStatus::Validated,
        stt_provider: "deepgram".to_string(),
        stt_model: "nova-2".to_string(),
        stt_status: VoiceProviderStatus::Validated,
        ai_provider: AiProvider::Openai,
        ai_model_name: "gpt-4o".to_string(),
        ai_provider_status: ProviderConnectionStatus::Validated,
        tts_provider: "disabled".to_string(),
        tts_status: VoiceProviderStatus::Unconfigured,
        policy_checks_passed: true,
        is_live_calling_authorized: true,
    }
}

#[test]
fn test_calling_gate_permits_when_tts_unconfigured_or_disabled() {
    let mut config = sample_fully_validated_config();
    config.tts_provider = "disabled".to_string();
    config.tts_status = VoiceProviderStatus::Unconfigured; // Post-ElevenLabs removal

    let compliance = sample_cleared_tcpa_compliance();
    let eval = QuadGateValidator::evaluate(&config, &compliance);

    assert!(eval.is_fully_authorized, "Must permit live calls when TTS is disabled/unconfigured");
    assert!(eval.tts_passed);
    assert!(eval.blocking_reasons.is_empty());
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

    assert!(!eval.is_fully_authorized, "Must block live calls when telephony carrier is unconfigured");
    assert!(!eval.telephony_passed);
    assert!(eval.blocking_reasons.iter().any(|r| r.contains("Telephony carrier")));
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
fn test_quad_gate_permits_when_active_providers_and_tcpa_validated() {
    let config = sample_fully_validated_config();
    let compliance = sample_cleared_tcpa_compliance();

    let eval = QuadGateValidator::evaluate(&config, &compliance);

    assert!(eval.is_fully_authorized, "Must permit live calls when active providers and policy are validated");
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
    assert_eq!(result.audio_bytes, 0, "No audio bytes generated when TTS is unconfigured");
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

    // Verify STT + LLM latency telemetry breakdown
    assert!(result.latency.stt_latency_ms > 0);
    assert!(result.latency.llm_latency_ms > 0);
    assert_eq!(result.latency.tts_latency_ms, 0);
    assert_eq!(
        result.latency.total_roundtrip_ms,
        result.latency.stt_latency_ms + result.latency.llm_latency_ms + result.latency.tts_latency_ms
    );
    // SLA target: total round-trip time < 800ms
    assert!(result.latency.meets_sla, "Pipeline must meet ultra-low latency SLA (< 800ms)");
}

#[test]
fn test_pipeline_aborts_if_gate_fails() {
    let mut unconfigured_config = sample_fully_validated_config();
    unconfigured_config.telephony_status = VoiceProviderStatus::Unconfigured; // Telephony carrier missing

    let compliance = sample_cleared_tcpa_compliance();
    let result = VoiceAgentPipelineOrchestrator::process_turn(
        &unconfigured_config,
        &compliance,
        1,
        Some("Hello?"),
        "Acme",
    );

    assert!(result.is_err(), "Must reject turn execution when Calling Gate fails");
    match result.unwrap_err() {
        PlatformError::PolicyViolation(msg) => {
            assert!(msg.contains("Calling Gate invariant"));
        }
        other => panic!("Expected PolicyViolation, got {:?}", other),
    }
}
