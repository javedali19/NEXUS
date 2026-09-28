use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ============================================================================
// ERP Inventory, Warehouses & Procurement Domain Models
// ============================================================================

/// Product category classification
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProductCategory {
    FinishedGoods,
    RawMaterials,
    Services,
    Hardware,
    Software,
    Consumables,
}

impl ProductCategory {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::FinishedGoods => "finished_goods",
            Self::RawMaterials => "raw_materials",
            Self::Services => "services",
            Self::Hardware => "hardware",
            Self::Software => "software",
            Self::Consumables => "consumables",
        }
    }
}

/// Product Master Record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub sku: String,
    pub name: String,
    pub description: Option<String>,
    pub category: ProductCategory,
    pub unit_of_measure: String,
    pub cost_price: f64,
    pub sale_price: f64,
    pub currency: String,
    pub reorder_point: f64,
    pub target_stock_level: f64,
    pub barcode: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Multi-location Warehouse
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Warehouse {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub code: String,
    pub name: String,
    pub warehouse_type: String, // 'fulfillment', 'bonded', 'transit', 'retail_hub'
    pub country_code: String,
    pub capacity_sqm: f64,
    pub manager_name: Option<String>,
    pub manager_email: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Supplier Relationship Tier
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SupplierTier {
    Strategic,
    Preferred,
    Approved,
    Probation,
    Blacklisted,
}

impl SupplierTier {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Strategic => "strategic",
            Self::Preferred => "preferred",
            Self::Approved => "approved",
            Self::Probation => "probation",
            Self::Blacklisted => "blacklisted",
        }
    }
}

/// Supplier Master & SRM Details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Supplier {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub supplier_code: String,
    pub name: String,
    pub tax_id: Option<String>,
    pub contact_person: Option<String>,
    pub email: String,
    pub phone: Option<String>,
    pub currency: String,
    pub payment_terms: String,
    pub lead_time_days: u32,
    pub rating_score: f64, // 1.0 to 5.0
    pub relationship_tier: SupplierTier,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Stock Health Status
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReorderStatus {
    Healthy,
    ReorderNeeded,
    CriticalLow,
    OutOfStock,
}

impl ReorderStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Healthy => "healthy",
            Self::ReorderNeeded => "reorder_needed",
            Self::CriticalLow => "critical_low",
            Self::OutOfStock => "out_of_stock",
        }
    }
}

/// Current Inventory Level in a specific Warehouse
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryLevel {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub product_id: Uuid,
    pub warehouse_id: Uuid,
    pub quantity_on_hand: f64,
    pub quantity_allocated: f64,
    pub quantity_on_order: f64,
    pub reorder_status: ReorderStatus,
    pub last_stocktake_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}

impl InventoryLevel {
    pub fn quantity_available(&self) -> f64 {
        (self.quantity_on_hand - self.quantity_allocated).max(0.0)
    }
}

/// Stock Movement Type
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StockMovementType {
    GoodsReceived,
    SaleFulfillment,
    WarehouseTransfer,
    InventoryAdjustment,
    ScrapWriteOff,
    ReturnToVendor,
}

impl StockMovementType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::GoodsReceived => "goods_received",
            Self::SaleFulfillment => "sale_fulfillment",
            Self::WarehouseTransfer => "warehouse_transfer",
            Self::InventoryAdjustment => "inventory_adjustment",
            Self::ScrapWriteOff => "scrap_write_off",
            Self::ReturnToVendor => "return_to_vendor",
        }
    }
}

/// Immutable Stock Movement Record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StockMovement {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub movement_number: String,
    pub product_id: Uuid,
    pub source_warehouse_id: Option<Uuid>,
    pub destination_warehouse_id: Option<Uuid>,
    pub movement_type: StockMovementType,
    pub quantity: f64,
    pub unit_cost: f64,
    pub total_cost: f64,
    pub reference_document_type: Option<String>,
    pub reference_document_id: Option<Uuid>,
    pub notes: Option<String>,
    pub timestamp: DateTime<Utc>,
}

/// Purchase Order Status
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PurchaseOrderStatus {
    Draft,
    PendingApproval,
    Approved,
    SentToSupplier,
    PartiallyReceived,
    Received,
    Billed,
    Cancelled,
}

impl PurchaseOrderStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Draft => "draft",
            Self::PendingApproval => "pending_approval",
            Self::Approved => "approved",
            Self::SentToSupplier => "sent_to_supplier",
            Self::PartiallyReceived => "partially_received",
            Self::Received => "received",
            Self::Billed => "billed",
            Self::Cancelled => "cancelled",
        }
    }
}

/// Purchase Order Master
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PurchaseOrder {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub po_number: String,
    pub supplier_id: Uuid,
    pub destination_warehouse_id: Uuid,
    pub status: PurchaseOrderStatus,
    pub order_date: NaiveDate,
    pub expected_delivery_date: Option<NaiveDate>,
    pub actual_delivery_date: Option<NaiveDate>,
    pub subtotal: f64,
    pub tax_amount: f64,
    pub total_amount: f64,
    pub currency: String,
    pub payment_terms: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Purchase Order Line Item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PurchaseOrderItem {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub purchase_order_id: Uuid,
    pub product_id: Uuid,
    pub quantity_ordered: f64,
    pub quantity_received: f64,
    pub unit_price: f64,
    pub tax_rate: f64,
    pub line_total: f64,
}

/// Alert payload for low stock
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LowStockAlert {
    pub product_id: Uuid,
    pub sku: String,
    pub product_name: String,
    pub warehouse_id: Uuid,
    pub warehouse_name: String,
    pub current_on_hand: f64,
    pub reorder_point: f64,
    pub reorder_status: ReorderStatus,
    pub suggested_reorder_qty: f64,
}

// ============================================================================
// Core ERP Inventory & Procurement Engine
// ============================================================================

pub struct ErpInventoryEngine;

impl ErpInventoryEngine {
    /// Evaluate reorder status based on on-hand stock and threshold
    pub fn evaluate_reorder_status(quantity_on_hand: f64, reorder_point: f64) -> ReorderStatus {
        if quantity_on_hand <= 0.0 {
            ReorderStatus::OutOfStock
        } else if quantity_on_hand <= reorder_point * 0.5 {
            ReorderStatus::CriticalLow
        } else if quantity_on_hand <= reorder_point {
            ReorderStatus::ReorderNeeded
        } else {
            ReorderStatus::Healthy
        }
    }

    /// Reserve inventory for a confirmed sales quote or deal
    pub fn reserve_stock(
        level: &mut InventoryLevel,
        quantity_to_reserve: f64,
    ) -> Result<(), String> {
        let available = level.quantity_available();
        if available < quantity_to_reserve {
            return Err(format!(
                "Insufficient inventory available. Requested: {:.2}, Available: {:.2}",
                quantity_to_reserve, available
            ));
        }

        level.quantity_allocated += quantity_to_reserve;
        level.updated_at = Utc::now();
        Ok(())
    }

    /// Release allocated inventory when an order/quote is cancelled
    pub fn release_reservation(
        level: &mut InventoryLevel,
        quantity_to_release: f64,
    ) -> Result<(), String> {
        if level.quantity_allocated < quantity_to_release {
            level.quantity_allocated = 0.0;
        } else {
            level.quantity_allocated -= quantity_to_release;
        }
        level.updated_at = Utc::now();
        Ok(())
    }

    /// Fulfill inventory when an invoice is issued and dispatched
    pub fn fulfill_stock(
        level: &mut InventoryLevel,
        product: &Product,
        quantity_to_fulfill: f64,
        invoice_id: Option<Uuid>,
    ) -> Result<StockMovement, String> {
        if level.quantity_on_hand < quantity_to_fulfill {
            return Err(format!(
                "Cannot fulfill stock. On hand: {:.2}, Requested: {:.2}",
                level.quantity_on_hand, quantity_to_fulfill
            ));
        }

        // Deduct from on hand and decrease allocation
        level.quantity_on_hand -= quantity_to_fulfill;
        if level.quantity_allocated >= quantity_to_fulfill {
            level.quantity_allocated -= quantity_to_fulfill;
        } else {
            level.quantity_allocated = 0.0;
        }

        level.reorder_status = Self::evaluate_reorder_status(
            level.quantity_on_hand,
            product.reorder_point,
        );
        level.updated_at = Utc::now();

        // Create immutable movement record
        let movement = StockMovement {
            id: Uuid::new_v4(),
            organization_id: level.organization_id,
            movement_number: format!("SM-OUT-{}", Uuid::new_v4().simple()),
            product_id: level.product_id,
            source_warehouse_id: Some(level.warehouse_id),
            destination_warehouse_id: None,
            movement_type: StockMovementType::SaleFulfillment,
            quantity: quantity_to_fulfill,
            unit_cost: product.cost_price,
            total_cost: product.cost_price * quantity_to_fulfill,
            reference_document_type: Some("invoice".to_string()),
            reference_document_id: invoice_id,
            notes: Some(format!("Sales fulfillment for invoice {:?}", invoice_id)),
            timestamp: Utc::now(),
        };

        Ok(movement)
    }

    /// Process receipt of goods against a purchase order
    pub fn receive_po_goods(
        level: &mut InventoryLevel,
        product: &Product,
        po_id: Uuid,
        quantity_received: f64,
        unit_cost: f64,
    ) -> Result<StockMovement, String> {
        if quantity_received <= 0.0 {
            return Err("Quantity received must be strictly positive".to_string());
        }

        level.quantity_on_hand += quantity_received;
        if level.quantity_on_order >= quantity_received {
            level.quantity_on_order -= quantity_received;
        } else {
            level.quantity_on_order = 0.0;
        }

        level.reorder_status = Self::evaluate_reorder_status(
            level.quantity_on_hand,
            product.reorder_point,
        );
        level.updated_at = Utc::now();

        let movement = StockMovement {
            id: Uuid::new_v4(),
            organization_id: level.organization_id,
            movement_number: format!("SM-IN-{}", Uuid::new_v4().simple()),
            product_id: level.product_id,
            source_warehouse_id: None,
            destination_warehouse_id: Some(level.warehouse_id),
            movement_type: StockMovementType::GoodsReceived,
            quantity: quantity_received,
            unit_cost,
            total_cost: unit_cost * quantity_received,
            reference_document_type: Some("purchase_order".to_string()),
            reference_document_id: Some(po_id),
            notes: Some(format!("Goods received for Purchase Order {}", po_id)),
            timestamp: Utc::now(),
        };

        Ok(movement)
    }

    /// Compute total inventory valuation across multiple stock levels
    pub fn compute_valuation(levels: &[InventoryLevel], products: &[Product]) -> f64 {
        let mut total = 0.0;
        for level in levels {
            if let Some(prod) = products.iter().find(|p| p.id == level.product_id) {
                total += level.quantity_on_hand * prod.cost_price;
            }
        }
        total
    }

    /// Check and generate low stock triggers for workflows
    pub fn check_low_stock(
        levels: &[InventoryLevel],
        products: &[Product],
        warehouses: &[Warehouse],
    ) -> Vec<LowStockAlert> {
        let mut alerts = Vec::new();
        for level in levels {
            if let Some(prod) = products.iter().find(|p| p.id == level.product_id) {
                let status = Self::evaluate_reorder_status(level.quantity_on_hand, prod.reorder_point);
                if status != ReorderStatus::Healthy {
                    let wh_name = warehouses
                        .iter()
                        .find(|w| w.id == level.warehouse_id)
                        .map(|w| w.name.clone())
                        .unwrap_or_else(|| "Unknown Warehouse".to_string());

                    let suggested = (prod.target_stock_level - level.quantity_on_hand).max(prod.reorder_point);

                    alerts.push(LowStockAlert {
                        product_id: prod.id,
                        sku: prod.sku.clone(),
                        product_name: prod.name.clone(),
                        warehouse_id: level.warehouse_id,
                        warehouse_name: wh_name,
                        current_on_hand: level.quantity_on_hand,
                        reorder_point: prod.reorder_point,
                        reorder_status: status,
                        suggested_reorder_qty: suggested,
                    });
                }
            }
        }
        alerts
    }

    /// Score supplier performance based on On-Time-In-Full (OTIF) and defect rate
    pub fn calculate_supplier_score(
        on_time_count: u32,
        total_deliveries: u32,
        quality_rating_0_to_100: f64,
    ) -> f64 {
        if total_deliveries == 0 {
            return 5.0; // Default baseline for new suppliers
        }

        let otif_ratio = on_time_count as f64 / total_deliveries as f64;
        let quality_ratio = (quality_rating_0_to_100 / 100.0).clamp(0.0, 1.0);

        // Score 1.0 to 5.0 (60% weight on OTIF, 40% on Quality)
        let composite = (otif_ratio * 0.6) + (quality_ratio * 0.4);
        (composite * 4.0 + 1.0).clamp(1.0, 5.0)
    }
}
