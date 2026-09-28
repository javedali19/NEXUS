use uuid::Uuid;
use platform_integrations::storage::gcs::{
    DocumentUploadRequest, GcsStorageClient, StorageCategory,
};
use platform_integrations::auth::secret_manager::SecretManagerResolver;

#[test]
fn test_sha256_hash_computation() {
    let sample_bytes = b"Nexus Enterprise Document Payload Content";
    let hash = GcsStorageClient::compute_sha256_hash(sample_bytes);
    assert_eq!(hash.len(), 64);
    assert_eq!(
        hash,
        "bb3a2df33550e50b1a0378ea592a8e8071887010f3c5f49c04907a3cce8c5a45"
    );
}

#[test]
fn test_gcs_hierarchical_object_key() {
    let org_id = Uuid::nil();
    let doc_id = Uuid::nil();
    let key = GcsStorageClient::build_gcs_object_key(
        org_id,
        StorageCategory::Invoice,
        doc_id,
        1,
        "INV-2026-0041.pdf",
    );

    assert!(key.starts_with("tenants/00000000-0000-0000-0000-000000000000/invoices/"));
    assert!(key.ends_with("/00000000-0000-0000-0000-000000000000/v1/INV-2026-0041.pdf"));
}

#[test]
fn test_v4_signed_url_generation() {
    let resolver = SecretManagerResolver::new("nexus-prod".into(), false);
    let client = GcsStorageClient::new(
        "nexus-enterprise-tenant-assets".into(),
        "us-central1".into(),
        false,
        resolver,
    );

    let signed_url = client.generate_v4_signed_url(
        "tenants/org_01/contracts/2026/doc_101/v1/MSA.pdf",
        15,
    );

    assert!(signed_url.starts_with("https://storage.googleapis.com/nexus-enterprise-tenant-assets/"));
    assert!(signed_url.contains("X-Goog-Algorithm=GOOG4-RSA-SHA256"));
    assert!(signed_url.contains("X-Goog-Expires=900"));
}
