# ==============================================================================
# Google Cloud Monitoring & Alerting Infrastructure
# Alert Policies, Notification Channels, and Centralized Operational Dashboard
# ==============================================================================

# 1. DevOps Email Notification Channel
resource "google_monitoring_notification_channel" "email_channel" {
  display_name = "${var.environment}-devops-alerts"
  type         = "email"

  labels = {
    email_address = var.alert_email
  }

  depends_on = [google_project_service.gcp_services]
}

# 2. Alert Policy: Cloud Run High 5xx Error Rate (> 1% in 5 minutes)
resource "google_monitoring_alert_policy" "cloud_run_errors" {
  display_name = "${var.environment}: Cloud Run High 5xx Error Rate"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run 5xx response rate exceeded threshold"

    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND metric.labels.response_code_class=\"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_channel.name]

  documentation {
    content = "Cloud Run 5xx error rate has exceeded 5/min. Check Cloud Logging correlation IDs and Sentry telemetry."
  }

  depends_on = [google_project_service.gcp_services]
}

# 3. Alert Policy: Cloud SQL High CPU Utilization (> 85% for 10 minutes)
resource "google_monitoring_alert_policy" "cloud_sql_cpu" {
  display_name = "${var.environment}: Cloud SQL High CPU Utilization"
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL CPU utilization > 85%"

    condition_threshold {
      filter          = "metric.type=\"cloudsql.googleapis.com/database/cpu/utilization\" AND resource.type=\"cloudsql_database\""
      duration        = "600s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.85

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_channel.name]

  documentation {
    content = "Cloud SQL PostgreSQL instance CPU is critically high (>85%). Review long-running queries via Query Insights."
  }

  depends_on = [google_project_service.gcp_services]
}

# 4. Alert Policy: Cloud Tasks Dead-Letter Queue (DLQ) Backlog Alert
resource "google_monitoring_alert_policy" "dlq_backlog" {
  display_name = "${var.environment}: Cloud Tasks Dead-Letter Queue Backlog"
  combiner     = "OR"

  conditions {
    display_name = "DLQ queue has accumulated dead-lettered messages"

    condition_threshold {
      filter          = "metric.type=\"cloudtasks.googleapis.com/queue/depth\" AND resource.type=\"cloud_tasks_queue\" AND resource.labels.queue_id=\"${google_cloud_tasks_queue.dlq_queue.name}\""
      duration        = "180s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MAX"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_channel.name]

  documentation {
    content = "Dead-letter queue has received failed tasks. Inspect payload parameters and exception table."
  }

  depends_on = [google_project_service.gcp_services]
}

# 5. Centralized Cloud Monitoring Dashboard
resource "google_monitoring_dashboard" "platform_dashboard" {
  dashboard_json = jsonencode({
    displayName = "${var.environment} Enterprise Platform Observability"
    gridLayout = {
      columns = 2
      widgets = [
        {
          title = "Cloud Run Request Rates (Requests / Sec)"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\""
                  aggregation = {
                    perSeriesAligner = "ALIGN_RATE"
                  }
                }
              }
            }]
          }
        },
        {
          title = "Cloud SQL PostgreSQL CPU Utilization"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"cloudsql.googleapis.com/database/cpu/utilization\" AND resource.type=\"cloudsql_database\""
                  aggregation = {
                    perSeriesAligner = "ALIGN_MEAN"
                  }
                }
              }
            }]
          }
        }
      ]
    }
  })

  depends_on = [google_project_service.gcp_services]
}
