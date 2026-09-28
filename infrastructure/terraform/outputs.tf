# ==============================================================================
# Terraform Outputs: All Provisioned GCP Infrastructure Resources
# ==============================================================================

# 1. Cloud Run Endpoints
output "api_service_url" {
  value       = google_cloud_run_v2_service.api_service.uri
  description = "Public HTTP endpoint URL of the Cloud Run API Gateway microservice"
}

output "web_service_url" {
  value       = google_cloud_run_v2_service.web_service.uri
  description = "Public HTTP endpoint URL of the Cloud Run Web Frontend application"
}

# 2. Cloud SQL PostgreSQL
output "postgres_instance_connection_name" {
  value       = google_sql_database_instance.postgres_instance.connection_name
  description = "Cloud SQL PostgreSQL Instance Connection Identifier"
}

output "postgres_private_ip" {
  value       = google_sql_database_instance.postgres_instance.private_ip_address
  description = "Internal Private IP address for Cloud SQL within the VPC"
}

# 3. Networking
output "vpc_network_name" {
  value       = google_compute_network.platform_vpc.name
  description = "Dedicated VPC Network Name"
}

output "serverless_connector_id" {
  value       = google_vpc_access_connector.serverless_connector.id
  description = "Serverless VPC Access Connector Resource ID"
}

# 4. Storage & Artifact Registry
output "cloud_storage_bucket_name" {
  value       = google_storage_bucket.tenant_assets.name
  description = "CMEK-encrypted multi-tenant storage bucket name"
}

output "artifact_registry_repo_id" {
  value       = google_artifact_registry_repository.platform_repo.id
  description = "GCP Artifact Registry Docker repository identifier"
}

# 5. Security & KMS
output "kms_keyring_name" {
  value       = google_kms_key_ring.platform_keyring.name
  description = "Cloud KMS Key Ring name"
}

output "kms_sql_key_id" {
  value       = google_kms_crypto_key.sql_key.id
  description = "Cloud KMS Customer-Managed Encryption Key (CMEK) ID for Cloud SQL"
}

output "cloud_armor_policy_name" {
  value       = google_compute_security_policy.cloud_armor.name
  description = "Cloud Armor Web Application Firewall (WAF) policy name"
}

# 6. Messaging & Tasks
output "pubsub_events_topic" {
  value       = google_pubsub_topic.events_topic.id
  description = "GCP Pub/Sub Events Topic Resource Path"
}

output "tasks_queue_id" {
  value       = google_cloud_tasks_queue.default_queue.id
  description = "Default Cloud Tasks Queue Resource Path"
}

# 7. Workload Identity Federation & Deployment Identity
output "workload_identity_pool_name" {
  value       = google_iam_workload_identity_pool.github_pool.name
  description = "Workload Identity Pool Resource Identifier"
}

output "workload_identity_provider_name" {
  value       = google_iam_workload_identity_pool_provider.github_provider.name
  description = "Workload Identity Pool Provider Full Identifier for GitHub Actions"
}

output "github_deployer_service_account_email" {
  value       = google_service_account.github_deployer.email
  description = "Service Account email impersonated by GitHub Actions via WIF"
}

output "secret_manager_secret_ids" {
  value       = [for s in google_secret_manager_secret.secrets : s.secret_id]
  description = "List of Secret Manager secret IDs provisioned for third-party API credentials"
}
