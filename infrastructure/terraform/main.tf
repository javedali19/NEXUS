# ==============================================================================
# Google Cloud Platform Production Infrastructure
# Root Terraform Provider Configuration & Global Context
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region

  default_labels = {
    environment = var.environment
    platform    = "enterprise-erp-crm"
    managed_by  = "terraform"
  }
}

provider "google-beta" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
