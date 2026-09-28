use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Supported Accounting Systems
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountingProviderType {
    Xero,
    ZohoBooks,
    QuickBooks,
}

impl AccountingProviderType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Xero => "xero",
            Self::ZohoBooks => "zoho_books",
            Self::QuickBooks => "quickbooks",
        }
    }
}

/// Synchronization Status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SyncStatus {
    Idle,
    InProgress,
    Synced,
    Error,
    PartialFailure,
}

/// Entity Mapping Record
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AccountingEntityMappingRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub connection_id: Uuid,
    pub provider: String,
    pub entity_type: String,
    pub local_entity_id: Uuid,
    pub remote_entity_id: String,
    pub remote_entity_number: Option<String>,
    pub sync_direction: String,
    pub local_checksum: Option<String>,
    pub remote_checksum: Option<String>,
    pub last_synced_at: DateTime<Utc>,
    pub sync_status: String,
    pub last_error_message: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Historical Sync Audit Log
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AccountingSyncLogRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub connection_id: Uuid,
    pub provider: String,
    pub sync_batch_id: Uuid,
    pub entity_type: String,
    pub sync_direction: String,
    pub entities_processed: i32,
    pub entities_created: i32,
    pub entities_updated: i32,
    pub entities_failed: i32,
    pub status: String,
    pub error_summary: Option<String>,
    pub detailed_log: serde_json::Value,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration_ms: i32,
}

/// Accounting Connection Record
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AccountingConnectionRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub provider: String,
    pub display_name: String,
    pub external_tenant_id: Option<String>,
    pub realm_id: Option<String>,
    pub auth_type: String,
    pub credentials_vault_ref: String,
    pub token_expires_at: Option<DateTime<Utc>>,
    pub sync_status: String,
    pub auto_sync_enabled: bool,
    pub sync_frequency_minutes: i32,
    pub sync_customers: bool,
    pub sync_invoices: bool,
    pub sync_payments: bool,
    pub webhook_endpoint_url: Option<String>,
    pub webhook_secret_vault_ref: Option<String>,
    pub last_synced_at: Option<DateTime<Utc>>,
    pub last_sync_error: Option<String>,
    pub consecutive_errors: i32,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ============================================================================
// DTOs
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectAccountingDto {
    pub provider: AccountingProviderType,
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
    pub authorization_code: Option<String>,
    pub external_tenant_id: Option<String>, // Xero Tenant ID or Zoho Org ID
    pub realm_id: Option<String>,           // QuickBooks Realm ID
    pub auto_sync: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerSyncDto {
    pub connection_id: Uuid,
    pub sync_entities: Vec<String>, // "customers", "invoices", "payments"
    pub full_resync: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncBatchResult {
    pub sync_batch_id: Uuid,
    pub provider: String,
    pub total_processed: usize,
    pub total_created: usize,
    pub total_updated: usize,
    pub total_failed: usize,
    pub duration_ms: u64,
}
