use domain::country_pack::{CountryCode, CountryPackEngine};

#[test]
fn test_all_three_country_packs_configured_with_10_dimensions() {
    let sg = CountryPackEngine::get_country_pack(CountryCode::Singapore);
    let my = CountryPackEngine::get_country_pack(CountryCode::Malaysia);
    let th = CountryPackEngine::get_country_pack(CountryCode::Thailand);

    // 1. Currencies
    assert_eq!(sg.currency.code, "SGD");
    assert_eq!(my.currency.code, "MYR");
    assert_eq!(th.currency.code, "THB");

    // 2. Timezone
    assert_eq!(sg.timezone.utc_offset_hours, 8);
    assert_eq!(my.timezone.utc_offset_hours, 8);
    assert_eq!(th.timezone.utc_offset_hours, 7);

    // 3. Tax
    assert_eq!(sg.tax.standard_rate_percent, 9.0);
    assert_eq!(my.tax.standard_rate_percent, 8.0);
    assert_eq!(th.tax.standard_rate_percent, 7.0);

    // 4. Invoice Conventions
    assert_eq!(sg.invoice_conventions.number_prefix, "INV-SG-");
    assert_eq!(my.invoice_conventions.number_prefix, "INV-MY-");
    assert_eq!(th.invoice_conventions.number_prefix, "INV-TH-");
    assert!(th.invoice_conventions.requires_branch_code);

    // 5. Communication Rules
    assert_eq!(sg.communication_rules.mandatory_opt_out_keyword, "STOP");
    assert_eq!(my.communication_rules.mandatory_opt_out_keyword, "BATAL");
    assert_eq!(th.communication_rules.mandatory_opt_out_keyword, "ยกเลิก");

    // 6. Calling Windows
    assert_eq!(sg.calling_windows.start_hour_local, 9);
    assert_eq!(sg.calling_windows.end_hour_local, 21);
    assert_eq!(my.calling_windows.end_hour_local, 20);
    assert_eq!(th.calling_windows.start_hour_local, 8);
    assert_eq!(th.calling_windows.max_daily_attempts_per_debtor, 1);

    // 7. Languages
    assert_eq!(sg.languages.primary_locale, "en-SG");
    assert_eq!(my.languages.primary_locale, "ms-MY");
    assert_eq!(th.languages.primary_locale, "th-TH");
    assert_eq!(th.languages.calendar_system, "Buddhist Era (BE)");

    // 8. Payment Methods
    assert!(sg.payment_methods.primary_qr_standard.contains("PayNow"));
    assert!(my.payment_methods.primary_qr_standard.contains("DuitNow"));
    assert!(th.payment_methods.primary_qr_standard.contains("PromptPay"));

    // 9. Regional Integrations
    assert_eq!(sg.regional_integrations.local_phone_prefix, "+65");
    assert_eq!(my.regional_integrations.local_phone_prefix, "+60");
    assert_eq!(th.regional_integrations.local_phone_prefix, "+66");

    // 10. E-Invoicing Readiness
    assert!(sg.einvoicing.framework_name.contains("InvoiceNow"));
    assert!(my.einvoicing.framework_name.contains("MyInvois"));
    assert!(th.einvoicing.framework_name.contains("e-Tax"));
}

#[test]
fn test_currency_formatting_and_tax_calculations() {
    let (sg_tax, sg_total) = CountryPackEngine::calculate_tax(CountryCode::Singapore, 1000.0, false);
    assert_eq!(sg_tax, 90.0);
    assert_eq!(sg_total, 1090.0);
    assert_eq!(CountryPackEngine::format_currency(CountryCode::Singapore, sg_total), "S$1090.00");

    let (my_tax, my_total) = CountryPackEngine::calculate_tax(CountryCode::Malaysia, 1000.0, false);
    assert_eq!(my_tax, 80.0);
    assert_eq!(my_total, 1080.0);
    assert_eq!(CountryPackEngine::format_currency(CountryCode::Malaysia, my_total), "RM 1080.00");

    let (th_tax, th_total) = CountryPackEngine::calculate_tax(CountryCode::Thailand, 1000.0, false);
    assert_eq!(th_tax, 70.0);
    assert_eq!(th_total, 1070.0);
    assert_eq!(CountryPackEngine::format_currency(CountryCode::Thailand, th_total), "฿1070.00");
}

#[test]
fn test_calling_window_evaluations() {
    // Sunday calling must be prohibited across all countries
    let (sg_allowed, sg_msg) = CountryPackEngine::evaluate_calling_window(CountryCode::Singapore, 4, 7); // Sunday
    assert!(!sg_allowed);
    assert!(sg_msg.contains("Sunday calling banned"));

    // Wednesday at 03:00 UTC = 11:00 SGT/MYT (Allowed) and 10:00 ICT (Allowed)
    let (sg_workday, _) = CountryPackEngine::evaluate_calling_window(CountryCode::Singapore, 3, 3);
    assert!(sg_workday);

    let (th_workday, _) = CountryPackEngine::evaluate_calling_window(CountryCode::Thailand, 3, 3);
    assert!(th_workday);

    // Wednesday at 14:00 UTC = 22:00 SGT (Outside window: 9 to 21)
    let (sg_night, sg_night_msg) = CountryPackEngine::evaluate_calling_window(CountryCode::Singapore, 14, 3);
    assert!(!sg_night);
    assert!(sg_night_msg.contains("Outside permitted calling window"));
}

#[test]
fn test_einvoice_readiness_validations() {
    // SG InvoiceNow
    assert!(CountryPackEngine::validate_einvoice_readiness(CountryCode::Singapore, "201812345M", None, 500.0).is_ok());
    assert!(CountryPackEngine::validate_einvoice_readiness(CountryCode::Singapore, "short", None, 500.0).is_err());

    // MY MyInvois
    assert!(CountryPackEngine::validate_einvoice_readiness(CountryCode::Malaysia, "C2584920100", None, 800.0).is_ok());
    assert!(CountryPackEngine::validate_einvoice_readiness(CountryCode::Malaysia, "", None, 800.0).is_err());

    // TH e-Tax
    assert!(CountryPackEngine::validate_einvoice_readiness(CountryCode::Thailand, "0105556123456", Some("00000"), 1200.0).is_ok());
    assert!(CountryPackEngine::validate_einvoice_readiness(CountryCode::Thailand, "123", Some("00000"), 1200.0).is_err());
}
