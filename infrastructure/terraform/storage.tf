# ==============================================================================
# Google Cloud Storage Multi-Tenant Assets & Documents
# Encrypted via Cloud KMS (CMEK) with Uniform Bucket-Level Access & Lifecycle Tiering
# ==============================================================================

# 1. GCS Service Account Identity for KMS CMEK
data "google_storage_project_service_account" "gcs_account" {
  project = var.gcp_project_id
}

resource "google_kms_crypto_key_iam_member" "gcs_cmek_user" {
  crypto_key_id = google_kms_crypto_key.storage_key.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_account.email_address}"
}

# 2. Multi-Tenant Attachments & Document Storage Bucket
resource "google_storage_bucket" "tenant_assets" {
  name                        = "${var.gcp_project_id}-${var.environment}-tenant-assets"
  location                    = var.gcp_region
  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = google_kms_crypto_key.storage_key.id
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    encryption  = "cmek"
  }

  depends_on = [google_kms_crypto_key_iam_member.gcs_cmek_user]
}
