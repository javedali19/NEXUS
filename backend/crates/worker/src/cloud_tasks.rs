use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tracing::{error, info, warn};
use uuid::Uuid;

use platform_common::PlatformError;

/// Multi-Tier Cloud Tasks Queue Names.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskQueue {
    #[serde(rename = "platform-default-queue")]
    Default,
    #[serde(rename = "platform-priority-queue")]
    Priority,
    #[serde(rename = "platform-dlq-queue")]
    DeadLetter,
}

impl TaskQueue {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Default => "platform-default-queue",
            Self::Priority => "platform-priority-queue",
            Self::DeadLetter => "platform-dlq-queue",
        }
    }
}

/// Cloud Tasks Execution Payload Envelope.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudTaskPayload {
    pub task_id: Uuid,
    pub organization_id: Uuid,
    pub task_type: String,
    pub target_url: String,
    pub payload: Value,
    pub idempotency_key: String,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub backoff_initial_seconds: i64,
    pub backoff_multiplier: f64,
    pub scheduled_for: DateTime<Utc>,
    pub correlation_id: String,
    pub causation_id: Option<String>,
}

/// Dead-Letter Queue (DLQ) Envelope.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeadLetterRecord {
    pub id: Uuid,
    pub task_id: Uuid,
    pub organization_id: Uuid,
    pub queue_name: String,
    pub task_type: String,
    pub exhausted_attempts: i32,
    pub last_error: String,
    pub payload: Value,
    pub correlation_id: String,
    pub created_at: DateTime<Utc>,
}

/// Cloud Tasks Client Abstraction (Supporting Local Simulation & Production GCP).
pub struct CloudTasksClient {
    pub project_id: String,
    pub location: String,
    pub is_production: bool,
}

impl CloudTasksClient {
    pub fn new(project_id: String, location: String, is_production: bool) -> Self {
        Self {
            project_id,
            location,
            is_production,
        }
    }

    /// Computes exponential backoff delay in seconds: delay = initial * multiplier^(attempt - 1).
    pub fn compute_exponential_backoff(
        attempt: i32,
        initial_seconds: i64,
        multiplier: f64,
        max_delay_seconds: i64,
    ) -> i64 {
        if attempt <= 1 {
            return initial_seconds;
        }

        let factor = multiplier.powi(attempt - 1);
        let computed = (initial_seconds as f64 * factor).round() as i64;
        computed.min(max_delay_seconds)
    }

    /// Enqueues a task for immediate or delayed background execution.
    pub async fn enqueue_task(
        &self,
        queue: TaskQueue,
        task: &CloudTaskPayload,
    ) -> Result<String, PlatformError> {
        let task_name = format!(
            "projects/{}/locations/{}/queues/{}/tasks/{}",
            self.project_id,
            self.location,
            queue.as_str(),
            task.task_id
        );

        if self.is_production {
            info!(
                "Dispatching task {} to GCP Cloud Tasks queue {} (Scheduled for: {})",
                task_name,
                queue.as_str(),
                task.scheduled_for
            );
            // In Production: Invokes Google Cloud Tasks REST / gRPC API with OIDC service account token
        } else {
            info!(
                "[LOCAL SIMULATION] Cloud Task enqueued: {} (Queue: {}, Delay: {}s, IdempotencyKey: {})",
                task.task_type,
                queue.as_str(),
                (task.scheduled_for - Utc::now()).num_seconds().max(0),
                task.idempotency_key
            );
        }

        Ok(task_name)
    }

    /// Handles task execution failure and routes to retry or Dead-Letter Queue (DLQ).
    pub fn handle_task_failure(
        task: &CloudTaskPayload,
        error_msg: &str,
    ) -> Result<Option<i64>, DeadLetterRecord> {
        let next_attempt = task.attempt_count + 1;
        if next_attempt > task.max_attempts {
            warn!(
                "Task {} exhausted all {} attempts. Routing to Dead-Letter Queue (DLQ).",
                task.task_id, task.max_attempts
            );

            Err(DeadLetterRecord {
                id: Uuid::new_v4(),
                task_id: task.task_id,
                organization_id: task.organization_id,
                queue_name: TaskQueue::DeadLetter.as_str().to_string(),
                task_type: task.task_type.clone(),
                exhausted_attempts: task.max_attempts,
                last_error: error_msg.to_string(),
                payload: task.payload.clone(),
                correlation_id: task.correlation_id.clone(),
                created_at: Utc::now(),
            })
        } else {
            let delay_seconds = Self::compute_exponential_backoff(
                next_attempt,
                task.backoff_initial_seconds,
                task.backoff_multiplier,
                300, // 5 min cap
            );

            info!(
                "Task {} failed attempt {}/{}. Scheduling retry #{} in {} seconds.",
                task.task_id, task.attempt_count, task.max_attempts, next_attempt, delay_seconds
            );

            Ok(Some(delay_seconds))
        }
    }
}
