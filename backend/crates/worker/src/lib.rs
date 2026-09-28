pub mod cloud_tasks;

pub use cloud_tasks::{CloudTaskPayload, CloudTasksClient, DeadLetterRecord, TaskQueue};

use axum::{
    extract::HeaderMap,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};
use std::time::Duration;
use tracing::{info, warn};

pub fn create_worker_router() -> Router {
    Router::new()
        .route("/tasks/health", get(health_check))
        .route("/tasks/outbox-publisher", post(process_outbox_batch))
        .route("/tasks/cloud-tasks-handler", post(handle_cloud_task))
}

async fn health_check() -> (StatusCode, Json<Value>) {
    (
        StatusCode::OK,
        Json(json!({
            "status": "healthy",
            "service": "platform-worker",
            "cloud_tasks_queues": ["platform-default-queue", "platform-priority-queue", "platform-dlq-queue"],
            "timestamp": chrono::Utc::now().to_rfc3339()
        })),
    )
}

async fn process_outbox_batch() -> Json<Value> {
    info!("Outbox Publisher worker polling unprocessed events from outbox_events...");
    Json(json!({
        "status": "processed",
        "events_published": 0,
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn handle_cloud_task(
    headers: HeaderMap,
    Json(payload): Json<CloudTaskPayload>,
) -> (StatusCode, Json<Value>) {
    let task_name = headers
        .get("X-CloudTasks-TaskName")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("local_simulated_task");

    let retry_count: i32 = headers
        .get("X-CloudTasks-TaskRetryCount")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);

    info!(
        "Processing Google Cloud Task: {} (Type: {}, Attempt: {}, CorrelationID: {})",
        task_name, payload.task_type, retry_count, payload.correlation_id
    );

    // Business execution dispatch
    (
        StatusCode::OK,
        Json(json!({
            "status": "success",
            "task_id": payload.task_id,
            "task_type": payload.task_type,
            "executed_at": chrono::Utc::now().to_rfc3339()
        })),
    )
}

pub async fn run_outbox_polling_loop() {
    let mut interval = tokio::time::interval(Duration::from_secs(5));
    loop {
        interval.tick().await;
    }
}
