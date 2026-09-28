use serde_json::json;
use uuid::Uuid;

use platform_domain::observability::{
    ObservabilityEngine, PiiScrubber, SentryClient, SentryConfig, StructuredLogLevel,
};
use platform_domain::{AiToolGateway, ToolGatewayRequest};

#[test]
fn test_structured_log_generation_with_correlation() {
    let org_id = Uuid::new_v4();
    let req_id = format!("req_{}", Uuid::new_v4().simple());
    let corr_id = format!("corr_{}", Uuid::new_v4().simple());
    let trace_id = format!("trace_{}", Uuid::new_v4().simple());

    let log = ObservabilityEngine::build_structured_log(
        StructuredLogLevel::Info,
        "api_gateway",
        "Incoming HTTP POST /invoices processed successfully",
        Some(org_id),
        Some(req_id.clone()),
        Some(corr_id.clone()),
        Some(trace_id.clone()),
        Some("span_01".into()),
        json!({"status": 200, "duration_ms": 14}),
    );

    assert_eq!(log.level, StructuredLogLevel::Info);
    assert_eq!(log.service, "api_gateway");
    assert_eq!(log.request_id, Some(req_id));
    assert_eq!(log.correlation_id, Some(corr_id));
    assert_eq!(log.trace_id, Some(trace_id));
}

#[test]
fn test_distributed_trace_span_creation() {
    let trace_id = format!("trace_{}", Uuid::new_v4().simple());
    let parent_id = format!("span_{}", Uuid::new_v4().simple());

    let span = ObservabilityEngine::create_span(
        trace_id.clone(),
        Some(parent_id.clone()),
        Some("req_test".into()),
        Some("corr_test".into()),
        "payment_service".into(),
        "razorpay_order_create".into(),
        48,
        "ok".into(),
        json!({"gateway": "razorpay", "amount": 25000.0}),
    );

    assert_eq!(span.trace_id, trace_id);
    assert_eq!(span.parent_span_id, Some(parent_id));
    assert_eq!(span.service_name, "payment_service");
    assert_eq!(span.duration_ms, 48);
    assert_eq!(span.status, "ok");
}

#[test]
fn test_subsystem_health_monitoring_all_systems() {
    let subsystems = ObservabilityEngine::check_subsystems();
    assert_eq!(subsystems.len(), 6);

    let names: Vec<&str> = subsystems.iter().map(|s| s.subsystem.as_str()).collect();
    assert!(names.contains(&"database"));
    assert!(names.contains(&"workers"));
    assert!(names.contains(&"workflows"));
    assert!(names.contains(&"ai_agents"));
    assert!(names.contains(&"integrations"));
    assert!(names.contains(&"storage"));

    for s in subsystems {
        assert_eq!(s.status, "healthy");
        assert!(s.uptime_percentage >= 99.9);
        assert!(s.latency_ms >= 0);
    }
}

#[test]
fn test_integration_health_monitoring() {
    let integrations = ObservabilityEngine::check_integrations();
    assert_eq!(integrations.len(), 8);

    for intg in integrations {
        assert_eq!(intg.status, "healthy");
        assert!(intg.success_rate >= 99.0);
        assert_eq!(intg.error_count_last_hour, 0);
    }
}

#[test]
fn test_sentry_pii_and_secret_scrubbing() {
    // 1. Scrub Bearer token
    let raw_header = "Authorization: Bearer sec_tok_secret9999_key for user";
    let scrubbed_header = PiiScrubber::scrub_string(raw_header);
    assert!(!scrubbed_header.contains("sec_tok_secret9999_key"));
    assert!(scrubbed_header.contains("Bearer ********************"));

    // 2. Scrub 16-digit credit card number
    let raw_card = "Customer used card 4111222233334444 for payment";
    let scrubbed_card = PiiScrubber::scrub_string(raw_card);
    assert!(!scrubbed_card.contains("4111222233334444"));
    assert!(scrubbed_card.contains("****-****-****-XXXX"));

    // 3. Scrub JSON credentials
    let mut payload = json!({
        "username": "admin@acme.com",
        "password": "super-secret-cleartext-password",
        "api_key": "live_sk_prod_99812",
        "profile": {
            "cvv": "123",
            "token": "tok_xyz_123"
        }
    });

    PiiScrubber::scrub_json(&mut payload);
    assert_eq!(payload["password"], "[MASKED_SECRET]");
    assert_eq!(payload["api_key"], "[MASKED_SECRET]");
    assert_eq!(payload["profile"]["cvv"], "[MASKED_SECRET]");
    assert_eq!(payload["profile"]["token"], "[MASKED_SECRET]");
    assert_eq!(payload["username"], "admin@acme.com");
}

#[test]
fn test_sentry_client_capture_exception() {
    let config = SentryConfig {
        dsn: Some("https://example_pub@sentry.io/1234567".into()),
        environment: "production".into(),
        release: "nexus-v2.4.0".into(),
        traces_sample_rate: 1.0,
        pii_scrubber_enabled: true,
    };

    let user_ctx = json!({
        "email": "user@acme.com",
        "auth_token": "secret_session_token_123"
    });

    let event = SentryClient::capture_exception(
        &config,
        "DatabaseTimeoutException",
        "Failed to query database with password=supersecret at connection pool",
        Some("at db_pool.rs:142\n  at transaction.rs:55"),
        Some("corr_sentry_001"),
        Some("req_sentry_001"),
        Some(user_ctx),
    );

    assert_eq!(event.level, "error");
    assert_eq!(event.exception_type, "DatabaseTimeoutException");
    assert!(event.pii_scrubbed);
    assert!(!event.message.contains("supersecret"));
    assert!(event.message.contains("[MASKED_SECRET]"));
    assert_eq!(event.tags.get("environment").unwrap(), "production");
    assert_eq!(event.tags.get("release").unwrap(), "nexus-v2.4.0");
    assert_eq!(event.correlation_id, Some("corr_sentry_001".into()));
}

#[test]
fn test_ai_tool_gateway_observability_health_check() {
    let org_id = Uuid::new_v4();

    let req = ToolGatewayRequest {
        organization_id: org_id,
        agent_id: Some(Uuid::new_v4()),
        caller_role: "admin".into(),
        tool_name: "observability_health_check".into(),
        arguments: json!({"include_integrations": true}),
        idempotency_key: None,
        correlation_id: "corr_obs_001".into(),
        granted_capabilities: vec!["system:monitor".into()],
    };

    let resp = AiToolGateway::execute(req, None, 1).unwrap();
    assert_eq!(resp.status, "success");
    assert_eq!(resp.tool_name, "observability_health_check");
    assert!(resp.sha256_audit_hash.starts_with("sha256-"));
    assert_eq!(resp.result.unwrap()["status"], "healthy");
}
