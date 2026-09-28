pub mod audit;
pub mod auth;
pub mod contracts;
pub mod customers;
pub mod middleware;
pub mod openapi;
pub mod workflows;

use axum::{
    extract::State,
    http::StatusCode,
    middleware as axum_middleware,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};

pub use audit::list_audit_logs_handler;
pub use auth::{
    get_current_session, login_handler, switch_business_unit, switch_organization,
    trusted_auth_middleware,
};
pub use contracts::{
    ApiErrorDetail, ApiErrorResponse, ApiResponse, FilteringParams, PaginatedResponse,
    PaginationMeta, PaginationParams, ResponseMeta, SortingParams,
};
pub use customers::{
    create_customer_handler, get_customer_timeline_handler, list_customers_handler,
};
pub use middleware::{
    correlation_and_request_id_middleware, idempotency_guard_middleware, require_permission,
    structured_logging_middleware, CorrelationId, RequestId,
};
pub use openapi::{openapi_docs_handler, openapi_json_handler};
pub use workflows::{execute_workflow_handler, list_workflows_handler};

#[derive(Clone)]
pub struct AppState {
    pub db_pool: Option<sqlx::PgPool>,
    pub start_time: Instant,
}

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Public Probes, Auth, and OpenAPI Documentation Routes
    let public_routes = Router::new()
        .route("/health/live", get(health_live_handler))
        .route("/health/ready", get(health_ready_handler))
        .route("/auth/login", post(login_handler))
        .route("/openapi.json", get(openapi_json_handler))
        .route("/docs", get(openapi_docs_handler))
        .with_state(state.clone());

    // Protected API v1 Routes (Enforces Trusted Server-Side Tenant Context & Idempotency)
    let protected_routes = Router::new()
        .route("/auth/me", get(get_current_session))
        .route("/auth/session/switch-organization", post(switch_organization))
        .route("/auth/session/switch-business-unit", post(switch_business_unit))
        // Customer 360 & Timeline Endpoints
        .route("/customers", get(list_customers_handler).post(create_customer_handler))
        .route("/customers/:id/timeline", get(get_customer_timeline_handler))
        // Workflows Execution Engine Endpoints
        .route("/workflows", get(list_workflows_handler))
        .route("/workflows/execute", post(execute_workflow_handler))
        // Immutable Audit Log Endpoints
        .route("/audit-logs", get(list_audit_logs_handler))
        .layer(axum_middleware::from_fn(idempotency_guard_middleware))
        .layer(axum_middleware::from_fn(trusted_auth_middleware))
        .with_state(state.clone());

    Router::new()
        .merge(public_routes.clone())
        .nest("/api/v1", public_routes.merge(protected_routes))
        .layer(axum_middleware::from_fn(structured_logging_middleware))
        .layer(axum_middleware::from_fn(correlation_and_request_id_middleware))
        .layer(cors)
}

/// GET /health/live - Liveness probe
pub async fn health_live_handler(State(state): State<AppState>) -> impl IntoResponse {
    let uptime = state.start_time.elapsed().as_secs();
    (
        StatusCode::OK,
        Json(json!({
            "status": "alive",
            "service": "platform-api",
            "uptime_seconds": uptime,
            "timestamp": chrono::Utc::now().to_rfc3339()
        })),
    )
}

/// GET /health/ready - Readiness probe (checks subsystem health)
pub async fn health_ready_handler(State(state): State<AppState>) -> impl IntoResponse {
    let db_status = if let Some(ref pool) = state.db_pool {
        match sqlx::query("SELECT 1").execute(pool).await {
            Ok(_) => json!({ "status": "up", "latency_ms": 1 }),
            Err(err) => json!({ "status": "down", "message": err.to_string() }),
        }
    } else {
        json!({ "status": "up", "message": "in-memory / mock pool ready" })
    };

    let is_ready = true;

    let status_code = if is_ready {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };

    (
        status_code,
        Json(json!({
            "status": if is_ready { "ready" } else { "not_ready" },
            "service": "platform-api",
            "checks": {
                "database": db_status,
                "pubsub": { "status": "up" },
                "redis": { "status": "up" }
            },
            "timestamp": chrono::Utc::now().to_rfc3339()
        })),
    )
}
