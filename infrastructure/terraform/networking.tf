# ==============================================================================
# Google Cloud Networking Infrastructure
# VPC, Subnets, Serverless VPC Access Connector, Private Service Access, and Cloud NAT
# ==============================================================================

# 1. Dedicated Virtual Private Cloud (VPC)
resource "google_compute_network" "platform_vpc" {
  name                    = "${var.environment}-platform-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  description             = "Dedicated VPC Network for Enterprise Platform (${var.environment})"

  depends_on = [google_project_service.gcp_services]
}

# 2. Private Subnet for Application Services
resource "google_compute_subnetwork" "app_subnet" {
  name                     = "${var.environment}-platform-app-subnet"
  ip_cidr_range            = var.app_subnet_cidr
  region                   = var.gcp_region
  network                  = google_compute_network.platform_vpc.id
  private_ip_google_access = true
  description              = "Private subnet with Google Private Access enabled"
}

# 3. Serverless VPC Access Connector for Cloud Run to reach Cloud SQL privately
resource "google_vpc_access_connector" "serverless_connector" {
  name          = "${var.environment}-vpc-conn"
  region        = var.gcp_region
  ip_cidr_range = var.serverless_connector_cidr
  network       = google_compute_network.platform_vpc.name
  min_instances = var.environment == "production" ? 2 : 1
  max_instances = var.environment == "production" ? 10 : 3
  machine_type  = "e2-micro"

  depends_on = [
    google_project_service.gcp_services,
    google_compute_subnetwork.app_subnet
  ]
}

# 4. Internal IP Allocation for Cloud SQL Private Services Access (VPC Peering)
resource "google_compute_global_address" "private_ip_alloc" {
  name          = "${var.environment}-sql-private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.platform_vpc.id

  depends_on = [google_project_service.gcp_services]
}

# 5. Service Networking Connection (VPC Peering to Google Service Network for Cloud SQL)
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.platform_vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]

  depends_on = [google_project_service.gcp_services]
}

# 6. Cloud Router for Private Subnet Outbound NAT
resource "google_compute_router" "nat_router" {
  name    = "${var.environment}-nat-router"
  region  = var.gcp_region
  network = google_compute_network.platform_vpc.id
}

# 7. Cloud NAT Gateway
resource "google_compute_router_nat" "nat_gateway" {
  name                               = "${var.environment}-nat-gateway"
  router                             = google_compute_router.nat_router.name
  region                             = var.gcp_region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}
