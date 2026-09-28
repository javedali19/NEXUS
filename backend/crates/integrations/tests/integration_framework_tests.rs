use platform_integrations::{
    ApiKeyConfig, ConnectorRegistry, IntegrationCapability, OAuth2Config, RateLimiter,
    RetryPolicy, StripeConnector, TwilioConnector,
};
use serde_json::json;

#[tokio::test]
async fn test_connector_discovery_and_registry() {
    let registry = ConnectorRegistry::new();
    let providers = registry.list_providers();

    assert!(providers.contains(&"stripe".to_string()));
    assert!(providers.contains(&"twilio".to_string()));
    assert!(providers.contains(&"salesforce".to_string()));

    let stripe = registry.get("stripe").unwrap();
    let capabilities = stripe.discover_capabilities();
    assert!(capabilities.contains(&IntegrationCapability::PaymentProcessing));
    assert!(capabilities.contains(&IntegrationCapability::RecurringBilling));
}

#[tokio::test]
async fn test_stripe_connection_testing() {
    let stripe = StripeConnector;

    // Test with missing credentials
    let empty_creds = json!({});
    let res1 = stripe.test_connection(&empty_creds).await.unwrap();
    assert!(!res1.is_successful);

    // Test with valid format key
    let valid_creds = json!({ "api_key": "sk_test_51MzProdEnterprise99" });
    let res2 = stripe.test_connection(&valid_creds).await.unwrap();
    assert!(res2.is_successful);
    assert!(res2.detected_account_id.is_some());
}

#[tokio::test]
async fn test_twilio_webhook_normalization() {
    let twilio = TwilioConnector;
    let payload = json!({
        "MessageSid": "SM9988112233",
        "From": "whatsapp:+15550199",
        "Body": "Payment wire initiated successfully"
    });

    let normalized = twilio
        .normalize_webhook("whatsapp_inbound", &payload)
        .unwrap();

    assert_eq!(
        normalized.canonical_event_type,
        "whatsapp.message_received.v1"
    );
    assert_eq!(normalized.entity_type, "conversations");
    assert_eq!(
        normalized.normalized_payload["text_body"],
        "Payment wire initiated successfully"
    );
}

#[test]
fn test_oauth2_token_expiration() {
    let mut oauth = OAuth2Config {
        client_id: "client_123".to_string(),
        client_secret: "secret_456".to_string(),
        token_url: "https://auth.example.com/oauth/token".to_string(),
        authorization_url: "https://auth.example.com/oauth/authorize".to_string(),
        access_token: None,
        refresh_token: Some("refresh_abc".to_string()),
        expires_at: None,
        scopes: vec!["crm.read".to_string()],
    };

    assert!(oauth.is_token_expired());

    // Update with 1 hour expiry
    oauth.update_tokens("access_xyz".to_string(), None, 3600);
    assert!(!oauth.is_token_expired());
    assert_eq!(oauth.access_token.unwrap(), "access_xyz");
}
