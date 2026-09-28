use chrono::{Duration, Utc};
use platform_domain::{
    CallAuditEventRecord, CallPurpose, CallStatus, PromiseToPayRecord, TelephonyCall,
    TwilioVoiceEngine,
};
use serde_json::json;
use uuid::Uuid;

fn sample_call_record() -> TelephonyCall {
    TelephonyCall {
        id: Uuid::new_v4(),
        organization_id: Uuid::new_v4(),
        provider_call_sid: Some("CA1234567890abcdef1234567890abcdef".to_string()),
        direction: "outbound".to_string(),
        from_number: "+18005550199".to_string(),
        to_number: "+13125558492".to_string(),
        queue_id: Some(Uuid::new_v4()),
        customer_id: Some(Uuid::new_v4()),
        purpose: "collections_dunning".to_string(),
        status: "in_progress".to_string(),
        outcome: None,
        duration_seconds: 180,
        cost_usd: 0.032,
        started_at: Utc::now(),
        ended_at: None,
        language: "en-US".to_string(),
        scheduled_time: Some(Utc::now() + Duration::hours(2)),
        priority: "urgent".to_string(),
        agent_persona: "Adam (Collections Recovery Lead)".to_string(),
        intent: Some("payment_commitment".to_string()),
        promise_to_pay: None,
        follow_up: None,
        created_at: Utc::now(),
    }
}

#[test]
fn test_call_creation_with_18_dimensions() {
    let call = sample_call_record();

    assert_eq!(call.language, "en-US");
    assert_eq!(call.priority, "urgent");
    assert_eq!(call.agent_persona, "Adam (Collections Recovery Lead)");
    assert_eq!(call.intent.as_deref(), Some("payment_commitment"));
    assert!(call.scheduled_time.is_some());
    assert_eq!(call.direction, "outbound");
    assert_eq!(call.status, "in_progress");
}

#[test]
fn test_record_promise_to_pay_commitment() {
    let mut call = sample_call_record();

    let ptp = TwilioVoiceEngine::record_promise_to_pay(
        &mut call,
        12400.0,
        "USD",
        "2026-09-25",
        "razorpay_link",
        "INV-2026-089",
    );

    assert_eq!(ptp.amount, 12400.0);
    assert_eq!(ptp.currency, "USD");
    assert_eq!(ptp.invoice_id, "INV-2026-089");
    assert_eq!(ptp.status, "pending_clearance");

    // Verify call record outcome was updated
    assert_eq!(call.outcome.as_deref(), Some("promise_to_pay_secured"));
    assert!(call.promise_to_pay.is_some());

    let ptp_json = call.promise_to_pay.unwrap();
    assert_eq!(ptp_json["amount"].as_f64(), Some(12400.0));
    assert_eq!(ptp_json["payment_method"].as_str(), Some("razorpay_link"));
}

#[test]
fn test_schedule_follow_up_action() {
    let mut call = sample_call_record();
    let follow_up_time = Utc::now() + Duration::days(2);

    let follow_up = TwilioVoiceEngine::schedule_follow_up(
        &mut call,
        follow_up_time,
        "whatsapp",
        "Marcus Vance",
        "Dispatch Razorpay link receipt and verify wire clearance",
    );

    assert_eq!(follow_up.channel, "whatsapp");
    assert_eq!(follow_up.assigned_agent, "Marcus Vance");
    assert!(call.follow_up.is_some());

    let follow_up_json = call.follow_up.unwrap();
    assert_eq!(follow_up_json["channel"].as_str(), Some("whatsapp"));
    assert_eq!(follow_up_json["assigned_agent"].as_str(), Some("Marcus Vance"));
}

#[test]
fn test_append_only_call_audit_event_logging() {
    let call_id = Uuid::new_v4();
    let org_id = Uuid::new_v4();

    // 1. Log call queued event
    let event1 = TwilioVoiceEngine::log_call_audit_event(
        call_id,
        org_id,
        "call_queued",
        "system",
        "ACD Routing Engine",
        json!({"queue_slug": "collections_recovery", "priority": "urgent"}),
    );
    assert_eq!(event1.event_type, "call_queued");
    assert_eq!(event1.actor_type, "system");

    // 2. Log consent disclosure played
    let event2 = TwilioVoiceEngine::log_call_audit_event(
        call_id,
        org_id,
        "consent_disclosed",
        "ai_agent",
        "Adam (AI Voice Agent)",
        json!({"disclosure_text": "This call is recorded for quality assurance.", "consent_acknowledged": true}),
    );
    assert_eq!(event2.event_type, "consent_disclosed");

    // 3. Log PTP commitment
    let event3 = TwilioVoiceEngine::log_call_audit_event(
        call_id,
        org_id,
        "promise_to_pay_logged",
        "ai_agent",
        "Adam (AI Voice Agent)",
        json!({"amount": 12400.0, "invoice_id": "INV-2026-089"}),
    );
    assert_eq!(event3.event_type, "promise_to_pay_logged");
}
