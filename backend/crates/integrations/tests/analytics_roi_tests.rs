use domain::analytics_roi::AnalyticsAndRoiEngine;
use uuid::Uuid;

#[test]
fn test_synthesize_all_16_analytics_and_roi_dimensions() {
    let org_id = Uuid::new_v4();
    let report = AnalyticsAndRoiEngine::synthesize_report(org_id, "30d");

    // 1. Revenue Collected
    assert_eq!(report.financials.revenue_collected, 384_500.0);

    // 2. Revenue Influenced
    assert_eq!(report.financials.revenue_influenced, 842_500.0);

    // 3. Outstanding Receivables
    assert_eq!(report.financials.outstanding_receivables, 412_800.0);

    // 4. Recovery Rate
    assert_eq!(report.financials.recovery_rate, 89.2);

    // 5. DSO (Days Sales Outstanding) calculation
    assert!(report.financials.dso > 30.0 && report.financials.dso < 35.0);

    // 6. Aging
    let sum_aging: f64 = report.financials.aging_brackets.values().sum();
    assert!((sum_aging - 100.0).abs() < 0.01);

    // 7. Payment-Link Conversion Funnel
    assert_eq!(report.financials.payment_link_conversion.dispatched, 420);
    assert_eq!(report.financials.payment_link_conversion.paid, 329);
    assert_eq!(report.financials.payment_link_conversion.conversion_rate, 78.4);

    // 8. WhatsApp Performance
    assert_eq!(report.communications.whatsapp_performance.dispatched, 1_840);
    assert_eq!(report.communications.whatsapp_performance.delivery_rate, 98.7);
    assert_eq!(report.communications.whatsapp_performance.read_rate, 94.2);
    assert_eq!(report.communications.whatsapp_performance.reply_rate, 44.6);

    // 9. Call Connection
    assert_eq!(report.communications.call_connection.total_calls, 428);
    assert_eq!(report.communications.call_connection.connected_rate, 84.2);
    assert!(report.communications.call_connection.net_sentiment > 0.8);

    // 10. Promise-to-Pay
    assert_eq!(report.communications.promise_to_pay.total_commitments_count, 35);
    assert_eq!(report.communications.promise_to_pay.total_amount, 125_000.0);
    assert_eq!(report.communications.promise_to_pay.kept_amount, 114_250.0);
    assert_eq!(report.communications.promise_to_pay.fulfillment_rate, 91.4);

    // 11. Sales Funnel
    assert_eq!(report.commercial_funnel.leads, 142);
    assert_eq!(report.commercial_funnel.mql, 97);
    assert_eq!(report.commercial_funnel.won, 18);
    assert_eq!(report.commercial_funnel.win_rate, 38.2);

    // 12. Attribution
    assert_eq!(report.attribution.channels.len(), 3);
    let total_ai_attribution: f64 = report
        .attribution
        .channels
        .iter()
        .map(|c| c.ai_multi_touch_percent)
        .sum();
    assert!((total_ai_attribution - 100.0).abs() < 0.01);

    // 13. Agent Activity
    assert_eq!(report.agent_roi.agent_activity_runs, 14_820);

    // 14. Agent-Assisted Revenue
    assert_eq!(report.agent_roi.agent_assisted_revenue, 842_500.0);

    // 15. Agent-Assisted Savings
    assert_eq!(report.agent_roi.agent_assisted_hours_saved, 480);
    assert_eq!(report.agent_roi.agent_assisted_savings, 78_400.0);
    assert!(report.agent_roi.roi_multiplier >= 8.0);
    assert_eq!(report.agent_roi.persona_breakdown.len(), 4);

    // 16. Workflow Health
    assert_eq!(report.workflow_health.total_runs, 2_450);
    assert_eq!(report.workflow_health.success_rate, 99.6);
    assert_eq!(report.workflow_health.pending_approval_gates, 3);
}

#[test]
fn test_dso_and_roi_calculation_math() {
    let dso = AnalyticsAndRoiEngine::calculate_dso(412_800.0, 1_845_200.0, 140.0);
    assert_eq!(dso, 31.3);

    let mult = AnalyticsAndRoiEngine::calculate_roi_multiplier(842_500.0 + 21_600.0, 1_800.0);
    assert!(mult > 400.0);
}
