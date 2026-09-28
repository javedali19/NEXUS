"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Zap,
  Filter,
  Users,
  Building2,
  Contact,
  UserPlus,
  TrendingUp,
  FileCheck,
  DollarSign,
  CreditCard,
  MessageCircle,
  PhoneCall,
  FolderGit2,
  GitBranch,
  Bot,
  Package,
  BarChart3,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Layers,
  Check,
  Command,
  CornerDownLeft,
  X,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui";

// ============================================================================
// Types
// ============================================================================

export type EntityFilter =
  | "all"
  | "customer"
  | "company"
  | "contact"
  | "lead"
  | "deal"
  | "quote"
  | "invoice"
  | "payment"
  | "conversation"
  | "call"
  | "document"
  | "workflow"
  | "ai_agent";

export interface SearchItem {
  id: string;
  type: EntityFilter;
  title: string;
  subtitle: string;
  snippet: string;
  deepLink: string;
  tags: string[];
  metadata: Record<string, unknown>;
  date: string;
}

export interface UniversalCommandRecord {
  slug: string;
  title: string;
  description: string;
  category: "CRM" | "ERP" | "Communications" | "Automation" | "Intelligence" | "System";
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
  toolName: string;
  requiredCapability: string;
  parameters: { name: string; type: string; defaultValue: string; description: string }[];
}

// 13 Entity Full Corpus
const FULL_SEARCH_CORPUS: SearchItem[] = [
  // 1. Customer
  {
    id: "cust-01",
    type: "customer",
    title: "Acme Global Solutions Pte Ltd",
    subtitle: "Enterprise Tier 1 · billing@acmeglobal.com",
    snippet: "APAC Regional Headquarters with 120 PBX seats and high-volume automated WhatsApp collections.",
    deepLink: "/customers/c1a8d052-1982-4fae-9ef7-47b2c019a112",
    tags: ["enterprise", "apac", "vip", "telephony"],
    metadata: { mrr: "$18,500/mo", status: "Active", ltv: "$222,000" },
    date: "Updated Today",
  },
  // 2. Company
  {
    id: "comp-01",
    type: "company",
    title: "SingaMaritime Fleet Logistics",
    subtitle: "UEN: 202619842K · Maritime & Ports · Singapore",
    snippet: "Regional container freight carrier operating across Singapore, Port Klang, and Bangkok.",
    deepLink: "/companies",
    tags: ["maritime", "fleet", "logistics", "sg"],
    metadata: { country: "Singapore", employees: 340, tier: "Tier 1" },
    date: "Updated Yesterday",
  },
  // 3. Contact
  {
    id: "cont-01",
    type: "contact",
    title: "Marcus Vance",
    subtitle: "VP Technology · m.vance@acmeglobal.com · +65 6712 9081",
    snippet: "Commercial decision maker for cloud PBX infrastructure migration and AI agent dispatch.",
    deepLink: "/contacts",
    tags: ["executive", "decision_maker", "acme"],
    metadata: { title: "VP Technology", department: "Engineering" },
    date: "Updated 2h ago",
  },
  // 4. Lead
  {
    id: "lead-01",
    type: "lead",
    title: "Pacific Marine Cloud RFP Lead",
    subtitle: "Score: 92/100 · BANT Qualified · End of Month Close",
    snippet: "Inbound RFP requesting formal quote for 10x Nexus Edge Telephony v4 appliances with Net 30 terms.",
    deepLink: "/leads",
    tags: ["hot_lead", "bant_verified", "inbound"],
    metadata: { value: "$34,500.00", probability: "85%" },
    date: "Today, 10:15 AM",
  },
  // 5. Deal
  {
    id: "deal-01",
    type: "deal",
    title: "Enterprise Omnichannel Expansion Deal",
    subtitle: "$34,500.00 USD · Stage: Negotiation (80% Win Prob)",
    snippet: "Commercial deal under Sarah Jenkins. Price quote accepted, awaiting Razorpay hosted payment link settlement.",
    deepLink: "/crm",
    tags: ["crm", "pipeline", "q3_target"],
    metadata: { owner: "Sarah Jenkins", stage: "Negotiation" },
    date: "Today, 11:20 AM",
  },
  // 6. Quote
  {
    id: "quote-01",
    type: "quote",
    title: "Commercial Quote QT-2026-0814",
    subtitle: "$37,605.00 (Incl. 9% GST) · Approved & Stock Reserved",
    snippet: "10x NX-SVR-EDGE allocated and reserved in warehouse WH-SG-01. Customer approved price terms.",
    deepLink: "/quotes",
    tags: ["quote", "erp", "reserved_stock"],
    metadata: { subtotal: "$34,500.00", gst: "$3,105.00", status: "Approved" },
    date: "Today, 11:45 AM",
  },
  // 7. Invoice
  {
    id: "inv-01",
    type: "invoice",
    title: "ERP Tax Invoice INV-2026-0814",
    subtitle: "Billed: $37,605.00 · Balance Due: $0.00 · Status: Paid",
    snippet: "Official ERP Tax Invoice settled via Razorpay UPI and reconciled in General Ledger Account 1200 - AR.",
    deepLink: "/invoices",
    tags: ["invoice", "tax_invoice", "paid", "ledger_reconciled"],
    metadata: { invoiceNumber: "INV-2026-0814", terms: "Net 30" },
    date: "Today, 12:00 PM",
  },
  // 8. Payment
  {
    id: "pay-01",
    type: "payment",
    title: "Razorpay Payment pay_Rzp9821AcmeSettled",
    subtitle: "Provider: Razorpay · $37,605.00 USD · Method: UPI / QR",
    snippet: "Captured transaction via webhook. Bank reconciliation confirmed with zero settlement discrepancy.",
    deepLink: "/payments",
    tags: ["razorpay", "upi", "captured", "reconciled"],
    metadata: { provider: "Razorpay", transactionFee: "$0.00" },
    date: "Today, 12:05 PM",
  },
  // 9. Conversation
  {
    id: "conv-01",
    type: "conversation",
    title: "WhatsApp Chat: Marcus Vance (Acme)",
    subtitle: "Channel: WhatsApp Business · 14 Messages · Live",
    snippet: "Customer: 'Thanks for the payment link! Just authorized payment through Razorpay.'",
    deepLink: "/conversations",
    tags: ["whatsapp", "consent_verified", "omnichannel"],
    metadata: { channel: "WhatsApp", deliveryStatus: "Delivered" },
    date: "Today, 12:08 PM",
  },
  // 10. Call
  {
    id: "call-01",
    type: "call",
    title: "AI Voice PBX Call: SingaMaritime Lead",
    subtitle: "Duration: 4m 12s · Positive Sentiment (0.92) · MOS: 4.6",
    snippet: "AI Voice Agent qualified technical requirements and scheduled AE demo for Thursday morning.",
    deepLink: "/voice-calls",
    tags: ["telephony", "voice_agent", "sentiment_positive"],
    metadata: { agent: "Nexus AI Voice", mosScore: "4.6/5.0" },
    date: "Yesterday, 04:30 PM",
  },
  // 11. Document
  {
    id: "doc-01",
    type: "document",
    title: "Commercial Master Service Agreement 2026.pdf",
    subtitle: "OCR Verified · 2.4 MB · Bilingual English/Mandarin",
    snippet: "Bilingual legal SLA processed through Mathpix OCR engine with 99% table confidence.",
    deepLink: "/documents",
    tags: ["ocr", "mathpix", "signed", "contract"],
    metadata: { pages: 12, classification: "Legal MSA" },
    date: "Yesterday, 02:15 PM",
  },
  // 12. Workflow
  {
    id: "wf-01",
    type: "workflow",
    title: "Autonomous Invoice Payment & Stock Fulfillment",
    subtitle: "Trigger: payment.captured · 9 Steps · Active",
    snippet: "Reconciles GL ledger, updates customer credit, releases warehouse stock, and pings WhatsApp.",
    deepLink: "/workflows",
    tags: ["automation", "cloud_tasks", "event_driven"],
    metadata: { executionCount: 142, successRate: "100%" },
    date: "Active 24/7",
  },
  // 13. AI Agent
  {
    id: "agent-01",
    type: "ai_agent",
    title: "Nexus Commercial Sales Agent",
    subtitle: "Role: sales_agent · 12 Tools · Active Copilot",
    snippet: "Authorized for autonomous Lead-to-Cash progression with enterprise safety guardrails and policy auditing.",
    deepLink: "/ai-agents",
    tags: ["copilot", "tool_gateway", "autonomous"],
    metadata: { model: "Gemini 1.5 Pro", autonomy: "Supervised" },
    date: "Online",
  },
];

// 12 Core Universal Commands
const UNIVERSAL_COMMANDS: UniversalCommandRecord[] = [
  {
    slug: "create-quote",
    title: "Create Commercial Quote",
    description: "Generate price estimate with line items, warehouse stock reservation, and tax calculation",
    category: "ERP",
    icon: FileCheck,
    shortcut: "N Q",
    toolName: "quote_creation",
    requiredCapability: "quotes:write",
    parameters: [
      { name: "customer_id", type: "string", defaultValue: "c1a8d052-1982-4fae-9ef7-47b2c019a112", description: "Target Customer 360 UUID" },
      { name: "discount_percentage", type: "number", defaultValue: "5.0", description: "Approved discount percentage (max 15%)" },
      { name: "valid_until", type: "string", defaultValue: "2026-10-31", description: "Quote expiration date" },
    ],
  },
  {
    slug: "create-payment-link",
    title: "Generate Razorpay Payment Link",
    description: "Create secure hosted checkout payment link with QR code via configured provider",
    category: "ERP",
    icon: CreditCard,
    shortcut: "N P",
    toolName: "payment_link_creation",
    requiredCapability: "payments:generate_link",
    parameters: [
      { name: "customer_id", type: "string", defaultValue: "c1a8d052-1982-4fae-9ef7-47b2c019a112", description: "Customer UUID" },
      { name: "amount", type: "number", defaultValue: "2450.00", description: "Charge amount in USD" },
      { name: "currency", type: "string", defaultValue: "USD", description: "Payment currency" },
    ],
  },
  {
    slug: "lookup-inventory-stock",
    title: "Check Inventory Stock Level",
    description: "Query warehouse availability, reserved units, and reorder status for a product SKU",
    category: "ERP",
    icon: FolderGit2,
    shortcut: "L S",
    toolName: "inventory_lookup",
    requiredCapability: "inventory:read",
    parameters: [
      { name: "sku", type: "string", defaultValue: "NX-SVR-EDGE", description: "Product SKU to query" },
      { name: "warehouse_code", type: "string", defaultValue: "WH-SG-01", description: "Destination warehouse" },
    ],
  },
  {
    slug: "create-procurement-po",
    title: "Create Purchase Order",
    description: "Draft ERP procurement PO to replenish low inventory stock with approved supplier",
    category: "ERP",
    icon: Package,
    shortcut: "N O",
    toolName: "create_procurement_po",
    requiredCapability: "procurement:create",
    parameters: [
      { name: "sku", type: "string", defaultValue: "NX-SVR-EDGE", description: "Replenishment SKU" },
      { name: "supplier_id", type: "string", defaultValue: "sup_acme", description: "Approved supplier ID" },
      { name: "quantity", type: "number", defaultValue: "25", description: "Units to order" },
    ],
  },
  {
    slug: "advance-sales-flow",
    title: "Advance 9-Stage Sales Flow",
    description: "Progress deal through complete Lead-to-Cash sales cycle with policy validation",
    category: "CRM",
    icon: TrendingUp,
    shortcut: "A F",
    toolName: "sales_flow_advance",
    requiredCapability: "sales:advance_flow",
    parameters: [
      { name: "flow_id", type: "string", defaultValue: "flow-001", description: "Active Sales Flow instance" },
      { name: "target_stage", type: "string", defaultValue: "quote", description: "Target stage in state machine" },
      { name: "ai_confidence_score", type: "number", defaultValue: "0.96", description: "Confidence score (>=0.70 required)" },
    ],
  },
  {
    slug: "send-whatsapp-notice",
    title: "Send WhatsApp Notification",
    description: "Dispatch approved HSM message template after consent and DNC compliance check",
    category: "Communications",
    icon: MessageCircle,
    shortcut: "S W",
    toolName: "whatsapp_sending",
    requiredCapability: "whatsapp:send",
    parameters: [
      { name: "phone_number", type: "string", defaultValue: "+6567129081", description: "E.164 compliant phone number" },
      { name: "template_name", type: "string", defaultValue: "payment_receipt_v1", description: "Approved WhatsApp template" },
      { name: "consent_verified", type: "boolean", defaultValue: "true", description: "Express opt-in confirmed" },
    ],
  },
  {
    slug: "schedule-voice-call",
    title: "Schedule AI Voice Call",
    description: "Schedule automated voice agent call or representative callback within calling window",
    category: "Communications",
    icon: PhoneCall,
    shortcut: "S C",
    toolName: "call_scheduling",
    requiredCapability: "telephony:schedule",
    parameters: [
      { name: "phone_number", type: "string", defaultValue: "+6567129081", description: "Target phone number" },
      { name: "scheduled_time", type: "string", defaultValue: "2026-09-24T10:00:00Z", description: "Calling window timestamp" },
      { name: "purpose", type: "string", defaultValue: "Commercial Deal Review", description: "Call intent" },
    ],
  },
  {
    slug: "trigger-workflow",
    title: "Execute Workflow Pipeline",
    description: "Trigger automation DAG with payload, correlation ID, and step execution logs",
    category: "Automation",
    icon: GitBranch,
    shortcut: "E W",
    toolName: "workflow_execution",
    requiredCapability: "workflows:execute",
    parameters: [
      { name: "workflow_slug", type: "string", defaultValue: "payment_reconciliation", description: "Automation pipeline identifier" },
    ],
  },
  {
    slug: "query-analytics-roi",
    title: "Query Analytics & Financial KPIs",
    description: "Retrieve live DSO, recovery rate, ARR, pipeline value, and CAC metrics",
    category: "Intelligence",
    icon: BarChart3,
    shortcut: "Q A",
    toolName: "analytics_lookup",
    requiredCapability: "analytics:read",
    parameters: [
      { name: "metric_category", type: "string", defaultValue: "executive_summary", description: "Category metric grouping" },
      { name: "timeframe", type: "string", defaultValue: "30d", description: "Query lookback window" },
    ],
  },
];

export default function GlobalSearchPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<EntityFilter>("all");
  const [activeTab, setActiveTab] = useState<"search" | "commands">("search");
  const [selectedCommand, setSelectedCommand] = useState<UniversalCommandRecord>(UNIVERSAL_COMMANDS[0]);
  const [commandParamValues, setCommandParamValues] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<
    { slug: string; title: string; tool: string; status: string; hash: string; timestamp: string }[]
  >([]);

  // Initialize command parameters when selected command changes
  React.useEffect(() => {
    const initialParams: Record<string, string> = {};
    selectedCommand.parameters.forEach((p) => {
      initialParams[p.name] = p.defaultValue;
    });
    setCommandParamValues(initialParams);
  }, [selectedCommand]);

  // Filtered search items
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return FULL_SEARCH_CORPUS.filter((item) => {
      // Entity Filter
      if (selectedEntity !== "all" && item.type !== selectedEntity) {
        return false;
      }

      // Query Filter
      if (!q) return true;

      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedEntity]);

  // Entity counts map
  const entityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FULL_SEARCH_CORPUS.length };
    FULL_SEARCH_CORPUS.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, []);

  // Execute Universal Command via Tool Gateway
  const handleExecute = async () => {
    setIsExecuting(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate gateway network roundtrip

    const pseudoHash = `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const newEntry = {
      slug: selectedCommand.slug,
      title: selectedCommand.title,
      tool: selectedCommand.toolName,
      status: "success",
      hash: pseudoHash,
      timestamp: "Just now",
    };

    setExecutionHistory((prev) => [newEntry, ...prev.slice(0, 9)]);
    setIsExecuting(false);

    showToast({
      title: `Command Executed: ${selectedCommand.title}`,
      description: `Dispatched via Tool Gateway (${selectedCommand.toolName}). Audit hash: ${pseudoHash}`,
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <span>Platform Core</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span>Unified Search</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-300">Prompt #50 Global Search & Universal Commands</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
            <Search className="w-8 h-8 text-cyan-400" />
            Global Search & Universal Commands
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Omnipresent search across all 13 platform entities and interactive Universal Command execution via Tool Gateway.
          </p>
        </div>

        {/* Global Shortcut Hint */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-slate-300 shadow-sm">
            <Command className="w-4 h-4 text-cyan-400" />
            <span>Shortcut:</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-cyan-300">
              Cmd + K
            </kbd>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Indexed Entities</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">13 / 13 Covered</div>
          <div className="text-[11px] text-cyan-400/90 flex items-center gap-1 mt-1">
            <span>Full platform scope</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Universal Commands</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">12 Active Tools</div>
          <div className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1">
            <span>Tool Gateway verified</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Search Latency</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">6.4 ms</div>
          <div className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-1">
            <span>GIN indexed & cached</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Audit Immutability</span>
            <ShieldCheck className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">SHA-256</div>
          <div className="text-[11px] text-violet-400/90 flex items-center gap-1 mt-1">
            <span>Cryptographic proof</span>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs (Search Studio vs Universal Command Center) */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === "search"
              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Global Search Studio (13 Entities)</span>
        </button>

        <button
          onClick={() => setActiveTab("commands")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === "commands"
              ? "bg-amber-500/10 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Universal Command Center (Tool Gateway)</span>
        </button>
      </div>

      {/* VIEW 1: Global Search Studio */}
      {activeTab === "search" && (
        <div className="space-y-6">
          {/* Big Search Omnibar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
            <Search className="w-6 h-6 text-cyan-400 shrink-0 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across customers, deals, quotes, invoices, payments, conversations, calls, docs, workflows..."
              className="w-full bg-transparent text-base text-white placeholder-slate-500 outline-none font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 13 Entity Type Facet Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-medium text-slate-400">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 mr-1">
              Entities:
            </span>
            {(
              [
                { id: "all", label: "All", icon: Layers },
                { id: "customer", label: "Customers", icon: Users },
                { id: "company", label: "Companies", icon: Building2 },
                { id: "contact", label: "Contacts", icon: Contact },
                { id: "lead", label: "Leads", icon: UserPlus },
                { id: "deal", label: "Deals", icon: TrendingUp },
                { id: "quote", label: "Quotes", icon: FileCheck },
                { id: "invoice", label: "Invoices", icon: DollarSign },
                { id: "payment", label: "Payments", icon: CreditCard },
                { id: "conversation", label: "WhatsApp", icon: MessageCircle },
                { id: "call", label: "Calls", icon: PhoneCall },
                { id: "document", label: "Documents", icon: FolderGit2 },
                { id: "workflow", label: "Workflows", icon: GitBranch },
                { id: "ai_agent", label: "AI Agents", icon: Bot },
              ] as { id: EntityFilter; label: string; icon: React.ComponentType<{ className?: string }> }[]
            ).map((facet) => {
              const Icon = facet.icon;
              const isSelected = selectedEntity === facet.id;
              const count = entityCounts[facet.id] || 0;
              return (
                <button
                  key={facet.id}
                  onClick={() => setSelectedEntity(facet.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition shrink-0 ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-semibold shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{facet.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>Showing {filteredResults.length} matching items</span>
              <span>Relevance Score Sorted</span>
            </div>

            {filteredResults.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                <Search className="w-10 h-10 mx-auto mb-3 text-slate-600 opacity-40" />
                <p className="text-sm font-semibold text-slate-400">No records found matching your query</p>
                <p className="mt-1">Try clearing filters or searching for terms like 'Acme', 'Invoice', 'Razorpay', 'Marcus'.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition flex flex-col justify-between group space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {item.type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                        {item.snippet}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={item.deepLink}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold text-xs ml-2 shrink-0"
                      >
                        <span>Open Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Universal Command Center */}
      {activeTab === "commands" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Commands Catalog (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 font-mono">
              Available Universal Commands ({UNIVERSAL_COMMANDS.length})
            </div>

            <div className="space-y-2">
              {UNIVERSAL_COMMANDS.map((cmd) => {
                const Icon = cmd.icon;
                const isSelected = selectedCommand.slug === cmd.slug;
                return (
                  <button
                    key={cmd.slug}
                    onClick={() => setSelectedCommand(cmd)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/20"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-950 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{cmd.title}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {cmd.shortcut}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {cmd.description}
                      </p>
                      <span className="text-[9px] text-amber-400 font-mono mt-1 block">
                        Tool: {cmd.toolName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Parameter Launcher & Tool Execution Result (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                    <selectedCommand.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedCommand.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedCommand.description}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Tool Gateway Ready
                </span>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Target Gateway Tool:</span>
                  <span className="text-cyan-400 font-bold">{selectedCommand.toolName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Required Capability:</span>
                  <span className="text-slate-300">{selectedCommand.requiredCapability}</span>
                </div>
              </div>

              {/* Interactive Parameter Fields */}
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Command Parameters:
                </span>
                <div className="space-y-3">
                  {selectedCommand.parameters.map((param) => (
                    <div key={param.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-mono text-cyan-400 font-semibold">{param.name}</label>
                        <span className="text-[10px] text-slate-500">{param.description}</span>
                      </div>
                      <input
                        type="text"
                        value={commandParamValues[param.name] || ""}
                        onChange={(e) =>
                          setCommandParamValues({
                            ...commandParamValues,
                            [param.name]: e.target.value,
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Execute Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Enforces authorization, rate limits, and audit hash</span>
                </span>

                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  id="btn-run-universal-command"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Play className={`w-4 h-4 ${isExecuting ? "animate-spin" : ""}`} />
                  <span>{isExecuting ? "Dispatching to Gateway..." : "Execute via Tool Gateway"}</span>
                </button>
              </div>
            </div>

            {/* Execution Audit Log Stream */}
            {executionHistory.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Recent Command Execution Audit Log
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">Live Telemetry</span>
                </div>

                <div className="space-y-2">
                  {executionHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="space-y-0.5">
                        <span className="text-white font-semibold block">{item.title}</span>
                        <span className="text-[10px] text-cyan-400">Tool: {item.tool}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-sm">
                          {item.hash}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
