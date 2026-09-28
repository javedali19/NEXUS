use platform_common::PlatformError;
use platform_domain::{
    AiProvider, AiSalesAgent, AiSalesConfig, BantScorecard, LeadQualificationStatus,
    ProviderConnectionStatus, SalesTurnRequest,
};
use uuid::Uuid;

#[test]
fn test_sales_agent_disabled_by_default_without_validated_provider() {
    let mut config = AiSalesConfig::default();
    config.connection_status = ProviderConnectionStatus::Unconfigured;
    config.is_active = false;

    let request = SalesTurnRequest {
        organization_id: Uuid::new_v4(),
        lead_id: Uuid::new_v4(),
        prospect_company: "Acme Global Solutions".to_string(),
        prospect_contact: "John Doe".to_string(),
        customer_message: "We need an ERP with WhatsApp billing integration".to_string(),
        conversation_history: vec![],
        current_bant: BantScorecard::default(),
        granted_capabilities: vec!["quotes:write".to_string(), "crm:update".to_string()],
    };

    let result = AiSalesAgent::run_sales_turn(&config, request);
    assert!(result.is_err(), "Agent must remain disabled until provider is validated");

    match result.unwrap_err() {
        PlatformError::PolicyViolation(msg) => {
            assert!(msg.contains("DISABLED"), "Error must state agent is disabled");
            assert!(msg.contains("validated"), "Error must state validation is required");
        }
        other => panic!("Expected PolicyViolation, got {:?}", other),
    }
}

#[test]
fn test_provider_key_resolution_and_validation_guard() {
    // 1. Missing key
    let missing_res = AiSalesAgent::validate_provider_connection(AiProvider::Openai, None);
    assert!(missing_res.is_err(), "Missing key must return error");
    match missing_res.unwrap_err() {
        PlatformError::AuthorizationError(msg) => {
            assert!(msg.contains("OPENAI_API_KEY"), "Error must reference environment variable");
        }
        other => panic!("Expected AuthorizationError, got {:?}", other),
    }

    // 2. Invalid format key
    let bad_format_res = AiSalesAgent::validate_provider_connection(AiProvider::Openai, Some("invalid-key-no-prefix"));
    assert!(bad_format_res.is_err(), "Malformed key must fail format check");
    match bad_format_res.unwrap_err() {
        PlatformError::ValidationError(msg) => {
            assert!(msg.contains("standard format"), "Error must reference key format");
        }
        other => panic!("Expected ValidationError, got {:?}", other),
    }

    // 3. Valid formatted key (OpenAI)
    let valid_openai = AiSalesAgent::validate_provider_connection(AiProvider::Openai, Some("sk-proj-test1234567890abcdef1234567890"));
    assert!(valid_openai.is_ok(), "Valid format key must pass validation");
    let val = valid_openai.unwrap();
    assert!(val.is_valid);
    assert_eq!(val.provider, AiProvider::Openai);

    // 4. Valid formatted key (Anthropic)
    let valid_anthropic = AiSalesAgent::validate_provider_connection(AiProvider::Anthropic, Some("sk-ant-test1234567890abcdef1234567890"));
    assert!(valid_anthropic.is_ok());
    assert_eq!(valid_anthropic.unwrap().provider, AiProvider::Anthropic);
}

#[test]
fn test_lead_qualification_bant_scoring() {
    let mut config = AiSalesConfig::default();
    config.connection_status = ProviderConnectionStatus::Validated;
    config.is_active = true;

    // High intent B2B message with Budget, Authority, Need, and Timeline
    let request = SalesTurnRequest {
        organization_id: Uuid::new_v4(),
        lead_id: Uuid::new_v4(),
        prospect_company: "Wayne Enterprises".to_string(),
        prospect_contact: "Bruce Wayne (CEO)".to_string(),
        customer_message: "I am the CEO. We have a budget of $50k to implement your ERP and collections platform immediately.".to_string(),
        conversation_history: vec![],
        current_bant: BantScorecard::default(),
        granted_capabilities: vec![
            "quotes:write".to_string(),
            "crm:update".to_string(),
            "customers:read".to_string(),
            "tasks:write".to_string(),
        ],
    };

    let response = AiSalesAgent::run_sales_turn(&config, request).expect("Turn should succeed when validated");

    assert!(response.updated_bant.budget_confirmed, "Budget should be detected and confirmed");
    assert_eq!(response.updated_bant.authority_role.as_deref(), Some("decision_maker"));
    assert!(response.updated_bant.intent_score >= 80, "High BANT signals should score >= 80");
    assert_eq!(response.qualification_status, LeadQualificationStatus::SalesQualified);
}

#[test]
fn test_tool_gateway_quote_preparation_via_sales_agent() {
    let mut config = AiSalesConfig::default();
    config.connection_status = ProviderConnectionStatus::Validated;
    config.is_active = true;

    let request = SalesTurnRequest {
        organization_id: Uuid::new_v4(),
        lead_id: Uuid::new_v4(),
        prospect_company: "Stark Tech".to_string(),
        prospect_contact: "Tony Stark".to_string(),
        customer_message: "Please send over a formal quotation and pricing breakdown for your platform.".to_string(),
        conversation_history: vec![],
        current_bant: BantScorecard::default(),
        granted_capabilities: vec!["quotes:write".to_string(), "crm:update".to_string()],
    };

    let response = AiSalesAgent::run_sales_turn(&config, request).expect("Turn should succeed");

    assert!(response.tool_calls_executed.contains(&"quote_creation".to_string()), "Must execute quote_creation tool via Tool Gateway");
    assert!(response.tool_calls_executed.contains(&"crm_updates".to_string()), "Must update CRM lead record via Tool Gateway");
}

#[test]
fn test_human_handoff_trigger_on_high_intent_or_explicit_request() {
    let mut config = AiSalesConfig::default();
    config.connection_status = ProviderConnectionStatus::Validated;
    config.is_active = true;

    // Prospect explicitly asking to speak to a human
    let request = SalesTurnRequest {
        organization_id: Uuid::new_v4(),
        lead_id: Uuid::new_v4(),
        prospect_company: "Cyberdyne Corp".to_string(),
        prospect_contact: "Sarah Connor".to_string(),
        customer_message: "Can I speak to a human sales representative to review custom SLA terms?".to_string(),
        conversation_history: vec![],
        current_bant: BantScorecard::default(),
        granted_capabilities: vec!["crm:update".to_string(), "tasks:write".to_string()],
    };

    let response = AiSalesAgent::run_sales_turn(&config, request).expect("Turn should succeed");

    assert!(response.handoff_packet.is_some(), "Must synthesize structured handoff packet");
    let packet = response.handoff_packet.unwrap();
    assert_eq!(packet.reason, "explicit_user_request");
    assert!(!packet.context_summary.is_empty());
    assert!(!packet.recommended_ae_strategy.is_empty());
}
