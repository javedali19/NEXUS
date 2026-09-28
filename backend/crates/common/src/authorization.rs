use crate::TenantContext;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use uuid::Uuid;

// ============================================================================
// 1. Granular Platform Permissions
// ============================================================================
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Permission {
    // Customers
    CustomersRead,
    CustomersWrite,
    CustomersDelete,

    // CRM & Sales
    CrmRead,
    CrmWrite,
    CrmDealClose,
    SalesQuotesRead,
    SalesQuotesWrite,

    // ERP, Invoices, Payments, Collections
    InvoicesRead,
    InvoicesWrite,
    InvoicesVoid,
    PaymentsRead,
    PaymentsProcess,
    CollectionsRead,
    CollectionsManage,

    // Integrations & Webhooks
    IntegrationsRead,
    IntegrationsManage,

    // Workflows
    WorkflowsRead,
    WorkflowsTrigger,
    WorkflowsManage,

    // AI Agents
    AiAgentsRead,
    AiAgentsManage,
    AiAgentsExecute,

    // Audit
    AuditRead,

    // Settings
    SettingsRead,
    SettingsWrite,
    SettingsManageMembers,
}

impl Permission {
    pub fn as_str(&self) -> &'static str {
        match self {
            Permission::CustomersRead => "customers:read",
            Permission::CustomersWrite => "customers:write",
            Permission::CustomersDelete => "customers:delete",
            Permission::CrmRead => "crm:read",
            Permission::CrmWrite => "crm:write",
            Permission::CrmDealClose => "crm:deal:close",
            Permission::SalesQuotesRead => "sales:quotes:read",
            Permission::SalesQuotesWrite => "sales:quotes:write",
            Permission::InvoicesRead => "invoices:read",
            Permission::InvoicesWrite => "invoices:write",
            Permission::InvoicesVoid => "invoices:void",
            Permission::PaymentsRead => "payments:read",
            Permission::PaymentsProcess => "payments:process",
            Permission::CollectionsRead => "collections:read",
            Permission::CollectionsManage => "collections:manage",
            Permission::IntegrationsRead => "integrations:read",
            Permission::IntegrationsManage => "integrations:manage",
            Permission::WorkflowsRead => "workflows:read",
            Permission::WorkflowsTrigger => "workflows:trigger",
            Permission::WorkflowsManage => "workflows:manage",
            Permission::AiAgentsRead => "ai_agents:read",
            Permission::AiAgentsManage => "ai_agents:manage",
            Permission::AiAgentsExecute => "ai_agents:execute",
            Permission::AuditRead => "audit:read",
            Permission::SettingsRead => "settings:read",
            Permission::SettingsWrite => "settings:write",
            Permission::SettingsManageMembers => "settings:manage_members",
        }
    }
}

// ============================================================================
// 2. Standard Enterprise Roles & Default Permission Sets
// ============================================================================
pub fn get_role_permissions(role: &str) -> HashSet<Permission> {
    let mut p = HashSet::new();

    match role {
        "admin" => {
            // Super Admin has all permissions
            p.insert(Permission::CustomersRead);
            p.insert(Permission::CustomersWrite);
            p.insert(Permission::CustomersDelete);
            p.insert(Permission::CrmRead);
            p.insert(Permission::CrmWrite);
            p.insert(Permission::CrmDealClose);
            p.insert(Permission::SalesQuotesRead);
            p.insert(Permission::SalesQuotesWrite);
            p.insert(Permission::InvoicesRead);
            p.insert(Permission::InvoicesWrite);
            p.insert(Permission::InvoicesVoid);
            p.insert(Permission::PaymentsRead);
            p.insert(Permission::PaymentsProcess);
            p.insert(Permission::CollectionsRead);
            p.insert(Permission::CollectionsManage);
            p.insert(Permission::IntegrationsRead);
            p.insert(Permission::IntegrationsManage);
            p.insert(Permission::WorkflowsRead);
            p.insert(Permission::WorkflowsTrigger);
            p.insert(Permission::WorkflowsManage);
            p.insert(Permission::AiAgentsRead);
            p.insert(Permission::AiAgentsManage);
            p.insert(Permission::AiAgentsExecute);
            p.insert(Permission::AuditRead);
            p.insert(Permission::SettingsRead);
            p.insert(Permission::SettingsWrite);
            p.insert(Permission::SettingsManageMembers);
        }
        "manager" => {
            p.insert(Permission::CustomersRead);
            p.insert(Permission::CustomersWrite);
            p.insert(Permission::CrmRead);
            p.insert(Permission::CrmWrite);
            p.insert(Permission::CrmDealClose);
            p.insert(Permission::SalesQuotesRead);
            p.insert(Permission::SalesQuotesWrite);
            p.insert(Permission::InvoicesRead);
            p.insert(Permission::InvoicesWrite);
            p.insert(Permission::PaymentsRead);
            p.insert(Permission::CollectionsRead);
            p.insert(Permission::WorkflowsRead);
            p.insert(Permission::WorkflowsTrigger);
            p.insert(Permission::AiAgentsRead);
            p.insert(Permission::AiAgentsExecute);
            p.insert(Permission::SettingsRead);
        }
        "sales_agent" => {
            p.insert(Permission::CustomersRead);
            p.insert(Permission::CustomersWrite);
            p.insert(Permission::CrmRead);
            p.insert(Permission::CrmWrite);
            p.insert(Permission::SalesQuotesRead);
            p.insert(Permission::SalesQuotesWrite);
            p.insert(Permission::WorkflowsRead);
            p.insert(Permission::AiAgentsRead);
            p.insert(Permission::AiAgentsExecute);
        }
        "finance_officer" => {
            p.insert(Permission::CustomersRead);
            p.insert(Permission::InvoicesRead);
            p.insert(Permission::InvoicesWrite);
            p.insert(Permission::PaymentsRead);
            p.insert(Permission::PaymentsProcess);
            p.insert(Permission::CollectionsRead);
            p.insert(Permission::CollectionsManage);
            p.insert(Permission::WorkflowsRead);
        }
        "auditor" => {
            p.insert(Permission::CustomersRead);
            p.insert(Permission::CrmRead);
            p.insert(Permission::InvoicesRead);
            p.insert(Permission::PaymentsRead);
            p.insert(Permission::AuditRead);
            p.insert(Permission::WorkflowsRead);
        }
        _ => {}
    }

    p
}

// ============================================================================
// 3. ABAC (Attribute-Based Access Control) Engine
// ============================================================================
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceAttributes {
    pub tenant_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub owner_id: Option<Uuid>,
    pub financial_value: Option<f64>,
    pub is_confidential: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthDecision {
    Allow,
    Deny { reason: String },
}

/// Evaluates both RBAC permission and ABAC attribute policies
pub fn evaluate_authorization(
    ctx: &TenantContext,
    required_permission: Permission,
    resource: Option<&ResourceAttributes>,
) -> AuthDecision {
    // 1. Strict Tenant Isolation Check
    if let Some(res) = resource {
        if res.tenant_id != ctx.tenant_id {
            return AuthDecision::Deny {
                reason: format!(
                    "Cross-tenant access forbidden: resource tenant {} does not match context tenant {}",
                    res.tenant_id, ctx.tenant_id
                ),
            };
        }

        // Optional Business Unit Check
        if let (Some(ctx_bu), Some(res_bu)) = (ctx.business_unit_id, res.business_unit_id) {
            if ctx_bu != res_bu && ctx.role != "admin" {
                return AuthDecision::Deny {
                    reason: "Cross-business-unit access forbidden for non-admin role.".to_string(),
                };
            }
        }

        // ABAC High-Value Transaction Policy: Transactions > $50,000 require manager or admin
        if let Some(val) = res.financial_value {
            if val > 50000.0 && ctx.role == "sales_agent" {
                return AuthDecision::Deny {
                    reason: "Policy rule: Financial transactions exceeding $50,000 require manager approval.".to_string(),
                };
            }
        }
    }

    // 2. RBAC Permission Check
    let user_permissions = get_role_permissions(&ctx.role);
    if user_permissions.contains(&required_permission) {
        AuthDecision::Allow
    } else {
        AuthDecision::Deny {
            reason: format!(
                "Role '{}' lacks required permission '{}'",
                ctx.role,
                required_permission.as_str()
            ),
        }
    }
}
