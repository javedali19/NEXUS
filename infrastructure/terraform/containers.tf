# ==============================================================================
# Google Cloud Artifact Registry Repository
# OCI Docker Container Registry with Automated Vulnerability Scanning
# ==============================================================================

resource "google_artifact_registry_repository" "platform_repo" {
  location      = var.gcp_region
  repository_id = "${var.environment}-platform"
  description   = "Docker Container Registry for Enterprise Microservices (${var.environment})"
  format        = "DOCKER"

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }

  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      package_type = "DOCKER"
      count        = 10
    }
  }

  cleanup_policies {
    id     = "delete-untagged-old"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "604800s" # 7 days
    }
  }

  depends_on = [google_project_service.gcp_services]
}
