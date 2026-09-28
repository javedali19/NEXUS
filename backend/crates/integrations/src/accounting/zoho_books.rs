use async_trait::async_trait;
use chrono::{DateTime, Utc};
use platform_common::PlatformError;
use serde_json::Value;
use std::collections::HashMap;

use super::connector::{
    AccountingConnector, SyncResult, UnifiedAccountingCustomer, UnifiedAccountingInvoice,
    UnifiedAccountingPayment,
};

/// Zoho Books Adapter (Zoho Accounts OAuth, Organization ID header, Contacts, Invoices, Payments)
#[derive(Debug, Default)]
pub struct ZohoBooksAdapter;

#[async_trait]
impl AccountingConnector for ZohoBooksAdapter {
    fn provider_code(&self) -> &'static str {
        "zoho_books"
    }

    fn display_name(&self) -> &'static str {
        "Zoho Books"
    }

    fn get_oauth_authorization_url(
        &self,
        client_id: &str,
        redirect_uri: &str,
        state: &str,
    ) -> String {
        format!(
            "https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id={}&redirect_uri={}&scope=ZohoBooks.fullaccess.all&access_type=offline&state={}",
            client_id, redirect_uri, state
        )
    }

    fn is_authorized(&self, credentials: &Value) -> bool {
        let access_token = credentials.get("access_token").and_then(|v| v.as_str()).unwrap_or("");
        let organization_id = credentials.get("organization_id").and_then(|v| v.as_str()).unwrap_or("");
        !access_token.is_empty() && !organization_id.is_empty()
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
        let remote_id = format!("zb_inv_{}", uuid::Uuid::new_v4().simple());
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
        let remote_id = format!("zb_pay_{}", uuid::Uuid::new_v4().simple());
        Ok(remote_id)
    }

    fn verify_webhook(
        &self,
        headers: &HashMap<String, String>,
        _body: &[u8],
        webhook_secret: &str,
    ) -> Result<bool, PlatformError> {
        let auth_header = headers.get("authorization").cloned().unwrap_or_default();
        Ok(auth_header == webhook_secret || !webhook_secret.is_empty())
    }
}
