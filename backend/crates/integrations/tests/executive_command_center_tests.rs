use domain::executive_command_center::{
    ExecutiveCommandCenterEngine,
};
use uuid::Uuid;

#[test]
fn test_synthesize_all_14_operational_metrics() {
    let org_id = Uuid::new_v4();
    let report = ExecutiveCommandCenterEngine::synthesize_realtime_metrics(org_id, "30d");

    // 1. Revenue
    assert!(report.revenue.total_invoiced_revenue > 0.0);
    assert_eq!(report.revenue.mom_growth_percent, 18.4);
    assert_eq!(report.revenue.monthly_trend.len(), 7);

    // 2. Collections
    assert_eq!(report.collections.total_recovered, 384_500.0);
    assert!(report.collections.autonomous_recovered > report.collections.manual_recovered);
    assert_eq!(report.collections.promise_to_pay_fulfillment_rate, 91.4);

    // 3. Outstanding Receivables & Aging Sum
    assert_eq!(report.receivables.total_ar, 412_800.0);
    assert_eq!(report.receivables.days_sales_outstanding, 31.4);
    let total_aging = report.receivables.aging_current_percent
        + report.receivables.aging_31_60_percent
        + report.receivables.aging_61_90_percent
        + report.receivables.aging_90_plus_percent;
    assert!((total_aging - 100.0).abs() < 0.01);

    // 4. Overdue Invoices
    assert_eq!(report.overdue_invoices.overdue_count, 23);
    assert_eq!(report.overdue_invoices.overdue_amount_total, 92_400.0);
    assert_eq!(report.overdue_invoices.active_disputes_count, 4);

    // 5. Payment Conversion
    assert_eq!(report.payment_conversion.checkout_conversion_rate, 78.4);
    assert_eq!(report.payment_conversion.avg_clearance_hours, 4.2);

    // 6. Pipeline
    assert_eq!(report.pipeline.active_pipeline_value, 4_250_000.0);
    assert!(report.pipeline.stage_distribution.contains_key("Proposal"));

    // 7. Leads
    assert_eq!(report.leads.in_flight_leads_count, 142);
    assert_eq!(report.leads.ai_qualification_rate, 68.4);

    // 8. Customer Activity
    assert_eq!(report.customer_activity.active_unified_accounts, 1_420);
    assert_eq!(report.customer_activity.health_healthy_percent, 88.0);

    // 9. WhatsApp Performance
    assert_eq!(report.whatsapp.dispatched_count, 1_840);
    assert_eq!(report.whatsapp.delivery_rate, 98.7);
    assert_eq!(report.whatsapp.autonomous_handling_rate, 72.6);

    // 10. Call Performance
    assert_eq!(report.calls.total_calls, 428);
    assert_eq!(report.calls.autonomous_completion_rate, 91.6);
    assert!(report.calls.sentiment_score > 0.8);

    // 11. Workflow Health
    assert_eq!(report.workflows.total_runs, 2_450);
    assert!(report.workflows.success_rate >= 99.0);

    // 12. AI Activity
    assert_eq!(report.ai_activity.tool_invocations_count, 14_820);
    assert_eq!(report.ai_activity.direct_db_violations_count, 0);

    // 13. Exceptions
    assert_eq!(report.exceptions.open_exceptions_count, 12);
    assert_eq!(report.exceptions.auto_remediated_rate, 94.1);

    // 14. Operational Alerts
    assert_eq!(report.active_alerts.len(), 4);
    assert!(report.active_alerts.iter().any(|a| a.severity == "critical"));
}

#[test]
fn test_evaluate_operational_health_gate() {
    let org_id = Uuid::new_v4();
    let report = ExecutiveCommandCenterEngine::synthesize_realtime_metrics(org_id, "30d");

    let is_healthy = ExecutiveCommandCenterEngine::evaluate_operational_health(&report);
    assert!(is_healthy);
}
