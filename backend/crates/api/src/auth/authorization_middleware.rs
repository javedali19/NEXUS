use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use platform_common::{evaluate_authorization, AuthDecision, Permission, TenantContext};
use serde_json::json;
use tracing::warn;

/// Middleware generator enforcing a specific required permission
pub async fn enforce_permission(
    permission: Permission,
    req: Request,
    next: Next,
) -> Result<Response, Response> {
    let ctx = req
        .extensions()
        .get::<TenantContext>()
        .cloned()
        .ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(json!({
                    "error": "UNAUTHENTICATED",
                    "message": "Authentication required. TenantContext missing from request."
                })),
            )
                .into_response()
        })?;

    match evaluate_authorization(&ctx, permission, None) {
        AuthDecision::Allow => Ok(next.run(req).await),
        AuthDecision::Deny { reason } => {
            warn!(
                "Authorization DENIED: User [{}] in Tenant [{}] lacks [{:?}]. Reason: {}",
                ctx.user_id, ctx.tenant_id, permission, reason
            );
            Err((
                StatusCode::FORBIDDEN,
                Json(json!({
                    "error": "FORBIDDEN",
                    "required_permission": permission.as_str(),
                    "user_role": ctx.role,
                    "reason": reason
                })),
            )
                .into_response())
        }
    }
}
