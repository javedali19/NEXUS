use chrono::{DateTime, Duration, Utc};
use platform_common::PlatformError;
use std::sync::{Arc, Mutex};
use std::time::Duration as StdDuration;
use tracing::warn;

/// Thread-safe in-memory Sliding Window Rate Limiter per provider connection.
#[derive(Debug, Clone)]
pub struct RateLimiter {
    max_requests_per_minute: u32,
    window_start: Arc<Mutex<DateTime<Utc>>>,
    request_count: Arc<Mutex<u32>>,
}

impl RateLimiter {
    pub fn new(max_requests_per_minute: u32) -> Self {
        Self {
            max_requests_per_minute,
            window_start: Arc::new(Mutex::new(Utc::now())),
            request_count: Arc::new(Mutex::new(0)),
        }
    }

    /// Attempts to acquire a rate limit permit. Returns Ok(()) or Err(PlatformError::Unauthorized/RateLimit)
    pub fn try_acquire(&self) -> Result<(), PlatformError> {
        let now = Utc::now();
        let mut start = self.window_start.lock().unwrap();
        let mut count = self.request_count.lock().unwrap();

        // If window exceeded 60s, reset window
        if now - *start >= Duration::seconds(60) {
            *start = now;
            *count = 0;
        }

        if *count >= self.max_requests_per_minute {
            let retry_after = 60 - (now - *start).num_seconds().max(1);
            warn!(
                "Rate limit exceeded: {} requests reached. Retry after {}s",
                self.max_requests_per_minute, retry_after
            );
            return Err(PlatformError::ValidationError(format!(
                "Provider rate limit exceeded. Retry after {} seconds.",
                retry_after
            )));
        }

        *count += 1;
        Ok(())
    }
}

/// Exponential backoff retry policy for external provider calls.
#[derive(Debug, Clone)]
pub struct RetryPolicy {
    pub max_attempts: u32,
    pub initial_backoff_ms: u64,
    pub max_backoff_ms: u64,
    pub multiplier: f64,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            initial_backoff_ms: 500,
            max_backoff_ms: 10000,
            multiplier: 2.0,
        }
    }
}

impl RetryPolicy {
    pub fn calculate_backoff(&self, attempt: u32) -> StdDuration {
        if attempt == 0 {
            return StdDuration::from_millis(0);
        }

        let backoff = (self.initial_backoff_ms as f64) * self.multiplier.powi((attempt - 1) as i32);
        let capped = (backoff as u64).min(self.max_backoff_ms);
        StdDuration::from_millis(capped)
    }

    /// Determines if an HTTP status code is transient and eligible for automatic retry.
    pub fn is_retryable_status(status_code: u16) -> bool {
        matches!(status_code, 408 | 429 | 500 | 502 | 503 | 504)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rate_limiter_permits() {
        let limiter = RateLimiter::new(2);
        assert!(limiter.try_acquire().is_ok());
        assert!(limiter.try_acquire().is_ok());
        assert!(limiter.try_acquire().is_err());
    }

    #[test]
    fn test_retry_policy_backoff() {
        let policy = RetryPolicy::default();
        assert_eq!(policy.calculate_backoff(1), StdDuration::from_millis(500));
        assert_eq!(policy.calculate_backoff(2), StdDuration::from_millis(1000));
        assert_eq!(policy.calculate_backoff(3), StdDuration::from_millis(2000));
    }
}
