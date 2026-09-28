pub mod authorization;

pub use authorization::{
    evaluate_authorization, get_role_permissions, AuthDecision, Permission, ResourceAttributes,
};

use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantContext {
    pub tenant_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub user_id: Uuid,
    pub user_email: String,
    pub role: String,
}

impl TenantContext {
    pub fn new(
        tenant_id: Uuid,
        business_unit_id: Option<Uuid>,
        user_id: Uuid,
        user_email: String,
        role: String,
    ) -> Self {
        Self {
            tenant_id,
            business_unit_id,
            user_id,
            user_email,
            role,
        }
    }
}

/// Google Cloud Identity Platform (GCIP) Configuration & Status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoogleIdentityPlatformConfig {
    pub project_id: Option<String>,
    pub api_key: Option<String>,
    pub tenant_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status", content = "details")]
pub enum AuthProviderStatus {
    Configured {
        provider: String,
        project_id: String,
    },
    NotConfigured {
        provider: String,
        missing_keys: Vec<String>,
        instruction: String,
    },
}

impl GoogleIdentityPlatformConfig {
    pub fn from_env() -> Self {
        Self {
            project_id: std::env::var("GCP_IDENTITY_PLATFORM_PROJECT_ID")
                .ok()
                .or_else(|| std::env::var("GCP_PROJECT_ID").ok()),
            api_key: std::env::var("GCP_IDENTITY_PLATFORM_API_KEY").ok(),
            tenant_id: std::env::var("GCP_IDENTITY_PLATFORM_TENANT_ID").ok(),
        }
    }

    pub fn status(&self) -> AuthProviderStatus {
        let mut missing = Vec::new();
        if self.project_id.is_none() {
            missing.push("GCP_IDENTITY_PLATFORM_PROJECT_ID".to_string());
        }
        if self.api_key.is_none() {
            missing.push("GCP_IDENTITY_PLATFORM_API_KEY".to_string());
        }

        if missing.is_empty() {
            AuthProviderStatus::Configured {
                provider: "Google Cloud Identity Platform".to_string(),
                project_id: self.project_id.clone().unwrap(),
            }
        } else {
            AuthProviderStatus::NotConfigured {
                provider: "Google Cloud Identity Platform".to_string(),
                missing_keys: missing,
                instruction: "Provider credentials not yet supplied in environment. Running in mock/dev authentication mode.".to_string(),
            }
        }
    }
}

#[derive(Error, Debug)]
pub enum PlatformError {
    #[error("Authentication required: {0}")]
    Unauthenticated(String),

    #[error("Access denied: {0}")]
    Unauthorized(String),

    #[error("Organization membership invalid or forbidden: {0}")]
    ForbiddenOrganization(String),

    #[error("Entity not found: {0}")]
    NotFound(String),

    #[error("Validation failed: {0}")]
    ValidationError(String),

    #[error("Security violation: {0}")]
    SecurityViolation(String),

    #[error("Authorization error: {0}")]
    AuthorizationError(String),

    #[error("Policy violation: {0}")]
    PolicyViolation(String),

    #[error("Rate limit exceeded: {0}")]
    RateLimitExceeded(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Internal server error: {0}")]
    Internal(String),
}

pub fn init_telemetry() {
    let subscriber = tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .json()
        .finish();

    let _ = tracing::subscriber::set_global_default(subscriber);
}
