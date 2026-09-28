use uuid::Uuid;

use platform_domain::autonomous_collections::{
    AutonomousCollectionsRun, ProviderConnectionGating, WorkflowRunStatus, WorkflowStage,
};

#[test]
fn test_autonomous_collections_run_initialization() {
    let org_id = Uuid::new_v4();
    let inv_id = Uuid::new_v4();
    let cust_id = Uuid::new_v4();
    let gating = ProviderConnectionGating::default();

    let run = AutonomousCollectionsRun::new(
        org_id,
        inv_id,
        "INV-2026-0044".into(),
        cust_id,
        "OmniCorp Logistics".into(),
        32100.0,
        52,
        gating,
    );

    assert_eq!(run.invoice_number, "INV-2026-0044");
    assert_eq!(run.run_status, WorkflowRunStatus::Running);
    assert_eq!(run.current_stage, WorkflowStage::PolicyEvaluation);
    assert!(run.correlation_id.starts_with("corr_auton_col_INV-2026-0044_"));
    assert_eq!(run.stage_logs.len(), 1);
    assert_eq!(run.stage_logs[0].stage, WorkflowStage::InvoiceOverdue);
}

#[test]
fn test_circuit_breaker_workflow_cancellation_on_payment_webhook() {
    let org_id = Uuid::new_v4();
    let inv_id = Uuid::new_v4();
    let cust_id = Uuid::new_v4();
    let gating = ProviderConnectionGating::default();

    let mut run = AutonomousCollectionsRun::new(
        org_id,
        inv_id,
        "INV-2026-0044".into(),
        cust_id,
        "OmniCorp Logistics".into(),
        32100.0,
        52,
        gating,
    );

    // Simulate Payment Webhook arriving with verified signature
    let res = run.handle_payment_webhook("pay_razor_test_99214".into(), 32100.0, true);
    assert!(res.is_ok());

    assert_eq!(run.run_status, WorkflowRunStatus::CancelledOnPayment);
    assert_eq!(run.cancellation_reason, Some("payment_captured_webhook".into()));
    assert_eq!(run.payment_reference, Some("pay_razor_test_99214".into()));
    assert_eq!(run.current_stage, WorkflowStage::AuditLedger);
    assert_eq!(run.stages_completed, 13);
    assert!(run.completed_at.is_some());

    // Verify stage logs contain all downstream stages:
    // Stage 8: Payment Webhook
    // Stage 9: Workflow Cancellation
    // Stage 10: Accounting Sync
    // Stage 11: Timeline Emit
    // Stage 12: Analytics Update
    // Stage 13: Audit Ledger
    let stage_names: Vec<WorkflowStage> = run.stage_logs.iter().map(|l| l.stage).collect();
    assert!(stage_names.contains(&WorkflowStage::PaymentWebhook));
    assert!(stage_names.contains(&WorkflowStage::WorkflowCancellation));
    assert!(stage_names.contains(&WorkflowStage::AccountingSync));
    assert!(stage_names.contains(&WorkflowStage::TimelineEmit));
    assert!(stage_names.contains(&WorkflowStage::AnalyticsUpdate));
    assert!(stage_names.contains(&WorkflowStage::AuditLedger));
}

#[test]
fn test_invalid_webhook_signature_rejected() {
    let mut run = AutonomousCollectionsRun::new(
        Uuid::new_v4(),
        Uuid::new_v4(),
        "INV-TEST-01".into(),
        Uuid::new_v4(),
        "CyberDyne".into(),
        5000.0,
        30,
        ProviderConnectionGating::default(),
    );

    // Invalid signature -> must return authorization error
    let res = run.handle_payment_webhook("pay_fake_unverified".into(), 5000.0, false);
    assert!(res.is_err());
    assert_eq!(run.run_status, WorkflowRunStatus::Running); // Did not cancel
    assert!(run.payment_reference.is_none());
}

#[test]
fn test_provider_connection_gating_unvalidated_mode() {
    let gating = ProviderConnectionGating::default();
    assert!(!gating.whatsapp_live);
    assert!(!gating.payment_provider_live);
    assert!(!gating.accounting_live);
    assert!(gating.is_dry_run_simulation);
    assert!(gating.whatsapp_status_message.contains("dry-run"));
}
