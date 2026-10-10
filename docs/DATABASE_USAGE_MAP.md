# DATABASE USAGE MAP — NEXUS ERP + CRM + TELI

**Project:** NEXUS ERP + CRM + TELI  
**Document:** `docs/DATABASE_USAGE_MAP.md`  
**Status:** COMPLETE & VERIFIED  
**Generated Date:** 2026-10-08  
**Scope:** End-to-end trace from Frontend UI Pages through REST API Endpoints, Backend Rust Services/Crates, and Database Access Layers down to PostgreSQL/Supabase Tables.

---

## 1. End-to-End Architectural Pipeline

```
Frontend (Next.js 15 / React 19)
    │
    ▼ (HTTP / JSON / Idempotency / Correlation ID)
API Routing Layer (Axum REST API / OpenAPI v1)
    │
    ▼ (Tenant Context Extension & RBAC Guard)
Backend Domain Services (backend/crates/domain)
    │
    ▼ (sqlx::PgPool / with_tenant_tx RLS wrapper)
Database Layer (backend/crates/db)
    │
    ▼ (SET LOCAL app.current_tenant_id = ...)
Supabase PostgreSQL (185 Tables / 154 Tenant RLS Protected)
```

---

## 2. Comprehensive Module Mapping Matrix

| Module | Frontend Page (`apps/web/src/app`) | REST API Endpoint (`backend/crates/api`) | Backend Domain / Service (`backend/crates/domain`) | Database Access Mechanism | Database Tables (`database/migrations`) |
|---|---|---|---|---|---|
| **Identity & Auth** | `/login`, `/signup`, `/settings` | `POST /auth/login`<br>`GET /auth/me`<br>`POST /auth/session/switch-*` | `auth.rs`<br>`platform_common::TenantContext` | `sqlx::query_as`<br>Transaction RLS | `organizations`, `business_units`, `users`, `roles`, `permissions`, `role_permissions`, `memberships`, `user_sessions` |
| **CRM — Customer 360** | `/customers`, `/timeline`, `/crm` | `GET /customers`<br>`POST /customers`<br>`GET /customers/:id/timeline` | `customers.rs`<br>`domain::Customer`<br>`domain::TimelineEntry` | `sqlx::FromRow`<br>`with_tenant_tx` | `customers`, `accounts`, `timeline_entries`, `customer_timeline_events`, `customer_consents` |
| **CRM — Companies & Contacts** | `/companies`, `/contacts` | `GET /companies`<br>`POST /companies`<br>`GET /contacts` | `domain::Company`<br>`domain::Contact` | `sqlx::query`<br>`with_tenant_tx` | `companies`, `contacts` |
| **CRM — Deals & Quotes** | `/deals`, `/quotes`, `/sales-flow` | `GET /deals`<br>`POST /deals/:id/stage`<br>`GET /quotes` | `sales_flow.rs`<br>`domain::SalesFlow` | `sqlx::FromRow`<br>`with_tenant_tx` | `deals`, `crm_deals`, `quotes`, `quote_line_items`, `sales_flow_instances`, `sales_flow_stage_transitions` |
| **ERP — Invoicing** | `/invoices`, `/erp` | `GET /invoices`<br>`POST /invoices`<br>`POST /invoices/:id/pay` | `invoice.rs`<br>`domain::Invoice`<br>`domain::InvoiceLineItem` | `sqlx::FromRow`<br>`with_tenant_tx` | `invoices`, `invoice_items`, `invoice_line_items`, `invoice_timeline_events`, `erp_invoices` |
| **ERP — Payments & Dunning** | `/payments`, `/collections` | `GET /payments`<br>`POST /payments/process`<br>`GET /collections` | `payment.rs`<br>`collections.rs`<br>`autonomous_collections.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `payments`, `payment_transactions`, `payment_allocations`, `payment_links`, `collections_policies`, `collections_cases`, `collections_promises_to_pay`, `autonomous_collections_runs` |
| **ERP — Accounting Sync** | `/accounting` | `GET /accounting/connections`<br>`POST /accounting/sync` | `accounting.rs`<br>`domain::AccountingConnector` | `sqlx::query`<br>`with_tenant_tx` | `accounting_connections`, `accounting_entity_mappings`, `accounting_reconciliation_ledgers`, `accounting_sync_logs` |
| **ERP — Procurement & Inventory** | `/inventory` | `GET /inventory/products`<br>`POST /inventory/movements`<br>`GET /procurement/orders` | `erp_inventory.rs`<br>`domain::ErpProduct`<br>`domain::ErpWarehouse` | `sqlx::FromRow`<br>`with_tenant_tx` | `erp_products`, `erp_warehouses`, `erp_suppliers`, `erp_inventory_levels`, `erp_stock_movements`, `erp_purchase_orders`, `erp_purchase_order_items`, `erp_external_connector_configs` |
| **TELI — Voice Telephony** *(Telnyx / Neutral)* | `/voice-calls`, `/call-center`, `/voice-agent` | `POST /telephony/calls/originate`<br>`POST /telephony/calls/webhook`<br>`GET /telephony/calls/:id` | `voice_telephony.rs`<br>`voice_agent_integration.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `telephony_configs`, `telephony_queues`, `telephony_phone_numbers`, `telephony_calls`, `telephony_call_sessions`, `telephony_recordings`, `telephony_transcripts`, `telephony_summaries`, `telephony_consent_records`, `voice_agent_configs`, `voice_agent_pipelines`, `voice_agent_turns` |
| **TELI — WhatsApp & Omnichannel** | `/whatsapp`, `/conversations` | `POST /whatsapp/webhook`<br>`POST /whatsapp/send`<br>`GET /omnichannel/threads` | `ai_whatsapp_agent.rs`<br>`omnichannel.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `whatsapp_configs`, `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_contacts_consent`, `whatsapp_webhook_events`, `omnichannel_threads`, `omnichannel_messages`, `omnichannel_tags` |
| **Documents & OCR** | `/documents`, `/ocr` | `POST /documents/upload`<br>`GET /documents/:id`<br>`POST /ocr/extract` | `documents.rs`<br>`ocr.rs`<br>`domain::Document` | `sqlx::FromRow`<br>`with_tenant_tx` | `documents`, `document_files`, `document_versions`, `document_access_audits`, `ocr_extractions`, `ocr_extracted_invoices`, `ocr_extracted_line_items`, `ocr_review_queue` |
| **Workflow Automation** | `/workflows` | `GET /workflows`<br>`POST /workflows/execute`<br>`GET /workflows/:id/logs` | `workflows.rs`<br>`workflow_engine.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `workflows`, `workflow_definitions`, `workflow_steps`, `workflow_executions`, `workflow_events`, `workflow_audit_logs`, `background_tasks` |
| **AI — Control Plane & Tool Gateway** | `/ai-agents`, `/ai-comms` | `GET /ai/agents`<br>`POST /ai/agents/invoke`<br>`POST /ai/tools/execute` | `agent_control_plane.rs`<br>`ai_tool_gateway.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `ai_agents`, `ai_agent_configs`, `ai_agent_versions`, `ai_agent_capabilities`, `ai_agent_tools`, `ai_agent_runs`, `ai_agent_actions`, `ai_tool_catalog`, `ai_tool_invocations`, `ai_tool_audit_trail` |
| **AI — Sales Agent & SDR** | `/ai-sales` | `POST /ai/sales/qualify`<br>`GET /ai/sales/leads` | `ai_sales_agent.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `ai_sales_configs`, `ai_sales_leads`, `ai_sales_conversations`, `ai_sales_handoffs` |
| **Customer Support & Tickets** | `/support`, `/tickets` | `GET /tickets`<br>`POST /tickets`<br>`POST /tickets/:id/comment` | `customer_support.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `support_cases`, `support_case_messages`, `support_case_notes`, `support_case_attachments`, `support_tickets`, `support_ticket_activities`, `support_ticket_comments` |
| **Executive & ROI Analytics** | `/command-center`, `/analytics`, `/roi` | `GET /analytics/kpis`<br>`GET /analytics/roi-ledger` | `executive_command_center.rs`<br>`analytics_roi.rs` | `sqlx::query`<br>`with_tenant_tx` | `executive_kpi_snapshots`, `executive_operational_alerts`, `analytics_snapshots`, `analytics_touchpoint_attributions`, `roi_agent_impact_ledger` |
| **Regional Country Packs** | `/country-packs` | `GET /country-packs/active`<br>`POST /country-packs/einvoice` | `country_pack.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `tenant_country_pack_configs`, `regional_connector_configurations`, `einvoice_transmission_ledger` |
| **Security, Audit & Telemetry** | `/audit`, `/exceptions`, `/security`, `/observability`, `/cicd`, `/e2e-audit`, `/infrastructure` | `GET /audit-logs`<br>`GET /exceptions`<br>`POST /exceptions/:id/retry` | `audit.rs`<br>`security_review.rs`<br>`observability.rs`<br>`cicd_pipeline.rs`<br>`e2e_audit.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `audit_logs`, `audit_events`, `exceptions`, `exception_records`, `security_audit_events`, `credential_leak_scans`, `observability_metrics`, `trace_spans`, `cicd_pipeline_runs`, `e2e_lifecycle_audit_runs` |
| **Global Search & Commands** | `/search`, Global Command Bar | `GET /search?q=...`<br>`POST /commands/execute` | `global_search.rs` | `sqlx::FromRow`<br>`with_tenant_tx` | `search_index_entries`, `universal_commands`, `command_audit_log` |

---

## 3. Database Layer Transaction Isolation Flow

When any API endpoint mutates or reads tenant data:
1. HTTP Request arrives with user authorization token.
2. `trusted_auth_middleware` validates user session and builds `TenantContext { tenant_id, user_id, permissions }`.
3. The domain service calls `backend/crates/db::with_tenant_tx(&pool, &context, |tx| async move { ... })`.
4. The database driver issues:
   ```sql
   SET LOCAL app.current_tenant_id = '<tenant_id>';
   ```
5. All subsequent queries on RLS-protected tables automatically resolve against the current tenant session, preventing cross-tenant data leakage.
6. The transaction commits upon successful completion or rolls back cleanly if any error or constraint violation occurs.
