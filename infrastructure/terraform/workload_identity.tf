# ==============================================================================
# GCP Workload Identity Federation (WIF) for GitHub Actions
# Secure, keyless OIDC authentication - Zero long-lived private keys
# ==============================================================================

# 1. Dedicated Workload Identity Pool for GitHub Actions
resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions CI/CD Pool"
  description               = "Identity pool for GitHub Actions token exchange without long-lived credentials"
  disabled                  = false
}

# 2. OIDC Provider configured for GitHub token issuer
resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-actions-provider"
  display_name                       = "GitHub Actions OIDC Provider"
  description                        = "OIDC identity provider mapping GitHub assertions to GCP attributes"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.actor"            = "assertion.actor"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
  }

  attribute_condition = "assertion.repository == '${var.github_repository}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# 3. Dedicated Service Account for CI/CD Deployment
resource "google_service_account" "github_deployer" {
  account_id   = "sa-github-deployer"
  display_name = "GitHub Actions CI/CD Deployer"
  description  = "Service account assumed strictly via Workload Identity Federation for deployments"
}

# 4. IAM Binding: Authorize GitHub repository to impersonate the deployment Service Account
resource "google_service_account_iam_member" "wif_impersonation" {
  service_account_id = google_service_account.github_deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repository}"
}

# 5. Deployment Permissions: Cloud Run Admin & Artifact Registry Writer
resource "google_project_iam_member" "cloud_run_admin" {
  project = var.gcp_project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.github_deployer.email}"
}

resource "google_project_iam_member" "artifact_registry_writer" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_deployer.email}"
}

# 6. Cloud Run Application Runtime Service Account
resource "google_service_account" "app_runner" {
  account_id   = "sa-platform-runner"
  display_name = "Cloud Run Application Runtime Service Account"
  description  = "Runtime service account for Cloud Run microservices"
}

# Allow deployer service account to act as Cloud Run runtime service account
resource "google_service_account_iam_member" "sa_act_as" {
  service_account_id = google_service_account.app_runner.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_deployer.email}"
}
