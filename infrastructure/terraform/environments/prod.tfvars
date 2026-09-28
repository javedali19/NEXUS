# ==============================================================================
# Production Environment Configuration (High Availability, CMEK, Cloud Armor WAF)
# ==============================================================================

gcp_project_id            = "nexus-erp-prod"
gcp_region                = "us-central1"
environment               = "production"
db_tier                   = "db-custom-4-15360"
db_disk_size_gb           = 100
app_subnet_cidr           = "10.10.0.0/20"
serverless_connector_cidr = "10.10.16.0/28"
alert_email               = "platform-ops@nexus-erp.com"
github_repository         = "nexus-erp/core-platform"
