use domain::settings_policy::{
    DncPolicy, RetentionPolicy, SettingsPolicyEngine,
};
use uuid::Uuid;

#[test]
fn test_default_tenant_policy_envelope_initialization() {
    let org_id = Uuid::new_v4();
    let envelope = SettingsPolicyEngine::default_settings_envelope(org_id);

    // Organization & Business Units
    assert_eq!(envelope.organization_id, org_id);
    assert_eq!(envelope.organization_profile.base_currency, "SGD");
    assert_eq!(envelope.organization_profile.tax_authority, "IRAS");
    assert_eq!(envelope.business_units.len(), 3);
    assert_eq!(envelope.business_units[0].code, "BU-SG-HQ");
    assert_eq!(envelope.business_units[1].code, "BU-MY-OPS");
    assert_eq!(envelope.business_units[2].code, "BU-TH-RET");

    // Security & Audit
    assert!(envelope.security_policy.mfa_enforced);
    assert_eq!(envelope.security_policy.min_password_length, 14);
    assert_eq!(envelope.security_policy.token_signing_algorithm, "Ed25519");
    assert!(envelope.audit_policy.immutable_append_only);
    assert!(envelope.audit_policy.sha256_hash_chaining);

    // AI & Workflow policies
    assert!(envelope.ai_policy.pii_redactor_enabled);
    assert!(envelope.ai_policy.redact_credit_cards);
    assert!(envelope.ai_policy.prohibit_executive_deepfakes);
    assert_eq!(envelope.workflow_policy.max_concurrent_executions, 500);

    // Billing metadata
    assert_eq!(envelope.billing_metadata.plan_tier, "enterprise_sea_unlimited");
    assert_eq!(envelope.billing_metadata.payment_method_last4, "4242");
}

#[test]
fn test_dnc_dialing_eligibility_enforcement() {
    let policy = DncPolicy {
        enforce_singapore_pdpc_dnc: true,
        enforce_malaysia_mcmc_dnc: true,
        enforce_thailand_nbtc_dnc: true,
        cooling_off_period_days: 30,
        hard_block_telephony_on_dnc: true,
        allow_agent_override: false,
        opt_out_keywords: vec!["STOP".to_string(), "BATAL".to_string()],
    };

    // Active suppression list block
    let blocked = SettingsPolicyEngine::evaluate_dnc_dialing_eligibility("+6591234567", &policy, true);
    assert!(blocked.is_err());
    assert_eq!(
        blocked.unwrap_err(),
        "Phone number is present in active DNC suppression list"
    );

    // Allowed clear number
    let allowed = SettingsPolicyEngine::evaluate_dnc_dialing_eligibility("+6591234567", &policy, false);
    assert!(allowed.is_ok());

    // Empty number validation
    let empty_invalid = SettingsPolicyEngine::evaluate_dnc_dialing_eligibility("", &policy, false);
    assert!(empty_invalid.is_err());
}

#[test]
fn test_rbac_permission_matrix_rules() {
    // SuperAdmin & TenantAdmin have full access
    assert!(SettingsPolicyEngine::check_rbac_permission("super_admin", "crm", "administer"));
    assert!(SettingsPolicyEngine::check_rbac_permission("tenant_admin", "billing", "delete"));

    // Finance Controller
    assert!(SettingsPolicyEngine::check_rbac_permission("finance_controller", "billing", "edit"));
    assert!(SettingsPolicyEngine::check_rbac_permission("finance_controller", "erp", "create"));
    assert!(SettingsPolicyEngine::check_rbac_permission("finance_controller", "crm", "view"));
    assert!(!SettingsPolicyEngine::check_rbac_permission("finance_controller", "crm", "delete"));
    assert!(!SettingsPolicyEngine::check_rbac_permission("finance_controller", "ai_agents", "edit"));

    // Compliance Auditor
    assert!(SettingsPolicyEngine::check_rbac_permission("compliance_auditor", "audit", "view"));
    assert!(SettingsPolicyEngine::check_rbac_permission("compliance_auditor", "audit", "export_pii"));
    assert!(!SettingsPolicyEngine::check_rbac_permission("compliance_auditor", "crm", "edit"));

    // Read Only Observer
    assert!(SettingsPolicyEngine::check_rbac_permission("read_only_observer", "crm", "view"));
    assert!(!SettingsPolicyEngine::check_rbac_permission("read_only_observer", "crm", "create"));
}

#[test]
fn test_retention_policy_and_legal_hold_evaluation() {
    let mut policy = RetentionPolicy {
        tax_invoices_retention_years: 7,
        payments_retention_years: 7,
        call_recordings_retention_days: 90,
        ai_transcripts_retention_days: 180,
        support_tickets_retention_years: 3,
        audit_logs_retention_years: 7,
        auto_purge_action: "cold_archive".to_string(),
        legal_hold_active: false,
    };

    // Call recordings: 90 days
    assert!(!SettingsPolicyEngine::is_eligible_for_retention_purge("call_recordings", 89, &policy));
    assert!(SettingsPolicyEngine::is_eligible_for_retention_purge("call_recordings", 90, &policy));
    assert!(SettingsPolicyEngine::is_eligible_for_retention_purge("call_recordings", 120, &policy));

    // Invoices: 7 years (2555 days)
    assert!(!SettingsPolicyEngine::is_eligible_for_retention_purge("invoices", 2000, &policy));
    assert!(SettingsPolicyEngine::is_eligible_for_retention_purge("invoices", 2555, &policy));

    // When legal hold is active, nothing is eligible for purge
    policy.legal_hold_active = true;
    assert!(!SettingsPolicyEngine::is_eligible_for_retention_purge("call_recordings", 500, &policy));
    assert!(!SettingsPolicyEngine::is_eligible_for_retention_purge("invoices", 3000, &policy));
}
