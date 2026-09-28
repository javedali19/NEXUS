use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub mod invoice;
pub use invoice::*;

pub mod payment;
pub use payment::*;

pub mod accounting;
pub use accounting::*;

pub mod omnichannel;
pub use omnichannel::*;

pub mod workflow_engine;
pub use workflow_engine::*;

pub mod documents;
pub use documents::*;

pub mod ocr;
pub use ocr::*;

pub mod collections;
pub use collections::*;

pub mod autonomous_collections;
pub use autonomous_collections::*;

pub mod agent_control_plane;
pub use agent_control_plane::*;

pub mod ai_tool_gateway;
pub use ai_tool_gateway::*;

pub mod ai_sales_agent;
pub use ai_sales_agent::*;

pub mod ai_whatsapp_agent;
pub use ai_whatsapp_agent::*;

pub mod voice_telephony;
pub use voice_telephony::*;

pub mod voice_agent_integration;
pub use voice_agent_integration::*;

pub mod customer_support;
pub use customer_support::*;

pub mod executive_command_center;
pub use executive_command_center::*;

pub mod analytics_roi;
pub use analytics_roi::*;

pub mod country_pack;
pub use country_pack::*;

pub mod settings_policy;
pub use settings_policy::*;

pub mod erp_inventory;
pub use erp_inventory::*;

pub mod sales_flow;
pub use sales_flow::*;

pub mod global_search;
pub use global_search::*;

pub mod observability;
pub use observability::*;

pub mod cicd_pipeline;
pub use cicd_pipeline::*;

pub mod gcp_infrastructure;
pub use gcp_infrastructure::*;

pub mod security_review;
pub use security_review::*;

pub mod e2e_audit;
pub use e2e_audit::*;


// ============================================================================
// 1. Unified Customer Identity (Account, Customer, Contact)
// ============================================================================
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Account {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub name: String,
    pub industry: Option<String>,
    pub website: Option<String>,
    pub annual_revenue: Option<f64>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Customer {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub account_id: Option<Uuid>,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub lifecycle_stage: String, // lead, prospect, customer, churned
    pub lead_score: i32,
    pub total_lifetime_value: f64,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCustomerDto {
    pub account_id: Option<Uuid>,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub lifecycle_stage: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCustomerDto {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub phone: Option<String>,
    pub lifecycle_stage: Option<String>,
    pub lead_score: Option<i32>,
    pub total_lifetime_value: Option<f64>,
    pub tags: Option<Vec<String>>,
}

// ============================================================================
// 2. Centralized Universal Timeline
// ============================================================================
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TimelineEntry {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub customer_id: Uuid,
    pub source_module: String, // 'crm', 'erp', 'ai_comms', 'workflow', 'system'
    pub entry_type: String,   // 'invoice_paid', 'call_recorded', 'deal_stage_changed', 'email_sent'
    pub title: String,
    pub description: Option<String>,
    pub metadata: serde_json::Value,
    pub actor_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTimelineEntryDto {
    pub customer_id: Uuid,
    pub source_module: String,
    pub entry_type: String,
    pub title: String,
    pub description: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

// ============================================================================
// 3. Transactional Outbox Engine
// ============================================================================
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct OutboxEvent {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub event_type: String,
    pub aggregate_type: String,
    pub aggregate_id: Uuid,
    pub payload: serde_json::Value,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub published_at: Option<DateTime<Utc>>,
}

// ============================================================================
// 4. Shared Cross-Module Workflows
// ============================================================================
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Workflow {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub name: String,
    pub trigger_event: String,
    pub is_active: bool,
    pub steps_config: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecuteWorkflowDto {
    pub workflow_id: Uuid,
    pub trigger_event: String,
    pub event_payload: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowExecutionResult {
    pub execution_id: Uuid,
    pub workflow_id: Uuid,
    pub status: String,
    pub steps_executed: usize,
    pub logs: Vec<String>,
    pub completed_at: DateTime<Utc>,
}

// ============================================================================
// 5. Immutable Security Audit Log (Append-Only)
// ============================================================================
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AuditEventRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub actor_id: Option<Uuid>,
    pub actor_email: String,
    pub action: String,
    pub entity_type: String,
    pub entity_id: Uuid,
    pub source: String,
    pub correlation_id: Uuid,
    pub outcome: String, // "SUCCESS", "DENIED", "FAILED", "ABORTED"
    pub before_state: Option<serde_json::Value>,
    pub after_state: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAuditEventDto {
    pub actor_id: Option<Uuid>,
    pub actor_email: String,
    pub action: String,
    pub entity_type: String,
    pub entity_id: Uuid,
    pub source: String,
    pub correlation_id: Uuid,
    pub outcome: String,
    pub before_state: Option<serde_json::Value>,
    pub after_state: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

// ============================================================================
// 6. Platform-Wide Exception & Error Telemetry
// ============================================================================
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ExceptionRecord {
    pub id: Uuid,
    pub organization_id: Option<Uuid>,
    pub business_unit_id: Option<Uuid>,
    pub service_name: String,
    pub category: String, // "integration_failure", "payment_failure", "workflow_failure", "ai_failure", "ocr_failure", "communication_failure"
    pub exception_type: String,
    pub message: String,
    pub stack_trace: Option<String>,
    pub severity: String, // "info", "warning", "error", "critical"
    pub status: String,   // "open", "acknowledged", "resolved", "ignored"
    pub correlation_id: Uuid,
    pub entity_type: Option<String>,
    pub entity_id: Option<Uuid>,
    pub error_code: Option<String>,
    pub request_payload: Option<serde_json::Value>,
    pub response_payload: Option<serde_json::Value>,
    pub retry_count: i32,
    pub max_retries: i32,
    pub last_attempted_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub resolved_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateExceptionDto {
    pub service_name: String,
    pub category: String,
    pub exception_type: String,
    pub message: String,
    pub stack_trace: Option<String>,
    pub severity: String,
    pub correlation_id: Uuid,
    pub entity_type: Option<String>,
    pub entity_id: Option<Uuid>,
    pub error_code: Option<String>,
    pub request_payload: Option<serde_json::Value>,
    pub response_payload: Option<serde_json::Value>,
}

// ============================================================================
// 7. Universal Customer Timeline Event
// ============================================================================
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CustomerTimelineEventRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub customer_id: Uuid,
    pub source_module: String, // "crm", "erp", "telephony", "whatsapp", "ocr", "workflow", "audit"
    pub event_type: String,
    pub title: String,
    pub description: Option<String>,
    pub entity_type: Option<String>,
    pub entity_id: Option<Uuid>,
    pub actor_id: Option<Uuid>,
    pub actor_name: String,
    pub correlation_id: Uuid,
    pub metadata: serde_json::Value,
    pub occurred_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}
