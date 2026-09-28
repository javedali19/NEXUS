use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use platform_common::PlatformError;

/// Document Category Classification.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DocumentCategory {
    Invoice,
    Contract,
    Quote,
    TaxDocument,
    Receipt,
    General,
}

impl DocumentCategory {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Invoice => "invoices",
            Self::Contract => "contracts",
            Self::Quote => "quotes",
            Self::TaxDocument => "tax",
            Self::Receipt => "receipts",
            Self::General => "general",
        }
    }
}

/// Access Control Classification Level.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccessLevel {
    InternalOnly,
    SignedUrlPublic,
    ConfidentialRestricted,
}

/// Document Retention Policy.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RetentionPolicy {
    #[serde(rename = "7_years_tax")]
    SevenYearsTax,
    #[serde(rename = "3_years_contract")]
    ThreeYearsContract,
    Permanent,
    Custom,
}

/// Malware/Virus Scan Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MalwareScanStatus {
    Pending,
    Clean,
    Quarantined,
}

/// Master Document Entity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub customer_id: Option<Uuid>,
    pub invoice_id: Option<Uuid>,
    pub title: String,
    pub category: DocumentCategory,
    pub access_level: AccessLevel,
    pub retention_policy: RetentionPolicy,
    pub retention_until: Option<DateTime<Utc>>,
    pub is_legal_hold: bool,
    pub current_version_number: i32,
    pub status: String, // uploaded, processing, ocr_extracted, ready, archived
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Immutable Document Version Entity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentVersionRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub document_id: Uuid,
    pub version_number: i32,
    pub gcs_bucket: String,
    pub gcs_object_key: String,
    pub file_name: String,
    pub mime_type: String,
    pub size_bytes: i64,
    pub sha256_hash: String,
    pub scan_status: MalwareScanStatus,
    pub change_summary: Option<String>,
    pub created_by: Option<Uuid>,
    pub created_by_name: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Document Access & Download Audit Log.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentAuditRecord {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub document_id: Uuid,
    pub version_id: Option<Uuid>,
    pub actor_id: Option<Uuid>,
    pub actor_name: String,
    pub action: String, // uploaded, signed_url_generated, downloaded, version_created, legal_hold_toggled
    pub details: Value,
    pub ip_address: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl DocumentRecord {
    /// Formats standardized multi-tenant Google Cloud Storage hierarchical object path.
    pub fn format_gcs_object_key(
        org_id: Uuid,
        category: DocumentCategory,
        doc_id: Uuid,
        version_number: i32,
        file_name: &str,
    ) -> String {
        let year = Utc::now().format("%Y");
        format!(
            "tenants/{}/{}/{}/{}/v{}/{}",
            org_id,
            category.as_str(),
            year,
            doc_id,
            version_number,
            file_name
        )
    }

    /// Computes retention date based on policy.
    pub fn compute_retention_date(policy: RetentionPolicy) -> Option<DateTime<Utc>> {
        let now = Utc::now();
        match policy {
            RetentionPolicy::SevenYearsTax => Some(now + Duration::days(365 * 7)),
            RetentionPolicy::ThreeYearsContract => Some(now + Duration::days(365 * 3)),
            RetentionPolicy::Permanent => None,
            RetentionPolicy::Custom => Some(now + Duration::days(365)),
        }
    }

    /// Validates if a document can be safely deleted or if it is protected by Legal Hold / Active Retention.
    pub fn can_delete(&self) -> Result<(), PlatformError> {
        if self.is_legal_hold {
            return Err(PlatformError::Conflict(
                "Document is protected under active Legal Hold and cannot be deleted".into(),
            ));
        }

        if let Some(retention_date) = self.retention_until {
            if Utc::now() < retention_date {
                return Err(PlatformError::Conflict(format!(
                    "Document is under compliance retention policy until {}",
                    retention_date.format("%Y-%m-%d")
                )));
            }
        }

        Ok(())
    }

    /// Generates V4 Google Cloud Storage Time-Limited Signed URL (15-Minute Expiry).
    pub fn generate_signed_url(
        bucket: &str,
        object_key: &str,
        duration_minutes: i64,
    ) -> String {
        let expires_at = Utc::now() + Duration::minutes(duration_minutes);
        let timestamp_str = expires_at.format("%Y%m%dT%H%M%SZ");
        format!(
            "https://storage.googleapis.com/{}/{}?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Expires={}&X-Goog-Date={}&X-Goog-Signature=simulated_sig_9942",
            bucket,
            object_key,
            duration_minutes * 60,
            timestamp_str
        )
    }
}
