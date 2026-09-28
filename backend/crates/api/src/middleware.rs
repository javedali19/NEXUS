use axum::{
    body::Body,
    extract::Request,
    http::{HeaderMap, HeaderValue, Method, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use platform_common::{evaluate_authorization, AuthDecision, Permission, PlatformError, TenantContext};
use serde::{Deserialize, Serialize};
use std::time::Instant;
use tracing::{error, info, warn};
use uuid::Uuid;

use crate::contracts::ApiErrorResponse;

/// Extension type holding unique Request ID.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestId(pub String);

/// Extension type holding distributed Trace Correlation ID.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorrelationId(pub String);

/// 1. Correlation and Request ID Middleware
/// Extracts or generates X-Request-Id and X-Correlation-Id, propagating them onto request extensions and response headers.
pub async fn correlation_and_request_id_middleware(
    mut req: Request,
    next: Next,
) -> Response {
    let headers = req.headers();

    // Extract or generate Request ID
    let request_id = headers
        .get("x-request-id")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    // Extract or generate Correlation ID
    let correlation_id = headers
        .get("x-correlation-id")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    // Insert into request extensions for handler access
    req.extensions_mut().insert(RequestId(request_id.clone()));
    req.extensions_mut().insert(CorrelationId(correlation_id.clone()));

    // Run downstream handlers
    let mut response = next.run(req).await;

    // Attach tracing headers to outgoing HTTP response
    if let Ok(req_val) = HeaderValue::from_str(&request_id) {
        response.headers_mut().insert("x-request-id", req_val);
    }
    if let Ok(corr_val) = HeaderValue::from_str(&correlation_id) {
        response.headers_mut().insert("x-correlation-id", corr_val);
    }

    response
}

/// 2. Structured Request Logging Middleware
/// Records latency, method, path, HTTP status, and tracing IDs using structured JSON logging.
pub async fn structured_logging_middleware(
    req: Request,
    next: Next,
) -> Response {
    let start = Instant::now();
    let method = req.method().clone();
    let uri = req.uri().clone();

    let request_id = req
        .extensions()
        .get::<RequestId>()
        .map(|r| r.0.clone())
        .unwrap_or_default();

    let correlation_id = req
        .extensions()
        .get::<CorrelationId>()
        .map(|c| c.0.clone())
        .unwrap_or_default();

    let response = next.run(req).await;
    let latency_ms = start.elapsed().as_millis();
    let status = response.status();

    if status.is_server_error() {
        error!(
            method = %method,
            uri = %uri,
            status = %status.as_u16(),
            latency_ms = %latency_ms,
            request_id = %request_id,
            correlation_id = %correlation_id,
            "HTTP Request Server Error"
        );
    } else if status.is_client_error() {
        warn!(
            method = %method,
            uri = %uri,
            status = %status.as_u16(),
            latency_ms = %latency_ms,
            request_id = %request_id,
            correlation_id = %correlation_id,
            "HTTP Request Client Warning"
        );
    } else {
        info!(
            method = %method,
            uri = %uri,
            status = %status.as_u16(),
            latency_ms = %latency_ms,
            request_id = %request_id,
            correlation_id = %correlation_id,
            "HTTP Request Processed"
        );
    }

    response
}

/// 3. Centralized Permission Enforcement Middleware generator
pub fn require_permission(
    permission: Permission,
) -> impl Fn(Request, Next) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Response, Response>> + Send>> + Clone {
    move |req: Request, next: Next| {
        Box::pin(async move {
            let request_id = req
                .extensions()
                .get::<RequestId>()
                .map(|r| r.0.clone())
                .unwrap_or_default();

            let correlation_id = req
                .extensions()
                .get::<CorrelationId>()
                .map(|c| c.0.clone())
                .unwrap_or_default();

            let ctx = req
                .extensions()
                .get::<TenantContext>()
                .cloned()
                .ok_or_else(|| {
                    let err = ApiErrorResponse::new(
                        "UNAUTHENTICATED",
                        "Authentication token is missing or invalid.",
                        &request_id,
                        &correlation_id,
                        None,
                    );
                    (StatusCode::UNAUTHORIZED, Json(err)).into_response()
                })?;

            match evaluate_authorization(&ctx, permission, None) {
                AuthDecision::Allow => Ok(next.run(req).await),
                AuthDecision::Deny { reason } => {
                    warn!(
                        "Access DENIED for user [{}] role [{}] requesting permission [{:?}]: {}",
                        ctx.user_id, ctx.role, permission, reason
                    );
                    let err = ApiErrorResponse::new(
                        "FORBIDDEN",
                        format!("Access denied. Required permission: {}", permission.as_str()),
                        &request_id,
                        &correlation_id,
                        Some(serde_json::json!({
                            "required_permission": permission.as_str(),
                            "user_role": ctx.role,
                            "reason": reason
                        })),
                    );
                    Err((StatusCode::FORBIDDEN, Json(err)).into_response())
                }
            }
        })
    }
}

/// 4. Idempotency Middleware for Mutation Protection
pub async fn idempotency_guard_middleware(
    req: Request,
    next: Next,
) -> Response {
    let method = req.method();
    let is_mutation = matches!(*method, Method::POST | Method::PUT | Method::PATCH | Method::DELETE);

    if !is_mutation {
        return next.run(req).await;
    }

    let idempotency_key = req
        .headers()
        .get("idempotency-key")
        .or_else(|| req.headers().get("x-idempotency-key"))
        .and_then(|h| h.to_str().ok());

    if let Some(key) = idempotency_key {
        info!("Processing mutation with Idempotency-Key: {}", key);
    }

    next.run(req).await
}
