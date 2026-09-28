# ==============================================================================
# Google Cloud SQL PostgreSQL 15 Infrastructure
# Multi-tenant RLS Database with Private IP, CMEK Encryption, and Auto-Backups
# ==============================================================================

resource "google_sql_database_instance" "postgres_instance" {
  name             = "${var.environment}-platform-postgres-v15"
  database_version = "POSTGRES_15"
  region           = var.gcp_region
  encryption_key_name = google_kms_crypto_key.sql_key.id

  settings {
    tier              = var.db_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_size         = var.db_disk_size_gb
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = var.environment == "production"
      start_time                     = "03:00"
      transaction_log_retention_days = var.environment == "production" ? 7 : 2
      backup_retention_settings {
        retained_backups = var.environment == "production" ? 30 : 7
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled    = var.environment != "production" # Public IP disabled in production
      private_network = google_compute_network.platform_vpc.id
      allocated_ip_range = google_compute_global_address.private_ip_alloc.name
      require_ssl     = true
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = false
    }

    database_flags {
      name  = "max_connections"
      value = "500"
    }
    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }
  }

  depends_on = [
    google_service_networking_connection.private_vpc_connection,
    google_kms_crypto_key_iam_member.sql_cmek_user
  ]
}

# Primary Multi-Tenant Database
resource "google_sql_database" "platform_db" {
  name     = "${var.environment}_platform_db"
  instance = google_sql_database_instance.postgres_instance.name
}

# Application Database User
resource "google_sql_user" "app_user" {
  name     = "platform_app_user"
  instance = google_sql_database_instance.postgres_instance.name
  password = random_password.sql_db_password.result
}
