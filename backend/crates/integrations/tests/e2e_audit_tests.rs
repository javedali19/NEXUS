use serde_json::json;
use uuid::Uuid;

use platform_common::PlatformError;
use platform_domain::{
    audit_lifecycle, probe_all_external_providers, run_full_e2e_audit_suite,
    verify_shared_data_integrity, AiToolGateway, LifecycleId, ProviderConnectionStatus,
    ToolGatewayRequest,
};

#[test]
fn test_full_10_lifecycle_audit_suite() {
    let org_id = Uuid::new_v4();
    let summary = run_full_e2e_audit_suite(org_id);

    assert_eq!(summary.total_lifecycles, 10);
    assert_eq!(summary.lifecycle_results.len(), 10);
    assert_eq!(summary.passed_lifecycles, 10);
    assert!(summary.overall_platform_health_score >= 95.0);

    let all_lifecycles = LifecycleId::all_10_lifecycles();
    assert_eq!(all_lifecycles.len(), 10);

    for (idx, lifecycle) in all_lifecycles.into_iter().enumerate() {
        let expected_index = idx + 1;
        assert_eq!(lifecycle.index(), expected_index);

        let res = summary
            .lifecycle_results
            .iter()
            .find(|r| r.lifecycle_id == lifecycle)
            .expect("Lifecycle must be present in audit results");

        assert_eq!(res.index, expected_index);
        assert_eq!(res.overall_status, "passed");
        assert!(!res.title.is_empty());
        assert!(!res.flow_diagram.is_empty());
        assert!(!res.steps.is_empty());

        // Assert all 8 verification dimensions are checked
        assert!(res.connectivity_verified);
        assert!(res.shared_data_verified);
        assert!(res.customer_timeline_verified);
        assert!(res.permissions_verified);
        assert!(res.audit_verified);
        assert!(res.events_verified);
        assert!(res.idempotency_verified);
        assert!(res.errors_handled);

        for step in &res.steps {
            assert!(step.step_index > 0);
            assert!(!step.step_name.is_empty());
            assert!(!step.source_module.is_empty());
            assert!(!step.target_module.is_empty());
            assert!(step.verification_dimensions.contains_key("shared_data"));
            assert!(step.verification_dimensions.contains_key("customer_timeline"));
            assert!(step.verification_dimensions.contains_key("permissions"));
            assert!(step.verification_dimensions.contains_key("audit"));
            assert!(step.verification_dimensions.contains_key("events"));
            assert!(step.verification_dimensions.contains_key("idempotency"));
            assert!(step.verification_dimensions.contains_key("errors"));
        }
    }
}

#[test]
fn test_provider_connectivity_preflight_checks() {
    let providers = probe_all_external_providers();
    assert!(providers.len() >= 10);

    // Verify Stripe provider report: when key is not in env, it must be reported as Unconfigured, NOT faked as connected!
    let stripe_probe = providers
        .iter()
        .find(|p| p.provider_name == "stripe")
        .expect("Stripe probe must exist");

    if std::env::var("STRIPE_SECRET_KEY").is_err() {
        assert_eq!(stripe_probe.status, ProviderConnectionStatus::Unconfigured);
        assert!(!stripe_probe.is_connected);
        assert!(stripe_probe.missing_credentials.contains(&"STRIPE_SECRET_KEY".to_string()));
        assert!(stripe_probe.message.contains("Missing STRIPE_SECRET_KEY"));
    }

    // Verify Meta WhatsApp provider report
    let wa_probe = providers
        .iter()
        .find(|p| p.provider_name == "meta_whatsapp")
        .expect("WhatsApp probe must exist");

    if std::env::var("META_WHATSAPP_TOKEN").is_err() {
        assert_eq!(wa_probe.status, ProviderConnectionStatus::Unconfigured);
        assert!(!wa_probe.is_connected);
        assert!(wa_probe.missing_credentials.contains(&"META_WHATSAPP_TOKEN".to_string()));
    }
}

#[test]
fn test_shared_data_integrity() {
    let customer_id = Uuid::new_v4();
    let org_id = Uuid::new_v4();
    let deal_id = Uuid::new_v4();
    let invoice_id = Uuid::new_v4();

    // 1. Valid non-nil entities must pass
    let entities = vec![("deal", deal_id), ("invoice", invoice_id)];
    assert!(verify_shared_data_integrity(customer_id, org_id, &entities).is_ok());

    // 2. Nil customer ID must fail
    assert!(matches!(
        verify_shared_data_integrity(Uuid::nil(), org_id, &entities),
        Err(PlatformError::ValidationError(_))
    ));

    // 3. Nil associated entity must fail
    let invalid_entities = vec![("deal", deal_id), ("invoice", Uuid::nil())];
    assert!(matches!(
        verify_shared_data_integrity(customer_id, org_id, &invalid_entities),
        Err(PlatformError::ValidationError(_))
    ));
}

#[test]
fn test_lifecycle_fallback_state_on_unconfigured_provider() {
    let org_id = Uuid::new_v4();
    let providers = probe_all_external_providers();

    // Audit Lead to Payment
    let audit_res = audit_lifecycle(LifecycleId::LeadToPayment, &providers, org_id);
    assert_eq!(audit_res.lifecycle_id, LifecycleId::LeadToPayment);
    assert_eq!(audit_res.steps.len(), 5);

    // If Stripe is unconfigured, the final step must have an error message indicating fallback/human escalation
    let payment_step = &audit_res.steps[4];
    if !payment_step.is_connected {
        assert!(payment_step.error_message.is_some());
        assert!(payment_step.error_message.as_ref().unwrap().contains("fallback"));
    }
}

#[test]
fn test_ai_tool_gateway_run_e2e_audit() {
    let org_id = Uuid::new_v4();

    // 1. Missing capability 'audit:e2e' must fail
    let unauth_req = ToolGatewayRequest {
        organization_id: org_id,
        actor_id: "sec_tester".to_string(),
        caller_role: "agent".to_string(),
        tool_name: "run_e2e_lifecycle_audit".to_string(),
        arguments: json!({}),
        idempotency_key: None,
        correlation_id: Uuid::new_v4().to_string(),
        granted_capabilities: vec!["crm:read".to_string()],
    };
    let res = AiToolGateway::execute(unauth_req, None, 0);
    assert!(matches!(res, Err(PlatformError::AuthorizationError(_))));

    // 2. Granted capability 'audit:e2e' must succeed
    let auth_req = ToolGatewayRequest {
        organization_id: org_id,
        actor_id: "platform_auditor".to_string(),
        caller_role: "auditor".to_string(),
        tool_name: "run_e2e_lifecycle_audit".to_string(),
        arguments: json!({
            "lifecycles": ["all"],
            "probe_providers": true
        }),
        idempotency_key: None,
        correlation_id: Uuid::new_v4().to_string(),
        granted_capabilities: vec!["audit:e2e".to_string()],
    };
    let res = AiToolGateway::execute(auth_req, None, 0);
    assert!(res.is_ok());

    let resp = res.unwrap();
    assert_eq!(resp.status, "success");
    assert_eq!(resp.tool_name, "run_e2e_lifecycle_audit");
    assert!(!resp.sha256_audit_hash.is_empty());

    let payload = resp.result.unwrap();
    assert_eq!(payload.get("total_lifecycles").and_then(|v| v.as_u64()), Some(10));
    assert_eq!(payload.get("passed_lifecycles").and_then(|v| v.as_u64()), Some(10));
}
