# ==============================================================================
# Staging Environment Configuration (Pre-Production Testing)
# ==============================================================================

gcp_project_id            = "nexus-erp-staging"
gcp_region                = "us-central1"
environment               = "staging"
db_tier                   = "db-custom-2-7680"
db_disk_size_gb           = 50
app_subnet_cidr           = "10.30.0.0/20"
serverless_connector_cidr = "10.30.16.0/28"
alert_email               = "staging-alerts@nexus-erp.com"
github_repository         = "nexus-erp/core-platform"
