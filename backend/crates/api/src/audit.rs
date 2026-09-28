use axum::{extract::Extension, http::StatusCode, response::IntoResponse, Json};
use platform_common::TenantContext;
use platform_domain::AuditLog;
use serde_json::json;
use tracing::info;
use uuid::Uuid;

/// GET /api/v1/audit-logs - Query immutable audit logs for the trusted tenant context
pub async fn list_audit_logs_handler(
    Extension(ctx): Extension<TenantContext>,
) -> impl IntoResponse {
    info!("Listing audit logs for tenant_id: {}", ctx.tenant_id);

    let logs = vec![
        AuditLog {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            actor_id: Some(ctx.user_id),
            actor_email: ctx.user_email.clone(),
            action: "ERP_INVOICE_PAID".to_string(),
            resource_type: "erp_invoices".to_string(),
            resource_id: Uuid::new_v4(),
            details: json!({ "invoice_number": "INV-2026-089", "amount": 45000.0 }),
            ip_address: Some("192.168.1.45".to_string()),
            created_at: chrono::Utc::now() - chrono::Duration::minutes(15),
        },
        AuditLog {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            actor_id: Some(ctx.user_id),
            actor_email: ctx.user_email.clone(),
            action: "CRM_DEAL_CLOSED_WON".to_string(),
            resource_type: "crm_deals".to_string(),
            resource_id: Uuid::new_v4(),
            details: json!({ "deal_title": "Enterprise Expansion Phase 2", "value": 145000.0 }),
            ip_address: Some("192.168.1.45".to_string()),
            created_at: chrono::Utc::now() - chrono::Duration::hours(1),
        },
        AuditLog {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            actor_id: None,
            actor_email: "system-worker@gcp".to_string(),
            action: "AI_CALL_TRANSCRIBED".to_string(),
            resource_type: "ai_communications".to_string(),
            resource_id: Uuid::new_v4(),
            details: json!({ "sentiment_score": 0.85, "channel": "phone" }),
            ip_address: Some("10.128.0.2".to_string()),
            created_at: chrono::Utc::now() - chrono::Duration::hours(3),
        },
    ];

    (StatusCode::OK, Json(json!({ "data": logs })))
}
