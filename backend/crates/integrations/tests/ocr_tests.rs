use serde_json::json;
use uuid::Uuid;
use chrono::NaiveDate;

use platform_domain::ocr::{AnomalySeverity, AnomalyType, ExtractedInvoice, ExtractedLineItem};
use platform_integrations::auth::secret_manager::SecretManagerResolver;
use platform_integrations::ocr::mathpix::{
    MathpixClient, MathpixConfig, MathpixConnectionStatus,
};

#[test]
fn test_mathpix_raw_parsing_valid() {
    let raw_ocr_json = json!({
        "invoice_number": "INV-2026-MATHPIX-889",
        "invoice_date": "2026-09-22",
        "due_date": "2026-10-22",
        "supplier_name": "Apex Cloud Systems Inc.",
        "supplier_tax_id": "US-EIN-9921049",
        "supplier_address": "400 Tech Boulevard, Austin, TX 78701",
        "customer_name": "Nexus Global Enterprise Ltd",
        "customer_tax_id": "GSTIN29AAACN0192A1Z5",
        "customer_address": "88 Tower One, Bengaluru, India",
        "currency": "USD",
        "subtotal": 1500.00,
        "tax_amount": 270.00,
        "discount_amount": 50.00,
        "total_amount": 1720.00,
        "line_items": [
            {
                "description": "High-Throughput Kubernetes Cluster Node",
                "quantity": 2.0,
                "unit_price": 500.00,
                "amount": 1000.00,
                "hsn_sac": "998313",
                "tax_rate": 18.0,
                "tax_amount": 180.00
            },
            {
                "description": "Dedicated Secure VPN Gateway",
                "quantity": 1.0,
                "unit_price": 500.00,
                "amount": 500.00,
                "hsn_sac": "998314",
                "tax_rate": 18.0,
                "tax_amount": 90.00
            }
        ]
    });

    let invoice = MathpixClient::parse_raw_ocr_to_invoice(&raw_ocr_json)
        .expect("Should successfully parse raw OCR json into canonical invoice");

    assert_eq!(invoice.invoice_number, "INV-2026-MATHPIX-889");
    assert_eq!(invoice.invoice_date, NaiveDate::from_ymd_opt(2026, 9, 22).unwrap());
    assert_eq!(invoice.due_date, Some(NaiveDate::from_ymd_opt(2026, 10, 22).unwrap()));
    assert_eq!(invoice.supplier_name, "Apex Cloud Systems Inc.");
    assert_eq!(invoice.currency, "USD");
    assert_eq!(invoice.line_items.len(), 2);
    assert_eq!(invoice.subtotal, 1500.00);
    assert_eq!(invoice.tax_amount, 270.00);
    assert_eq!(invoice.discount_amount, 50.00);
    assert_eq!(invoice.total_amount, 1720.00);
    assert!(invoice.is_mathematically_valid);
}

#[test]
fn test_mathpix_line_items_arithmetic_mismatch() {
    let mut invoice = ExtractedInvoice {
        invoice_number: "INV-ERR-001".into(),
        invoice_date: NaiveDate::from_ymd_opt(2026, 9, 22).unwrap(),
        due_date: None,
        supplier_name: "Hardware Corp".into(),
        supplier_tax_id: None,
        supplier_address: None,
        customer_name: Some("Nexus Corp".into()),
        customer_tax_id: None,
        customer_address: None,
        currency: "USD".into(),
        line_items: vec![
            ExtractedLineItem {
                item_index: 1,
                description: "GPU Node Rack".into(),
                quantity: 2.0,
                unit_price: 1000.0,
                amount: 2500.0, // Error: 2 * 1000 = 2000, not 2500!
                hsn_sac_code: None,
                tax_rate: 18.0,
                tax_amount: 450.0,
            },
        ],
        subtotal: 2000.0, // Error: line items sum is 2500, but subtotal is 2000!
        tax_amount: 360.0,
        discount_amount: 0.0,
        total_amount: 2360.0,
        is_mathematically_valid: true,
    };

    let (is_valid, anomalies) = invoice.validate_mathematics();
    assert!(!is_valid);
    assert!(anomalies.len() >= 2);

    let line_item_error = anomalies.iter().find(|a| a.title.contains("Line Item #1 Arithmetic Inconsistency"));
    assert!(line_item_error.is_some());
    assert_eq!(line_item_error.unwrap().severity, AnomalySeverity::Warning);

    let subtotal_error = anomalies.iter().find(|a| a.anomaly_type == AnomalyType::MathMismatch && a.title.contains("Subtotal"));
    assert!(subtotal_error.is_some());
    assert_eq!(subtotal_error.unwrap().severity, AnomalySeverity::Critical);
}

#[test]
fn test_mathpix_grand_total_mismatch() {
    let invoice = ExtractedInvoice {
        invoice_number: "INV-ERR-TOTAL".into(),
        invoice_date: NaiveDate::from_ymd_opt(2026, 9, 22).unwrap(),
        due_date: None,
        supplier_name: "Cloud Hosting".into(),
        supplier_tax_id: None,
        supplier_address: None,
        customer_name: None,
        customer_tax_id: None,
        customer_address: None,
        currency: "EUR".into(),
        line_items: vec![
            ExtractedLineItem {
                item_index: 1,
                description: "Server Rental".into(),
                quantity: 1.0,
                unit_price: 1000.0,
                amount: 1000.0,
                hsn_sac_code: None,
                tax_rate: 20.0,
                tax_amount: 200.0,
            },
        ],
        subtotal: 1000.0,
        tax_amount: 200.0,
        discount_amount: 0.0,
        total_amount: 1400.0, // Error: 1000 + 200 = 1200, not 1400!
        is_mathematically_valid: true,
    };

    let (is_valid, anomalies) = invoice.validate_mathematics();
    assert!(!is_valid);
    let total_anomaly = anomalies.iter().find(|a| a.title.contains("Grand Total Mismatch"));
    assert!(total_anomaly.is_some());
    assert_eq!(total_anomaly.unwrap().expected_value, Some("1200.00".into()));
    assert_eq!(total_anomaly.unwrap().actual_value, Some("1400.00".into()));
}

#[test]
fn test_mathpix_abnormal_tax_rate() {
    let invoice = ExtractedInvoice {
        invoice_number: "INV-TAX-HIGH".into(),
        invoice_date: NaiveDate::from_ymd_opt(2026, 9, 22).unwrap(),
        due_date: None,
        supplier_name: "Luxury Supply".into(),
        supplier_tax_id: None,
        supplier_address: None,
        customer_name: None,
        customer_tax_id: None,
        customer_address: None,
        currency: "USD".into(),
        line_items: vec![
            ExtractedLineItem {
                item_index: 1,
                description: "Imported Components".into(),
                quantity: 1.0,
                unit_price: 1000.0,
                amount: 1000.0,
                hsn_sac_code: None,
                tax_rate: 50.0,
                tax_amount: 500.0,
            },
        ],
        subtotal: 1000.0,
        tax_amount: 500.0, // 50% tax rate!
        discount_amount: 0.0,
        total_amount: 1500.0,
        is_mathematically_valid: true,
    };

    let (_is_valid, anomalies) = invoice.validate_mathematics();
    let tax_anomaly = anomalies.iter().find(|a| a.anomaly_type == AnomalyType::AbnormalTaxRate);
    assert!(tax_anomaly.is_some());
    assert_eq!(tax_anomaly.unwrap().actual_value, Some("50.0%".into()));
}

#[tokio::test]
async fn test_connection_gating_unconfigured() {
    let resolver = SecretManagerResolver::new("test-project".into(), false);
    let client = MathpixClient::new(
        MathpixConfig {
            organization_id: Uuid::new_v4(),
            app_id_secret_ref: "projects/test-project/secrets/mathpix-app-id/versions/latest".into(),
            app_key_secret_ref: "projects/test-project/secrets/mathpix-app-key/versions/latest".into(),
            connection_status: MathpixConnectionStatus::Unconfigured,
            last_tested_at: None,
            last_latency_ms: None,
            last_error_message: None,
        },
        resolver,
    );

    let probe = client.test_connection().await.expect("Probe probe check should run");
    // In local non-production environment without GSM credentials, status must NOT claim operational
    assert!(!probe.is_valid);
    assert_eq!(probe.status, MathpixConnectionStatus::Unconfigured);
    assert!(probe.message.contains("dry-run mode") || probe.message.contains("unvalidated"));
}
