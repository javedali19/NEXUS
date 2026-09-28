use platform_integrations::payments::razorpay::RazorpayAdapter;

#[test]
fn test_currency_subunits_conversion() {
    // INR conversion (paise)
    assert_eq!(RazorpayAdapter::to_subunits(5000.0, "INR"), 500000);
    assert_eq!(RazorpayAdapter::from_subunits(500000, "INR"), 5000.0);

    // USD conversion (cents)
    assert_eq!(RazorpayAdapter::to_subunits(120.50, "USD"), 12050);
    assert_eq!(RazorpayAdapter::from_subunits(12050, "USD"), 120.50);

    // Zero-decimal currency (JPY)
    assert_eq!(RazorpayAdapter::to_subunits(1500.0, "JPY"), 1500);
    assert_eq!(RazorpayAdapter::from_subunits(1500, "JPY"), 1500.0);
}

#[test]
fn test_hmac_sha256_computation() {
    let payload = b"{\"event\":\"payment.captured\",\"payload\":{}}";
    let secret = "whsec_test_secret_key_8842";
    let hash = RazorpayAdapter::compute_hmac_sha256(payload, secret);
    assert_eq!(hash.len(), 64);
}

#[test]
fn test_checkout_signature_verification() {
    let order_id = "order_N8429108429";
    let payment_id = "pay_N8429108429";
    let secret = "rzp_sec_test_key";
    
    let valid_sig = RazorpayAdapter::compute_hmac_sha256(
        format!("{}|{}", order_id, payment_id).as_bytes(),
        secret,
    );

    assert!(RazorpayAdapter::verify_payment_signature(
        order_id, payment_id, &valid_sig, secret
    ));

    assert!(!RazorpayAdapter::verify_payment_signature(
        order_id, "pay_TAMPERED", &valid_sig, secret
    ));
}

#[test]
fn test_error_category_mapping() {
    assert_eq!(RazorpayAdapter::map_error_to_category("BAD_REQUEST_ERROR"), "validation_failure");
    assert_eq!(RazorpayAdapter::map_error_to_category("GATEWAY_ERROR"), "gateway_timeout");
    assert_eq!(RazorpayAdapter::map_error_to_category("INSUFFICIENT_FUNDS"), "insufficient_funds");
    assert_eq!(RazorpayAdapter::map_error_to_category("BAD_REQUEST_PAYMENT_POSSIBLE_FRAUD"), "fraud_blocked");
}
