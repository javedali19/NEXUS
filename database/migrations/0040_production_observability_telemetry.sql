-- Migration: 0040_production_observability_telemetry.sql
-- Description: Production Observability, Metrics, Distributed Tracing, Health Monitoring, and Sentry Error Telemetry

-- 1. Subsystem Health Status Table
CREATE TABLE IF NOT EXISTS subsystem_health_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subsystem VARCHAR(64) NOT NULL, -- 'database', 'workers', 'workflows', 'ai_agents', 'integrations', 'redis_cache', 'storage'
    status VARCHAR(32) NOT NULL, -- 'healthy', 'degraded', 'unhealthy'
    latency_ms INT NOT NULL DEFAULT 0,
    uptime_percentage NUMERIC(5, 2) NOT NULL DEFAULT 99.99,
    active_connections INT DEFAULT 0,
    details JSONB DEFAULT '{}'::jsonb,
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_subsystem_health UNIQUE (organization_id, subsystem)
);

CREATE INDEX IF NOT EXISTS idx_subsystem_health_status ON subsystem_health_status(organization_id, status);

-- 2. Observability Metrics (Timeseries Aggregation)
CREATE TABLE IF NOT EXISTS observability_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric_name VARCHAR(128) NOT NULL,
    metric_type VARCHAR(32) NOT NULL, -- 'counter', 'gauge', 'histogram'
    value NUMERIC(14, 4) NOT NULL,
    labels JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_name_recorded ON observability_metrics(organization_id, metric_name, recorded_at DESC);

-- 3. Integration Health Checks
CREATE TABLE IF NOT EXISTS integration_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_name VARCHAR(64) NOT NULL, -- 'razorpay', 'stripe', 'meta_whatsapp', 'twilio', 'gemini_ai', 'mathpix_ocr', 'xero_qbo'
    status VARCHAR(32) NOT NULL, -- 'healthy', 'degraded', 'down', 'unconfigured'
    latency_ms INT NOT NULL DEFAULT 0,
    success_rate NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    error_count_last_hour INT NOT NULL DEFAULT 0,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_integration_health UNIQUE (organization_id, integration_name)
);

CREATE INDEX IF NOT EXISTS idx_integration_health_status ON integration_health_checks(organization_id, status);

-- 4. Worker & Background Queue Telemetry
CREATE TABLE IF NOT EXISTS worker_queue_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    queue_name VARCHAR(64) NOT NULL, -- 'cloud_tasks_default', 'payment_reconcile', 'ai_voice_dispatch', 'ocr_processing'
    queue_depth INT NOT NULL DEFAULT 0,
    active_workers INT NOT NULL DEFAULT 1,
    jobs_processed_last_hour INT NOT NULL DEFAULT 0,
    retry_count INT NOT NULL DEFAULT 0,
    dead_letter_count INT NOT NULL DEFAULT 0,
    avg_latency_ms INT NOT NULL DEFAULT 0,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_telemetry_queue ON worker_queue_telemetry(organization_id, queue_name, recorded_at DESC);

-- 5. Distributed Trace Spans
CREATE TABLE IF NOT EXISTS trace_spans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trace_id VARCHAR(64) NOT NULL,
    span_id VARCHAR(64) NOT NULL,
    parent_span_id VARCHAR(64),
    request_id VARCHAR(64),
    correlation_id VARCHAR(64),
    service_name VARCHAR(64) NOT NULL,
    operation_name VARCHAR(128) NOT NULL,
    duration_ms INT NOT NULL,
    http_status INT,
    status VARCHAR(32) NOT NULL DEFAULT 'ok', -- 'ok', 'error'
    attributes JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trace_spans_trace_id ON trace_spans(trace_id);
CREATE INDEX IF NOT EXISTS idx_trace_spans_correlation_id ON trace_spans(correlation_id);
CREATE INDEX IF NOT EXISTS idx_trace_spans_service_started ON trace_spans(service_name, started_at DESC);

-- 6. Sentry Error Telemetry & Buffered Events
CREATE TABLE IF NOT EXISTS sentry_error_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sentry_event_id VARCHAR(64) NOT NULL,
    environment VARCHAR(32) NOT NULL DEFAULT 'production',
    release_tag VARCHAR(64) NOT NULL,
    level VARCHAR(16) NOT NULL, -- 'fatal', 'error', 'warning', 'info'
    exception_type VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    correlation_id VARCHAR(64),
    request_id VARCHAR(64),
    user_context JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '{}'::jsonb,
    pii_scrubbed BOOLEAN NOT NULL DEFAULT true,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sentry_errors_org_captured ON sentry_error_events(organization_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_level ON sentry_error_events(level);

-- 7. Row-Level Security (RLS) Policies
ALTER TABLE subsystem_health_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE observability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_queue_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_spans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentry_error_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY subsystem_health_isolation ON subsystem_health_status
    FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY metrics_isolation ON observability_metrics
    FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY integration_health_isolation ON integration_health_checks
    FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY worker_telemetry_isolation ON worker_queue_telemetry
    FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY trace_spans_isolation ON trace_spans
    FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY sentry_errors_isolation ON sentry_error_events
    FOR ALL USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
