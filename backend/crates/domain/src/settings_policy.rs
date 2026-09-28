use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ============================================================================
// Enterprise Settings & Policy Center Domain Models
// ============================================================================

/// 1. Organization Profile Settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrganizationProfile {
    pub legal_name: String,
    pub trading_name: String,
    pub tax_identifier: String,
    pub tax_authority: String,
    pub domain: String,
    pub hq_address: String,
    pub contact_email: String,
    pub contact_phone: String,
    pub base_currency: String,
    pub brand_primary_color: String,
    pub brand_dark_mode: bool,
}

/// 2. Business Unit Configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessUnitConfig {
    pub code: String,
    pub name: String,
    pub region: String,
    pub branch_code: String,
    pub currency: String,
    pub manager_name: String,
    pub manager_email: String,
    pub is_default: bool,
    pub status: String, // 'active', 'inactive'
}

/// 3. User Roster Summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSummary {
    pub user_id: Uuid,
    pub full_name: String,
    pub email: String,
    pub role_key: String,
    pub business_unit_code: String,
    pub mfa_enabled: bool,
    pub sso_provider: String,
    pub status: String, // 'active', 'suspended', 'invited'
    pub last_active_at: Option<DateTime<Utc>>,
}

/// 4. RBAC Role Definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleDefinition {
    pub role_key: String,
    pub name: String,
    pub description: String,
    pub is_system: bool,
    pub member_count: usize,
    pub permissions: Vec<String>,
}

/// 5. Permission Rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionRule {
    pub module_key: String, // 'crm', 'erp', 'billing', 'telephony', 'support', 'ai_agents', 'workflows', 'audit', 'settings'
    pub action: String,     // 'view', 'create', 'edit', 'delete', 'export_pii', 'administer'
    pub allowed_roles: Vec<String>,
}

/// 6. Consent & Privacy Policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentPolicy {
    pub gdpr_enabled: bool,
    pub pdpa_singapore_enabled: bool,
    pub pdpa_thailand_enabled: bool,
    pub voice_recording_consent_required: bool,
    pub whatsapp_opt_in_required: bool,
    pub sms_mandatory_opt_out_keyword: String,
    pub consent_retention_months: u32,
    pub require_explicit_dunning_consent: bool,
}

/// 7. Integrations Governance Summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationsGovernance {
    pub total_connectors: usize,
    pub active_connectors: usize,
    pub secret_manager_enforced: bool,
    pub secret_manager_vault_uri: String,
    pub security_notice: String,
}

/// 8. Omnichannel Notification Routing Policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationRoutingPolicy {
    pub default_email_recipient: String,
    pub slack_webhook_configured: bool,
    pub slack_channel: String,
    pub sms_urgent_pager_number: String,
    pub notify_on_payment_failure: bool,
    pub notify_on_dnc_violation: bool,
    pub notify_on_sla_breach: bool,
    pub notify_on_ai_guardrail_trip: bool,
    pub quiet_hours_start: String,
    pub quiet_hours_end: String,
    pub quiet_hours_timezone: String,
}

/// 9. Security Policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityPolicy {
    pub mfa_enforced: bool,
    pub min_password_length: u8,
    pub require_special_characters: bool,
    pub session_idle_timeout_minutes: u32,
    pub max_concurrent_sessions_per_user: u8,
    pub ip_whitelisting_enabled: bool,
    pub allowed_cidr_blocks: Vec<String>,
    pub sso_provider: String,
    pub sso_enforced: bool,
    pub saml_entity_id: String,
    pub token_signing_algorithm: String,
    pub token_expiry_hours: u32,
}

/// 10. Audit Policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditPolicy {
    pub immutable_append_only: bool,
    pub sha256_hash_chaining: bool,
    pub log_level: String, // 'INFO', 'WARN', 'SECURITY'
    pub tamper_detection_enabled: bool,
    pub siem_syslog_forwarding_enabled: bool,
    pub siem_endpoint: String,
    pub alert_on_bulk_export: bool,
}

/// 11. Data Retention Policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionPolicy {
    pub tax_invoices_retention_years: u8,
    pub payments_retention_years: u8,
    pub call_recordings_retention_days: u32,
    pub ai_transcripts_retention_days: u32,
    pub support_tickets_retention_years: u8,
    pub audit_logs_retention_years: u8,
    pub auto_purge_action: String, // 'cold_archive', 'soft_delete', 'hard_purge'
    pub legal_hold_active: bool,
}

/// 12. DNC (Do Not Call) Policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DncPolicy {
    pub enforce_singapore_pdpc_dnc: bool,
    pub enforce_malaysia_mcmc_dnc: bool,
    pub enforce_thailand_nbtc_dnc: bool,
    pub cooling_off_period_days: u32,
    pub hard_block_telephony_on_dnc: bool,
    pub allow_agent_override: bool,
    pub opt_out_keywords: Vec<String>,
}

/// 13. Regional Configuration Settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegionalSettings {
    pub default_country_pack: String, // 'SG', 'MY', 'TH'
    pub available_country_packs: Vec<String>,
    pub base_reporting_currency: String,
    pub calendar_system: String, // 'gregorian', 'buddhist_era'
    pub date_format: String,
    pub time_format: String,
    pub number_format: String,
}

/// 14. AI Governance Policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiGovernancePolicy {
    pub allowed_models: Vec<String>,
    pub max_temperature_cap: f64,
    pub pii_redactor_enabled: bool,
    pub redact_credit_cards: bool,
    pub redact_nric_and_tin: bool,
    pub prompt_injection_defense: bool,
    pub adversarial_score_threshold: f64,
    pub escalate_on_sentiment_threshold: f64,
    pub escalate_on_dispute_amount_threshold: f64,
    pub prohibit_executive_deepfakes: bool,
}

/// 15. Workflow Governance Policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowGovernancePolicy {
    pub max_concurrent_executions: u32,
    pub step_timeout_seconds: u32,
    pub max_retries: u8,
    pub retry_backoff_base_seconds: u32,
    pub circuit_breaker_error_threshold_percent: u8,
    pub emergency_killswitch_active: bool,
    pub auto_route_failed_to_exceptions: bool,
}

/// 16. Billing Metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeteredUsageCounter {
    pub used: u64,
    pub limit: u64,
    pub unit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BillingMetadata {
    pub plan_tier: String,
    pub plan_name: String,
    pub billing_cycle: String,
    pub current_period_start: DateTime<Utc>,
    pub current_period_end: DateTime<Utc>,
    pub payment_method: String,
    pub payment_method_last4: String,
    pub billing_email: String,
    pub vat_reverse_charge_applicable: bool,
    pub ai_tokens: MeteredUsageCounter,
    pub voice_minutes: MeteredUsageCounter,
    pub whatsapp_conversations: MeteredUsageCounter,
    pub ocr_pages: MeteredUsageCounter,
}

/// Master Settings and Policy Center Envelope
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MasterSettingsPolicyEnvelope {
    pub organization_id: Uuid,
    pub organization_profile: OrganizationProfile,
    pub business_units: Vec<BusinessUnitConfig>,
    pub consent_policy: ConsentPolicy,
    pub notification_policy: NotificationRoutingPolicy,
    pub security_policy: SecurityPolicy,
    pub audit_policy: AuditPolicy,
    pub retention_policy: RetentionPolicy,
    pub dnc_policy: DncPolicy,
    pub regional_policy: RegionalSettings,
    pub ai_policy: AiGovernancePolicy,
    pub workflow_policy: WorkflowGovernancePolicy,
    pub billing_metadata: BillingMetadata,
    pub updated_at: DateTime<Utc>,
}

// ============================================================================
// Settings & Policy Engine
// ============================================================================

pub struct SettingsPolicyEngine;

impl SettingsPolicyEngine {
    /// Generates default production settings and policy envelope for an organization
    pub fn default_settings_envelope(org_id: Uuid) -> MasterSettingsPolicyEnvelope {
        let now = Utc::now();
        MasterSettingsPolicyEnvelope {
            organization_id: org_id,
            organization_profile: OrganizationProfile {
                legal_name: "Acme Global Solutions Pte Ltd".to_string(),
                trading_name: "Acme Global Solutions".to_string(),
                tax_identifier: "201812345M".to_string(),
                tax_authority: "IRAS".to_string(),
                domain: "acmeglobal.com".to_string(),
                hq_address: "1 Marina Boulevard, #28-00, Marina Bay Financial Centre, Singapore 018989".to_string(),
                contact_email: "admin@acmeglobal.com".to_string(),
                contact_phone: "+65 6789 0123".to_string(),
                base_currency: "SGD".to_string(),
                brand_primary_color: "#0ea5e9".to_string(),
                brand_dark_mode: true,
            },
            business_units: vec![
                BusinessUnitConfig {
                    code: "BU-SG-HQ".to_string(),
                    name: "Singapore APAC Headquarters".to_string(),
                    region: "Singapore".to_string(),
                    branch_code: "00000".to_string(),
                    currency: "SGD".to_string(),
                    manager_name: "Alex Morgan".to_string(),
                    manager_email: "alex.morgan@acmeglobal.com".to_string(),
                    is_default: true,
                    status: "active".to_string(),
                },
                BusinessUnitConfig {
                    code: "BU-MY-OPS".to_string(),
                    name: "Malaysia Operations Branch".to_string(),
                    region: "Malaysia".to_string(),
                    branch_code: "00001".to_string(),
                    currency: "MYR".to_string(),
                    manager_name: "Siti Nurhaliza".to_string(),
                    manager_email: "siti.my@acmeglobal.com".to_string(),
                    is_default: false,
                    status: "active".to_string(),
                },
                BusinessUnitConfig {
                    code: "BU-TH-RET".to_string(),
                    name: "Thailand Commercial & Retail".to_string(),
                    region: "Thailand".to_string(),
                    branch_code: "00002".to_string(),
                    currency: "THB".to_string(),
                    manager_name: "Somchai Prasert".to_string(),
                    manager_email: "somchai.th@acmeglobal.com".to_string(),
                    is_default: false,
                    status: "active".to_string(),
                },
            ],
            consent_policy: ConsentPolicy {
                gdpr_enabled: true,
                pdpa_singapore_enabled: true,
                pdpa_thailand_enabled: true,
                voice_recording_consent_required: true,
                whatsapp_opt_in_required: true,
                sms_mandatory_opt_out_keyword: "STOP".to_string(),
                consent_retention_months: 24,
                require_explicit_dunning_consent: true,
            },
            notification_policy: NotificationRoutingPolicy {
                default_email_recipient: "ops-alerts@acmeglobal.com".to_string(),
                slack_webhook_configured: true,
                slack_channel: "#secops-monitoring".to_string(),
                sms_urgent_pager_number: "+65 9123 4567".to_string(),
                notify_on_payment_failure: true,
                notify_on_dnc_violation: true,
                notify_on_sla_breach: true,
                notify_on_ai_guardrail_trip: true,
                quiet_hours_start: "22:00".to_string(),
                quiet_hours_end: "07:00".to_string(),
                quiet_hours_timezone: "Asia/Singapore".to_string(),
            },
            security_policy: SecurityPolicy {
                mfa_enforced: true,
                min_password_length: 14,
                require_special_characters: true,
                session_idle_timeout_minutes: 30,
                max_concurrent_sessions_per_user: 3,
                ip_whitelisting_enabled: false,
                allowed_cidr_blocks: vec!["203.0.113.0/24".to_string(), "198.51.100.0/24".to_string()],
                sso_provider: "google_identity_platform".to_string(),
                sso_enforced: false,
                saml_entity_id: "urn:acmeglobal:auth:saml2".to_string(),
                token_signing_algorithm: "Ed25519".to_string(),
                token_expiry_hours: 24,
            },
            audit_policy: AuditPolicy {
                immutable_append_only: true,
                sha256_hash_chaining: true,
                log_level: "INFO".to_string(),
                tamper_detection_enabled: true,
                siem_syslog_forwarding_enabled: false,
                siem_endpoint: "syslog.corp.acmeglobal.com:6514".to_string(),
                alert_on_bulk_export: true,
            },
            retention_policy: RetentionPolicy {
                tax_invoices_retention_years: 7,
                payments_retention_years: 7,
                call_recordings_retention_days: 90,
                ai_transcripts_retention_days: 180,
                support_tickets_retention_years: 3,
                audit_logs_retention_years: 7,
                auto_purge_action: "cold_archive".to_string(),
                legal_hold_active: false,
            },
            dnc_policy: DncPolicy {
                enforce_singapore_pdpc_dnc: true,
                enforce_malaysia_mcmc_dnc: true,
                enforce_thailand_nbtc_dnc: true,
                cooling_off_period_days: 30,
                hard_block_telephony_on_dnc: true,
                allow_agent_override: false,
                opt_out_keywords: vec![
                    "STOP".to_string(),
                    "BATAL".to_string(),
                    "ยกเลิก".to_string(),
                    "UNSUBSCRIBE".to_string(),
                ],
            },
            regional_policy: RegionalSettings {
                default_country_pack: "SG".to_string(),
                available_country_packs: vec!["SG".to_string(), "MY".to_string(), "TH".to_string()],
                base_reporting_currency: "SGD".to_string(),
                calendar_system: "gregorian".to_string(),
                date_format: "YYYY-MM-DD".to_string(),
                time_format: "24h".to_string(),
                number_format: "en-SG".to_string(),
            },
            ai_policy: AiGovernancePolicy {
                allowed_models: vec![
                    "claude-3-5-sonnet".to_string(),
                    "gemini-1-5-pro".to_string(),
                    "gpt-4o".to_string(),
                ],
                max_temperature_cap: 0.5,
                pii_redactor_enabled: true,
                redact_credit_cards: true,
                redact_nric_and_tin: true,
                prompt_injection_defense: true,
                adversarial_score_threshold: 0.85,
                escalate_on_sentiment_threshold: -0.65,
                escalate_on_dispute_amount_threshold: 2500.0,
                prohibit_executive_deepfakes: true,
            },
            workflow_policy: WorkflowGovernancePolicy {
                max_concurrent_executions: 500,
                step_timeout_seconds: 300,
                max_retries: 5,
                retry_backoff_base_seconds: 2,
                circuit_breaker_error_threshold_percent: 15,
                emergency_killswitch_active: false,
                auto_route_failed_to_exceptions: true,
            },
            billing_metadata: BillingMetadata {
                plan_tier: "enterprise_sea_unlimited".to_string(),
                plan_name: "Enterprise SEA Unlimited".to_string(),
                billing_cycle: "annual".to_string(),
                current_period_start: now,
                current_period_end: now + chrono::Duration::days(365),
                payment_method: "DBS Corporate Direct Debit (FAST)".to_string(),
                payment_method_last4: "4242".to_string(),
                billing_email: "finance@acmeglobal.com".to_string(),
                vat_reverse_charge_applicable: false,
                ai_tokens: MeteredUsageCounter {
                    used: 14_250_000,
                    limit: 50_000_000,
                    unit: "tokens".to_string(),
                },
                voice_minutes: MeteredUsageCounter {
                    used: 8_450,
                    limit: 25_000,
                    unit: "minutes".to_string(),
                },
                whatsapp_conversations: MeteredUsageCounter {
                    used: 4_320,
                    limit: 10_000,
                    unit: "sessions".to_string(),
                },
                ocr_pages: MeteredUsageCounter {
                    used: 1_890,
                    limit: 5_000,
                    unit: "pages".to_string(),
                },
            },
            updated_at: now,
        }
    }

    /// Evaluates if an outbound phone call is blocked under tenant DNC policy and active suppression list
    pub fn evaluate_dnc_dialing_eligibility(
        phone: &str,
        dnc_policy: &DncPolicy,
        is_suppressed: bool,
    ) -> Result<(), &'static str> {
        if is_suppressed {
            return Err("Phone number is present in active DNC suppression list");
        }
        if dnc_policy.hard_block_telephony_on_dnc && phone.is_empty() {
            return Err("Invalid destination phone number");
        }
        Ok(())
    }

    /// Checks if a role has permission to execute an action on a module
    pub fn check_rbac_permission(
        role_key: &str,
        module_key: &str,
        action: &str,
    ) -> bool {
        match role_key {
            "super_admin" | "tenant_admin" => true,
            "finance_controller" => match module_key {
                "erp" | "billing" | "payments" | "audit" => true,
                "crm" => action == "view",
                _ => false,
            },
            "sales_director" => match module_key {
                "crm" | "telephony" | "ai_agents" => true,
                "billing" => action == "view",
                _ => false,
            },
            "support_lead" => match module_key {
                "support" | "telephony" | "ai_agents" => true,
                "crm" => action == "view",
                _ => false,
            },
            "compliance_auditor" => match module_key {
                "audit" | "retention" | "dnc" | "consent" => action == "view" || action == "export_pii",
                _ => false,
            },
            "read_only_observer" => action == "view",
            _ => false,
        }
    }

    /// Evaluates data retention eligibility (returns true if eligible for purge/archive)
    pub fn is_eligible_for_retention_purge(
        entity_type: &str,
        age_in_days: u32,
        policy: &RetentionPolicy,
    ) -> bool {
        if policy.legal_hold_active {
            return false;
        }
        match entity_type {
            "call_recordings" => age_in_days >= policy.call_recordings_retention_days,
            "ai_transcripts" => age_in_days >= policy.ai_transcripts_retention_days,
            "invoices" => age_in_days >= (policy.tax_invoices_retention_years as u32 * 365),
            "payments" => age_in_days >= (policy.payments_retention_years as u32 * 365),
            "support_tickets" => age_in_days >= (policy.support_tickets_retention_years as u32 * 365),
            "audit_logs" => age_in_days >= (policy.audit_logs_retention_years as u32 * 365),
            _ => false,
        }
    }
}
