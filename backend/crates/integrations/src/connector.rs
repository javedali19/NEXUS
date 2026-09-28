use async_trait::async_trait;
use chrono::{DateTime, Utc};
use platform_common::PlatformError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use uuid::Uuid;

/// Granular, discoverable capability supported by an external provider connector.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IntegrationCapability {
    /// Credit card / ACH payments, charges, authorization, settlement
    PaymentProcessing,
    /// Payment refunds, dispute handling
    PaymentRefunds,
    /// Automated billing & recurring subscription lifecycle
    RecurringBilling,
    /// Inbound & Outbound VoIP SIP carrier telephony
    VoiceTelephony,
    /// Real-time WebRTC audio media streaming & recording
    VoiceAudioStreaming,
    /// WhatsApp Business API messaging & rich templates
    WhatsAppMessaging,
    /// SMS & MMS omnichannel delivery
    SmsMessaging,
    /// Bi-directional CRM Account & Company synchronization
    CrmCompanySync,
    /// Bi-directional CRM Contact & Lead synchronization
    CrmContactSync,
    /// Bi-directional CRM Deal & Pipeline synchronization
    CrmDealSync,
    /// Document AI & OCR invoice/receipt data extraction
    DocumentOcrVision,
    /// Real-time streaming Speech-to-Text transcription (Deepgram/AssemblyAI/Google)
    SpeechToText,
    /// Ultra-low latency Neural Voice Synthesis (ElevenLabs turbo_v2_5)
    VoiceSynthesis,
    /// Pub/Sub & CloudEvent streaming message broker
    CloudEventStreaming,
    /// Custom webhook ingestion & dispatch
    GenericWebhook,
}

/// Normalized health check status across all external integrations.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum HealthStatus {
    Healthy {
        latency_ms: u64,
        checked_at: DateTime<Utc>,
    },
    Degraded {
        latency_ms: u64,
        warning: String,
        checked_at: DateTime<Utc>,
    },
    Disconnected {
        error: String,
        consecutive_failures: u32,
        checked_at: DateTime<Utc>,
    },
    RateLimited {
        retry_after_seconds: u32,
        quota_remaining: u32,
        checked_at: DateTime<Utc>,
    },
    Unconfigured,
}

/// Result of an interactive connection probe test.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionTestResult {
    pub is_successful: bool,
    pub provider: String,
    pub latency_ms: u64,
    pub message: String,
    pub detected_account_id: Option<String>,
    pub capabilities_confirmed: Vec<IntegrationCapability>,
    pub tested_at: DateTime<Utc>,
}

/// Normalized canonical platform event emitted after vendor webhook ingestion.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizedEvent {
    pub canonical_event_type: String, // e.g. "payment.received.v1", "whatsapp.message_received.v1"
    pub entity_type: String,
    pub external_entity_id: String,
    pub normalized_payload: Value,
    pub raw_event_type: String,
    pub idempotency_key: String,
    pub occurred_at: DateTime<Utc>,
}

/// Core Connector / Adapter trait for third-party providers.
/// Translates between proprietary vendor protocols and normalized platform domains.
#[async_trait]
pub trait Connector: Send + Sync {
    /// Unique provider identifier (e.g. "stripe", "twilio", "salesforce", "google_vision")
    fn provider_name(&self) -> &'static str;

    /// Returns all discoverable capabilities supported by this provider connector.
    fn discover_capabilities(&self) -> Vec<IntegrationCapability>;

    /// Probes and tests connection credentials without executing mutating actions.
    async fn test_connection(
        &self,
        credentials: &Value,
    ) -> Result<ConnectionTestResult, PlatformError>;

    /// Executes live health check probe.
    async fn check_health(
        &self,
        connection_id: Uuid,
        credentials: &Value,
    ) -> Result<HealthStatus, PlatformError>;

    /// Verifies cryptographic signature for incoming webhooks (HMAC SHA-256 / RSA / Webhook Secret).
    fn verify_webhook_signature(
        &self,
        headers: &HashMap<String, String>,
        body: &[u8],
        webhook_secret: &str,
    ) -> bool;

    /// Normalizes proprietary vendor webhook JSON into a canonical platform event.
    fn normalize_webhook(
        &self,
        raw_event_type: &str,
        raw_payload: &Value,
    ) -> Result<NormalizedEvent, PlatformError>;
}
