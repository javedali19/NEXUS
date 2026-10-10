# CURRENT DATABASE INVENTORY — NEXUS ERP + CRM + TELI

**Project:** NEXUS ERP + CRM + TELI  
**Document:** `docs/CURRENT_DATABASE_INVENTORY.md`  
**Status:** COMPLETE & VERIFIED  
**Generated Date:** 2026-10-08  
**Scope:** Exhaustive catalog of all 185 database entities discovered across migrations `0001` through `0047`.

---

## 1. Summary Metrics

- **Total Discovered Tables:** 185
- **Tables Protected by PostgreSQL RLS:** 154
- **Database Functions:** 7
- **Automated Triggers:** 3
- **Database Indexes:** 228
- **Multi-Tenant Isolation Fields:** `organization_id` / `tenant_id`, `business_unit_id`

---

## IDENTITY (9 Tables)
*Scope: Organizations, Business Units, RBAC, Users, Permissions, Sessions, and Tenant Isolation*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `business_units` | `0005_auth_and_memberships.sql` | 21 | ✅ Yes | 🔒 Active |
| `memberships` | `0007_canonical_enterprise_schema.sql` | 9 | ✅ Yes | 🔓 System / Bypass |
| `organizations` | `0005_auth_and_memberships.sql` | 18 | ⚪ Global / Reference | 🔓 System / Bypass |
| `permissions` | `0007_canonical_enterprise_schema.sql` | 6 | ⚪ Global / Reference | 🔓 System / Bypass |
| `role_permissions` | `0007_canonical_enterprise_schema.sql` | 3 | ⚪ Global / Reference | 🔓 System / Bypass |
| `roles` | `0007_canonical_enterprise_schema.sql` | 9 | ✅ Yes | 🔓 System / Bypass |
| `tenant_custom_roles` | `0036_enterprise_settings_and_policies.sql` | 9 | ✅ Yes | 🔒 Active |
| `user_sessions` | `0005_auth_and_memberships.sql` | 9 | ✅ Yes | 🔓 System / Bypass |
| `users` | `0001_init_schema.sql` | 17 | ⚪ Global / Reference | 🔒 Active |

---

## CRM (9 Tables)
*Scope: Customers, Companies, Contacts, Leads, Deals, Quotes, Timelines, Consents, and Sales Flows*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `companies` | `0007_canonical_enterprise_schema.sql` | 14 | ✅ Yes | 🔓 System / Bypass |
| `contacts` | `0007_canonical_enterprise_schema.sql` | 15 | ✅ Yes | 🔓 System / Bypass |
| `customers` | `0002_unified_customer.sql` | 13 | ⚪ Global / Reference | 🔒 Active |
| `deals` | `0007_canonical_enterprise_schema.sql` | 18 | ✅ Yes | 🔓 System / Bypass |
| `leads` | `0007_canonical_enterprise_schema.sql` | 21 | ✅ Yes | 🔓 System / Bypass |
| `quote_line_items` | `0007_canonical_enterprise_schema.sql` | 11 | ✅ Yes | 🔓 System / Bypass |
| `quotes` | `0007_canonical_enterprise_schema.sql` | 19 | ✅ Yes | 🔓 System / Bypass |
| `sales_flow_instances` | `0038_complete_sales_flow.sql` | 26 | ✅ Yes | 🔒 Active |
| `sales_flow_stage_transitions` | `0038_complete_sales_flow.sql` | 16 | ✅ Yes | 🔒 Active |

---

## ERP (16 Tables)
*Scope: Invoices, Line Items, Payments, Dunning, Autonomous Collections, Products, Warehouses, Suppliers, Purchase Orders, and Regional E-Invoicing*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `accounting_sync_logs` | `0013_accounting_connectors.sql` | 18 | ✅ Yes | 🔒 Active |
| `autonomous_collections_runs` | `0023_autonomous_collections_workflow.sql` | 19 | ✅ Yes | 🔒 Active |
| `collections_policies` | `0022_collections_policy_engine.sql` | 14 | ✅ Yes | 🔒 Active |
| `einvoice_transmission_ledger` | `0034_regional_country_pack_engine.sql` | 16 | ✅ Yes | 🔒 Active |
| `erp_external_connector_configs` | `0037_erp_procurement_inventory.sql` | 12 | ✅ Yes | 🔒 Active |
| `erp_inventory_levels` | `0037_erp_procurement_inventory.sql` | 10 | ✅ Yes | 🔒 Active |
| `erp_products` | `0037_erp_procurement_inventory.sql` | 17 | ✅ Yes | 🔒 Active |
| `erp_purchase_order_items` | `0037_erp_procurement_inventory.sql` | 10 | ✅ Yes | 🔒 Active |
| `erp_purchase_orders` | `0037_erp_procurement_inventory.sql` | 18 | ✅ Yes | 🔒 Active |
| `erp_stock_movements` | `0037_erp_procurement_inventory.sql` | 15 | ✅ Yes | 🔒 Active |
| `erp_suppliers` | `0037_erp_procurement_inventory.sql` | 18 | ✅ Yes | 🔒 Active |
| `erp_warehouses` | `0037_erp_procurement_inventory.sql` | 13 | ✅ Yes | 🔒 Active |
| `invoice_line_items` | `0007_canonical_enterprise_schema.sql` | 11 | ✅ Yes | 🔓 System / Bypass |
| `invoices` | `0007_canonical_enterprise_schema.sql` | 52 | ✅ Yes | 🔒 Active |
| `payment_links` | `0007_canonical_enterprise_schema.sql` | 36 | ✅ Yes | 🔒 Active |
| `payments` | `0007_canonical_enterprise_schema.sql` | 17 | ✅ Yes | 🔓 System / Bypass |

---

## COMMUNICATIONS (28 Tables)
*Scope: Telephony (Provider-Neutral / Telnyx), Calls, Recordings, Transcripts, Summaries, Omnichannel Inbox, WhatsApp Business (Meta), and Support Tickets*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `ai_whatsapp_agent_configs` | `0027_ai_whatsapp_sales_support_agent.sql` | 15 | ✅ Yes | 🔒 Active |
| `ai_whatsapp_flow_logs` | `0027_ai_whatsapp_sales_support_agent.sql` | 12 | ✅ Yes | 🔒 Active |
| `ai_whatsapp_sessions` | `0027_ai_whatsapp_sales_support_agent.sql` | 16 | ✅ Yes | 🔒 Active |
| `ai_whatsapp_support_cases` | `0027_ai_whatsapp_sales_support_agent.sql` | 14 | ✅ Yes | 🔒 Active |
| `conversations` | `0007_canonical_enterprise_schema.sql` | 14 | ✅ Yes | 🔓 System / Bypass |
| `messages` | `0007_canonical_enterprise_schema.sql` | 15 | ✅ Yes | 🔓 System / Bypass |
| `support_case_attachments` | `0031_customer_support_module.sql` | 10 | ✅ Yes | 🔒 Active |
| `support_case_audit_events` | `0031_customer_support_module.sql` | 8 | ✅ Yes | 🔒 Active |
| `support_case_messages` | `0031_customer_support_module.sql` | 9 | ✅ Yes | 🔒 Active |
| `support_case_notes` | `0031_customer_support_module.sql` | 8 | ✅ Yes | 🔒 Active |
| `support_cases` | `0031_customer_support_module.sql` | 33 | ✅ Yes | 🔒 Active |
| `support_tickets` | `0045_ticket_raising_module.sql` | 33 | ✅ Yes | 🔒 Active |
| `telephony_call_audit_events` | `0030_call_center_extensions.sql` | 8 | ✅ Yes | 🔒 Active |
| `telephony_call_sessions` | `0028_ai_voice_telephony_foundation.sql` | 9 | ✅ Yes | 🔒 Active |
| `telephony_calling_windows` | `0028_ai_voice_telephony_foundation.sql` | 10 | ✅ Yes | 🔒 Active |
| `telephony_calls` | `0028_ai_voice_telephony_foundation.sql` | 16 | ✅ Yes | 🔒 Active |
| `telephony_configs` | `0028_ai_voice_telephony_foundation.sql` | 10 | ✅ Yes | 🔒 Active |
| `telephony_consent_records` | `0028_ai_voice_telephony_foundation.sql` | 8 | ✅ Yes | 🔒 Active |
| `telephony_escalations` | `0028_ai_voice_telephony_foundation.sql` | 10 | ✅ Yes | 🔒 Active |
| `telephony_phone_numbers` | `0028_ai_voice_telephony_foundation.sql` | 10 | ✅ Yes | 🔒 Active |
| `telephony_queues` | `0028_ai_voice_telephony_foundation.sql` | 10 | ✅ Yes | 🔒 Active |
| `telephony_recordings` | `0028_ai_voice_telephony_foundation.sql` | 10 | ✅ Yes | 🔒 Active |
| `telephony_summaries` | `0028_ai_voice_telephony_foundation.sql` | 9 | ✅ Yes | 🔒 Active |
| `telephony_transcripts` | `0028_ai_voice_telephony_foundation.sql` | 10 | ✅ Yes | 🔒 Active |
| `voice_agent_configs` | `0029_ai_voice_agent_integration.sql` | 22 | ✅ Yes | 🔒 Active |
| `voice_agent_pipelines` | `0029_ai_voice_agent_integration.sql` | 12 | ✅ Yes | 🔒 Active |
| `voice_agent_turns` | `0029_ai_voice_agent_integration.sql` | 12 | ✅ Yes | 🔒 Active |
| `voice_provider_credentials` | `0029_ai_voice_agent_integration.sql` | 7 | ✅ Yes | 🔒 Active |

---

## DOCUMENTS (2 Tables)
*Scope: Secure Document Repository, Versioning, Mathpix Invoice OCR Extractions, Review Console, and Access Audits*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `documents` | `0007_canonical_enterprise_schema.sql` | 34 | ✅ Yes | 🔒 Active |
| `ocr_extractions` | `0020_mathpix_invoice_ocr.sql` | 12 | ✅ Yes | 🔒 Active |

---

## WORKFLOWS (4 Tables)
*Scope: Visual Workflow Automations, Trigger Steps, Executions, Failure Retries, and Background Tasks*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `background_tasks` | `0018_cloud_tasks_background_execution.sql` | 24 | ✅ Yes | 🔒 Active |
| `workflow_executions` | `0007_canonical_enterprise_schema.sql` | 29 | ✅ Yes | 🔒 Active |
| `workflow_steps` | `0007_canonical_enterprise_schema.sql` | 11 | ✅ Yes | 🔓 System / Bypass |
| `workflows` | `0004_workflows_audit.sql` | 18 | ✅ Yes | 🔒 Active |

---

## AI (3 Tables)
*Scope: AI Agent Control Plane, Agent Capabilities, Tool Invocation Gateway, Autonomous Sales Agents, WhatsApp AI, and Action Receipts*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `ai_agent_actions` | `0024_ai_agent_control_plane.sql` | 11 | ✅ Yes | 🔒 Active |
| `ai_agent_runs` | `0024_ai_agent_control_plane.sql` | 13 | ✅ Yes | 🔒 Active |
| `ai_agents` | `0024_ai_agent_control_plane.sql` | 11 | ✅ Yes | 🔒 Active |

---

## INTEGRATIONS (3 Tables)
*Scope: Integration Connections, Webhooks, Razorpay Adapter, DBS RAPID, LHDN MyInvois, and Sync Logs*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `integration_connections` | `0007_canonical_enterprise_schema.sql` | 14 | ✅ Yes | 🔓 System / Bypass |
| `razorpay_orders` | `0014_razorpay_production_adapter.sql` | 15 | ✅ Yes | 🔒 Active |
| `whatsapp_templates` | `0015_meta_whatsapp_business.sql` | 16 | ✅ Yes | 🔒 Active |

---

## SECURITY AND AUDIT (5 Tables)
*Scope: Security Audit Events, Vulnerability Scans, Exception Tracking, DNC Lists, and Retention Policies*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `audit_logs` | `0004_workflows_audit.sql` | 10 | ⚪ Global / Reference | 🔒 Active |
| `command_audit_log` | `0039_global_search_universal_commands.sql` | 13 | ✅ Yes | 🔒 Active |
| `tenant_dnc_suppression_list` | `0036_enterprise_settings_and_policies.sql` | 10 | ✅ Yes | 🔒 Active |
| `tenant_retention_schedules` | `0036_enterprise_settings_and_policies.sql` | 8 | ✅ Yes | 🔒 Active |
| `tenant_settings_and_policies` | `0036_enterprise_settings_and_policies.sql` | 145 | ✅ Yes | 🔒 Active |

---

## ANALYTICS AND TELEMETRY (9 Tables)
*Scope: Analytics Snapshots, Multi-Touch Attribution, ROI Impact Ledgers, Global Search Index, CI/CD Telemetry, and Observability Metrics*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `analytics_snapshots` | `0033_analytics_and_roi.sql` | 37 | ✅ Yes | 🔒 Active |
| `analytics_touchpoint_attributions` | `0033_analytics_and_roi.sql` | 13 | ✅ Yes | 🔒 Active |
| `cicd_deployments` | `0041_cicd_deployment_telemetry.sql` | 16 | ✅ Yes | 🔒 Active |
| `cicd_pipeline_runs` | `0041_cicd_deployment_telemetry.sql` | 17 | ✅ Yes | 🔒 Active |
| `cicd_validation_gates` | `0041_cicd_deployment_telemetry.sql` | 9 | ⚪ Global / Reference | 🔒 Active |
| `observability_metrics` | `0040_production_observability_telemetry.sql` | 7 | ✅ Yes | 🔒 Active |
| `roi_agent_impact_ledger` | `0033_analytics_and_roi.sql` | 12 | ✅ Yes | 🔒 Active |
| `search_index_entries` | `0039_global_search_universal_commands.sql` | 15 | ✅ Yes | 🔒 Active |
| `universal_commands` | `0039_global_search_universal_commands.sql` | 14 | ⚪ Global / Reference | 🔒 Active |

---

## OTHER TABLES (97 Tables)
*Scope: Underlying Relational Junctions, Historical Adapters, and Operational Tables*

| Table Name | Source Migration | Columns | Org / Tenant Isolated | RLS Enforced |
|---|---|---:|:---:|:---:|
| `accounting_connections` | `0013_accounting_connectors.sql` | 26 | ✅ Yes | 🔒 Active |
| `accounting_entity_mappings` | `0013_accounting_connectors.sql` | 19 | ✅ Yes | 🔒 Active |
| `accounting_reconciliation_ledgers` | `0013_accounting_connectors.sql` | 16 | ✅ Yes | 🔒 Active |
| `accounts` | `0002_unified_customer.sql` | 9 | ⚪ Global / Reference | 🔒 Active |
| `agent_actions` | `0007_canonical_enterprise_schema.sql` | 9 | ✅ Yes | 🔓 System / Bypass |
| `agent_runs` | `0007_canonical_enterprise_schema.sql` | 11 | ✅ Yes | 🔓 System / Bypass |
| `ai_agent_approvals` | `0024_ai_agent_control_plane.sql` | 14 | ✅ Yes | 🔒 Active |
| `ai_agent_audit_logs` | `0024_ai_agent_control_plane.sql` | 11 | ✅ Yes | 🔒 Active |
| `ai_agent_capabilities` | `0024_ai_agent_control_plane.sql` | 7 | ✅ Yes | 🔒 Active |
| `ai_agent_failures` | `0024_ai_agent_control_plane.sql` | 10 | ✅ Yes | 🔒 Active |
| `ai_agent_permissions` | `0024_ai_agent_control_plane.sql` | 7 | ✅ Yes | 🔒 Active |
| `ai_agent_policies` | `0024_ai_agent_control_plane.sql` | 7 | ✅ Yes | 🔒 Active |
| `ai_agent_results` | `0024_ai_agent_control_plane.sql` | 8 | ✅ Yes | 🔒 Active |
| `ai_agent_tools` | `0024_ai_agent_control_plane.sql` | 10 | ✅ Yes | 🔒 Active |
| `ai_agent_versions` | `0024_ai_agent_control_plane.sql` | 13 | ✅ Yes | 🔒 Active |
| `ai_communications` | `0004_workflows_audit.sql` | 10 | ⚪ Global / Reference | 🔒 Active |
| `ai_sales_configs` | `0026_ai_sales_agent.sql` | 17 | ✅ Yes | 🔒 Active |
| `ai_sales_conversations` | `0026_ai_sales_agent.sql` | 12 | ✅ Yes | 🔒 Active |
| `ai_sales_handoffs` | `0026_ai_sales_agent.sql` | 13 | ✅ Yes | 🔒 Active |
| `ai_sales_leads` | `0026_ai_sales_agent.sql` | 20 | ✅ Yes | 🔒 Active |
| `ai_tool_audit_trail` | `0025_ai_tool_gateway.sql` | 10 | ✅ Yes | 🔒 Active |
| `ai_tool_catalog` | `0025_ai_tool_gateway.sql` | 14 | ⚪ Global / Reference | 🔓 System / Bypass |
| `ai_tool_idempotency` | `0025_ai_tool_gateway.sql` | 9 | ✅ Yes | 🔒 Active |
| `ai_tool_invocations` | `0025_ai_tool_gateway.sql` | 15 | ✅ Yes | 🔒 Active |
| `ai_tool_rate_limits` | `0025_ai_tool_gateway.sql` | 7 | ✅ Yes | 🔒 Active |
| `audit_events` | `0007_canonical_enterprise_schema.sql` | 13 | ✅ Yes | 🔓 System / Bypass |
| `autonomous_collections_stage_logs` | `0023_autonomous_collections_workflow.sql` | 13 | ✅ Yes | 🔒 Active |
| `background_dead_letter_queue` | `0018_cloud_tasks_background_execution.sql` | 13 | ✅ Yes | 🔒 Active |
| `calls` | `0007_canonical_enterprise_schema.sql` | 20 | ✅ Yes | 🔓 System / Bypass |
| `collections_cases` | `0022_collections_policy_engine.sql` | 13 | ✅ Yes | 🔒 Active |
| `collections_executions` | `0022_collections_policy_engine.sql` | 16 | ✅ Yes | 🔒 Active |
| `collections_promises_to_pay` | `0022_collections_policy_engine.sql` | 12 | ✅ Yes | 🔒 Active |
| `consents` | `0007_canonical_enterprise_schema.sql` | 12 | ✅ Yes | 🔓 System / Bypass |
| `credential_leak_scans` | `0043_comprehensive_security_audit.sql` | 9 | ✅ Yes | 🔒 Active |
| `crm_deals` | `0004_workflows_audit.sql` | 9 | ⚪ Global / Reference | 🔒 Active |
| `customer_timeline_events` | `0009_audit_timeline_exceptions.sql` | 16 | ✅ Yes | 🔒 Active |
| `document_access_audits` | `0019_secure_document_storage.sql` | 10 | ✅ Yes | 🔒 Active |
| `document_versions` | `0019_secure_document_storage.sql` | 15 | ✅ Yes | 🔒 Active |
| `e2e_lifecycle_audit_runs` | `0044_complete_e2e_audit_telemetry.sql` | 14 | ✅ Yes | 🔒 Active |
| `e2e_lifecycle_step_results` | `0044_complete_e2e_audit_telemetry.sql` | 18 | ✅ Yes | 🔒 Active |
| `e2e_provider_connectivity_snapshots` | `0044_complete_e2e_audit_telemetry.sql` | 10 | ✅ Yes | 🔒 Active |
| `erp_invoices` | `0004_workflows_audit.sql` | 9 | ⚪ Global / Reference | 🔒 Active |
| `exceptions` | `0007_canonical_enterprise_schema.sql` | 12 | ✅ Yes | 🔓 System / Bypass |
| `executive_kpi_snapshots` | `0032_executive_command_center.sql` | 64 | ✅ Yes | 🔒 Active |
| `executive_operational_alerts` | `0032_executive_command_center.sql` | 14 | ✅ Yes | 🔒 Active |
| `external_events` | `0007_canonical_enterprise_schema.sql` | 10 | ✅ Yes | 🔓 System / Bypass |
| `gcp_environment_configs` | `0042_gcp_infrastructure_telemetry.sql` | 12 | ✅ Yes | 🔒 Active |
| `gcp_infrastructure_resources` | `0042_gcp_infrastructure_telemetry.sql` | 12 | ✅ Yes | 🔒 Active |
| `gcp_secret_vault_catalog` | `0042_gcp_infrastructure_telemetry.sql` | 11 | ✅ Yes | 🔒 Active |
| `idempotency_keys` | `0008_event_architecture_and_outbox.sql` | 9 | ✅ Yes | 🔒 Active |
| `integration_health_checks` | `0040_production_observability_telemetry.sql` | 9 | ✅ Yes | 🔒 Active |
| `integration_webhook_deliveries` | `0010_integration_framework.sql` | 15 | ✅ Yes | 🔒 Active |
| `invoice_extractions` | `0007_canonical_enterprise_schema.sql` | 14 | ✅ Yes | 🔓 System / Bypass |
| `invoice_items` | `0011_invoice_domain.sql` | 12 | ⚪ Global / Reference | 🔒 Active |
| `invoice_payments` | `0011_invoice_domain.sql` | 13 | ✅ Yes | 🔒 Active |
| `invoice_timeline_events` | `0011_invoice_domain.sql` | 11 | ✅ Yes | 🔒 Active |
| `ocr_anomalies` | `0020_mathpix_invoice_ocr.sql` | 14 | ✅ Yes | 🔒 Active |
| `ocr_extracted_invoices` | `0020_mathpix_invoice_ocr.sql` | 20 | ✅ Yes | 🔒 Active |
| `ocr_extracted_line_items` | `0020_mathpix_invoice_ocr.sql` | 12 | ✅ Yes | 🔒 Active |
| `ocr_provider_credentials` | `0020_mathpix_invoice_ocr.sql` | 11 | ✅ Yes | 🔒 Active |
| `ocr_review_audit_logs` | `0021_ocr_review_console.sql` | 12 | ✅ Yes | 🔒 Active |
| `omnichannel_messages` | `0016_omnichannel_inbox.sql` | 20 | ✅ Yes | 🔒 Active |
| `omnichannel_tags` | `0016_omnichannel_inbox.sql` | 5 | ✅ Yes | 🔒 Active |
| `omnichannel_thread_tags` | `0016_omnichannel_inbox.sql` | 3 | ⚪ Global / Reference | 🔒 Active |
| `omnichannel_threads` | `0016_omnichannel_inbox.sql` | 21 | ✅ Yes | 🔒 Active |
| `organization_memberships` | `0005_auth_and_memberships.sql` | 8 | ✅ Yes | 🔓 System / Bypass |
| `outbox_events` | `0003_timeline_outbox.sql` | 20 | ✅ Yes | 🔒 Active |
| `payment_allocations` | `0012_payment_domain.sql` | 11 | ✅ Yes | 🔒 Active |
| `payment_attempts` | `0012_payment_domain.sql` | 20 | ✅ Yes | 🔒 Active |
| `payment_reconciliations` | `0012_payment_domain.sql` | 16 | ✅ Yes | 🔒 Active |
| `payment_transactions` | `0012_payment_domain.sql` | 29 | ✅ Yes | 🔒 Active |
| `processed_events` | `0008_event_architecture_and_outbox.sql` | 6 | ✅ Yes | 🔒 Active |
| `razorpay_credentials` | `0014_razorpay_production_adapter.sql` | 11 | ✅ Yes | 🔒 Active |
| `razorpay_payments` | `0014_razorpay_production_adapter.sql` | 25 | ✅ Yes | 🔒 Active |
| `razorpay_webhook_deliveries` | `0014_razorpay_production_adapter.sql` | 10 | ✅ Yes | 🔒 Active |
| `regional_connector_configurations` | `0035_regional_integration_connectors.sql` | 18 | ✅ Yes | 🔒 Active |
| `regional_integration_audit_log` | `0035_regional_integration_connectors.sql` | 7 | ✅ Yes | 🔒 Active |
| `roi_metrics` | `0007_canonical_enterprise_schema.sql` | 11 | ✅ Yes | 🔓 System / Bypass |
| `security_audit_findings` | `0043_comprehensive_security_audit.sql` | 11 | ✅ Yes | 🔒 Active |
| `security_compliance_benchmarks` | `0043_comprehensive_security_audit.sql` | 8 | ✅ Yes | 🔒 Active |
| `sentry_error_events` | `0040_production_observability_telemetry.sql` | 15 | ✅ Yes | 🔒 Active |
| `subsystem_health_status` | `0040_production_observability_telemetry.sql` | 10 | ✅ Yes | 🔒 Active |
| `support_ticket_activities` | `0045_ticket_raising_module.sql` | 10 | ✅ Yes | 🔒 Active |
| `support_ticket_comments` | `0045_ticket_raising_module.sql` | 8 | ✅ Yes | 🔒 Active |
| `tenant_country_pack_configs` | `0034_regional_country_pack_engine.sql` | 24 | ✅ Yes | 🔒 Active |
| `tenants` | `0001_init_schema.sql` | 7 | ⚪ Global / Reference | 🔓 System / Bypass |
| `timeline_entries` | `0003_timeline_outbox.sql` | 10 | ⚪ Global / Reference | 🔒 Active |
| `trace_spans` | `0040_production_observability_telemetry.sql` | 14 | ✅ Yes | 🔒 Active |
| `user_identities` | `0005_auth_and_memberships.sql` | 9 | ⚪ Global / Reference | 🔓 System / Bypass |
| `whatsapp_configs` | `0015_meta_whatsapp_business.sql` | 16 | ✅ Yes | 🔒 Active |
| `whatsapp_contacts_consent` | `0015_meta_whatsapp_business.sql` | 12 | ✅ Yes | 🔒 Active |
| `whatsapp_conversations` | `0015_meta_whatsapp_business.sql` | 16 | ✅ Yes | 🔒 Active |
| `whatsapp_messages` | `0015_meta_whatsapp_business.sql` | 25 | ✅ Yes | 🔒 Active |
| `whatsapp_webhook_events` | `0015_meta_whatsapp_business.sql` | 10 | ✅ Yes | 🔒 Active |
| `worker_queue_telemetry` | `0040_production_observability_telemetry.sql` | 10 | ✅ Yes | 🔒 Active |
| `workflow_audit_logs` | `0017_workflow_automation_engine.sql` | 9 | ✅ Yes | 🔒 Active |
| `workflow_definitions` | `0017_workflow_automation_engine.sql` | 14 | ✅ Yes | 🔒 Active |

---

## 2. Functions and Database Procedures

The current PostgreSQL database defines 7 core functions for multi-tenancy, timestamp management, and audit integrity:

| Function Name | Description |
|---|---|
| `current_business_unit_id()` | Core PostgreSQL procedural function |
| `current_tenant_id()` | Core PostgreSQL procedural function |
| `current_user_role()` | Core PostgreSQL procedural function |
| `prevent_ai_tool_audit_tampering()` | Core PostgreSQL procedural function |
| `prevent_audit_tampering()` | Core PostgreSQL procedural function |
| `update_search_vector()` | Core PostgreSQL procedural function |
| `verify_user_organization_membership()` | Core PostgreSQL procedural function |

---

## 3. Strict Prohibitions Audit

- **Twilio Entities:** Verified absent. All telephony entities (`telephony_configs`, `telephony_phone_numbers`, `voice_agent_configs`) utilize provider-neutral and Telnyx-compatible structures (Migration 0047).
- **ElevenLabs Entities:** Verified absent. All voice synthesis entities use provider-neutral audio stream identifiers (Migration 0046).
- **Fake/Sample Data:** Zero generated mock data. Schema strictly models canonical production domain records.
