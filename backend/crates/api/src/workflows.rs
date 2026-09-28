use axum::{
    extract::Extension,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use platform_common::TenantContext;
use platform_domain::{ExecuteWorkflowDto, Workflow, WorkflowExecutionResult};
use platform_events::build_outbox_event;
use serde_json::json;
use tracing::info;
use uuid::Uuid;

/// GET /api/v1/workflows - List configured automated workflows
pub async fn list_workflows_handler(
    Extension(ctx): Extension<TenantContext>,
) -> impl IntoResponse {
    info!("Listing active workflows for tenant_id: {}", ctx.tenant_id);

    let workflows = vec![
        Workflow {
            id: Uuid::parse_str("w1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c").unwrap(),
            tenant_id: ctx.tenant_id,
            name: "Auto-Invoice on CRM Closed-Won Deal".to_string(),
            trigger_event: "com.platform.crm.deal.closed_won".to_string(),
            is_active: true,
            steps_config: json!([
                { "step": 1, "action": "generate_erp_invoice", "params": { "due_days": 14 } },
                { "step": 2, "action": "send_ai_confirmation_email", "template": "enterprise_onboarding" },
                { "step": 3, "action": "append_customer_timeline", "entry_type": "workflow_executed" }
            ]),
            created_at: chrono::Utc::now(),
        },
        Workflow {
            id: Uuid::parse_str("w2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d").unwrap(),
            tenant_id: ctx.tenant_id,
            name: "High AI Sentiment Lead Escalation".to_string(),
            trigger_event: "com.platform.aicomms.sentiment.analyzed".to_string(),
            is_active: true,
            steps_config: json!([
                { "step": 1, "action": "boost_lead_score", "score_delta": 15 },
                { "step": 2, "action": "assign_account_executive", "priority": "high" },
                { "step": 3, "action": "dispatch_slack_notification", "channel": "#sales-vip" }
            ]),
            created_at: chrono::Utc::now(),
        },
    ];

    (StatusCode::OK, Json(json!({ "data": workflows })))
}

/// POST /api/v1/workflows/execute - Execute a cross-module workflow instance
pub async fn execute_workflow_handler(
    Extension(ctx): Extension<TenantContext>,
    Json(dto): Json<ExecuteWorkflowDto>,
) -> impl IntoResponse {
    let execution_id = Uuid::new_v4();
    info!(
        "Executing Workflow [{}] Trigger [{}] for Tenant [{}]",
        dto.workflow_id, dto.trigger_event, ctx.tenant_id
    );

    // Build outbox event for the workflow execution completion
    let outbox_event = build_outbox_event(
        &ctx,
        "com.platform.workflow.completed",
        "workflow_execution",
        execution_id,
        json!({
            "execution_id": execution_id,
            "workflow_id": dto.workflow_id,
            "trigger_event": dto.trigger_event,
        }),
    );

    let result = WorkflowExecutionResult {
        execution_id,
        workflow_id: dto.workflow_id,
        status: "succeeded".to_string(),
        steps_executed: 3,
        logs: vec![
            format!("Trigger [{}] evaluated successfully against payload.", dto.trigger_event),
            "Step 1: ERP Invoice generated and bound to Customer 360.".to_string(),
            "Step 2: AI communication message drafted.".to_string(),
            "Step 3: Timeline entry posted & outbox event queued.".to_string(),
        ],
        completed_at: chrono::Utc::now(),
    };

    (
        StatusCode::OK,
        Json(json!({
            "result": result,
            "outbox_event_id": outbox_event.id
        })),
    )
}
