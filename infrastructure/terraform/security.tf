# ==============================================================================
# Security Infrastructure: Cloud KMS & Cloud Armor
# Customer-Managed Encryption Keys (CMEK) and Web Application Firewall (WAF)
# ==============================================================================

# 1. Cloud KMS Key Ring
resource "google_kms_key_ring" "platform_keyring" {
  name     = "${var.environment}-platform-keyring"
  location = var.gcp_region

  depends_on = [google_project_service.gcp_services]
}

# 2. CMEK CryptoKey for Cloud SQL PostgreSQL
resource "google_kms_crypto_key" "sql_key" {
  name            = "${var.environment}-sql-key"
  key_ring        = google_kms_key_ring.platform_keyring.id
  rotation_period = "7776000s" # 90 days automatic rotation

  lifecycle {
    prevent_destroy = false
  }
}

# 3. CMEK CryptoKey for Cloud Storage Multi-Tenant Assets
resource "google_kms_crypto_key" "storage_key" {
  name            = "${var.environment}-storage-key"
  key_ring        = google_kms_key_ring.platform_keyring.id
  rotation_period = "7776000s" # 90 days automatic rotation

  lifecycle {
    prevent_destroy = false
  }
}

# 4. CryptoKey for General Application Data Envelope Encryption
resource "google_kms_crypto_key" "app_data_key" {
  name            = "${var.environment}-app-data-key"
  key_ring        = google_kms_key_ring.platform_keyring.id
  rotation_period = "7776000s"

  lifecycle {
    prevent_destroy = false
  }
}

# 5. Cloud SQL Service Identity & KMS CryptoKey Encrypter/Decrypter Binding
resource "google_project_service_identity" "gcp_sa_cloud_sql" {
  provider = google-beta
  project  = var.gcp_project_id
  service  = "sqladmin.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "sql_cmek_user" {
  crypto_key_id = google_kms_crypto_key.sql_key.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.gcp_sa_cloud_sql.email}"
}

# 6. Cloud Armor Security Policy (WAF)
resource "google_compute_security_policy" "cloud_armor" {
  name        = "${var.environment}-cloud-armor-policy"
  description = "Enterprise WAF: OWASP Top 10 protection and rate limiting (${var.environment})"

  # Rule 1: OWASP SQL Injection Mitigation
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "Block OWASP SQL Injection Attempts"
  }

  # Rule 2: OWASP Cross-Site Scripting (XSS) Mitigation
  rule {
    action   = "deny(403)"
    priority = "1001"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "Block OWASP Cross-Site Scripting Attacks"
  }

  # Rule 3: OWASP Local File Inclusion (LFI) Mitigation
  rule {
    action   = "deny(403)"
    priority = "1002"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('lfi-v33-stable')"
      }
    }
    description = "Block OWASP Local File Inclusion Attempts"
  }

  # Rule 4: OWASP Remote Code Execution (RCE) Mitigation
  rule {
    action   = "deny(403)"
    priority = "1003"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('rce-v33-stable')"
      }
    }
    description = "Block OWASP Remote Code Execution"
  }

  # Rule 5: Rate Limiting (1,000 requests per client IP per minute)
  rule {
    action   = "rate_based_ban"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 1000
        interval_sec = 60
      }
      ban_threshold {
        count        = 2000
        interval_sec = 60
      }
      ban_duration_sec = 600
    }
    description = "Enforce rate limiting: 1000 req/min with 10-minute temporary ban"
  }

  # Rule 6: Default Allow Rule
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow traffic with audit logging"
  }

  depends_on = [google_project_service.gcp_services]
}
