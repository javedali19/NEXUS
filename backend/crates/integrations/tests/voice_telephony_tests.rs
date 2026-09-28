use chrono::{DateTime, TimeZone, Utc};
use platform_domain::{
    CallComplianceCheckResult, CallPurpose, CallStatus, CallingWindowValidator, EscalationPriority,
    InitiateCallRequest, TelephonyCallingWindow, TwilioVoiceCredentials, TwilioVoiceEngine,
};
use uuid::Uuid;

#[test]
fn test_calling_window_validator_permits_within_tcpa_hours() {
    let window = TelephonyCallingWindow {
        id: Uuid::new_v4(),
        organization_id: Uuid::new_v4(),
        country_code: "US".to_string(),
        state_code: None,
        start_hour_local: 8,
        end_hour_local: 21,
        allow_weekends: false,
        timezone: "America/New_York".to_string(),
        is_active: true,
        created_at: Utc::now(),
    };

    let dnc_registry = vec!["+15559998888".to_string()];
    // Wednesday 14:00 UTC (within 08:00 - 21:00)
    let wednesday_afternoon = Utc.with_ymd_and_hms(2026, 9, 23, 14, 30, 0).unwrap();

    let result = CallingWindowValidator::evaluate_permission(
        "+14155552671",
        &dnc_registry,
        &window,
        wednesday_afternoon,
    );

    assert!(result.is_permitted, "Call must be permitted during TCPA window");
    assert!(result.is_within_calling_window);
    assert!(!result.is_dnc_suppressed);
    assert!(result.rejection_reason.is_none());
}

#[test]
fn test_calling_window_validator_rejects_outside_tcpa_hours() {
    let window = TelephonyCallingWindow {
        id: Uuid::new_v4(),
        organization_id: Uuid::new_v4(),
        country_code: "US".to_string(),
        state_code: None,
        start_hour_local: 8,
        end_hour_local: 21,
        allow_weekends: false,
        timezone: "America/New_York".to_string(),
        is_active: true,
        created_at: Utc::now(),
    };

    let dnc_registry: Vec<String> = vec![];
    // Wednesday 22:30 (outside 08:00 - 21:00)
    let late_night = Utc.with_ymd_and_hms(2026, 9, 23, 22, 30, 0).unwrap();

    let result = CallingWindowValidator::evaluate_permission(
        "+14155552671",
        &dnc_registry,
        &window,
        late_night,
    );

    assert!(!result.is_permitted, "Call must be rejected outside TCPA window");
    assert!(!result.is_within_calling_window);
    assert!(result.rejection_reason.is_some());
    assert!(
        result.rejection_reason.unwrap().contains("TCPA legal hours"),
        "Must cite TCPA legal hours"
    );
}

#[test]
fn test_calling_window_validator_blocks_dnc_registry() {
    let window = TelephonyCallingWindow::default();
    let dnc_registry = vec!["+1-555-888-9999".to_string(), "+14155552671".to_string()];
    let daytime = Utc.with_ymd_and_hms(2026, 9, 23, 11, 0, 0).unwrap();

    let result = CallingWindowValidator::evaluate_permission(
        "+1 (415) 555-2671",
        &dnc_registry,
        &window,
        daytime,
    );

    assert!(!result.is_permitted, "Call to DNC number must be blocked");
    assert!(result.is_dnc_suppressed, "DNC flag must be raised");
    assert!(
        result.rejection_reason.unwrap().contains("National Do-Not-Call (DNC)"),
        "Must cite DNC suppression"
    );
}

#[test]
fn test_calling_window_validator_blocks_weekends_when_disallowed() {
    let mut window = TelephonyCallingWindow::default();
    window.allow_weekends = false;

    let dnc_registry: Vec<String> = vec![];
    // Sunday 14:00 (September 27, 2026 is a Sunday)
    let sunday_afternoon = Utc.with_ymd_and_hms(2026, 9, 27, 14, 0, 0).unwrap();

    let result = CallingWindowValidator::evaluate_permission(
        "+14155552671",
        &dnc_registry,
        &window,
        sunday_afternoon,
    );

    assert!(!result.is_permitted, "Call on weekend must be blocked when allow_weekends is false");
    assert!(
        result.rejection_reason.unwrap().contains("weekends"),
        "Must cite weekend prohibition"
    );
}

#[test]
fn test_twilio_twiml_generation_and_audio_stream() {
    let twiml = TwilioVoiceEngine::build_twiml_media_stream(
        "wss://api.nexus.enterprise/v1/voice/stream/sess_abc123",
        "This call is recorded for quality assurance.",
        "sess_abc123",
    );

    assert!(twiml.contains("<Response>"));
    assert!(twiml.contains("<Say voice=\"Polly.Danielle-Neural\">This call is recorded for quality assurance.</Say>"));
    assert!(twiml.contains("<Stream url=\"wss://api.nexus.enterprise/v1/voice/stream/sess_abc123\">"));
    assert!(twiml.contains("<Parameter name=\"sessionToken\" value=\"sess_abc123\" />"));
}

#[test]
fn test_twilio_call_initiation_simulation_and_production() {
    let req = InitiateCallRequest {
        organization_id: Uuid::new_v4(),
        customer_id: Some(Uuid::new_v4()),
        from_number: "+18005550199".to_string(),
        to_number: "+14155552671".to_string(),
        queue_slug: "collections_recovery".to_string(),
        purpose: CallPurpose::CollectionsDunning,
    };

    // 1. Without credentials -> simulation mode
    let sim_result = TwilioVoiceEngine::initiate_call(None, req.clone(), "wss://nexus.internal").unwrap();
    assert!(sim_result.is_simulation);
    assert!(sim_result.provider_call_sid.starts_with("CA_SIM_"));
    assert_eq!(sim_result.status, CallStatus::Ringing);

    // 2. With real Twilio credentials
    let creds = TwilioVoiceCredentials {
        account_sid: "AC_TEST_SANDBOX_MOCK_SID".to_string(),
        auth_token: "secret_token".to_string(),
        phone_number: "+18005550199".to_string(),
    };
    let prod_result = TwilioVoiceEngine::initiate_call(Some(&creds), req, "wss://nexus.internal").unwrap();
    assert!(!prod_result.is_simulation);
    assert!(prod_result.provider_call_sid.starts_with("CA"));
    assert!(!prod_result.provider_call_sid.starts_with("CA_SIM_"));
}

#[test]
fn test_supervisor_escalation_warm_transfer() {
    let call_id = Uuid::new_v4();
    let org_id = Uuid::new_v4();
    let escalation = TwilioVoiceEngine::escalate_to_supervisor(
        call_id,
        org_id,
        "Customer requested human representative after invoice dispute",
        EscalationPriority::Urgent,
        None,
        "Marcus Vance",
        "Sarah Jenkins",
        -0.75,
        "Billing dispute regarding uncredited discount voucher",
    );

    assert_eq!(escalation.call_id, call_id);
    assert_eq!(escalation.priority, "urgent");
    assert_eq!(escalation.status, "pending");
    assert_eq!(escalation.assigned_supervisor_name.as_deref(), Some("Marcus Vance"));
    assert!(escalation.handoff_packet.get("customer_name").is_some());
    assert_eq!(
        escalation.handoff_packet["customer_name"].as_str(),
        Some("Sarah Jenkins")
    );
    assert_eq!(
        escalation.handoff_packet["sentiment_score"].as_f64(),
        Some(-0.75)
    );
}
