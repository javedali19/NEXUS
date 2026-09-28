use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use platform_common::PlatformError;

/// The 13 required GCP Infrastructure Services.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GcpServiceType {
    CloudRun,
    CloudSql,
    PubSub,
    CloudTasks,
    CloudScheduler,
    CloudStorage,
    SecretManager,
    CloudKms,
    ArtifactRegistry,
    Iam,
    Networking,
    Monitoring,
    CloudArmor,
}

impl GcpServiceType {
    pub fn all_13_services() -> Vec<GcpServiceType> {
        vec![
            GcpServiceType::CloudRun,
            GcpServiceType::CloudSql,
            GcpServiceType::PubSub,
            GcpServiceType::CloudTasks,
            GcpServiceType::CloudScheduler,
            GcpServiceType::CloudStorage,
            GcpServiceType::SecretManager,
            GcpServiceType::CloudKms,
            GcpServiceType::ArtifactRegistry,
            GcpServiceType::Iam,
            GcpServiceType::Networking,
            GcpServiceType::Monitoring,
            GcpServiceType::CloudArmor,
        ]
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            GcpServiceType::CloudRun => "1. Google Cloud Run (Serverless Microservices)",
            GcpServiceType::CloudSql => "2. Cloud SQL PostgreSQL 15 (Multi-Tenant RLS)",
            GcpServiceType::PubSub => "3. Cloud Pub/Sub (Event Bus & Dead-Letter)",
            GcpServiceType::CloudTasks => "4. Cloud Tasks (Multi-Tier Async Queues)",
            GcpServiceType::CloudScheduler => "5. Cloud Scheduler (Cron Jobs & OIDC)",
            GcpServiceType::CloudStorage => "6. Cloud Storage (CMEK Multi-Tenant Assets)",
            GcpServiceType::SecretManager => "7. Secret Manager (Third-Party API Credentials)",
            GcpServiceType::CloudKms => "8. Cloud KMS (CMEK Envelope Encryption)",
            GcpServiceType::ArtifactRegistry => "9. Artifact Registry (OCI Docker Containers)",
            GcpServiceType::Iam => "10. IAM & Service Identities (Least Privilege)",
            GcpServiceType::Networking => "11. Virtual Private Cloud & Serverless VPC Connector",
            GcpServiceType::Monitoring => "12. Cloud Monitoring & Alerting Policies",
            GcpServiceType::CloudArmor => "13. Cloud Armor Web Application Firewall (OWASP WAF)",
        }
    }

    pub fn category(&self) -> &'static str {
        match self {
            GcpServiceType::CloudRun => "compute",
            GcpServiceType::CloudSql | GcpServiceType::CloudStorage => "data",
            GcpServiceType::PubSub | GcpServiceType::CloudTasks | GcpServiceType::CloudScheduler => "messaging",
            GcpServiceType::SecretManager | GcpServiceType::CloudKms | GcpServiceType::CloudArmor | GcpServiceType::Iam => "security",
            GcpServiceType::ArtifactRegistry => "containers",
            GcpServiceType::Networking => "networking",
            GcpServiceType::Monitoring => "observability",
        }
    }
}

/// Deployment Environment Tier.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EnvironmentTier {
    Development,
    Staging,
    Production,
}

impl EnvironmentTier {
    pub fn as_str(&self) -> &'static str {
        match self {
            EnvironmentTier::Development => "development",
            EnvironmentTier::Staging => "staging",
            EnvironmentTier::Production => "production",
        }
    }

    pub fn db_tier(&self) -> &'static str {
        match self {
            EnvironmentTier::Development => "db-f1-micro",
            EnvironmentTier::Staging => "db-custom-2-7680",
            EnvironmentTier::Production => "db-custom-4-15360",
        }
    }

    pub fn is_ha_enabled(&self) -> bool {
        matches!(self, EnvironmentTier::Production)
    }

    pub fn is_waf_required(&self) -> bool {
        matches!(self, EnvironmentTier::Production | EnvironmentTier::Staging)
    }
}

/// Provisioned GCP Infrastructure Resource Record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GcpResource {
    pub id: Uuid,
    pub environment: EnvironmentTier,
    pub service_type: GcpServiceType,
    pub resource_name: String,
    pub gcp_region: String,
    pub status: String,
    pub cmek_key_id: Option<String>,
    pub is_ha_enabled: bool,
    pub metadata: Value,
}

/// Secret Manager Vault Entry (Strictly references metadata, never plaintext secret data).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretVaultEntry {
    pub secret_id: String,
    pub provider_name: String,
    pub referencing_services: Vec<String>,
    pub is_value_hidden: bool,
}

/// High-Level Infrastructure Topology Summary.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfrastructureTopology {
    pub environment: EnvironmentTier,
    pub project_id: String,
    pub region: String,
    pub total_services: usize,
    pub all_13_services_healthy: bool,
    pub cmek_active: bool,
    pub waf_active: bool,
    pub zero_plaintext_keys_enforced: bool,
}

/// Verifies that production infrastructure meets all enterprise governance constraints.
pub fn verify_production_readiness(
    topology: &InfrastructureTopology,
) -> Result<(), PlatformError> {
    if topology.environment == EnvironmentTier::Production {
        if !topology.all_13_services_healthy {
            return Err(PlatformError::ValidationError(
                "All 13 GCP infrastructure services must be provisioned and healthy for production deployment.".into(),
            ));
        }
        if !topology.cmek_active {
            return Err(PlatformError::SecurityViolation(
                "Cloud KMS Customer-Managed Encryption Keys (CMEK) must be active for all production data stores.".into(),
            ));
        }
        if !topology.waf_active {
            return Err(PlatformError::SecurityViolation(
                "Cloud Armor Web Application Firewall (WAF) with OWASP rules must be active in production.".into(),
            ));
        }
        if !topology.zero_plaintext_keys_enforced {
            return Err(PlatformError::SecurityViolation(
                "Plaintext credentials forbidden. All third-party API keys must be referenced via Google Secret Manager.".into(),
            ));
        }
    }
    Ok(())
}

/// Simulates Terraform plan & apply execution across the 13 required services.
pub fn simulate_terraform_provisioning(
    env: EnvironmentTier,
    project_id: &str,
) -> (InfrastructureTopology, Vec<GcpResource>, Vec<SecretVaultEntry>) {
    let region = "us-central1".to_string();
    let env_str = env.as_str();

    let resources: Vec<GcpResource> = GcpServiceType::all_13_services()
        .into_iter()
        .map(|service_type| {
            let (res_name, cmek, metadata) = match service_type {
                GcpServiceType::CloudRun => (
                    format!("{}-platform-api-gateway", env_str),
                    None,
                    json!({"min_instances": if env == EnvironmentTier::Production { 2 } else { 0 }, "vpc_egress": "private_ranges_only"}),
                ),
                GcpServiceType::CloudSql => (
                    format!("{}-platform-postgres-v15", env_str),
                    Some(format!("projects/{}/locations/{}/keyRings/{}-platform-keyring/cryptoKeys/{}-sql-key", project_id, region, env_str, env_str)),
                    json!({"engine": "PostgreSQL 15", "tier": env.db_tier(), "private_ip": true}),
                ),
                GcpServiceType::PubSub => (
                    format!("{}-platform-events-topic", env_str),
                    None,
                    json!({"dead_letter_topic": format!("{}-platform-deadletter-topic", env_str)}),
                ),
                GcpServiceType::CloudTasks => (
                    format!("{}-platform-default-queue", env_str),
                    None,
                    json!({"max_dispatches_per_sec": 500, "priority_queue": true, "dlq_queue": true}),
                ),
                GcpServiceType::CloudScheduler => (
                    format!("{}-platform-outbox-cron", env_str),
                    None,
                    json!({"schedule": "* * * * *", "auth": "oidc_token"}),
                ),
                GcpServiceType::CloudStorage => (
                    format!("{}-{}-tenant-assets", project_id, env_str),
                    Some(format!("projects/{}/locations/{}/keyRings/{}-platform-keyring/cryptoKeys/{}-storage-key", project_id, region, env_str, env_str)),
                    json!({"uniform_bucket_level_access": true, "nearline_days": 90, "coldline_days": 365}),
                ),
                GcpServiceType::SecretManager => (
                    format!("{}-secrets-vault", env_str),
                    None,
                    json!({"secrets_managed": 10, "accessor_role": "roles/secretmanager.secretAccessor"}),
                ),
                GcpServiceType::CloudKms => (
                    format!("{}-platform-keyring", env_str),
                    None,
                    json!({"rotation_period_days": 90, "keys": ["sql-key", "storage-key", "app-data-key"]}),
                ),
                GcpServiceType::ArtifactRegistry => (
                    format!("{}-platform", env_str),
                    None,
                    json!({"format": "DOCKER", "vulnerability_scanning": true}),
                ),
                GcpServiceType::Iam => (
                    format!("{}-iam-identities", env_str),
                    None,
                    json!({"service_accounts": ["sa-github-deployer", "sa-platform-runner", "sa-tasks-invoker"]}),
                ),
                GcpServiceType::Networking => (
                    format!("{}-platform-vpc", env_str),
                    None,
                    json!({"vpc_cidr": "10.10.0.0/20", "serverless_connector": format!("{}-vpc-conn", env_str)}),
                ),
                GcpServiceType::Monitoring => (
                    format!("{}-platform-observability", env_str),
                    None,
                    json!({"alert_policies_count": 3, "dashboard": "operational-overview"}),
                ),
                GcpServiceType::CloudArmor => (
                    format!("{}-cloud-armor-policy", env_str),
                    None,
                    json!({"rules": ["sqli-v33", "xss-v33", "lfi-v33", "rce-v33"], "rate_limit": "1000/min"}),
                ),
            };

            GcpResource {
                id: Uuid::new_v4(),
                environment: env,
                service_type,
                resource_name: res_name,
                gcp_region: region.clone(),
                status: "healthy".to_string(),
                cmek_key_id: cmek,
                is_ha_enabled: env.is_ha_enabled(),
                metadata,
            }
        })
        .collect();

    let secrets: Vec<SecretVaultEntry> = vec![
        SecretVaultEntry {
            secret_id: format!("{}-stripe-secret-key", env_str),
            provider_name: "stripe".to_string(),
            referencing_services: vec!["platform-api-gateway".to_string(), "platform-worker".to_string()],
            is_value_hidden: true,
        },
        SecretVaultEntry {
            secret_id: format!("{}-razorpay-key-secret", env_str),
            provider_name: "razorpay".to_string(),
            referencing_services: vec!["platform-api-gateway".to_string()],
            is_value_hidden: true,
        },
        SecretVaultEntry {
            secret_id: format!("{}-twilio-auth-token", env_str),
            provider_name: "twilio".to_string(),
            referencing_services: vec!["platform-api-gateway".to_string(), "platform-worker".to_string()],
            is_value_hidden: true,
        },
        SecretVaultEntry {
            secret_id: format!("{}-meta-whatsapp-token", env_str),
            provider_name: "meta_whatsapp".to_string(),
            referencing_services: vec!["platform-api-gateway".to_string(), "platform-worker".to_string()],
            is_value_hidden: true,
        },
        SecretVaultEntry {
            secret_id: format!("{}-gemini-api-key", env_str),
            provider_name: "gemini_ai".to_string(),
            referencing_services: vec!["platform-api-gateway".to_string(), "platform-worker".to_string()],
            is_value_hidden: true,
        },
        SecretVaultEntry {
            secret_id: format!("{}-sentry-dsn", env_str),
            provider_name: "sentry".to_string(),
            referencing_services: vec!["platform-api-gateway".to_string(), "platform-web".to_string()],
            is_value_hidden: true,
        },
    ];

    let topology = InfrastructureTopology {
        environment: env,
        project_id: project_id.to_string(),
        region,
        total_services: resources.len(),
        all_13_services_healthy: true,
        cmek_active: true,
        waf_active: env.is_waf_required(),
        zero_plaintext_keys_enforced: true,
    };

    (topology, resources, secrets)
}
