use serde_json::json;
use uuid::Uuid;

use platform_common::PlatformError;
use platform_domain::agent_control_plane::{
    AgentCapability, AgentTool, ToolSafetyTier, ToolSandboxDispatcher,
};

fn sample_tools_and_capabilities() -> (AgentTool, Vec<AgentCapability>) {
    let agent_id = Uuid::new_v4();

    let tool = AgentTool {
        id: Uuid::new_v4(),
        agent_id,
        tool_name: "lookup_invoice".into(),
        tool_type: ToolSafetyTier::ReadOnly,
        description: "Looks up invoice metadata".into(),
        parameters_schema: json!({ "type": "object", "properties": { "invoice_number": { "type": "string" } } }),
        is_approval_required: false,
        is_enabled: true,
    };

    let capabilities = vec![
        AgentCapability {
            id: Uuid::new_v4(),
            agent_id,
            capability_name: "invoices:read".into(),
            description: "Read invoice headers".into(),
            is_granted: true,
        },
        AgentCapability {
            id: Uuid::new_v4(),
            agent_id,
            capability_name: "payments:generate_link".into(),
            description: "Generate checkout links".into(),
            is_granted: true,
        },
        AgentCapability {
            id: Uuid::new_v4(),
            agent_id,
            capability_name: "invoices:discount".into(),
            description: "Apply settlement discounts".into(),
            is_granted: true,
        },
    ];

    (tool, capabilities)
}

#[test]
fn test_unrestricted_raw_sql_is_strictly_blocked() {
    let (tool, capabilities) = sample_tools_and_capabilities();

    // Agent attempts raw database SQL injection / direct query
    let malicious_args = json!({
        "sql": "SELECT * FROM customers WHERE balance_due > 0"
    });

    let res = ToolSandboxDispatcher::dispatch_tool_call(&tool, &malicious_args, &capabilities);
    assert!(res.is_err());

    match res.unwrap_err() {
        PlatformError::SecurityViolation(msg) => {
            assert!(msg.contains("Direct unrestricted database queries are strictly prohibited"));
        }
        other => panic!("Expected SecurityViolation, got {:?}", other),
    }
}

#[test]
fn test_capability_authorization_enforced() {
    let agent_id = Uuid::new_v4();
    let payment_tool = AgentTool {
        id: Uuid::new_v4(),
        agent_id,
        tool_name: "generate_payment_link".into(),
        tool_type: ToolSafetyTier::IdempotentWrite,
        description: "Creates payment link".into(),
        parameters_schema: json!({}),
        is_approval_required: false,
        is_enabled: true,
    };

    // Agent with ONLY invoice reading capability, lacking payment link capability
    let limited_capabilities = vec![
        AgentCapability {
            id: Uuid::new_v4(),
            agent_id,
            capability_name: "invoices:read".into(),
            description: "Read invoices".into(),
            is_granted: true,
        },
    ];

    let args = json!({ "amount": 500.0 });
    let res = ToolSandboxDispatcher::dispatch_tool_call(&payment_tool, &args, &limited_capabilities);
    assert!(res.is_err());

    match res.unwrap_err() {
        PlatformError::AuthorizationError(msg) => {
            assert!(msg.contains("lacks required capability 'payments:generate_link'"));
        }
        other => panic!("Expected AuthorizationError, got {:?}", other),
    }
}

#[test]
fn test_sensitive_action_requires_human_approval() {
    let agent_id = Uuid::new_v4();

    // Sensitive mutation tool
    let discount_tool = AgentTool {
        id: Uuid::new_v4(),
        agent_id,
        tool_name: "apply_settlement_discount".into(),
        tool_type: ToolSafetyTier::SensitiveMutation,
        description: "Applies settlement discount".into(),
        parameters_schema: json!({}),
        is_approval_required: false,
        is_enabled: true,
    };

    let high_discount_args = json!({ "discount_percent": 12.5 });
    assert!(ToolSandboxDispatcher::requires_human_approval(&discount_tool, &high_discount_args));

    let payment_tool = AgentTool {
        id: Uuid::new_v4(),
        agent_id,
        tool_name: "generate_payment_link".into(),
        tool_type: ToolSafetyTier::IdempotentWrite,
        description: "Checkout link".into(),
        parameters_schema: json!({}),
        is_approval_required: false,
        is_enabled: true,
    };

    let large_payment_args = json!({ "amount": 35000.0 }); // > $25,000 threshold
    assert!(ToolSandboxDispatcher::requires_human_approval(&payment_tool, &large_payment_args));

    let small_payment_args = json!({ "amount": 500.0 });
    assert!(!ToolSandboxDispatcher::requires_human_approval(&payment_tool, &small_payment_args));
}

#[test]
fn test_typed_tool_execution() {
    let (tool, capabilities) = sample_tools_and_capabilities();

    let valid_args = json!({ "invoice_number": "INV-2026-0041" });
    let res = ToolSandboxDispatcher::dispatch_tool_call(&tool, &valid_args, &capabilities);
    assert!(res.is_ok());

    let val = res.unwrap();
    assert_eq!(val.get("invoice_number").and_then(|v| v.as_str()), Some("INV-2026-0041"));
    assert_eq!(val.get("status").and_then(|v| v.as_str()), Some("overdue"));
}

#[test]
fn test_excessive_discount_rejected_by_policy() {
    let agent_id = Uuid::new_v4();
    let discount_tool = AgentTool {
        id: Uuid::new_v4(),
        agent_id,
        tool_name: "apply_settlement_discount".into(),
        tool_type: ToolSafetyTier::SensitiveMutation,
        description: "Discount".into(),
        parameters_schema: json!({}),
        is_approval_required: false,
        is_enabled: true,
    };

    let (_tool, capabilities) = sample_tools_and_capabilities();
    let excessive_discount_args = json!({ "discount_percent": 25.0 }); // > 15.0% policy cap

    let res = ToolSandboxDispatcher::dispatch_tool_call(&discount_tool, &excessive_discount_args, &capabilities);
    assert!(res.is_err());
    match res.unwrap_err() {
        PlatformError::ValidationError(msg) => {
            assert!(msg.contains("Discount exceeds maximum authorized agent threshold"));
        }
        other => panic!("Expected ValidationError, got {:?}", other),
    }
}
