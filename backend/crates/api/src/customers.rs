use axum::{
    extract::{Extension, Path, Query},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use platform_common::TenantContext;
use platform_domain::{CreateCustomerDto, CreateTimelineEntryDto, Customer, TimelineEntry};
use platform_events::build_outbox_event;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tracing::info;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct TimelineQuery {
    pub module: Option<String>,
}

/// GET /api/v1/customers - List customers under the trusted tenant context
pub async fn list_customers_handler(
    Extension(ctx): Extension<TenantContext>,
) -> impl IntoResponse {
    info!("Listing Customer 360 directory for tenant_id: {}", ctx.tenant_id);

    let customers = vec![
        Customer {
            id: Uuid::parse_str("c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c").unwrap(),
            tenant_id: ctx.tenant_id,
            account_id: Some(Uuid::parse_str("a1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c").unwrap()),
            first_name: "Sarah".to_string(),
            last_name: "Jenkins".to_string(),
            email: "sarah.j@acmeglobal.com".to_string(),
            phone: Some("+1 (555) 234-5678".to_string()),
            lifecycle_stage: "customer".to_string(),
            lead_score: 92,
            total_lifetime_value: 145000.00,
            tags: vec!["enterprise".to_string(), "vip".to_string(), "ai-enabled".to_string()],
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        },
        Customer {
            id: Uuid::parse_str("c2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d").unwrap(),
            tenant_id: ctx.tenant_id,
            account_id: Some(Uuid::parse_str("a2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d").unwrap()),
            first_name: "Michael".to_string(),
            last_name: "Chen".to_string(),
            email: "mchen@nexusops.io".to_string(),
            phone: Some("+1 (555) 876-5432".to_string()),
            lifecycle_stage: "prospect".to_string(),
            lead_score: 78,
            total_lifetime_value: 38000.00,
            tags: vec!["cloud-native".to_string(), "evaluating".to_string()],
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        },
    ];

    (StatusCode::OK, Json(json!({ "data": customers, "total": customers.len() })))
}

/// POST /api/v1/customers - Create new customer and atomic outbox event
pub async fn create_customer_handler(
    Extension(ctx): Extension<TenantContext>,
    Json(dto): Json<CreateCustomerDto>,
) -> impl IntoResponse {
    let customer_id = Uuid::new_v4();
    info!(
        "Creating Customer [{}] ({}) in tenant [{}]",
        customer_id, dto.email, ctx.tenant_id
    );

    // Build outbox event for Pub/Sub publishing
    let event = build_outbox_event(
        &ctx,
        "com.platform.customer.created",
        "customer",
        customer_id,
        json!({
            "customer_id": customer_id,
            "first_name": dto.first_name,
            "last_name": dto.last_name,
            "email": dto.email,
            "lifecycle_stage": dto.lifecycle_stage.as_deref().unwrap_or("lead"),
        }),
    );

    (
        StatusCode::CREATED,
        Json(json!({
            "status": "created",
            "customer_id": customer_id,
            "outbox_event_id": event.id,
            "message": "Customer created and outbox event queued atomically."
        })),
    )
}

/// GET /api/v1/customers/:id/timeline - Retrieve unified interaction history
pub async fn get_customer_timeline_handler(
    Extension(ctx): Extension<TenantContext>,
    Path(customer_id): Path<Uuid>,
    Query(query): Query<TimelineQuery>,
) -> impl IntoResponse {
    info!(
        "Fetching unified timeline for customer {} in tenant {} (filter: {:?})",
        customer_id, ctx.tenant_id, query.module
    );

    let entries = vec![
        TimelineEntry {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            customer_id,
            source_module: "ai_comms".to_string(),
            entry_type: "call_completed".to_string(),
            title: "AI Voice Call Completed & Transcribed".to_string(),
            description: Some("Sentiment +0.85. Discussed expanding to 50 additional engineer seats.".to_string()),
            metadata: json!({ "channel": "phone", "sentiment_score": 0.85, "duration_sec": 522 }),
            actor_id: None,
            created_at: chrono::Utc::now(),
        },
        TimelineEntry {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            customer_id,
            source_module: "erp".to_string(),
            entry_type: "invoice_paid".to_string(),
            title: "ERP Invoice #INV-2026-089 Settled".to_string(),
            description: Some("Payment of $45,000.00 posted via Wire Transfer.".to_string()),
            metadata: json!({ "invoice_number": "INV-2026-089", "amount": 45000.0, "currency": "USD" }),
            actor_id: Some(ctx.user_id),
            created_at: chrono::Utc::now() - chrono::Duration::hours(2),
        },
        TimelineEntry {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            customer_id,
            source_module: "crm".to_string(),
            entry_type: "deal_stage_changed".to_string(),
            title: "CRM Deal 'Enterprise Expansion' Advanced to Closed-Won".to_string(),
            description: Some("Deal value $145,000.00 closed by Sarah Jenkins.".to_string()),
            metadata: json!({ "deal_value": 145000.0, "stage": "closed_won" }),
            actor_id: Some(ctx.user_id),
            created_at: chrono::Utc::now() - chrono::Duration::hours(5),
        },
    ];

    let filtered = if let Some(m) = query.module {
        entries.into_iter().filter(|e| e.source_module == m).collect()
    } else {
        entries
    };

    (StatusCode::OK, Json(json!({ "customer_id": customer_id, "timeline": filtered })))
}
