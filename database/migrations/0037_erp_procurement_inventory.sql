-- ============================================================================
-- Migration 0037: Enterprise ERP Inventory, Warehouses, Procurement & SRM
-- Multi-tenant products, warehouses, stock levels, movements, POs, and suppliers
-- ============================================================================

-- 1. Master Products Catalog
CREATE TABLE IF NOT EXISTS erp_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'finished_goods', -- 'finished_goods', 'raw_materials', 'services', 'hardware', 'software'
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'unit',    -- 'unit', 'pcs', 'kg', 'box', 'hours'
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    reorder_point NUMERIC(12, 3) NOT NULL DEFAULT 10.000,
    target_stock_level NUMERIC(12, 3) NOT NULL DEFAULT 50.000,
    barcode VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_erp_product_org_sku UNIQUE (organization_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_erp_products_org_cat ON erp_products(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_erp_products_org_sku ON erp_products(organization_id, sku);

-- 2. Multi-Location Warehouses Network
CREATE TABLE IF NOT EXISTS erp_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- 'WH-SG-01', 'WH-MY-01', 'WH-TH-01'
    name VARCHAR(255) NOT NULL,
    warehouse_type VARCHAR(50) NOT NULL DEFAULT 'fulfillment', -- 'fulfillment', 'bonded', 'transit', 'retail_hub'
    country_code VARCHAR(10) NOT NULL DEFAULT 'SG',
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    capacity_sqm NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
    manager_name VARCHAR(100),
    manager_email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_erp_warehouse_org_code UNIQUE (organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_erp_warehouses_org_country ON erp_warehouses(organization_id, country_code);

-- 3. Suppliers & Supplier Relationship Management (SRM)
CREATE TABLE IF NOT EXISTS erp_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    supplier_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(100),
    contact_person VARCHAR(150),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_terms VARCHAR(50) NOT NULL DEFAULT 'Net 30',
    lead_time_days INT NOT NULL DEFAULT 7,
    rating_score NUMERIC(3, 2) NOT NULL DEFAULT 4.50, -- 1.00 to 5.00
    relationship_tier VARCHAR(50) NOT NULL DEFAULT 'preferred', -- 'strategic', 'preferred', 'approved', 'probation', 'blacklisted'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_erp_supplier_org_code UNIQUE (organization_id, supplier_code)
);

CREATE INDEX IF NOT EXISTS idx_erp_suppliers_org_tier ON erp_suppliers(organization_id, relationship_tier);

-- 4. Current Inventory Stock Levels
CREATE TABLE IF NOT EXISTS erp_inventory_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES erp_products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES erp_warehouses(id) ON DELETE CASCADE,
    quantity_on_hand NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    quantity_allocated NUMERIC(12, 3) NOT NULL DEFAULT 0.000, -- Reserved for sales quotes / orders
    quantity_on_order NUMERIC(12, 3) NOT NULL DEFAULT 0.000,   -- In transit via approved POs
    reorder_status VARCHAR(50) NOT NULL DEFAULT 'healthy',     -- 'healthy', 'reorder_needed', 'critical_low', 'out_of_stock'
    last_stocktake_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_erp_inventory_org_prod_wh UNIQUE (organization_id, product_id, warehouse_id)
);

CREATE INDEX IF NOT EXISTS idx_erp_inventory_status ON erp_inventory_levels(organization_id, reorder_status);

-- 5. Immutable Stock Movements Ledger
CREATE TABLE IF NOT EXISTS erp_stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    movement_number VARCHAR(64) NOT NULL,
    product_id UUID NOT NULL REFERENCES erp_products(id) ON DELETE RESTRICT,
    source_warehouse_id UUID REFERENCES erp_warehouses(id) ON DELETE SET NULL,
    destination_warehouse_id UUID REFERENCES erp_warehouses(id) ON DELETE SET NULL,
    movement_type VARCHAR(50) NOT NULL, 
    -- 'goods_received', 'sale_fulfillment', 'warehouse_transfer', 'inventory_adjustment', 'scrap_write_off', 'return_to_vendor'
    quantity NUMERIC(12, 3) NOT NULL,
    unit_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    reference_document_type VARCHAR(50), -- 'purchase_order', 'invoice', 'sales_order', 'stocktake', 'transfer_order'
    reference_document_id UUID,
    notes TEXT,
    performed_by UUID,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_erp_movement_org_num UNIQUE (organization_id, movement_number)
);

CREATE INDEX IF NOT EXISTS idx_erp_movements_prod_time ON erp_stock_movements(organization_id, product_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_erp_movements_ref ON erp_stock_movements(organization_id, reference_document_type, reference_document_id);

-- 6. Purchase Orders (Procure-to-Pay)
CREATE TABLE IF NOT EXISTS erp_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    po_number VARCHAR(64) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES erp_suppliers(id) ON DELETE RESTRICT,
    destination_warehouse_id UUID NOT NULL REFERENCES erp_warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', 
    -- 'draft', 'pending_approval', 'approved', 'sent_to_supplier', 'partially_received', 'received', 'billed', 'cancelled'
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_terms VARCHAR(50) NOT NULL DEFAULT 'Net 30',
    notes TEXT,
    approved_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_erp_po_org_num UNIQUE (organization_id, po_number)
);

CREATE INDEX IF NOT EXISTS idx_erp_po_org_status ON erp_purchase_orders(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_erp_po_org_supplier ON erp_purchase_orders(organization_id, supplier_id);

-- 7. Purchase Order Line Items
CREATE TABLE IF NOT EXISTS erp_purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    purchase_order_id UUID NOT NULL REFERENCES erp_purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES erp_products(id) ON DELETE RESTRICT,
    quantity_ordered NUMERIC(12, 3) NOT NULL,
    quantity_received NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
    line_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_erp_po_items_po ON erp_purchase_order_items(purchase_order_id);

-- 8. External ERP Connector Configurations (Safe Vault / Standby)
CREATE TABLE IF NOT EXISTS erp_external_connector_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    system_type VARCHAR(50) NOT NULL, -- 'sap_s4hana', 'netsuite', 'odoo', 'zoho_inventory'
    sync_direction VARCHAR(50) NOT NULL DEFAULT 'bidirectional', -- 'inbound', 'outbound', 'bidirectional'
    sync_status VARCHAR(50) NOT NULL DEFAULT 'ready_for_setup',  -- 'ready_for_setup', 'pending_credentials', 'connected', 'error'
    credentials_vault_ref VARCHAR(255),
    endpoint_url VARCHAR(255),
    last_sync_at TIMESTAMPTZ,
    auto_sync_inventory BOOLEAN NOT NULL DEFAULT true,
    auto_sync_purchase_orders BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_erp_ext_conn UNIQUE (organization_id, system_type)
);

-- ============================================================================
-- Row-Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE erp_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_products FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_erp_products ON erp_products
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

ALTER TABLE erp_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_warehouses FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_erp_warehouses ON erp_warehouses
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

ALTER TABLE erp_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_suppliers FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_erp_suppliers ON erp_suppliers
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

ALTER TABLE erp_inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_inventory_levels FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_erp_inventory_levels ON erp_inventory_levels
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

ALTER TABLE erp_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_stock_movements FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_erp_stock_movements ON erp_stock_movements
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

ALTER TABLE erp_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_purchase_orders FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_erp_purchase_orders ON erp_purchase_orders
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

ALTER TABLE erp_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_purchase_order_items FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_erp_purchase_order_items ON erp_purchase_order_items
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

ALTER TABLE erp_external_connector_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_external_connector_configs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_erp_external_connector_configs ON erp_external_connector_configs
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
