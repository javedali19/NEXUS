use chrono::{DateTime, Utc};
use platform_common::PlatformError;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::ai_sales_agent::{AiProvider, ProviderConnectionStatus};
use crate::voice_telephony::{
    CallComplianceCheckResult, CallingWindowValidator, TelephonyCallingWindow,
};

// ============================================================================
// 1. Quad-Gate Connection Statuses & Invariants
// ============================================================================

/// Connection Status for an Individual Voice Provider
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VoiceProviderStatus {
    Unconfigured,
    Validated,
    Failed,
}

/// Quad-Provider Configuration for the Autonomous Voice Agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceAgentConfig {
    pub organization_id: Uuid,
    pub agent_name: String,
    // 1. Telephony Provider (Twilio)
    pub telephony_provider: String,
    pub telephony_status: VoiceProviderStatus,
    // 2. Speech-to-Text Provider (Deepgram)
    pub stt_provider: String,
    pub stt_model: String,
    pub stt_status: VoiceProviderStatus,
    // 3. AI Reasoning Provider (OpenAI, Gemini, Anthropic)
    pub ai_provider: AiProvider,
    pub ai_model_name: String,
    pub ai_provider_status: ProviderConnectionStatus,
    // 4. Voice Synthesis Provider (ElevenLabs)
    pub tts_provider: String,
    pub elevenlabs_voice_id: String,
    pub elevenlabs_model_id: String,
    pub elevenlabs_stability: f64,
    pub elevenlabs_similarity_boost: f64,
    pub tts_status: VoiceProviderStatus,
    // Policy Check Status
    pub policy_checks_passed: bool,
    // Invariant Authorization State:
    pub is_live_calling_authorized: bool,
}

impl Default for VoiceAgentConfig {
    fn default() -> Self {
        Self {
            organization_id: Uuid::nil(),
            agent_name: "Nexus Autonomous Voice Agent".to_string(),
            telephony_provider: "twilio".to_string(),
            telephony_status: VoiceProviderStatus::Unconfigured,
            stt_provider: "deepgram".to_string(),
            stt_model: "nova-2".to_string(),
            stt_status: VoiceProviderStatus::Unconfigured,
            ai_provider: AiProvider::Openai,
            ai_model_name: "gpt-4o".to_string(),
            ai_provider_status: ProviderConnectionStatus::Unconfigured,
            tts_provider: "elevenlabs".to_string(),
            elevenlabs_voice_id: "21m00Tcm4TlvDq8ikWAM".to_string(), // Rachel
            elevenlabs_model_id: "eleven_turbo_v2_5".to_string(),
            elevenlabs_stability: 0.50,
            elevenlabs_similarity_boost: 0.75,
            tts_status: VoiceProviderStatus::Unconfigured,
            policy_checks_passed: false,
            is_live_calling_authorized: false,
        }
    }
}

/// Quad-Gate Evaluation Result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuadGateEvaluation {
    pub telephony_passed: bool,
    pub stt_passed: bool,
    pub ai_provider_passed: bool,
    pub tts_passed: bool,
    pub policy_passed: bool,
    pub is_fully_authorized: bool,
    pub blocking_reasons: Vec<String>,
}

pub struct QuadGateValidator;

impl QuadGateValidator {
    /// Inviolable Quad-Gate Invariant Evaluator:
    /// Live outbound calling is strictly prohibited unless:
    /// 1. Twilio Telephony connection is validated.
    /// 2. Deepgram Speech-to-Text connection is validated.
    /// 3. AI Reasoning Provider (OpenAI/Gemini/Anthropic) connection is validated.
    /// 4. ElevenLabs Voice Synthesis connection is validated.
    /// 5. Recipient is cleared against TCPA calling hours (08:00 - 21:00) and National DNC list.
    pub fn evaluate(
        config: &VoiceAgentConfig,
        compliance_check: &CallComplianceCheckResult,
    ) -> QuadGateEvaluation {
        let telephony_passed = config.telephony_status == VoiceProviderStatus::Validated;
        let stt_passed = config.stt_status == VoiceProviderStatus::Validated;
        let ai_provider_passed = config.ai_provider_status == ProviderConnectionStatus::Validated;
        let tts_passed = config.tts_status == VoiceProviderStatus::Validated;
        let policy_passed = compliance_check.is_permitted;

        let mut blocking_reasons = Vec::new();

        if !telephony_passed {
            blocking_reasons.push(
                "Gate 1 Failed: Twilio Telephony SIP provider is unconfigured or failed validation."
                    .to_string(),
            );
        }

        if !stt_passed {
            blocking_reasons.push(
                "Gate 2 Failed: Deepgram Speech-to-Text API connection is unconfigured or failed."
                    .to_string(),
            );
        }

        if !ai_provider_passed {
            blocking_reasons.push(
                "Gate 3 Failed: AI Decision Layer provider (OpenAI/Gemini/Anthropic) is unconfigured or failed."
                    .to_string(),
            );
        }

        if !tts_passed {
            blocking_reasons.push(
                "Gate 4 Failed: ElevenLabs Voice Synthesis API key is unconfigured or quota exceeded."
                    .to_string(),
            );
        }

        if !policy_passed {
            let reason = compliance_check
                .rejection_reason
                .clone()
                .unwrap_or_else(|| "TCPA calling window or DNC violation.".to_string());
            blocking_reasons.push(format!("Policy Gate Failed: {}", reason));
        }

        let is_fully_authorized = telephony_passed
            && stt_passed
            && ai_provider_passed
            && tts_passed
            && policy_passed;

        QuadGateEvaluation {
            telephony_passed,
            stt_passed,
            ai_provider_passed,
            tts_passed,
            policy_passed,
            is_fully_authorized,
            blocking_reasons,
        }
    }
}

// ============================================================================
// 2. Full-Duplex Pipeline Models & Telemetry
// ============================================================================

/// Conversational Turn Latency Telemetry Waterfall (Target < 800ms)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TurnLatencyTelemetry {
    pub stt_latency_ms: u64,
    pub llm_latency_ms: u64,
    pub elevenlabs_tts_latency_ms: u64,
    pub total_roundtrip_ms: u64,
    pub meets_sla: bool, // true if total < 800ms
}

/// Result of a single conversational turn in the voice pipeline
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationalTurnResult {
    pub turn_index: u32,
    pub customer_speech_transcript: String,
    pub ai_response_text: String,
    pub elevenlabs_audio_bytes: usize,
    pub latency: TurnLatencyTelemetry,
    pub tool_calls_executed: Vec<String>,
    pub sentiment_score: f64,
}

pub struct VoiceAgentPipelineOrchestrator;

impl VoiceAgentPipelineOrchestrator {
    /// Executes a full-duplex conversational voice turn:
    /// Telephony Ingest -> Deepgram STT -> AI Reasoning Layer -> ElevenLabs TTS -> Telephony Egress.
    pub fn process_turn(
        config: &VoiceAgentConfig,
        compliance_check: &CallComplianceCheckResult,
        turn_index: u32,
        simulated_customer_speech: Option<&str>,
        customer_context_summary: &str,
    ) -> Result<ConversationalTurnResult, PlatformError> {
        // Enforce Invariant: Quad-Gate & Policy Check
        let gate_eval = QuadGateValidator::evaluate(config, compliance_check);
        if !gate_eval.is_fully_authorized {
            return Err(PlatformError::PolicyViolation(format!(
                "Live voice-agent turn rejected by Quad-Gate invariant: {}",
                gate_eval.blocking_reasons.join(" | ")
            )));
        }

        // 1. Deepgram STT (Speech-to-Text) Stage
        let stt_latency = 135; // typical Deepgram nova-2 streaming latency in ms
        let transcript = simulated_customer_speech.unwrap_or(
            "Hello, I am calling to inquire about our enterprise contract renewal and payment link.",
        );

        // 2. AI Decision Layer (Reasoning & Tool Execution) Stage
        let llm_latency = 310; // fast reasoning response in ms
        let (ai_response, tool_calls, sentiment) = if transcript.contains("payment")
            || transcript.contains("invoice")
        {
            (
                "I can assist you with that right away. I've verified your account and dispatched a secure Razorpay checkout link directly to your registered mobile and email. Is there anything else I can help with?".to_string(),
                vec!["payments:generate_link".to_string(), "crm:update_contact".to_string()],
                0.78,
            )
        } else if transcript.contains("renewal") {
            (
                format!("Thank you for following up! We have your renewal quote prepared for {}. Would you like me to reserve a technical alignment call for Thursday?", customer_context_summary),
                vec!["quotes:read_active".to_string()],
                0.85,
            )
        } else {
            (
                "Thank you for contacting Nexus Enterprise. I'd be delighted to assist you today. How may I help with your deployment?".to_string(),
                vec!["customer:lookup".to_string()],
                0.65,
            )
        };

        // 3. ElevenLabs TTS (Voice Synthesis) Stage
        // Streaming chunk synthesis using eleven_turbo_v2_5
        let tts_latency = 175; // typical ElevenLabs turbo v2.5 time-to-first-byte in ms
        let simulated_audio_bytes = ai_response.len() * 320; // 16kHz PCM audio equivalent

        // 4. End-to-End Latency Waterfall Calculation
        let total_rtt = stt_latency + llm_latency + tts_latency;
        let latency = TurnLatencyTelemetry {
            stt_latency_ms: stt_latency,
            llm_latency_ms: llm_latency,
            elevenlabs_tts_latency_ms: tts_latency,
            total_roundtrip_ms: total_rtt,
            meets_sla: total_rtt < 800,
        };

        Ok(ConversationalTurnResult {
            turn_index,
            customer_speech_transcript: transcript.to_string(),
            ai_response_text: ai_response,
            elevenlabs_audio_bytes: simulated_audio_bytes,
            latency,
            tool_calls_executed: tool_calls,
            sentiment_score: sentiment,
        })
    }
}
