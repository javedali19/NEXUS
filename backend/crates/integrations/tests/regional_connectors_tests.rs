use integrations::regional_connectors::*;
use uuid::Uuid;

#[test]
fn test_unconfigured_connectors_fail_cleanly_without_inventing_credentials() {
    // 1. Singapore Payments unconfigured
    let sg_unconfigured = SingaporePaymentsConnector::new(None, None, None);
    assert!(!sg_unconfigured.is_configured());
    let sg_res = sg_unconfigured.generate_paynow_qr("INV-SG-001", 100.0);
    assert!(sg_res.is_err());
    assert!(sg_res.unwrap_err().contains("credentials missing or unconfigured"));

    // 2. Malaysia LHDN MyInvois unconfigured
    let my_unconfigured = MalaysiaPaymentsEInvoicingConnector::new(None, None, None, None);
    assert!(!my_unconfigured.is_einvoicing_configured());
    let my_res = my_unconfigured.submit_lhdn_einvoice(Uuid::new_v4(), "C2584920100", 250.0);
    assert!(my_res.is_err());
    assert!(my_res.unwrap_err().contains("credentials missing or unconfigured"));

    // 3. Thailand Payments unconfigured
    let th_unconfigured = ThailandPaymentsETaxConnector::new(None, None, None);
    assert!(!th_unconfigured.is_promptpay_configured());
    let th_res = th_unconfigured.generate_promptpay_qr("0105556123456", 500.0);
    assert!(th_res.is_err());
    assert!(th_res.unwrap_err().contains("credentials missing or unconfigured"));

    // 4. LINE Thailand unconfigured
    let line_unconfigured = LineThailandConnector::new(None, None, None);
    assert!(!line_unconfigured.is_configured());
    let line_res = line_unconfigured.send_push_message("U12345678", "Sawadee krub");
    assert!(line_res.is_err());
    assert!(line_res.unwrap_err().contains("credentials missing or unconfigured"));

    // 5. Regional Messaging unconfigured
    let msg_unconfigured = RegionalMessagingConnector::new("twilio", None, None);
    assert!(!msg_unconfigured.is_configured());
    let msg_res = msg_unconfigured.route_message("+6591234567", "Your verification code is 123456");
    assert!(msg_res.is_err());

    // 6. Local SIP unconfigured
    let sip_unconfigured = LocalCommunicationConnector::new(None, None, None);
    assert!(!sip_unconfigured.is_configured());
    let sip_res = sip_unconfigured.establish_sip_session("+6561234567");
    assert!(sip_res.is_err());
}

#[test]
fn test_configured_regional_connectors_behave_appropriately() {
    // 1. Singapore PayNow QR generation
    let sg_active = SingaporePaymentsConnector::new(
        Some("dbs_client_123".to_string()),
        Some("dbs_key_abc".to_string()),
        Some("201812345M".to_string()),
    );
    assert!(sg_active.is_configured());
    let sg_qr = sg_active.generate_paynow_qr("INV-SG-2026-0042", 1362.50).unwrap();
    assert_eq!(sg_qr.currency, "SGD");
    assert_eq!(sg_qr.amount, 1362.50);
    assert!(sg_qr.qr_payload.contains("SG.PAYNOW"));
    assert!(sg_qr.qr_payload.contains("201812345M"));

    // 2. Malaysia LHDN MyInvois validation & submission
    let my_active = MalaysiaPaymentsEInvoicingConnector::new(
        Some("curlec_app_123".to_string()),
        Some("curlec_sec_456".to_string()),
        Some("lhdn_client_789".to_string()),
        Some("lhdn_secret_xyz".to_string()),
    );
    assert!(my_active.is_payments_configured());
    assert!(my_active.is_einvoicing_configured());
    let inv_id = Uuid::new_v4();
    let my_einvoice = my_active.submit_lhdn_einvoice(inv_id, "C2584920100", 1350.0).unwrap();
    assert_eq!(my_einvoice.status, "validated");
    assert!(my_einvoice.submission_uuid.starts_with("LHDN-MY-"));
    assert!(my_einvoice.validation_qr_url.unwrap().contains("myinvois.hasil.gov.my"));

    // 3. Thailand PromptPay QR generation
    let th_active = ThailandPaymentsETaxConnector::new(
        Some("skey_test_123".to_string()),
        Some("rd_api_key_456".to_string()),
        Some("RD_ETAX_001".to_string()),
    );
    assert!(th_active.is_promptpay_configured());
    assert!(th_active.is_etax_configured());
    let th_qr = th_active.generate_promptpay_qr("0105556123456", 1337.50).unwrap();
    assert_eq!(th_qr.currency, "THB");
    assert!(th_qr.qr_payload.contains("0105556123456"));

    // 4. LINE Thailand push message
    let line_active = LineThailandConnector::new(
        Some("1234567890".to_string()),
        Some("secret_abc123".to_string()),
        Some("token_xyz789".to_string()),
    );
    assert!(line_active.is_configured());
    let line_msg = line_active.send_push_message("U12345678", "ขอบคุณสำหรับการชำระเงิน").unwrap();
    assert_eq!(line_msg.status, "delivered");
    assert_eq!(line_msg.recipient_id, "U12345678");

    // 5. Regional Messaging routing
    let msg_active = RegionalMessagingConnector::new(
        "infobip",
        Some("ib_api_key_123".to_string()),
        Some("NEXUS".to_string()),
    );
    assert!(msg_active.is_configured());
    let route_sg = msg_active.route_message("+6591234567", "Hello Singapore").unwrap();
    assert!(route_sg.contains("Singapore IMDA"));
    let route_my = msg_active.route_message("+60123456789", "Hello Malaysia").unwrap();
    assert!(route_my.contains("Malaysia MCMC"));
    let route_th = msg_active.route_message("+66812345678", "Hello Thailand").unwrap();
    assert!(route_th.contains("Thailand NBTC"));

    // 6. Local SIP session establishment
    let sip_active = LocalCommunicationConnector::new(
        Some("sip.singtel.com".to_string()),
        Some("trunk_user_01".to_string()),
        Some("Singtel SIP Trunk".to_string()),
    );
    assert!(sip_active.is_configured());
    let sip_res = sip_active.establish_sip_session("+6561234567").unwrap();
    assert!(sip_res.contains("Singtel SIP Trunk"));
    assert!(sip_res.contains("200 OK"));
}
