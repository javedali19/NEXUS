# ADR 0002: PostgreSQL Row Level Security (RLS) for Multi-Tenancy

## Status
Accepted

## Context
The platform combines ERP, CRM, and AI Communications across multiple enterprise tenants. We require strict multi-tenant isolation with zero possibility of cross-tenant data leakage, even if an application query omits a WHERE clause.

## Decision
We enforce multi-tenant isolation at the database layer using PostgreSQL Row Level Security (RLS).
- Helper function `current_tenant_id()` extracts the tenant ID from the transaction local session: `SET LOCAL app.current_tenant_id = '<tenant_uuid>'`.
- All tenant-owned tables enforce RLS (`ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`).
- All database queries run through the Rust `with_tenant_tx` transaction wrapper.

## Consequences
- **Positive**: Kernel-enforced tenant isolation; immune to missing WHERE clause vulnerabilities.
- **Positive**: Single shared database instance reduces operational overhead compared to database-per-tenant.
- **Negative**: Connection pooling must ensure session settings (`SET LOCAL`) are reset per transaction, handled cleanly via transactional scope.
