use chrono::Utc;
use platform_events::{
    create_event_envelope, CloudEventMessage, ConsentGrantedV1, CustomerCreatedV1,
    DealStageAdvancedV1, EventEnvelope, EventPublisher, EventUpcasterRegistry,
    IdempotencyService, InMemoryEventPublisher, InvoiceIssuedV1, SchemaVersion, TraceContext,
};
use serde_json::json;
use uuid::Uuid;

#[test]
fn test_canonical_event_envelope_fields() {
    let org_id = Uuid::new_v4();
    let bu_id = Uuid::new_v4();
    let customer_id = Uuid::new_v4();
    let trace = TraceContext::new_root();

    let customer_event = CustomerCreatedV1 {
        customer_id,
        account_id: None,
        first_name: "John".to_string(),
        last_name: "Doe".to_string(),
        email: "john.doe@enterprise.internal".to_string(),
        phone: Some("+1-555-0199".to_string()),
        lifecycle_stage: "customer".to_string(),
        lead_score: 85,
        created_by: None,
    };

    let envelope = EventEnvelope::new(
        "customer.created.v1",
        org_id,
        Some(bu_id),
        "customer",
        customer_id,
        "nexus_crm",
        "1.0.0",
        Some(&trace),
        customer_event.clone(),
    );

    assert_eq!(envelope.organization_id, org_id);
    assert_eq!(envelope.business_unit_id, Some(bu_id));
    assert_eq!(envelope.entity_type, "customer");
    assert_eq!(envelope.entity_id, customer_id);
    assert_eq!(envelope.source_system, "nexus_crm");
    assert_eq!(envelope.schema_version, "1.0.0");
    assert_eq!(envelope.correlation_id, trace.correlation_id);
    assert_eq!(envelope.causation_id, None);
    assert_eq!(envelope.payload, customer_event);
}

#[test]
fn test_correlation_and_causation_lineage() {
    let org_id = Uuid::new_v4();
    let invoice_id = Uuid::new_v4();
    let root_trace = TraceContext::new_root();

    // 1. Root Event: Invoice Issued
    let invoice_event = InvoiceIssuedV1 {
        invoice_id,
        customer_id: Uuid::new_v4(),
        invoice_number: "INV-2026-9901".to_string(),
        subtotal: 10000.0,
        tax_amount: 800.0,
        total_amount: 10800.0,
        currency: "USD".to_string(),
        due_date: Utc::now(),
        line_items_count: 3,
    };

    let root_envelope = EventEnvelope::new(
        "invoice.issued.v1",
        org_id,
        None,
        "invoice",
        invoice_id,
        "nexus_erp",
        "1.0.0",
        Some(&root_trace),
        invoice_event,
    );

    // 2. Consequential Child Event: Consent Granted (e.g. for automatic payments)
    let consent_id = Uuid::new_v4();
    let consent_event = ConsentGrantedV1 {
        consent_id,
        customer_id: Uuid::new_v4(),
        consent_type: "auto_debit".to_string(),
        channel: "portal".to_string(),
        ip_address: Some("192.168.1.1".to_string()),
        valid_until: None,
    };

    let child_envelope = root_envelope.derive_child(
        "consent.granted.v1",
        "consent",
        consent_id,
        "nexus_compliance",
        "1.0.0",
        consent_event,
    );

    assert_eq!(child_envelope.correlation_id, root_envelope.correlation_id);
    assert_eq!(child_envelope.causation_id, Some(root_envelope.event_id));

    // 3. Grandchild Event: Deal stage advanced
    let deal_id = Uuid::new_v4();
    let deal_event = DealStageAdvancedV1 {
        deal_id,
        old_stage: "negotiation".to_string(),
        new_stage: "closed_won".to_string(),
        probability: 1.0,
        expected_close_date: Some(Utc::now()),
    };

    let grandchild_envelope = child_envelope.derive_child(
        "deal.stage_advanced.v1",
        "deal",
        deal_id,
        "nexus_crm",
        "1.0.0",
        deal_event,
    );

    assert_eq!(grandchild_envelope.correlation_id, root_envelope.correlation_id);
    assert_eq!(grandchild_envelope.causation_id, Some(child_envelope.event_id));
}

#[tokio::test]
async fn test_in_memory_publisher_batch_dispatch() {
    let publisher = InMemoryEventPublisher::new();
    let org_id = Uuid::new_v4();

    let e1 = EventEnvelope::new(
        "customer.created.v1",
        org_id,
        None,
        "customer",
        Uuid::new_v4(),
        "nexus_crm",
        "1.0.0",
        None,
        json!({ "name": "Customer 1" }),
    )
    .to_raw()
    .unwrap();

    let e2 = EventEnvelope::new(
        "invoice.issued.v1",
        org_id,
        None,
        "invoice",
        Uuid::new_v4(),
        "nexus_erp",
        "1.0.0",
        None,
        json!({ "total": 5000 }),
    )
    .to_raw()
    .unwrap();

    let count = publisher.publish_batch(&[e1, e2]).await.unwrap();
    assert_eq!(count, 2);
    assert_eq!(publisher.len(), 2);

    let published = publisher.get_published_events();
    assert_eq!(published[0].event_type, "customer.created.v1");
    assert_eq!(published[1].event_type, "invoice.issued.v1");
}

#[test]
fn test_cloudevents_export_format() {
    let org_id = Uuid::new_v4();
    let entity_id = Uuid::new_v4();

    let envelope = EventEnvelope::new(
        "call.completed.v1",
        org_id,
        None,
        "call",
        entity_id,
        "nexus_telephony",
        "1.0.0",
        None,
        json!({ "duration": 120, "sentiment": "positive" }),
    );

    let cloud_event = envelope.to_cloud_event();
    assert_eq!(cloud_event.specversion, "1.0");
    assert_eq!(cloud_event.event_type, "call.completed.v1");
    assert_eq!(cloud_event.datacontenttype, "application/json");
    assert_eq!(cloud_event.tenantid, org_id.to_string());
    assert_eq!(cloud_event.entityid, entity_id.to_string());
}

#[test]
fn test_idempotency_hash_calculation() {
    let body1 = b"{\"amount\": 100, \"currency\": \"USD\"}";
    let body2 = b"{\"amount\": 100, \"currency\": \"USD\"}";
    let body3 = b"{\"amount\": 200, \"currency\": \"USD\"}";

    let hash1 = IdempotencyService::calculate_hash(body1);
    let hash2 = IdempotencyService::calculate_hash(body2);
    let hash3 = IdempotencyService::calculate_hash(body3);

    assert_eq!(hash1, hash2);
    assert_ne!(hash1, hash3);
}

#[test]
fn test_versioning_and_upcasting() {
    let mut registry = EventUpcasterRegistry::new();
    registry.register_upcaster(
        "payment.received",
        "1.0.0",
        "2.0.0",
        Box::new(|v1| {
            let mut v2 = v1.clone();
            v2["settled_in_full"] = json!(true);
            Ok(v2)
        }),
    );

    let v1_payload = json!({ "payment_id": "123", "amount": 450.0 });
    let v2_payload = registry
        .upcast("payment.received", "1.0.0", "2.0.0", v1_payload)
        .unwrap();

    assert_eq!(v2_payload["settled_in_full"], true);
    assert_eq!(v2_payload["amount"], 450.0);
}
