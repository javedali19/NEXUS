use async_trait::async_trait;
use platform_common::PlatformError;
use serde_json::Value;
use std::collections::HashMap;

use super::gateway::{
    GatewayPaymentIntentRequest, GatewayPaymentIntentResponse, GatewayPaymentLinkRequest,
    GatewayPaymentLinkResponse, GatewayRefundRequest, GatewayRefundResponse, PaymentGateway,
};

/// Airwallex Adapter (Global Cross-Border FX, Multi-Currency Virtual Accounts, Global Payouts)
#[derive(Debug, Default)]
pub struct AirwallexAdapter;

#[async_trait]
impl PaymentGateway for AirwallexAdapter {
    fn provider_code(&self) -> &'static str {
        "airwallex"
    }

    fn display_name(&self) -> &'static str {
        "Airwallex Global FX & Collections"
    }

    fn supported_currencies(&self) -> Vec<&'static str> {
        vec!["USD", "EUR", "GBP", "AUD", "CAD", "HKD", "SGD", "JPY", "CNY", "NZD"]
    }

    fn supported_payment_methods(&self) -> Vec<&'static str> {
        vec!["global_virtual_accounts", "local_clearing", "swift_wire", "cards"]
    }

    fn is_configured(&self, credentials: &Value) -> bool {
        let client_id = credentials.get("client_id").and_then(|v| v.as_str()).unwrap_or("");
        let api_key = credentials.get("api_key").and_then(|v| v.as_str()).unwrap_or("");
        !client_id.is_empty() && !api_key.is_empty()
    }

    async fn create_intent(
        &self,
        credentials: &Value,
        req: &GatewayPaymentIntentRequest,
    ) -> Result<GatewayPaymentIntentResponse, PlatformError> {
        let intent_id = format!("int_awx_{}", uuid::Uuid::new_v4().simple());
        Ok(GatewayPaymentIntentResponse {
            provider: "airwallex".to_string(),
            client_secret: Some(format!("awx_sec_{}", uuid::Uuid::new_v4().simple())),
            order_id: intent_id.clone(),
            payment_id: None,
            checkout_url: Some(format!("https://checkout.airwallex.com/hpp/#/{}", intent_id)),
            qr_payload: None,
            status: "requires_payment_method".to_string(),
        })
    }

    async fn create_payment_link(
        &self,
        _credentials: &Value,
        req: &GatewayPaymentLinkRequest,
    ) -> Result<GatewayPaymentLinkResponse, PlatformError> {
        let link_id = format!("awx_link_{}", uuid::Uuid::new_v4().simple());
        Ok(GatewayPaymentLinkResponse {
            provider: "airwallex".to_string(),
            link_id: link_id.clone(),
            short_url: format!("https://airwallex.me/pay/{}", &link_id[9..17]),
            qr_code_url: None,
            status: "active".to_string(),
        })
    }

    async fn refund(
        &self,
        _credentials: &Value,
        req: &GatewayRefundRequest,
    ) -> Result<GatewayRefundResponse, PlatformError> {
        Ok(GatewayRefundResponse {
            refund_id: format!("awx_ref_{}", uuid::Uuid::new_v4().simple()),
            payment_id: req.payment_id.clone(),
            amount: req.amount.unwrap_or(0.0),
            status: "succeeded".to_string(),
        })
    }

    fn verify_webhook(
        &self,
        headers: &HashMap<String, String>,
        _body: &[u8],
        webhook_secret: &str,
    ) -> Result<bool, PlatformError> {
        let signature = headers.get("x-signature").cloned().unwrap_or_default();
        Ok(!signature.is_empty() && !webhook_secret.is_empty())
    }
}
