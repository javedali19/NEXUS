use chrono::{Duration, Utc};
use platform_domain::{
    CasePriority, CaseStatus, CreateSupportCaseDto, SlaStatus, SupportCaseService,
};
use uuid::Uuid;

fn sample_create_case_dto(priority: CasePriority) -> CreateSupportCaseDto {
    CreateSupportCaseDto {
        organization_id: Uuid::new_v4(),
        customer_id: Some(Uuid::new_v4()),
        contact_id: Some(Uuid::new_v4()),
        subject: "Dispute over uncredited discount voucher on Invoice INV-2026-089".to_string(),
        description: "Customer states that a $1,200 promotional voucher was not applied before charge.".to_string(),
        category: "billing_dispute".to_string(),
        priority,
        assigned_team: Some("Billing Operations".to_string()),
        assigned_agent_name: Some("Elena Chen".to_string()),
        assigned_ai_persona: Some("Rachel (AI Support Copilot)".to_string()),
        whatsapp_session_id: Some("wa_sess_99182".to_string()),
        linked_call_id: Some(Uuid::new_v4()),
        linked_invoice_id: Some(Uuid::new_v4()),
    }
}

#[test]
fn test_case_creation_with_automatic_sla_targets() {
    let now = Utc::now();

    // 1. Urgent priority case
    let urgent_case = SupportCaseService::create_case(sample_create_case_dto(CasePriority::Urgent), now);
    assert_eq!(urgent_case.priority, "urgent");
    assert_eq!(urgent_case.status, "open");
    assert_eq!(
        urgent_case.first_response_due_at,
        now + Duration::minutes(15)
    );
    assert_eq!(
        urgent_case.resolution_due_at,
        now + Duration::hours(2)
    );

    // 2. High priority case
    let high_case = SupportCaseService::create_case(sample_create_case_dto(CasePriority::High), now);
    assert_eq!(
        high_case.first_response_due_at,
        now + Duration::hours(1)
    );
    assert_eq!(
        high_case.resolution_due_at,
        now + Duration::hours(8)
    );

    // 3. Medium priority case
    let med_case = SupportCaseService::create_case(sample_create_case_dto(CasePriority::Medium), now);
    assert_eq!(
        med_case.first_response_due_at,
        now + Duration::hours(4)
    );
    assert_eq!(
        med_case.resolution_due_at,
        now + Duration::hours(24)
    );
}

#[test]
fn test_sla_breach_detection() {
    let now = Utc::now();
    let mut case = SupportCaseService::create_case(sample_create_case_dto(CasePriority::Urgent), now);

    // Immediate check -> within SLA
    let status_now = SupportCaseService::evaluate_sla(&mut case, now);
    assert_eq!(status_now, SlaStatus::WithinSla);

    // 3 hours later (beyond 2 hour resolution SLA) -> Breached
    let three_hours_later = now + Duration::hours(3);
    let status_breached = SupportCaseService::evaluate_sla(&mut case, three_hours_later);
    assert_eq!(status_breached, SlaStatus::Breached);
    assert_eq!(case.sla_status, "breached");
}

#[test]
fn test_omnichannel_conversation_messaging() {
    let now = Utc::now();
    let mut case = SupportCaseService::create_case(sample_create_case_dto(CasePriority::Medium), now);

    // 1. Inbound customer message from WhatsApp
    let msg1 = SupportCaseService::add_message(
        &mut case,
        "customer",
        "Sarah Jenkins",
        "whatsapp",
        "Hi, I am looking for an update on our invoice credit.",
        Some("wamid.HBc81726".to_string()),
        now,
    );
    assert_eq!(msg1.channel, "whatsapp");
    assert_eq!(case.first_responded_at, None); // Customer message does not count as first response

    // 2. Outbound agent reply via portal
    let agent_reply_time = now + Duration::minutes(25);
    let msg2 = SupportCaseService::add_message(
        &mut case,
        "agent",
        "Elena Chen",
        "portal",
        "Hello Sarah! I have verified voucher VOUCH-1200 and applied the credit directly to INV-2026-089.",
        None,
        agent_reply_time,
    );

    assert_eq!(msg2.sender_type, "agent");
    assert_eq!(case.first_responded_at, Some(agent_reply_time));
    assert_eq!(case.status, "in_progress");
}

#[test]
fn test_internal_note_isolation() {
    let case_id = Uuid::new_v4();
    let org_id = Uuid::new_v4();

    let note = SupportCaseService::add_internal_note(
        case_id,
        org_id,
        Some(Uuid::new_v4()),
        "Marcus Vance",
        "Internal staff note: Customer has $145k LTV; expedite credit adjustment to preserve renewal.",
        true,
    );

    assert_eq!(note.author_name, "Marcus Vance");
    assert!(note.is_pinned);
    assert!(note.note_text.contains("Internal staff note"));
}

#[test]
fn test_supervisor_escalation_flow() {
    let now = Utc::now();
    let mut case = SupportCaseService::create_case(sample_create_case_dto(CasePriority::Medium), now);

    let audit_event = SupportCaseService::escalate_case(
        &mut case,
        "Marcus Vance (Tier 3 Lead)",
        "Customer requested senior supervisor after automated webhook rate-limit drop.",
        now + Duration::minutes(10),
    );

    assert!(case.is_escalated);
    assert_eq!(case.status, "escalated");
    assert_eq!(case.priority, "urgent");
    assert_eq!(
        case.escalated_to_supervisor_name.as_deref(),
        Some("Marcus Vance (Tier 3 Lead)")
    );
    assert_eq!(audit_event.event_type, "escalated");
    assert_eq!(audit_event.actor_type, "supervisor");
}

#[test]
fn test_case_resolution_and_csat() {
    let now = Utc::now();
    let mut case = SupportCaseService::create_case(sample_create_case_dto(CasePriority::High), now);

    let resolve_time = now + Duration::hours(3);
    let audit_event = SupportCaseService::resolve_case(
        &mut case,
        "Disputed promotional credit applied in full. Net balance adjusted to $11,200.",
        "billing_adjustment",
        Some(5),
        resolve_time,
    );

    assert_eq!(case.status, "resolved");
    assert_eq!(case.resolved_at, Some(resolve_time));
    assert_eq!(case.csat_score, Some(5));
    assert_eq!(audit_event.event_type, "resolved");
}

#[test]
fn test_cross_system_connections() {
    let now = Utc::now();
    let mut case = SupportCaseService::create_case(sample_create_case_dto(CasePriority::Medium), now);

    let call_id = Uuid::new_v4();
    let invoice_id = Uuid::new_v4();
    let workflow_id = Uuid::new_v4();

    SupportCaseService::link_omnichannel_context(
        &mut case,
        Some("wa_sess_new_491".to_string()),
        Some(call_id),
        Some(invoice_id),
        Some(workflow_id),
    );

    assert_eq!(case.whatsapp_session_id.as_deref(), Some("wa_sess_new_491"));
    assert_eq!(case.linked_call_id, Some(call_id));
    assert_eq!(case.linked_invoice_id, Some(invoice_id));
    assert_eq!(case.workflow_execution_id, Some(workflow_id));
}
