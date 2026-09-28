# Enterprise Multi-Tenant Platform Architecture (ERP + CRM + AI Communications)

## 1. Architecture Overview

This platform is engineered as a unified, production-grade enterprise platform combining ERP, CRM, and AI Communications into a single multi-tenant workspace.

### Core Architectural Principle
> **Unified Business Context Core**: All modules (ERP, CRM, AI Communications) operate directly on shared underlying primitives. There are no siloed customer tables, disconnected histories, or separate permission stores. Every module shares the exact same:
> 1. Customer Identity (`Customer`, `Account`, `Contact`)
> 2. Interaction Timeline (`TimelineEntry`)
> 3. Outbox & Event Engine (`OutboxEvent`, GCP Pub/Sub)
> 4. Shared Workflow Engine (`WorkflowDefinition`, `WorkflowExecution`, `WorkflowStep`)
> 5. Unified Authorization Engine (`TenantContext`, PostgreSQL RLS, Application RBAC)
> 6. Immutable Audit Trail (`AuditLog`)
> 7. Integration Layer (Webhooks, External Connectors)

---

## 2. Technology Stack & Component Architecture

```
                                  +---------------------------------------+
                                  |    Next.js + TypeScript + Tailwind    |
                                  |    (Apps: Web Dashboard, Customer 360)|
                                  +-------------------+-------------------+
                                                      | HTTPS / REST
                                                      v
                                  +-------------------+-------------------+
                                  |        GCP Cloud Armor / WAF          |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |    Rust + Axum API Gateway Service    |
                                  |   (Tenant Context Middleware + RBAC)  |
                                  +---------+-------------------+---------+
                                            |                   |
                                            | SQLx (Pool)       | Transactional Outbox
                                            v                   v
+-------------------------------------------+---+   +-----------+-------------------+
|       Cloud SQL PostgreSQL Engine             |   | PostgreSQL `outbox_events` Table  |
| - Row Level Security (RLS) policies          |   +-----------+-------------------+
| - Shared Tenants, Customers, Timeline, Audit  |               | Polling Worker
+-----------------------------------------------+               v
                                                    +-----------+-------------------+
                                                    |  Rust Outbox Publisher Worker |
                                                    +-----------+-------------------+
                                                                |
                                                                v
                                                    +-----------+-------------------+
                                                    |      Google Cloud Pub/Sub     |
                                                    +-----------+-------------------+
                                                                |
                                             +------------------+------------------+
                                             |                                     |
                                             v                                     v
                             +---------------+---------------+     +---------------+---------------+
                             |    GCP Cloud Tasks Worker     |     |   External Webhook Consumer   |
                             |   (Async AI / Background)     |     +-------------------------------+
                             +-------------------------------+
```

### Stack Components
- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Modern Dashboard layout with dark mode glassmorphism design.
- **Backend Services**: Rust, Axum web framework, Tokio async runtime, Serde serialization, Tracing/OpenTelemetry observability.
- **Database & RLS**: PostgreSQL (Cloud SQL), SQLx compile-time query verification, Row Level Security (`SET LOCAL app.current_tenant_id`).
- **Events & Messaging**: Transactional Outbox Pattern + Google Cloud Pub/Sub event bus.
- **Async Workers & Background Jobs**: Rust Worker services deployed to GCP Cloud Run, triggered by Google Cloud Tasks & Cloud Scheduler.
- **Storage & Encryption**: Google Cloud Storage (files/assets), Google Cloud KMS (envelope encryption), Google Secret Manager (credentials).
- **Security & Authorization**: IAM, Cloud Armor security policies, JWT/Session tenant propagation, granular RBAC (Admin, Manager, Agent, Auditor).
- **Observability**: OpenTelemetry standard trace exporter, Cloud Logging JSON formatting, Cloud Monitoring, Sentry SDK hooks.
- **Infrastructure**: Terraform HCL for GCP resources.
- **CI/CD**: GitHub Actions workflows using Workload Identity Federation (Keyless authentication).

---

## 3. Multi-Tenant Isolation Strategy (PostgreSQL Row Level Security)

Tenant isolation is strictly enforced at the database kernel level using PostgreSQL **Row Level Security (RLS)**.

### Database Context Injection
Every database transaction executed by the Rust backend initializes the session tenant variable before performing queries:

```sql
-- Executed inside every Axum transaction wrapper
SET LOCAL app.current_tenant_id = 'tenant_uuid_here';
```

### RLS Helper Function & Policy Blueprint
```sql
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enforced on all tables:
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON customers
    FOR ALL
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
```

---

## 4. Transactional Outbox & Event Engine

To prevent dual-write inconsistencies between database transactions and event streams, all domain events are written to an `outbox_events` table within the same database transaction.

### Outbox Lifecycle
1. **Transaction Stage**: Business action (e.g., Create Invoice, Log Customer Call) inserts business data AND appends an `OutboxEvent` row into `outbox_events` in one atomic PostgreSQL transaction.
2. **Polling & Publish Stage**: The Rust Outbox Worker queries unprocessed rows (`published_at IS NULL`), publishes them to **Google Cloud Pub/Sub**, and marks `published_at = NOW()`.
3. **Consumption Stage**: Cloud Tasks subscribers or external webhooks process events idempotently based on `event_id`.

```sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ NULL
);
```

---

## 5. Security & Infrastructure Blueprint

### GCP Resource Mapping
| Layer | GCP Service | Responsibilities |
|---|---|---|
| Edge WAF | Cloud Armor | Rate limiting, DDoS defense, OWASP top 10 rules |
| Container Hosting | Cloud Run | Auto-scaling serverless container deployment for API Gateway & Workers |
| Database | Cloud SQL PostgreSQL | High-availability PostgreSQL database instance with private VPC peering |
| Messaging | Cloud Pub/Sub | Scalable asynchronous event routing |
| Queue / Retries | Cloud Tasks | Rate-limited background execution & task queues |
| Cron | Cloud Scheduler | Scheduled trigger invocations for workers |
| Object Storage | Cloud Storage (GCS) | Multi-tenant customer files & attachment storage |
| Secret Management | Secret Manager | Environment secret injection |
| Key Management | Cloud KMS | Data-at-rest field-level envelope encryption |

---

## 6. Environment Configuration Conventions

All environment variables follow a standardized naming convention across dev, staging, and production:

- `APP_ENV`: `development` | `staging` | `production`
- `DATABASE_URL`: PostgreSQL connection string (`postgres://user:pass@host:5432/dbname`)
- `GCP_PROJECT_ID`: Target GCP Project ID
- `GCP_PUBSUB_TOPIC_EVENTS`: Pub/Sub topic name for platform events
- `GCP_TASKS_QUEUE_NAME`: Cloud Tasks queue identifier
- `GCP_KMS_KEY_NAME`: Fully qualified KMS key resource name
- `GCP_STORAGE_BUCKET`: Multi-tenant GCS bucket name
- `JWT_SECRET`: Signing secret for user authentication tokens
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry OTLP collector address
