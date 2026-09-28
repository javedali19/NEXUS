use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Lifecycle statuses for a payment transaction
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentStatus {
    Pending,
    Authorized,
    Succeeded,
    Failed,
    PartiallyRefunded,
    Refunded,
    Disputed,
    Cancelled,
}

impl PaymentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Authorized => "authorized",
            Self::Succeeded => "succeeded",
            Self::Failed => "failed",
            Self::PartiallyRefunded => "partially_refunded",
            Self::Refunded => "refunded",
            Self::Disputed => "disputed",
            Self::Cancelled => "cancelled",
        }
    }
}

/// Supported payment provider gateways
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentProviderType {
    Razorpay,
    Stripe,
    HitPay,
    Airwallex,
    Cashfree,
    ManualWire,
    Ach,
}

impl PaymentProviderType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Razorpay => "razorpay",
            Self::Stripe => "stripe",
            Self::HitPay => "hitpay",
            Self::Airwallex => "airwallex",
            Self::Cashfree => "cashfree",
            Self::ManualWire => "manual_wire",
            Self::Ach => "ach",
        }
    }
}

/// Status of Bank & Gateway Payout Reconciliation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReconciliationStatus {
    Unreconciled,
    AutoMatched,
    ManualMatched,
    Disputed,
    Chargeback,
    Refunded,
    SettledToLedger,
}

/// Core Payment Transaction Entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PaymentTransaction {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub customer_id: Uuid,
    pub account_id: Option<Uuid>,
    pub transaction_number: String,
    pub provider: String,
    pub provider_transaction_id: Option<String>,
    pub provider_order_id: Option<String>,
    pub amount: f64,
    pub currency: String,
    pub fee_amount: f64,
    pub net_amount: f64,
    pub status: String,
    pub payment_method: String,
    pub payment_method_details: serde_json::Value,
    pub allocated_amount: f64,
    pub unallocated_amount: f64,
    pub authorized_at: Option<DateTime<Utc>>,
    pub settled_at: Option<DateTime<Utc>>,
    pub failed_at: Option<DateTime<Utc>>,
    pub refunded_at: Option<DateTime<Utc>>,
    pub description: Option<String>,
    pub metadata: serde_json::Value,
    pub recorded_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Allocation of funds to a specific invoice or deposit
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PaymentAllocation {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub payment_id: Uuid,
    pub invoice_id: Option<Uuid>,
    pub allocated_amount: f64,
    pub currency: String,
    pub allocation_type: String,
    pub notes: Option<String>,
    pub allocated_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

/// Hosted Checkout Payment Link
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PaymentLink {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub customer_id: Uuid,
    pub invoice_id: Option<Uuid>,
    pub link_token: String,
    pub slug: String,
    pub title: String,
    pub description: Option<String>,
    pub amount: f64,
    pub currency: String,
    pub status: String,
    pub allowed_providers: Vec<String>,
    pub qr_payload: Option<String>,
    pub hosted_url: String,
    pub expires_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub completed_payment_id: Option<Uuid>,
    pub dispatched_via: Option<String>,
    pub dispatched_to: Option<String>,
    pub views_count: i32,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

/// Gateway Attempt Log
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PaymentAttempt {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub payment_id: Option<Uuid>,
    pub customer_id: Uuid,
    pub provider: String,
    pub attempt_number: i32,
    pub status: String,
    pub amount: f64,
    pub currency: String,
    pub gateway_response_code: Option<String>,
    pub decline_code: Option<String>,
    pub decline_reason: Option<String>,
    pub error_category: Option<String>,
    pub latency_ms: i32,
    pub raw_request_payload: serde_json::Value,
    pub raw_response_payload: serde_json::Value,
    pub retry_scheduled_at: Option<DateTime<Utc>>,
    pub next_fallback_provider: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Reconciliation Entry
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PaymentReconciliation {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub payment_id: Uuid,
    pub provider: String,
    pub payout_batch_id: Option<String>,
    pub bank_statement_reference: Option<String>,
    pub status: String,
    pub expected_amount: f64,
    pub cleared_amount: f64,
    pub difference_amount: f64,
    pub currency: String,
    pub matched_at: Option<DateTime<Utc>>,
    pub matched_by: Option<Uuid>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

// ============================================================================
// DTOs
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePaymentDto {
    pub customer_id: Uuid,
    pub account_id: Option<Uuid>,
    pub amount: f64,
    pub currency: String,
    pub provider: PaymentProviderType,
    pub payment_method: String,
    pub transaction_reference: Option<String>,
    pub description: Option<String>,
    pub allocations: Option<Vec<CreateAllocationItemDto>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAllocationItemDto {
    pub invoice_id: Uuid,
    pub amount: f64,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePaymentLinkDto {
    pub customer_id: Uuid,
    pub invoice_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub amount: f64,
    pub currency: String,
    pub expires_in_days: Option<i64>,
    pub allowed_providers: Option<Vec<PaymentProviderType>>,
    pub dispatch_channel: Option<String>, // "whatsapp", "email", "sms"
    pub recipient: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AllocationResult {
    pub total_allocated: f64,
    pub unallocated_balance: f64,
    pub invoice_updates: Vec<InvoiceAllocationSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvoiceAllocationSummary {
    pub invoice_id: Uuid,
    pub allocated_amount: f64,
    pub remaining_balance: f64,
    pub is_settled: bool,
}

// ============================================================================
// Pure Calculation & Allocation Engine
// ============================================================================

pub fn calculate_payment_allocations(
    total_payment_amount: f64,
    requested_allocations: &[(Uuid, f64, f64)], // (invoice_id, invoice_balance_due, desired_allocation)
) -> AllocationResult {
    let mut available_funds = total_payment_amount.max(0.0);
    let mut total_allocated = 0.0;
    let mut invoice_updates = Vec::new();

    for (invoice_id, balance_due, desired) in requested_allocations {
        let max_allocable = (*desired).min(*balance_due).min(available_funds).max(0.0);
        let remaining_invoice_bal = (*balance_due - max_allocable).max(0.0);
        let is_settled = remaining_invoice_bal <= 0.001;

        total_allocated += max_allocable;
        available_funds = (available_funds - max_allocable).max(0.0);

        invoice_updates.push(InvoiceAllocationSummary {
            invoice_id: *invoice_id,
            allocated_amount: (max_allocable * 100.0).round() / 100.0,
            remaining_balance: (remaining_invoice_bal * 100.0).round() / 100.0,
            is_settled,
        });
    }

    AllocationResult {
        total_allocated: (total_allocated * 100.0).round() / 100.0,
        unallocated_balance: (available_funds * 100.0).round() / 100.0,
        invoice_updates,
    }
}
