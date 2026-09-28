use serde_json::json;
use uuid::Uuid;

use platform_domain::gcp_infrastructure::{
    simulate_terraform_provisioning, verify_production_readiness, EnvironmentTier, GcpServiceType,
};
use platform_domain::{AiToolGateway, ToolGatewayRequest};

#[test]
fn test_all_13_services_coverage() {
    let services = GcpServiceType::all_13_services();
    assert_eq!(services.len(), 13, "Must provision exactly 13 GCP services");

    let expected = vec![
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
    ];

    for svc in expected {
        assert!(services.contains(&svc));
        assert!(!svc.display_name().is_empty());
        assert!(!svc.category().is_empty());
    }
}

#[test]
fn test_multi_environment_tier_sizing_and_ha() {
    let dev = EnvironmentTier::Development;
    assert_eq!(dev.as_str(), "development");
    assert_eq!(dev.db_tier(), "db-f1-micro");
    assert!(!dev.is_ha_enabled());

    let staging = EnvironmentTier::Staging;
    assert_eq!(staging.as_str(), "staging");
    assert_eq!(staging.db_tier(), "db-custom-2-7680");
    assert!(staging.is_waf_required());

    let prod = EnvironmentTier::Production;
    assert_eq!(prod.as_str(), "production");
    assert_eq!(prod.db_tier(), "db-custom-4-15360");
    assert!(prod.is_ha_enabled());
    assert!(prod.is_waf_required());
}

#[test]
fn test_simulate_terraform_provisioning_and_readiness() {
    let (topology, resources, secrets) = simulate_terraform_provisioning(EnvironmentTier::Production, "nexus-erp-prod");

    assert_eq!(topology.total_services, 13);
    assert!(topology.all_13_services_healthy);
    assert!(topology.cmek_active);
    assert!(topology.waf_active);
    assert!(topology.zero_plaintext_keys_enforced);

    assert_eq!(resources.len(), 13);
    for res in &resources {
        assert_eq!(res.status, "healthy");
        assert_eq!(res.gcp_region, "us-central1");
    }

    // Verify Secret Manager references
    assert_eq!(secrets.len(), 6);
    for sec in &secrets {
        assert!(sec.is_value_hidden);
        assert!(!sec.referencing_services.is_empty());
    }

    // Production readiness verification
    assert!(verify_production_readiness(&topology).is_ok());

    // Negative check: Failure if CMEK is disabled in production
    let mut invalid_topology = topology.clone();
    invalid_topology.cmek_active = false;
    assert!(verify_production_readiness(&invalid_topology).is_err());
}

#[test]
fn test_ai_tool_gateway_provision_gcp_infrastructure() {
    let req = ToolGatewayRequest {
        organization_id: Uuid::new_v4(),
        agent_id: Some(Uuid::new_v4()),
        caller_role: "devops_engineer".to_string(),
        tool_name: "provision_gcp_infrastructure".to_string(),
        arguments: json!({
            "environment": "production",
            "action": "apply",
            "services": ["all"]
        }),
        idempotency_key: Some(format!("idem_infra_{}", Uuid::new_v4().simple())),
        correlation_id: format!("corr_infra_{}", Uuid::new_v4().simple()),
        granted_capabilities: vec!["infra:provision".to_string()],
    };

    let response = AiToolGateway::execute(req, None, 1).expect("Tool execution must succeed");
    assert_eq!(response.status, "success");
    assert_eq!(response.tool_name, "provision_gcp_infrastructure");

    let result = response.result.expect("Result payload must exist");
    assert_eq!(result["status"], "success");
    assert_eq!(result["environment"], "production");
    assert_eq!(result["services_provisioned"], 13);
    assert_eq!(result["cmek_active"], true);
    assert_eq!(result["waf_active"], true);
    assert_eq!(result["zero_plaintext_keys_enforced"], true);
}
