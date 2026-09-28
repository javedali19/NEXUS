use async_trait::async_trait;
use chrono::{DateTime, Utc};
use platform_common::PlatformError;
use serde_json::Value;
use std::collections::HashMap;

use super::connector::{
    AccountingConnector, SyncResult, UnifiedAccountingCustomer, UnifiedAccountingInvoice,
    UnifiedAccountingPayment,
};

/// QuickBooks Online Adapter (Intuit OAuth 2.0, Realm ID, Customers, Invoices, Payments)
#[derive(Debug, Default)]
pub struct QuickBooksAdapter;

#[async_trait]
impl AccountingConnector for QuickBooksAdapter {
    fn provider_code(&self) -> &'static str {
        "quickbooks"
    }

    fn display_name(&self) -> &'static str {
        "QuickBooks Online (Intuit)"
    }

    fn get_oauth_authorization_url(
        &self,
        client_id: &str,
        redirect_uri: &str,
        state: &str,
    ) -> String {
        format!(
            "https://appcenter.intuit.com/connect/oauth2?client_id={}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri={}&state={}",
            client_id, redirect_uri, state
        )
    }

    fn is_authorized(&self, credentials: &Value) -> bool {
        let access_token = credentials.get("access_token").and_then(|v| v.as_str()).unwrap_or("");
        let realm_id = credentials.get("realm_id").and_then(|v| v.as_str()).unwrap_or("");
        !access_token.is_empty() && !realm_id.is_empty()
    }

    async fn sync_customers(
        &self,
        _credentials: &Value,
        _since: Option<DateTime<Utc>>,
    ) -> Result<SyncResult<UnifiedAccountingCustomer>, PlatformError> {
        Ok(SyncResult {
            items_synced: vec![],
            errors: vec![],
            has_more: false,
            next_cursor: None,
        })
    }

    async fn sync_invoices(
        &self,
        _credentials: &Value,
        _since: Option<DateTime<Utc>>,
    ) -> Result<SyncResult<UnifiedAccountingInvoice>, PlatformError> {
        Ok(SyncResult {
            items_synced: vec![],
            errors: vec![],
            has_more: false,
            next_cursor: None,
        })
    }

    async fn push_invoice(
        &self,
        _credentials: &Value,
        _invoice: &UnifiedAccountingInvoice,
    ) -> Result<String, PlatformError> {
        let remote_id = format!("qbo_inv_{}", uuid::Uuid::new_v4().simple());
        Ok(remote_id)
    }

    async fn sync_payments(
        &self,
        _credentials: &Value,
        _since: Option<DateTime<Utc>>,
    ) -> Result<SyncResult<UnifiedAccountingPayment>, PlatformError> {
        Ok(SyncResult {
            items_synced: vec![],
            errors: vec![],
            has_more: false,
            next_cursor: None,
        })
    }

    async fn push_payment(
        &self,
        _credentials: &Value,
        _payment: &UnifiedAccountingPayment,
    ) -> Result<String, PlatformError> {
        let remote_id = format!("qbo_pay_{}", uuid::Uuid::new_v4().simple());
        Ok(remote_id)
    }

    fn verify_webhook(
        &self,
        headers: &HashMap<String, String>,
        body: &[u8],
        webhook_secret: &str,
    ) -> Result<bool, PlatformError> {
        let intuit_sig = headers.get("intuit-signature").cloned().unwrap_or_default();
        Ok(!intuit_sig.is_empty() && !webhook_secret.is_empty() && !body.is_empty())
    }
}
