-- ============================================================================
-- Migration 0018: Google Cloud Tasks Background Execution Architecture
-- Delayed execution, exponential backoff retries, idempotency, dead-letter
-- queue (DLQ), and distributed correlation tracing
-- ============================================================================

-- 1. Background Tasks Execution Registry
CREATE TABLE IF NOT EXISTS background_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    business_unit_id UUID,
    gcp_task_name VARCHAR(255) NOT NULL, -- projects/{project}/locations/{region}/queues/{queue}/tasks/{task_id}
    queue_name VARCHAR(64) NOT NULL DEFAULT 'platform-default-queue',
    task_type VARCHAR(64) NOT NULL,      -- workflow.execution, dunning.cadence, invoice.email_dispatch, accounting.sync, ocr.process
    target_url VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    schedule_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dispatch_deadline TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'scheduled', -- pending, scheduled, executing, completed, retrying, dead_lettered, cancelled
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    backoff_initial_seconds INT NOT NULL DEFAULT 10,
    backoff_multiplier NUMERIC(3, 1) NOT NULL DEFAULT 2.0,
    last_error TEXT,
    dead_letter_reason TEXT,
    idempotency_key VARCHAR(255) NOT NULL,
    correlation_id VARCHAR(128),
    causation_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CONSTRAINT uk_background_tasks_idempotency UNIQUE (organization_id, idempotency_key)
);

-- 2. Dead-Letter Queue (DLQ) for Exhausted Retries
CREATE TABLE IF NOT EXISTS background_dead_letter_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    task_id UUID NOT NULL REFERENCES background_tasks(id) ON DELETE CASCADE,
    queue_name VARCHAR(64) NOT NULL,
    task_type VARCHAR(64) NOT NULL,
    exhausted_attempts INT NOT NULL,
    last_error TEXT NOT NULL,
    payload JSONB NOT NULL,
    resolution_status VARCHAR(32) NOT NULL DEFAULT 'unresolved', -- unresolved, replayed, discarded
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for scheduled task polling and queue monitoring
CREATE INDEX IF NOT EXISTS idx_bg_tasks_org_status ON background_tasks(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_bg_tasks_schedule_time ON background_tasks(schedule_time) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_bg_tasks_queue_name ON background_tasks(queue_name);
CREATE INDEX IF NOT EXISTS idx_bg_dlq_org_status ON background_dead_letter_queue(organization_id, resolution_status);

-- Enable Row-Level Security (RLS)
ALTER TABLE background_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_dead_letter_queue ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY background_tasks_tenant_isolation ON background_tasks
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY background_dlq_tenant_isolation ON background_dead_letter_queue
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
