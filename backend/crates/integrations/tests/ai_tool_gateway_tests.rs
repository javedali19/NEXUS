use platform_common::PlatformError;
use platform_domain::{AiToolGateway, ToolGatewayRequest, ToolSafetyTier};
use serde_json::json;
use uuid::Uuid;

#[test]
fn test_tool_gateway_all_twelve_tools_registered() {
    let tools = AiToolGateway::get_registered_tools();
    assert_eq!(tools.len(), 12, "Gateway must register exactly 12 safe platform tools");

    let expected_tools = [
        "customer_search",
        "customer_timeline",
        "invoice_lookup",
        "quote_creation",
        "payment_link_creation",
        "whatsapp_sending",
        "call_scheduling",
        "task_creation",
        "crm_updates",
        "workflow_execution",
        "analytics_lookup",
        "exception_creation",
    ];

    for name in expected_tools {
        let tool = tools.iter().find(|t| t.tool_name == name);
        assert!(tool.is_some(), "Tool '{}' must be registered", name);
        let t = tool.unwrap();
        assert!(!t.required_capability.is_empty(), "Tool '{}' must have a required capability", name);
        assert!(t.rate_limit_per_minute > 0, "Tool '{}' must have a positive rate limit", name);
    }
}

#[test]
fn test_tool_gateway_authorization_enforced() {
    let org_id = Uuid::new_v4();
    let request = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "autonomous_agent".to_string(),
        tool_name: "payment_link_creation".to_string(),
        arguments: json!({
            "customer_id": "c1a8d052-1982-4fae-9ef7-47b2c019a112",
            "amount": 500.0,
            "currency": "USD"
        }),
        idempotency_key: None,
        correlation_id: "corr_auth_test".to_string(),
        // Only granting customer read, NOT payment link generation
        granted_capabilities: vec!["customers:read".to_string()],
    };

    let result = AiToolGateway::execute(request, None, 0);
    assert!(result.is_err(), "Tool execution must fail without required capability");

    match result.unwrap_err() {
        PlatformError::AuthorizationError(msg) => {
            assert!(msg.contains("payments:generate_link"), "Error message should mention required capability");
        }
        other => panic!("Expected AuthorizationError, got {:?}", other),
    }
}

#[test]
fn test_tool_gateway_schema_validation() {
    let org_id = Uuid::new_v4();
    let request = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "autonomous_agent".to_string(),
        tool_name: "customer_search".to_string(),
        // Missing required 'query' parameter
        arguments: json!({
            "limit": 10
        }),
        idempotency_key: None,
        correlation_id: "corr_validation_test".to_string(),
        granted_capabilities: vec!["customers:read".to_string()],
    };

    let result = AiToolGateway::execute(request, None, 0);
    assert!(result.is_err(), "Missing parameter must fail validation");

    match result.unwrap_err() {
        PlatformError::ValidationError(msg) => {
            assert!(msg.contains("query"), "Error message should reference missing query parameter");
        }
        other => panic!("Expected ValidationError, got {:?}", other),
    }
}

#[test]
fn test_tool_gateway_policy_rejection_for_unauthorized_discount_or_dnc() {
    let org_id = Uuid::new_v4();

    // 1. Excessive Quote Discount (Policy Cap is 15%)
    let quote_request = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "autonomous_agent".to_string(),
        tool_name: "quote_creation".to_string(),
        arguments: json!({
            "customer_id": "c1a8d052-1982-4fae-9ef7-47b2c019a112",
            "items": [{"description": "Cloud License", "quantity": 10, "unit_price": 100.0}],
            "discount_percentage": 25.0, // Exceeds 15% cap
            "valid_until": "2026-10-31"
        }),
        idempotency_key: None,
        correlation_id: "corr_policy_quote".to_string(),
        granted_capabilities: vec!["quotes:write".to_string()],
    };

    let quote_res = AiToolGateway::execute(quote_request, None, 0);
    assert!(quote_res.is_err());
    match quote_res.unwrap_err() {
        PlatformError::PolicyViolation(msg) => {
            assert!(msg.contains("15.0%"), "Should enforce 15% discount cap");
        }
        other => panic!("Expected PolicyViolation, got {:?}", other),
    }

    // 2. WhatsApp Without Consent
    let whatsapp_request = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "autonomous_agent".to_string(),
        tool_name: "whatsapp_sending".to_string(),
        arguments: json!({
            "phone_number": "+15552348901",
            "template_name": "collections_notice",
            "consent_verified": false // Not consented
        }),
        idempotency_key: None,
        correlation_id: "corr_policy_wa".to_string(),
        granted_capabilities: vec!["whatsapp:send".to_string()],
    };

    let wa_res = AiToolGateway::execute(whatsapp_request, None, 0);
    assert!(wa_res.is_err());
    match wa_res.unwrap_err() {
        PlatformError::PolicyViolation(msg) => {
            assert!(msg.contains("consent"), "Should reject unconsented WhatsApp dispatch");
        }
        other => panic!("Expected PolicyViolation, got {:?}", other),
    }
}

#[test]
fn test_tool_gateway_rate_limit_throttling() {
    let org_id = Uuid::new_v4();
    let request = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "autonomous_agent".to_string(),
        tool_name: "call_scheduling".to_string(), // limit is 20 req/min
        arguments: json!({
            "phone_number": "+15552348901",
            "scheduled_time": "2026-09-24T14:00:00Z",
            "purpose": "Invoice Review"
        }),
        idempotency_key: None,
        correlation_id: "corr_rate_limit".to_string(),
        granted_capabilities: vec!["telephony:schedule".to_string()],
    };

    // Current request count 25 exceeds limit 20
    let result = AiToolGateway::execute(request, None, 25);
    assert!(result.is_err());

    match result.unwrap_err() {
        PlatformError::RateLimitExceeded(msg) => {
            assert!(msg.contains("20 req/min"), "Error should report limit");
        }
        other => panic!("Expected RateLimitExceeded, got {:?}", other),
    }
}

#[test]
fn test_tool_gateway_idempotency_cache_replay() {
    let org_id = Uuid::new_v4();
    let cached_payload = json!({
        "payment_link_id": "plink_cached_884912",
        "checkout_url": "https://pay.nexus-erp.com/plink_cached_884912",
        "amount": 250.0
    });

    let request = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "autonomous_agent".to_string(),
        tool_name: "payment_link_creation".to_string(),
        arguments: json!({
            "customer_id": "c1a8d052-1982-4fae-9ef7-47b2c019a112",
            "amount": 250.0
        }),
        idempotency_key: Some("idem_key_payment_123".to_string()),
        correlation_id: "corr_idem_test".to_string(),
        granted_capabilities: vec!["payments:generate_link".to_string()],
    };

    // Passing cached payload simulates existing 24h key
    let response = AiToolGateway::execute(request, Some(&cached_payload), 2).expect("Replay must succeed");
    assert!(response.was_cached_replay, "Response must indicate cached replay");
    assert_eq!(response.result.unwrap(), cached_payload, "Payload must match cached content");
}

#[test]
fn test_tool_gateway_raw_sql_rejection() {
    let org_id = Uuid::new_v4();
    let dangerous_request = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "rogue_agent".to_string(),
        tool_name: "customer_search".to_string(),
        arguments: json!({
            "query": "Acme",
            "raw_sql": "SELECT * FROM users WHERE role = 'admin'" // Prohibited SQL key
        }),
        idempotency_key: None,
        correlation_id: "corr_injection_test".to_string(),
        granted_capabilities: vec!["customers:read".to_string()],
    };

    let result = AiToolGateway::execute(dangerous_request, None, 0);
    assert!(result.is_err(), "Raw SQL attempt must be strictly blocked");

    match result.unwrap_err() {
        PlatformError::SecurityViolation(msg) => {
            assert!(msg.contains("prohibited"), "Should explicitly cite security policy");
        }
        other => panic!("Expected SecurityViolation, got {:?}", other),
    }
}

#[test]
fn test_tool_gateway_audit_hash_integrity() {
    let org_id = Uuid::new_v4();
    let request = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "autonomous_agent".to_string(),
        tool_name: "analytics_lookup".to_string(),
        arguments: json!({
            "metric_category": "dso",
            "timeframe": "30d"
        }),
        idempotency_key: None,
        correlation_id: "corr_analytics_hash".to_string(),
        granted_capabilities: vec!["analytics:read".to_string()],
    };

    let response = AiToolGateway::execute(request, None, 1).expect("Execution should succeed");
    assert!(!response.sha256_audit_hash.is_empty(), "Must produce SHA-256 audit hash");
    assert!(response.sha256_audit_hash.starts_with("sha256-"), "Hash format should follow sha256 prefix");
    assert_eq!(response.status, "success");
}
