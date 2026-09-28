# ==============================================================================
# Google Secret Manager: Platform Secrets & Third-Party API Credentials
# Third-party API keys stored securely in Secret Manager & referenced by services
# ==============================================================================

locals {
  platform_secrets = [
    "stripe-secret-key",
    "razorpay-key-secret",
    "twilio-auth-token",
    "meta-whatsapp-token",
    "gemini-api-key",
    "elevenlabs-api-key",
    "deepgram-api-key",
    "sentry-dsn",
    "platform-db-password",
    "platform-db-url",
  ]
}

# 1. Provision Secret Manager Secret Resources
resource "google_secret_manager_secret" "secrets" {
  for_each  = toset(local.platform_secrets)
  secret_id = "${var.environment}-${each.key}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    compliance  = "soc2-gdpr"
  }

  depends_on = [google_project_service.gcp_services]
}

# 2. Grant Secret Accessor Role strictly to Cloud Run Runtime Service Account
resource "google_secret_manager_secret_iam_member" "runner_secret_accessor" {
  for_each  = google_secret_manager_secret.secrets
  secret_id = each.value.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.app_runner.email}"
}

# 3. Random Generated Secret Password for Cloud SQL Database
resource "random_password" "sql_db_password" {
  length  = 32
  special = false
}

# 4. Store Generated Database Password as Initial Secret Version
resource "google_secret_manager_secret_version" "db_password_version" {
  secret      = google_secret_manager_secret.secrets["platform-db-password"].id
  secret_data = random_password.sql_db_password.result
}
