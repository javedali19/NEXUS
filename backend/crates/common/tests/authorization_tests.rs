use platform_common::authorization::{
    evaluate_authorization, get_role_permissions, AuthDecision, Permission, ResourceAttributes,
};
use platform_common::TenantContext;
use uuid::Uuid;

#[test]
fn test_admin_has_all_permissions() {
    let permissions = get_role_permissions("admin");
    assert!(permissions.contains(&Permission::CustomersRead));
    assert!(permissions.contains(&Permission::CustomersDelete));
    assert!(permissions.contains(&Permission::InvoicesVoid));
    assert!(permissions.contains(&Permission::SettingsManageMembers));
}

#[test]
fn test_sales_agent_cannot_void_invoices_or_access_settings() {
    let permissions = get_role_permissions("sales_agent");
    assert!(permissions.contains(&Permission::CrmRead));
    assert!(permissions.contains(&Permission::CrmWrite));
    assert!(!permissions.contains(&Permission::InvoicesVoid));
    assert!(!permissions.contains(&Permission::SettingsWrite));
}

#[test]
fn test_finance_officer_cannot_close_crm_deals_or_manage_ai() {
    let permissions = get_role_permissions("finance_officer");
    assert!(permissions.contains(&Permission::InvoicesRead));
    assert!(permissions.contains(&Permission::InvoicesWrite));
    assert!(permissions.contains(&Permission::PaymentsProcess));
    assert!(!permissions.contains(&Permission::CrmDealClose));
    assert!(!permissions.contains(&Permission::AiAgentsManage));
}

#[test]
fn test_cross_tenant_isolation_strictly_denied() {
    let tenant_a = Uuid::new_v4();
    let tenant_b = Uuid::new_v4();

    let ctx = TenantContext::new(
        tenant_a,
        None,
        Uuid::new_v4(),
        "admin@tenant-a.com".to_string(),
        "admin".to_string(),
    );

    let foreign_resource = ResourceAttributes {
        tenant_id: tenant_b,
        business_unit_id: None,
        owner_id: None,
        financial_value: Some(1000.0),
        is_confidential: false,
    };

    let decision = evaluate_authorization(&ctx, Permission::CustomersRead, Some(&foreign_resource));
    match decision {
        AuthDecision::Deny { reason } => {
            assert!(reason.contains("Cross-tenant access forbidden"));
        }
        AuthDecision::Allow => panic!("Expected cross-tenant access to be denied!"),
    }
}

#[test]
fn test_abac_high_value_transaction_policy() {
    let tenant_id = Uuid::new_v4();

    let agent_ctx = TenantContext::new(
        tenant_id,
        None,
        Uuid::new_v4(),
        "sales@tenant.com".to_string(),
        "sales_agent".to_string(),
    );

    let high_value_deal = ResourceAttributes {
        tenant_id,
        business_unit_id: None,
        owner_id: None,
        financial_value: Some(145000.0), // $145,000 > $50,000 limit
        is_confidential: false,
    };

    let decision = evaluate_authorization(&agent_ctx, Permission::CrmWrite, Some(&high_value_deal));
    match decision {
        AuthDecision::Deny { reason } => {
            assert!(reason.contains("exceeding $50,000"));
        }
        AuthDecision::Allow => panic!("Expected high value deal to require manager/admin!"),
    }
}
