# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Multi-Tenant Security & Isolation Model

This platform enforces multi-tenancy at the kernel level using **PostgreSQL Row Level Security (RLS)**.

1. **Database-Level Isolation**: Every transaction executes `SET LOCAL app.current_tenant_id = '<tenant_uuid>'`. RLS policies prevent cross-tenant data leaks even in the event of an application logic bug.
2. **Context Propagation**: Tenant identity is validated at the edge / API Gateway middleware and injected into Axum `TenantContext`.
3. **Envelope Encryption**: Sensitive customer attributes at rest are encrypted via Google Cloud KMS.
4. **Edge Defense**: Google Cloud Armor protects against DDoS, OWASP Top 10 vulnerabilities, and applies rate-limiting per IP/tenant.
5. **Keyless Authentication**: Production deployments authenticate to Google Cloud services using Workload Identity Federation (WIF) with zero long-lived service account keys stored in GitHub Actions.

## Reporting a Vulnerability

If you discover a security vulnerability within this project:

1. **Do not open a public GitHub issue.**
2. Send an email detailing the vulnerability to `security@enterprise.internal`.
3. Include reproduction steps, tenant isolation implications, and potential impact.
4. The security team will acknowledge receipt within 24 hours and provide a timeline for triage and resolution.
