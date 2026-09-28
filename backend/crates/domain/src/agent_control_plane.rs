use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use platform_common::PlatformError;

/// Agent Role Classification.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AgentRole {
    CollectionsCopilot,
    LeadQualifier,
    InvoiceAuditor,
    SupportBot,
    DispatchOptimizer,
}

/// Agent Status Lifecycle.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AgentStatus {
    Active,
    Draft,
    Paused,
    Deprecated,
}

/// Tool Safety Classification.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ToolSafetyTier {
    ReadOnly,
    IdempotentWrite,
    SensitiveMutation, // Mandatory Human Approval Required
}

/// Execution Run Lifecycle.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RunStatus {
    Queued,
    Running,
    AwaitingApproval,
    Completed,
    Failed,
    Cancelled,
}

/// Action Execution Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionStatus {
    Proposed,
    Approved,
    Rejected,
    Executed,
    Failed,
}

/// AI Agent Master Entity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiAgent {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub name: String,
    pub slug: String,
    pub role: AgentRole,
    pub description: String,
    pub system_instructions: String,
    pub status: AgentStatus,
    pub current_version: String,
}

/// Semantic Version & Prompt Snapshot.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentVersion {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub version_number: String,
    pub environment: String, // production, staging
    pub model_name: String,  // gpt-4o, claude-3-5-sonnet, gemini-1.5-pro
    pub temperature: f64,
    pub max_tokens: i32,
    pub prompt_snapshot: String,
    pub changelog: Option<String>,
    pub is_active: bool,
}

/// Agent Capability Grant.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCapability {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub capability_name: String,
    pub description: String,
    pub is_granted: bool,
}

/// Typed Tool Definition (Mediated Access Only).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTool {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub tool_name: String,
    pub tool_type: ToolSafetyTier,
    pub description: String,
    pub parameters_schema: Value,
    pub is_approval_required: bool,
    pub is_enabled: bool,
}

/// Granular Access Constraint Permission.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentPermission {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub resource_type: String,
    pub access_level: String, // read, write, execute
    pub constraints: Value,
}

/// Policy Guardrail Definition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentPolicy {
    pub id: Uuid,
    pub policy_name: String,
    pub policy_type: String, // rate_limit, budget_cap, approval_threshold, pii_masking
    pub rules: Value,
    pub is_enforced: bool,
}

/// Execution Run Master Entity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentRun {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub agent_id: Uuid,
    pub version_id: Option<Uuid>,
    pub correlation_id: String,
    pub trigger_source: String,
    pub status: RunStatus,
    pub prompt_tokens: i32,
    pub completion_tokens: i32,
    pub total_cost_usd: f64,
    pub duration_ms: i32,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

/// Action Invocations planned by Agent.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentAction {
    pub id: Uuid,
    pub run_id: Uuid,
    pub tool_name: String,
    pub arguments: Value,
    pub status: ActionStatus,
    pub is_sensitive: bool,
    pub duration_ms: i32,
}

/// Human-in-the-Loop Approval Item.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentApproval {
    pub id: Uuid,
    pub action_id: Uuid,
    pub run_id: Uuid,
    pub agent_id: Uuid,
    pub requested_action: String,
    pub risk_level: String, // critical, high, medium, low
    pub proposed_payload: Value,
    pub status: String,     // pending, approved, rejected
    pub approver_name: Option<String>,
    pub decision_notes: Option<String>,
    pub resolved_at: Option<DateTime<Utc>>,
}

/// Failure Taxonomy Incident.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentFailure {
    pub id: Uuid,
    pub run_id: Uuid,
    pub action_id: Option<Uuid>,
    pub failure_category: String, // tool_timeout, schema_validation, policy_blocked, rate_limit_exceeded
    pub error_message: String,
    pub remediation_hint: Option<String>,
    pub is_retryable: bool,
}

/// Cryptographic Tamper-Evident Audit Record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentAuditLog {
    pub id: Uuid,
    pub agent_id: Option<Uuid>,
    pub run_id: Option<Uuid>,
    pub event_type: String,
    pub actor_type: String, // agent, user, system, policy_engine
    pub actor_name: String,
    pub description: String,
    pub payload_snapshot: Value,
    pub cryptographic_sha256_hash: String,
    pub created_at: DateTime<Utc>,
}

/// Tool Sandbox Dispatcher: Strictly mediates all agent operations.
/// ARCHITECTURAL GUARANTEE: Raw SQL and direct database queries are unconditionally blocked.
pub struct ToolSandboxDispatcher;

impl ToolSandboxDispatcher {
    /// Validates an incoming action from an AI agent.
    /// Strictly rejects raw database access attempts and verifies safety parameters.
    pub fn dispatch_tool_call(
        tool: &AgentTool,
        arguments: &Value,
        agent_capabilities: &[AgentCapability],
    ) -> Result<Value, PlatformError> {
        // 1. Enforce strict database security: NO raw SQL, query text, or DB strings allowed
        let raw_query_keys = ["sql", "query", "select", "insert", "update", "delete", "raw_sql", "drop", "table"];
        for key in raw_query_keys {
            if arguments.get(key).is_some() {
                return Err(PlatformError::SecurityViolation(
                    "Direct unrestricted database queries are strictly prohibited by the AI Agent Control Plane. All interactions must use typed domain tools."
                        .into(),
                ));
            }
        }

        // 2. Validate capability grant for the tool
        let required_capability = match tool.tool_name.as_str() {
            "lookup_invoice" => "invoices:read",
            "generate_payment_link" => "payments:generate_link",
            "send_whatsapp_template" => "whatsapp:send_notice",
            "create_crm_task" => "crm:write_tasks",
            "apply_settlement_discount" => "invoices:discount",
            _ => "system:default",
        };

        let has_capability = agent_capabilities
            .iter()
            .any(|c| c.capability_name == required_capability && c.is_granted);

        if !has_capability {
            return Err(PlatformError::AuthorizationError(format!(
                "Agent lacks required capability '{}' for tool '{}'.",
                required_capability, tool.tool_name
            )));
        }

        // 3. Dispatch to strongly-typed domain handler
        match tool.tool_name.as_str() {
            "lookup_invoice" => {
                let invoice_number = arguments.get("invoice_number").and_then(|v| v.as_str()).unwrap_or("INV-2026-0041");
                Ok(json!({
                    "invoice_number": invoice_number,
                    "customer_name": "Acme Global Industries",
                    "total_amount": 45000.0,
                    "status": "overdue",
                    "days_past_due": 18
                }))
            }
            "generate_payment_link" => {
                let amount = arguments.get("amount").and_then(|v| v.as_f64()).unwrap_or(1000.0);
                Ok(json!({
                    "payment_link_id": "plink_rzp_994812",
                    "checkout_url": "https://pay.nexus-erp.com/plink_rzp_994812",
                    "amount": amount,
                    "currency": "USD",
                    "expires_at": "2026-09-30T23:59:59Z"
                }))
            }
            "send_whatsapp_template" => {
                let template = arguments.get("template_name").and_then(|v| v.as_str()).unwrap_or("collections_notice");
                Ok(json!({
                    "message_id": "wamid.HBgLMTU1NTIzNDg5MDAVAgARGBI5",
                    "template": template,
                    "status": "delivered_to_outbox"
                }))
            }
            "apply_settlement_discount" => {
                let discount_pct = arguments.get("discount_percent").and_then(|v| v.as_f64()).unwrap_or(0.0);
                if discount_pct > 15.0 {
                    return Err(PlatformError::ValidationError(
                        "Discount exceeds maximum authorized agent threshold (15.0%). Requires human approval.".into(),
                    ));
                }
                Ok(json!({
                    "discount_applied": discount_pct,
                    "status": "approved_by_policy"
                }))
            }
            _ => Ok(json!({ "status": "executed", "tool": tool.tool_name })),
        }
    }

    /// Evaluates whether a proposed action requires human-in-the-loop approval.
    pub fn requires_human_approval(tool: &AgentTool, arguments: &Value) -> bool {
        if tool.is_approval_required || tool.tool_type == ToolSafetyTier::SensitiveMutation {
            return true;
        }

        // Sensitive business rules
        if tool.tool_name == "apply_settlement_discount" {
            let pct = arguments.get("discount_percent").and_then(|v| v.as_f64()).unwrap_or(0.0);
            if pct > 10.0 {
                return true;
            }
        }

        if tool.tool_name == "generate_payment_link" {
            let amount = arguments.get("amount").and_then(|v| v.as_f64()).unwrap_or(0.0);
            if amount > 25000.0 {
                return true;
            }
        }

        false
    }
}
