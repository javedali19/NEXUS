use chrono::{DateTime, Duration, Utc};
use platform_common::PlatformError;
use serde::{Deserialize, Serialize};

/// Supported authentication schemes for external integrations.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AuthConfig {
    OAuth2(OAuth2Config),
    ApiKey(ApiKeyConfig),
    HmacSecret(HmacSecretConfig),
    BasicAuth(BasicAuthConfig),
}

/// OAuth 2.0 Authorization & Token Refresh Configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuth2Config {
    pub client_id: String,
    pub client_secret: String,
    pub token_url: String,
    pub authorization_url: String,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub scopes: Vec<String>,
}

impl OAuth2Config {
    /// Checks if the current access token is expired or within the refresh window (5 mins).
    pub fn is_token_expired(&self) -> bool {
        match self.expires_at {
            Some(exp) => Utc::now() + Duration::minutes(5) >= exp,
            None => true,
        }
    }

    /// Sets fresh tokens following successful OAuth exchange or refresh.
    pub fn update_tokens(&mut self, access_token: String, refresh_token: Option<String>, expires_in_seconds: i64) {
        self.access_token = Some(access_token);
        if let Some(r) = refresh_token {
            self.refresh_token = Some(r);
        }
        self.expires_at = Some(Utc::now() + Duration::seconds(expires_in_seconds));
    }
}

/// Static API Key Configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKeyConfig {
    pub api_key: String,
    pub header_name: String, // e.g. "Authorization", "X-API-Key"
    pub prefix: Option<String>, // e.g. "Bearer "
}

impl ApiKeyConfig {
    pub fn new(api_key: impl Into<String>, header_name: impl Into<String>, prefix: Option<String>) -> Self {
        Self {
            api_key: api_key.into(),
            header_name: header_name.into(),
            prefix,
        }
    }

    pub fn format_header_value(&self) -> String {
        match &self.prefix {
            Some(p) => format!("{}{}", p, self.api_key),
            None => self.api_key.clone(),
        }
    }
}

/// Webhook HMAC Signing Secret Configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HmacSecretConfig {
    pub webhook_secret: String,
    pub signature_header: String, // e.g. "Stripe-Signature", "X-Twilio-Signature"
    pub algorithm: String,        // "sha256", "sha1"
}

/// HTTP Basic Authentication Configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BasicAuthConfig {
    pub username: String,
    pub password: String,
}

/// Secure Credentials Vault Reference wrapper.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultRef {
    pub vault_id: String,
    pub key_path: String,
}

pub mod secret_manager;
pub use secret_manager::*;
