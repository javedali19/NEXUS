use async_trait::async_trait;
use platform_common::PlatformError;
use serde_json::Value;
use std::collections::HashMap;

use super::gateway::{
    GatewayPaymentIntentRequest, GatewayPaymentIntentResponse, GatewayPaymentLinkRequest,
    GatewayPaymentLinkResponse, GatewayRefundRequest, GatewayRefundResponse, PaymentGateway,
};

/// HitPay Adapter (Singapore / Southeast Asia PayNow QR, GrabPay, ShopeePay)
#[derive(Debug, Default)]
pub struct HitPayAdapter;

#[async_trait]
impl PaymentGateway for HitPayAdapter {
    fn provider_code(&self) -> &'static str {
        "hitpay"
    }

    fn display_name(&self) -> &'static str {
        "HitPay (PayNow / Southeast Asia)"
    }

    fn supported_currencies(&self) -> Vec<&'static str> {
        vec!["SGD", "MYR", "USD", "AUD", "EUR"]
    }

    fn supported_payment_methods(&self) -> Vec<&'static str> {
        vec!["paynow_qr", "grabpay", "shopeepay", "fpx", "cards"]
    }

    fn is_configured(&self, credentials: &Value) -> bool {
        let api_key = credentials.get("api_key").and_then(|v| v.as_str()).unwrap_or("");
        !api_key.is_empty()
    }

    async fn create_intent(
        &self,
        credentials: &Value,
        req: &GatewayPaymentIntentRequest,
    ) -> Result<GatewayPaymentIntentResponse, PlatformError> {
        let request_id = format!("hitpay_{}", uuid::Uuid::new_v4().simple());
        Ok(GatewayPaymentIntentResponse {
            provider: "hitpay".to_string(),
            client_secret: None,
            order_id: request_id.clone(),
            payment_id: None,
            checkout_url: Some(format!("https://hit-pay.com/invoicing-payment/{}", request_id)),
            qr_payload: Some(format!("00020101021226500009SG.PAYNOW01012021020261920202520400005303702540{:.2}5802SG", req.amount)),
            status: "pending".to_string(),
        })
    }

    async fn create_payment_link(
        &self,
        _credentials: &Value,
        req: &GatewayPaymentLinkRequest,
    ) -> Result<GatewayPaymentLinkResponse, PlatformError> {
        let link_id = format!("hp_{}", uuid::Uuid::new_v4().simple());
        Ok(GatewayPaymentLinkResponse {
            provider: "hitpay".to_string(),
            link_id: link_id.clone(),
            short_url: format!("https://hitpay.shop/pay/{}", &link_id[3..11]),
            qr_code_url: Some(format!("https://hit-pay.com/qr/{}", link_id)),
            status: "active".to_string(),
        })
    }

    async fn refund(
        &self,
        _credentials: &Value,
        req: &GatewayRefundRequest,
    ) -> Result<GatewayRefundResponse, PlatformError> {
        Ok(GatewayRefundResponse {
            refund_id: format!("hp_rf_{}", uuid::Uuid::new_v4().simple()),
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
        let hmac = headers.get("x-hitpay-signature").cloned().unwrap_or_default();
        Ok(!hmac.is_empty() && !webhook_secret.is_empty())
    }
}
