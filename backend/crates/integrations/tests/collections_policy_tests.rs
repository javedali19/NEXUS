use chrono::{DateTime, Duration, NaiveDate, Utc};
use uuid::Uuid;

use platform_domain::collections::{
    CollectionsAction, CollectionsPolicyEngine, CustomerCollectionsContext, CustomerConsentContext,
    CustomerSegment, InvoiceCollectionsContext, PromiseToPay, PtpStatus, SuppressionReason,
};

fn sample_invoice(days_past_due: i32, amount: f64) -> InvoiceCollectionsContext {
    InvoiceCollectionsContext {
        invoice_id: Uuid::new_v4(),
        invoice_number: "INV-2026-TEST".into(),
        days_past_due,
        overdue_amount: amount,
    }
}

fn sample_customer(segment: CustomerSegment) -> CustomerCollectionsContext {
    CustomerCollectionsContext {
        customer_id: Uuid::new_v4(),
        customer_name: "Acme Industrial Corp".into(),
        segment,
        payment_history_score: 85,
        consent: CustomerConsentContext::default(),
        is_dnc_registered: false,
        country: "US".into(),
        recipient_local_hour: 14, // 2:00 PM (inside window)
        recipient_is_weekend: false,
        last_contacted_at: None,
        active_ptp: None,
        is_under_dispute: false,
    }
}

#[test]
fn test_dnc_suppresses_voice_calls_and_diverts_to_task() {
    let invoice = sample_invoice(65, 12000.0); // DPD 65 triggers Call for SMB
    let mut customer = sample_customer(CustomerSegment::Smb);
    customer.is_dnc_registered = true; // DNC active

    let now = Utc::now();
    let outcome = CollectionsPolicyEngine::evaluate(&invoice, &customer, now);

    assert_eq!(outcome.action, CollectionsAction::Task);
    assert!(outcome.is_suppressed);
    assert_eq!(outcome.suppression_reason, Some(SuppressionReason::DncRegistered));
    assert!(outcome.explanation.contains("BLOCKED") || outcome.explanation.contains("Do Not Call"));
}

#[test]
fn test_active_ptp_pauses_collections() {
    let invoice = sample_invoice(45, 5000.0);
    let mut customer = sample_customer(CustomerSegment::MidMarket);
    let tomorrow = Utc::now().date_naive() + Duration::days(3);
    customer.active_ptp = Some(PromiseToPay {
        id: Uuid::new_v4(),
        case_id: Uuid::new_v4(),
        ptp_amount: 5000.0,
        promised_date: tomorrow,
        status: PtpStatus::Pending,
        notes: Some("Customer agreed to pay on Friday via wire.".into()),
    });

    let now = Utc::now();
    let outcome = CollectionsPolicyEngine::evaluate(&invoice, &customer, now);

    assert_eq!(outcome.action, CollectionsAction::Pause);
    assert!(outcome.is_suppressed);
    assert_eq!(outcome.suppression_reason, Some(SuppressionReason::PtpActive));
    assert!(outcome.explanation.contains("Promise-to-Pay"));
}

#[test]
fn test_broken_ptp_triggers_immediate_escalation() {
    let invoice = sample_invoice(45, 5000.0);
    let mut customer = sample_customer(CustomerSegment::MidMarket);
    let yesterday = Utc::now().date_naive() - Duration::days(2); // Passed date!
    customer.active_ptp = Some(PromiseToPay {
        id: Uuid::new_v4(),
        case_id: Uuid::new_v4(),
        ptp_amount: 5000.0,
        promised_date: yesterday,
        status: PtpStatus::Pending,
        notes: Some("Promise date passed without payment.".into()),
    });

    let now = Utc::now();
    let outcome = CollectionsPolicyEngine::evaluate(&invoice, &customer, now);

    assert_eq!(outcome.action, CollectionsAction::Escalation);
    assert!(!outcome.is_suppressed);
    assert!(outcome.explanation.contains("broken"));
    assert_eq!(outcome.priority, 1);
}

#[test]
fn test_outside_communication_window_delays_contact() {
    let invoice = sample_invoice(65, 12000.0);
    let mut customer = sample_customer(CustomerSegment::Smb);
    customer.recipient_local_hour = 23; // 11:00 PM local time!

    let now = Utc::now();
    let outcome = CollectionsPolicyEngine::evaluate(&invoice, &customer, now);

    assert_eq!(outcome.action, CollectionsAction::Call);
    assert!(outcome.is_suppressed);
    assert_eq!(outcome.suppression_reason, Some(SuppressionReason::OutsideCommunicationWindow));
    assert!(outcome.scheduled_for_next_window);
    assert!(outcome.explanation.contains("delayed") || outcome.explanation.contains("outside compliant"));
}

#[test]
fn test_enterprise_tier1_avoids_robocalls() {
    let invoice = sample_invoice(75, 80000.0); // Major overdue invoice
    let customer = sample_customer(CustomerSegment::EnterpriseTier1);

    let now = Utc::now();
    let outcome = CollectionsPolicyEngine::evaluate(&invoice, &customer, now);

    // Enterprise Tier 1 must route to account executive task, never robocalls
    assert_eq!(outcome.action, CollectionsAction::Task);
    assert!(!outcome.is_suppressed);
    assert!(outcome.explanation.contains("Enterprise Tier 1"));
}

#[test]
fn test_consent_validation_for_whatsapp() {
    let invoice = sample_invoice(35, 2000.0); // DPD 35 normally triggers WhatsApp
    let mut customer = sample_customer(CustomerSegment::Smb);
    customer.consent.whatsapp_opt_in = false; // No consent!

    let now = Utc::now();
    let outcome = CollectionsPolicyEngine::evaluate(&invoice, &customer, now);

    assert_eq!(outcome.action, CollectionsAction::Reminder);
    assert!(outcome.is_suppressed);
    assert_eq!(outcome.suppression_reason, Some(SuppressionReason::NoConsent));
}
