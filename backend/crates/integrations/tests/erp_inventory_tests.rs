use chrono::Utc;
use domain::{
    ErpInventoryEngine, InventoryLevel, Product, ProductCategory, ReorderStatus,
    StockMovementType, SupplierTier, Warehouse,
};
use uuid::Uuid;

fn sample_product(org_id: Uuid, sku: &str, cost: f64, sale: f64, reorder_point: f64) -> Product {
    Product {
        id: Uuid::new_v4(),
        organization_id: org_id,
        sku: sku.to_string(),
        name: format!("Product {}", sku),
        description: Some("Enterprise Product Description".to_string()),
        category: ProductCategory::FinishedGoods,
        unit_of_measure: "unit".to_string(),
        cost_price: cost,
        sale_price: sale,
        currency: "USD".to_string(),
        reorder_point,
        target_stock_level: reorder_point * 3.0,
        barcode: Some("888812345678".to_string()),
        is_active: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    }
}

fn sample_warehouse(org_id: Uuid, code: &str, country: &str) -> Warehouse {
    Warehouse {
        id: Uuid::new_v4(),
        organization_id: org_id,
        code: code.to_string(),
        name: format!("Warehouse {}", code),
        warehouse_type: "fulfillment".to_string(),
        country_code: country.to_string(),
        capacity_sqm: 2500.0,
        manager_name: Some("Inventory Lead".to_string()),
        manager_email: Some("lead@acmeglobal.com".to_string()),
        is_active: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    }
}

fn sample_level(org_id: Uuid, prod_id: Uuid, wh_id: Uuid, on_hand: f64) -> InventoryLevel {
    InventoryLevel {
        id: Uuid::new_v4(),
        organization_id: org_id,
        product_id: prod_id,
        warehouse_id: wh_id,
        quantity_on_hand: on_hand,
        quantity_allocated: 0.0,
        quantity_on_order: 0.0,
        reorder_status: ReorderStatus::Healthy,
        last_stocktake_at: Some(Utc::now()),
        updated_at: Utc::now(),
    }
}

#[test]
fn test_reorder_status_evaluation() {
    assert_eq!(
        ErpInventoryEngine::evaluate_reorder_status(0.0, 20.0),
        ReorderStatus::OutOfStock
    );
    assert_eq!(
        ErpInventoryEngine::evaluate_reorder_status(8.0, 20.0),
        ReorderStatus::CriticalLow
    );
    assert_eq!(
        ErpInventoryEngine::evaluate_reorder_status(18.0, 20.0),
        ReorderStatus::ReorderNeeded
    );
    assert_eq!(
        ErpInventoryEngine::evaluate_reorder_status(45.0, 20.0),
        ReorderStatus::Healthy
    );
}

#[test]
fn test_stock_reservation_and_release() {
    let org_id = Uuid::new_v4();
    let prod_id = Uuid::new_v4();
    let wh_id = Uuid::new_v4();
    let mut level = sample_level(org_id, prod_id, wh_id, 100.0);

    assert_eq!(level.quantity_available(), 100.0);

    // Reserve 30 units for sales quote
    let res = ErpInventoryEngine::reserve_stock(&mut level, 30.0);
    assert!(res.is_ok());
    assert_eq!(level.quantity_allocated, 30.0);
    assert_eq!(level.quantity_available(), 70.0);

    // Try reserving more than available
    let res_err = ErpInventoryEngine::reserve_stock(&mut level, 75.0);
    assert!(res_err.is_err());

    // Release 10 units
    let rel = ErpInventoryEngine::release_reservation(&mut level, 10.0);
    assert!(rel.is_ok());
    assert_eq!(level.quantity_allocated, 20.0);
    assert_eq!(level.quantity_available(), 80.0);
}

#[test]
fn test_invoice_stock_fulfillment() {
    let org_id = Uuid::new_v4();
    let product = sample_product(org_id, "NEX-SRV-01", 150.0, 300.0, 15.0);
    let wh_id = Uuid::new_v4();
    let mut level = sample_level(org_id, product.id, wh_id, 50.0);

    // Pre-allocate 20 units
    ErpInventoryEngine::reserve_stock(&mut level, 20.0).unwrap();
    assert_eq!(level.quantity_allocated, 20.0);

    let invoice_id = Uuid::new_v4();
    let movement = ErpInventoryEngine::fulfill_stock(&mut level, &product, 20.0, Some(invoice_id)).unwrap();

    assert_eq!(level.quantity_on_hand, 30.0);
    assert_eq!(level.quantity_allocated, 0.0);
    assert_eq!(movement.movement_type, StockMovementType::SaleFulfillment);
    assert_eq!(movement.quantity, 20.0);
    assert_eq!(movement.total_cost, 3000.0); // 20 * 150.0
    assert_eq!(movement.reference_document_type.as_deref(), Some("invoice"));
    assert_eq!(movement.reference_document_id, Some(invoice_id));
}

#[test]
fn test_purchase_order_goods_receipt() {
    let org_id = Uuid::new_v4();
    let product = sample_product(org_id, "NEX-HW-02", 50.0, 120.0, 20.0);
    let wh_id = Uuid::new_v4();
    let mut level = sample_level(org_id, product.id, wh_id, 5.0);
    level.quantity_on_order = 100.0;

    let po_id = Uuid::new_v4();
    let movement = ErpInventoryEngine::receive_po_goods(&mut level, &product, po_id, 40.0, 50.0).unwrap();

    assert_eq!(level.quantity_on_hand, 45.0);
    assert_eq!(level.quantity_on_order, 60.0);
    assert_eq!(movement.movement_type, StockMovementType::GoodsReceived);
    assert_eq!(movement.quantity, 40.0);
    assert_eq!(movement.total_cost, 2000.0);
    assert_eq!(level.reorder_status, ReorderStatus::Healthy);
}

#[test]
fn test_inventory_valuation() {
    let org_id = Uuid::new_v4();
    let p1 = sample_product(org_id, "SKU-A", 100.0, 200.0, 10.0);
    let p2 = sample_product(org_id, "SKU-B", 250.0, 500.0, 10.0);
    let wh_id = Uuid::new_v4();

    let l1 = sample_level(org_id, p1.id, wh_id, 20.0); // 20 * 100 = 2000
    let l2 = sample_level(org_id, p2.id, wh_id, 10.0); // 10 * 250 = 2500

    let total_val = ErpInventoryEngine::compute_valuation(&[l1, l2], &[p1, p2]);
    assert_eq!(total_val, 4500.0);
}

#[test]
fn test_low_stock_alerts_and_suggested_reorder() {
    let org_id = Uuid::new_v4();
    let p1 = sample_product(org_id, "LOW-ITEM-01", 80.0, 160.0, 30.0); // target = 90
    let wh = sample_warehouse(org_id, "WH-SG-01", "SG");
    let l1 = sample_level(org_id, p1.id, wh.id, 10.0); // on hand = 10 <= 30

    let alerts = ErpInventoryEngine::check_low_stock(&[l1], &[p1], &[wh]);
    assert_eq!(alerts.len(), 1);
    let alert = &alerts[0];
    assert_eq!(alert.sku, "LOW-ITEM-01");
    assert_eq!(alert.reorder_status, ReorderStatus::CriticalLow);
    assert_eq!(alert.suggested_reorder_qty, 80.0); // 90 - 10
}

#[test]
fn test_supplier_performance_score() {
    // 95 out of 100 on time, 98% quality rating
    let score = ErpInventoryEngine::calculate_supplier_score(95, 100, 98.0);
    assert!(score > 4.5);
    assert!(score <= 5.0);

    // Poor supplier: 40 out of 100 on time, 50% quality
    let poor_score = ErpInventoryEngine::calculate_supplier_score(40, 100, 50.0);
    assert!(poor_score < 3.0);
}
