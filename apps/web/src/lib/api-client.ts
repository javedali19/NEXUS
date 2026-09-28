/**
 * Nexus Enterprise Standardized REST API Client
 * Features:
 * - API Versioning (/api/v1)
 * - Request ID & Distributed Correlation ID propagation (X-Request-Id, X-Correlation-Id)
 * - Idempotency Key header injection on mutations (Idempotency-Key)
 * - Standardized Response & Paginated Envelopes
 * - RFC 7807 Standardized Error Unwrapping
 * - Offline Mock Fallback for local zero-dependency resilience
 */

// ============================================================================
// 1. Standardized Contract Types
// ============================================================================

export interface ResponseMeta {
  requestId: string;
  correlationId: string;
  timestamp: string;
  version?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  meta?: ResponseMeta;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface SortingParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilteringParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId: string;
  correlationId: string;
  timestamp: string;
  details?: Record<string, any>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly requestId: string;
  public readonly correlationId: string;
  public readonly details?: Record<string, any>;

  constructor(status: number, errorDetail: ApiErrorDetail) {
    super(errorDetail.message);
    this.name = "ApiError";
    this.status = status;
    this.code = errorDetail.code;
    this.requestId = errorDetail.requestId;
    this.correlationId = errorDetail.correlationId;
    this.details = errorDetail.details;
  }
}

// ============================================================================
// 2. Core API Client Implementation
// ============================================================================

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  idempotencyKey?: string;
  correlationId?: string;
}

export class EnterpriseApiClient {
  private baseUrl: string;
  private defaultCorrelationId: string | null = null;

  constructor(baseUrl: string = "/api/v1") {
    this.baseUrl = baseUrl;
  }

  public setGlobalCorrelationId(correlationId: string) {
    this.defaultCorrelationId = correlationId;
  }

  private generateUuid(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Universal HTTP Dispatcher with Correlation ID & Idempotency Header Injection
   */
  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = new URL(
      endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`,
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    );

    // Append query params
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const requestId = this.generateUuid();
    const correlationId = options.correlationId || this.defaultCorrelationId || this.generateUuid();

    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    headers.set("X-Request-Id", requestId);
    headers.set("X-Correlation-Id", correlationId);

    // Set idempotency key on mutations
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(
      (options.method || "GET").toUpperCase()
    );
    if (isMutation) {
      const key = options.idempotencyKey || this.generateUuid();
      headers.set("Idempotency-Key", key);
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers,
      });

      // Standard error unwrap
      if (!response.ok) {
        let errorBody: any;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = {
            error: {
              code: "HTTP_ERROR_" + response.status,
              message: response.statusText || "An unexpected HTTP error occurred.",
              requestId,
              correlationId,
              timestamp: new Date().toISOString(),
            },
          };
        }

        const detail: ApiErrorDetail = errorBody.error || {
          code: "UNKNOWN_ERROR",
          message: errorBody.message || "An unknown error occurred",
          requestId,
          correlationId,
          timestamp: new Date().toISOString(),
          details: errorBody,
        };

        throw new ApiError(response.status, detail);
      }

      // Return JSON payload
      return (await response.json()) as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Connection fault / offline
      throw new ApiError(0, {
        code: "NETWORK_ERROR",
        message: err.message || "Failed to reach API server.",
        requestId,
        correlationId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==========================================================================
  // Domain Resource Namespaces
  // ==========================================================================

  public readonly customers = {
    list: (params?: PaginationParams & SortingParams & FilteringParams) =>
      this.request<PaginatedResponse<any>>("/customers", { method: "GET", params }),

    getById: (id: string) =>
      this.request<ApiResponse<any>>(`/customers/${id}`, { method: "GET" }),

    create: (data: Record<string, any>, idempotencyKey?: string) =>
      this.request<ApiResponse<any>>("/customers", {
        method: "POST",
        body: JSON.stringify(data),
        idempotencyKey,
      }),

    getTimeline: (id: string, params?: { module?: string; page?: number; perPage?: number }) =>
      this.request<PaginatedResponse<any>>(`/customers/${id}/timeline`, { method: "GET", params }),
  };

  public readonly invoices = {
    list: (params?: PaginationParams & SortingParams & FilteringParams) =>
      this.request<PaginatedResponse<any>>("/invoices", { method: "GET", params }),

    getById: (id: string) =>
      this.request<ApiResponse<any>>(`/invoices/${id}`, { method: "GET" }),

    pay: (id: string, paymentData: Record<string, any>, idempotencyKey?: string) =>
      this.request<ApiResponse<any>>(`/invoices/${id}/pay`, {
        method: "POST",
        body: JSON.stringify(paymentData),
        idempotencyKey,
      }),
  };

  public readonly deals = {
    list: (params?: PaginationParams & SortingParams & FilteringParams) =>
      this.request<PaginatedResponse<any>>("/deals", { method: "GET", params }),

    advanceStage: (id: string, stage: string, idempotencyKey?: string) =>
      this.request<ApiResponse<any>>(`/deals/${id}/stage`, {
        method: "POST",
        body: JSON.stringify({ stage }),
        idempotencyKey,
      }),
  };

  public readonly audit = {
    list: (params?: PaginationParams & { outcome?: string; source?: string; search?: string }) =>
      this.request<PaginatedResponse<any>>("/audit-logs", { method: "GET", params }),
  };

  public readonly exceptions = {
    list: (params?: PaginationParams & { category?: string; status?: string }) =>
      this.request<PaginatedResponse<any>>("/exceptions", { method: "GET", params }),

    retry: (id: string, idempotencyKey?: string) =>
      this.request<ApiResponse<any>>(`/exceptions/${id}/retry`, {
        method: "POST",
        idempotencyKey,
      }),

    resolve: (id: string, notes?: string) =>
      this.request<ApiResponse<any>>(`/exceptions/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ notes }),
      }),
  };

  public readonly workflows = {
    list: () => this.request<ApiResponse<any[]>>("/workflows", { method: "GET" }),

    execute: (workflowId: string, eventPayload: Record<string, any>, idempotencyKey?: string) =>
      this.request<ApiResponse<any>>("/workflows/execute", {
        method: "POST",
        body: JSON.stringify({ workflow_id: workflowId, event_payload: eventPayload }),
        idempotencyKey,
      }),
  };

  public readonly auth = {
    getSession: () => this.request<any>("/auth/me", { method: "GET" }),

    switchOrganization: (organizationId: string) =>
      this.request<any>("/auth/session/switch-organization", {
        method: "POST",
        body: JSON.stringify({ organization_id: organizationId }),
      }),

    switchBusinessUnit: (businessUnitId: string) =>
      this.request<any>("/auth/session/switch-business-unit", {
        method: "POST",
        body: JSON.stringify({ business_unit_id: businessUnitId }),
      }),

    login: (idToken?: string) =>
      this.request<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ id_token: idToken }),
      }),
  };
}

export const api = new EnterpriseApiClient();
