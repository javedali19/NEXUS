use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use platform_common::PlatformError;

/// OCR Extraction Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OcrJobStatus {
    Queued,
    Processing,
    Completed,
    Failed,
}

/// Category of Detected Anomaly.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AnomalyType {
    MathMismatch,
    DuplicateInvoice,
    UnrecognizedSupplier,
    DateStaleOrFuture,
    AbnormalTaxRate,
    PriceSpike,
}

/// Anomaly Severity.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AnomalySeverity {
    Critical,
    Warning,
    Info,
}

/// Extracted Line Item.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractedLineItem {
    pub item_index: i32,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub amount: f64,
    pub hsn_sac_code: Option<String>,
    pub tax_rate: f64,
    pub tax_amount: f64,
}

/// Canonical Extracted Invoice Model.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractedInvoice {
    pub invoice_number: String,
    pub invoice_date: NaiveDate,
    pub due_date: Option<NaiveDate>,
    pub supplier_name: String,
    pub supplier_tax_id: Option<String>,
    pub supplier_address: Option<String>,
    pub customer_name: Option<String>,
    pub customer_tax_id: Option<String>,
    pub customer_address: Option<String>,
    pub currency: String,
    pub line_items: Vec<ExtractedLineItem>,
    pub subtotal: f64,
    pub tax_amount: f64,
    pub discount_amount: f64,
    pub total_amount: f64,
    pub is_mathematically_valid: bool,
}

/// Anomaly Incident Entity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OcrAnomaly {
    pub anomaly_type: AnomalyType,
    pub severity: AnomalySeverity,
    pub title: String,
    pub description: String,
    pub expected_value: Option<String>,
    pub actual_value: Option<String>,
}

impl ExtractedInvoice {
    /// Validates mathematical consistency across line items, subtotals, taxes, and final totals.
    pub fn validate_mathematics(&self) -> (bool, Vec<OcrAnomaly>) {
        let mut anomalies = Vec::new();
        let epsilon = 0.05; // 5 cent rounding tolerance

        // 1. Line items sum check
        let calculated_subtotal: f64 = self.line_items.iter().map(|item| item.amount).sum();
        let subtotal_diff = (calculated_subtotal - self.subtotal).abs();

        if subtotal_diff > epsilon {
            anomalies.push(OcrAnomaly {
                anomaly_type: AnomalyType::MathMismatch,
                severity: AnomalySeverity::Critical,
                title: "Line Items Sum Mismatch".into(),
                description: format!(
                    "Sum of line items ({:.2}) does not match invoice subtotal ({:.2}).",
                    calculated_subtotal, self.subtotal
                ),
                expected_value: Some(format!("{:.2}", calculated_subtotal)),
                actual_value: Some(format!("{:.2}", self.subtotal)),
            });
        }

        // 2. Line item quantity * unit_price check
        for item in &self.line_items {
            let expected_line_amount = (item.quantity * item.unit_price * 100.0).round() / 100.0;
            if (expected_line_amount - item.amount).abs() > epsilon {
                anomalies.push(OcrAnomaly {
                    anomaly_type: AnomalyType::MathMismatch,
                    severity: AnomalySeverity::Warning,
                    title: format!("Line Item #{} Arithmetic Inconsistency", item.item_index),
                    description: format!(
                        "Item '{}': quantity ({}) * unit price ({:.2}) = {:.2}, but extracted amount is {:.2}.",
                        item.description, item.quantity, item.unit_price, expected_line_amount, item.amount
                    ),
                    expected_value: Some(format!("{:.2}", expected_line_amount)),
                    actual_value: Some(format!("{:.2}", item.amount)),
                });
            }
        }

        // 3. Final Total consistency: subtotal + tax - discount == total
        let calculated_total = ((self.subtotal + self.tax_amount - self.discount_amount) * 100.0).round() / 100.0;
        let total_diff = (calculated_total - self.total_amount).abs();

        if total_diff > epsilon {
            anomalies.push(OcrAnomaly {
                anomaly_type: AnomalyType::MathMismatch,
                severity: AnomalySeverity::Critical,
                title: "Grand Total Mismatch".into(),
                description: format!(
                    "Subtotal ({:.2}) + Tax ({:.2}) - Discount ({:.2}) = {:.2}, but extracted total is {:.2}.",
                    self.subtotal, self.tax_amount, self.discount_amount, calculated_total, self.total_amount
                ),
                expected_value: Some(format!("{:.2}", calculated_total)),
                actual_value: Some(format!("{:.2}", self.total_amount)),
            });
        }

        // 4. Tax sanity check
        if self.subtotal > 0.0 && self.tax_amount > 0.0 {
            let effective_tax_rate = (self.tax_amount / self.subtotal) * 100.0;
            if effective_tax_rate > 35.0 {
                anomalies.push(OcrAnomaly {
                    anomaly_type: AnomalyType::AbnormalTaxRate,
                    severity: AnomalySeverity::Warning,
                    title: "Abnormally High Tax Rate Detected".into(),
                    description: format!(
                        "Effective tax rate is {:.1}%, exceeding standard 0-28% GST/VAT ranges.",
                        effective_tax_rate
                    ),
                    expected_value: Some("<= 28.0%".into()),
                    actual_value: Some(format!("{:.1}%", effective_tax_rate)),
                });
            }
        }

        let is_valid = anomalies.is_empty();
        (is_valid, anomalies)
    }
}

/// OCR Human-in-the-Loop Review Status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OcrReviewStatus {
    PendingReview,
    UnderReview,
    Approved,
    Rejected,
    Retried,
}

/// Supplier Match Confidence Method.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SupplierMatchType {
    ExactTaxId,
    FuzzyName,
    ManualOverride,
    Unmatched,
}

/// Resolved Supplier / Vendor Entity Match.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupplierMatch {
    pub vendor_id: Uuid,
    pub vendor_name: String,
    pub tax_id: Option<String>,
    pub match_confidence: f64,
    pub match_type: SupplierMatchType,
    pub payment_terms: String,
}

/// Field Correction Audit Log Entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldCorrection {
    pub field_name: String,
    pub original_value: String,
    pub corrected_value: String,
}

/// Review Audit Trail Event.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OcrReviewAuditLog {
    pub id: Uuid,
    pub extraction_id: Uuid,
    pub event_type: String,
    pub field_name: Option<String>,
    pub original_value: Option<String>,
    pub corrected_value: Option<String>,
    pub actor_name: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Command to Approve an OCR Extraction and Post to ERP.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApproveReviewCommand {
    pub extraction_id: Uuid,
    pub matched_vendor_id: Uuid,
    pub reviewer_id: Uuid,
    pub reviewer_name: String,
    pub final_invoice: ExtractedInvoice,
    pub corrections: Vec<FieldCorrection>,
    pub notes: Option<String>,
}

/// Command to Reject an OCR Extraction.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RejectReviewCommand {
    pub extraction_id: Uuid,
    pub reviewer_id: Uuid,
    pub reviewer_name: String,
    pub rejection_reason: String,
    pub rejection_notes: String,
}

