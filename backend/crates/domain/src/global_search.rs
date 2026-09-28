use std::collections::HashMap;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use platform_common::PlatformError;
use crate::{AiToolGateway, ToolGatewayRequest, ToolGatewayResponse};

// ============================================================================
// 1. Search Entity Types (13 Entities)
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SearchEntityType {
    Customer,
    Company,
    Contact,
    Lead,
    Deal,
    Quote,
    Invoice,
    Payment,
    Conversation,
    Call,
    Document,
    Workflow,
    AiAgent,
}

impl SearchEntityType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Customer => "customer",
            Self::Company => "company",
            Self::Contact => "contact",
            Self::Lead => "lead",
            Self::Deal => "deal",
            Self::Quote => "quote",
            Self::Invoice => "invoice",
            Self::Payment => "payment",
            Self::Conversation => "conversation",
            Self::Call => "call",
            Self::Document => "document",
            Self::Workflow => "workflow",
            Self::AiAgent => "ai_agent",
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Customer => "Customer 360",
            Self::Company => "Company",
            Self::Contact => "Contact",
            Self::Lead => "Lead",
            Self::Deal => "CRM Deal",
            Self::Quote => "ERP Quote",
            Self::Invoice => "ERP Invoice",
            Self::Payment => "Payment Transaction",
            Self::Conversation => "Omnichannel Conversation",
            Self::Call => "Voice Telephony Call",
            Self::Document => "OCR Document",
            Self::Workflow => "Workflow Automation",
            Self::AiAgent => "AI Agent",
        }
    }

    pub fn default_route(&self, id: &str) -> String {
        match self {
            Self::Customer => format!("/customers/{}", id),
            Self::Company => "/companies".to_string(),
            Self::Contact => "/contacts".to_string(),
            Self::Lead => "/leads".to_string(),
            Self::Deal => "/crm".to_string(),
            Self::Quote => "/quotes".to_string(),
            Self::Invoice => "/invoices".to_string(),
            Self::Payment => "/payments".to_string(),
            Self::Conversation => "/conversations".to_string(),
            Self::Call => "/voice-calls".to_string(),
            Self::Document => "/documents".to_string(),
            Self::Workflow => "/workflows".to_string(),
            Self::AiAgent => "/ai-agents".to_string(),
        }
    }

    pub fn all_entities() -> Vec<SearchEntityType> {
        vec![
            Self::Customer,
            Self::Company,
            Self::Contact,
            Self::Lead,
            Self::Deal,
            Self::Quote,
            Self::Invoice,
            Self::Payment,
            Self::Conversation,
            Self::Call,
            Self::Document,
            Self::Workflow,
            Self::AiAgent,
        ]
    }
}

// ============================================================================
// 2. Search Result & Command Models
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResultItem {
    pub id: Uuid,
    pub entity_type: SearchEntityType,
    pub entity_id: Uuid,
    pub title: String,
    pub subtitle: Option<String>,
    pub snippet: Option<String>,
    pub deep_link: String,
    pub tags: Vec<String>,
    pub metadata: Value,
    pub score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniversalCommand {
    pub id: Uuid,
    pub command_slug: String,
    pub title: String,
    pub description: String,
    pub category: String, // 'crm', 'erp', 'communications', 'automation', 'intelligence', 'system'
    pub icon_name: String,
    pub shortcut: Option<String>,
    pub target_tool_name: String,
    pub default_parameters: Value,
    pub required_roles: Vec<String>,
    pub required_capability: String,
    pub is_autonomous_allowed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalSearchRequest {
    pub organization_id: Uuid,
    pub query: String,
    pub entity_types: Option<Vec<SearchEntityType>>,
    pub limit: usize,
    pub caller_role: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalSearchResponse {
    pub query: String,
    pub total_results: usize,
    pub results_by_entity: HashMap<String, usize>,
    pub items: Vec<SearchResultItem>,
    pub suggested_commands: Vec<UniversalCommand>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecuteUniversalCommandRequest {
    pub organization_id: Uuid,
    pub command_slug: String,
    pub caller_role: String,
    pub caller_email: String,
    pub actor_type: String, // 'human', 'ai_agent'
    pub parameters: Value,
    pub correlation_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecuteUniversalCommandResponse {
    pub status: String,
    pub command_slug: String,
    pub tool_name: String,
    pub result: Option<Value>,
    pub error_message: Option<String>,
    pub sha256_audit_hash: String,
    pub duration_ms: i64,
    pub correlation_id: String,
}

// ============================================================================
// 3. Global Search & Universal Command Engine
// ============================================================================

pub struct GlobalSearchEngine;

impl GlobalSearchEngine {
    /// Returns the core catalog of Universal Commands wired directly to Tool Gateway tools
    pub fn get_universal_commands(caller_role: &str) -> Vec<UniversalCommand> {
        let commands = vec![
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "search-customer-360".into(),
                title: "Search Customer 360".into(),
                description: "Query unified identity, contacts, outstanding debt, and lifetime value".into(),
                category: "crm".into(),
                icon_name: "Users".into(),
                shortcut: Some("G C".into()),
                target_tool_name: "customer_search".into(),
                default_parameters: json!({"query": ""}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into(), "finance_officer".into(), "auditor".into()],
                required_capability: "customers:read".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "create-quote".into(),
                title: "Create Commercial Quote".into(),
                description: "Draft estimate with line items, warehouse reservation, and tax calculation".into(),
                category: "erp".into(),
                icon_name: "FileCheck".into(),
                shortcut: Some("N Q".into()),
                target_tool_name: "quote_creation".into(),
                default_parameters: json!({"discount_percentage": 0.0}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into(), "finance_officer".into()],
                required_capability: "quotes:write".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "lookup-invoice".into(),
                title: "Lookup Invoice & Aging".into(),
                description: "Check invoice balance, payment status, aging days, and PDF download".into(),
                category: "erp".into(),
                icon_name: "DollarSign".into(),
                shortcut: Some("L I".into()),
                target_tool_name: "invoice_lookup".into(),
                default_parameters: json!({}),
                required_roles: vec!["admin".into(), "manager".into(), "finance_officer".into(), "auditor".into()],
                required_capability: "invoices:read".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "create-payment-link".into(),
                title: "Generate Razorpay Payment Link".into(),
                description: "Create secure hosted checkout payment link with QR code".into(),
                category: "erp".into(),
                icon_name: "Link2".into(),
                shortcut: Some("N P".into()),
                target_tool_name: "payment_link_creation".into(),
                default_parameters: json!({"currency": "USD"}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into(), "finance_officer".into()],
                required_capability: "payments:generate_link".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "lookup-inventory-stock".into(),
                title: "Check Inventory Stock".into(),
                description: "Query warehouse stock, on-hand, allocated, and reorder status".into(),
                category: "erp".into(),
                icon_name: "FolderGit2".into(),
                shortcut: Some("L S".into()),
                target_tool_name: "inventory_lookup".into(),
                default_parameters: json!({"warehouse_code": "WH-SG-01"}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into(), "finance_officer".into()],
                required_capability: "inventory:read".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "create-procurement-po".into(),
                title: "Create Purchase Order".into(),
                description: "Draft procurement PO to replenish low inventory stock".into(),
                category: "erp".into(),
                icon_name: "Package".into(),
                shortcut: Some("N O".into()),
                target_tool_name: "create_procurement_po".into(),
                default_parameters: json!({"warehouse_code": "WH-SG-01"}),
                required_roles: vec!["admin".into(), "manager".into(), "finance_officer".into()],
                required_capability: "procurement:create".into(),
                is_autonomous_allowed: false,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "advance-sales-flow".into(),
                title: "Advance 9-Stage Sales Flow".into(),
                description: "Progress deal through complete Lead-to-Cash sales cycle".into(),
                category: "crm".into(),
                icon_name: "TrendingUp".into(),
                shortcut: Some("A F".into()),
                target_tool_name: "sales_flow_advance".into(),
                default_parameters: json!({}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into()],
                required_capability: "sales:advance_flow".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "send-whatsapp-notice".into(),
                title: "Send WhatsApp Notification".into(),
                description: "Dispatch approved WhatsApp template after consent verification".into(),
                category: "communications".into(),
                icon_name: "MessageCircle".into(),
                shortcut: Some("S W".into()),
                target_tool_name: "whatsapp_sending".into(),
                default_parameters: json!({"consent_verified": true}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into()],
                required_capability: "whatsapp:send".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "schedule-voice-call".into(),
                title: "Schedule AI Voice Call".into(),
                description: "Schedule automated voice agent call within compliant calling hours".into(),
                category: "communications".into(),
                icon_name: "PhoneCall".into(),
                shortcut: Some("S C".into()),
                target_tool_name: "call_scheduling".into(),
                default_parameters: json!({}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into()],
                required_capability: "telephony:schedule".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "trigger-workflow".into(),
                title: "Execute Workflow Pipeline".into(),
                description: "Trigger automation DAG with payload and correlation ID".into(),
                category: "automation".into(),
                icon_name: "GitBranch".into(),
                shortcut: Some("E W".into()),
                target_tool_name: "workflow_execution".into(),
                default_parameters: json!({}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into(), "finance_officer".into()],
                required_capability: "workflows:execute".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "query-analytics-roi".into(),
                title: "Query Analytics & ROI".into(),
                description: "View financial recovery rate, DSO, CAC, and conversion metrics".into(),
                category: "intelligence".into(),
                icon_name: "BarChart3".into(),
                shortcut: Some("Q A".into()),
                target_tool_name: "analytics_lookup".into(),
                default_parameters: json!({"metric_category": "executive_summary"}),
                required_roles: vec!["admin".into(), "manager".into(), "sales_agent".into(), "finance_officer".into(), "auditor".into()],
                required_capability: "analytics:read".into(),
                is_autonomous_allowed: true,
            },
            UniversalCommand {
                id: Uuid::new_v4(),
                command_slug: "log-platform-exception".into(),
                title: "Log Platform Exception".into(),
                description: "Record structured domain exception with severity and auto-remediation task".into(),
                category: "system".into(),
                icon_name: "AlertTriangle".into(),
                shortcut: Some("L E".into()),
                target_tool_name: "exception_creation".into(),
                default_parameters: json!({"severity": "medium"}),
                required_roles: vec!["admin".into(), "manager".into(), "finance_officer".into()],
                required_capability: "exceptions:write".into(),
                is_autonomous_allowed: true,
            },
        ];

        // Filter commands by caller role
        commands
            .into_iter()
            .filter(|c| c.required_roles.iter().any(|r| r == caller_role || caller_role == "admin" || caller_role == "super_admin"))
            .collect()
    }

    /// Primary Global Search across all 13 entity types
    pub fn search(
        req: GlobalSearchRequest,
        mock_data: Option<Vec<SearchResultItem>>,
    ) -> Result<GlobalSearchResponse, PlatformError> {
        let clean_query = req.query.trim().to_lowercase();
        let entity_filter = req.entity_types.unwrap_or_else(SearchEntityType::all_entities);
        let limit = if req.limit == 0 { 20 } else { req.limit };

        // Generate synthetic comprehensive mock data if none provided (guaranteeing coverage across all 13 entities)
        let records = mock_data.unwrap_or_else(|| Self::generate_mock_corpus(req.organization_id));

        let mut matched_items = Vec::new();
        let mut entity_counts: HashMap<String, usize> = HashMap::new();

        for item in records {
            // Filter by selected entity types
            if !entity_filter.contains(&item.entity_type) {
                continue;
            }

            let mut match_score = 0.0;

            if clean_query.is_empty() {
                // Return all items if no query
                match_score = 1.0;
            } else {
                let title_lower = item.title.to_lowercase();
                let subtitle_lower = item.subtitle.as_deref().unwrap_or("").to_lowercase();
                let snippet_lower = item.snippet.as_deref().unwrap_or("").to_lowercase();
                let tags_str = item.tags.join(" ").to_lowercase();

                if title_lower == clean_query {
                    match_score += 100.0;
                } else if title_lower.starts_with(&clean_query) {
                    match_score += 50.0;
                } else if title_lower.contains(&clean_query) {
                    match_score += 30.0;
                }

                if subtitle_lower.contains(&clean_query) {
                    match_score += 20.0;
                }

                if tags_str.contains(&clean_query) {
                    match_score += 15.0;
                }

                if snippet_lower.contains(&clean_query) {
                    match_score += 10.0;
                }
            }

            if match_score > 0.0 {
                let entity_str = item.entity_type.as_str().to_string();
                *entity_counts.entry(entity_str).or_insert(0) += 1;

                let mut scored_item = item;
                scored_item.score = match_score;
                matched_items.push(scored_item);
            }
        }

        // Sort results by relevance score descending
        matched_items.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        matched_items.truncate(limit);

        // Find suggested commands matching query
        let all_commands = Self::get_universal_commands(&req.caller_role);
        let suggested_commands: Vec<UniversalCommand> = if clean_query.is_empty() {
            all_commands.into_iter().take(5).collect()
        } else {
            all_commands
                .into_iter()
                .filter(|c| {
                    c.title.to_lowercase().contains(&clean_query)
                        || c.description.to_lowercase().contains(&clean_query)
                        || c.category.to_lowercase().contains(&clean_query)
                })
                .collect()
        };

        let total_results = matched_items.len();

        Ok(GlobalSearchResponse {
            query: req.query,
            total_results,
            results_by_entity: entity_counts,
            items: matched_items,
            suggested_commands,
        })
    }

    /// Execute a Universal Command through the Tool Gateway
    pub fn execute_command(
        req: ExecuteUniversalCommandRequest,
    ) -> Result<ExecuteUniversalCommandResponse, PlatformError> {
        let start_time = Utc::now();

        // 1. Locate command definition
        let commands = Self::get_universal_commands(&req.caller_role);
        let command = commands
            .iter()
            .find(|c| c.command_slug == req.command_slug)
            .ok_or_else(|| {
                PlatformError::NotFound(format!(
                    "Universal command '{}' not found or caller role '{}' is unauthorized.",
                    req.command_slug, req.caller_role
                ))
            })?;

        // 2. Build Tool Gateway request
        let mut final_args = command.default_parameters.clone();
        if let Some(obj) = req.parameters.as_object() {
            if let Some(final_obj) = final_args.as_object_mut() {
                for (k, v) in obj {
                    final_obj.insert(k.clone(), v.clone());
                }
            } else {
                final_args = req.parameters.clone();
            }
        }

        let gateway_req = ToolGatewayRequest {
            organization_id: req.organization_id,
            agent_id: None,
            caller_role: req.caller_role,
            tool_name: command.target_tool_name.clone(),
            arguments: final_args,
            idempotency_key: Some(format!("cmd_{}_{}", command.command_slug, Uuid::new_v4().simple())),
            correlation_id: req.correlation_id.clone(),
            granted_capabilities: vec![command.required_capability.clone()],
        };

        // 3. Dispatch to Tool Gateway
        let gateway_resp = AiToolGateway::execute(gateway_req, None, 1)?;

        let duration = (Utc::now() - start_time).num_milliseconds().max(1);

        Ok(ExecuteUniversalCommandResponse {
            status: gateway_resp.status,
            command_slug: command.command_slug.clone(),
            tool_name: command.target_tool_name.clone(),
            result: gateway_resp.result,
            error_message: gateway_resp.error_message,
            sha256_audit_hash: gateway_resp.sha256_audit_hash,
            duration_ms: duration,
            correlation_id: req.correlation_id,
        })
    }

    /// Generates sample multi-entity mock corpus for search demonstrations
    fn generate_mock_corpus(org_id: Uuid) -> Vec<SearchResultItem> {
        vec![
            // 1. Customer
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Customer,
                entity_id: Uuid::new_v4(),
                title: "Acme Global Solutions Pte Ltd".into(),
                subtitle: Some("Enterprise Client · billing@acmeglobal.com".into()),
                snippet: Some("Key enterprise tenant with 120 PBX voice seats and high volume WhatsApp HSM dispatch.".into()),
                deep_link: "/customers/c1a8d052-1982-4fae-9ef7-47b2c019a112".into(),
                tags: vec!["enterprise".into(), "apac".into(), "vip".into()],
                metadata: json!({"mrr": 18500.0, "status": "active"}),
                score: 1.0,
            },
            // 2. Company
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Company,
                entity_id: Uuid::new_v4(),
                title: "SingaMaritime Fleet Logistics".into(),
                subtitle: Some("UEN: 202619842K · Maritime & Ports".into()),
                snippet: Some("Regional freight carrier operating across Singapore, Port Klang, and Bangkok.".into()),
                deep_link: "/companies".into(),
                tags: vec!["logistics".into(), "sg".into(), "tier_1".into()],
                metadata: json!({"country": "SG", "fleet_size": 48}),
                score: 1.0,
            },
            // 3. Contact
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Contact,
                entity_id: Uuid::new_v4(),
                title: "Marcus Vance".into(),
                subtitle: Some("VP Technology · Acme Global Solutions".into()),
                snippet: Some("Primary commercial decision maker for PBX cloud migration and telephony routing.".into()),
                deep_link: "/contacts".into(),
                tags: vec!["decision_maker".into(), "executive".into()],
                metadata: json!({"phone": "+65 6712 9081", "email": "m.vance@acmeglobal.com"}),
                score: 1.0,
            },
            // 4. Lead
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Lead,
                entity_id: Uuid::new_v4(),
                title: "Pacific Marine Cloud RFP Lead".into(),
                subtitle: Some("Score: 92/100 · Inbound Website Form".into()),
                snippet: Some("BANT qualified inquiry requesting quote for 10x Nexus Edge Telephony v4 appliances.".into()),
                deep_link: "/leads".into(),
                tags: vec!["hot_lead".into(), "bant_verified".into()],
                metadata: json!({"estimated_value": 34500.0, "status": "qualified"}),
                score: 1.0,
            },
            // 5. Deal
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Deal,
                entity_id: Uuid::new_v4(),
                title: "Enterprise Omnichannel Expansion Deal".into(),
                subtitle: Some("Stage: Negotiation (80%) · $34,500.00".into()),
                snippet: Some("Closing scheduled for end of month. Awaiting final customer signature on quote.".into()),
                deep_link: "/crm".into(),
                tags: vec!["pipeline".into(), "q3".into()],
                metadata: json!({"probability": 0.80, "amount": 34500.0}),
                score: 1.0,
            },
            // 6. Quote
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Quote,
                entity_id: Uuid::new_v4(),
                title: "Quote QT-2026-0814".into(),
                subtitle: Some("Total: $37,605.00 (Incl. 9% GST) · Approved".into()),
                snippet: Some("10x NX-SVR-EDGE allocated and reserved in warehouse WH-SG-01.".into()),
                deep_link: "/quotes".into(),
                tags: vec!["approved".into(), "inventory_reserved".into()],
                metadata: json!({"quote_number": "QT-2026-0814", "valid_until": "2026-10-31"}),
                score: 1.0,
            },
            // 7. Invoice
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Invoice,
                entity_id: Uuid::new_v4(),
                title: "Invoice INV-2026-0814".into(),
                subtitle: Some("Amount: $37,605.00 · Balance Due: $0.00".into()),
                snippet: Some("Official ERP Tax Invoice. Settled via Razorpay UPI and reconciled in General Ledger.".into()),
                deep_link: "/invoices".into(),
                tags: vec!["paid".into(), "reconciled".into()],
                metadata: json!({"status": "paid", "due_date": "2026-10-23"}),
                score: 1.0,
            },
            // 8. Payment
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Payment,
                entity_id: Uuid::new_v4(),
                title: "Payment pay_Rzp9821AcmeSettled".into(),
                subtitle: Some("Provider: Razorpay · $37,605.00 USD".into()),
                snippet: Some("Instant payment capture via Razorpay webhook. Bank reconciliation confirmed.".into()),
                deep_link: "/payments".into(),
                tags: vec!["razorpay".into(), "captured".into()],
                metadata: json!({"method": "upi", "provider": "razorpay"}),
                score: 1.0,
            },
            // 9. Conversation
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Conversation,
                entity_id: Uuid::new_v4(),
                title: "WhatsApp Chat with Marcus Vance".into(),
                subtitle: Some("Channel: WhatsApp Business · 14 Messages".into()),
                snippet: Some("Customer: 'Thanks for the payment link! Just authorized payment through Razorpay.'".into()),
                deep_link: "/conversations".into(),
                tags: vec!["whatsapp".into(), "consent_verified".into()],
                metadata: json!({"unread": 0, "last_active": "10m ago"}),
                score: 1.0,
            },
            // 10. Call
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Call,
                entity_id: Uuid::new_v4(),
                title: "AI Voice PBX Call: SingaMaritime Lead".into(),
                subtitle: Some("Duration: 4m 12s · Positive Sentiment (0.92)".into()),
                snippet: Some("AI Voice Agent qualified technical requirements and scheduled AE demo for Thursday.".into()),
                deep_link: "/voice-calls".into(),
                tags: vec!["ai_transcribed".into(), "telephony".into()],
                metadata: json!({"agent": "Nexus AI Voice", "mos_score": 4.6}),
                score: 1.0,
            },
            // 11. Document
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Document,
                entity_id: Uuid::new_v4(),
                title: "Commercial Master Service Agreement 2026.pdf".into(),
                subtitle: Some("OCR Verified · 2.4 MB · Legal".into()),
                snippet: Some("Bilingual English/Mandarin SLA agreement processed through Mathpix OCR engine.".into()),
                deep_link: "/documents".into(),
                tags: vec!["ocr_processed".into(), "signed".into()],
                metadata: json!({"pages": 12, "ocr_confidence": 0.99}),
                score: 1.0,
            },
            // 12. Workflow
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::Workflow,
                entity_id: Uuid::new_v4(),
                title: "Autonomous Invoice Payment & Stock Fulfillment".into(),
                subtitle: Some("Trigger: payment.captured · 9 Steps · Active".into()),
                snippet: Some("Reconciles GL ledger, updates customer credit, releases warehouse stock, and pings WhatsApp.".into()),
                deep_link: "/workflows".into(),
                tags: vec!["automation".into(), "cloud_tasks".into()],
                metadata: json!({"executions_today": 142, "failure_rate": 0.0}),
                score: 1.0,
            },
            // 13. AI Agent
            SearchResultItem {
                id: Uuid::new_v4(),
                entity_type: SearchEntityType::AiAgent,
                entity_id: Uuid::new_v4(),
                title: "Nexus Commercial Sales Agent".into(),
                subtitle: Some("Role: sales_agent · 12 Tools · Active Copilot".into()),
                snippet: Some("Authorized for autonomous Lead-to-Cash progression with enterprise safety guardrails.".into()),
                deep_link: "/ai-agents".into(),
                tags: vec!["copilot".into(), "tool_gateway".into()],
                metadata: json!({"model": "gemini-1.5-pro", "autonomy_level": "supervised"}),
                score: 1.0,
            },
        ]
    }
}
