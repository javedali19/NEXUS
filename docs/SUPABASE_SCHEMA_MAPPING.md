# SUPABASE SCHEMA MAPPING — NEXUS ERP + CRM + TELI

**Project:** NEXUS ERP + CRM + TELI  
**Document:** `docs/SUPABASE_SCHEMA_MAPPING.md`  
**Status:** COMPLETE & VERIFIED  
**Generated Date:** 2026-10-08  
**Scope:** 1-to-1 canonical mapping of all 185 current PostgreSQL entities to Supabase PostgreSQL.

---

## 1. Schema Mapping Principles

1. **Native PostgreSQL Engine:** Both current database and Supabase use PostgreSQL 15. All DDL constructs, column types, default values, UUID generation (`gen_random_uuid()`), JSONB, and foreign key constraints transfer with 100% fidelity.
2. **Zero Inventions:** No unnecessary table modifications, renaming, or artificial columns have been introduced.
3. **Tenant Association Preservation:** Every entity with `organization_id` / `business_unit_id` preserves its tenant hierarchy and foreign keys.
4. **RLS Harmonization:** Supabase native Row Level Security enforces tenant isolation using `current_tenant_id()` / session headers.

---

## 2. Comprehensive Entity Mapping Table

| Current Entity | Supabase Table | Transformation | Relationship | Status |
|---|---|---|---|---|
| `accounting_connections` | `accounting_connections` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `accounting_entity_mappings` | `accounting_entity_mappings` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `accounting_reconciliation_ledgers` | `accounting_reconciliation_ledgers` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `accounting_sync_logs` | `accounting_sync_logs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `accounts` | `accounts` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `agent_actions` | `agent_actions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `agent_runs` | `agent_runs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `ai_agent_actions` | `ai_agent_actions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_approvals` | `ai_agent_approvals` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_audit_logs` | `ai_agent_audit_logs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_capabilities` | `ai_agent_capabilities` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_failures` | `ai_agent_failures` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_permissions` | `ai_agent_permissions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_policies` | `ai_agent_policies` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_results` | `ai_agent_results` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_runs` | `ai_agent_runs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_tools` | `ai_agent_tools` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agent_versions` | `ai_agent_versions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_agents` | `ai_agents` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_communications` | `ai_communications` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `ai_sales_configs` | `ai_sales_configs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_sales_conversations` | `ai_sales_conversations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_sales_handoffs` | `ai_sales_handoffs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_sales_leads` | `ai_sales_leads` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_tool_audit_trail` | `ai_tool_audit_trail` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_tool_catalog` | `ai_tool_catalog` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `ai_tool_idempotency` | `ai_tool_idempotency` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_tool_invocations` | `ai_tool_invocations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_tool_rate_limits` | `ai_tool_rate_limits` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_whatsapp_agent_configs` | `ai_whatsapp_agent_configs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_whatsapp_flow_logs` | `ai_whatsapp_flow_logs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_whatsapp_sessions` | `ai_whatsapp_sessions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ai_whatsapp_support_cases` | `ai_whatsapp_support_cases` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `analytics_snapshots` | `analytics_snapshots` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `analytics_touchpoint_attributions` | `analytics_touchpoint_attributions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `audit_events` | `audit_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `audit_logs` | `audit_logs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `autonomous_collections_runs` | `autonomous_collections_runs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `autonomous_collections_stage_logs` | `autonomous_collections_stage_logs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `background_dead_letter_queue` | `background_dead_letter_queue` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `background_tasks` | `background_tasks` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `business_units` | `business_units` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `calls` | `calls` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `cicd_deployments` | `cicd_deployments` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `cicd_pipeline_runs` | `cicd_pipeline_runs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `cicd_validation_gates` | `cicd_validation_gates` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `collections_cases` | `collections_cases` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `collections_executions` | `collections_executions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `collections_policies` | `collections_policies` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `collections_promises_to_pay` | `collections_promises_to_pay` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `command_audit_log` | `command_audit_log` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `companies` | `companies` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `consents` | `consents` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `contacts` | `contacts` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `conversations` | `conversations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `credential_leak_scans` | `credential_leak_scans` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `crm_deals` | `crm_deals` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `customer_timeline_events` | `customer_timeline_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `customers` | `customers` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `deals` | `deals` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `document_access_audits` | `document_access_audits` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `document_versions` | `document_versions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `documents` | `documents` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `e2e_lifecycle_audit_runs` | `e2e_lifecycle_audit_runs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `e2e_lifecycle_step_results` | `e2e_lifecycle_step_results` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `e2e_provider_connectivity_snapshots` | `e2e_provider_connectivity_snapshots` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `einvoice_transmission_ledger` | `einvoice_transmission_ledger` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `erp_external_connector_configs` | `erp_external_connector_configs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `erp_inventory_levels` | `erp_inventory_levels` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `erp_invoices` | `erp_invoices` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `erp_products` | `erp_products` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `erp_purchase_order_items` | `erp_purchase_order_items` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `erp_purchase_orders` | `erp_purchase_orders` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `erp_stock_movements` | `erp_stock_movements` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `erp_suppliers` | `erp_suppliers` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `erp_warehouses` | `erp_warehouses` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `exceptions` | `exceptions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `executive_kpi_snapshots` | `executive_kpi_snapshots` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `executive_operational_alerts` | `executive_operational_alerts` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `external_events` | `external_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `gcp_environment_configs` | `gcp_environment_configs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `gcp_infrastructure_resources` | `gcp_infrastructure_resources` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `gcp_secret_vault_catalog` | `gcp_secret_vault_catalog` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `idempotency_keys` | `idempotency_keys` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `integration_connections` | `integration_connections` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `integration_health_checks` | `integration_health_checks` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `integration_webhook_deliveries` | `integration_webhook_deliveries` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `invoice_extractions` | `invoice_extractions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `invoice_items` | `invoice_items` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `invoice_line_items` | `invoice_line_items` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `invoice_payments` | `invoice_payments` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `invoice_timeline_events` | `invoice_timeline_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `invoices` | `invoices` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `leads` | `leads` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `memberships` | `memberships` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `messages` | `messages` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `observability_metrics` | `observability_metrics` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ocr_anomalies` | `ocr_anomalies` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ocr_extracted_invoices` | `ocr_extracted_invoices` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ocr_extracted_line_items` | `ocr_extracted_line_items` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ocr_extractions` | `ocr_extractions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ocr_provider_credentials` | `ocr_provider_credentials` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `ocr_review_audit_logs` | `ocr_review_audit_logs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `omnichannel_messages` | `omnichannel_messages` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `omnichannel_tags` | `omnichannel_tags` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `omnichannel_thread_tags` | `omnichannel_thread_tags` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `omnichannel_threads` | `omnichannel_threads` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `organization_memberships` | `organization_memberships` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `organizations` | `organizations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `outbox_events` | `outbox_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `payment_allocations` | `payment_allocations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `payment_attempts` | `payment_attempts` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `payment_links` | `payment_links` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `payment_reconciliations` | `payment_reconciliations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `payment_transactions` | `payment_transactions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `payments` | `payments` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `permissions` | `permissions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `processed_events` | `processed_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `quote_line_items` | `quote_line_items` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `quotes` | `quotes` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `razorpay_credentials` | `razorpay_credentials` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `razorpay_orders` | `razorpay_orders` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `razorpay_payments` | `razorpay_payments` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `razorpay_webhook_deliveries` | `razorpay_webhook_deliveries` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `regional_connector_configurations` | `regional_connector_configurations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `regional_integration_audit_log` | `regional_integration_audit_log` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `roi_agent_impact_ledger` | `roi_agent_impact_ledger` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `roi_metrics` | `roi_metrics` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `role_permissions` | `role_permissions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `roles` | `roles` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `sales_flow_instances` | `sales_flow_instances` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `sales_flow_stage_transitions` | `sales_flow_stage_transitions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `search_index_entries` | `search_index_entries` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `security_audit_findings` | `security_audit_findings` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `security_compliance_benchmarks` | `security_compliance_benchmarks` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `sentry_error_events` | `sentry_error_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `subsystem_health_status` | `subsystem_health_status` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `support_case_attachments` | `support_case_attachments` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `support_case_audit_events` | `support_case_audit_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `support_case_messages` | `support_case_messages` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `support_case_notes` | `support_case_notes` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `support_cases` | `support_cases` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `support_ticket_activities` | `support_ticket_activities` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `support_ticket_comments` | `support_ticket_comments` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `support_tickets` | `support_tickets` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_call_audit_events` | `telephony_call_audit_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_call_sessions` | `telephony_call_sessions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_calling_windows` | `telephony_calling_windows` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_calls` | `telephony_calls` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_configs` | `telephony_configs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_consent_records` | `telephony_consent_records` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_escalations` | `telephony_escalations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_phone_numbers` | `telephony_phone_numbers` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_queues` | `telephony_queues` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_recordings` | `telephony_recordings` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_summaries` | `telephony_summaries` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `telephony_transcripts` | `telephony_transcripts` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `tenant_country_pack_configs` | `tenant_country_pack_configs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `tenant_custom_roles` | `tenant_custom_roles` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `tenant_dnc_suppression_list` | `tenant_dnc_suppression_list` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `tenant_retention_schedules` | `tenant_retention_schedules` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `tenant_settings_and_policies` | `tenant_settings_and_policies` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `tenants` | `tenants` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `timeline_entries` | `timeline_entries` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `trace_spans` | `trace_spans` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `universal_commands` | `universal_commands` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `user_identities` | `user_identities` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `user_sessions` | `user_sessions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `users` | `users` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Standalone / Global | READY (Validated) |
| `voice_agent_configs` | `voice_agent_configs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `voice_agent_pipelines` | `voice_agent_pipelines` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `voice_agent_turns` | `voice_agent_turns` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `voice_provider_credentials` | `voice_provider_credentials` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `whatsapp_configs` | `whatsapp_configs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `whatsapp_contacts_consent` | `whatsapp_contacts_consent` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `whatsapp_conversations` | `whatsapp_conversations` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `whatsapp_messages` | `whatsapp_messages` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `whatsapp_templates` | `whatsapp_templates` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `whatsapp_webhook_events` | `whatsapp_webhook_events` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `worker_queue_telemetry` | `worker_queue_telemetry` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `workflow_audit_logs` | `workflow_audit_logs` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `workflow_definitions` | `workflow_definitions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `workflow_executions` | `workflow_executions` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |
| `workflow_steps` | `workflow_steps` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Belongs to Organization | READY (Validated) |
| `workflows` | `workflows` | Direct 1:1 Schema Transfer (PostgreSQL 15 ➔ Supabase) | Organization ➔ Business Unit | READY (Validated) |

---

## 3. Execution Script

The consolidated master SQL schema script for Supabase is prepared and available at:
- `database/supabase_master_schema.sql`

This script can be executed directly in the Supabase Dashboard SQL Editor or via Supabase CLI (`supabase db push`).
