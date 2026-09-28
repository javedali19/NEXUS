use axum::{
    http::StatusCode,
    response::{Html, IntoResponse},
    Json,
};
use serde_json::{json, Value};

/// Generates the canonical OpenAPI 3.1.0 JSON specification for the entire platform.
pub fn generate_openapi_spec() -> Value {
    json!({
        "openapi": "3.1.0",
        "info": {
            "title": "Nexus Enterprise Platform API",
            "version": "1.0.0",
            "description": "Standardized REST API contract for Multi-Tenant ERP, CRM, AI Telephony, Vision OCR, and Workflows Platform.",
            "contact": {
                "name": "Nexus Platform Architecture Team",
                "url": "https://enterprise.nexus.internal"
            }
        },
        "servers": [
            {
                "url": "/api/v1",
                "description": "Production API v1 Cluster"
            }
        ],
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "Google Cloud Identity Platform (GCIP) or session JWT token."
                },
                "TenantHeader": {
                    "type": "apiKey",
                    "in": "header",
                    "name": "X-Target-Organization-ID",
                    "description": "Multi-tenant context organization override (server-membership validated)."
                },
                "IdempotencyKey": {
                    "type": "apiKey",
                    "in": "header",
                    "name": "Idempotency-Key",
                    "description": "Unique key to ensure exactly-once execution for mutating requests."
                },
                "CorrelationId": {
                    "type": "apiKey",
                    "in": "header",
                    "name": "X-Correlation-Id",
                    "description": "Distributed trace correlation ID propagated across microservices."
                }
            },
            "schemas": {
                "ApiResponse": {
                    "type": "object",
                    "properties": {
                        "success": { "type": "boolean", "example": true },
                        "data": { "type": "object" },
                        "meta": { "$ref": "#/components/schemas/ResponseMeta" }
                    },
                    "required": ["success", "data"]
                },
                "PaginatedResponse": {
                    "type": "object",
                    "properties": {
                        "success": { "type": "boolean", "example": true },
                        "data": { "type": "array", "items": { "type": "object" } },
                        "pagination": { "$ref": "#/components/schemas/PaginationMeta" },
                        "meta": { "$ref": "#/components/schemas/ResponseMeta" }
                    },
                    "required": ["success", "data", "pagination"]
                },
                "PaginationMeta": {
                    "type": "object",
                    "properties": {
                        "page": { "type": "integer", "example": 1 },
                        "per_page": { "type": "integer", "example": 20 },
                        "total_items": { "type": "integer", "example": 142 },
                        "total_pages": { "type": "integer", "example": 8 },
                        "has_next": { "type": "boolean", "example": true },
                        "has_prev": { "type": "boolean", "example": false }
                    },
                    "required": ["page", "per_page", "total_items", "total_pages", "has_next", "has_prev"]
                },
                "ResponseMeta": {
                    "type": "object",
                    "properties": {
                        "request_id": { "type": "string", "format": "uuid", "example": "c1f83a2e-4b91-4e78-bc5a-10f8a9e01234" },
                        "correlation_id": { "type": "string", "format": "uuid", "example": "8f7e6d5c-4b3a-2109-8765-43210fedcba9" },
                        "timestamp": { "type": "string", "format": "date-time" },
                        "version": { "type": "string", "example": "v1" }
                    },
                    "required": ["request_id", "correlation_id", "timestamp"]
                },
                "ApiErrorResponse": {
                    "type": "object",
                    "properties": {
                        "success": { "type": "boolean", "example": false },
                        "error": {
                            "type": "object",
                            "properties": {
                                "code": { "type": "string", "example": "VALIDATION_FAILED" },
                                "message": { "type": "string", "example": "Request payload contains invalid fields." },
                                "request_id": { "type": "string", "format": "uuid" },
                                "correlation_id": { "type": "string", "format": "uuid" },
                                "timestamp": { "type": "string", "format": "date-time" },
                                "details": { "type": "object" }
                            },
                            "required": ["code", "message", "request_id", "correlation_id", "timestamp"]
                        }
                    },
                    "required": ["success", "error"]
                }
            }
        },
        "security": [
            {
                "BearerAuth": []
            }
        ],
        "paths": {
            "/customers": {
                "get": {
                    "summary": "List Customers (Paginated, Filterable, Sortable)",
                    "description": "Returns a paginated list of unified enterprise customers isolated by current PostgreSQL RLS tenant context.",
                    "parameters": [
                        { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 }, "description": "Page number (1-indexed)" },
                        { "name": "per_page", "in": "query", "schema": { "type": "integer", "default": 20, "maximum": 100 }, "description": "Number of items per page" },
                        { "name": "search", "in": "query", "schema": { "type": "string" }, "description": "Full-text search on name, email, or company" },
                        { "name": "sort_by", "in": "query", "schema": { "type": "string", "default": "created_at" }, "description": "Field to sort by" },
                        { "name": "sort_order", "in": "query", "schema": { "type": "string", "enum": ["asc", "desc"], "default": "desc" } }
                    ],
                    "responses": {
                        "200": { "description": "Paginated list of customers", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PaginatedResponse" } } } },
                        "401": { "description": "Unauthorized", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorResponse" } } } },
                        "403": { "description": "Forbidden", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorResponse" } } } }
                    }
                },
                "post": {
                    "summary": "Create Customer (Idempotent)",
                    "description": "Atomically provisions a customer identity, dispatches an outbox event, and records an append-only audit event.",
                    "parameters": [
                        { "name": "Idempotency-Key", "in": "header", "schema": { "type": "string" }, "required": true, "description": "Unique key to ensure exactly-once execution" }
                    ],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "first_name": { "type": "string", "example": "Sarah" },
                                        "last_name": { "type": "string", "example": "Jenkins" },
                                        "email": { "type": "string", "format": "email", "example": "sarah.jenkins@acme.com" },
                                        "phone": { "type": "string", "example": "+15550199" },
                                        "lifecycle_stage": { "type": "string", "enum": ["lead", "prospect", "customer", "churned"], "example": "customer" }
                                    },
                                    "required": ["first_name", "last_name", "email"]
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": { "description": "Customer created successfully", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiResponse" } } } },
                        "400": { "description": "Validation Error", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorResponse" } } } },
                        "409": { "description": "Idempotency Conflict", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorResponse" } } } }
                    }
                }
            },
            "/customers/{id}/timeline": {
                "get": {
                    "summary": "Get Customer 360 Timeline",
                    "description": "Fetches cross-module chronological events (ERP, CRM, Voice AI, WhatsApp, OCR, GDPR Consents) for a specific customer identity.",
                    "parameters": [
                        { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" }, "description": "Customer UUID" },
                        { "name": "module", "in": "query", "schema": { "type": "string", "enum": ["all", "erp", "crm", "telephony", "whatsapp", "ocr", "consent", "workflow"] } }
                    ],
                    "responses": {
                        "200": { "description": "Customer timeline events", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PaginatedResponse" } } } }
                    }
                }
            },
            "/workflows/execute": {
                "post": {
                    "summary": "Execute Workflow (Idempotent)",
                    "description": "Trigger an automated multi-step BPMN cross-module workflow execution.",
                    "parameters": [
                        { "name": "Idempotency-Key", "in": "header", "schema": { "type": "string" } }
                    ],
                    "responses": {
                        "200": { "description": "Workflow execution started/completed", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiResponse" } } } }
                    }
                }
            },
            "/audit-logs": {
                "get": {
                    "summary": "Query Immutable Audit Logs (Append-Only)",
                    "description": "Query tamper-proof append-only audit trail filtered by actor, entity, outcome, and date range.",
                    "parameters": [
                        { "name": "outcome", "in": "query", "schema": { "type": "string", "enum": ["ALL", "SUCCESS", "DENIED", "FAILED", "ABORTED"] } },
                        { "name": "source", "in": "query", "schema": { "type": "string" } }
                    ],
                    "responses": {
                        "200": { "description": "Filtered audit events", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PaginatedResponse" } } } }
                    }
                }
            }
        }
    })
}

/// GET /api/v1/openapi.json - Returns OpenAPI 3.1.0 schema specification
pub async fn openapi_json_handler() -> impl IntoResponse {
    (StatusCode::OK, Json(generate_openapi_spec()))
}

/// GET /api/v1/docs - Interactive Scalar / Swagger API Documentation Viewer
pub async fn openapi_docs_handler() -> impl IntoResponse {
    let html = r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Nexus Enterprise API Documentation (v1)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</head>
<body style="margin: 0; background: #0b0f17;">
  <script id="api-reference" data-url="/api/v1/openapi.json"></script>
</body>
</html>"#;

    (StatusCode::OK, Html(html))
}
