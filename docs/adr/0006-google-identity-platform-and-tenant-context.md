# ADR 0006: Google Identity Platform Integration & Server-Side Tenant Context Resolution

## Status
Accepted

## Context
In a multi-tenant enterprise ERP + CRM + AI platform, security breaches occur when systems blindly trust client-supplied `organization_id` or `tenant_id` headers. The system must verify authentication tokens against trusted identity providers (Google Cloud Identity Platform) and derive active organization and business unit context exclusively from server-side database memberships.

## Decision
1. **Google Identity Platform (GCIP) as Core Auth Provider**:
   - The platform integrates with Google Cloud Identity Platform (Firebase Auth / OpenID Connect).
   - The provider configuration layer gracefully flags when credentials are not yet supplied (`Configured` vs `NOT CONFIGURED: Awaiting GCP_IDENTITY_PLATFORM_PROJECT_ID`).
   - For local development without cloud keys, a mock token validator provides zero-friction developer authentication.

2. **Trusted Server-Side Context Resolution**:
   - **Never trust client-specified tenant headers**: Client requests provide only the identity token (`Bearer <jwt>` or session cookie).
   - The backend auth middleware:
     a. Decodes and verifies the identity token.
     b. Fetches the user record and queries `organization_memberships`.
     c. Verifies that the user has an `active` status in the requested organization.
     d. Injects the verified `TenantContext` (`tenant_id`, `business_unit_id`, `user_id`, `role`) into the request extensions.
     e. Executes `SET LOCAL app.current_tenant_id = '<verified_org_id>'` inside PostgreSQL transactions for Row-Level Security.

3. **Organization & Business Unit Switching**:
   - Context switches must invoke dedicated endpoints (`POST /api/v1/auth/session/switch-organization` and `switch-business-unit`).
   - The server validates membership before updating the session state and issuing updated session tokens.

## Consequences
- **Positive**: Complete defense against tenant spoofing and IDOR (Insecure Direct Object Reference) attacks.
- **Positive**: Clean provider separation allows seamless transition from local development to production Google Cloud Identity Platform.
- **Positive**: Support for multi-organization users with discrete roles per organization.
