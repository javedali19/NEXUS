# ==============================================================================
# Terraform Variables & Configuration Parameters
# ==============================================================================

variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Project ID"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
  description = "Primary GCP Deployment Region"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment identifier (development, staging, production)"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "db_tier" {
  type        = string
  default     = "db-custom-2-7680"
  description = "Cloud SQL PostgreSQL Machine Instance Type"
}

variable "db_disk_size_gb" {
  type        = number
  default     = 50
  description = "Cloud SQL initial storage disk capacity in GB"
}

variable "app_subnet_cidr" {
  type        = string
  default     = "10.10.0.0/20"
  description = "CIDR block for application private subnet"
}

variable "serverless_connector_cidr" {
  type        = string
  default     = "10.10.16.0/28"
  description = "CIDR block for Serverless VPC Access connector (/28 required)"
}

variable "alert_email" {
  type        = string
  default     = "devops-alerts@nexus-erp.com"
  description = "Email address receiving Cloud Monitoring alert policy notifications"
}

variable "github_repository" {
  type        = string
  default     = "organization/erp-crm-platform"
  description = "GitHub repository (owner/repo) authorized to exchange OIDC tokens with GCP WIF"
}
