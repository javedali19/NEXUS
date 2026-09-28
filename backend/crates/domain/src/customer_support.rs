use chrono::{DateTime, Duration, Utc};
use platform_common::PlatformError;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

// ============================================================================
// 1. Enums for Case Priority, Status, and SLA
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CasePriority {
    Low,
    Medium,
    High,
    Urgent,
}

impl CasePriority {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Low => "low",
            Self::Medium => "medium",
            Self::High => "high",
            Self::Urgent => "urgent",
        }
    }

    /// Calculates SLA targets based on priority tier.
    /// - Urgent: First Response: 15 mins, Resolution: 2 hours
    /// - High: First Response: 1 hour, Resolution: 8 hours
    /// - Medium: First Response: 4 hours, Resolution: 24 hours
    /// - Low: First Response: 24 hours, Resolution: 72 hours
    pub fn sla_durations(&self) -> (Duration, Duration) {
        match self {
            Self::Urgent => (Duration::minutes(15), Duration::hours(2)),
            Self::High => (Duration::hours(1), Duration::hours(8)),
            Self::Medium => (Duration::hours(4), Duration::hours(24)),
            Self::Low => (Duration::hours(24), Duration::hours(72)),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CaseStatus {
    Open,
    InProgress,
    WaitingOnCustomer,
    Escalated,
    Resolved,
    Closed,
}

impl CaseStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Open => "open",
            Self::InProgress => "in_progress",
            Self::WaitingOnCustomer => "waiting_on_customer",
            Self::Escalated => "escalated",
            Self::Resolved => "resolved",
            Self::Closed => "closed",
        }
    }

    pub fn is_active(&self) -> bool {
        matches!(
            self,
            Self::Open | Self::InProgress | Self::WaitingOnCustomer | Self::Escalated
        )
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SlaStatus {
    WithinSla,
    AtRisk,
    Breached,
}

impl SlaStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::WithinSla => "within_sla",
            Self::AtRisk => "at_risk",
            Self::Breached => "breached",
        }
    }
}

// ============================================================================
// 2. Data Models (Support Cases, Conversations, Notes, Attachments, Audits)
// ============================================================================

/// Master Support Case Record
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SupportCase {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub case_number: String,
    pub customer_id: Option<Uuid>,
    pub contact_id: Option<Uuid>,
    pub subject: String,
    pub description: String,
    pub category: String, // billing_dispute, technical_bug, feature_request, service_outage, account_access, onboarding
    pub priority: String, // low, medium, high, urgent
    pub status: String,   // open, in_progress, waiting_on_customer, escalated, resolved, closed
    // Assignment
    pub assigned_team: Option<String>,
    pub assigned_agent_id: Option<Uuid>,
    pub assigned_agent_name: Option<String>,
    pub assigned_ai_persona: Option<String>,
    // SLA Architecture
    pub sla_policy_id: String,
    pub first_response_due_at: DateTime<Utc>,
    pub first_responded_at: Option<DateTime<Utc>>,
    pub resolution_due_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub sla_status: String, // within_sla, at_risk, breached
    // Escalation
    pub is_escalated: bool,
    pub escalated_to_supervisor_name: Option<String>,
    pub escalation_reason: Option<String>,
    pub escalated_at: Option<DateTime<Utc>>,
    // Resolution
    pub resolution_summary: Option<String>,
    pub root_cause_category: Option<String>,
    pub csat_score: Option<i32>,
    // Omnichannel Connections
    pub whatsapp_session_id: Option<String>,
    pub linked_call_id: Option<Uuid>,
    pub linked_invoice_id: Option<Uuid>,
    pub workflow_execution_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Omnichannel Support Case Message (Portal, WhatsApp, Call Transcript, Email)
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SupportCaseMessage {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub case_id: Uuid,
    pub sender_type: String, // customer, agent, ai_copilot, system
    pub sender_name: String,
    pub channel: String, // portal, whatsapp, phone_transcript, email
    pub content: String,
    pub external_message_id: Option<String>,
    pub sent_at: DateTime<Utc>,
}

/// Staff-Only Internal Note (Private to Organization)
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SupportCaseNote {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub case_id: Uuid,
    pub author_id: Option<Uuid>,
    pub author_name: String,
    pub note_text: String,
    pub is_pinned: bool,
    pub created_at: DateTime<Utc>,
}

/// Case Attachment Reference (GCS Document)
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SupportCaseAttachment {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub case_id: Uuid,
    pub document_id: Option<Uuid>,
    pub file_name: String,
    pub file_size_bytes: i64,
    pub mime_type: String,
    pub storage_uri: String,
    pub uploader_name: String,
    pub created_at: DateTime<Utc>,
}

/// Append-Only Support Case Audit Event
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SupportCaseAuditEvent {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub case_id: Uuid,
    pub event_type: String, // case_created, assigned, priority_changed, status_changed, sla_breached, escalated, resolved, csat_submitted
    pub actor_type: String,
    pub actor_name: String,
    pub details: Value,
    pub occurred_at: DateTime<Utc>,
}

// ============================================================================
// 3. Domain Logic & Case Service
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSupportCaseDto {
    pub organization_id: Uuid,
    pub customer_id: Option<Uuid>,
    pub contact_id: Option<Uuid>,
    pub subject: String,
    pub description: String,
    pub category: String,
    pub priority: CasePriority,
    pub assigned_team: Option<String>,
    pub assigned_agent_name: Option<String>,
    pub assigned_ai_persona: Option<String>,
    pub whatsapp_session_id: Option<String>,
    pub linked_call_id: Option<Uuid>,
    pub linked_invoice_id: Option<Uuid>,
}

pub struct SupportCaseService;

impl SupportCaseService {
    /// Creates a new support case with automatic SLA target computation based on priority.
    pub fn create_case(dto: CreateSupportCaseDto, current_time: DateTime<Utc>) -> SupportCase {
        let (frt_duration, resolution_duration) = dto.priority.sla_durations();
        let first_response_due_at = current_time + frt_duration;
        let resolution_due_at = current_time + resolution_duration;

        let case_number = format!("CAS-{}-{}", current_time.format("%Y"), Uuid::new_v4().simple().to_string()[..6].to_uppercase());

        SupportCase {
            id: Uuid::new_v4(),
            organization_id: dto.organization_id,
            case_number,
            customer_id: dto.customer_id,
            contact_id: dto.contact_id,
            subject: dto.subject,
            description: dto.description,
            category: dto.category,
            priority: dto.priority.as_str().to_string(),
            status: "open".to_string(),
            assigned_team: dto.assigned_team,
            assigned_agent_id: None,
            assigned_agent_name: dto.assigned_agent_name,
            assigned_ai_persona: dto.assigned_ai_persona,
            sla_policy_id: "enterprise_standard".to_string(),
            first_response_due_at,
            first_responded_at: None,
            resolution_due_at,
            resolved_at: None,
            sla_status: "within_sla".to_string(),
            is_escalated: false,
            escalated_to_supervisor_name: None,
            escalation_reason: None,
            escalated_at: None,
            resolution_summary: None,
            root_cause_category: None,
            csat_score: None,
            whatsapp_session_id: dto.whatsapp_session_id,
            linked_call_id: dto.linked_call_id,
            linked_invoice_id: dto.linked_invoice_id,
            workflow_execution_id: None,
            created_at: current_time,
            updated_at: current_time,
        }
    }

    /// Evaluates real-time SLA countdown status (within_sla, at_risk, breached).
    pub fn evaluate_sla(case: &mut SupportCase, current_time: DateTime<Utc>) -> SlaStatus {
        if case.status == "resolved" || case.status == "closed" {
            return SlaStatus::WithinSla;
        }

        // Check Resolution SLA breach
        if current_time > case.resolution_due_at {
            case.sla_status = "breached".to_string();
            return SlaStatus::Breached;
        }

        // Check First Response SLA breach if not yet responded
        if case.first_responded_at.is_none() && current_time > case.first_response_due_at {
            case.sla_status = "breached".to_string();
            return SlaStatus::Breached;
        }

        // Check if within 20% of resolution deadline (At Risk)
        let total_duration = case.resolution_due_at - case.created_at;
        let time_remaining = case.resolution_due_at - current_time;
        if time_remaining.num_seconds() > 0 && time_remaining.num_seconds() * 5 < total_duration.num_seconds() {
            case.sla_status = "at_risk".to_string();
            return SlaStatus::AtRisk;
        }

        case.sla_status = "within_sla".to_string();
        SlaStatus::WithinSla
    }

    /// Adds an omnichannel message and records first response timestamp if sent by an agent or AI copilot.
    pub fn add_message(
        case: &mut SupportCase,
        sender_type: &str,
        sender_name: &str,
        channel: &str,
        content: &str,
        external_message_id: Option<String>,
        sent_at: DateTime<Utc>,
    ) -> SupportCaseMessage {
        // Record first response if from agent/copilot
        if (sender_type == "agent" || sender_type == "ai_copilot") && case.first_responded_at.is_none() {
            case.first_responded_at = Some(sent_at);
            if case.status == "open" {
                case.status = "in_progress".to_string();
            }
        }

        case.updated_at = sent_at;

        SupportCaseMessage {
            id: Uuid::new_v4(),
            organization_id: case.organization_id,
            case_id: case.id,
            sender_type: sender_type.to_string(),
            sender_name: sender_name.to_string(),
            channel: channel.to_string(),
            content: content.to_string(),
            external_message_id,
            sent_at,
        }
    }

    /// Adds a staff-only internal private note.
    pub fn add_internal_note(
        case_id: Uuid,
        organization_id: Uuid,
        author_id: Option<Uuid>,
        author_name: &str,
        note_text: &str,
        is_pinned: bool,
    ) -> SupportCaseNote {
        SupportCaseNote {
            id: Uuid::new_v4(),
            organization_id,
            case_id,
            author_id,
            author_name: author_name.to_string(),
            note_text: note_text.to_string(),
            is_pinned,
            created_at: Utc::now(),
        }
    }

    /// Warm escalates the support case to a human supervisor.
    pub fn escalate_case(
        case: &mut SupportCase,
        supervisor_name: &str,
        reason: &str,
        escalated_at: DateTime<Utc>,
    ) -> SupportCaseAuditEvent {
        case.is_escalated = true;
        case.status = "escalated".to_string();
        case.priority = "urgent".to_string();
        case.escalated_to_supervisor_name = Some(supervisor_name.to_string());
        case.escalation_reason = Some(reason.to_string());
        case.escalated_at = Some(escalated_at);
        case.updated_at = escalated_at;

        SupportCaseAuditEvent {
            id: Uuid::new_v4(),
            organization_id: case.organization_id,
            case_id: case.id,
            event_type: "escalated".to_string(),
            actor_type: "supervisor".to_string(),
            actor_name: supervisor_name.to_string(),
            details: json!({
                "supervisor": supervisor_name,
                "reason": reason,
                "escalated_at": escalated_at,
            }),
            occurred_at: escalated_at,
        }
    }

    /// Formally resolves the support case.
    pub fn resolve_case(
        case: &mut SupportCase,
        resolution_summary: &str,
        root_cause_category: &str,
        csat_score: Option<i32>,
        resolved_at: DateTime<Utc>,
    ) -> SupportCaseAuditEvent {
        case.status = "resolved".to_string();
        case.resolved_at = Some(resolved_at);
        case.resolution_summary = Some(resolution_summary.to_string());
        case.root_cause_category = Some(root_cause_category.to_string());
        case.csat_score = csat_score;
        case.updated_at = resolved_at;

        SupportCaseAuditEvent {
            id: Uuid::new_v4(),
            organization_id: case.organization_id,
            case_id: case.id,
            event_type: "resolved".to_string(),
            actor_type: "agent".to_string(),
            actor_name: case.assigned_agent_name.clone().unwrap_or_else(|| "Support Staff".to_string()),
            details: json!({
                "summary": resolution_summary,
                "root_cause": root_cause_category,
                "csat_score": csat_score,
                "resolved_at": resolved_at,
            }),
            occurred_at: resolved_at,
        }
    }

    /// Links cross-system omnichannel context (Customer 360, WhatsApp, Telephony Call, Invoice, Workflow).
    pub fn link_omnichannel_context(
        case: &mut SupportCase,
        whatsapp_session_id: Option<String>,
        linked_call_id: Option<Uuid>,
        linked_invoice_id: Option<Uuid>,
        workflow_execution_id: Option<Uuid>,
    ) {
        if whatsapp_session_id.is_some() {
            case.whatsapp_session_id = whatsapp_session_id;
        }
        if linked_call_id.is_some() {
            case.linked_call_id = linked_call_id;
        }
        if linked_invoice_id.is_some() {
            case.linked_invoice_id = linked_invoice_id;
        }
        if workflow_execution_id.is_some() {
            case.workflow_execution_id = workflow_execution_id;
        }
        case.updated_at = Utc::now();
    }
}
