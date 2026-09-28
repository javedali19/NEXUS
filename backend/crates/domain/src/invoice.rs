use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Formal Lifecycle Statuses for Platform Invoices
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InvoiceStatus {
    Draft,
    Issued,
    Sent,
    PartiallyPaid,
    Paid,
    Overdue,
    Cancelled,
}

impl InvoiceStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::Issued => "issued",
            Self::Sent => "sent",
            Self::PartiallyPaid => "partially_paid",
            Self::Paid => "paid",
            Self::Overdue => "overdue",
            Self::Cancelled => "cancelled",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(Self::Draft),
            "issued" => Some(Self::Issued),
            "sent" => Some(Self::Sent),
            "partially_paid" => Some(Self::PartiallyPaid),
            "paid" => Some(Self::Paid),
            "overdue" => Some(Self::Overdue),
            "cancelled" => Some(Self::Cancelled),
            _ => None,
        }
    }

    /// Validates allowed status transitions
    pub fn can_transition_to(&self, target: InvoiceStatus) -> bool {
        match (self, target) {
            (Self::Draft, Self::Issued) => true,
            (Self::Draft, Self::Cancelled) => true,
            (Self::Issued, Self::Sent) => true,
            (Self::Issued, Self::PartiallyPaid) => true,
            (Self::Issued, Self::Paid) => true,
            (Self::Issued, Self::Overdue) => true,
            (Self::Issued, Self::Cancelled) => true,
            (Self::Sent, Self::PartiallyPaid) => true,
            (Self::Sent, Self::Paid) => true,
            (Self::Sent, Self::Overdue) => true,
            (Self::Sent, Self::Cancelled) => true,
            (Self::PartiallyPaid, Self::Paid) => true,
            (Self::PartiallyPaid, Self::Overdue) => true,
            (Self::PartiallyPaid, Self::Cancelled) => true,
            (Self::Overdue, Self::PartiallyPaid) => true,
            (Self::Overdue, Self::Paid) => true,
            (Self::Overdue, Self::Cancelled) => true,
            _ => false,
        }
    }
}

/// Discount calculation mechanism
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DiscountType {
    Percentage,
    Fixed,
}

impl Default for DiscountType {
    fn default() -> Self {
        Self::Percentage
    }
}

/// Persistent Invoice Entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Invoice {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub business_unit_id: Option<Uuid>,
    pub customer_id: Uuid,
    pub account_id: Option<Uuid>,
    pub invoice_number: String,
    pub status: String,
    pub currency: String,
    pub issue_date: NaiveDate,
    pub due_date: NaiveDate,
    pub paid_at: Option<DateTime<Utc>>,
    pub subtotal: f64,
    pub tax_rate: f64,
    pub tax_amount: f64,
    pub discount_type: String,
    pub discount_value: f64,
    pub discount_amount: f64,
    pub total_amount: f64,
    pub amount_paid: f64,
    pub balance_due: f64,
    pub payment_terms: Option<String>,
    pub notes: Option<String>,
    pub terms_conditions: Option<String>,
    pub billing_address: serde_json::Value,
    pub metadata: serde_json::Value,
    pub created_by: Option<Uuid>,
    pub updated_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Line Item Entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct InvoiceItem {
    pub id: Uuid,
    pub invoice_id: Uuid,
    pub item_code: Option<String>,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount_percent: f64,
    pub tax_rate: f64,
    pub line_total: f64,
    pub sort_order: i32,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

/// Payment record associated with an invoice
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct InvoicePayment {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub amount: f64,
    pub currency: String,
    pub payment_method: String,
    pub transaction_reference: Option<String>,
    pub status: String,
    pub settled_at: DateTime<Utc>,
    pub recorded_by: Option<Uuid>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

/// Chronological event entry for the invoice timeline
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct InvoiceTimelineEvent {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub invoice_id: Uuid,
    pub customer_id: Uuid,
    pub event_type: String,
    pub title: String,
    pub description: Option<String>,
    pub actor_name: String,
    pub actor_id: Option<Uuid>,
    pub metadata: serde_json::Value,
    pub occurred_at: DateTime<Utc>,
}

/// Complete aggregated invoice view
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvoiceWithDetails {
    #[serde(flatten)]
    pub invoice: Invoice,
    pub items: Vec<InvoiceItem>,
    pub payments: Vec<InvoicePayment>,
    pub timeline: Vec<InvoiceTimelineEvent>,
}

// ============================================================================
// DTOs for Invoicing Operations
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvoiceItemDto {
    pub item_code: Option<String>,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount_percent: Option<f64>,
    pub tax_rate: Option<f64>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateInvoiceDto {
    pub customer_id: Uuid,
    pub account_id: Option<Uuid>,
    pub invoice_number: Option<String>,
    pub currency: Option<String>,
    pub issue_date: Option<NaiveDate>,
    pub due_date: NaiveDate,
    pub payment_terms: Option<String>,
    pub tax_rate: Option<f64>,
    pub discount_type: Option<DiscountType>,
    pub discount_value: Option<f64>,
    pub notes: Option<String>,
    pub terms_conditions: Option<String>,
    pub billing_address: Option<serde_json::Value>,
    pub items: Vec<InvoiceItemDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInvoiceDto {
    pub invoice_number: Option<String>,
    pub due_date: Option<NaiveDate>,
    pub payment_terms: Option<String>,
    pub tax_rate: Option<f64>,
    pub discount_type: Option<DiscountType>,
    pub discount_value: Option<f64>,
    pub notes: Option<String>,
    pub terms_conditions: Option<String>,
    pub billing_address: Option<serde_json::Value>,
    pub items: Option<Vec<InvoiceItemDto>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordPaymentDto {
    pub amount: f64,
    pub payment_method: String,
    pub transaction_reference: Option<String>,
    pub settled_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvoiceCalculationResult {
    pub subtotal: f64,
    pub discount_amount: f64,
    pub tax_amount: f64,
    pub total_amount: f64,
    pub balance_due: f64,
    pub computed_items: Vec<ComputedLineItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComputedLineItem {
    pub item_code: Option<String>,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount_percent: f64,
    pub tax_rate: f64,
    pub line_subtotal: f64,
    pub line_total: f64,
}

// ============================================================================
// Pure Calculation Engine & Utilities
// ============================================================================

/// Calculates totals for an invoice given items, tax rate, and discount parameters
pub fn calculate_invoice_totals(
    items: &[InvoiceItemDto],
    global_tax_rate: f64,
    discount_type: DiscountType,
    discount_value: f64,
    amount_already_paid: f64,
) -> InvoiceCalculationResult {
    let mut subtotal = 0.0;
    let mut computed_items = Vec::new();

    for item in items {
        let qty = if item.quantity <= 0.0 { 1.0 } else { item.quantity };
        let base_price = qty * item.unit_price;
        let line_disc_pct = item.discount_percent.unwrap_or(0.0).clamp(0.0, 100.0);
        let line_disc_amount = base_price * (line_disc_pct / 100.0);
        let line_subtotal = (base_price - line_disc_amount).max(0.0);

        let line_tax_rate = item.tax_rate.unwrap_or(0.0);
        let line_tax = line_subtotal * line_tax_rate;
        let line_total = line_subtotal + line_tax;

        subtotal += line_subtotal;

        computed_items.push(ComputedLineItem {
            item_code: item.item_code.clone(),
            description: item.description.clone(),
            quantity: qty,
            unit_price: item.unit_price,
            discount_percent: line_disc_pct,
            tax_rate: line_tax_rate,
            line_subtotal,
            line_total,
        });
    }

    // Apply global discount
    let discount_amount = match discount_type {
        DiscountType::Percentage => {
            let pct = discount_value.clamp(0.0, 100.0);
            subtotal * (pct / 100.0)
        }
        DiscountType::Fixed => discount_value.min(subtotal).max(0.0),
    };

    let discounted_subtotal = (subtotal - discount_amount).max(0.0);
    let tax_amount = discounted_subtotal * global_tax_rate.max(0.0);
    let total_amount = discounted_subtotal + tax_amount;
    let balance_due = (total_amount - amount_already_paid).max(0.0);

    InvoiceCalculationResult {
        subtotal: (subtotal * 100.0).round() / 100.0,
        discount_amount: (discount_amount * 100.0).round() / 100.0,
        tax_amount: (tax_amount * 100.0).round() / 100.0,
        total_amount: (total_amount * 100.0).round() / 100.0,
        balance_due: (balance_due * 100.0).round() / 100.0,
        computed_items,
    }
}

/// Generates next sequential invoice number standard (e.g. INV-2026-0001)
pub fn generate_invoice_number(sequence: u64, year: i32) -> String {
    format!("INV-{}-{:04}", year, sequence)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invoice_calculation() {
        let items = vec![
            InvoiceItemDto {
                item_code: Some("ERP-SUB-01".into()),
                description: "Enterprise Plan Annual".into(),
                quantity: 1.0,
                unit_price: 12000.0,
                discount_percent: Some(10.0), // 10% line discount -> 10,800.00
                tax_rate: Some(0.0),
                sort_order: Some(1),
            },
            InvoiceItemDto {
                item_code: Some("ONBOARDING".into()),
                description: "Dedicated Implementation Support".into(),
                quantity: 2.0,
                unit_price: 1500.0,
                discount_percent: None,
                tax_rate: Some(0.0),
                sort_order: Some(2),
            },
        ];

        // Subtotal = 10,800 + 3,000 = 13,800.00
        // Global Discount = 5% -> 690.00 -> Net = 13,110.00
        // Global Tax = 10% -> 1,311.00
        // Total = 14,421.00
        let result = calculate_invoice_totals(
            &items,
            0.10,
            DiscountType::Percentage,
            5.0,
            0.0,
        );

        assert_eq!(result.subtotal, 13800.0);
        assert_eq!(result.discount_amount, 690.0);
        assert_eq!(result.tax_amount, 1311.0);
        assert_eq!(result.total_amount, 14421.0);
        assert_eq!(result.balance_due, 14421.0);
    }

    #[test]
    fn test_status_transitions() {
        assert!(InvoiceStatus::Draft.can_transition_to(InvoiceStatus::Issued));
        assert!(InvoiceStatus::Issued.can_transition_to(InvoiceStatus::Sent));
        assert!(InvoiceStatus::Sent.can_transition_to(InvoiceStatus::PartiallyPaid));
        assert!(InvoiceStatus::PartiallyPaid.can_transition_to(InvoiceStatus::Paid));
        assert!(InvoiceStatus::Sent.can_transition_to(InvoiceStatus::Overdue));
        assert!(!InvoiceStatus::Paid.can_transition_to(InvoiceStatus::Draft));
    }
}
