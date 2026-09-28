"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserPlus,
  Building2,
  TrendingUp,
  FileCheck,
  DollarSign,
  Link2,
  CreditCard,
  History,
  BarChart3,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Copy,
  QrCode,
  Zap,
  Play,
  Layers,
  ChevronRight,
  PackageCheck,
  Receipt,
  Eye,
  Check
} from "lucide-react";
import { useToast } from "@/components/ui";

// ============================================================================
// Stage Definitions & Types
// ============================================================================

type StageId =
  | "lead"
  | "contact_company"
  | "deal"
  | "quote"
  | "invoice"
  | "payment_link"
  | "payment"
  | "timeline"
  | "analytics";

interface StageMeta {
  id: StageId;
  index: number;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  module: string;
  moduleRoute: string;
  description: string;
}

const STAGES: StageMeta[] = [
  {
    id: "lead",
    index: 1,
    label: "1. Lead Capture & BANT",
    shortLabel: "Lead",
    icon: UserPlus,
    color: "from-blue-500 to-cyan-500",
    module: "CRM Leads",
    moduleRoute: "/leads",
    description: "Capture inbound lead, score intent, and qualify BANT budget & authority",
  },
  {
    id: "contact_company",
    index: 2,
    label: "2. Contact & Company",
    shortLabel: "Contact / Co",
    icon: Building2,
    color: "from-cyan-500 to-teal-500",
    module: "Customer 360",
    moduleRoute: "/customers",
    description: "Convert qualified lead into unified Customer 360 company & contact graph",
  },
  {
    id: "deal",
    index: 3,
    label: "3. CRM Deal Pipeline",
    shortLabel: "Deal",
    icon: TrendingUp,
    color: "from-teal-500 to-emerald-500",
    module: "CRM Deals",
    moduleRoute: "/crm",
    description: "Open structured deal with win probability, stage gates, and expected close date",
  },
  {
    id: "quote",
    index: 4,
    label: "4. Quote & Inventory",
    shortLabel: "Quote",
    icon: FileCheck,
    color: "from-emerald-500 to-green-500",
    module: "ERP Quotes",
    moduleRoute: "/quotes",
    description: "Generate price estimate, reserve warehouse stock, and apply authorized discounts",
  },
  {
    id: "invoice",
    index: 5,
    label: "5. ERP Invoice Issuance",
    shortLabel: "Invoice",
    icon: DollarSign,
    color: "from-yellow-500 to-amber-500",
    module: "ERP Invoicing",
    moduleRoute: "/invoices",
    description: "Issue legally compliant ERP tax invoice (INV-2026-XXXX) with payment terms",
  },
  {
    id: "payment_link",
    index: 6,
    label: "6. Razorpay / Stripe Link",
    shortLabel: "Payment Link",
    icon: Link2,
    color: "from-amber-500 to-orange-500",
    module: "Payment Gateway",
    moduleRoute: "/payments",
    description: "Generate secure hosted checkout URL with QR code via configured Razorpay provider",
  },
  {
    id: "payment",
    index: 7,
    label: "7. Payment & Fulfillment",
    shortLabel: "Payment",
    icon: CreditCard,
    color: "from-orange-500 to-red-500",
    module: "Settlement & ERP",
    moduleRoute: "/payments",
    description: "Capture transaction, reconcile ledger, and release reserved stock for fulfillment",
  },
  {
    id: "timeline",
    index: 8,
    label: "8. Customer 360 Timeline",
    shortLabel: "Timeline",
    icon: History,
    color: "from-purple-500 to-pink-500",
    module: "Timeline Audit",
    moduleRoute: "/timeline",
    description: "Broadcast immutable milestone event across CRM, ERP, and communication channels",
  },
  {
    id: "analytics",
    index: 9,
    label: "9. Executive Analytics & ROI",
    shortLabel: "Analytics",
    icon: BarChart3,
    color: "from-pink-500 to-indigo-500",
    module: "Analytics ROI",
    moduleRoute: "/analytics",
    description: "Attribute revenue, calculate lead-to-cash velocity, and update company lifetime value",
  },
];

export interface SalesFlowScenario {
  id: string;
  flowNumber: string;
  title: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  dealValue: number;
  currency: string;
  currentStage: StageId;
  completedStages: StageId[];
  mode: "human" | "ai_agent";
  sku: string;
  productName: string;
  quantity: number;
  paymentProvider: "razorpay" | "stripe";
  razorpayLinkId: string;
  checkoutUrl: string;
  invoiceNumber: string;
  timelineLogs: {
    stage: StageId;
    title: string;
    timestamp: string;
    actor: string;
    actorType: "human" | "ai_agent";
  }[];
}

// Initial Scenarios
const INITIAL_FLOWS: SalesFlowScenario[] = [
  {
    id: "flow-001",
    flowNumber: "SF-2026-8812",
    title: "Enterprise Omnichannel Expansion",
    customerName: "Marcus Vance",
    companyName: "Acme Global Logistics Pte Ltd",
    email: "m.vance@acmeglobal.com",
    phone: "+65 6712 9081",
    dealValue: 34500.0,
    currency: "USD",
    currentStage: "quote",
    completedStages: ["lead", "contact_company", "deal"],
    mode: "human",
    sku: "NX-SVR-EDGE",
    productName: "Nexus Enterprise Telephony Appliance v4",
    quantity: 10,
    paymentProvider: "razorpay",
    razorpayLinkId: "plink_Rzp9128Acme01",
    checkoutUrl: "https://rzp.io/i/demo_sf_acme01",
    invoiceNumber: "INV-2026-0814",
    timelineLogs: [
      {
        stage: "lead",
        title: "Inbound enterprise web lead captured and scored 88/100 (BANT Qualified)",
        timestamp: "Today, 10:15 AM",
        actor: "Sarah Jenkins (Senior AE)",
        actorType: "human",
      },
      {
        stage: "contact_company",
        title: "Converted to Customer 360 record with company entity graph linked",
        timestamp: "Today, 10:45 AM",
        actor: "Sarah Jenkins (Senior AE)",
        actorType: "human",
      },
      {
        stage: "deal",
        title: "Commercial Deal opened in CRM Pipeline ($34,500.00, 75% Probability)",
        timestamp: "Today, 11:20 AM",
        actor: "Sarah Jenkins (Senior AE)",
        actorType: "human",
      },
    ],
  },
  {
    id: "flow-002",
    flowNumber: "SF-2026-7493",
    title: "AI Voice PBX & Automated Dispatch",
    customerName: "Evelyn Tan",
    companyName: "SingaMaritime Fleet Solutions",
    email: "evelyn.tan@singamaritime.sg",
    phone: "+65 8923 1122",
    dealValue: 18200.0,
    currency: "USD",
    currentStage: "lead",
    completedStages: [],
    mode: "ai_agent",
    sku: "NX-GW-SMS",
    productName: "High-Throughput Global WhatsApp Gateway",
    quantity: 5,
    paymentProvider: "razorpay",
    razorpayLinkId: "plink_Rzp7493Singa02",
    checkoutUrl: "https://rzp.io/i/demo_sf_singa02",
    invoiceNumber: "INV-2026-0899",
    timelineLogs: [],
  },
  {
    id: "flow-003",
    flowNumber: "SF-2026-5520",
    title: "Regional SIP Trunking & Voice Trunk",
    customerName: "Rohan Nair",
    companyName: "Pacific Marine Logistics",
    email: "rohan@pacificmarine.com",
    phone: "+65 9182 3410",
    dealValue: 12400.0,
    currency: "USD",
    currentStage: "payment_link",
    completedStages: ["lead", "contact_company", "deal", "quote", "invoice"],
    mode: "ai_agent",
    sku: "NX-IP-SIP",
    productName: "Carrier-Grade Session Border Gateway",
    quantity: 2,
    paymentProvider: "razorpay",
    razorpayLinkId: "plink_Rzp5520Pac03",
    checkoutUrl: "https://rzp.io/i/demo_sf_pacific03",
    invoiceNumber: "INV-2026-0742",
    timelineLogs: [
      {
        stage: "lead",
        title: "AI Sales Agent auto-qualified inbound RFP lead",
        timestamp: "Yesterday, 02:00 PM",
        actor: "Nexus AI Sales Copilot",
        actorType: "ai_agent",
      },
      {
        stage: "contact_company",
        title: "Company profile created and enriched via ACRA Singapore registry lookup",
        timestamp: "Yesterday, 02:05 PM",
        actor: "Nexus AI Sales Copilot",
        actorType: "ai_agent",
      },
      {
        stage: "deal",
        title: "Automated deal pipeline entry initiated with 85% confidence score",
        timestamp: "Yesterday, 02:10 PM",
        actor: "Nexus AI Sales Copilot",
        actorType: "ai_agent",
      },
      {
        stage: "quote",
        title: "Quote generated with real-time warehouse inventory reservation check",
        timestamp: "Yesterday, 02:15 PM",
        actor: "Nexus AI Sales Copilot",
        actorType: "ai_agent",
      },
      {
        stage: "invoice",
        title: "Customer e-signed quote via link; ERP Invoice INV-2026-0742 issued",
        timestamp: "Yesterday, 03:00 PM",
        actor: "Nexus AI Sales Copilot",
        actorType: "ai_agent",
      },
    ],
  },
];

export default function CompleteSalesFlowPage() {
  const { showToast } = useToast();
  const [flows, setFlows] = useState<SalesFlowScenario[]>(INITIAL_FLOWS);
  const [selectedFlowId, setSelectedFlowId] = useState<string>("flow-001");
  const [activeTabStage, setActiveTabStage] = useState<StageId>("quote");
  const [isAiExecuting, setIsAiExecuting] = useState<boolean>(false);
  const [aiProgressLog, setAiProgressLog] = useState<string[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);

  // Active Flow Selection
  const activeFlow = useMemo(() => {
    return flows.find((f) => f.id === selectedFlowId) || flows[0];
  }, [flows, selectedFlowId]);

  // Sync tab stage when flow changes
  React.useEffect(() => {
    setActiveTabStage(activeFlow.currentStage);
  }, [activeFlow.id, activeFlow.currentStage]);

  // Helper to find stage index
  const getStageIndex = (id: StageId): number => {
    return STAGES.find((s) => s.id === id)?.index || 1;
  };

  // Status check for stage
  const getStageStatus = (stageId: StageId) => {
    if (activeFlow.completedStages.includes(stageId)) return "completed";
    if (activeFlow.currentStage === stageId) return "current";
    return "upcoming";
  };

  // Advance Single Stage (Manual or AI)
  const advanceStage = (actorType: "human" | "ai_agent", customActorName?: string) => {
    const currentIndex = getStageIndex(activeFlow.currentStage);
    if (currentIndex >= 9) {
      showToast({
        title: "Flow Already Completed",
        description: "This sales cycle has completed all 9 stages up to Executive Analytics attribution.",
        variant: "default",
      });
      return;
    }

    const nextStage = STAGES[currentIndex].id; // 0-based array index of next stage
    const currentStageMeta = STAGES[currentIndex - 1];
    const nextStageMeta = STAGES[currentIndex];

    const actorName =
      customActorName ||
      (actorType === "human" ? "Alex Rivera (Commercial Dir.)" : "Nexus Sales Agent (Autonomous)");

    const newLog = {
      stage: currentStageMeta.id,
      title: `Successfully completed ${currentStageMeta.shortLabel} → Advanced to ${nextStageMeta.label}`,
      timestamp: "Just now",
      actor: actorName,
      actorType,
    };

    setFlows((prev) =>
      prev.map((f) => {
        if (f.id === activeFlow.id) {
          const updatedCompleted = Array.from(new Set([...f.completedStages, f.currentStage]));
          return {
            ...f,
            currentStage: nextStage,
            completedStages: updatedCompleted,
            timelineLogs: [newLog, ...f.timelineLogs],
          };
        }
        return f;
      })
    );

    setActiveTabStage(nextStage);

    showToast({
      title: `Advanced to ${nextStageMeta.shortLabel}`,
      description: `Transition executed by ${actorType === "human" ? "Human Operator" : "AI Agent"}. Timeline event & audit log updated.`,
      variant: "success",
    });
  };

  // Run AI Full Autonomous Pipeline (1-Click Lead to Analytics)
  const runFullAiAutonomousCycle = async () => {
    if (isAiExecuting) return;
    setIsAiExecuting(true);
    setAiProgressLog([]);

    const currentIndex = getStageIndex(activeFlow.currentStage);
    const stagesToRun = STAGES.slice(currentIndex - 1);

    for (let i = 0; i < stagesToRun.length; i++) {
      const step = stagesToRun[i];
      const stepMsg = `[AI COPILOT] Evaluating Step ${step.index}/9: ${step.label} (Confidence: 0.98, SHA-256 validated)`;
      setAiProgressLog((prev) => [...prev, stepMsg]);

      // Small async sleep to simulate real-world AI reasoning & database transactions
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (i < stagesToRun.length - 1) {
        advanceStage("ai_agent", "Nexus Autonomous AI Agent (Role: sales_agent)");
      }
    }

    setIsAiExecuting(false);
    showToast({
      title: "Full Sales Flow Completed!",
      description: "AI Agent successfully converted Lead → Cash → Timeline → Executive Analytics with zero manual intervention.",
      variant: "success",
    });
  };

  // Simulate Instant Razorpay Payment Capture
  const handleSimulatePayment = () => {
    setPaymentModalOpen(false);
    advanceStage(activeFlow.mode === "human" ? "human" : "ai_agent", "Razorpay Webhook (payment.captured)");
    showToast({
      title: "Payment Received via Razorpay",
      description: `Captured $${activeFlow.dealValue.toLocaleString()} via UPI/Card. Inventory fulfilled & customer notified via WhatsApp.`,
      variant: "success",
    });
  };

  // Reset current flow for demo purposes
  const handleResetFlow = () => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id === activeFlow.id) {
          return {
            ...f,
            currentStage: "lead",
            completedStages: [],
            timelineLogs: [],
          };
        }
        return f;
      })
    );
    setActiveTabStage("lead");
    showToast({
      title: "Flow Reset to Lead Stage",
      description: "Sales flow has been initialized back to Stage 1 for interactive demonstration.",
      variant: "default",
    });
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalPipeline = flows.reduce((acc, f) => acc + f.dealValue, 0);
    const completedCount = flows.filter((f) => f.currentStage === "analytics").length;
    return {
      totalPipeline,
      activeCount: flows.length,
      completedCount,
      aiAutomatedRate: "89.4%",
      avgVelocityDays: "3.2 Days",
    };
  }, [flows]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <span>CRM & Sales</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span>End-to-End Execution</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-300">Prompt #49 Complete Sales Flow</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            Complete Sales Lifecycle Flow
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Unified 9-Stage execution engine:{" "}
            <span className="text-slate-300 font-medium">
              Lead → Contact/Company → Deal → Quote → Invoice → Payment Link → Payment → Timeline → Analytics
            </span>
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetFlow}
            id="btn-reset-flow"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Cycle
          </button>

          <button
            onClick={runFullAiAutonomousCycle}
            disabled={isAiExecuting || activeFlow.currentStage === "analytics"}
            id="btn-ai-autopilot"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-lg transition ${
              isAiExecuting
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white hover:opacity-95 shadow-violet-500/20 active:scale-95"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isAiExecuting ? "animate-spin" : ""}`} />
            {isAiExecuting ? "AI Autopilot Executing..." : "Run AI Autopilot (1-Click)"}
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">
            ${metrics.totalPipeline.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-1 font-medium">
            <span>+18.4% this quarter</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Cycles</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">{metrics.activeCount} Deals</div>
          <div className="text-[11px] text-cyan-400/90 flex items-center gap-1 mt-1">
            <span>All 9 stages mapped</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Autonomous Rate</span>
            <Bot className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">{metrics.aiAutomatedRate}</div>
          <div className="text-[11px] text-violet-400/90 flex items-center gap-1 mt-1">
            <span>Policy checked & audited</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lead-to-Cash Velocity</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">{metrics.avgVelocityDays}</div>
          <div className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1">
            <span>Down from 18 days</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Payment Provider</span>
            <CreditCard className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">Razorpay</div>
          <div className="text-[11px] text-orange-400/90 flex items-center gap-1 mt-1">
            <span>Configured in Prompt #17</span>
          </div>
        </div>
      </div>

      {/* Scenario Selector & Operator Mode Switch */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Active Cycle:
          </span>
          <div className="flex flex-wrap gap-2 w-full">
            {flows.map((flow) => {
              const isSelected = flow.id === activeFlow.id;
              return (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  id={`btn-select-flow-${flow.id}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-2 ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-sm"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <span className="font-mono text-[11px] text-cyan-400">{flow.flowNumber}</span>
                  <span className="truncate max-w-[140px]">{flow.companyName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    ${(flow.dealValue / 1000).toFixed(1)}k
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Toggle (Human vs AI Agent) */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Operator Mode:</span>
          <button
            onClick={() =>
              setFlows((prev) =>
                prev.map((f) => (f.id === activeFlow.id ? { ...f, mode: "human" } : f))
              )
            }
            id="toggle-mode-human"
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
              activeFlow.mode === "human"
                ? "bg-slate-800 text-cyan-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Human UI
          </button>
          <button
            onClick={() =>
              setFlows((prev) =>
                prev.map((f) => (f.id === activeFlow.id ? { ...f, mode: "ai_agent" } : f))
              )
            }
            id="toggle-mode-ai"
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
              activeFlow.mode === "ai_agent"
                ? "bg-violet-600/30 border border-violet-500/50 text-violet-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Agent Copilot
          </button>
        </div>
      </div>

      {/* 9-Stage Visual Ribbon Stepper */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Progression Pipeline:
            </span>
            <span className="text-xs font-semibold text-cyan-400 font-mono">
              Stage {getStageIndex(activeFlow.currentStage)} of 9
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Done ({activeFlow.completedStages.length})
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Current
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" /> Remaining (
              {9 - activeFlow.completedStages.length - (activeFlow.currentStage === "analytics" ? 0 : 1)})
            </span>
          </div>
        </div>

        {/* Stepper Grid / Ribbon */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {STAGES.map((stage) => {
            const status = getStageStatus(stage.id);
            const isTabActive = activeTabStage === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveTabStage(stage.id)}
                id={`stage-ribbon-${stage.id}`}
                className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition group ${
                  status === "completed"
                    ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30"
                    : status === "current"
                    ? "bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/50"
                    : "bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700"
                } ${isTabActive ? "ring-2 ring-white/20" : ""}`}
              >
                {/* Number / Status Badge */}
                <div className="flex items-center justify-center mb-2">
                  {status === "completed" ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : status === "current" ? (
                    <div className="w-7 h-7 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs animate-pulse">
                      {stage.index}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      {stage.index}
                    </div>
                  )}
                </div>

                <Icon className={`w-4 h-4 mb-1 ${status === "current" ? "text-cyan-400" : ""}`} />
                <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                  {stage.shortLabel}
                </span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">{stage.module}</span>

                {status === "current" && (
                  <span className="absolute -bottom-1.5 w-6 h-1 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage Workbench (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Stage Detail & Interaction Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {(() => {
            const currentTabMeta = STAGES.find((s) => s.id === activeTabStage) || STAGES[0];
            const isStageCurrent = activeFlow.currentStage === currentTabMeta.id;
            const isStageDone = activeFlow.completedStages.includes(currentTabMeta.id);

            return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Card Header with Module link */}
                <div className="p-6 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTabMeta.color} p-0.5 shadow-md flex items-center justify-center text-white`}
                    >
                      <currentTabMeta.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                          Stage {currentTabMeta.index} / 9
                        </span>
                        {isStageDone ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        ) : isStageCurrent ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 animate-pulse">
                            Active Stage
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-white mt-0.5">{currentTabMeta.label}</h2>
                    </div>
                  </div>

                  {/* Connected Module deep link */}
                  <Link
                    href={currentTabMeta.moduleRoute}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-800/50 hover:bg-cyan-900/30 transition w-fit"
                  >
                    <span>Inspect {currentTabMeta.module}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Card Body - Content Specific to Selected Stage */}
                <div className="p-6 space-y-6">
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-cyan-400 font-semibold">Stage Objective: </span>
                    {currentTabMeta.description}
                  </p>

                  {/* Stage 1: Lead Capture */}
                  {currentTabMeta.id === "lead" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-400 block">Lead Contact</span>
                          <span className="text-sm font-semibold text-white">{activeFlow.customerName}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{activeFlow.email}</span>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-400 block">Organization</span>
                          <span className="text-sm font-semibold text-white">{activeFlow.companyName}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{activeFlow.phone}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">BANT Qualification Score:</span>
                          <span className="text-emerald-400 font-bold">92 / 100 (Hot Lead)</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Budget</span>
                            <span className="text-emerald-400 font-semibold">Verified ($50k)</span>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Authority</span>
                            <span className="text-emerald-400 font-semibold">VP Technology</span>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Need</span>
                            <span className="text-emerald-400 font-semibold">Cloud Migration</span>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Timeline</span>
                            <span className="text-emerald-400 font-semibold">Q3 Immediate</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 2: Contact & Company */}
                  {currentTabMeta.id === "contact_company" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <span className="text-xs font-semibold text-slate-300 block">
                          Customer 360 Entity Graph Generation
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Company Record</span>
                            <span className="text-sm font-bold text-white block mt-1">
                              {activeFlow.companyName}
                            </span>
                            <span className="text-[10px] text-cyan-400">ID: comp_9182a01</span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Primary Contact</span>
                            <span className="text-sm font-bold text-white block mt-1">
                              {activeFlow.customerName}
                            </span>
                            <span className="text-[10px] text-cyan-400">ID: cont_4412c09</span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Lifecycle Tier</span>
                            <span className="text-sm font-bold text-emerald-400 block mt-1">
                              Enterprise Tier 1
                            </span>
                            <span className="text-[10px] text-slate-400">Credit: Approved</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 3: Deal */}
                  {currentTabMeta.id === "deal" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">CRM Deal Details</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                            Stage: Negotiation (80%)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Deal Value</span>
                            <span className="text-sm font-bold text-white">
                              ${activeFlow.dealValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Currency</span>
                            <span className="text-sm font-bold text-white">{activeFlow.currency}</span>
                          </div>
                          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Close Date</span>
                            <span className="text-sm font-bold text-white">End of Month</span>
                          </div>
                          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Pipeline</span>
                            <span className="text-sm font-bold text-cyan-400">Enterprise Core</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 4: Quote & Inventory */}
                  {currentTabMeta.id === "quote" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">
                            Commercial Quote & ERP Stock Check
                          </span>
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                            <PackageCheck className="w-3.5 h-3.5" /> Stock Reserved in WH-SG-01
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="text-[10px] text-slate-500 uppercase bg-slate-900 border-b border-slate-800">
                              <tr>
                                <th className="p-2">SKU</th>
                                <th className="p-2">Description</th>
                                <th className="p-2 text-right">Qty</th>
                                <th className="p-2 text-right">Unit Price</th>
                                <th className="p-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                              <tr>
                                <td className="p-2 text-cyan-400 font-semibold">{activeFlow.sku}</td>
                                <td className="p-2 text-slate-300 font-sans">{activeFlow.productName}</td>
                                <td className="p-2 text-right text-white">{activeFlow.quantity}</td>
                                <td className="p-2 text-right text-slate-300">
                                  ${(activeFlow.dealValue / activeFlow.quantity).toFixed(2)}
                                </td>
                                <td className="p-2 text-right text-emerald-400 font-bold">
                                  ${activeFlow.dealValue.toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-800 text-xs">
                          <div className="text-right space-y-1">
                            <div className="text-slate-400">
                              Subtotal:{" "}
                              <span className="font-mono text-white font-semibold">
                                ${activeFlow.dealValue.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-slate-400">
                              Tax (GST 9%):{" "}
                              <span className="font-mono text-white">
                                ${(activeFlow.dealValue * 0.09).toFixed(2)}
                              </span>
                            </div>
                            <div className="text-cyan-400 font-bold text-sm">
                              Grand Total:{" "}
                              <span className="font-mono">
                                ${(activeFlow.dealValue * 1.09).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 5: Invoice Issuance */}
                  {currentTabMeta.id === "invoice" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-300">
                              Official ERP Tax Invoice
                            </span>
                            <span className="text-sm font-mono text-cyan-400 font-bold block mt-0.5">
                              {activeFlow.invoiceNumber}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            Payment Due: Net 30 Days
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Billed To</span>
                            <span className="text-slate-200 font-semibold block mt-0.5">
                              {activeFlow.companyName}
                            </span>
                            <span className="text-[10px] text-slate-400">Attn: {activeFlow.customerName}</span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Issue Date</span>
                            <span className="text-slate-200 font-semibold block mt-0.5">23 Sep 2026</span>
                            <span className="text-[10px] text-emerald-400">GL Account: 1200 - AR</span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Total Payable</span>
                            <span className="text-emerald-400 font-bold text-sm block mt-0.5 font-mono">
                              ${(activeFlow.dealValue * 1.09).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400">Currency: {activeFlow.currency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 6: Payment Link Creation */}
                  {currentTabMeta.id === "payment_link" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-orange-400" />
                            <span className="text-xs font-semibold text-slate-200">
                              Configured Gateway: Razorpay (Prompt #17 Provider)
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Live Provider Connected
                          </span>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                              <QrCode className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                              <span className="text-[11px] text-slate-400 block font-mono">
                                {activeFlow.razorpayLinkId}
                              </span>
                              <a
                                href={activeFlow.checkoutUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                              >
                                {activeFlow.checkoutUrl}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activeFlow.checkoutUrl);
                              showToast({
                                title: "Payment Link Copied",
                                description: "Ready to share with customer via WhatsApp, Email, or SMS.",
                                variant: "success",
                              });
                            }}
                            id="btn-copy-paylink"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition whitespace-nowrap"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Link
                          </button>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => setPaymentModalOpen(true)}
                            id="btn-open-payment-modal"
                            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Simulate Customer Checkout Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 7: Payment & Fulfillment */}
                  {currentTabMeta.id === "payment" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">
                            Transaction & Inventory Settlement
                          </span>
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Settled (Bank Reconciliation OK)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Gateway Ref</span>
                            <span className="text-xs font-mono text-cyan-400 block mt-1">
                              pay_Rzp9821AcmeSettled
                            </span>
                            <span className="text-[10px] text-slate-400">Method: UPI / Card</span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Amount Captured</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono block mt-1">
                              ${(activeFlow.dealValue * 1.09).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400">Status: Succeeded</span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Stock Fulfillment</span>
                            <span className="text-xs font-semibold text-white block mt-1">
                              Warehouse WH-SG-01
                            </span>
                            <span className="text-[10px] text-emerald-400">Allocated stock released</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 8: Customer Timeline */}
                  {currentTabMeta.id === "timeline" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <span className="text-xs font-semibold text-slate-300 block">
                          Customer 360 Unified Activity Stream
                        </span>
                        <div className="space-y-2.5">
                          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <CreditCard className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-xs flex-1">
                              <span className="font-semibold text-white">Payment Captured</span>
                              <p className="text-slate-400 text-[11px] mt-0.5">
                                Customer paid ${(activeFlow.dealValue * 1.09).toFixed(2)} for invoice{" "}
                                {activeFlow.invoiceNumber}.
                              </p>
                              <span className="text-[10px] text-slate-500">Source: Payments & ERP Engine</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                              <FileCheck className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-xs flex-1">
                              <span className="font-semibold text-white">Stock Allocated in Warehouse</span>
                              <p className="text-slate-400 text-[11px] mt-0.5">
                                {activeFlow.quantity} units of {activeFlow.sku} reserved and packed.
                              </p>
                              <span className="text-[10px] text-slate-500">Source: ERP Inventory Engine</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 9: Executive Analytics & ROI */}
                  {currentTabMeta.id === "analytics" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">
                            Executive Impact & Revenue Attribution
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/10 text-pink-300 border border-pink-500/30">
                            Cycle Finalized
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Attributed Revenue</span>
                            <span className="text-base font-bold text-emerald-400 font-mono block mt-1">
                              +${activeFlow.dealValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Customer LTV Impact</span>
                            <span className="text-base font-bold text-cyan-400 font-mono block mt-1">
                              +12.5%
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Lead-to-Cash</span>
                            <span className="text-base font-bold text-amber-400 block mt-1">2.4 Hours</span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">CAC Payback</span>
                            <span className="text-base font-bold text-purple-400 block mt-1">Immediate</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      Actor:{" "}
                      <strong className="text-slate-200">
                        {activeFlow.mode === "human"
                          ? "Authorized Human Operator"
                          : "Nexus AI Copilot (sales_agent role)"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Advance Button */}
                    <button
                      onClick={() => advanceStage(activeFlow.mode)}
                      disabled={isStageDone || activeFlow.currentStage === "analytics"}
                      id="btn-advance-stage"
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                        isStageDone || activeFlow.currentStage === "analytics"
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                          : activeFlow.mode === "human"
                          ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:scale-95"
                          : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20 active:scale-95"
                      }`}
                    >
                      {activeFlow.mode === "human" ? (
                        <>
                          <span>Advance to Next Stage</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>AI Autonomous Advance</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* AI Autonomous Execution Logs Stream */}
          {aiProgressLog.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-semibold text-violet-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Live AI Agent Progression Terminal
                </span>
                <span className="font-mono text-[10px] text-slate-500">Gateway Audit SHA-256</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto pr-2">
                {aiProgressLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 shrink-0">›</span>
                    <span className="leading-tight">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer 360 Timeline & Deal Snapshot (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Flow Customer 360 Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Deal Overview
              </span>
              <span className="font-mono text-xs font-bold text-cyan-400">
                {activeFlow.flowNumber}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Deal Title</span>
                <span className="text-sm font-bold text-white block">{activeFlow.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Customer</span>
                  <span className="font-semibold text-slate-200">{activeFlow.customerName}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{activeFlow.email}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Company</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {activeFlow.companyName}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{activeFlow.phone}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block">Value</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    ${activeFlow.dealValue.toLocaleString()} {activeFlow.currency}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Current Stage</span>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {STAGES.find((s) => s.id === activeFlow.currentStage)?.shortLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Customer 360 Timeline Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Customer Timeline Audit
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Real-Time
              </span>
            </div>

            {activeFlow.timelineLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No stage transitions recorded yet. Advance the stage to trigger events.
              </div>
            ) : (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {activeFlow.timelineLogs.map((log, index) => (
                  <div key={index} className="relative pl-6 pb-2 border-l border-slate-800 last:border-0">
                    <span className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-slate-900" />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                          {log.stage.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-200 font-medium leading-snug">{log.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        {log.actorType === "ai_agent" ? (
                          <Bot className="w-3 h-3 text-violet-400" />
                        ) : (
                          <User className="w-3 h-3 text-cyan-400" />
                        )}
                        <span>{log.actor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Payment Simulator Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            {/* Razorpay Brand Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-sm">Razorpay Checkout</h3>
                  <p className="text-[11px] text-blue-200">
                    Prompt #17 Provider · Verified Trusted Gateway
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-white/80 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Invoice Reference:</span>
                  <span className="font-mono text-white font-semibold">{activeFlow.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="text-white">{activeFlow.companyName}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                  <span className="text-white">Amount Due:</span>
                  <span className="text-emerald-400 font-mono">
                    ${(activeFlow.dealValue * 1.09).toFixed(2)} {activeFlow.currency}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">
                  Select Demo Payment Method:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 rounded-lg bg-slate-800/80 border border-cyan-500/50 text-cyan-300 text-left font-medium">
                    <span className="block font-bold text-white">Instant UPI / QR</span>
                    <span className="text-[10px] text-slate-400">Zero surcharge</span>
                  </button>
                  <button className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-left">
                    <span className="block font-bold text-slate-300">Corporate Card</span>
                    <span className="text-[10px] text-slate-500">Visa / Mastercard</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Test Mode Simulation: Clicking Authorize will settle invoice immediately.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulatePayment}
                id="btn-confirm-razorpay-payment"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Authorize & Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
