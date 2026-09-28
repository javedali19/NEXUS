use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use platform_common::PlatformError;

/// Supported Event Trigger Types.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkflowTriggerType {
    #[serde(rename = "invoice.created")]
    InvoiceCreated,
    #[serde(rename = "invoice.overdue")]
    InvoiceOverdue,
    #[serde(rename = "payment.received")]
    PaymentReceived,
    #[serde(rename = "lead.created")]
    LeadCreated,
    #[serde(rename = "message.received")]
    MessageReceived,
    #[serde(rename = "call.completed")]
    CallCompleted,
    #[serde(rename = "document.ocr_completed")]
    DocumentOcrCompleted,
    #[serde(rename = "customer.updated")]
    CustomerUpdated,
}

/// Supported Enterprise Action Types.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkflowActionType {
    SendMessage,
    CreateTask,
    CreatePaymentLink,
    UpdateCrm,
    Notify,
    StartAiAgent,
    ScheduleCall,
    CreateException,
    InvokeConnector,
}

/// Types of Workflow Graph Nodes (DAG).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkflowNodeType {
    Trigger,
    Condition,
    Action,
    Delay,
    Branch,
}

/// Execution Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkflowExecutionStatus {
    Pending,
    Running,
    WaitingDelay,
    Completed,
    Failed,
    Retrying,
    Cancelled,
}

/// Workflow Graph Node Definition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowNode {
    pub id: String,
    pub node_type: WorkflowNodeType,
    pub name: String,
    pub action_type: Option<WorkflowActionType>,
    pub config: Value,
    #[serde(default)]
    pub next_node_id: Option<String>,
    #[serde(default)]
    pub true_node_id: Option<String>,
    #[serde(default)]
    pub false_node_id: Option<String>,
    #[serde(default)]
    pub failure_node_id: Option<String>,
}

/// Workflow Retry Policy.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowRetryPolicy {
    pub max_retries: i32,
    pub backoff_multiplier: i32,
    pub initial_delay_seconds: i64,
}

impl Default for WorkflowRetryPolicy {
    fn default() -> Self {
        Self {
            max_retries: 3,
            backoff_multiplier: 2,
            initial_delay_seconds: 30,
        }
    }
}

/// Workflow Definition Domain Model.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowDefinition {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub name: String,
    pub description: Option<String>,
    pub trigger_type: WorkflowTriggerType,
    pub trigger_filter: Value,
    pub nodes: Vec<WorkflowNode>,
    pub is_active: bool,
    pub version: i32,
    pub required_permission: Option<String>,
    pub retry_policy: WorkflowRetryPolicy,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Step-Level Execution Trace.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepExecutionResult {
    pub node_id: String,
    pub node_name: String,
    pub node_type: WorkflowNodeType,
    pub action_type: Option<WorkflowActionType>,
    pub status: String, // "success", "failed", "skipped", "delayed"
    pub input_data: Value,
    pub output_data: Value,
    pub duration_ms: i64,
    pub error_message: Option<String>,
}

/// Workflow Execution Record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowExecution {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub workflow_id: Uuid,
    pub idempotency_key: String,
    pub trigger_event_id: String,
    pub trigger_event_type: String,
    pub trigger_payload: Value,
    pub status: WorkflowExecutionStatus,
    pub current_node_id: Option<String>,
    pub step_results: Vec<StepExecutionResult>,
    pub retry_count: i32,
    pub max_retries: i32,
    pub error_message: Option<String>,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub correlation_id: Option<String>,
    pub causation_id: Option<String>,
}

impl WorkflowDefinition {
    /// Generates standard unique idempotency key for this workflow and trigger event.
    pub fn compute_idempotency_key(org_id: Uuid, workflow_id: Uuid, event_id: &str) -> String {
        format!("{}:{}:{}", org_id, workflow_id, event_id)
    }

    /// Evaluates if a trigger payload matches the workflow filter conditions.
    pub fn evaluate_condition(condition_config: &Value, payload: &Value) -> bool {
        let field = condition_config.get("field").and_then(|f| f.as_str()).unwrap_or("");
        let operator = condition_config.get("operator").and_then(|o| o.as_str()).unwrap_or("eq");
        let target_val = condition_config.get("value");

        let actual_val = payload.get(field);

        match operator {
            "eq" => actual_val == target_val,
            "neq" => actual_val != target_val,
            "gt" => {
                let act_num = actual_val.and_then(|v| v.as_f64()).unwrap_or(0.0);
                let tgt_num = target_val.and_then(|v| v.as_f64()).unwrap_or(0.0);
                act_num > tgt_num
            }
            "lt" => {
                let act_num = actual_val.and_then(|v| v.as_f64()).unwrap_or(0.0);
                let tgt_num = target_val.and_then(|v| v.as_f64()).unwrap_or(0.0);
                act_num < tgt_num
            }
            "contains" => {
                let act_str = actual_val.and_then(|v| v.as_str()).unwrap_or("");
                let tgt_str = target_val.and_then(|v| v.as_str()).unwrap_or("");
                act_str.contains(tgt_str)
            }
            _ => true,
        }
    }
}
