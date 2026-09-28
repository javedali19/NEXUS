use async_trait::async_trait;
use chrono::{DateTime, Utc};
use platform_common::PlatformError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayPaymentIntentRequest {
    pub customer_id: Uuid,
    pub customer_email: String,
    pub customer_phone: Option<String>,
    pub amount: f64,
    pub currency: String,
    pub description: String,
    pub return_url: Option<String>,
    pub metadata: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayPaymentIntentResponse {
    pub provider: String,
    pub client_secret: Option<String>,
    pub order_id: String,
    pub payment_id: Option<String>,
    pub checkout_url: Option<String>,
    pub qr_payload: Option<String>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayPaymentLinkRequest {
    pub amount: f64,
    pub currency: String,
    pub customer_name: String,
    pub customer_email: String,
    pub customer_phone: Option<String>,
    pub description: String,
    pub expires_at: DateTime<Utc>,
    pub reference_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayPaymentLinkResponse {
    pub provider: String,
    pub link_id: String,
    pub short_url: String,
    pub qr_code_url: Option<String>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayRefundRequest {
    pub payment_id: String,
    pub amount: Option<f64>,
    pub currency: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayRefundResponse {
    pub refund_id: String,
    pub payment_id: String,
    pub amount: f64,
    pub status: String,
}

/// Unified abstraction contract implemented by all payment providers
#[async_trait]
pub trait PaymentGateway: Send + Sync {
    fn provider_code(&self) -> &'static str;
    fn display_name(&self) -> &'static str;
    fn supported_currencies(&self) -> Vec<&'static str>;
    fn supported_payment_methods(&self) -> Vec<&'static str>;

    /// Safe credential verification check
    fn is_configured(&self, credentials: &Value) -> bool;

    /// Create Payment Intent / Order
    async fn create_intent(
        &self,
        credentials: &Value,
        req: &GatewayPaymentIntentRequest,
    ) -> Result<GatewayPaymentIntentResponse, PlatformError>;

    /// Create Hosted Payment Link
    async fn create_payment_link(
        &self,
        credentials: &Value,
        req: &GatewayPaymentLinkRequest,
    ) -> Result<GatewayPaymentLinkResponse, PlatformError>;

    /// Execute Refund
    async fn refund(
        &self,
        credentials: &Value,
        req: &GatewayRefundRequest,
    ) -> Result<GatewayRefundResponse, PlatformError>;

    /// Verify Webhook Signature
    fn verify_webhook(
        &self,
        headers: &std::collections::HashMap<String, String>,
        body: &[u8],
        webhook_secret: &str,
    ) -> Result<bool, PlatformError>;
}
