pub mod accounting;
pub mod auth;
pub mod communications;
pub mod connector;
pub mod payments;
pub mod providers;
pub mod registry;
pub mod resilience;
pub mod storage;
pub mod ocr;
pub mod regional_connectors;

pub use accounting::*;
pub use communications::*;
pub use payments::*;
pub use storage::*;
pub use ocr::*;
pub use regional_connectors::*;

pub use auth::{AuthConfig, ApiKeyConfig, BasicAuthConfig, HmacSecretConfig, OAuth2Config, VaultRef};
pub use connector::{ConnectionTestResult, Connector, HealthStatus, IntegrationCapability, NormalizedEvent};
pub use providers::generic_rest::GenericRestConnector;
pub use providers::salesforce::SalesforceConnector;
pub use providers::stripe::StripeConnector;
pub use providers::twilio::TwilioConnector;
pub use registry::ConnectorRegistry;
pub use resilience::{RateLimiter, RetryPolicy};

use chrono::{DateTime, Utc};
use platform_common::PlatformError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

/// Integration Connection Domain Model.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct IntegrationConnectionRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub provider: String,
    pub connection_type: String,
    pub auth_type: String,
    pub auth_credentials: Value,
    pub webhook_endpoint_url: Option<String>,
    pub webhook_secret: Option<String>,
    pub rate_limit_per_minute: i32,
    pub capabilities: Value,
    pub health_status: String,
    pub last_health_check_at: Option<DateTime<Utc>>,
    pub last_health_error: Option<String>,
    pub consecutive_failure_count: i32,
    pub environment: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
