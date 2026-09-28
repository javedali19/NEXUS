use serde_json::json;
use uuid::Uuid;

use platform_domain::global_search::{
    ExecuteUniversalCommandRequest, GlobalSearchEngine, GlobalSearchRequest, SearchEntityType,
};
use platform_domain::{AiToolGateway, ToolGatewayRequest};

#[test]
fn test_all_13_search_entities_defined() {
    let entities = SearchEntityType::all_entities();
    assert_eq!(entities.len(), 13);

    let expected = vec![
        "customer", "company", "contact", "lead", "deal", "quote", "invoice",
        "payment", "conversation", "call", "document", "workflow", "ai_agent"
    ];

    for name in expected {
        assert!(entities.iter().any(|e| e.as_str() == name));
    }
}

#[test]
fn test_global_search_comprehensive_query() {
    let org_id = Uuid::new_v4();

    // 1. Search with broad query "Acme"
    let req = GlobalSearchRequest {
        organization_id: org_id,
        query: "Acme".into(),
        entity_types: None,
        limit: 10,
        caller_role: "sales_agent".into(),
    };

    let resp = GlobalSearchEngine::search(req, None).unwrap();
    assert!(resp.total_results > 0);
    assert!(!resp.items.is_empty());
    assert!(resp.items.iter().any(|item| item.title.contains("Acme")));

    // 2. Search empty query returns all corpus items
    let empty_req = GlobalSearchRequest {
        organization_id: org_id,
        query: "".into(),
        entity_types: None,
        limit: 20,
        caller_role: "admin".into(),
    };

    let empty_resp = GlobalSearchEngine::search(empty_req, None).unwrap();
    assert_eq!(empty_resp.total_results, 13); // All 13 entities present in mock corpus
    assert_eq!(empty_resp.results_by_entity.len(), 13);
}

#[test]
fn test_global_search_entity_type_filter() {
    let org_id = Uuid::new_v4();

    // Filter to only Invoices and Quotes
    let req = GlobalSearchRequest {
        organization_id: org_id,
        query: "INV".into(),
        entity_types: Some(vec![SearchEntityType::Invoice, SearchEntityType::Quote]),
        limit: 10,
        caller_role: "finance_officer".into(),
    };

    let resp = GlobalSearchEngine::search(req, None).unwrap();
    for item in &resp.items {
        assert!(
            item.entity_type == SearchEntityType::Invoice
                || item.entity_type == SearchEntityType::Quote
        );
    }
}

#[test]
fn test_universal_command_catalog_and_role_filtering() {
    // 1. Admin sees all commands
    let admin_commands = GlobalSearchEngine::get_universal_commands("admin");
    assert!(admin_commands.len() >= 10);
    assert!(admin_commands.iter().any(|c| c.command_slug == "create-quote"));
    assert!(admin_commands.iter().any(|c| c.command_slug == "lookup-inventory-stock"));

    // 2. Finance Officer sees finance/ERP tools
    let finance_commands = GlobalSearchEngine::get_universal_commands("finance_officer");
    assert!(finance_commands.iter().any(|c| c.command_slug == "lookup-invoice"));
    assert!(finance_commands.iter().any(|c| c.command_slug == "create-payment-link"));

    // 3. Auditor cannot see sensitive mutation command "create-procurement-po"
    let auditor_commands = GlobalSearchEngine::get_universal_commands("auditor");
    assert!(!auditor_commands.iter().any(|c| c.command_slug == "create-procurement-po"));
}

#[test]
fn test_execute_universal_command_via_tool_gateway() {
    let org_id = Uuid::new_v4();

    // Execute "search-customer-360" command
    let req = ExecuteUniversalCommandRequest {
        organization_id: org_id,
        command_slug: "search-customer-360".into(),
        caller_role: "sales_agent".into(),
        caller_email: "agent@acme.com".into(),
        actor_type: "human".into(),
        parameters: json!({"query": "Acme Global"}),
        correlation_id: "corr_cmd_001".into(),
    };

    let resp = GlobalSearchEngine::execute_command(req).unwrap();
    assert_eq!(resp.status, "success");
    assert_eq!(resp.command_slug, "search-customer-360");
    assert_eq!(resp.tool_name, "customer_search");
    assert!(resp.sha256_audit_hash.starts_with("sha256-"));
    assert!(resp.result.is_some());
}

#[test]
fn test_unauthorized_command_rejection() {
    let org_id = Uuid::new_v4();

    // Auditor attempting to execute "create-procurement-po" which they lack permission for
    let req = ExecuteUniversalCommandRequest {
        organization_id: org_id,
        command_slug: "create-procurement-po".into(),
        caller_role: "auditor".into(),
        caller_email: "auditor@external.com".into(),
        actor_type: "human".into(),
        parameters: json!({"sku": "NX-SVR-01", "quantity": 10.0}),
        correlation_id: "corr_cmd_002".into(),
    };

    let err = GlobalSearchEngine::execute_command(req);
    assert!(err.is_err());
}

#[test]
fn test_ai_tool_gateway_global_search_tool() {
    let org_id = Uuid::new_v4();

    // 1. Valid global_search tool execution
    let req = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "sales_agent".into(),
        tool_name: "global_search".into(),
        arguments: json!({
            "query": "telephony",
            "limit": 10
        }),
        idempotency_key: None,
        correlation_id: "corr_search_01".into(),
        granted_capabilities: vec!["search:read".into()],
    };

    let resp = AiToolGateway::execute(req, None, 1).unwrap();
    assert_eq!(resp.status, "success");
    assert_eq!(resp.tool_name, "global_search");
    assert!(resp.sha256_audit_hash.starts_with("sha256-"));

    // 2. Missing query argument fails validation
    let bad_req = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "sales_agent".into(),
        tool_name: "global_search".into(),
        arguments: json!({}),
        idempotency_key: None,
        correlation_id: "corr_search_02".into(),
        granted_capabilities: vec!["search:read".into()],
    };

    let bad_resp = AiToolGateway::execute(bad_req, None, 1);
    assert!(bad_resp.is_err());
}
