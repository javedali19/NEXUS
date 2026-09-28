use chrono::{Duration, Utc};
use platform_common::PlatformError;
use serde_json::Value;
use sqlx::PgPool;
use tracing::{info, warn};
use uuid::Uuid;

/// Result of trying to acquire an API/Command idempotency key.
#[derive(Debug)]
pub enum IdempotencyResult {
    /// Newly acquired lock; caller should proceed with mutation and call `commit_response`.
    LockAcquired { key_id: Uuid },
    /// Duplicate completed request; return the previously cached response.
    CachedResponse {
        status_code: i32,
        response_body: Value,
    },
    /// Request is currently being processed by another concurrently executing request.
    InFlight,
    /// Request payload hash does not match original request with the same idempotency key.
    HashMismatch,
}

/// Idempotency Service for API mutations and commands.
pub struct IdempotencyService;

impl IdempotencyService {
    /// Hashes the request payload / body for integrity verification.
    pub fn calculate_hash(data: &[u8]) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        let mut hasher = DefaultHasher::new();
        data.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }

    /// Attempts to acquire an idempotency lock for a given tenant and key.
    pub async fn acquire_lock(
        pool: &PgPool,
        organization_id: Uuid,
        idempotency_key: &str,
        request_hash: &str,
        lock_ttl_seconds: i64,
    ) -> Result<IdempotencyResult, PlatformError> {
        let now = Utc::now();
        let locked_until = now + Duration::seconds(lock_ttl_seconds);

        // 1. Check if record already exists
        let existing = sqlx::query_as::<_, (Uuid, String, Option<i32>, Option<Value>, chrono::DateTime<Utc>)>(
            r#"
            SELECT id, request_hash, response_status, response_body, locked_until
            FROM idempotency_keys
            WHERE organization_id = $1 AND idempotency_key = $2
            "#
        )
        .bind(organization_id)
        .bind(idempotency_key)
        .fetch_optional(pool)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to query idempotency key: {}", e)))?;

        if let Some((id, hash, status, body, locked_until_ts)) = existing {
            // Validate hash matches
            if hash != request_hash {
                warn!(
                    "Idempotency key collision with payload mismatch for key={}",
                    idempotency_key
                );
                return Ok(IdempotencyResult::HashMismatch);
            }

            // If response already committed, return cached response
            if let (Some(s), Some(b)) = (status, body) {
                info!("Returning cached response for idempotency_key={}", idempotency_key);
                return Ok(IdempotencyResult::CachedResponse {
                    status_code: s,
                    response_body: b,
                });
            }

            // If still locked, request is currently in flight
            if locked_until_ts > now {
                warn!("Idempotency key={} currently in flight", idempotency_key);
                return Ok(IdempotencyResult::InFlight);
            }

            // Lock expired without completion: re-acquire lock
            sqlx::query(
                r#"
                UPDATE idempotency_keys
                SET locked_until = $3, updated_at = NOW()
                WHERE organization_id = $1 AND idempotency_key = $2
                "#
            )
            .bind(organization_id)
            .bind(idempotency_key)
            .bind(locked_until)
            .execute(pool)
            .await
            .map_err(|e| PlatformError::DatabaseError(format!("Failed to renew idempotency lock: {}", e)))?;

            return Ok(IdempotencyResult::LockAcquired { key_id: id });
        }

        // 2. Insert new record
        let new_id = Uuid::new_v4();
        let insert_res = sqlx::query(
            r#"
            INSERT INTO idempotency_keys (
                id, organization_id, idempotency_key, request_hash, locked_until, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, NOW(), NOW()
            )
            ON CONFLICT (organization_id, idempotency_key) DO NOTHING
            "#
        )
        .bind(new_id)
        .bind(organization_id)
        .bind(idempotency_key)
        .bind(request_hash)
        .bind(locked_until)
        .execute(pool)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to insert idempotency key: {}", e)))?;

        if insert_res.rows_affected() == 0 {
            // Race condition: another thread inserted between check and insert
            return Ok(IdempotencyResult::InFlight);
        }

        Ok(IdempotencyResult::LockAcquired { key_id: new_id })
    }

    /// Commits the HTTP response or command result to the idempotency record.
    pub async fn commit_response(
        pool: &PgPool,
        organization_id: Uuid,
        idempotency_key: &str,
        status_code: i32,
        response_body: Value,
    ) -> Result<(), PlatformError> {
        sqlx::query(
            r#"
            UPDATE idempotency_keys
            SET response_status = $3,
                response_body = $4,
                updated_at = NOW()
            WHERE organization_id = $1 AND idempotency_key = $2
            "#
        )
        .bind(organization_id)
        .bind(idempotency_key)
        .bind(status_code)
        .bind(response_body)
        .execute(pool)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to commit idempotency response: {}", e)))?;

        Ok(())
    }

    /// Releases a failed idempotency lock immediately so it can be retried.
    pub async fn release_lock(
        pool: &PgPool,
        organization_id: Uuid,
        idempotency_key: &str,
    ) -> Result<(), PlatformError> {
        sqlx::query(
            r#"
            DELETE FROM idempotency_keys
            WHERE organization_id = $1 AND idempotency_key = $2 AND response_status IS NULL
            "#
        )
        .bind(organization_id)
        .bind(idempotency_key)
        .execute(pool)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to release idempotency key: {}", e)))?;

        Ok(())
    }
}

/// Consumer Deduplicator using `processed_events` ledger for Exactly-Once processing semantics.
pub struct ConsumerDeduplicator;

impl ConsumerDeduplicator {
    /// Attempts to record that a consumer has processed an event.
    /// Returns `true` if the event is new and successfully claimed, or `false` if already processed.
    pub async fn try_claim_event(
        pool: &PgPool,
        organization_id: Uuid,
        consumer_name: &str,
        event_id: Uuid,
        event_type: &str,
    ) -> Result<bool, PlatformError> {
        let result = sqlx::query(
            r#"
            INSERT INTO processed_events (
                id, organization_id, consumer_name, event_id, event_type, processed_at
            ) VALUES (
                gen_random_uuid(), $1, $2, $3, $4, NOW()
            )
            ON CONFLICT (organization_id, consumer_name, event_id) DO NOTHING
            "#
        )
        .bind(organization_id)
        .bind(consumer_name)
        .bind(event_id)
        .bind(event_type)
        .execute(pool)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to claim event in consumer ledger: {}", e)))?;

        let was_inserted = result.rows_affected() > 0;
        if !was_inserted {
            info!(
                "Consumer '{}' skipping duplicate event_id={} for org={}",
                consumer_name, event_id, organization_id
            );
        }

        Ok(was_inserted)
    }
}
