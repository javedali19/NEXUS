# ==============================================================================
# Development Environment Configuration (Cost-Optimized, Ephemeral)
# ==============================================================================

gcp_project_id            = "nexus-erp-dev"
gcp_region                = "us-central1"
environment               = "development"
db_tier                   = "db-f1-micro"
db_disk_size_gb           = 20
app_subnet_cidr           = "10.20.0.0/20"
serverless_connector_cidr = "10.20.16.0/28"
alert_email               = "dev-alerts@nexus-erp.com"
github_repository         = "nexus-erp/core-platform"
