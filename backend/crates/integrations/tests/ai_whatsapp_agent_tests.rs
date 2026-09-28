use platform_common::PlatformError;
use platform_domain::{
    AiProvider, AiWhatsAppAgent, AiWhatsAppAgentConfig, InboundWhatsAppEvent,
    ProviderConnectionStatus, WhatsAppConnectionStatus, WhatsAppCustomerContext,
};
use uuid::Uuid;

fn sample_customer_context(consent: bool, dnc: bool) -> WhatsAppCustomerContext {
    WhatsAppCustomerContext {
        phone_number: "+15552348901".to_string(),
        customer_id: Some(Uuid::new_v4()),
        customer_name: "Sarah Jenkins".to_string(),
        company_name: "Acme Global Solutions".to_string(),
        lifetime_value: 145000.0,
        open_invoices_count: 1,
        total_balance_due: 4500.0,
        consent_status: consent,
        dnc_flagged: dnc,
        is_new_lead: false,
    }
}

fn sample_capabilities() -> Vec<String> {
    vec![
        "payments:generate_link".to_string(),
        "quotes:write".to_string(),
        "exceptions:write".to_string(),
        "tasks:write".to_string(),
        "whatsapp:send".to_string(),
        "customers:read".to_string(),
        "crm:update".to_string(),
    ]
}

#[test]
fn test_autonomous_messaging_blocked_if_consent_missing() {
    let mut config = AiWhatsAppAgentConfig::default();
    config.whatsapp_status = WhatsAppConnectionStatus::Validated;
    config.ai_provider_status = ProviderConnectionStatus::Validated;

    // Customer without express consent
    let customer = sample_customer_context(false, false);
    let event = InboundWhatsAppEvent {
        organization_id: Uuid::new_v4(),
        phone_number: "+15552348901".to_string(),
        message_text: "Can I pay my invoice?".to_string(),
        wamid: "wamid.123".to_string(),
        timestamp: chrono::Utc::now(),
    };

    let result = AiWhatsAppAgent::process_inbound_flow(&config, event, &customer, &sample_capabilities());
    assert!(result.is_err(), "Must block autonomous message without express consent");

    match result.unwrap_err() {
        PlatformError::PolicyViolation(msg) => {
            assert!(msg.contains("consent"), "Error must cite consent violation");
        }
        other => panic!("Expected PolicyViolation, got {:?}", other),
    }
}

#[test]
fn test_autonomous_messaging_blocked_if_whatsapp_unvalidated() {
    let mut config = AiWhatsAppAgentConfig::default();
    // WhatsApp unconfigured
    config.whatsapp_status = WhatsAppConnectionStatus::Unconfigured;
    config.ai_provider_status = ProviderConnectionStatus::Validated;

    let customer = sample_customer_context(true, false);
    let event = InboundWhatsAppEvent {
        organization_id: Uuid::new_v4(),
        phone_number: "+15552348901".to_string(),
        message_text: "Hello".to_string(),
        wamid: "wamid.123".to_string(),
        timestamp: chrono::Utc::now(),
    };

    let result = AiWhatsAppAgent::process_inbound_flow(&config, event, &customer, &sample_capabilities());
    assert!(result.is_err(), "Must block if Meta WhatsApp connection is unvalidated");
    match result.unwrap_err() {
        PlatformError::PolicyViolation(msg) => {
            assert!(msg.contains("Meta WhatsApp"), "Error must cite WhatsApp connection requirement");
        }
        other => panic!("Expected PolicyViolation, got {:?}", other),
    }
}

#[test]
fn test_autonomous_messaging_blocked_if_ai_provider_unvalidated() {
    let mut config = AiWhatsAppAgentConfig::default();
    config.whatsapp_status = WhatsAppConnectionStatus::Validated;
    // AI provider unconfigured
    config.ai_provider_status = ProviderConnectionStatus::Unconfigured;

    let customer = sample_customer_context(true, false);
    let event = InboundWhatsAppEvent {
        organization_id: Uuid::new_v4(),
        phone_number: "+15552348901".to_string(),
        message_text: "Need a quote".to_string(),
        wamid: "wamid.123".to_string(),
        timestamp: chrono::Utc::now(),
    };

    let result = AiWhatsAppAgent::process_inbound_flow(&config, event, &customer, &sample_capabilities());
    assert!(result.is_err(), "Must block if AI provider is unvalidated");
    match result.unwrap_err() {
        PlatformError::PolicyViolation(msg) => {
            assert!(msg.contains("AI model provider"), "Error must cite AI provider requirement");
        }
        other => panic!("Expected PolicyViolation, got {:?}", other),
    }
}

#[test]
fn test_whatsapp_payment_link_generation_via_tool_gateway() {
    let mut config = AiWhatsAppAgentConfig::default();
    config.whatsapp_status = WhatsAppConnectionStatus::Validated;
    config.ai_provider_status = ProviderConnectionStatus::Validated;

    let customer = sample_customer_context(true, false);
    let event = InboundWhatsAppEvent {
        organization_id: Uuid::new_v4(),
        phone_number: "+15552348901".to_string(),
        message_text: "Can I pay my overdue invoice of $4,500.00 right now?".to_string(),
        wamid: "wamid.pay123".to_string(),
        timestamp: chrono::Utc::now(),
    };

    let response = AiWhatsAppAgent::process_inbound_flow(&config, event, &customer, &sample_capabilities())
        .expect("Flow should succeed when Triple-Gate passes");

    assert!(response.tool_calls_executed.contains(&"payment_link_creation".to_string()), "Must execute payment_link_creation tool");
    assert!(response.tool_calls_executed.contains(&"whatsapp_sending".to_string()), "Must execute whatsapp_sending tool");
    assert!(response.created_payment_link.is_some(), "Must produce payment checkout URL");
    assert!(response.response_message.contains("payment link"));
    assert_eq!(response.approved_template_name.as_deref(), Some("payment_link_notice"));
}

#[test]
fn test_whatsapp_support_case_creation_via_tool_gateway() {
    let mut config = AiWhatsAppAgentConfig::default();
    config.whatsapp_status = WhatsAppConnectionStatus::Validated;
    config.ai_provider_status = ProviderConnectionStatus::Validated;

    let customer = sample_customer_context(true, false);
    let event = InboundWhatsAppEvent {
        organization_id: Uuid::new_v4(),
        phone_number: "+15552348901".to_string(),
        message_text: "Our API webhook integration is throwing 500 server errors, please help!".to_string(),
        wamid: "wamid.err123".to_string(),
        timestamp: chrono::Utc::now(),
    };

    let response = AiWhatsAppAgent::process_inbound_flow(&config, event, &customer, &sample_capabilities())
        .expect("Flow should succeed");

    assert!(response.tool_calls_executed.contains(&"exception_creation".to_string()), "Must execute exception_creation tool");
    assert!(response.created_case_id.is_some(), "Must generate a support case ID");
    assert!(response.response_message.contains("CASE-2026-"));
    assert_eq!(response.approved_template_name.as_deref(), Some("support_ticket_created"));
}

#[test]
fn test_whatsapp_human_escalation_flow() {
    let mut config = AiWhatsAppAgentConfig::default();
    config.whatsapp_status = WhatsAppConnectionStatus::Validated;
    config.ai_provider_status = ProviderConnectionStatus::Validated;

    let customer = sample_customer_context(true, false);
    let event = InboundWhatsAppEvent {
        organization_id: Uuid::new_v4(),
        phone_number: "+15552348901".to_string(),
        message_text: "Please transfer me to a live human representative or manager.".to_string(),
        wamid: "wamid.esc123".to_string(),
        timestamp: chrono::Utc::now(),
    };

    let response = AiWhatsAppAgent::process_inbound_flow(&config, event, &customer, &sample_capabilities())
        .expect("Flow should succeed");

    assert!(response.is_escalated_to_human, "Must set is_escalated_to_human to true");
    assert!(response.tool_calls_executed.contains(&"task_creation".to_string()), "Must create an urgent task for human rep");
    assert!(response.response_message.contains("transferred this conversation"));
}
