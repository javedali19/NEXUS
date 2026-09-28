use chrono::{TimeZone, Utc};
use serde_json::json;
use uuid::Uuid;

use platform_common::PlatformError;
use platform_domain::{
    compute_hmac_sha256_hex, constant_time_compare, run_comprehensive_security_audit,
    verify_ai_agent_confidence, verify_calling_window_and_dnc, verify_credential_leak_absence,
    verify_webhook_hmac_signature, AiToolGateway, ComplianceFramework, CredentialScanVector,
    SecurityDomain, ToolGatewayRequest,
};

#[test]
fn test_all_19_security_domains_coverage() {
    let org_id = Uuid::new_v4();
    let summary = run_comprehensive_security_audit(org_id);

    assert_eq!(summary.total_domains_audited, 19);
    assert_eq!(summary.passed_domains, 19);
    assert_eq!(summary.failed_domains, 0);
    assert_eq!(summary.warning_domains, 0);
    assert_eq!(summary.findings.len(), 19);

    // Verify all 19 domain variants are represented
    let all_domains = SecurityDomain::all_19_domains();
    assert_eq!(all_domains.len(), 19);

    for domain in all_domains {
        let finding = summary.findings.iter().find(|f| f.domain == domain);
        assert!(finding.is_some(), "Domain {:?} missing from audit findings", domain);
        let f = finding.unwrap();
        assert_eq!(f.status, "passed");
        assert!(!f.control_description.is_empty());
        assert!(!f.verification_evidence.is_empty());
        assert!(!domain.standard_ref().is_empty());
        assert!(!domain.display_name().is_empty());
    }

    // Verify 5 compliance frameworks
    assert_eq!(summary.compliance_benchmarks.len(), 5);
    for framework in ComplianceFramework::all_5_frameworks() {
        let bench = summary.compliance_benchmarks.iter().find(|b| b.framework == framework);
        assert!(bench.is_some());
        let b = bench.unwrap();
        assert_eq!(b.status, "compliant");
        assert!(b.score_percent >= 98.0);
    }
}

#[test]
fn test_all_7_credential_scan_vectors() {
    let org_id = Uuid::new_v4();
    let summary = run_comprehensive_security_audit(org_id);

    assert_eq!(summary.total_vectors_scanned, 7);
    assert_eq!(summary.total_credential_leaks_found, 0);
    assert_eq!(summary.credential_scans.len(), 7);

    let all_vectors = CredentialScanVector::all_7_vectors();
    assert_eq!(all_vectors.len(), 7);

    for vec in all_vectors {
        let scan = summary.credential_scans.iter().find(|s| s.vector == vec);
        assert!(scan.is_some(), "Vector {:?} missing from credential scans", vec);
        let s = scan.unwrap();
        assert_eq!(s.violations_detected, 0);
        assert!(s.zero_credentials_verified);
        assert!(s.files_scanned > 0);
        assert!(!vec.display_name().is_empty());
        assert!(!vec.target_scope().is_empty());
    }
}

#[test]
fn test_credential_leak_detector_blocks_secrets() {
    // 1. Benign payload must pass
    let clean_code = "const apiKey = process.env.GOOGLE_SECRET_NAME; const db = connect();";
    let clean_result = verify_credential_leak_absence(CredentialScanVector::SourceCode, clean_code);
    assert!(clean_result.is_ok());
    assert!(clean_result.unwrap().zero_credentials_verified);

    // 2. Stripe live key must be blocked
    let stripe_prefix = "sk_live";
    let stripe_leak = format!("const stripe = new Stripe('{}_51ABCDEF1234567890abcdef');", stripe_prefix);
    let res = verify_credential_leak_absence(CredentialScanVector::SourceCode, &stripe_leak);
    assert!(matches!(res, Err(PlatformError::SecurityViolation(_))));

    // 3. Razorpay live key must be blocked
    let rzp_prefix = "rzp_live";
    let rzp_leak = format!("{}_abcdef1234567890", rzp_prefix);
    let res = verify_credential_leak_absence(CredentialScanVector::Browser, &rzp_leak);
    assert!(matches!(res, Err(PlatformError::SecurityViolation(_))));

    // 4. GitHub PAT must be blocked
    let gh_prefix = "ghp";
    let gh_leak = format!("{}_012345678901234567890123456789012345", gh_prefix);
    let res = verify_credential_leak_absence(CredentialScanVector::Git, &gh_leak);
    assert!(matches!(res, Err(PlatformError::SecurityViolation(_))));

    // 5. Embedded PEM Private Key must be blocked
    let pem_leak = format!("{} PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC\n{} PRIVATE KEY-----", "-----BEGIN", "-----END");
    let res = verify_credential_leak_absence(CredentialScanVector::Docker, &pem_leak);
    assert!(matches!(res, Err(PlatformError::SecurityViolation(_))));

    // 6. Google API Key pattern must be blocked
    let google_leak = "const key = 'AIzaSy' + '123456789012345678901234567890123';";
    let res = verify_credential_leak_absence(CredentialScanVector::PlaintextDbFields, &google_leak);
    assert!(matches!(res, Err(PlatformError::SecurityViolation(_))));
}

#[test]
fn test_constant_time_hmac_webhook_verification() {
    let payload = b"{\"event\":\"invoice.payment_succeeded\",\"amount\":15000}";
    let secret = "whsec_test_secret_1234567890";

    // 1. Razorpay / generic HMAC test
    let expected_sig = compute_hmac_sha256_hex(payload, secret.as_bytes());
    assert!(verify_webhook_hmac_signature("razorpay", payload, &expected_sig, secret).is_ok());

    // Forged signature must fail
    let forged_sig = "0000000000000000000000000000000000000000000000000000000000000000";
    assert!(verify_webhook_hmac_signature("razorpay", payload, forged_sig, secret).is_err());

    // 2. WhatsApp Meta format test
    let meta_header = format!("sha256={}", expected_sig);
    assert!(verify_webhook_hmac_signature("whatsapp", payload, &meta_header, secret).is_ok());
    assert!(verify_webhook_hmac_signature("whatsapp", payload, "sha256=invalid", secret).is_err());

    // 3. Constant-time comparison validation
    assert!(constant_time_compare(b"abc", b"abc"));
    assert!(!constant_time_compare(b"abc", b"abd"));
    assert!(!constant_time_compare(b"abc", b"abcd"));

    // 4. Empty secret or header must fail
    assert!(verify_webhook_hmac_signature("stripe", payload, &meta_header, "").is_err());
    assert!(verify_webhook_hmac_signature("stripe", payload, "", secret).is_err());
}

#[test]
fn test_telephony_dnc_and_calling_window_enforcement() {
    let dnc_list = vec![
        "+15551234567".to_string(),
        "+919876543210".to_string(),
    ];

    // 1. Recipient on DNC list must be rejected
    let call_time = Utc.with_ymd_and_hms(2026, 9, 23, 10, 0, 0).unwrap(); // 10:00 UTC
    let dnc_res = verify_calling_window_and_dnc("+15551234567", call_time, -5, &dnc_list);
    assert!(matches!(dnc_res, Err(PlatformError::SecurityViolation(_))));

    // 2. Allowed caller within legal window: 10:00 UTC with offset +5.5 hours = 15:30 (3:30 PM) -> within 09:00 - 20:00
    let valid_caller = "+15559998888";
    let allowed_res = verify_calling_window_and_dnc(valid_caller, call_time, 5, &dnc_list);
    assert!(allowed_res.is_ok());

    // 3. Illegal calling window: 10:00 UTC with offset -7 hours = 03:00 AM local time -> outside legal window
    let night_res = verify_calling_window_and_dnc(valid_caller, call_time, -7, &dnc_list);
    assert!(matches!(night_res, Err(PlatformError::SecurityViolation(_))));

    // 4. Illegal calling window: 20:00 UTC with offset +2 hours = 22:00 (10:00 PM) local time -> outside legal window
    let late_call = Utc.with_ymd_and_hms(2026, 9, 23, 20, 0, 0).unwrap();
    let late_res = verify_calling_window_and_dnc(valid_caller, late_call, 2, &dnc_list);
    assert!(matches!(late_res, Err(PlatformError::SecurityViolation(_))));
}

#[test]
fn test_ai_agent_confidence_safety_gate() {
    // Autonomous execution threshold is 0.70
    assert!(verify_ai_agent_confidence(0.95, 0.70).is_ok());
    assert!(verify_ai_agent_confidence(0.70, 0.70).is_ok());

    // Below threshold must fail with PolicyViolation
    let sub_threshold_res = verify_ai_agent_confidence(0.68, 0.70);
    assert!(matches!(sub_threshold_res, Err(PlatformError::PolicyViolation(_))));

    let low_confidence_res = verify_ai_agent_confidence(0.42, 0.70);
    assert!(matches!(low_confidence_res, Err(PlatformError::PolicyViolation(_))));
}

#[test]
fn test_ai_tool_gateway_run_security_audit() {
    let org_id = Uuid::new_v4();

    // 1. Without capability "security:audit", tool call must be rejected
    let unauth_req = ToolGatewayRequest {
        organization_id: org_id,
        actor_id: "agent_analyst_01".to_string(),
        caller_role: "agent".to_string(),
        tool_name: "run_security_audit".to_string(),
        arguments: json!({}),
        idempotency_key: None,
        correlation_id: Uuid::new_v4().to_string(),
        granted_capabilities: vec!["crm:read".to_string()],
    };
    let unauth_res = AiToolGateway::execute(unauth_req, None, 0);
    assert!(matches!(unauth_res, Err(PlatformError::AuthorizationError(_))));

    // 2. With capability "security:audit", tool call succeeds
    let auth_req = ToolGatewayRequest {
        organization_id: org_id,
        actor_id: "sec_auditor_01".to_string(),
        caller_role: "security_auditor".to_string(),
        tool_name: "run_security_audit".to_string(),
        arguments: json!({
            "domains": ["all"],
            "include_credential_scan": true
        }),
        idempotency_key: None,
        correlation_id: Uuid::new_v4().to_string(),
        granted_capabilities: vec!["security:audit".to_string()],
    };
    let auth_res = AiToolGateway::execute(auth_req, None, 0);
    assert!(auth_res.is_ok());

    let response = auth_res.unwrap();
    assert_eq!(response.status, "success");
    assert_eq!(response.tool_name, "run_security_audit");
    assert!(!response.sha256_audit_hash.is_empty());
    assert!(response.policies_evaluated.contains(&"AUTH_CAPABILITY_VERIFICATION".to_string()));

    let result = response.result.unwrap();
    assert_eq!(result.get("total_domains_audited").and_then(|v| v.as_u64()), Some(19));
    assert_eq!(result.get("passed_domains").and_then(|v| v.as_u64()), Some(19));
    assert_eq!(result.get("total_credential_leaks_found").and_then(|v| v.as_u64()), Some(0));
}
