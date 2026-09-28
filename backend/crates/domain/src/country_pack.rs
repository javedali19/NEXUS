use serde::{Deserialize, Serialize};

// ============================================================================
// Regional Country Pack Enums & Domain Models
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CountryCode {
    Singapore, // SG
    Malaysia,  // MY
    Thailand,  // TH
}

impl CountryCode {
    pub fn as_str(&self) -> &'static str {
        match self {
            CountryCode::Singapore => "SG",
            CountryCode::Malaysia => "MY",
            CountryCode::Thailand => "TH",
        }
    }
}

/// 1. Currencies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrencyConfig {
    pub code: String,          // 'SGD', 'MYR', 'THB'
    pub symbol: String,        // 'S$', 'RM', '฿'
    pub minor_units: u8,       // 2
    pub decimal_separator: char,
    pub thousands_separator: char,
    pub sample_formatted: String,
}

/// 2. Timezone
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimezoneConfig {
    pub iana_id: String,       // 'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Asia/Bangkok'
    pub display_name: String,  // 'SGT (UTC+8)', 'MYT (UTC+8)', 'ICT (UTC+7)'
    pub utc_offset_hours: i8,  // +8, +8, +7
}

/// 3. Tax
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxConfig {
    pub tax_name: String,            // 'GST', 'SST', 'VAT'
    pub standard_rate_percent: f64,  // 9.0, 8.0, 7.0
    pub zero_rate_percent: f64,      // 0.0
    pub tax_authority: String,       // 'IRAS', 'LHDN / JKDM', 'Thai Revenue Department'
    pub tax_id_label: String,        // 'UEN / GST Reg No', 'TIN / SST Reg No', '13-Digit Tax ID'
    pub sample_tax_id: String,
}

/// 4. Invoice Conventions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvoiceConventions {
    pub document_title: String,      // 'Tax Invoice', 'Invois Cukai / Tax Invoice', 'ใบกำกับภาษี / Tax Invoice'
    pub number_prefix: String,       // 'INV-SG-', 'INV-MY-', 'INV-TH-'
    pub requires_branch_code: bool,  // true for Thailand (00000 Head Office)
    pub required_header_fields: Vec<String>,
    pub legal_footer_text: String,
}

/// 5. Communication Rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommunicationRules {
    pub privacy_regulation: String,      // 'PDPA 2012 & Spam Control Act', 'PDPA 2010', 'PDPA B.E. 2562'
    pub mandatory_opt_out_keyword: String, // 'STOP', 'BATAL', 'ยกเลิก'
    pub max_promotional_per_week: u32,
    pub dual_language_mandate: bool,
    pub opt_out_footer_template: String,
}

/// 6. Calling Windows
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CallingWindowRules {
    pub window_display: String,        // '09:00 - 21:00 SGT', '09:00 - 20:00 MYT', '08:00 - 20:00 ICT'
    pub start_hour_local: u8,          // 9, 9, 8
    pub end_hour_local: u8,            // 21, 20, 20
    pub saturday_end_hour_local: u8,   // 21, 18, 18
    pub sunday_calling_allowed: bool,  // false across all 3
    pub dnc_registry_name: String,     // 'Singapore DNC Registry', 'MCMC DNC Register', 'Thai DNC Registry'
    pub max_daily_attempts_per_debtor: u8, // 1 in Thailand (Debt Collection Act), 2 in SG/MY
}

/// 7. Languages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanguageConfig {
    pub primary_locale: String,
    pub supported_locales: Vec<String>,
    pub default_ai_voice: String,
    pub code_switching_supported: bool,
    pub calendar_system: String, // 'Gregorian' vs 'Buddhist Era (BE)'
}

/// 8. Payment Methods
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentMethodConfig {
    pub primary_qr_standard: String,  // 'PayNow QR (SGQR)', 'DuitNow QR (PayNet)', 'PromptPay QR'
    pub instant_clearing_rail: String,// 'FAST', 'FPX & DuitNow Transfer', 'PromptPay Interbank'
    pub supported_methods: Vec<String>,
}

/// 9. Regional Integrations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegionalIntegrationsConfig {
    pub identity_verification_provider: String, // 'Singpass / Corppass', 'MyDigital ID / MyInvois', 'NDID / ThaiD'
    pub local_phone_prefix: String,             // '+65', '+60', '+66'
    pub open_banking_gateways: Vec<String>,
}

/// 10. E-Invoicing Readiness
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EInvoicingConfig {
    pub framework_name: String,    // 'InvoiceNow (Peppol)', 'LHDN MyInvois', 'e-Tax Invoice by Thai RD'
    pub standard_specification: String, // 'Peppol BIS Billing 3.0', 'LHDN MyInvois UBL 2.1 / JSON', 'ETDA TIS 2378-2560'
    pub participant_id_format: String,  // '0195:SGUEN...', 'TIN + BRN', '13-digit Tax ID + 5-digit Branch'
    pub mandate_status: String,         // 'Nationwide Live', 'Mandatory Rollout 2024-2025', 'Live Voluntary & Tiered'
    pub digital_signature_required: bool,
}

/// Master Country Pack
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CountryPack {
    pub country_code: CountryCode,
    pub country_name: String,
    pub flag_emoji: String,
    pub currency: CurrencyConfig,
    pub timezone: TimezoneConfig,
    pub tax: TaxConfig,
    pub invoice_conventions: InvoiceConventions,
    pub communication_rules: CommunicationRules,
    pub calling_windows: CallingWindowRules,
    pub languages: LanguageConfig,
    pub payment_methods: PaymentMethodConfig,
    pub regional_integrations: RegionalIntegrationsConfig,
    pub einvoicing: EInvoicingConfig,
}

// ============================================================================
// Country Pack Engine
// ============================================================================

pub struct CountryPackEngine;

impl CountryPackEngine {
    /// Retrieve canonical country pack configuration
    pub fn get_country_pack(code: CountryCode) -> CountryPack {
        match code {
            CountryCode::Singapore => CountryPack {
                country_code: CountryCode::Singapore,
                country_name: "Singapore".to_string(),
                flag_emoji: "🇸🇬".to_string(),
                currency: CurrencyConfig {
                    code: "SGD".to_string(),
                    symbol: "S$".to_string(),
                    minor_units: 2,
                    decimal_separator: '.',
                    thousands_separator: ',',
                    sample_formatted: "S$1,250.00".to_string(),
                },
                timezone: TimezoneConfig {
                    iana_id: "Asia/Singapore".to_string(),
                    display_name: "SGT (UTC+8)".to_string(),
                    utc_offset_hours: 8,
                },
                tax: TaxConfig {
                    tax_name: "GST".to_string(),
                    standard_rate_percent: 9.0,
                    zero_rate_percent: 0.0,
                    tax_authority: "IRAS (Inland Revenue Authority of Singapore)".to_string(),
                    tax_id_label: "UEN / GST Registration No".to_string(),
                    sample_tax_id: "201812345M / M90371234X".to_string(),
                },
                invoice_conventions: InvoiceConventions {
                    document_title: "Tax Invoice".to_string(),
                    number_prefix: "INV-SG-".to_string(),
                    requires_branch_code: false,
                    required_header_fields: vec![
                        "Tax Invoice Title".to_string(),
                        "Supplier Legal Name & UEN".to_string(),
                        "GST Registration Number".to_string(),
                        "Itemized Subtotal & 9% GST Amount in SGD".to_string(),
                    ],
                    legal_footer_text: "Registered in Singapore. Regulated under GST Act Chapter 117A.".to_string(),
                },
                communication_rules: CommunicationRules {
                    privacy_regulation: "PDPA 2012 & Spam Control Act (Cap. 311A)".to_string(),
                    mandatory_opt_out_keyword: "STOP".to_string(),
                    max_promotional_per_week: 2,
                    dual_language_mandate: false,
                    opt_out_footer_template: "Reply STOP to unsubscribe. Nexus Enterprise SG.".to_string(),
                },
                calling_windows: CallingWindowRules {
                    window_display: "09:00 - 21:00 SGT (Mon-Sat)".to_string(),
                    start_hour_local: 9,
                    end_hour_local: 21,
                    saturday_end_hour_local: 21,
                    sunday_calling_allowed: false,
                    dnc_registry_name: "Singapore Personal Data Protection Commission DNC Registry".to_string(),
                    max_daily_attempts_per_debtor: 2,
                },
                languages: LanguageConfig {
                    primary_locale: "en-SG".to_string(),
                    supported_locales: vec!["en-SG".to_string(), "zh-SG".to_string(), "ms-SG".to_string(), "ta-SG".to_string()],
                    default_ai_voice: "Rachel (Singaporean English Accent)".to_string(),
                    code_switching_supported: true,
                    calendar_system: "Gregorian".to_string(),
                },
                payment_methods: PaymentMethodConfig {
                    primary_qr_standard: "PayNow QR (SGQR Standard)".to_string(),
                    instant_clearing_rail: "FAST & Interbank GIRO".to_string(),
                    supported_methods: vec!["PayNow QR".to_string(), "FAST Interbank".to_string(), "GIRO".to_string(), "GrabPay SG".to_string(), "Cards".to_string()],
                },
                regional_integrations: RegionalIntegrationsConfig {
                    identity_verification_provider: "Singpass / Corppass MyInfo".to_string(),
                    local_phone_prefix: "+65".to_string(),
                    open_banking_gateways: vec!["DBS RAPID API".to_string(), "OCBC Open Banking".to_string(), "UOB Direct Connect".to_string()],
                },
                einvoicing: EInvoicingConfig {
                    framework_name: "InvoiceNow (IMDA Peppol Network)".to_string(),
                    standard_specification: "Peppol BIS Billing 3.0 (SG Specific Rules)".to_string(),
                    participant_id_format: "0195:SGUEN... (e.g. 0195:201812345M)".to_string(),
                    mandate_status: "Mandatory for Gov Invoicing; Broad Enterprise Adoption".to_string(),
                    digital_signature_required: true,
                },
            },

            CountryCode::Malaysia => CountryPack {
                country_code: CountryCode::Malaysia,
                country_name: "Malaysia".to_string(),
                flag_emoji: "🇲🇾".to_string(),
                currency: CurrencyConfig {
                    code: "MYR".to_string(),
                    symbol: "RM".to_string(),
                    minor_units: 2,
                    decimal_separator: '.',
                    thousands_separator: ',',
                    sample_formatted: "RM 1,250.00".to_string(),
                },
                timezone: TimezoneConfig {
                    iana_id: "Asia/Kuala_Lumpur".to_string(),
                    display_name: "MYT (UTC+8)".to_string(),
                    utc_offset_hours: 8,
                },
                tax: TaxConfig {
                    tax_name: "SST".to_string(),
                    standard_rate_percent: 8.0,
                    zero_rate_percent: 0.0,
                    tax_authority: "LHDN (Lembaga Hasil Dalam Negeri) & JKDM".to_string(),
                    tax_id_label: "TIN / SSM BRN / SST Reg No".to_string(),
                    sample_tax_id: "C2584920100 / 202001012345 / W10-1808-32000012".to_string(),
                },
                invoice_conventions: InvoiceConventions {
                    document_title: "Invois Cukai / Tax Invoice".to_string(),
                    number_prefix: "INV-MY-".to_string(),
                    requires_branch_code: false,
                    required_header_fields: vec![
                        "Tax Invoice / Invois Cukai".to_string(),
                        "Supplier TIN & Business Registration No".to_string(),
                        "SST Registration Number".to_string(),
                        "MSIC Code & Classification".to_string(),
                        "Buyer TIN or Identification".to_string(),
                    ],
                    legal_footer_text: "Registered under Companies Commission of Malaysia (SSM) and Sales Tax Act 2018.".to_string(),
                },
                communication_rules: CommunicationRules {
                    privacy_regulation: "PDPA 2010 & MCMC Communications and Multimedia Act 1998".to_string(),
                    mandatory_opt_out_keyword: "BATAL".to_string(),
                    max_promotional_per_week: 2,
                    dual_language_mandate: true,
                    opt_out_footer_template: "Balas BATAL atau STOP untuk berhenti. Nexus Enterprise MY.".to_string(),
                },
                calling_windows: CallingWindowRules {
                    window_display: "09:00 - 20:00 MYT (Mon-Fri), 09:00 - 18:00 (Sat)".to_string(),
                    start_hour_local: 9,
                    end_hour_local: 20,
                    saturday_end_hour_local: 18,
                    sunday_calling_allowed: false,
                    dnc_registry_name: "MCMC Do Not Call Registry".to_string(),
                    max_daily_attempts_per_debtor: 2,
                },
                languages: LanguageConfig {
                    primary_locale: "ms-MY".to_string(),
                    supported_locales: vec!["ms-MY".to_string(), "en-MY".to_string(), "zh-MY".to_string()],
                    default_ai_voice: "Adam (Malaysian Bilingual Voice)".to_string(),
                    code_switching_supported: true,
                    calendar_system: "Gregorian".to_string(),
                },
                payment_methods: PaymentMethodConfig {
                    primary_qr_standard: "DuitNow QR (PayNet National QR Standard)".to_string(),
                    instant_clearing_rail: "FPX Online Banking & DuitNow Transfer".to_string(),
                    supported_methods: vec!["DuitNow QR".to_string(), "FPX B2B/B2C".to_string(), "Touch 'n Go eWallet".to_string(), "GrabPay MY".to_string(), "JomPAY".to_string()],
                },
                regional_integrations: RegionalIntegrationsConfig {
                    identity_verification_provider: "MyDigital ID / SSM e-Info".to_string(),
                    local_phone_prefix: "+60".to_string(),
                    open_banking_gateways: vec!["PayNet Gateway".to_string(), "Maybank Sandbox".to_string(), "CIMB API".to_string()],
                },
                einvoicing: EInvoicingConfig {
                    framework_name: "LHDN MyInvois System".to_string(),
                    standard_specification: "LHDN MyInvois UBL 2.1 XML / JSON SDK".to_string(),
                    participant_id_format: "TIN (e.g. C2584920100)".to_string(),
                    mandate_status: "Mandatory Phased Rollout (2024 - 2025)".to_string(),
                    digital_signature_required: true,
                },
            },

            CountryCode::Thailand => CountryPack {
                country_code: CountryCode::Thailand,
                country_name: "Thailand".to_string(),
                flag_emoji: "🇹🇭".to_string(),
                currency: CurrencyConfig {
                    code: "THB".to_string(),
                    symbol: "฿".to_string(),
                    minor_units: 2,
                    decimal_separator: '.',
                    thousands_separator: ',',
                    sample_formatted: "฿1,250.00".to_string(),
                },
                timezone: TimezoneConfig {
                    iana_id: "Asia/Bangkok".to_string(),
                    display_name: "ICT (UTC+7)".to_string(),
                    utc_offset_hours: 7,
                },
                tax: TaxConfig {
                    tax_name: "VAT".to_string(),
                    standard_rate_percent: 7.0,
                    zero_rate_percent: 0.0,
                    tax_authority: "The Revenue Department of Thailand (กรมสรรพากร)".to_string(),
                    tax_id_label: "13-Digit Tax Identification Number (เลขประจำตัวผู้เสียภาษี)".to_string(),
                    sample_tax_id: "0105556123456 / Branch 00000".to_string(),
                },
                invoice_conventions: InvoiceConventions {
                    document_title: "ใบกำกับภาษี / Tax Invoice".to_string(),
                    number_prefix: "INV-TH-".to_string(),
                    requires_branch_code: true,
                    required_header_fields: vec![
                        "ใบกำกับภาษี (Tax Invoice) Title".to_string(),
                        "13-Digit Tax ID (Supplier & Customer)".to_string(),
                        "Head Office (สำนักงานใหญ่) / Branch Code".to_string(),
                        "Amount in Baht and Thai Text (บาทถ้วน)".to_string(),
                    ],
                    legal_footer_text: "เอกสารนี้ออกโดยระบบอิเล็กทรอนิกส์ตามประมวลรัษฎากร กรมสรรพากร".to_string(),
                },
                communication_rules: CommunicationRules {
                    privacy_regulation: "PDPA B.E. 2562 (2019) & Debt Collection Act B.E. 2558 (2015)".to_string(),
                    mandatory_opt_out_keyword: "ยกเลิก".to_string(),
                    max_promotional_per_week: 1, // Strict collection act limit
                    dual_language_mandate: false,
                    opt_out_footer_template: "พิมพ์ ยกเลิก หรือ STOP เพื่อยกเลิกข้อความ. Nexus Thailand.".to_string(),
                },
                calling_windows: CallingWindowRules {
                    window_display: "08:00 - 20:00 ICT (Mon-Fri), 08:00 - 18:00 (Sat)".to_string(),
                    start_hour_local: 8,
                    end_hour_local: 20,
                    saturday_end_hour_local: 18,
                    sunday_calling_allowed: false,
                    dnc_registry_name: "NBTC Do Not Call Registry".to_string(),
                    max_daily_attempts_per_debtor: 1, // Enforced by Debt Collection Act
                },
                languages: LanguageConfig {
                    primary_locale: "th-TH".to_string(),
                    supported_locales: vec!["th-TH".to_string(), "en-TH".to_string()],
                    default_ai_voice: "Kanya (Thai Natural Voice)".to_string(),
                    code_switching_supported: true,
                    calendar_system: "Buddhist Era (BE)".to_string(),
                },
                payment_methods: PaymentMethodConfig {
                    primary_qr_standard: "PromptPay QR (Thai QR Payment Standard)".to_string(),
                    instant_clearing_rail: "PromptPay Interbank Direct Clearing".to_string(),
                    supported_methods: vec!["PromptPay QR".to_string(), "TrueMoney Wallet".to_string(), "Rabbit LINE Pay".to_string(), "SCB/KBank/BBL Transfer".to_string()],
                },
                regional_integrations: RegionalIntegrationsConfig {
                    identity_verification_provider: "NDID / ThaiD Digital ID".to_string(),
                    local_phone_prefix: "+66".to_string(),
                    open_banking_gateways: vec!["PromptPay API".to_string(), "SCB Open Banking".to_string(), "Omise / 2C2P Gateway".to_string()],
                },
                einvoicing: EInvoicingConfig {
                    framework_name: "e-Tax Invoice & e-Receipt by Thai Revenue Department".to_string(),
                    standard_specification: "ETDA Standard TIS 2378-2560 (UN/CEFACT XML)".to_string(),
                    participant_id_format: "13-Digit Tax ID + 5-Digit Branch (e.g. 0105556123456-00000)".to_string(),
                    mandate_status: "Mandatory for Large Taxpayers; Voluntary for SMEs with Tax Deduction".to_string(),
                    digital_signature_required: true,
                },
            },
        }
    }

    /// Format currency amounts with localized symbol and separators
    pub fn format_currency(code: CountryCode, amount: f64) -> String {
        let pack = Self::get_country_pack(code);
        match code {
            CountryCode::Singapore => format!("S${:.2}", amount),
            CountryCode::Malaysia => format!("RM {:.2}", amount),
            CountryCode::Thailand => format!("฿{:.2}", amount),
        }
    }

    /// Calculate tax amount and total based on country standard tax rate
    pub fn calculate_tax(code: CountryCode, subtotal: f64, is_exempt: bool) -> (f64, f64) {
        if is_exempt || subtotal <= 0.0 {
            return (0.0, subtotal);
        }
        let pack = Self::get_country_pack(code);
        let tax_rate = pack.tax.standard_rate_percent / 100.0;
        let tax_amount = (subtotal * tax_rate * 100.0).round() / 100.0;
        let total = ((subtotal + tax_amount) * 100.0).round() / 100.0;
        (tax_amount, total)
    }

    /// Evaluate whether outbound calling is legally permitted at this time
    pub fn evaluate_calling_window(
        code: CountryCode,
        utc_hour: u8,
        weekday_mon_to_sun: u8, // 1 = Monday, ..., 7 = Sunday
    ) -> (bool, String) {
        let pack = Self::get_country_pack(code);
        let offset = pack.timezone.utc_offset_hours;
        let local_hour = ((utc_hour as i16 + offset as i16) % 24) as u8;

        // Sunday calling is strictly prohibited across all three countries
        if weekday_mon_to_sun == 7 {
            return (false, format!("Prohibited: Sunday calling banned in {}", pack.country_name));
        }

        // Saturday rules
        if weekday_mon_to_sun == 6 {
            let sat_limit = pack.calling_windows.saturday_end_hour_local;
            if local_hour >= pack.calling_windows.start_hour_local && local_hour < sat_limit {
                return (true, format!("Allowed: Within Saturday hours ({} local)", pack.timezone.display_name));
            } else {
                return (false, format!("Outside Saturday calling window for {}", pack.country_name));
            }
        }

        // Monday - Friday rules
        if local_hour >= pack.calling_windows.start_hour_local && local_hour < pack.calling_windows.end_hour_local {
            (true, format!("Allowed: Within legal calling window ({} local)", pack.timezone.display_name))
        } else {
            (false, format!("Outside permitted calling window ({}:00 - {}:00 {})", 
                pack.calling_windows.start_hour_local, 
                pack.calling_windows.end_hour_local, 
                pack.timezone.display_name
            ))
        }
    }

    /// Validate invoice data readiness for regional e-invoicing transmission
    pub fn validate_einvoice_readiness(
        code: CountryCode,
        tax_id: &str,
        branch_code: Option<&str>,
        total: f64,
    ) -> Result<String, String> {
        if total <= 0.0 {
            return Err("Invoice total must be greater than zero".to_string());
        }

        match code {
            CountryCode::Singapore => {
                if tax_id.trim().len() < 9 {
                    return Err("Invalid Singapore UEN: UEN must be at least 9 characters".to_string());
                }
                Ok(format!("Validated for InvoiceNow Peppol BIS 3.0 (Participant: 0195:{})", tax_id))
            }
            CountryCode::Malaysia => {
                if tax_id.trim().is_empty() {
                    return Err("Invalid Malaysia TIN: Tax Identification Number is mandatory for MyInvois".to_string());
                }
                Ok(format!("Validated for LHDN MyInvois SDK (TIN: {})", tax_id))
            }
            CountryCode::Thailand => {
                let clean_id = tax_id.replace('-', "").trim().to_string();
                if clean_id.len() != 13 || !clean_id.chars().all(|c| c.is_ascii_digit()) {
                    return Err("Invalid Thai Tax ID: Must be exactly 13 digits".to_string());
                }
                let branch = branch_code.unwrap_or("00000");
                Ok(format!("Validated for Thai RD e-Tax XML (Tax ID: {}, Branch: {})", clean_id, branch))
            }
        }
    }
}
