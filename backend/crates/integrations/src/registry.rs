use platform_common::PlatformError;
use std::collections::HashMap;
use std::sync::Arc;

use crate::connector::Connector;
use crate::providers::generic_rest::GenericRestConnector;
use crate::providers::salesforce::SalesforceConnector;
use crate::providers::stripe::StripeConnector;
use crate::providers::twilio::TwilioConnector;

/// Central Connector Registry storing and looking up provider adapters.
#[derive(Default, Clone)]
pub struct ConnectorRegistry {
    connectors: HashMap<String, Arc<dyn Connector>>,
}

impl ConnectorRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            connectors: HashMap::new(),
        };

        // Register default out-of-the-box connectors
        registry.register(Arc::new(StripeConnector));
        registry.register(Arc::new(TwilioConnector));
        registry.register(Arc::new(SalesforceConnector));
        registry.register(Arc::new(GenericRestConnector));

        registry
    }

    pub fn register(&mut self, connector: Arc<dyn Connector>) {
        self.connectors
            .insert(connector.provider_name().to_string(), connector);
    }

    pub fn get(&self, provider_name: &str) -> Result<Arc<dyn Connector>, PlatformError> {
        self.connectors
            .get(provider_name)
            .cloned()
            .ok_or_else(|| {
                PlatformError::NotFound(format!(
                    "Integration connector for provider '{}' not found in registry.",
                    provider_name
                ))
            })
    }

    pub fn list_providers(&self) -> Vec<String> {
        self.connectors.keys().cloned().collect()
    }
}
