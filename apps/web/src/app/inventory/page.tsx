"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Warehouse as WarehouseIcon,
  Truck,
  ShoppingCart,
  Boxes,
  ArrowRightLeft,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  Star,
  Check,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui";

// ============================================================================
// Types
// ============================================================================

type TabKey = "products" | "warehouses" | "stock" | "purchase_orders" | "suppliers" | "movements";

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: "hardware" | "finished_goods" | "raw_materials" | "software" | "services";
  unit: string;
  costPrice: number;
  salePrice: number;
  marginPercent: number;
  reorderPoint: number;
  targetStock: number;
  totalStock: number;
  reorderStatus: "healthy" | "reorder_needed" | "critical_low" | "out_of_stock";
}

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  type: string;
  country: string;
  countryFlag: string;
  capacitySqm: number;
  utilizedSqm: number;
  skuCount: number;
  totalValuation: number;
  manager: string;
  status: "active" | "maintenance";
}

interface StockLevelItem {
  id: string;
  sku: string;
  productName: string;
  warehouseCode: string;
  warehouseName: string;
  onHand: number;
  allocated: number;
  onOrder: number;
  available: number;
  reorderPoint: number;
  status: "healthy" | "reorder_needed" | "critical_low" | "out_of_stock";
  unitCost: number;
}

interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  supplierName: string;
  destinationWarehouse: string;
  itemsCount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  orderDate: string;
  expectedDelivery: string;
  status: "draft" | "pending_approval" | "approved" | "sent_to_supplier" | "partially_received" | "received";
}

interface SupplierItem {
  id: string;
  code: string;
  name: string;
  tier: "strategic" | "preferred" | "approved" | "probation";
  leadTimeDays: number;
  ratingScore: number;
  paymentTerms: string;
  contactEmail: string;
  phone: string;
  activeContracts: number;
  country: string;
}

interface StockMovementItem {
  id: string;
  movementNumber: string;
  type: "goods_received" | "sale_fulfillment" | "warehouse_transfer" | "inventory_adjustment";
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  sourceWarehouse?: string;
  destinationWarehouse?: string;
  refDocument: string;
  refType: "purchase_order" | "invoice" | "sales_order";
  timestamp: string;
}

// ============================================================================
// Mock Initial Data
// ============================================================================

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-001",
    sku: "NX-SVR-EDGE",
    name: "Nexus Edge Telephony Appliance v4",
    category: "hardware",
    unit: "unit",
    costPrice: 850.0,
    salePrice: 1650.0,
    marginPercent: 48.5,
    reorderPoint: 20,
    targetStock: 60,
    totalStock: 48,
    reorderStatus: "healthy",
  },
  {
    id: "prod-002",
    sku: "NX-SIP-GW16",
    name: "16-Port High-Density SIP Gateway",
    category: "hardware",
    unit: "unit",
    costPrice: 420.0,
    salePrice: 890.0,
    marginPercent: 52.8,
    reorderPoint: 30,
    targetStock: 80,
    totalStock: 14,
    reorderStatus: "critical_low",
  },
  {
    id: "prod-003",
    sku: "NX-HEADSET-PRO",
    name: "OmniVoice ANC Noise-Canceling Headset",
    category: "finished_goods",
    unit: "unit",
    costPrice: 65.0,
    salePrice: 149.0,
    marginPercent: 56.4,
    reorderPoint: 50,
    targetStock: 150,
    totalStock: 42,
    reorderStatus: "reorder_needed",
  },
  {
    id: "prod-004",
    sku: "NX-RACK-CABLE",
    name: "Shielded Cat6A High-Speed Patch Cord 2M",
    category: "raw_materials",
    unit: "box",
    costPrice: 18.0,
    salePrice: 38.0,
    marginPercent: 52.6,
    reorderPoint: 100,
    targetStock: 300,
    totalStock: 280,
    reorderStatus: "healthy",
  },
  {
    id: "prod-005",
    sku: "NX-LIC-VOICE-1Y",
    name: "Nexus Voice AI Enterprise Seat (1-Year)",
    category: "software",
    unit: "license",
    costPrice: 120.0,
    salePrice: 480.0,
    marginPercent: 75.0,
    reorderPoint: 0,
    targetStock: 9999,
    totalStock: 9999,
    reorderStatus: "healthy",
  },
];

const INITIAL_WAREHOUSES: WarehouseItem[] = [
  {
    id: "wh-001",
    code: "WH-SG-01",
    name: "Singapore Jurong Logistics Hub",
    type: "Fulfillment & Bonded",
    country: "Singapore",
    countryFlag: "🇸🇬",
    capacitySqm: 4500,
    utilizedSqm: 3200,
    skuCount: 142,
    totalValuation: 840500,
    manager: "Tan Wei Ming",
    status: "active",
  },
  {
    id: "wh-002",
    code: "WH-MY-01",
    name: "Malaysia Shah Alam Central Depo",
    type: "Regional Distribution",
    country: "Malaysia",
    countryFlag: "🇲🇾",
    capacitySqm: 6000,
    utilizedSqm: 4100,
    skuCount: 118,
    totalValuation: 395000,
    manager: "Farid bin Othman",
    status: "active",
  },
  {
    id: "wh-003",
    code: "WH-TH-01",
    name: "Thailand Bang Na Cargo Depo",
    type: "Commercial Depot",
    country: "Thailand",
    countryFlag: "🇹🇭",
    capacitySqm: 3500,
    utilizedSqm: 1850,
    skuCount: 88,
    totalValuation: 193000,
    manager: "Kittisak Prasert",
    status: "active",
  },
];

const INITIAL_STOCK_LEVELS: StockLevelItem[] = [
  {
    id: "stk-001",
    sku: "NX-SVR-EDGE",
    productName: "Nexus Edge Telephony Appliance v4",
    warehouseCode: "WH-SG-01",
    warehouseName: "Singapore Jurong Hub",
    onHand: 30,
    allocated: 6,
    onOrder: 25,
    available: 24,
    reorderPoint: 15,
    status: "healthy",
    unitCost: 850.0,
  },
  {
    id: "stk-002",
    sku: "NX-SVR-EDGE",
    productName: "Nexus Edge Telephony Appliance v4",
    warehouseCode: "WH-MY-01",
    warehouseName: "Malaysia Shah Alam Depo",
    onHand: 18,
    allocated: 2,
    onOrder: 0,
    available: 16,
    reorderPoint: 10,
    status: "healthy",
    unitCost: 850.0,
  },
  {
    id: "stk-003",
    sku: "NX-SIP-GW16",
    productName: "16-Port High-Density SIP Gateway",
    warehouseCode: "WH-SG-01",
    warehouseName: "Singapore Jurong Hub",
    onHand: 14,
    allocated: 8,
    onOrder: 40,
    available: 6,
    reorderPoint: 25,
    status: "critical_low",
    unitCost: 420.0,
  },
  {
    id: "stk-004",
    sku: "NX-HEADSET-PRO",
    productName: "OmniVoice ANC Headset",
    warehouseCode: "WH-MY-01",
    warehouseName: "Malaysia Shah Alam Depo",
    onHand: 42,
    allocated: 15,
    onOrder: 50,
    available: 27,
    reorderPoint: 50,
    status: "reorder_needed",
    unitCost: 65.0,
  },
  {
    id: "stk-005",
    sku: "NX-RACK-CABLE",
    productName: "Shielded Cat6A Patch Cord 2M",
    warehouseCode: "WH-TH-01",
    warehouseName: "Thailand Bang Na Depo",
    onHand: 280,
    allocated: 20,
    onOrder: 0,
    available: 260,
    reorderPoint: 80,
    status: "healthy",
    unitCost: 18.0,
  },
];

const INITIAL_PURCHASE_ORDERS: PurchaseOrderItem[] = [
  {
    id: "po-001",
    poNumber: "PO-2026-0891",
    supplierName: "Acme Microelectronics APAC Pte Ltd",
    destinationWarehouse: "WH-SG-01 (Singapore)",
    itemsCount: 2,
    subtotal: 38500.0,
    taxAmount: 3465.0,
    totalAmount: 41965.0,
    currency: "USD",
    orderDate: "2026-09-18",
    expectedDelivery: "2026-09-26",
    status: "sent_to_supplier",
  },
  {
    id: "po-002",
    poNumber: "PO-2026-0892",
    supplierName: "Shenzhen Precision Telco Components",
    destinationWarehouse: "WH-MY-01 (Malaysia)",
    itemsCount: 1,
    subtotal: 16800.0,
    taxAmount: 1344.0,
    totalAmount: 18144.0,
    currency: "USD",
    orderDate: "2026-09-20",
    expectedDelivery: "2026-09-29",
    status: "approved",
  },
  {
    id: "po-003",
    poNumber: "PO-2026-0888",
    supplierName: "Bangkok Acoustic Devices Co Ltd",
    destinationWarehouse: "WH-TH-01 (Thailand)",
    itemsCount: 3,
    subtotal: 24500.0,
    taxAmount: 1715.0,
    totalAmount: 26215.0,
    currency: "USD",
    orderDate: "2026-09-10",
    expectedDelivery: "2026-09-22",
    status: "partially_received",
  },
  {
    id: "po-004",
    poNumber: "PO-2026-0895",
    supplierName: "Acme Microelectronics APAC Pte Ltd",
    destinationWarehouse: "WH-SG-01 (Singapore)",
    itemsCount: 1,
    subtotal: 21000.0,
    taxAmount: 1890.0,
    totalAmount: 22890.0,
    currency: "USD",
    orderDate: "2026-09-22",
    expectedDelivery: "2026-10-02",
    status: "draft",
  },
];

const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: "sup-001",
    code: "SUP-ACME-01",
    name: "Acme Microelectronics APAC Pte Ltd",
    tier: "strategic",
    leadTimeDays: 7,
    ratingScore: 4.85,
    paymentTerms: "Net 30",
    contactEmail: "procurement@acmemicro.com.sg",
    phone: "+65 6890 1234",
    activeContracts: 3,
    country: "Singapore 🇸🇬",
  },
  {
    id: "sup-002",
    code: "SUP-SZ-TELCO",
    name: "Shenzhen Precision Telco Components",
    tier: "preferred",
    leadTimeDays: 12,
    ratingScore: 4.62,
    paymentTerms: "Net 45",
    contactEmail: "export@szprecision-telco.cn",
    phone: "+86 755 8321 0000",
    activeContracts: 2,
    country: "China 🇨🇳",
  },
  {
    id: "sup-003",
    code: "SUP-BKK-ACOUSTIC",
    name: "Bangkok Acoustic Devices Co Ltd",
    tier: "approved",
    leadTimeDays: 9,
    ratingScore: 4.40,
    paymentTerms: "Net 30",
    contactEmail: "sales@bkk-acoustic.co.th",
    phone: "+66 2 789 4567",
    activeContracts: 1,
    country: "Thailand 🇹🇭",
  },
];

const INITIAL_MOVEMENTS: StockMovementItem[] = [
  {
    id: "mv-001",
    movementNumber: "SM-IN-88910",
    type: "goods_received",
    sku: "NX-SVR-EDGE",
    productName: "Nexus Edge Telephony Appliance v4",
    quantity: 20,
    unitCost: 850.0,
    totalCost: 17000.0,
    destinationWarehouse: "WH-SG-01",
    refDocument: "PO-2026-0888",
    refType: "purchase_order",
    timestamp: "2026-09-22 14:15:30",
  },
  {
    id: "mv-002",
    movementNumber: "SM-OUT-88911",
    type: "sale_fulfillment",
    sku: "NX-HEADSET-PRO",
    productName: "OmniVoice ANC Headset",
    quantity: 8,
    unitCost: 65.0,
    totalCost: 520.0,
    sourceWarehouse: "WH-MY-01",
    refDocument: "INV-2026-0042",
    refType: "invoice",
    timestamp: "2026-09-22 16:40:12",
  },
  {
    id: "mv-003",
    movementNumber: "SM-TR-88912",
    type: "warehouse_transfer",
    sku: "NX-SIP-GW16",
    productName: "16-Port High-Density SIP Gateway",
    quantity: 5,
    unitCost: 420.0,
    totalCost: 2100.0,
    sourceWarehouse: "WH-SG-01",
    destinationWarehouse: "WH-MY-01",
    refDocument: "TR-2026-0014",
    refType: "sales_order",
    timestamp: "2026-09-23 09:22:00",
  },
];

// ============================================================================
// Main Page Component
// ============================================================================

export default function InventoryPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // State collections
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(INITIAL_WAREHOUSES);
  const [stockLevels, setStockLevels] = useState<StockLevelItem[]>(INITIAL_STOCK_LEVELS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>(INITIAL_PURCHASE_ORDERS);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(INITIAL_SUPPLIERS);
  const [movements, setMovements] = useState<StockMovementItem[]>(INITIAL_MOVEMENTS);

  // Modals state
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedPoForReceive, setSelectedPoForReceive] = useState<PurchaseOrderItem | null>(null);

  // Form states for PO creation
  const [newPoSupplier, setNewPoSupplier] = useState("sup-001");
  const [newPoWarehouse, setNewPoWarehouse] = useState("WH-SG-01");
  const [newPoSku, setNewPoSku] = useState("NX-SIP-GW16");
  const [newPoQuantity, setNewPoQuantity] = useState("30");

  // Form states for new product
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ProductItem["category"]>("finished_goods");
  const [newCostPrice, setNewCostPrice] = useState("100");
  const [newSalePrice, setNewSalePrice] = useState("200");
  const [newReorderPoint, setNewReorderPoint] = useState("20");

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, categoryFilter]);

  // Aggregate KPI computations
  const totalValuation = useMemo(() => {
    return stockLevels.reduce((sum, s) => sum + s.onHand * s.unitCost, 0);
  }, [stockLevels]);

  const lowStockCount = useMemo(() => {
    return stockLevels.filter((s) => s.status === "reorder_needed" || s.status === "critical_low" || s.status === "out_of_stock").length;
  }, [stockLevels]);

  const openPoCount = useMemo(() => {
    return purchaseOrders.filter((po) => po.status !== "received").length;
  }, [purchaseOrders]);

  // Handlers
  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newPoSupplier) || suppliers[0];
    const qty = parseFloat(newPoQuantity) || 10;
    const prod = products.find((p) => p.sku === newPoSku) || products[0];
    const subtotal = prod.costPrice * qty;
    const tax = subtotal * 0.09;

    const newPo: PurchaseOrderItem = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: sup.name,
      destinationWarehouse: newPoWarehouse,
      itemsCount: 1,
      subtotal,
      taxAmount: tax,
      totalAmount: subtotal + tax,
      currency: "USD",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "approved",
    };

    setPurchaseOrders([newPo, ...purchaseOrders]);
    setIsPoModalOpen(false);

    // Update stock level on-order quantity
    setStockLevels((prev) =>
      prev.map((s) => {
        if (s.sku === newPoSku && s.warehouseCode === newPoWarehouse) {
          return { ...s, onOrder: s.onOrder + qty };
        }
        return s;
      })
    );

    showToast("Purchase Order created & sent to supplier", "success");
  };

  const handleReceiveGoods = (po: PurchaseOrderItem) => {
    setPurchaseOrders((prev) =>
      prev.map((item) => (item.id === po.id ? { ...item, status: "received" } : item))
    );

    // Create an immutable stock movement
    const newMovement: StockMovementItem = {
      id: `mv-${Date.now()}`,
      movementNumber: `SM-IN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: "goods_received",
      sku: "NX-SIP-GW16",
      productName: "16-Port High-Density SIP Gateway",
      quantity: 30,
      unitCost: 420.0,
      totalCost: 12600.0,
      destinationWarehouse: po.destinationWarehouse.split(" ")[0],
      refDocument: po.poNumber,
      refType: "purchase_order",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    setMovements([newMovement, ...movements]);

    // Update stock levels
    setStockLevels((prev) =>
      prev.map((s) => {
        if (s.sku === "NX-SIP-GW16") {
          const newOnHand = s.onHand + 30;
          return {
            ...s,
            onHand: newOnHand,
            available: newOnHand - s.allocated,
            status: "healthy",
            onOrder: Math.max(0, s.onOrder - 30),
          };
        }
        return s;
      })
    );

    setSelectedPoForReceive(null);
    showToast(`Goods received for ${po.poNumber}. Stock levels updated.`, "success");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName) return;

    const cost = parseFloat(newCostPrice) || 50;
    const sale = parseFloat(newSalePrice) || 100;
    const margin = ((sale - cost) / sale) * 100;
    const reorder = parseFloat(newReorderPoint) || 15;

    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      sku: newSku.toUpperCase(),
      name: newName,
      category: newCategory,
      unit: "unit",
      costPrice: cost,
      salePrice: sale,
      marginPercent: Math.round(margin * 10) / 10,
      reorderPoint: reorder,
      targetStock: reorder * 3,
      totalStock: 0,
      reorderStatus: "out_of_stock",
    };

    setProducts([newProd, ...products]);
    setIsProductModalOpen(false);
    setNewSku("");
    setNewName("");
    showToast(`Product ${newProd.sku} registered in catalog`, "success");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Inventory & Procurement Hub
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  ERP Layer Active
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Multi-location warehouse stock, automated replenishment, and end-to-end procure-to-pay lifecycle.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsPoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            New Purchase Order
          </button>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Valuation</p>
            <p className="text-xl font-bold text-white mt-1">
              ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +8.4% vs last mo
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Active SKUs</p>
            <p className="text-xl font-bold text-white mt-1">{products.length} Items</p>
            <span className="text-xs text-slate-400 mt-1 block">Across 5 categories</span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Reorder Required</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{lowStockCount} Items</p>
            <span className="text-xs text-amber-400/80 mt-1 block">Low threshold alert</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Open PO Pipeline</p>
            <p className="text-xl font-bold text-white mt-1">{openPoCount} Orders</p>
            <span className="text-xs text-slate-400 mt-1 block">Procure-to-pay</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Supplier OTIF</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">94.6%</p>
            <span className="text-xs text-slate-400 mt-1 block">On-Time In-Full</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Truck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Cross-Module Integration Health Banner */}
      <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-white">Platform Interconnections:</span>
          <span>CRM Quotes (Auto-Reserve)</span> • 
          <span>Invoices (Auto-Fulfill on Pay)</span> • 
          <span>Accounting (Accounts Payable Ledger Sync)</span> • 
          <span>Workflows (Auto-Draft PO on Low Stock)</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/accounting" className="text-sky-400 hover:text-sky-300 flex items-center gap-1">
            Accounting AP Ledger <ChevronRight className="h-3 w-3" />
          </Link>
          <Link href="/invoices" className="text-sky-400 hover:text-sky-300 flex items-center gap-1">
            Invoicing Hub <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "products"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Package className="h-4 w-4" />
          Products Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("warehouses")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "warehouses"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <WarehouseIcon className="h-4 w-4" />
          Warehouses Network ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "stock"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          Stock Levels & Replenishment
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
              {lowStockCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("purchase_orders")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "purchase_orders"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "suppliers"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Suppliers & SRM ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "movements"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Stock Movements Ledger
        </button>
      </div>

      {/* Tab 1: Products Master Catalog */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by SKU, product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Categories</option>
                <option value="hardware">Hardware</option>
                <option value="finished_goods">Finished Goods</option>
                <option value="raw_materials">Raw Materials</option>
                <option value="software">Software</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">SKU / Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Standard Cost</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">Gross Margin</th>
                    <th className="py-3 px-4">Reorder Threshold</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{prod.sku}</div>
                        <div className="text-xs text-slate-400">{prod.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                          {prod.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">${prod.costPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">${prod.salePrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-emerald-400">
                          {prod.marginPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {prod.reorderPoint} {prod.unit}
                      </td>
                      <td className="py-3 px-4">
                        {prod.reorderStatus === "healthy" && (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            Healthy
                          </span>
                        )}
                        {prod.reorderStatus === "reorder_needed" && (
                          <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            Reorder Needed
                          </span>
                        )}
                        {prod.reorderStatus === "critical_low" && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20 font-medium animate-pulse">
                            Critical Low
                          </span>
                        )}
                        {prod.reorderStatus === "out_of_stock" && (
                          <span className="px-2 py-0.5 rounded text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setNewPoSku(prod.sku);
                            setIsPoModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 rounded border border-slate-700 transition-colors"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Warehouses Network */}
      {activeTab === "warehouses" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {warehouses.map((wh) => {
            const usagePercent = Math.round((wh.utilizedSqm / wh.capacitySqm) * 100);
            return (
              <div
                key={wh.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{wh.countryFlag}</span>
                    <div>
                      <h3 className="font-bold text-white text-base">{wh.code}</h3>
                      <p className="text-xs text-slate-400">{wh.name}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize font-medium">
                    {wh.status}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Facility Type:</span>
                    <span className="text-slate-200 font-medium">{wh.type}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Active SKUs Stored:</span>
                    <span className="text-slate-200 font-medium">{wh.skuCount} SKUs</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Inventory Value:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ${wh.totalValuation.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Facility Lead:</span>
                    <span className="text-slate-200 font-medium">{wh.manager}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Storage Capacity ({usagePercent}%)</span>
                    <span className="text-slate-300">
                      {wh.utilizedSqm} / {wh.capacitySqm} m²
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 80 ? "bg-amber-500" : "bg-sky-500"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setNewPoWarehouse(wh.code);
                      setIsPoModalOpen(true);
                    }}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded border border-slate-700 transition-colors"
                  >
                    Dispatch PO to {wh.code}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Stock Levels & Replenishment Matrix */}
      {activeTab === "stock" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">Multi-Warehouse Stock Matrix</h3>
                <p className="text-xs text-slate-400">
                  Real-time stock on hand, reservations for open deals/quotes, and incoming PO shipments.
                </p>
              </div>
              <button
                onClick={() => showToast("Stock health check completed across all 3 warehouses", "info")}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800 rounded border border-slate-700"
              >
                <RefreshCw className="h-3 w-3" /> Refresh Balance
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">SKU & Item</th>
                    <th className="py-3 px-4">Warehouse</th>
                    <th className="py-3 px-4">On Hand</th>
                    <th className="py-3 px-4">Allocated (CRM)</th>
                    <th className="py-3 px-4">On Order (PO)</th>
                    <th className="py-3 px-4">Net Available</th>
                    <th className="py-3 px-4">Reorder Status</th>
                    <th className="py-3 px-4 text-right">Replenishment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stockLevels.map((stk) => (
                    <tr key={stk.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{stk.sku}</div>
                        <div className="text-xs text-slate-400">{stk.productName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-slate-300">{stk.warehouseCode}</span>
                        <div className="text-xs text-slate-500">{stk.warehouseName}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200 font-semibold">{stk.onHand}</td>
                      <td className="py-3 px-4 font-mono text-amber-400">{stk.allocated}</td>
                      <td className="py-3 px-4 font-mono text-sky-400">{stk.onOrder}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{stk.available}</td>
                      <td className="py-3 px-4">
                        {stk.status === "healthy" && (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            Healthy
                          </span>
                        )}
                        {stk.status === "reorder_needed" && (
                          <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            Reorder Needed
                          </span>
                        )}
                        {stk.status === "critical_low" && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20 font-medium animate-pulse">
                            Critical Low
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setNewPoSku(stk.sku);
                            setNewPoWarehouse(stk.warehouseCode);
                            setIsPoModalOpen(true);
                          }}
                          className="px-3 py-1 bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 text-xs font-semibold rounded border border-sky-500/30 transition-all"
                        >
                          Draft Reorder PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Procurement & Purchase Orders */}
      {activeTab === "purchase_orders" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">Purchase Orders Ledger (Procure-to-Pay)</h3>
                <p className="text-xs text-slate-400">
                  Track vendor commitments, approval workflows, and warehouse goods receipts.
                </p>
              </div>
              <button
                onClick={() => setIsPoModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded font-semibold transition-colors"
              >
                <Plus className="h-3 w-3" /> Create Order
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Target Warehouse</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Expected Date</th>
                    <th className="py-3 px-4">PO Status</th>
                    <th className="py-3 px-4 text-right">Receipt Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-white">{po.poNumber}</td>
                      <td className="py-3 px-4 text-slate-300">{po.supplierName}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{po.destinationWarehouse}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                        ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">{po.orderDate}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">{po.expectedDelivery}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`capitalize px-2 py-0.5 rounded text-xs border font-medium ${
                            po.status === "received"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : po.status === "partially_received"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : po.status === "sent_to_supplier"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {po.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {po.status !== "received" ? (
                          <button
                            onClick={() => setSelectedPoForReceive(po)}
                            className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/30 transition-all"
                          >
                            Receive Goods
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                            <Check className="h-3 w-3 text-emerald-400" /> Billed & Stocked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Suppliers & SRM */}
      {activeTab === "suppliers" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white">Supplier Relationship Management (SRM)</h3>
              <p className="text-xs text-slate-400">
                Vendor compliance scorecards, payment terms, and active procurement agreements.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Vendor Code / Name</th>
                    <th className="py-3 px-4">Relationship Tier</th>
                    <th className="py-3 px-4">Quality & OTIF Score</th>
                    <th className="py-3 px-4">Lead Time</th>
                    <th className="py-3 px-4">Payment Terms</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Active Contracts</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{sup.name}</div>
                        <div className="text-xs text-slate-400">{sup.code} • {sup.contactEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`capitalize px-2 py-0.5 rounded text-xs border font-medium ${
                            sup.tier === "strategic"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : sup.tier === "preferred"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {sup.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <Star className="h-4 w-4 fill-amber-400" />
                          <span>{sup.ratingScore.toFixed(2)}</span>
                          <span className="text-xs text-slate-500">/ 5.0</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{sup.leadTimeDays} days</td>
                      <td className="py-3 px-4 text-slate-300">{sup.paymentTerms}</td>
                      <td className="py-3 px-4 text-xs text-slate-300">{sup.country}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-200">
                        {sup.activeContracts} Master Agreements
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setNewPoSupplier(sup.id);
                            setIsPoModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 rounded border border-slate-700 transition-colors"
                        >
                          Draft PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Stock Movements Audit Ledger */}
      {activeTab === "movements" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white">Immutable Stock Movement Audit Ledger</h3>
              <p className="text-xs text-slate-400">
                Tamper-evident record of all physical goods receipts, sale fulfillments, and inter-warehouse transfers.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Movement #</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">SKU & Item</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Total Cost</th>
                    <th className="py-3 px-4">Source / Dest</th>
                    <th className="py-3 px-4">Reference Document</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {movements.map((mv) => (
                    <tr key={mv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-white">{mv.movementNumber}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`capitalize px-2 py-0.5 rounded text-xs border font-medium ${
                            mv.type === "goods_received"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : mv.type === "sale_fulfillment"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}
                        >
                          {mv.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200">{mv.sku}</span>
                        <div className="text-xs text-slate-400">{mv.productName}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-white font-bold">{mv.quantity}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">${mv.totalCost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {mv.sourceWarehouse && <span>From: {mv.sourceWarehouse}</span>}
                        {mv.destinationWarehouse && <span>To: {mv.destinationWarehouse}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {mv.refDocument}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 font-mono">{mv.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Purchase Order */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-sky-400" />
                Draft Purchase Order
              </h3>
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Approved Supplier</label>
                <select
                  value={newPoSupplier}
                  onChange={(e) => setNewPoSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} • Tier: {s.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Product SKU</label>
                  <select
                    value={newPoSku}
                    onChange={(e) => setNewPoSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.sku}>
                        {p.sku} (${p.costPrice.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newPoQuantity}
                    onChange={(e) => setNewPoQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Destination Facility</label>
                <select
                  value={newPoWarehouse}
                  onChange={(e) => setNewPoWarehouse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.code}>
                      {wh.code} - {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Terms:</span>
                  <span className="text-slate-200">Net 30</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span className="text-slate-200">7-10 Business Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Accounting Sync:</span>
                  <span className="text-emerald-400">Auto-Generates AP Bill Draft</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Dispatch PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Goods */}
      {selectedPoForReceive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-400" />
                Warehouse Goods Receipt
              </h3>
              <button
                onClick={() => setSelectedPoForReceive(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <p>
                Confirm receipt of items for Purchase Order{" "}
                <span className="font-mono font-bold text-white">{selectedPoForReceive.poNumber}</span>.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Supplier:</span>
                  <span className="text-slate-200 font-medium">{selectedPoForReceive.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <span className="text-slate-200 font-medium">{selectedPoForReceive.destinationWarehouse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PO Total:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ${selectedPoForReceive.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Receiving will increment available inventory, clear on-order commitments, and write an immutable entry to the Stock Movement Ledger.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPoForReceive(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReceiveGoods(selectedPoForReceive)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Confirm Full Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-sky-400" />
                Register New Product
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Product SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NX-ROUTER-5G"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductItem["category"])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="hardware">Hardware</option>
                    <option value="finished_goods">Finished Goods</option>
                    <option value="raw_materials">Raw Materials</option>
                    <option value="software">Software</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5G Enterprise Branch Failover Router"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    value={newSalePrice}
                    onChange={(e) => setNewSalePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={newReorderPoint}
                    onChange={(e) => setNewReorderPoint(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
