use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use platform_common::PlatformError;

/// Omnichannel Communication Channel.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChannelType {
    Whatsapp,
    Email,
    Sms,
    Voice,
    Support,
    AiChat,
    InternalNote,
}

/// Conversation Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ThreadStatus {
    Open,
    Pending,
    Resolved,
    Closed,
}

/// Conversation Priority.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ThreadPriority {
    Urgent,
    High,
    Medium,
    Low,
}

/// Message Sender Type.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SenderType {
    Customer,
    Agent,
    AiCopilot,
    System,
}

/// Direction of the message.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MessageDirection {
    Inbound,
    Outbound,
}

/// Delivery status of the message.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DeliveryStatus {
    Pending,
    Sent,
    Delivered,
    Read,
    Failed,
}

/// Unified Omnichannel Thread Model.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmnichannelThread {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub customer_id: Option<Uuid>,
    pub contact_id: Option<Uuid>,
    pub primary_channel: ChannelType,
    pub title: String,
    pub status: ThreadStatus,
    pub priority: ThreadPriority,
    pub assigned_agent_id: Option<Uuid>,
    pub assigned_team_id: Option<Uuid>,
    pub sla_due_at: Option<DateTime<Utc>>,
    pub is_sla_breached: bool,
    pub sentiment_score: f64,
    pub ai_summary: Option<String>,
    pub ai_intent: Option<String>,
    pub unread_count: i32,
    pub last_message_at: DateTime<Utc>,
    pub last_message_preview: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Media Attachment Model.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaAttachment {
    pub filename: String,
    pub url: String,
    pub mime_type: String,
    pub size_bytes: Option<i64>,
}

/// Unified Omnichannel Message Record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmnichannelMessage {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub thread_id: Uuid,
    pub channel: ChannelType,
    pub direction: MessageDirection,
    pub sender_type: SenderType,
    pub sender_id: Option<Uuid>,
    pub sender_name: Option<String>,
    pub is_internal_note: bool,
    pub subject: Option<String>,
    pub body_text: String,
    pub body_html: Option<String>,
    pub media_attachments: Vec<MediaAttachment>,
    pub channel_metadata: Value,
    pub delivery_status: DeliveryStatus,
    pub delivered_at: Option<DateTime<Utc>>,
    pub read_at: Option<DateTime<Utc>>,
    pub correlation_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Classification Tag Model.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmnichannelTag {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub name: String,
    pub color_hex: String,
}

impl OmnichannelThread {
    /// Validates if an SLA deadline has been breached.
    pub fn check_sla_breach(&self) -> bool {
        if self.status == ThreadStatus::Resolved || self.status == ThreadStatus::Closed {
            return false;
        }

        match self.sla_due_at {
            Some(due) => Utc::now() > due,
            None => false,
        }
    }

    /// Evaluates if an outbound message can be dispatched or if it is an internal note.
    pub fn validate_outbound_dispatch(message: &OmnichannelMessage) -> Result<(), PlatformError> {
        if message.is_internal_note {
            return Err(PlatformError::ValidationError(
                "Internal notes cannot be dispatched to external channels".into(),
            ));
        }

        if message.body_text.trim().is_empty() && message.media_attachments.is_empty() {
            return Err(PlatformError::ValidationError(
                "Outbound message body or attachment is required".into(),
            ));
        }

        Ok(())
    }
}
