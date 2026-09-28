"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Building2,
  PhoneCall,
  MessageCircle,
  Headphones,
  GitBranch,
  Bot,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  Landmark,
  FileText,
  Filter,
  Check,
  Zap,
  Lock,
  LifeBuoy,
} from "lucide-react";
import {
  Button,
  Badge,
  Sparkline,
  BarChart,
  DonutProgress,
  SentimentGauge,
} from "@/components/ui";

// Timeframe options
type Timeframe = "24h" | "7d" | "30d" | "qtd" | "ytd";

interface OperationalAlertItem {
  id: string;
  severity: "critical" | "warning" | "info";
  domain: string;
  title: string;
  description: string;
  status: "active" | "acknowledged";
  actionLabel: string;
  actionHref: string;
  timeAgo: string;
}

const INITIAL_ALERTS: OperationalAlertItem[] = [
  {
    id: "alt-1",
    severity: "critical",
    domain: "Financials & AR",
    title: "Overdue Invoice INV-2026-089 Pending Wire Settlement",
    description:
      "Customer David Miller (Vanguard Logistics) acknowledged $12,400 past due balance; promised wire clearance Friday 15:00 UTC.",
    status: "active",
    actionLabel: "Inspect PTP in Call Center",
    actionHref: "/call-center",
    timeAgo: "14 mins ago",
  },
  {
    id: "alt-2",
    severity: "warning",
    domain: "AI WhatsApp",
    title: "Meta WhatsApp Template Tier 2 Rate Alert (82%)",
    description:
      "Autonomous dunning volume nearing hourly tier threshold. Auto-rate throttle active to protect business compliance.",
    status: "active",
    actionLabel: "View WhatsApp Console",
    actionHref: "/whatsapp",
    timeAgo: "38 mins ago",
  },
  {
    id: "alt-3",
    severity: "info",
    domain: "Collections Engine",
    title: "Autonomous Dunning Settled $14,200 Across 3 Invoices",
    description:
      "Payment webhook confirmed Razorpay checkout link settlements without human collections intervention.",
    status: "active",
    actionLabel: "Open Collections Ledger",
    actionHref: "/collections",
    timeAgo: "1 hour ago",
  },
  {
    id: "alt-4",
    severity: "warning",
    domain: "Workflows & Gates",
    title: "3 Workflows Pending Dual-Controller Authorization",
    description:
      "Credit adjustments above $5,000 threshold require dual human officer sign-off before GL journal posting.",
    status: "active",
    actionLabel: "Review Approval Queue",
    actionHref: "/workflows",
    timeAgo: "2 hours ago",
  },
];

export default function ExecutiveCommandCenterPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [activeTab, setActiveTab] = useState<
    "all" | "financials" | "crm" | "comms" | "automation" | "governance"
  >("all");
  const [alerts, setAlerts] = useState<OperationalAlertItem[]>(INITIAL_ALERTS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" } : a))
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Executive Master Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 shadow-xs">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Executive Command Center
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  14/14 Systems Synchronized
                </span>
                <Badge variant="rls" size="sm">
                  PostgreSQL RLS Active
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Synthesized operational intelligence across ERP Financials, CRM Pipelines, Omnichannel AI Comms, Workflows, and Governance.
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Timeframe Selector + Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-100 border border-slate-200/80 rounded-lg p-1 shadow-xs">
            {(["24h", "7d", "30d", "qtd", "ytd"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
                  timeframe === tf
                    ? "bg-white text-blue-600 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 2. Top Executive KPI Ribbon: 4 Primary Financial & Operating Anchors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              ERP Settled Revenue
            </span>
            <span className="text-xs text-emerald-600 font-mono font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              +18.4% MoM
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">$1,845,200</span>
            <Sparkline data={[80, 95, 110, 105, 125, 138, 145]} color="#10b981" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 font-mono">
            <span>Recognized: $1,420,800</span>
            <span className="text-blue-600 font-medium">Pending: $424,400</span>
          </div>
        </div>

        {/* Metric 2: Collections Recovery */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-sky-600" />
              Collections Recovered
            </span>
            <span className="text-xs text-sky-600 font-mono font-semibold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              89.2% Rate
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">$384,500</span>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/80 font-mono font-semibold">
              77.5% Autonomous
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 font-mono">
            <span>Autonomous: $298K</span>
            <span>Manual: $86.5K</span>
          </div>
        </div>

        {/* Metric 3: Active Pipeline Value */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Active Sales Pipeline
            </span>
            <span className="text-xs text-purple-600 font-mono font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              38.2% Win Rate
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">$4,250,000</span>
            <span className="text-xs text-slate-500 font-mono">142 Leads</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 font-mono">
            <span>Avg Deal: $42.5K</span>
            <span className="text-emerald-600 font-medium">Velocity: 1.8 Days</span>
          </div>
        </div>

        {/* Metric 4: Customer Sentiment & Health */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-indigo-600" />
              AI Net Sentiment
            </span>
            <span className="text-xs text-emerald-600 font-mono font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Delighted
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">+0.82</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono font-medium">
              1,420 Accounts
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-100">
            <SentimentGauge score={0.82} />
          </div>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto text-xs font-medium">
        {[
          { id: "all", label: "All 14 Dimensions" },
          { id: "financials", label: "Financials & AR (5)" },
          { id: "crm", label: "CRM & Growth (3)" },
          { id: "comms", label: "AI Comms & Calls (2)" },
          { id: "automation", label: "Workflows & AI Control (2)" },
          { id: "governance", label: "Risk & Alerts (2)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Section 1: Financials & Cash Velocity Grid */}
      {(activeTab === "all" || activeTab === "financials") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-800 tracking-wider uppercase font-mono">
                1. Financial Engine & Cash Receivables
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium font-mono flex items-center gap-1"
            >
              Collections Console <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dimension 3: Outstanding Receivables & DSO */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Outstanding Receivables (AR)</h3>
                  <p className="text-[11px] text-slate-500">Total aging ledger balance</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900 font-mono">$412,800</span>
                  <p className="text-[10px] text-emerald-600 font-mono font-semibold">DSO: 31.4 Days</p>
                </div>
              </div>

              {/* Aging Breakdown Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Aging Brackets</span>
                  <span>Benchmark &lt; 45d</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 border border-slate-200/60 overflow-hidden flex">
                  <div style={{ width: "64%" }} className="bg-emerald-500" title="Current 0-30d: 64%" />
                  <div style={{ width: "21%" }} className="bg-sky-500" title="31-60d: 21%" />
                  <div style={{ width: "11%" }} className="bg-amber-500" title="61-90d: 11%" />
                  <div style={{ width: "4%" }} className="bg-rose-500" title="90+d: 4%" />
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono pt-1 text-center">
                  <span className="text-emerald-700 font-medium">0-30d: 64%</span>
                  <span className="text-sky-700 font-medium">31-60d: 21%</span>
                  <span className="text-amber-700 font-medium">61-90d: 11%</span>
                  <span className="text-rose-700 font-medium">90+d: 4%</span>
                </div>
              </div>
            </div>

            {/* Dimension 4: Overdue Invoices & Disputes */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Overdue Invoices</h3>
                  <p className="text-[11px] text-slate-500">23 Invoices Overdue</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-rose-600 font-mono">$92,400</span>
                  <p className="text-[10px] text-slate-500 font-mono">At Risk Balance</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">High Risk</p>
                  <p className="text-xs font-bold text-rose-600 font-mono">$52.1K</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">Medium</p>
                  <p className="text-xs font-bold text-amber-600 font-mono">$28.3K</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">Disputes</p>
                  <p className="text-xs font-bold text-sky-600 font-mono">4 Open</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-mono">Promise-to-Pay: 91.4%</span>
                <Link
                  href="/invoices"
                  className="text-blue-600 hover:text-blue-700 font-medium font-mono text-[11px]"
                >
                  View Invoices →
                </Link>
              </div>
            </div>

            {/* Dimension 5: Payment Conversion */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Payment Conversion</h3>
                  <p className="text-[11px] text-slate-500">Gateway & checkout velocity</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-600 font-mono">78.4%</span>
                  <p className="text-[10px] text-slate-500 font-mono">Link Conversion</p>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Avg Payment Clearance:</span>
                  <span className="font-mono text-slate-900 font-semibold">4.2 Hours</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Wire Settlement Success:</span>
                  <span className="font-mono text-emerald-600 font-semibold">98.2%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Failed Auto-Retry Recovery:</span>
                  <span className="font-mono text-sky-600 font-semibold">64.2%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-mono">Razorpay + Stripe</span>
                <Link
                  href="/payments"
                  className="text-blue-600 hover:text-blue-700 font-medium font-mono text-[11px]"
                >
                  Inspect Ledger →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Section 2: Commercial Velocity (CRM & Sales Pipeline) */}
      {(activeTab === "all" || activeTab === "crm") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <h2 className="text-xs font-bold text-slate-800 tracking-wider uppercase font-mono">
                2. Commercial Engine & CRM Growth
              </h2>
            </div>
            <Link
              href="/crm"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium font-mono flex items-center gap-1"
            >
              Deals & CRM <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dimension 6: Pipeline Distribution */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Pipeline Stages</h3>
                  <p className="text-[11px] text-slate-500">$4.25M In Flight</p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                  38.2% Win Rate
                </span>
              </div>

              <BarChart
                height={120}
                data={[
                  { label: "Prospect", value: 680, color: "bg-slate-400" },
                  { label: "Qual", value: 920, color: "bg-blue-600" },
                  { label: "Proposal", value: 1400, color: "bg-purple-600" },
                  { label: "Negot", value: 850, color: "bg-indigo-600" },
                  { label: "Won", value: 400, color: "bg-emerald-600" },
                ]}
              />
            </div>

            {/* Dimension 7: Leads Acceleration */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Leads Acceleration</h3>
                  <p className="text-[11px] text-slate-500">142 In-Flight Leads</p>
                </div>
                <span className="text-lg font-bold text-emerald-600 font-mono">68.4%</span>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span>AI Qualified via Tool Gateway:</span>
                  <span className="font-mono text-emerald-600 font-semibold">97 Leads</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Inbound Leads Today:</span>
                  <span className="font-mono text-purple-600 font-semibold">+12 New</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Lead-to-Opp Velocity:</span>
                  <span className="font-mono text-slate-900 font-semibold">1.8 Days</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-mono">AI Sales Copilot</span>
                <Link
                  href="/leads"
                  className="text-blue-600 hover:text-blue-700 font-medium font-mono text-[11px]"
                >
                  View Leads →
                </Link>
              </div>
            </div>

            {/* Dimension 8: Customer Activity & Health */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Customer Activity & Health</h3>
                  <p className="text-[11px] text-slate-500">1,420 Unified Accounts</p>
                </div>
                <span className="text-xs font-mono text-slate-500">MAU: 1,180</span>
              </div>

              <div className="flex items-center justify-center py-1">
                <DonutProgress
                  percentage={88}
                  color="#10b981"
                  label="Healthy"
                  size={95}
                  valueText="88%"
                />
              </div>

              <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono pt-1 border-t border-slate-100">
                <span className="text-emerald-600 font-medium">88% Healthy</span>
                <span className="text-amber-600 font-medium">9% At-Risk</span>
                <span className="text-rose-600 font-medium">3% Threat</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Section 3: AI Communications & Telephony Telemetry */}
      {(activeTab === "all" || activeTab === "comms") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-800 tracking-wider uppercase font-mono">
                3. Omnichannel Communications & Telephony
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/whatsapp"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium font-mono flex items-center gap-1"
              >
                WhatsApp Inbox <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/call-center"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium font-mono flex items-center gap-1"
              >
                Call Center Ops <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dimension 9: WhatsApp Performance */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">WhatsApp Autonomous Performance</h3>
                    <p className="text-[11px] text-slate-500">1,840 Messages Dispatched</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-600 font-mono">72.6%</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">Delivered</p>
                  <p className="text-xs font-bold text-emerald-600">98.7%</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">Read Rate</p>
                  <p className="text-xs font-bold text-sky-600">94.2%</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">Reply Rate</p>
                  <p className="text-xs font-bold text-purple-600">44.6%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-mono">Autonomous Sales & Support</span>
                <span className="text-emerald-600 font-mono font-medium">Latency: 1.2s</span>
              </div>
            </div>

            {/* Dimension 10: Call Performance */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Call Center Telephony Performance</h3>
                    <p className="text-[11px] text-slate-500">428 Calls Across 4 Queues</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600 font-mono">91.6%</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">Autonomous</p>
                  <p className="text-xs font-bold text-emerald-600">91.6%</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">Avg Duration</p>
                  <p className="text-xs font-bold text-slate-900">3m 42s</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] text-slate-500">Supervisor Handoff</p>
                  <p className="text-xs font-bold text-amber-600">8.4%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-mono">Twilio + Deepgram + ElevenLabs</span>
                <span className="text-emerald-600 font-mono font-medium">Sentiment: +0.82</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Section 4: Platform Autonomy & AI Control Plane */}
      {(activeTab === "all" || activeTab === "automation") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-sky-600" />
              <h2 className="text-xs font-bold text-slate-800 tracking-wider uppercase font-mono">
                4. Workflow Engine & AI Safe Gateway
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/workflows"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium font-mono flex items-center gap-1"
              >
                Workflows Engine <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/ai-agents"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium font-mono flex items-center gap-1"
              >
                AI Control Plane <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dimension 11: Workflow Health */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Workflow Execution Health</h3>
                  <p className="text-[11px] text-slate-500">2,450 Executions Dispatched</p>
                </div>
                <span className="text-lg font-bold text-emerald-600 font-mono">99.6% Success</span>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Failed Runs:</span>
                  <span className="font-mono text-rose-600 font-semibold">8 Runs (0.4%)</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Pending Dual-Officer Approval Gates:</span>
                  <span className="font-mono text-amber-600 font-semibold">3 In-Flight</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Average Step Execution Latency:</span>
                  <span className="font-mono text-slate-900 font-semibold">180ms</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-mono">Transactional Outbox Event Bus</span>
                <span className="text-emerald-600 font-mono font-medium">Cloud Tasks Healthy</span>
              </div>
            </div>

            {/* Dimension 12: AI Activity & Tool Gateway */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">AI Safe Tool Gateway Telemetry</h3>
                  <p className="text-[11px] text-slate-500">14,820 Sandboxed Invocations</p>
                </div>
                <span className="text-lg font-bold text-emerald-600 font-mono">99.9% Policy Pass</span>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Direct DB Queries Blocked (Zero Leak):</span>
                  <span className="font-mono text-emerald-600 font-semibold">0 Violations</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Average LLM Inference Latency:</span>
                  <span className="font-mono text-slate-900 font-semibold">640ms</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Autonomous Multi-Step Actions:</span>
                  <span className="font-mono text-sky-600 font-semibold">84.3% Closed</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-mono">OpenAI + Gemini + Anthropic</span>
                <span className="text-blue-600 font-mono font-medium">Tokens: 1.2M</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Section 5: Governance, Risk, Exceptions & Live Operational Alerts */}
      {(activeTab === "all" || activeTab === "governance") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dimension 13: Exceptions Breakdown */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">6-Domain Exceptions</h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                12 Open
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { domain: "Billing & Invoicing", count: 3, color: "text-rose-600" },
                { domain: "Calling Windows (TCPA)", count: 2, color: "text-amber-600" },
                { domain: "Payment Gateway Retries", count: 2, color: "text-blue-600" },
                { domain: "AI Tool Policy Boundaries", count: 1, color: "text-purple-600" },
                { domain: "Mathpix OCR Discrepancies", count: 2, color: "text-sky-600" },
                { domain: "Accounting GL Sync (Xero/QBO)", count: 2, color: "text-emerald-600" },
              ].map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80"
                >
                  <span className="text-slate-700">{ex.domain}</span>
                  <span className={`font-bold ${ex.color}`}>{ex.count} Active</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Auto-Remediated: 94.1%</span>
              <Link href="/exceptions" className="text-blue-600 hover:text-blue-700 font-medium">
                Remediation Hub →
              </Link>
            </div>
          </div>

          {/* Dimension 14: Real-time Operational Alerts Stream */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Real-Time Operational Alerts</h3>
                  <p className="text-xs text-slate-500">High-priority operational warnings and remediation triggers</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {alerts.filter((a) => a.status === "active").length} Active Alerts
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alert.status === "acknowledged"
                      ? "bg-slate-50 border-slate-200/60 opacity-60"
                      : alert.severity === "critical"
                      ? "bg-rose-50/50 border-rose-200/90"
                      : alert.severity === "warning"
                      ? "bg-amber-50/50 border-amber-200/90"
                      : "bg-blue-50/50 border-blue-200/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                            alert.severity === "critical"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : alert.severity === "warning"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">{alert.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{alert.domain}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {alert.timeAgo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Link
                        href={alert.actionHref}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs transition-colors"
                      >
                        {alert.actionLabel} <ExternalLink className="h-3 w-3 ml-0.5" />
                      </Link>
                    </div>

                    {alert.status === "active" ? (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-mono transition-colors"
                      >
                        <Check className="h-3 w-3 text-emerald-600" /> Acknowledge
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. Quick Module Navigation Hub */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
              Quick Operations Launchpad
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Direct Cross-Module Navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-medium">
          <Link
            href="/customers"
            className="p-2.5 rounded-lg bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 flex items-center justify-between transition-all group"
          >
            <span>Customer 360</span>
            <Users className="h-3.5 w-3.5 text-blue-500 group-hover:text-blue-600" />
          </Link>
          <Link
            href="/collections"
            className="p-2.5 rounded-lg bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 flex items-center justify-between transition-all group"
          >
            <span>Collections</span>
            <Landmark className="h-3.5 w-3.5 text-emerald-500 group-hover:text-emerald-600" />
          </Link>
          <Link
            href="/call-center"
            className="p-2.5 rounded-lg bg-slate-50/80 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-200 text-slate-700 hover:text-purple-700 flex items-center justify-between transition-all group"
          >
            <span>Call Center</span>
            <Headphones className="h-3.5 w-3.5 text-purple-500 group-hover:text-purple-600" />
          </Link>
          <Link
            href="/support"
            className="p-2.5 rounded-lg bg-slate-50/80 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-200 text-slate-700 hover:text-sky-700 flex items-center justify-between transition-all group"
          >
            <span>Customer Support</span>
            <LifeBuoy className="h-3.5 w-3.5 text-sky-500 group-hover:text-sky-600" />
          </Link>
          <Link
            href="/workflows"
            className="p-2.5 rounded-lg bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 flex items-center justify-between transition-all group"
          >
            <span>Workflows</span>
            <GitBranch className="h-3.5 w-3.5 text-indigo-500 group-hover:text-indigo-600" />
          </Link>
          <Link
            href="/audit"
            className="p-2.5 rounded-lg bg-slate-50/80 hover:bg-rose-50/60 border border-slate-200/80 hover:border-rose-200 text-slate-700 hover:text-rose-700 flex items-center justify-between transition-all group"
          >
            <span>Audit Trail</span>
            <ShieldAlert className="h-3.5 w-3.5 text-rose-500 group-hover:text-rose-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}
