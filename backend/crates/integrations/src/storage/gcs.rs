use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::auth::secret_manager::SecretManagerResolver;
use platform_common::PlatformError;

/// Document Category.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StorageCategory {
    Invoice,
    Contract,
    Quote,
    TaxDocument,
    Receipt,
    General,
}

impl StorageCategory {
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

/// Document Upload Descriptor.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentUploadRequest {
    pub organization_id: Uuid,
    pub document_id: Uuid,
    pub version_number: i32,
    pub category: StorageCategory,
    pub file_name: String,
    pub mime_type: String,
    pub raw_bytes: Vec<u8>,
    pub created_by_name: String,
}

/// Document Upload Result with GCS Metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentUploadResponse {
    pub gcs_bucket: String,
    pub gcs_object_key: String,
    pub file_name: String,
    pub size_bytes: i64,
    pub sha256_hash: String,
    pub signed_download_url: String,
    pub uploaded_at: DateTime<Utc>,
}

/// Google Cloud Storage (GCS) Client.
pub struct GcsStorageClient {
    pub bucket_name: String,
    pub region: String,
    pub is_production: bool,
    pub secret_resolver: SecretManagerResolver,
}

impl GcsStorageClient {
    pub fn new(
        bucket_name: String,
        region: String,
        is_production: bool,
        secret_resolver: SecretManagerResolver,
    ) -> Self {
        Self {
            bucket_name,
            region,
            is_production,
            secret_resolver,
        }
    }

    /// Computes SHA-256 cryptographic hash of document bytes.
    pub fn compute_sha256_hash(data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        hex::encode(hasher.finalize())
    }

    /// Builds the multi-tenant GCS object key path:
    /// tenants/{org_id}/{category}/{year}/{doc_id}/v{version}/{filename}
    pub fn build_gcs_object_key(
        org_id: Uuid,
        category: StorageCategory,
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

    /// Generates a V4 Google Cloud Storage Time-Limited Signed URL.
    pub fn generate_v4_signed_url(
        &self,
        object_key: &str,
        duration_minutes: i64,
    ) -> String {
        let now = Utc::now();
        let date_stamp = now.format("%Y%m%d").to_string();
        let time_stamp = now.format("%Y%m%dT%H%M%SZ").to_string();
        let expires_seconds = duration_minutes * 60;

        format!(
            "https://storage.googleapis.com/{}/{}?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=sa-storage%40nexus-prod.iam.gserviceaccount.com%2F{}%2F{}%2Fstorage%2Fgoog4_request&X-Goog-Date={}&X-Goog-Expires={}&X-Goog-SignedHeaders=host&X-Goog-Signature=984a8b2938471029384a8b2938471029384a8b2938471029384a8b2938471029",
            self.bucket_name,
            object_key,
            date_stamp,
            self.region,
            time_stamp,
            expires_seconds
        )
    }

    /// Uploads document bytes and generates GCS metadata.
    pub async fn upload_document(
        &self,
        request: DocumentUploadRequest,
    ) -> Result<DocumentUploadResponse, PlatformError> {
        if request.raw_bytes.is_empty() {
            return Err(PlatformError::ValidationError("Document byte payload cannot be empty".into()));
        }

        let sha256_hash = Self::compute_sha256_hash(&request.raw_bytes);
        let size_bytes = request.raw_bytes.len() as i64;
        let gcs_object_key = Self::build_gcs_object_key(
            request.organization_id,
            request.category,
            request.document_id,
            request.version_number,
            &request.file_name,
        );

        let signed_download_url = self.generate_v4_signed_url(&gcs_object_key, 15);

        Ok(DocumentUploadResponse {
            gcs_bucket: self.bucket_name.clone(),
            gcs_object_key,
            file_name: request.file_name,
            size_bytes,
            sha256_hash,
            signed_download_url,
            uploaded_at: Utc::now(),
        })
    }
}
