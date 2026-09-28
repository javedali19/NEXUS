use chrono::{NaiveDate, Utc};
use serde_json::json;
use uuid::Uuid;

use platform_domain::ocr::{
    ApproveReviewCommand, ExtractedInvoice, ExtractedLineItem, FieldCorrection,
    OcrReviewAuditLog, OcrReviewStatus, RejectReviewCommand, SupplierMatch, SupplierMatchType,
};

#[test]
fn test_supplier_matching_exact_tax_id() {
    let supplier_match = SupplierMatch {
        vendor_id: Uuid::new_v4(),
        vendor_name: "Apex Cloud Systems Inc.".into(),
        tax_id: Some("US-EIN-9921049".into()),
        match_confidence: 0.995,
        match_type: SupplierMatchType::ExactTaxId,
        payment_terms: "Net 30".into(),
    };

    assert_eq!(supplier_match.match_type, SupplierMatchType::ExactTaxId);
    assert!(supplier_match.match_confidence > 0.99);
    assert_eq!(supplier_match.vendor_name, "Apex Cloud Systems Inc.");
}

#[test]
fn test_field_correction_audit_creation() {
    let audit_log = OcrReviewAuditLog {
        id: Uuid::new_v4(),
        extraction_id: Uuid::new_v4(),
        event_type: "field_corrected".into(),
        field_name: Some("line_item_1_quantity".into()),
        original_value: Some("2".into()),
        corrected_value: Some("3".into()),
        actor_name: "Sarah Reviewer (Financial Auditor)".into(),
        notes: Some("Adjusted quantity based on verified purchase order PO-881.".into()),
        created_at: Utc::now(),
    };

    assert_eq!(audit_log.event_type, "field_corrected");
    assert_eq!(audit_log.original_value, Some("2".into()));
    assert_eq!(audit_log.corrected_value, Some("3".into()));
}

#[test]
fn test_approve_review_command() {
    let invoice = ExtractedInvoice {
        invoice_number: "INV-2026-MATHPIX-889".into(),
        invoice_date: NaiveDate::from_ymd_opt(2026, 9, 22).unwrap(),
        due_date: Some(NaiveDate::from_ymd_opt(2026, 10, 22).unwrap()),
        supplier_name: "Apex Cloud Systems Inc.".into(),
        supplier_tax_id: Some("US-EIN-9921049".into()),
        supplier_address: None,
        customer_name: Some("Nexus Global Enterprise Ltd".into()),
        customer_tax_id: None,
        customer_address: None,
        currency: "USD".into(),
        line_items: vec![
            ExtractedLineItem {
                item_index: 1,
                description: "Kubernetes Node".into(),
                quantity: 2.0,
                unit_price: 500.0,
                amount: 1000.0,
                hsn_sac_code: None,
                tax_rate: 18.0,
                tax_amount: 180.0,
            }
        ],
        subtotal: 1000.0,
        tax_amount: 180.0,
        discount_amount: 0.0,
        total_amount: 1180.0,
        is_mathematically_valid: true,
    };

    let command = ApproveReviewCommand {
        extraction_id: Uuid::new_v4(),
        matched_vendor_id: Uuid::new_v4(),
        reviewer_id: Uuid::new_v4(),
        reviewer_name: "Alex Reviewer".into(),
        final_invoice: invoice,
        corrections: vec![
            FieldCorrection {
                field_name: "tax_rate".into(),
                original_value: "0.0".into(),
                corrected_value: "18.0".into(),
            }
        ],
        notes: Some("Approved with GST tax rate correction.".into()),
    };

    assert_eq!(command.corrections.len(), 1);
    assert_eq!(command.final_invoice.total_amount, 1180.0);
}

#[test]
fn test_reject_review_command() {
    let command = RejectReviewCommand {
        extraction_id: Uuid::new_v4(),
        reviewer_id: Uuid::new_v4(),
        reviewer_name: "Audit Lead".into(),
        rejection_reason: "unreadable_scan".into(),
        rejection_notes: "Document image is heavily smudged. OCR confidence below 50%.".into(),
    };

    assert_eq!(command.rejection_reason, "unreadable_scan");
    assert!(command.rejection_notes.contains("smudged"));
}
