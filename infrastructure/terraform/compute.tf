# ==============================================================================
# Google Cloud Run v2 Serverless Microservices
# Microservices with Serverless VPC Connector, Autoscaling, and Secret Manager References
# ==============================================================================

# 1. API Gateway Microservice (Rust Backend)
resource "google_cloud_run_v2_service" "api_service" {
  name     = "${var.environment}-platform-api-gateway"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.app_runner.email

    scaling {
      min_instance_count = var.environment == "production" ? 2 : 0
      max_instance_count = var.environment == "production" ? 20 : 3
    }

    vpc_access {
      connector = google_vpc_access_connector.serverless_connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.platform_repo.repository_id}/api:latest"

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }

      # Standard Environment Variables
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      env {
        name  = "GCP_PROJECT_ID"
        value = var.gcp_project_id
      }
      env {
        name  = "GCP_REGION"
        value = var.gcp_region
      }
      env {
        name  = "DATABASE_PRIVATE_IP"
        value = google_sql_database_instance.postgres_instance.private_ip_address
      }

      # External Third-Party API Keys referenced directly from Secret Manager
      env {
        name = "STRIPE_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["stripe-secret-key"].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "RAZORPAY_KEY_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["razorpay-key-secret"].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "TWILIO_AUTH_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["twilio-auth-token"].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "META_WHATSAPP_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["meta-whatsapp-token"].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["gemini-api-key"].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "SENTRY_DSN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["sentry-dsn"].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "DATABASE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["platform-db-password"].secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.gcp_services,
    google_secret_manager_secret_iam_member.runner_secret_accessor,
    google_vpc_access_connector.serverless_connector
  ]
}

# 2. Frontend Web Application (Next.js 15)
resource "google_cloud_run_v2_service" "web_service" {
  name     = "${var.environment}-platform-web"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.app_runner.email

    scaling {
      min_instance_count = var.environment == "production" ? 1 : 0
      max_instance_count = var.environment == "production" ? 10 : 2
    }

    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.platform_repo.repository_id}/web:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.api_service.uri
      }
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
    }
  }

  depends_on = [google_project_service.gcp_services]
}

# 3. Allow Public Unauthenticated Access to Web and API Gateway
resource "google_cloud_run_v2_service_iam_member" "public_web" {
  name     = google_cloud_run_v2_service.web_service.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "public_api" {
  name     = google_cloud_run_v2_service.api_service.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
