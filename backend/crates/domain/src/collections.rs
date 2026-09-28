use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use platform_common::PlatformError;

/// Customer Market Segment Classification.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CustomerSegment {
    EnterpriseTier1,
    MidMarket,
    Smb,
    HighRisk,
}

/// Collections Policy Action.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CollectionsAction {
    WhatsApp,
    PaymentLink,
    Task,
    Reminder,
    Call,
    Escalation,
    Pause,
    Exception,
}

/// Reason an Action Was Suppressed by Compliance / Policy Guards.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SuppressionReason {
    DncRegistered,
    OutsideCommunicationWindow,
    PtpActive,
    CoolingOffActive,
    NoConsent,
    DisputeActive,
    StrategicAccountExemption,
}

/// Promise-to-Pay Commitment Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PtpStatus {
    Pending,
    Honored,
    Broken,
    Cancelled,
}

/// Promise-to-Pay Record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromiseToPay {
    pub id: Uuid,
    pub case_id: Uuid,
    pub ptp_amount: f64,
    pub promised_date: NaiveDate,
    pub status: PtpStatus,
    pub notes: Option<String>,
}

/// Channel Opt-In Consent Context.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerConsentContext {
    pub whatsapp_opt_in: bool,
    pub voice_opt_in: bool,
    pub email_opt_in: bool,
}

impl Default for CustomerConsentContext {
    fn default() -> Self {
        Self {
            whatsapp_opt_in: true,
            voice_opt_in: true,
            email_opt_in: true,
        }
    }
}

/// Full Debtor Context evaluated against Policy Rules.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerCollectionsContext {
    pub customer_id: Uuid,
    pub customer_name: String,
    pub segment: CustomerSegment,
    pub payment_history_score: i32, // 0 to 100
    pub consent: CustomerConsentContext,
    pub is_dnc_registered: bool, // Do Not Call list
    pub country: String,         // "US", "IN", "GB", etc.
    pub recipient_local_hour: u32, // 0 - 23
    pub recipient_is_weekend: bool,
    pub last_contacted_at: Option<DateTime<Utc>>,
    pub active_ptp: Option<PromiseToPay>,
    pub is_under_dispute: bool,
}

/// Evaluated Invoice Debt Summary.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvoiceCollectionsContext {
    pub invoice_id: Uuid,
    pub invoice_number: String,
    pub days_past_due: i32,
    pub overdue_amount: f64,
}

/// Evaluated Policy Outcome.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyEvaluationOutcome {
    pub action: CollectionsAction,
    pub is_suppressed: bool,
    pub suppression_reason: Option<SuppressionReason>,
    pub scheduled_for_next_window: bool,
    pub explanation: String,
    pub recipient_channel: Option<String>,
    pub priority: i32, // 1 (Highest) to 10
}

/// Collections Policy Engine.
pub struct CollectionsPolicyEngine;

impl CollectionsPolicyEngine {
    /// Determines whether the recipient's local time is within compliant communication windows.
    /// US (TCPA): 08:00 - 21:00 local time
    /// India (TRAI): 09:00 - 21:00 IST
    /// Default fallback: 09:00 - 20:00
    pub fn is_within_communication_window(country: &str, hour: u32, is_weekend: bool) -> bool {
        match country.to_uppercase().as_str() {
            "US" => {
                // TCPA window 08:00 to 21:00
                (8..21).contains(&hour)
            }
            "IN" => {
                // TRAI UCC window 09:00 to 21:00 (strict no Sundays for commercial calls)
                if is_weekend {
                    false
                } else {
                    (9..21).contains(&hour)
                }
            }
            "GB" | "UK" => {
                // UK FCA Consumer Credit window 08:00 to 20:00 (Mon-Sat only)
                if is_weekend {
                    (9..17).contains(&hour)
                } else {
                    (8..20).contains(&hour)
                }
            }
            _ => (9..20).contains(&hour),
        }
    }

    /// Evaluates the 10 multi-criteria policy dimensions and determines the compliant action.
    pub fn evaluate(
        invoice: &InvoiceCollectionsContext,
        customer: &CustomerCollectionsContext,
        now: DateTime<Utc>,
    ) -> PolicyEvaluationOutcome {
        // ---------------------------------------------------------------------
        // 1. Check Active Promise-to-Pay (PTP)
        // ---------------------------------------------------------------------
        if let Some(ref ptp) = customer.active_ptp {
            if ptp.status == PtpStatus::Pending {
                let today = now.date_naive();
                if ptp.promised_date >= today {
                    // Active valid PTP in the future or today: PAUSE collection actions!
                    return PolicyEvaluationOutcome {
                        action: CollectionsAction::Pause,
                        is_suppressed: true,
                        suppression_reason: Some(SuppressionReason::PtpActive),
                        scheduled_for_next_window: false,
                        explanation: format!(
                            "Collection paused: Active Promise-to-Pay for ${:.2} due on {}.",
                            ptp.ptp_amount, ptp.promised_date
                        ),
                        recipient_channel: None,
                        priority: 9,
                    };
                } else {
                    // PTP date passed without payment -> BROKEN PTP! Immediate Escalation!
                    return PolicyEvaluationOutcome {
                        action: CollectionsAction::Escalation,
                        is_suppressed: false,
                        suppression_reason: None,
                        scheduled_for_next_window: false,
                        explanation: format!(
                            "Promise-to-Pay broken: Commitment for ${:.2} due on {} was not honored. Escalating immediately.",
                            ptp.ptp_amount, ptp.promised_date
                        ),
                        recipient_channel: Some("legal_finance_committee".into()),
                        priority: 1,
                    };
                }
            }
        }

        // ---------------------------------------------------------------------
        // 2. Check Active Billing Dispute
        // ---------------------------------------------------------------------
        if customer.is_under_dispute {
            return PolicyEvaluationOutcome {
                action: CollectionsAction::Pause,
                is_suppressed: true,
                suppression_reason: Some(SuppressionReason::DisputeActive),
                scheduled_for_next_window: false,
                explanation: "Collection paused: Invoice is under formal commercial dispute."
                    .into(),
                recipient_channel: None,
                priority: 8,
            };
        }

        // ---------------------------------------------------------------------
        // 3. Customer Segment Policy Routing
        // ---------------------------------------------------------------------
        // Enterprise Tier 1: NEVER trigger automated robocalls. Always assign Task or Exception to Account Director.
        if customer.segment == CustomerSegment::EnterpriseTier1 {
            if invoice.days_past_due > 60 || invoice.overdue_amount > 50000.0 {
                return PolicyEvaluationOutcome {
                    action: CollectionsAction::Task,
                    is_suppressed: false,
                    suppression_reason: None,
                    scheduled_for_next_window: false,
                    explanation: "Enterprise Tier 1 policy: Assigned high-priority review task to Strategic Account Director. Robocalls strictly prohibited.".into(),
                    recipient_channel: Some("internal_crm_task".into()),
                    priority: 2,
                };
            } else if invoice.days_past_due > 15 {
                return PolicyEvaluationOutcome {
                    action: CollectionsAction::PaymentLink,
                    is_suppressed: false,
                    suppression_reason: None,
                    scheduled_for_next_window: false,
                    explanation: "Enterprise Tier 1 policy: Generated discrete white-glove payment link email.".into(),
                    recipient_channel: Some("email".into()),
                    priority: 4,
                };
            } else {
                return PolicyEvaluationOutcome {
                    action: CollectionsAction::Reminder,
                    is_suppressed: false,
                    suppression_reason: None,
                    scheduled_for_next_window: false,
                    explanation: "Enterprise Tier 1 policy: Courtesy digital statement notification.".into(),
                    recipient_channel: Some("email".into()),
                    priority: 6,
                };
            }
        }

        // ---------------------------------------------------------------------
        // 4. Aging (DPD) & Overdue Amount Determination (SMB / Mid-Market / High-Risk)
        // ---------------------------------------------------------------------
        let base_action = if invoice.days_past_due > 90 || customer.segment == CustomerSegment::HighRisk && invoice.days_past_due > 45 {
            CollectionsAction::Escalation
        } else if invoice.days_past_due > 60 || invoice.overdue_amount >= 10000.0 {
            CollectionsAction::Call
        } else if invoice.days_past_due > 30 {
            CollectionsAction::WhatsApp
        } else if invoice.days_past_due > 14 {
            CollectionsAction::PaymentLink
        } else if invoice.days_past_due > 0 {
            CollectionsAction::Reminder
        } else {
            CollectionsAction::Pause
        };

        // ---------------------------------------------------------------------
        // 5. Evaluate Contact Frequency & Cooling-Off Period
        // ---------------------------------------------------------------------
        if let Some(last_contact) = customer.last_contacted_at {
            let elapsed_hours = (now - last_contact).num_hours();
            let required_cooldown = match customer.segment {
                CustomerSegment::HighRisk => 24,
                CustomerSegment::Smb => 48,
                CustomerSegment::MidMarket => 72,
                CustomerSegment::EnterpriseTier1 => 96,
            };

            if elapsed_hours < required_cooldown && base_action != CollectionsAction::Escalation {
                return PolicyEvaluationOutcome {
                    action: CollectionsAction::Pause,
                    is_suppressed: true,
                    suppression_reason: Some(SuppressionReason::CoolingOffActive),
                    scheduled_for_next_window: false,
                    explanation: format!(
                        "Contact suppressed by cooling-off rule: Last contact was {} hours ago (required: {} hours).",
                        elapsed_hours, required_cooldown
                    ),
                    recipient_channel: None,
                    priority: 7,
                };
            }
        }

        // ---------------------------------------------------------------------
        // 6. Regulatory Compliance Checks: DNC, Consent & Communication Windows
        // ---------------------------------------------------------------------
        let in_window = Self::is_within_communication_window(
            &customer.country,
            customer.recipient_local_hour,
            customer.recipient_is_weekend,
        );

        match base_action {
            CollectionsAction::Call => {
                // A. Check DNC
                if customer.is_dnc_registered {
                    // Suppress Call and divert to Task
                    return PolicyEvaluationOutcome {
                        action: CollectionsAction::Task,
                        is_suppressed: true,
                        suppression_reason: Some(SuppressionReason::DncRegistered),
                        scheduled_for_next_window: false,
                        explanation: "Telephony call BLOCKED: Recipient is registered on Do Not Call (DNC) list. Diverted to manual collector task."
                            .into(),
                        recipient_channel: Some("internal_task".into()),
                        priority: 2,
                    };
                }

                // B. Check Voice Consent
                if !customer.consent.voice_opt_in {
                    return PolicyEvaluationOutcome {
                        action: CollectionsAction::Task,
                        is_suppressed: true,
                        suppression_reason: Some(SuppressionReason::NoConsent),
                        scheduled_for_next_window: false,
                        explanation: "Voice call suppressed: Customer has not opted into voice contact. Diverted to internal task."
                            .into(),
                        recipient_channel: Some("internal_task".into()),
                        priority: 3,
                    };
                }

                // C. Check Communication Window
                if !in_window {
                    return PolicyEvaluationOutcome {
                        action: CollectionsAction::Call,
                        is_suppressed: true,
                        suppression_reason: Some(SuppressionReason::OutsideCommunicationWindow),
                        scheduled_for_next_window: true,
                        explanation: format!(
                            "Outbound call delayed: Local time ({:02}:00) in {} is outside compliant communication window. Scheduled for next morning window.",
                            customer.recipient_local_hour, customer.country
                        ),
                        recipient_channel: Some("voice".into()),
                        priority: 3,
                    };
                }

                PolicyEvaluationOutcome {
                    action: CollectionsAction::Call,
                    is_suppressed: false,
                    suppression_reason: None,
                    scheduled_for_next_window: false,
                    explanation: format!(
                        "Voice call permitted: Inside {} window ({:02}:00). DNC and consent verified.",
                        customer.country, customer.recipient_local_hour
                    ),
                    recipient_channel: Some("voice".into()),
                    priority: 2,
                }
            }

            CollectionsAction::WhatsApp => {
                // Check WhatsApp Consent
                if !customer.consent.whatsapp_opt_in {
                    return PolicyEvaluationOutcome {
                        action: CollectionsAction::Reminder,
                        is_suppressed: true,
                        suppression_reason: Some(SuppressionReason::NoConsent),
                        scheduled_for_next_window: false,
                        explanation: "WhatsApp suppressed: Recipient has not provided WhatsApp opt-in consent. Falling back to email statement."
                            .into(),
                        recipient_channel: Some("email".into()),
                        priority: 4,
                    };
                }

                // Check Window for messaging
                if !in_window {
                    return PolicyEvaluationOutcome {
                        action: CollectionsAction::WhatsApp,
                        is_suppressed: true,
                        suppression_reason: Some(SuppressionReason::OutsideCommunicationWindow),
                        scheduled_for_next_window: true,
                        explanation: format!(
                            "WhatsApp reminder queued: Local hour ({:02}:00) is outside conversational window. Queued for delivery at 09:00.",
                            customer.recipient_local_hour
                        ),
                        recipient_channel: Some("whatsapp".into()),
                        priority: 4,
                    };
                }

                PolicyEvaluationOutcome {
                    action: CollectionsAction::WhatsApp,
                    is_suppressed: false,
                    suppression_reason: None,
                    scheduled_for_next_window: false,
                    explanation: "Dispatched WhatsApp notification with direct payment link token."
                        .into(),
                    recipient_channel: Some("whatsapp".into()),
                    priority: 3,
                }
            }

            CollectionsAction::PaymentLink => PolicyEvaluationOutcome {
                action: CollectionsAction::PaymentLink,
                is_suppressed: false,
                suppression_reason: None,
                scheduled_for_next_window: false,
                explanation: "Generated secure instant checkout link and dispatched via digital statement."
                    .into(),
                recipient_channel: Some("email_payment_link".into()),
                priority: 5,
            },

            CollectionsAction::Reminder => PolicyEvaluationOutcome {
                action: CollectionsAction::Reminder,
                is_suppressed: false,
                suppression_reason: None,
                scheduled_for_next_window: false,
                explanation: "Dispatched courtesy digital reminder.".into(),
                recipient_channel: Some("email".into()),
                priority: 6,
            },

            CollectionsAction::Escalation => PolicyEvaluationOutcome {
                action: CollectionsAction::Escalation,
                is_suppressed: false,
                suppression_reason: None,
                scheduled_for_next_window: false,
                explanation: format!(
                    "Severity escalation triggered: Debt is {} days past due (${:.2}). Referred to credit committee.",
                    invoice.days_past_due, invoice.overdue_amount
                ),
                recipient_channel: Some("finance_management".into()),
                priority: 1,
            },

            CollectionsAction::Exception => PolicyEvaluationOutcome {
                action: CollectionsAction::Exception,
                is_suppressed: false,
                suppression_reason: None,
                scheduled_for_next_window: false,
                explanation: "Generated policy exception for manual credit remediation.".into(),
                recipient_channel: Some("exception_ledger".into()),
                priority: 1,
            },

            CollectionsAction::Task => PolicyEvaluationOutcome {
                action: CollectionsAction::Task,
                is_suppressed: false,
                suppression_reason: None,
                scheduled_for_next_window: false,
                explanation: "Assigned high-priority manual task to collections specialist.".into(),
                recipient_channel: Some("internal_task".into()),
                priority: 2,
            },

            CollectionsAction::Pause => PolicyEvaluationOutcome {
                action: CollectionsAction::Pause,
                is_suppressed: true,
                suppression_reason: None,
                scheduled_for_next_window: false,
                explanation: "Collections workflow in standby.".into(),
                recipient_channel: None,
                priority: 8,
            },
        }
    }
}
