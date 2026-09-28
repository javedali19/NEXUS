use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ============================================================================
// 1. Customer & Identity Lifecycle Events
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CustomerCreatedV1 {
    pub customer_id: Uuid,
    pub account_id: Option<Uuid>,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub lifecycle_stage: String,
    pub lead_score: i32,
    pub created_by: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CustomerLifecycleChangedV1 {
    pub customer_id: Uuid,
    pub previous_stage: String,
    pub new_stage: String,
    pub updated_by: Option<Uuid>,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ContactUpdatedV1 {
    pub contact_id: Uuid,
    pub company_id: Option<Uuid>,
    pub email: String,
    pub phone: Option<String>,
    pub title: Option<String>,
    pub updated_fields: Vec<String>,
}

// ============================================================================
// 2. Sales & CRM Events
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DealCreatedV1 {
    pub deal_id: Uuid,
    pub company_id: Option<Uuid>,
    pub contact_id: Option<Uuid>,
    pub title: String,
    pub amount: f64,
    pub currency: String,
    pub stage: String,
    pub pipeline: String,
    pub owner_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DealStageAdvancedV1 {
    pub deal_id: Uuid,
    pub old_stage: String,
    pub new_stage: String,
    pub probability: f64,
    pub expected_close_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct QuoteAcceptedV1 {
    pub quote_id: Uuid,
    pub deal_id: Option<Uuid>,
    pub total_amount: f64,
    pub currency: String,
    pub accepted_by_contact_id: Option<Uuid>,
    pub accepted_at: DateTime<Utc>,
}

// ============================================================================
// 3. ERP, Billing & Payments Events
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoiceCreatedV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub invoice_number: String,
    pub total_amount: f64,
    pub currency: String,
    pub due_date: DateTime<Utc>,
    pub created_by: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoiceUpdatedV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub invoice_number: String,
    pub updated_fields: Vec<String>,
    pub total_amount: f64,
    pub updated_by: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoiceIssuedV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub invoice_number: String,
    pub subtotal: f64,
    pub tax_amount: f64,
    pub total_amount: f64,
    pub currency: String,
    pub due_date: DateTime<Utc>,
    pub line_items_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoiceSentV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub invoice_number: String,
    pub channel: String, // "email", "whatsapp", "portal", "sms"
    pub recipient: String,
    pub sent_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoicePartiallyPaidV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub payment_id: Uuid,
    pub amount_paid: f64,
    pub total_paid_to_date: f64,
    pub remaining_balance: f64,
    pub currency: String,
    pub payment_method: String,
    pub settled_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoicePaidV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub payment_id: Uuid,
    pub total_amount: f64,
    pub currency: String,
    pub payment_method: String,
    pub settled_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoiceOverdueV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub invoice_number: String,
    pub balance_due: f64,
    pub due_date: DateTime<Utc>,
    pub days_overdue: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoiceCancelledV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub invoice_number: String,
    pub reason: String,
    pub cancelled_by: Option<Uuid>,
    pub cancelled_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentReceivedV1 {
    pub payment_id: Uuid,
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub amount: f64,
    pub currency: String,
    pub payment_method: String,
    pub transaction_reference: String,
    pub settled_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentIntentCreatedV1 {
    pub payment_id: Uuid,
    pub customer_id: Uuid,
    pub provider: String,
    pub amount: f64,
    pub currency: String,
    pub order_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentAttemptFailedV1 {
    pub customer_id: Uuid,
    pub provider: String,
    pub amount: f64,
    pub currency: String,
    pub decline_code: Option<String>,
    pub decline_reason: String,
    pub retry_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentAllocatedV1 {
    pub payment_id: Uuid,
    pub customer_id: Uuid,
    pub invoice_id: Uuid,
    pub allocated_amount: f64,
    pub invoice_remaining_balance: f64,
    pub is_invoice_settled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentRefundedV1 {
    pub refund_id: Uuid,
    pub payment_id: Uuid,
    pub customer_id: Uuid,
    pub refund_amount: f64,
    pub currency: String,
    pub reason: String,
    pub refunded_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentDisputedV1 {
    pub dispute_id: Uuid,
    pub payment_id: Uuid,
    pub customer_id: Uuid,
    pub dispute_amount: f64,
    pub currency: String,
    pub reason_code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentLinkGeneratedV1 {
    pub link_id: Uuid,
    pub customer_id: Uuid,
    pub amount: f64,
    pub currency: String,
    pub slug: String,
    pub hosted_url: String,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentLinkSettledV1 {
    pub link_id: Uuid,
    pub payment_id: Uuid,
    pub customer_id: Uuid,
    pub settled_amount: f64,
    pub settled_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentReconciledV1 {
    pub reconciliation_id: Uuid,
    pub payment_id: Uuid,
    pub provider: String,
    pub payout_batch_id: Option<String>,
    pub cleared_amount: f64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CollectionsEscalatedV1 {
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub overdue_days: i32,
    pub amount_due: f64,
    pub escalation_level: String, // e.g. "gentle_reminder", "phone_outreach", "legal_notice"
    pub assigned_agent_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AccountingConnectionLinkedV1 {
    pub connection_id: Uuid,
    pub provider: String,
    pub external_tenant_id: Option<String>,
    pub realm_id: Option<String>,
    pub authorized_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AccountingSyncInitiatedV1 {
    pub sync_batch_id: Uuid,
    pub provider: String,
    pub entities: Vec<String>,
    pub initiated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AccountingEntitySyncedV1 {
    pub sync_batch_id: Uuid,
    pub provider: String,
    pub entity_type: String,
    pub local_id: Uuid,
    pub remote_id: String,
    pub direction: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AccountingSyncCompletedV1 {
    pub sync_batch_id: Uuid,
    pub provider: String,
    pub total_processed: usize,
    pub total_created: usize,
    pub total_updated: usize,
    pub total_failed: usize,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AccountingSyncFailedV1 {
    pub sync_batch_id: Uuid,
    pub provider: String,
    pub error_message: String,
    pub retry_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AccountingDiscrepancyFoundV1 {
    pub provider: String,
    pub entity_type: String,
    pub local_id: Uuid,
    pub remote_id: String,
    pub erp_amount: f64,
    pub accounting_amount: f64,
    pub discrepancy: f64,
}

// ============================================================================
// 4. AI Telephony & Omnichannel Events
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CallCompletedV1 {
    pub call_id: Uuid,
    pub customer_id: Option<Uuid>,
    pub agent_id: Option<Uuid>,
    pub direction: String, // "inbound" or "outbound"
    pub duration_seconds: i32,
    pub recording_url: Option<String>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SentimentAnalyzedV1 {
    pub call_id: Uuid,
    pub customer_id: Option<Uuid>,
    pub sentiment_score: f64, // -1.0 to +1.0
    pub sentiment_label: String, // "positive", "neutral", "negative"
    pub topics_extracted: Vec<String>,
    pub intent_detected: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WhatsAppMessageReceivedV1 {
    pub conversation_id: Uuid,
    pub message_id: Uuid,
    pub customer_id: Option<Uuid>,
    pub sender_phone: String,
    pub text_body: String,
    pub has_media: bool,
}

// ============================================================================
// 5. Document & OCR Events
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvoiceOcrExtractedV1 {
    pub extraction_id: Uuid,
    pub document_id: Uuid,
    pub vendor_name: String,
    pub detected_invoice_number: Option<String>,
    pub detected_total: f64,
    pub confidence_score: f64,
    pub line_items_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DocumentVerifiedV1 {
    pub document_id: Uuid,
    pub verified_by: Uuid,
    pub status: String, // "verified", "rejected", "flagged"
    pub notes: Option<String>,
}

// ============================================================================
// 6. Privacy & Consent Events (GDPR / TCPA)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ConsentGrantedV1 {
    pub consent_id: Uuid,
    pub customer_id: Uuid,
    pub consent_type: String, // "marketing_email", "sms", "voice_ai_recording", "whatsapp"
    pub channel: String,
    pub ip_address: Option<String>,
    pub valid_until: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ConsentRevokedV1 {
    pub consent_id: Uuid,
    pub customer_id: Uuid,
    pub consent_type: String,
    pub channel: String,
    pub revocation_reason: Option<String>,
}

// ============================================================================
// 7. Workflows & AI Autonomous Agent Runs
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkflowTriggeredV1 {
    pub execution_id: Uuid,
    pub workflow_id: Uuid,
    pub triggering_event_id: Uuid,
    pub trigger_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AgentActionExecutedV1 {
    pub action_id: Uuid,
    pub agent_run_id: Uuid,
    pub action_type: String,
    pub tool_name: String,
    pub duration_ms: u64,
    pub is_success: bool,
}
