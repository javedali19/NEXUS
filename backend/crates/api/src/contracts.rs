use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

// ============================================================================
// 1. Standard Success & Paginated API Response Envelopes
// ============================================================================

/// Canonical Success Response Envelope for single-entity or action endpoints.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: T,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<ResponseMeta>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data,
            meta: Some(ResponseMeta::default()),
        }
    }

    pub fn ok_with_meta(data: T, meta: ResponseMeta) -> Self {
        Self {
            success: true,
            data,
            meta: Some(meta),
        }
    }
}

/// Metadata attached to API responses (request tracing & execution metrics).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResponseMeta {
    pub request_id: String,
    pub correlation_id: String,
    pub timestamp: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
}

impl Default for ResponseMeta {
    fn default() -> Self {
        Self {
            request_id: uuid::Uuid::new_v4().to_string(),
            correlation_id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            version: Some("v1".to_string()),
        }
    }
}

/// Canonical Paginated Response Envelope for collection endpoints.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaginatedResponse<T> {
    pub success: bool,
    pub data: Vec<T>,
    pub pagination: PaginationMeta,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<ResponseMeta>,
}

impl<T> PaginatedResponse<T> {
    pub fn new(data: Vec<T>, pagination: PaginationMeta) -> Self {
        Self {
            success: true,
            data,
            pagination,
            meta: Some(ResponseMeta::default()),
        }
    }
}

/// Pagination Metadata detailing cursor, offsets, and total item statistics.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaginationMeta {
    pub page: usize,
    pub per_page: usize,
    pub total_items: usize,
    pub total_pages: usize,
    pub has_next: bool,
    pub has_prev: bool,
}

impl PaginationMeta {
    pub fn calculate(page: usize, per_page: usize, total_items: usize) -> Self {
        let per_page_safe = if per_page == 0 { 20 } else { per_page };
        let total_pages = if total_items == 0 {
            1
        } else {
            (total_items + per_page_safe - 1) / per_page_safe
        };

        Self {
            page,
            per_page: per_page_safe,
            total_items,
            total_pages,
            has_next: page < total_pages,
            has_prev: page > 1,
        }
    }
}

// ============================================================================
// 2. Standardized Request Query Parameters (Pagination, Sorting, Filtering)
// ============================================================================

/// Query parameters for collection pagination.
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PaginationParams {
    #[serde(default = "default_page")]
    pub page: usize,
    #[serde(default = "default_per_page")]
    pub per_page: usize,
}

fn default_page() -> usize {
    1
}

fn default_per_page() -> usize {
    20
}

impl Default for PaginationParams {
    fn default() -> Self {
        Self {
            page: 1,
            per_page: 20,
        }
    }
}

impl PaginationParams {
    pub fn offset(&self) -> i64 {
        ((self.page.saturating_sub(1)) * self.per_page) as i64
    }

    pub fn limit(&self) -> i64 {
        self.per_page.min(100) as i64
    }
}

/// Query parameters for collection sorting.
#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct SortingParams {
    pub sort_by: Option<String>,
    pub sort_order: Option<SortOrder>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum SortOrder {
    #[default]
    Asc,
    Desc,
}

impl SortOrder {
    pub fn as_sql(&self) -> &'static str {
        match self {
            SortOrder::Asc => "ASC",
            SortOrder::Desc => "DESC",
        }
    }
}

/// Query parameters for collection filtering & full-text search.
#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct FilteringParams {
    pub search: Option<String>,
    pub status: Option<String>,
    pub date_from: Option<DateTime<Utc>>,
    pub date_to: Option<DateTime<Utc>>,
}

// ============================================================================
// 3. Standardized Error Response Envelope (RFC 7807 Compliant)
// ============================================================================

/// Canonical Error Response Envelope.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ApiErrorResponse {
    pub success: bool, // always false
    pub error: ApiErrorDetail,
}

impl ApiErrorResponse {
    pub fn new(
        code: impl Into<String>,
        message: impl Into<String>,
        request_id: impl Into<String>,
        correlation_id: impl Into<String>,
        details: Option<Value>,
    ) -> Self {
        Self {
            success: false,
            error: ApiErrorDetail {
                code: code.into(),
                message: message.into(),
                request_id: request_id.into(),
                correlation_id: correlation_id.into(),
                timestamp: Utc::now(),
                details,
            },
        }
    }
}

/// Detailed error breakdown with machine-readable code and optional validation field details.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ApiErrorDetail {
    pub code: String,
    pub message: String,
    pub request_id: String,
    pub correlation_id: String,
    pub timestamp: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<Value>,
}

/// Field-level validation violation detail.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ValidationErrorDetail {
    pub field: String,
    pub code: String,
    pub message: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_pagination_meta_calculation() {
        let meta = PaginationMeta::calculate(1, 20, 95);
        assert_eq!(meta.page, 1);
        assert_eq!(meta.per_page, 20);
        assert_eq!(meta.total_items, 95);
        assert_eq!(meta.total_pages, 5);
        assert!(meta.has_next);
        assert!(!meta.has_prev);

        let last_page = PaginationMeta::calculate(5, 20, 95);
        assert!(!last_page.has_next);
        assert!(last_page.has_prev);
    }

    #[test]
    fn test_api_response_envelope_serialization() {
        let resp = ApiResponse::ok(json!({ "name": "Acme Corp" }));
        assert!(resp.success);
        assert_eq!(resp.data["name"], "Acme Corp");
        assert!(resp.meta.is_some());
    }
}
