use chrono::Utc;
use serde_json::json;
use uuid::Uuid;

use platform_domain::sales_flow::{FlowActorType, SalesFlowEngine, SalesFlowStage};
use platform_domain::{AiToolGateway, ToolGatewayRequest};

#[test]
fn test_sales_flow_stage_order_and_advancement() {
    let stage = SalesFlowStage::Lead;
    assert_eq!(stage.order_index(), 1);
    assert_eq!(stage.next_stage(), Some(SalesFlowStage::ContactCompany));

    let stage9 = SalesFlowStage::AnalyticsCompleted;
    assert_eq!(stage9.order_index(), 9);
    assert_eq!(stage9.next_stage(), None);
}

#[test]
fn test_end_to_end_human_sales_lifecycle() {
    let org_id = Uuid::new_v4();
    let lead_id = Uuid::new_v4();

    // Stage 1: Lead
    let mut flow = SalesFlowEngine::initiate_from_lead(
        org_id,
        lead_id,
        25000.0,
        "USD",
        FlowActorType::Human,
    );
    assert_eq!(flow.current_stage, SalesFlowStage::Lead);
    assert_eq!(flow.total_value, 25000.0);
    assert_eq!(flow.status, "in_progress");

    // Stage 2: Convert to Contact & Company
    let t1 = SalesFlowEngine::advance_to_contact_company(&mut flow, "Sarah Jenkins (AE)").unwrap();
    assert_eq!(flow.current_stage, SalesFlowStage::ContactCompany);
    assert!(flow.customer_id.is_some());
    assert!(flow.company_id.is_some());
    assert!(flow.contact_id.is_some());
    assert_eq!(t1.to_stage, SalesFlowStage::ContactCompany);

    // Stage 3: Create CRM Deal
    let t2 = SalesFlowEngine::advance_to_deal(&mut flow, 28000.0, "Sarah Jenkins (AE)").unwrap();
    assert_eq!(flow.current_stage, SalesFlowStage::Deal);
    assert!(flow.deal_id.is_some());
    assert_eq!(flow.total_value, 28000.0);
    assert_eq!(t2.to_stage, SalesFlowStage::Deal);

    // Stage 4: Generate Quote with Stock Reservation
    let t3 = SalesFlowEngine::advance_to_quote(&mut flow, "Sarah Jenkins (AE)").unwrap();
    assert_eq!(flow.current_stage, SalesFlowStage::Quote);
    assert!(flow.quote_id.is_some());
    assert_eq!(t3.to_stage, SalesFlowStage::Quote);

    // Stage 5: Quote Acceptance & Invoice Issuance
    let t4 = SalesFlowEngine::advance_to_invoice(&mut flow, "Finance Team").unwrap();
    assert_eq!(flow.current_stage, SalesFlowStage::Invoice);
    assert!(flow.invoice_id.is_some());
    assert_eq!(t4.to_stage, SalesFlowStage::Invoice);

    // Stage 6: Payment Link Creation (Razorpay / Stripe)
    let t5 = SalesFlowEngine::advance_to_payment_link(&mut flow, "razorpay", "Finance Bot").unwrap();
    assert_eq!(flow.current_stage, SalesFlowStage::PaymentLink);
    assert!(flow.payment_link_id.is_some());
    assert!(t5.action_name.contains("razorpay"));

    // Stage 7: Payment Settlement & Fulfillment
    let t6 = SalesFlowEngine::advance_to_payment(&mut flow, "razorpay_checkout", "Stripe/Razorpay Webhook").unwrap();
    assert_eq!(flow.current_stage, SalesFlowStage::Payment);
    assert!(flow.payment_id.is_some());
    assert_eq!(t6.to_stage, SalesFlowStage::Payment);

    // Stage 8: Customer 360 Timeline Sync
    let t7 = SalesFlowEngine::advance_to_customer_timeline(&mut flow, "Timeline Sync Engine").unwrap();
    assert_eq!(flow.current_stage, SalesFlowStage::CustomerTimeline);
    assert_eq!(t7.to_stage, SalesFlowStage::CustomerTimeline);

    // Stage 9: Executive Analytics Attribution
    let t8 = SalesFlowEngine::advance_to_analytics_completed(&mut flow, "Analytics Engine").unwrap();
    assert_eq!(flow.current_stage, SalesFlowStage::AnalyticsCompleted);
    assert_eq!(flow.status, "completed");
    assert!(flow.completed_at.is_some());
    assert_eq!(t8.to_stage, SalesFlowStage::AnalyticsCompleted);
}

#[test]
fn test_invalid_stage_transition_rejection() {
    let org_id = Uuid::new_v4();
    let lead_id = Uuid::new_v4();
    let mut flow = SalesFlowEngine::initiate_from_lead(
        org_id,
        lead_id,
        5000.0,
        "USD",
        FlowActorType::Human,
    );

    // Attempting to jump directly from Lead to Invoice must fail
    let err = SalesFlowEngine::advance_to_invoice(&mut flow, "User");
    assert!(err.is_err());
    assert!(err.unwrap_err().contains("Must be in Quote stage"));

    // Attempting to jump from Lead to Payment must fail
    let err2 = SalesFlowEngine::advance_to_payment(&mut flow, "card", "User");
    assert!(err2.is_err());
    assert!(err2.unwrap_err().contains("Must be in PaymentLink stage"));
}

#[test]
fn test_authorized_ai_agent_autonomous_execution() {
    let org_id = Uuid::new_v4();
    let lead_id = Uuid::new_v4();
    let mut flow = SalesFlowEngine::initiate_from_lead(
        org_id,
        lead_id,
        18500.0,
        "USD",
        FlowActorType::AiAgent,
    );

    // Autonomous step 1: Lead -> Contact/Company
    let res1 = SalesFlowEngine::execute_ai_agent_step(&mut flow, "sales_agent");
    assert!(res1.is_ok());
    assert_eq!(flow.current_stage, SalesFlowStage::ContactCompany);

    // Autonomous step 2: Contact/Company -> Deal
    let res2 = SalesFlowEngine::execute_ai_agent_step(&mut flow, "sales_agent");
    assert!(res2.is_ok());
    assert_eq!(flow.current_stage, SalesFlowStage::Deal);

    // Autonomous step 3: Deal -> Quote
    let res3 = SalesFlowEngine::execute_ai_agent_step(&mut flow, "sales_agent");
    assert!(res3.is_ok());
    assert_eq!(flow.current_stage, SalesFlowStage::Quote);

    // Autonomous step 4: Quote -> Invoice
    let res4 = SalesFlowEngine::execute_ai_agent_step(&mut flow, "sales_agent");
    assert!(res4.is_ok());
    assert_eq!(flow.current_stage, SalesFlowStage::Invoice);

    // Autonomous step 5: Invoice -> Payment Link
    let res5 = SalesFlowEngine::execute_ai_agent_step(&mut flow, "sales_agent");
    assert!(res5.is_ok());
    assert_eq!(flow.current_stage, SalesFlowStage::PaymentLink);

    // Autonomous step 6: Payment Link -> Payment
    let res6 = SalesFlowEngine::execute_ai_agent_step(&mut flow, "sales_agent");
    assert!(res6.is_ok());
    assert_eq!(flow.current_stage, SalesFlowStage::Payment);

    // Autonomous step 7: Payment -> Customer Timeline
    let res7 = SalesFlowEngine::execute_ai_agent_step(&mut flow, "sales_agent");
    assert!(res7.is_ok());
    assert_eq!(flow.current_stage, SalesFlowStage::CustomerTimeline);

    // Autonomous step 8: Customer Timeline -> Analytics Completed
    let res8 = SalesFlowEngine::execute_ai_agent_step(&mut flow, "sales_agent");
    assert!(res8.is_ok());
    assert_eq!(flow.current_stage, SalesFlowStage::AnalyticsCompleted);
    assert_eq!(flow.status, "completed");
}

#[test]
fn test_unauthorized_ai_agent_rejection() {
    let org_id = Uuid::new_v4();
    let lead_id = Uuid::new_v4();
    let mut flow = SalesFlowEngine::initiate_from_lead(
        org_id,
        lead_id,
        12000.0,
        "USD",
        FlowActorType::AiAgent,
    );

    // An unauthorized agent role such as "support_bot" or "intern" must be rejected
    let res = SalesFlowEngine::execute_ai_agent_step(&mut flow, "unauthorized_role");
    assert!(res.is_err());
    assert!(res.unwrap_err().contains("is unauthorized to execute sales flow transitions"));
    assert_eq!(flow.current_stage, SalesFlowStage::Lead);
}

#[test]
fn test_ai_tool_gateway_sales_flow_advance() {
    let org_id = Uuid::new_v4();
    let flow_id = Uuid::new_v4();

    // 1. Successful AI Tool Gateway Call with high confidence
    let req = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "sales_agent".into(),
        tool_name: "sales_flow_advance".into(),
        arguments: json!({
            "flow_id": flow_id.to_string(),
            "target_stage": "contact_company",
            "step_data": {
                "lead_qualification": "BANT verified",
                "estimated_budget": 35000.0
            },
            "ai_confidence_score": 0.94
        }),
        idempotency_key: Some("idem_sf_001".into()),
        correlation_id: "corr_sales_001".into(),
        granted_capabilities: vec!["sales:advance_flow".into()],
    };

    let resp = AiToolGateway::execute(req, None, 1).unwrap();
    assert_eq!(resp.status, "success");
    assert_eq!(resp.tool_name, "sales_flow_advance");
    assert!(resp.sha256_audit_hash.starts_with("sha256-"));

    // 2. Policy rejection on low AI confidence score (< 0.70)
    let low_conf_req = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "sales_agent".into(),
        tool_name: "sales_flow_advance".into(),
        arguments: json!({
            "flow_id": flow_id.to_string(),
            "target_stage": "deal",
            "step_data": {},
            "ai_confidence_score": 0.55
        }),
        idempotency_key: None,
        correlation_id: "corr_sales_002".into(),
        granted_capabilities: vec!["sales:advance_flow".into()],
    };

    let low_conf_err = AiToolGateway::execute(low_conf_req, None, 1);
    assert!(low_conf_err.is_err());
}
