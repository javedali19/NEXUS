use serde_json::json;
use uuid::Uuid;

use platform_common::PlatformError;
use platform_domain::cicd_pipeline::{
    evaluate_10_validation_gates, execute_cicd_pipeline_simulation,
    validate_workload_identity_config, GateStatus, ValidationGateType, WorkloadIdentityConfig,
};
use platform_domain::{AiToolGateway, ToolGatewayRequest};

#[test]
fn test_10_validation_gates_coverage() {
    let gates = ValidationGateType::all_10_gates();
    assert_eq!(gates.len(), 10, "CI/CD must evaluate exactly 10 validation gates");

    let expected_gates = vec![
        ValidationGateType::Frontend,
        ValidationGateType::TypeScript,
        ValidationGateType::Lint,
        ValidationGateType::Rust,
        ValidationGateType::Tests,
        ValidationGateType::Migrations,
        ValidationGateType::Security,
        ValidationGateType::DependencyVulnerabilities,
        ValidationGateType::Containers,
        ValidationGateType::Terraform,
    ];

    for expected in expected_gates {
        assert!(gates.contains(&expected), "Missing gate: {:?}", expected);
        assert!(!expected.display_name().is_empty());
        assert!(!expected.category().is_empty());
    }

    let run_id = Uuid::new_v4();
    let evaluations = evaluate_10_validation_gates(run_id, "8f32acb9e110294b");
    assert_eq!(evaluations.len(), 10);
    for eval in &evaluations {
        assert_eq!(eval.status, GateStatus::Passed);
        assert!(eval.duration_seconds > 0);
    }
}

#[test]
fn test_workload_identity_federation_config_validation() {
    let valid_config = WorkloadIdentityConfig {
        project_number: "109283746501".to_string(),
        pool_id: "github-actions-pool".to_string(),
        provider_id: "github-actions-provider".to_string(),
        service_account_email: "sa-github-deployer@nexus-erp-prod.iam.gserviceaccount.com".to_string(),
        github_repository: "nexus-erp/core-platform".to_string(),
        token_format: "access_token".to_string(),
        prohibited_private_key: None,
    };

    let provider_path = validate_workload_identity_config(&valid_config).expect("Valid WIF config must succeed");
    assert_eq!(
        provider_path,
        "projects/109283746501/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"
    );
}

#[test]
fn test_strict_rejection_of_long_lived_gcp_keys() {
    // 1. Prohibited private key in dedicated field
    let malicious_config_1 = WorkloadIdentityConfig {
        project_number: "109283746501".to_string(),
        pool_id: "github-actions-pool".to_string(),
        provider_id: "github-actions-provider".to_string(),
        service_account_email: "sa-github-deployer@nexus-erp-prod.iam.gserviceaccount.com".to_string(),
        github_repository: "nexus-erp/core-platform".to_string(),
        token_format: "access_token".to_string(),
        prohibited_private_key: Some("-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC...".to_string()),
    };

    match validate_workload_identity_config(&malicious_config_1) {
        Err(PlatformError::SecurityViolation(msg)) => {
            assert!(msg.contains("long-lived GCP service-account JSON keys are strictly forbidden"));
        }
        other => panic!("Expected SecurityViolation for stored private key, got: {:?}", other),
    }

    // 2. Prohibited private key leaked in service account identifier
    let malicious_config_2 = WorkloadIdentityConfig {
        project_number: "109283746501".to_string(),
        pool_id: "github-actions-pool".to_string(),
        provider_id: "github-actions-provider".to_string(),
        service_account_email: "{\"type\": \"service_account\", \"project_id\": \"nexus\"}".to_string(),
        github_repository: "nexus-erp/core-platform".to_string(),
        token_format: "access_token".to_string(),
        prohibited_private_key: None,
    };

    match validate_workload_identity_config(&malicious_config_2) {
        Err(PlatformError::SecurityViolation(msg)) => {
            assert!(msg.contains("never private key credentials"));
        }
        other => panic!("Expected SecurityViolation for JSON key in email field, got: {:?}", other),
    }
}

#[test]
fn test_cicd_pipeline_simulation_and_deployment() {
    let org_id = Uuid::new_v4();
    let wif_config = WorkloadIdentityConfig {
        project_number: "109283746501".to_string(),
        pool_id: "github-actions-pool".to_string(),
        provider_id: "github-actions-provider".to_string(),
        service_account_email: "sa-github-deployer@nexus-erp-prod.iam.gserviceaccount.com".to_string(),
        github_repository: "nexus-erp/core-platform".to_string(),
        token_format: "access_token".to_string(),
        prohibited_private_key: None,
    };

    let (run, gates, deployments) = execute_cicd_pipeline_simulation(
        org_id,
        "main",
        "8f32acb9e110294b8e2190f845a7c293b6e82a91",
        "feat(cicd): enforce GCP Workload Identity Federation",
        "platform-architect@nexus-erp.com",
        &wif_config,
    )
    .expect("CI/CD pipeline simulation must succeed");

    assert_eq!(run.status, "passed");
    assert_eq!(run.gates_total, 10);
    assert_eq!(run.gates_passed, 10);
    assert_eq!(gates.len(), 10);
    assert_eq!(deployments.len(), 2);

    for dep in &deployments {
        assert_eq!(dep.auth_mechanism, "wif_oidc");
        assert_eq!(dep.status, "healthy");
        assert!(dep.endpoint_url.contains("run.app"));
    }
}

#[test]
fn test_ai_tool_gateway_trigger_cicd_pipeline() {
    let req = ToolGatewayRequest {
        organization_id: Uuid::new_v4(),
        agent_id: Some(Uuid::new_v4()),
        caller_role: "devops_engineer".to_string(),
        tool_name: "trigger_cicd_pipeline".to_string(),
        arguments: json!({
            "branch": "main",
            "pipeline_type": "ci_cd",
            "target_service": "all"
        }),
        idempotency_key: Some(format!("idem_cicd_{}", Uuid::new_v4().simple())),
        correlation_id: format!("corr_cicd_{}", Uuid::new_v4().simple()),
        granted_capabilities: vec!["cicd:deploy".to_string()],
    };

    let response = AiToolGateway::execute(req, None, 1).expect("Tool execution must succeed");
    assert_eq!(response.status, "success");
    assert_eq!(response.tool_name, "trigger_cicd_pipeline");

    let result = response.result.expect("Result payload must be present");
    assert_eq!(result["status"], "in_progress");
    assert_eq!(result["gates_evaluated"], 10);
    assert_eq!(result["auth_mechanism"], "gcp_workload_identity_federation");
    assert_eq!(result["wif_oidc_configured"], true);
    assert_eq!(result["long_lived_keys_permitted"], false);
    assert!(response.policies_evaluated.contains(&"CAPABILITY_AUTHORIZATION_GATE".to_string()));
}
