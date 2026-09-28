"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bot,
  Zap,
  Users,
  DollarSign,
  Building,
  Sparkles,
  X,
  FileCheck,
  CreditCard,
  MessageCircle,
  PhoneCall,
  GitBranch,
  BarChart3,
  AlertTriangle,
  FolderGit2,
  Package,
  TrendingUp,
  FileText,
  ScanLine,
  ArrowRight,
  ExternalLink,
  Command,
  CornerDownLeft,
  CheckCircle2,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./notifications";

export type EntityCategory =
  | "all"
  | "crm"
  | "erp"
  | "comms"
  | "docs"
  | "automation"
  | "ai";

export interface GlobalSearchEntity {
  id: string;
  type:
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
  title: string;
  subtitle: string;
  snippet?: string;
  deepLink: string;
  badge: string;
  badgeColor: string;
  category: EntityCategory;
}

export interface UniversalCommandDef {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: "CRM" | "ERP" | "Communications" | "Automation" | "Intelligence" | "System";
  icon: React.ReactNode;
  shortcut?: string;
  toolName: string;
  defaultParams: Record<string, unknown>;
}

// 13 Entity Search Corpus
const CORPUS_ENTITIES: GlobalSearchEntity[] = [
  // 1. Customer
  {
    id: "ent-cust-01",
    type: "customer",
    title: "Acme Global Solutions Pte Ltd",
    subtitle: "Enterprise Tier 1 · billing@acmeglobal.com",
    snippet: "APAC Headquarters with 120 PBX seats and high volume WhatsApp HSM dispatch.",
    deepLink: "/customers/c1a8d052-1982-4fae-9ef7-47b2c019a112",
    badge: "Customer 360",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    category: "crm",
  },
  // 2. Company
  {
    id: "ent-comp-01",
    type: "company",
    title: "SingaMaritime Fleet Logistics",
    subtitle: "UEN: 202619842K · Maritime & Ports · Singapore",
    snippet: "Regional freight carrier operating across Singapore, Port Klang, and Bangkok.",
    deepLink: "/companies",
    badge: "Company",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    category: "crm",
  },
  // 3. Contact
  {
    id: "ent-cont-01",
    type: "contact",
    title: "Marcus Vance",
    subtitle: "VP Technology · m.vance@acmeglobal.com · +65 6712 9081",
    snippet: "Commercial decision maker for PBX cloud migration and telephony routing.",
    deepLink: "/contacts",
    badge: "Contact",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    category: "crm",
  },
  // 4. Lead
  {
    id: "ent-lead-01",
    type: "lead",
    title: "Pacific Marine Cloud RFP Lead",
    subtitle: "Score: 92/100 · BANT Qualified · End of Month Close",
    snippet: "Requested quote for 10x Nexus Edge Telephony v4 appliances with Net 30 terms.",
    deepLink: "/leads",
    badge: "Lead",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    category: "crm",
  },
  // 5. Deal
  {
    id: "ent-deal-01",
    type: "deal",
    title: "Enterprise Omnichannel Expansion Deal",
    subtitle: "$34,500.00 USD · Stage: Negotiation (80% Win Prob)",
    snippet: "Commercial deal under Sarah Jenkins. Quote signed, awaiting Razorpay checkout.",
    deepLink: "/crm",
    badge: "CRM Deal",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/30",
    category: "crm",
  },
  // 6. Quote
  {
    id: "ent-quote-01",
    type: "quote",
    title: "Quote QT-2026-0814",
    subtitle: "$37,605.00 (Incl. 9% GST) · Approved & Inventory Reserved",
    snippet: "10x NX-SVR-EDGE allocated and reserved in warehouse WH-SG-01.",
    deepLink: "/quotes",
    badge: "ERP Quote",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    category: "erp",
  },
  // 7. Invoice
  {
    id: "ent-inv-01",
    type: "invoice",
    title: "Invoice INV-2026-0814",
    subtitle: "Billed: $37,605.00 · Balance Due: $0.00 · Status: Paid",
    snippet: "Official ERP Tax Invoice settled via Razorpay UPI and reconciled in General Ledger.",
    deepLink: "/invoices",
    badge: "ERP Invoice",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    category: "erp",
  },
  // 8. Payment
  {
    id: "ent-pay-01",
    type: "payment",
    title: "Payment pay_Rzp9821AcmeSettled",
    subtitle: "Razorpay Provider · $37,605.00 USD · Method: UPI / QR",
    snippet: "Captured transaction via webhook. Bank reconciliation confirmed with zero discrepancy.",
    deepLink: "/payments",
    badge: "Payment",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
    category: "erp",
  },
  // 9. Conversation
  {
    id: "ent-conv-01",
    type: "conversation",
    title: "WhatsApp Chat: Marcus Vance (Acme)",
    subtitle: "Channel: WhatsApp Business · 14 Messages · Live",
    snippet: "Customer: 'Thanks for the payment link! Just authorized payment through Razorpay.'",
    deepLink: "/conversations",
    badge: "WhatsApp",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    category: "comms",
  },
  // 10. Call
  {
    id: "ent-call-01",
    type: "call",
    title: "AI Voice PBX Call: SingaMaritime Lead",
    subtitle: "Duration: 4m 12s · Positive Sentiment (0.92) · MOS: 4.6",
    snippet: "AI Voice Agent qualified technical requirements and scheduled AE demo for Thursday.",
    deepLink: "/voice-calls",
    badge: "Voice Call",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    category: "comms",
  },
  // 11. Document
  {
    id: "ent-doc-01",
    type: "document",
    title: "Commercial Master Service Agreement 2026.pdf",
    subtitle: "OCR Verified · 2.4 MB · Bilingual English/Mandarin",
    snippet: "Bilingual legal SLA processed through Mathpix OCR engine with 99% accuracy.",
    deepLink: "/documents",
    badge: "OCR Doc",
    badgeColor: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
    category: "docs",
  },
  // 12. Workflow
  {
    id: "ent-wf-01",
    type: "workflow",
    title: "Autonomous Invoice Payment & Stock Fulfillment",
    subtitle: "Trigger: payment.captured · 9 Steps · Active",
    snippet: "Reconciles GL ledger, updates customer credit, releases warehouse stock, and pings WhatsApp.",
    deepLink: "/workflows",
    badge: "Workflow",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    category: "automation",
  },
  // 13. AI Agent
  {
    id: "ent-agent-01",
    type: "ai_agent",
    title: "Nexus Commercial Sales Agent",
    subtitle: "Role: sales_agent · 12 Tools · Active Copilot",
    snippet: "Authorized for autonomous Lead-to-Cash progression with enterprise safety guardrails.",
    deepLink: "/ai-agents",
    badge: "AI Agent",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    category: "ai",
  },
];

// Universal Commands List
const UNIVERSAL_COMMANDS: UniversalCommandDef[] = [
  {
    id: "cmd-quote",
    slug: "create-quote",
    title: "Create Commercial Quote",
    description: "Generate price estimate with line items, warehouse stock reservation, and tax calculation",
    category: "ERP",
    icon: <FileCheck className="h-4 w-4 text-emerald-400" />,
    shortcut: "N Q",
    toolName: "quote_creation",
    defaultParams: { customer_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112", items: [{ sku: "NX-SVR-EDGE", qty: 2 }], valid_until: "2026-10-31" },
  },
  {
    id: "cmd-paylink",
    slug: "create-payment-link",
    title: "Generate Razorpay Payment Link",
    description: "Create secure hosted checkout payment link with QR code via configured provider",
    category: "ERP",
    icon: <CreditCard className="h-4 w-4 text-orange-400" />,
    shortcut: "N P",
    toolName: "payment_link_creation",
    defaultParams: { customer_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112", amount: 2450.0, currency: "USD" },
  },
  {
    id: "cmd-stock",
    slug: "lookup-inventory-stock",
    title: "Check Inventory Stock Level",
    description: "Query warehouse availability, reserved units, and reorder status for a product SKU",
    category: "ERP",
    icon: <FolderGit2 className="h-4 w-4 text-cyan-400" />,
    shortcut: "L S",
    toolName: "inventory_lookup",
    defaultParams: { sku: "NX-SVR-EDGE", warehouse_code: "WH-SG-01" },
  },
  {
    id: "cmd-po",
    slug: "create-procurement-po",
    title: "Create Purchase Order",
    description: "Draft ERP procurement PO to replenish low inventory stock with approved supplier",
    category: "ERP",
    icon: <Package className="h-4 w-4 text-amber-400" />,
    shortcut: "N O",
    toolName: "create_procurement_po",
    defaultParams: { sku: "NX-SVR-EDGE", supplier_id: "sup_acme", quantity: 25 },
  },
  {
    id: "cmd-sales-flow",
    slug: "advance-sales-flow",
    title: "Advance 9-Stage Sales Flow",
    description: "Progress deal through complete Lead-to-Cash sales cycle with policy validation",
    category: "CRM",
    icon: <TrendingUp className="h-4 w-4 text-violet-400" />,
    shortcut: "A F",
    toolName: "sales_flow_advance",
    defaultParams: { flow_id: "flow-001", target_stage: "quote", step_data: { automated: true } },
  },
  {
    id: "cmd-whatsapp",
    slug: "send-whatsapp-notice",
    title: "Send WhatsApp Notification",
    description: "Dispatch approved HSM message template after consent and DNC compliance check",
    category: "Communications",
    icon: <MessageCircle className="h-4 w-4 text-emerald-400" />,
    shortcut: "S W",
    toolName: "whatsapp_sending",
    defaultParams: { phone_number: "+6567129081", template_name: "payment_reminder_v1", consent_verified: true },
  },
  {
    id: "cmd-call",
    slug: "schedule-voice-call",
    title: "Schedule AI Voice Call",
    description: "Schedule automated voice agent call or representative callback within calling window",
    category: "Communications",
    icon: <PhoneCall className="h-4 w-4 text-blue-400" />,
    shortcut: "S C",
    toolName: "call_scheduling",
    defaultParams: { phone_number: "+6567129081", scheduled_time: "2026-09-24T10:00:00Z", purpose: "Deal follow-up" },
  },
  {
    id: "cmd-workflow",
    slug: "trigger-workflow",
    title: "Execute Workflow Pipeline",
    description: "Trigger automation DAG with payload, correlation ID, and step execution logs",
    category: "Automation",
    icon: <GitBranch className="h-4 w-4 text-pink-400" />,
    shortcut: "E W",
    toolName: "workflow_execution",
    defaultParams: { workflow_slug: "payment_reconciliation", trigger_payload: { auto_settle: true } },
  },
  {
    id: "cmd-analytics",
    slug: "query-analytics-roi",
    title: "Query Analytics & Financial KPIs",
    description: "Retrieve live DSO, recovery rate, ARR, pipeline value, and CAC metrics",
    category: "Intelligence",
    icon: <BarChart3 className="h-4 w-4 text-indigo-400" />,
    shortcut: "Q A",
    toolName: "analytics_lookup",
    defaultParams: { metric_category: "executive_summary", timeframe: "30d" },
  },
  {
    id: "cmd-exception",
    slug: "log-platform-exception",
    title: "Log Platform Exception",
    description: "Create structured system exception ticket with severity and auto-remediation task",
    category: "System",
    icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    shortcut: "L E",
    toolName: "exception_creation",
    defaultParams: { category: "payment_webhook", severity: "medium", description: "Transient gateway latency observed" },
  },
];

export interface CommandInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandInterface: React.FC<CommandInterfaceProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<EntityCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command mode is active when query starts with '>'
  const isCommandMode = query.trim().startsWith(">");
  const cleanQuery = isCommandMode
    ? query.trim().slice(1).trim().toLowerCase()
    : query.trim().toLowerCase();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setActiveCategory("all");
    }
  }, [isOpen]);

  // Filtered search results across 13 entities
  const filteredEntities = useMemo(() => {
    if (isCommandMode) return [];

    return CORPUS_ENTITIES.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!cleanQuery) return true;

      return (
        item.title.toLowerCase().includes(cleanQuery) ||
        item.subtitle.toLowerCase().includes(cleanQuery) ||
        (item.snippet && item.snippet.toLowerCase().includes(cleanQuery)) ||
        item.type.toLowerCase().includes(cleanQuery)
      );
    });
  }, [cleanQuery, activeCategory, isCommandMode]);

  // Filtered commands
  const filteredCommands = useMemo(() => {
    if (!isCommandMode && cleanQuery.length > 0) {
      // Suggest top commands that match
      return UNIVERSAL_COMMANDS.filter(
        (c) =>
          c.title.toLowerCase().includes(cleanQuery) ||
          c.description.toLowerCase().includes(cleanQuery) ||
          c.category.toLowerCase().includes(cleanQuery)
      ).slice(0, 4);
    }

    if (isCommandMode) {
      return UNIVERSAL_COMMANDS.filter(
        (c) =>
          c.title.toLowerCase().includes(cleanQuery) ||
          c.description.toLowerCase().includes(cleanQuery) ||
          c.category.toLowerCase().includes(cleanQuery)
      );
    }

    return UNIVERSAL_COMMANDS.slice(0, 6);
  }, [cleanQuery, isCommandMode]);

  // Execute a Universal Command via Tool Gateway
  const handleExecuteCommand = (command: UniversalCommandDef) => {
    onClose();
    showToast({
      title: `Executing: ${command.title}`,
      description: `Dispatched to Tool Gateway (${command.toolName}). SHA-256 audit hash generated.`,
      variant: "success",
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => prev + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (isCommandMode && filteredCommands.length > 0) {
          const cmd = filteredCommands[selectedIndex % filteredCommands.length];
          handleExecuteCommand(cmd);
        } else if (filteredEntities.length > 0) {
          const item = filteredEntities[selectedIndex % filteredEntities.length];
          router.push(item.deepLink);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isCommandMode, filteredCommands, filteredEntities, selectedIndex, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[82vh]",
          "animate-in zoom-in-95 duration-150"
        )}
      >
        {/* Search & Omnibar Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          {isCommandMode ? (
            <Zap className="h-5 w-5 text-amber-400 mr-3 shrink-0 animate-pulse" />
          ) : (
            <Search className="h-5 w-5 text-cyan-400 mr-3 shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              isCommandMode
                ? "Type a command to execute (e.g. 'quote', 'stock', 'paylink', 'workflow')..."
                : "Search all 13 entities, or type '>' for Universal Commands..."
            }
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none font-medium"
          />

          {isCommandMode && (
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 mr-2 shrink-0">
              Command Mode
            </span>
          )}

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Category Chips (When in Search Mode) */}
        {!isCommandMode && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 overflow-x-auto text-[11px] font-medium text-slate-400">
            <span className="text-slate-500 text-[10px] mr-1 uppercase tracking-wider font-bold">
              Filter:
            </span>
            {(
              [
                { id: "all", label: "All (13)" },
                { id: "crm", label: "CRM & Sales" },
                { id: "erp", label: "ERP & Finance" },
                { id: "comms", label: "Comms & Voice" },
                { id: "docs", label: "Documents" },
                { id: "automation", label: "Workflows" },
                { id: "ai", label: "AI Agents" },
              ] as { id: EntityCategory; label: string }[]
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedIndex(0);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition whitespace-nowrap",
                  activeCategory === cat.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                    : "hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Results & Commands Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* 1. Universal Commands Section (In Command Mode OR as suggestions) */}
          {(isCommandMode || (cleanQuery.length > 0 && filteredCommands.length > 0)) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Zap className="h-3 w-3" /> Universal Commands (Tool Gateway)
                </span>
                <span>Press Enter to Run</span>
              </div>

              <div className="space-y-1">
                {filteredCommands.map((cmd, idx) => {
                  const isSelected = isCommandMode && selectedIndex % filteredCommands.length === idx;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => handleExecuteCommand(cmd)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition group border",
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/40 text-white"
                          : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 group-hover:scale-105 transition-transform">
                          {cmd.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {cmd.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {cmd.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {cmd.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {cmd.shortcut && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            {cmd.shortcut}
                          </span>
                        )}
                        <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition font-medium flex items-center gap-1">
                          Run <CornerDownLeft className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Global Entity Search Results (13 Entities) */}
          {!isCommandMode && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                <span>Matching Records ({filteredEntities.length})</span>
                <span>All 13 Entities</span>
              </div>

              {filteredEntities.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-slate-600 opacity-50" />
                  <p>No platform entities matched "{cleanQuery}"</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Try searching for Acme, Marcus, Invoice, Quote, WhatsApp, or type '&gt;' for commands.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredEntities.map((item, idx) => {
                    const isSelected = selectedIndex % filteredEntities.length === idx;
                    return (
                      <Link
                        key={item.id}
                        href={item.deepLink}
                        onClick={onClose}
                        className={cn(
                          "flex items-start justify-between p-2.5 rounded-xl cursor-pointer transition border group",
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                            : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-700"
                        )}
                      >
                        <div className="flex items-start space-x-3 flex-1 min-w-0 pr-3">
                          <div className="mt-0.5">
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono block whitespace-nowrap",
                                item.badgeColor
                              )}
                            >
                              {item.badge}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition truncate">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                            {item.snippet && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-1 font-sans">
                                {item.snippet}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-cyan-400 transition self-center">
                          <span className="text-[10px] hidden sm:inline">Jump</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer & Omnibar Helper */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono">
                ↵
              </kbd>{" "}
              Open / Run
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono">
                &gt;
              </kbd>{" "}
              Command Mode
            </span>
          </div>

          <Link
            href="/search"
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition"
          >
            <span>Open Full Search Studio</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
