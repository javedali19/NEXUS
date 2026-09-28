# ==============================================================================
# Messaging & Asynchronous Execution Infrastructure
# Cloud Pub/Sub, Multi-Tier Cloud Tasks Queues, and Cloud Scheduler Cron Jobs
# ==============================================================================

# 1. Pub/Sub Dead-Letter Topic
resource "google_pubsub_topic" "deadletter_topic" {
  name = "${var.environment}-platform-deadletter-topic"

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }

  depends_on = [google_project_service.gcp_services]
}

# 2. Primary Pub/Sub Events Topic
resource "google_pubsub_topic" "events_topic" {
  name = "${var.environment}-platform-events-topic"

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }

  depends_on = [google_project_service.gcp_services]
}

# 3. Pub/Sub Subscription with Dead-Letter Policy
resource "google_pubsub_subscription" "events_subscription" {
  name  = "${var.environment}-platform-events-sub"
  topic = google_pubsub_topic.events_topic.name

  ack_deadline_seconds       = 60
  retain_acked_messages      = false
  message_retention_duration = "604800s" # 7 days

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.deadletter_topic.id
    max_delivery_attempts = 5
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "300s"
  }
}

# 4. Multi-Tier Cloud Tasks Queues
resource "google_cloud_tasks_queue" "default_queue" {
  name     = "${var.environment}-platform-default-queue"
  location = var.gcp_region

  rate_limits {
    max_dispatches_per_second = 500
    max_concurrent_dispatches = 100
  }

  retry_config {
    max_attempts       = 5
    min_backoff        = "10s"
    max_backoff        = "300s"
    max_doublings      = 4
  }

  depends_on = [google_project_service.gcp_services]
}

resource "google_cloud_tasks_queue" "priority_queue" {
  name     = "${var.environment}-platform-priority-queue"
  location = var.gcp_region

  rate_limits {
    max_dispatches_per_second = 1000
    max_concurrent_dispatches = 200
  }

  retry_config {
    max_attempts       = 3
    min_backoff        = "5s"
    max_backoff        = "60s"
    max_doublings      = 3
  }

  depends_on = [google_project_service.gcp_services]
}

resource "google_cloud_tasks_queue" "dlq_queue" {
  name     = "${var.environment}-platform-dlq-queue"
  location = var.gcp_region

  rate_limits {
    max_dispatches_per_second = 50
    max_concurrent_dispatches = 10
  }

  depends_on = [google_project_service.gcp_services]
}

# 5. Cloud Tasks & Cloud Scheduler Invoker Service Account
resource "google_service_account" "tasks_invoker" {
  account_id   = "${var.environment}-sa-tasks-invoker"
  display_name = "Cloud Tasks & Scheduler Invoker (${var.environment})"
}

# Allow Invoker SA to trigger Cloud Run API Gateway
resource "google_cloud_run_v2_service_iam_member" "tasks_invoker_run" {
  name     = google_cloud_run_v2_service.api_service.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.tasks_invoker.email}"
}

# 6. Cloud Scheduler Cron Jobs
resource "google_cloud_scheduler_job" "outbox_cron" {
  name        = "${var.environment}-platform-outbox-cron"
  description = "Triggers outbox polling worker every minute"
  schedule    = "* * * * *"
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.api_service.uri}/tasks/outbox-publisher"

    oidc_token {
      service_account_email = google_service_account.tasks_invoker.email
    }
  }

  depends_on = [google_project_service.gcp_services]
}

resource "google_cloud_scheduler_job" "dunning_cron" {
  name        = "${var.environment}-platform-dunning-cron"
  description = "Triggers autonomous dunning evaluation every hour"
  schedule    = "0 * * * *"
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.api_service.uri}/tasks/dunning-evaluator"

    oidc_token {
      service_account_email = google_service_account.tasks_invoker.email
    }
  }

  depends_on = [google_project_service.gcp_services]
}
