use platform_common::PlatformError;
use std::collections::HashMap;
use std::sync::Arc;

use super::connector::AccountingConnector;
use super::quickbooks::QuickBooksAdapter;
use super::xero::XeroAdapter;
use super::zoho_books::ZohoBooksAdapter;

/// Accounting Sync Orchestrator
pub struct AccountingOrchestrator {
    connectors: HashMap<String, Arc<dyn AccountingConnector>>,
}

impl Default for AccountingOrchestrator {
    fn default() -> Self {
        let mut connectors: HashMap<String, Arc<dyn AccountingConnector>> = HashMap::new();
        connectors.insert("xero".into(), Arc::new(XeroAdapter));
        connectors.insert("zoho_books".into(), Arc::new(ZohoBooksAdapter));
        connectors.insert("quickbooks".into(), Arc::new(QuickBooksAdapter));

        Self { connectors }
    }
}

impl AccountingOrchestrator {
    pub fn get_connector(&self, provider_code: &str) -> Option<Arc<dyn AccountingConnector>> {
        self.connectors.get(provider_code).cloned()
    }
}
