use std::collections::HashMap;
use chrono::{DateTime, Duration, Utc};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::Sha256;
use uuid::Uuid;

use crate::auth::secret_manager::{SecretManagerResolver, GsmSecretRef};
use platform_common::PlatformError;

type HmacSha256 = Hmac<Sha256>;

/// WhatsApp Message Delivery Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MessageStatus {
    Queued,
    Sent,
    Delivered,
    Read,
    Failed,
}

/// Direction of the WhatsApp message.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MessageDirection {
    Inbound,
    Outbound,
}

/// Message Content Type.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MessageType {
    Text,
    Image,
    Document,
    Audio,
    Video,
    Template,
    Interactive,
    Location,
}

/// WhatsApp Contact Opt-In Consent Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ConsentStatus {
    OptedIn,
    OptedOut,
    Pending,
}

/// Meta WhatsApp Business Account (WABA) Configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhatsAppConfig {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub waba_id: String,
    pub phone_number_id: String,
    pub display_phone_number: String,
    pub verified_name: Option<String>,
    pub quality_rating: String,
    pub access_token_secret_ref: String, // GSM Vault Path
    pub app_secret_ref: String,          // GSM Vault Path
    pub webhook_verify_token: String,
    pub status: String,
    pub last_validated_at: Option<DateTime<Utc>>,
}

/// HSM Pre-Approved Template Parameter.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateComponentParam {
    pub param_type: String, // "text", "currency", "date_time", "image", "document"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub document: Option<TemplateMediaRef>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<TemplateMediaRef>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateMediaRef {
    pub link: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filename: Option<String>,
}

/// HSM Pre-Approved Template Component.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateComponent {
    #[serde(rename = "type")]
    pub component_type: String, // "header", "body", "button"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sub_type: Option<String>, // "quick_reply", "url"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub index: Option<String>,
    pub parameters: Vec<TemplateComponentParam>,
}

/// Meta Cloud API Outbound Message Request Payload.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaOutboundPayload {
    pub messaging_product: String,
    pub recipient_type: String,
    pub to: String,
    #[serde(rename = "type")]
    pub message_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<MetaTextBody>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<MetaTemplateBody>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub document: Option<MetaDocumentBody>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<MetaImageBody>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaTextBody {
    pub preview_url: bool,
    pub body: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaTemplateBody {
    pub name: String,
    pub language: MetaLanguage,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub components: Vec<TemplateComponent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaLanguage {
    pub code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaDocumentBody {
    pub link: String,
    pub caption: Option<String>,
    pub filename: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaImageBody {
    pub link: String,
    pub caption: Option<String>,
}

/// Inbound Normalized WhatsApp Message.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InboundMessage {
    pub wamid: String,
    pub from_phone: String,
    pub timestamp: DateTime<Utc>,
    pub message_type: MessageType,
    pub text_body: Option<String>,
    pub media_id: Option<String>,
    pub media_mime_type: Option<String>,
    pub interactive_button_id: Option<String>,
    pub interactive_title: Option<String>,
    pub is_consent_opt_out: bool,
    pub is_consent_opt_in: bool,
}

/// Normalized Delivery/Read Status Event.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageStatusUpdate {
    pub wamid: String,
    pub recipient_id: String,
    pub status: MessageStatus,
    pub timestamp: DateTime<Utc>,
    pub error_code: Option<String>,
    pub error_message: Option<String>,
}

/// Core Meta WhatsApp Business Adapter Engine.
pub struct WhatsAppAdapter {
    pub config: WhatsAppConfig,
    pub secret_resolver: SecretManagerResolver,
}

impl WhatsAppAdapter {
    pub fn new(config: WhatsAppConfig, secret_resolver: SecretManagerResolver) -> Self {
        Self {
            config,
            secret_resolver,
        }
    }

    /// Normalizes any input phone number to standard E.164 format (+[country][number]).
    pub fn normalize_phone_e164(input: &str) -> Result<String, PlatformError> {
        let clean: String = input.chars().filter(|c| c.is_ascii_digit() || *c == '+').collect();
        if clean.is_empty() {
            return Err(PlatformError::ValidationError("Phone number cannot be empty".into()));
        }

        let formatted = if clean.starts_with('+') {
            clean
        } else if clean.len() == 10 {
            // Default 10 digits to US/India or prefix +
            format!("+1{}", clean)
        } else {
            format!("+{}", clean)
        };

        if formatted.len() < 8 || formatted.len() > 16 {
            return Err(PlatformError::ValidationError(format!(
                "Invalid E.164 phone number length: {}",
                formatted
            )));
        }

        Ok(formatted)
    }

    /// Validates the 24-hr customer service session window.
    /// Inside 24 hours of customer's last inbound message: freeform messages allowed.
    /// Outside 24 hours: only pre-approved HSM templates are permitted.
    pub fn is_service_window_active(last_inbound_at: Option<DateTime<Utc>>) -> bool {
        match last_inbound_at {
            Some(inbound_time) => {
                let diff = Utc::now() - inbound_time;
                diff < Duration::hours(24)
            }
            None => false,
        }
    }

    /// Evaluates if a message text represents an opt-out (STOP/UNSUBSCRIBE) or opt-in (START/UNSTOP) keyword.
    pub fn evaluate_consent_keywords(text: &str) -> (bool, bool) {
        let clean = text.trim().to_uppercase();
        let is_opt_out = matches!(
            clean.as_str(),
            "STOP" | "UNSUBSCRIBE" | "CANCEL" | "END" | "QUIT" | "OPTOUT"
        );
        let is_opt_in = matches!(clean.as_str(), "START" | "YES" | "UNSTOP" | "OPTIN");
        (is_opt_out, is_opt_in)
    }

    /// Verifies the Meta Webhook Handshake challenge (GET request from Meta).
    pub fn verify_webhook_handshake(
        mode: Option<&str>,
        verify_token: Option<&str>,
        challenge: Option<&str>,
        expected_verify_token: &str,
    ) -> Result<String, PlatformError> {
        if mode == Some("subscribe") && verify_token == Some(expected_verify_token) {
            match challenge {
                Some(c) => Ok(c.to_string()),
                None => Err(PlatformError::ValidationError("Missing hub.challenge token".into())),
            }
        } else {
            Err(PlatformError::AuthenticationError(
                "Meta webhook verify token mismatch or invalid mode".into(),
            ))
        }
    }

    /// Cryptographically verifies the `X-Hub-Signature-256` HMAC SHA-256 header.
    /// Meta sends `sha256=<hex_digest>` computed with the Meta App Secret over the raw body bytes.
    pub fn verify_hub_signature(
        raw_body: &[u8],
        header_signature: &str,
        app_secret: &str,
    ) -> Result<(), PlatformError> {
        let signature_hex = header_signature
            .strip_prefix("sha256=")
            .unwrap_or(header_signature);

        let mut mac = HmacSha256::new_from_slice(app_secret.as_bytes())
            .map_err(|e| PlatformError::Internal(format!("HMAC init error: {}", e)))?;
        mac.update(raw_body);

        let decoded_sig = hex::decode(signature_hex)
            .map_err(|_| PlatformError::AuthenticationError("Invalid hex signature format".into()))?;

        mac.verify_slice(&decoded_sig)
            .map_err(|_| PlatformError::AuthenticationError("Meta X-Hub-Signature-256 HMAC verification failed".into()))
    }

    /// Parses inbound webhook JSON payload from Meta Cloud API v20.0+.
    pub fn parse_webhook_payload(payload: &Value) -> Result<(Vec<InboundMessage>, Vec<MessageStatusUpdate>), PlatformError> {
        let mut inbound_messages = Vec::new();
        let mut status_updates = Vec::new();

        let entries = payload.get("entry").and_then(|e| e.as_array()).ok_or_else(|| {
            PlatformError::ValidationError("Invalid Meta webhook envelope: missing 'entry' array".into())
        })?;

        for entry in entries {
            let changes = entry.get("changes").and_then(|c| c.as_array());
            if let Some(changes) = changes {
                for change in changes {
                    let value = change.get("value");
                    if let Some(val) = value {
                        // 1. Inbound Messages
                        if let Some(messages) = val.get("messages").and_then(|m| m.as_array()) {
                            for msg in messages {
                                let wamid = msg.get("id").and_then(|i| i.as_str()).unwrap_or_default().to_string();
                                let from = msg.get("from").and_then(|f| f.as_str()).unwrap_or_default().to_string();
                                let ts_raw = msg.get("timestamp").and_then(|t| t.as_str()).unwrap_or("0");
                                let ts_sec: i64 = ts_raw.parse().unwrap_or(0);
                                let timestamp = DateTime::<Utc>::from_timestamp(ts_sec, 0).unwrap_or_else(Utc::now);

                                let type_str = msg.get("type").and_then(|t| t.as_str()).unwrap_or("text");

                                let (msg_type, body_text, media_id, media_mime, btn_id, btn_title) = match type_str {
                                    "text" => {
                                        let text = msg.get("text").and_then(|t| t.get("body")).and_then(|b| b.as_str()).map(String::from);
                                        (MessageType::Text, text, None, None, None, None)
                                    }
                                    "image" => {
                                        let img = msg.get("image");
                                        let id = img.and_then(|i| i.get("id")).and_then(|id| id.as_str()).map(String::from);
                                        let mime = img.and_then(|i| i.get("mime_type")).and_then(|m| m.as_str()).map(String::from);
                                        let caption = img.and_then(|i| i.get("caption")).and_then(|c| c.as_str()).map(String::from);
                                        (MessageType::Image, caption, id, mime, None, None)
                                    }
                                    "document" => {
                                        let doc = msg.get("document");
                                        let id = doc.and_then(|d| d.get("id")).and_then(|id| id.as_str()).map(String::from);
                                        let mime = doc.and_then(|d| d.get("mime_type")).and_then(|m| m.as_str()).map(String::from);
                                        let filename = doc.and_then(|d| d.get("filename")).and_then(|f| f.as_str()).map(String::from);
                                        (MessageType::Document, filename, id, mime, None, None)
                                    }
                                    "interactive" => {
                                        let interactive = msg.get("interactive");
                                        let btn_reply = interactive.and_then(|i| i.get("button_reply"));
                                        let btn_id = btn_reply.and_then(|b| b.get("id")).and_then(|i| i.as_str()).map(String::from);
                                        let btn_title = btn_reply.and_then(|b| b.get("title")).and_then(|t| t.as_str()).map(String::from);
                                        (MessageType::Interactive, btn_title.clone(), None, None, btn_id, btn_title)
                                    }
                                    _ => (MessageType::Text, Some(format!("[Unsupported message type: {}]", type_str)), None, None, None, None),
                                };

                                let (is_opt_out, is_opt_in) = match &body_text {
                                    Some(txt) => Self::evaluate_consent_keywords(txt),
                                    None => (false, false),
                                };

                                inbound_messages.push(InboundMessage {
                                    wamid,
                                    from_phone: format!("+{}", from),
                                    timestamp,
                                    message_type: msg_type,
                                    text_body: body_text,
                                    media_id,
                                    media_mime_type: media_mime,
                                    interactive_button_id: btn_id,
                                    interactive_title: btn_title,
                                    is_consent_opt_out: is_opt_out,
                                    is_consent_opt_in: is_opt_in,
                                });
                            }
                        }

                        // 2. Delivery & Read Status Updates
                        if let Some(statuses) = val.get("statuses").and_then(|s| s.as_array()) {
                            for st in statuses {
                                let wamid = st.get("id").and_then(|i| i.as_str()).unwrap_or_default().to_string();
                                let recipient_id = st.get("recipient_id").and_then(|r| r.as_str()).unwrap_or_default().to_string();
                                let status_str = st.get("status").and_then(|s| s.as_str()).unwrap_or("sent");
                                let ts_raw = st.get("timestamp").and_then(|t| t.as_str()).unwrap_or("0");
                                let ts_sec: i64 = ts_raw.parse().unwrap_or(0);
                                let timestamp = DateTime::<Utc>::from_timestamp(ts_sec, 0).unwrap_or_else(Utc::now);

                                let status = match status_str {
                                    "sent" => MessageStatus::Sent,
                                    "delivered" => MessageStatus::Delivered,
                                    "read" => MessageStatus::Read,
                                    "failed" => MessageStatus::Failed,
                                    _ => MessageStatus::Sent,
                                };

                                let (error_code, error_msg) = if let Some(errors) = st.get("errors").and_then(|e| e.as_array()).and_then(|a| a.first()) {
                                    let code = errors.get("code").map(|c| c.to_string());
                                    let msg = errors.get("message").and_then(|m| m.as_str()).map(String::from);
                                    (code, msg)
                                } else {
                                    (None, None)
                                };

                                status_updates.push(MessageStatusUpdate {
                                    wamid,
                                    recipient_id: format!("+{}", recipient_id),
                                    status,
                                    timestamp,
                                    error_code,
                                    error_message: error_msg,
                                });
                            }
                        }
                    }
                }
            }
        }

        Ok((inbound_messages, status_updates))
    }

    /// Constructs an outbound freeform text message payload for Meta Cloud API.
    pub fn build_text_message(
        to_phone_e164: &str,
        text: &str,
        preview_url: bool,
    ) -> Result<MetaOutboundPayload, PlatformError> {
        let clean_phone = to_phone_e164.trim_start_matches('+').to_string();
        Ok(MetaOutboundPayload {
            messaging_product: "whatsapp".into(),
            recipient_type: "individual".into(),
            to: clean_phone,
            message_type: "text".into(),
            text: Some(MetaTextBody {
                preview_url,
                body: text.to_string(),
            }),
            template: None,
            document: None,
            image: None,
        })
    }

    /// Constructs an outbound HSM pre-approved template payload.
    pub fn build_template_message(
        to_phone_e164: &str,
        template_name: &str,
        language_code: &str,
        components: Vec<TemplateComponent>,
    ) -> Result<MetaOutboundPayload, PlatformError> {
        let clean_phone = to_phone_e164.trim_start_matches('+').to_string();
        Ok(MetaOutboundPayload {
            messaging_product: "whatsapp".into(),
            recipient_type: "individual".into(),
            to: clean_phone,
            message_type: "template".into(),
            text: None,
            template: Some(MetaTemplateBody {
                name: template_name.to_string(),
                language: MetaLanguage {
                    code: language_code.to_string(),
                },
                components,
            }),
            document: None,
            image: None,
        })
    }

    /// Constructs an outbound document attachment (e.g. Invoice / Quote PDF) payload.
    pub fn build_document_message(
        to_phone_e164: &str,
        document_url: &str,
        filename: &str,
        caption: Option<&str>,
    ) -> Result<MetaOutboundPayload, PlatformError> {
        let clean_phone = to_phone_e164.trim_start_matches('+').to_string();
        Ok(MetaOutboundPayload {
            messaging_product: "whatsapp".into(),
            recipient_type: "individual".into(),
            to: clean_phone,
            message_type: "document".into(),
            text: None,
            template: None,
            document: Some(MetaDocumentBody {
                link: document_url.to_string(),
                filename: Some(filename.to_string()),
                caption: caption.map(String::from),
            }),
            image: None,
        })
    }

    /// Constructs a read receipt acknowledgment payload (`status: "read"`).
    pub fn build_read_receipt_payload(wamid: &str) -> Value {
        json!({
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": wamid
        })
    }
}
