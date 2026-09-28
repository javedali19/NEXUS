# ==============================================================================
# Google Cloud Platform Required APIs Enablement
# Enables all required core, networking, security, data, and compute services
# ==============================================================================

locals {
  required_gcp_apis = [
    "run.googleapis.com",              # Google Cloud Run (Serverless Containers)
    "sqladmin.googleapis.com",         # Cloud SQL Admin API (PostgreSQL 15)
    "pubsub.googleapis.com",           # Cloud Pub/Sub (Event Bus)
    "cloudtasks.googleapis.com",       # Cloud Tasks (Asynchronous Queues)
    "cloudscheduler.googleapis.com",   # Cloud Scheduler (Cron Jobs)
    "storage.googleapis.com",          # Cloud Storage (Multi-tenant Assets)
    "secretmanager.googleapis.com",    # Secret Manager (Third-Party API Credentials)
    "cloudkms.googleapis.com",          # Cloud KMS (Customer-Managed Encryption Keys)
    "artifactregistry.googleapis.com", # Artifact Registry (OCI Docker Containers)
    "iam.googleapis.com",              # Identity and Access Management
    "compute.googleapis.com",          # Compute Engine (VPC, Subnets, Cloud Armor)
    "servicenetworking.googleapis.com",# Service Networking (Private IP VPC Peering)
    "vpcaccess.googleapis.com",        # Serverless VPC Access (Cloud Run to Cloud SQL)
    "monitoring.googleapis.com",       # Cloud Monitoring (Metrics & Alerting)
    "logging.googleapis.com",          # Cloud Logging (Structured Telemetry)
  ]
}

resource "google_project_service" "gcp_services" {
  for_each                   = toset(local.required_gcp_apis)
  project                    = var.gcp_project_id
  service                    = each.key
  disable_on_destroy         = false
  disable_dependent_services = false
}
