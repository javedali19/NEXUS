use platform_common::PlatformError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fmt;

/// Semantic Schema Version representation.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct SchemaVersion {
    pub major: u32,
    pub minor: u32,
    pub patch: u32,
}

impl SchemaVersion {
    pub const V1_0_0: Self = Self {
        major: 1,
        minor: 0,
        patch: 0,
    };

    pub fn new(major: u32, minor: u32, patch: u32) -> Self {
        Self {
            major,
            minor,
            patch,
        }
    }

    pub fn parse(s: &str) -> Result<Self, PlatformError> {
        let parts: Vec<&str> = s.split('.').collect();
        if parts.len() != 3 {
            return Err(PlatformError::ValidationError(format!(
                "Invalid schema version string '{}', expected 'major.minor.patch'",
                s
            )));
        }

        let major = parts[0]
            .parse::<u32>()
            .map_err(|_| PlatformError::ValidationError(format!("Invalid major version in '{}'", s)))?;
        let minor = parts[1]
            .parse::<u32>()
            .map_err(|_| PlatformError::ValidationError(format!("Invalid minor version in '{}'", s)))?;
        let patch = parts[2]
            .parse::<u32>()
            .map_err(|_| PlatformError::ValidationError(format!("Invalid patch version in '{}'", s)))?;

        Ok(Self {
            major,
            minor,
            patch,
        })
    }

    /// Checks if this version is backward-compatible with the required consumer version (same major).
    pub fn is_compatible_with(&self, consumer_version: &SchemaVersion) -> bool {
        self.major == consumer_version.major && self.minor >= consumer_version.minor
    }
}

impl fmt::Display for SchemaVersion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}.{}.{}", self.major, self.minor, self.patch)
    }
}

/// Upcaster function signature that converts an older schema JSON payload to the next version.
pub type UpcasterFn = Box<dyn Fn(Value) -> Result<Value, PlatformError> + Send + Sync>;

/// Event Upcasting Registry enabling seamless evolution of event payloads across versions.
#[derive(Default)]
pub struct EventUpcasterRegistry {
    // Key: (event_type, source_version_string, target_version_string)
    upcasters: HashMap<(String, String, String), UpcasterFn>,
}

impl EventUpcasterRegistry {
    pub fn new() -> Self {
        Self {
            upcasters: HashMap::new(),
        }
    }

    /// Registers an upcaster for a specific transition between versions.
    pub fn register_upcaster(
        &mut self,
        event_type: impl Into<String>,
        from_version: impl Into<String>,
        to_version: impl Into<String>,
        upcaster: UpcasterFn,
    ) {
        self.upcasters.insert(
            (event_type.into(), from_version.into(), to_version.into()),
            upcaster,
        );
    }

    /// Upcasts a payload from `source_version` to `target_version` if a transition is registered.
    pub fn upcast(
        &self,
        event_type: &str,
        source_version: &str,
        target_version: &str,
        payload: Value,
    ) -> Result<Value, PlatformError> {
        if source_version == target_version {
            return Ok(payload);
        }

        let key = (
            event_type.to_string(),
            source_version.to_string(),
            target_version.to_string(),
        );

        if let Some(upcaster) = self.upcasters.get(&key) {
            upcaster(payload)
        } else {
            Err(PlatformError::ValidationError(format!(
                "No upcaster registered for event '{}' from version {} to {}",
                event_type, source_version, target_version
            )))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_schema_version_parsing_and_compatibility() {
        let v1 = SchemaVersion::parse("1.0.0").unwrap();
        let v1_1 = SchemaVersion::parse("1.1.0").unwrap();
        let v2 = SchemaVersion::parse("2.0.0").unwrap();

        assert_eq!(v1.to_string(), "1.0.0");
        assert!(v1_1.is_compatible_with(&v1));
        assert!(!v2.is_compatible_with(&v1));
    }

    #[test]
    fn test_event_upcaster() {
        let mut registry = EventUpcasterRegistry::new();

        // Register v1.0.0 -> v2.0.0 upcaster for customer.created
        // Suppose v1 had separate "first_name" and "last_name", and v2 requires "full_name"
        registry.register_upcaster(
            "customer.created",
            "1.0.0",
            "2.0.0",
            Box::new(|v1_payload| {
                let first = v1_payload.get("first_name").and_then(|v| v.as_str()).unwrap_or("");
                let last = v1_payload.get("last_name").and_then(|v| v.as_str()).unwrap_or("");
                let mut v2_payload = v1_payload.clone();
                v2_payload["full_name"] = json!(format!("{} {}", first, last).trim());
                Ok(v2_payload)
            }),
        );

        let v1_data = json!({
            "first_name": "Elena",
            "last_name": "Rostova",
            "email": "elena@enterprise.internal"
        });

        let upcasted = registry
            .upcast("customer.created", "1.0.0", "2.0.0", v1_data)
            .unwrap();

        assert_eq!(upcasted["full_name"], "Elena Rostova");
        assert_eq!(upcasted["email"], "elena@enterprise.internal");
    }
}
