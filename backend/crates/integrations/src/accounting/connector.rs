use async_trait::async_trait;
use chrono::{DateTime, Utc};
use platform_common::PlatformError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedAccountingCustomer {
    pub local_id: Uuid,
    pub remote_id: Option<String>,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub company_name: Option<String>,
    pub billing_address: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedAccountingInvoice {
    pub local_id: Uuid,
    pub remote_id: Option<String>,
    pub invoice_number: String,
    pub customer_remote_id: String,
    pub issue_date: String,
    pub due_date: String,
    pub currency: String,
    pub subtotal: f64,
    pub tax_amount: f64,
    pub total_amount: f64,
    pub balance_due: f64,
    pub status: String,
    pub line_items: Vec<UnifiedAccountingLineItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedAccountingLineItem {
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub line_total: f64,
    pub account_code: Option<String>,
    pub tax_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedAccountingPayment {
    pub local_id: Uuid,
    pub remote_id: Option<String>,
    pub invoice_remote_id: String,
    pub amount: f64,
    pub currency: String,
    pub payment_date: DateTime<Utc>,
    pub payment_reference: Option<String>,
    pub account_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResult<T> {
    pub items_synced: Vec<T>,
    pub errors: Vec<String>,
    pub has_more: bool,
    pub next_cursor: Option<String>,
}

/// Unified Trait implemented by all Accounting Providers (Xero, Zoho Books, QuickBooks)
#[async_trait]
pub trait AccountingConnector: Send + Sync {
    fn provider_code(&self) -> &'static str;
    fn display_name(&self) -> &'static str;

    /// Generates OAuth 2.0 Authorization URL
    fn get_oauth_authorization_url(
        &self,
        client_id: &str,
        redirect_uri: &str,
        state: &str,
    ) -> String;

    /// Check if credentials are valid in vault
    fn is_authorized(&self, credentials: &Value) -> bool;

    /// Inbound/Outbound Customer Sync
    async fn sync_customers(
        &self,
        credentials: &Value,
        since: Option<DateTime<Utc>>,
    ) -> Result<SyncResult<UnifiedAccountingCustomer>, PlatformError>;

    /// Inbound/Outbound Invoice Sync
    async fn sync_invoices(
        &self,
        credentials: &Value,
        since: Option<DateTime<Utc>>,
    ) -> Result<SyncResult<UnifiedAccountingInvoice>, PlatformError>;

    /// Push local ERP invoice to remote accounting system
    async fn push_invoice(
        &self,
        credentials: &Value,
        invoice: &UnifiedAccountingInvoice,
    ) -> Result<String, PlatformError>;

    /// Inbound/Outbound Payment Sync
    async fn sync_payments(
        &self,
        credentials: &Value,
        since: Option<DateTime<Utc>>,
    ) -> Result<SyncResult<UnifiedAccountingPayment>, PlatformError>;

    /// Push local settled payment to remote accounting system
    async fn push_payment(
        &self,
        credentials: &Value,
        payment: &UnifiedAccountingPayment,
    ) -> Result<String, PlatformError>;

    /// Webhook Verification & Normalization
    fn verify_webhook(
        &self,
        headers: &HashMap<String, String>,
        body: &[u8],
        webhook_secret: &str,
    ) -> Result<bool, PlatformError>;
}
