use platform_common::PlatformError;
use std::collections::HashMap;
use std::sync::Arc;

use super::airwallex::AirwallexAdapter;
use super::cashfree::CashfreeAdapter;
use super::gateway::PaymentGateway;
use super::hitpay::HitPayAdapter;
use super::razorpay::RazorpayAdapter;

/// Dynamic market router for choosing optimal gateway by currency / country
pub struct PaymentRouter {
    gateways: HashMap<String, Arc<dyn PaymentGateway>>,
}

impl Default for PaymentRouter {
    fn default() -> Self {
        let mut gateways: HashMap<String, Arc<dyn PaymentGateway>> = HashMap::new();
        gateways.insert("razorpay".into(), Arc::new(RazorpayAdapter));
        gateways.insert("hitpay".into(), Arc::new(HitPayAdapter));
        gateways.insert("airwallex".into(), Arc::new(AirwallexAdapter));
        gateways.insert("cashfree".into(), Arc::new(CashfreeAdapter));

        Self { gateways }
    }
}

impl PaymentRouter {
    pub fn get_gateway(&self, provider_code: &str) -> Option<Arc<dyn PaymentGateway>> {
        self.gateways.get(provider_code).cloned()
    }

    /// Select optimal payment provider based on customer billing currency
    pub fn select_provider_for_market(&self, currency: &str) -> &'static str {
        match currency.to_uppercase().as_str() {
            "INR" => "razorpay",
            "SGD" | "MYR" => "hitpay",
            "EUR" | "GBP" | "AUD" | "CAD" | "JPY" | "HKD" => "airwallex",
            _ => "stripe",
        }
    }
}
