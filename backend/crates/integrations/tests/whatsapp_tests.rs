use chrono::Utc;
use hmac::{Hmac, Mac};
use serde_json::json;
use sha2::Sha256;

use platform_integrations::communications::whatsapp::{
    InboundMessage, MessageDirection, MessageStatus, MessageType, WhatsAppAdapter,
};

type HmacSha256 = Hmac<Sha256>;

#[test]
fn test_phone_number_e164_normalization() {
    assert_eq!(
        WhatsAppAdapter::normalize_phone_e164("+1 (555) 234-5678").unwrap(),
        "+15552345678"
    );
    assert_eq!(
        WhatsAppAdapter::normalize_phone_e164("919876543210").unwrap(),
        "+919876543210"
    );
    assert_eq!(
        WhatsAppAdapter::normalize_phone_e164("+91 98765 43210").unwrap(),
        "+919876543210"
    );
    assert!(WhatsAppAdapter::normalize_phone_e164("123").is_err());
}

#[test]
fn test_service_window_active() {
    let now = Utc::now();
    assert!(WhatsAppAdapter::is_service_window_active(Some(now)));

    let twenty_five_hours_ago = now - chrono::Duration::hours(25);
    assert!(!WhatsAppAdapter::is_service_window_active(Some(twenty_five_hours_ago)));
    assert!(!WhatsAppAdapter::is_service_window_active(None));
}

#[test]
fn test_consent_keywords_evaluation() {
    let (opt_out, opt_in) = WhatsAppAdapter::evaluate_consent_keywords("STOP");
    assert!(opt_out);
    assert!(!opt_in);

    let (opt_out, opt_in) = WhatsAppAdapter::evaluate_consent_keywords("unsubscribe");
    assert!(opt_out);
    assert!(!opt_in);

    let (opt_out, opt_in) = WhatsAppAdapter::evaluate_consent_keywords("START");
    assert!(!opt_out);
    assert!(opt_in);

    let (opt_out, opt_in) = WhatsAppAdapter::evaluate_consent_keywords("Hello there");
    assert!(!opt_out);
    assert!(!opt_in);
}

#[test]
fn test_webhook_handshake_verification() {
    let challenge = WhatsAppAdapter::verify_webhook_handshake(
        Some("subscribe"),
        Some("my_secret_token_123"),
        Some("challenge_abc_xyz"),
        "my_secret_token_123",
    );
    assert_eq!(challenge.unwrap(), "challenge_abc_xyz");

    let invalid = WhatsAppAdapter::verify_webhook_handshake(
        Some("subscribe"),
        Some("wrong_token"),
        Some("challenge_abc_xyz"),
        "my_secret_token_123",
    );
    assert!(invalid.is_err());
}

#[test]
fn test_crypto_hub_signature_verification() {
    let body = b"{\"event\":\"messages\"}";
    let app_secret = "meta_app_secret_test_key_9942";

    let mut mac = HmacSha256::new_from_slice(app_secret.as_bytes()).unwrap();
    mac.update(body);
    let signature = hex::encode(mac.finalize().into_bytes());
    let header = format!("sha256={}", signature);

    assert!(WhatsAppAdapter::verify_hub_signature(body, &header, app_secret).is_ok());
    assert!(WhatsAppAdapter::verify_hub_signature(body, "sha256=invalidhex0000", app_secret).is_err());
}

#[test]
fn test_parse_inbound_and_status_webhook() {
    let payload = json!({
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "100234892839",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "15550234567",
                        "phone_number_id": "109283918239"
                    },
                    "messages": [{
                        "from": "15559876543",
                        "id": "wamid.HBgLMTU1NTk4NzY1NDMVAgASGBwwM0E4",
                        "timestamp": "1727000000",
                        "text": {
                            "body": "Hello, please send the invoice PDF for project Nexus."
                        },
                        "type": "text"
                    }],
                    "statuses": [{
                        "id": "wamid.HBgLMTU1NTk4NzY1NDMVAgASGBwwM0E3",
                        "status": "delivered",
                        "timestamp": "1727000005",
                        "recipient_id": "15559876543"
                    }]
                },
                "field": "messages"
            }]
        }]
    });

    let (inbound, statuses) = WhatsAppAdapter::parse_webhook_payload(&payload).unwrap();
    assert_eq!(inbound.len(), 1);
    assert_eq!(inbound[0].from_phone, "+15559876543");
    assert_eq!(inbound[0].message_type, MessageType::Text);
    assert_eq!(
        inbound[0].text_body.as_deref(),
        Some("Hello, please send the invoice PDF for project Nexus.")
    );

    assert_eq!(statuses.len(), 1);
    assert_eq!(statuses[0].status, MessageStatus::Delivered);
    assert_eq!(statuses[0].recipient_id, "+15559876543");
}
