"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Landmark,
  Clock,
  Calendar,
  MessageCircle,
  PhoneCall,
  Headphones,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Filter,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Bot,
  Activity,
  Layers,
  PiggyBank,
  Check,
  Boxes,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  PageHeader,
} from "@/components/shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Sparkline,
  BarChart,
  DonutProgress,
  SentimentGauge,
  Button,
} from "@/components/ui";

type Timeframe = "24h" | "7d" | "30d" | "qtd" | "ytd";
type AnalyticsTab = "financials" | "funnel" | "omnichannel" | "workflows" | "inventory";

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("financials");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 border border-indigo-500/30 text-indigo-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Enterprise Analytics Hub
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Real-Time Event Ledger
                </span>
                <Badge variant="rls" size="sm">
                  PostgreSQL RLS Active
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Unified analytics spanning collected revenue, multi-touch attribution, payment conversions, DSO, omnichannel telemetry, and workflow health.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            {(["24h", "7d", "30d", "qtd", "ytd"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                  timeframe === tf
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`}
            />
          </button>

          {/* Cross-Link to ROI Scorecard */}
          <Link
            href="/roi"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/40 transition-colors"
          >
            <PiggyBank className="h-4 w-4" />
            AI Automation ROI Dashboard →
          </Link>
        </div>
      </div>

      {/* 4 Core Financial & Velocity KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue Collected */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Revenue Collected
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">+18.4%</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">$384,500</span>
            <Sparkline data={[60, 75, 92, 110, 105, 128, 142]} color="#10b981" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Autonomous: $298K (77.5%)
          </p>
        </div>

        {/* Metric 2: Revenue Influenced */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              Revenue Influenced
            </span>
            <span className="text-xs text-purple-400 font-mono font-semibold">AI Attributed</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">$842,500</span>
            <Sparkline data={[40, 55, 78, 85, 110, 130, 145]} color="#a855f7" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Across 18 won deals & collections
          </p>
        </div>

        {/* Metric 3: Outstanding Receivables & Recovery Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-sky-400" />
              Recovery Rate
            </span>
            <span className="text-xs text-sky-400 font-mono font-semibold">89.2% Rate</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">89.2%</span>
            <span className="text-xs font-mono text-slate-400">AR: $412.8K</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Delinquent balance recovered
          </p>
        </div>

        {/* Metric 4: Days Sales Outstanding (DSO) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-400" />
              Days Sales Outstanding
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">&lt; 45d Target</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">31.4 Days</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
              -6.2d MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Cash acceleration index
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-medium">
        {[
          { id: "financials", label: "Financials, DSO & Aging" },
          { id: "funnel", label: "Sales Funnel & Attribution" },
          { id: "omnichannel", label: "Omnichannel Telemetry & PTP" },
          { id: "workflows", label: "Workflow Health & Automation" },
          { id: "inventory", label: "Inventory, DIO & Supply Chain" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-slate-800 text-white font-semibold border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Financials, DSO & Aging */}
      {activeTab === "financials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DSO & Aging Breakdown */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">AR Aging Migration</h3>
                <p className="text-xs text-slate-400">$412,800 Total Receivables Balance</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">DSO: 31.4d</span>
            </div>

            <div className="space-y-3">
              {[
                { label: "Current (0-30 Days)", percent: 64, amount: "$264,192", color: "bg-emerald-500", text: "text-emerald-400" },
                { label: "31-60 Days", percent: 21, amount: "$86,688", color: "bg-sky-500", text: "text-sky-400" },
                { label: "61-90 Days", percent: 11, amount: "$45,408", color: "bg-amber-500", text: "text-amber-400" },
                { label: "90+ Days (High Risk)", percent: 4, amount: "$16,512", color: "bg-rose-500", text: "text-rose-400" },
              ].map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{b.label}</span>
                    <span className={`font-semibold ${b.text}`}>{b.amount} ({b.percent}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
              Formula: (Total AR / Total Invoiced Sales) × Period Days
            </div>
          </div>

          {/* Payment-Link Conversion Funnel */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Payment-Link Conversion Funnel</h3>
                <p className="text-xs text-slate-400">Razorpay & Stripe checkout conversion telemetry</p>
              </div>
              <Badge variant="success" size="sm">
                78.4% Final Conversion
              </Badge>
            </div>

            {/* Visual Funnel Steps */}
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { step: "1. Dispatched", count: 420, rate: "100%", sub: "WhatsApp / Email", color: "border-slate-700 bg-slate-800/80" },
                { step: "2. Opened", count: 380, rate: "90.5%", sub: "Customer Landed", color: "border-blue-500/30 bg-blue-950/20 text-blue-400" },
                { step: "3. Clicked", count: 352, rate: "83.8%", sub: "Payment Selected", color: "border-indigo-500/30 bg-indigo-950/20 text-indigo-400" },
                { step: "4. Settled", count: 329, rate: "78.4%", sub: "Webhook Verified", color: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400" },
              ].map((f, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${f.color} space-y-1`}>
                  <p className="text-[10px] uppercase font-mono text-slate-400">{f.step}</p>
                  <p className="text-xl font-bold font-mono text-white">{f.count}</p>
                  <p className="text-xs font-bold font-mono text-emerald-400">{f.rate}</p>
                  <p className="text-[10px] text-slate-400">{f.sub}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Average Velocity to Settlement:</span>
              <span className="text-emerald-400 font-bold">4.2 Hours from Dispatch</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sales Funnel & Attribution */}
      {activeTab === "funnel" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Conversion Funnel */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Commercial Sales Funnel</h3>
                <p className="text-xs text-slate-400">Leads velocity and qualification velocity</p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400">Win Rate: 38.2%</span>
            </div>

            <BarChart
              height={140}
              data={[
                { label: "Leads (142)", value: 142, color: "bg-slate-500" },
                { label: "MQL (97)", value: 97, color: "bg-blue-500" },
                { label: "SQL (64)", value: 64, color: "bg-indigo-500" },
                { label: "Proposal (32)", value: 32, color: "bg-purple-500" },
                { label: "Closed-Won (18)", value: 18, color: "bg-emerald-500" },
              ]}
            />

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-[10px] text-slate-400">Lead-to-Opp Velocity</p>
                <p className="text-sm font-bold text-white">1.8 Days Average</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-[10px] text-slate-400">AI Qualification Rate</p>
                <p className="text-sm font-bold text-emerald-400">68.4% of Inbound</p>
              </div>
            </div>
          </div>

          {/* Multi-Touch Attribution Matrix */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Multi-Touch Attribution</h3>
                <p className="text-xs text-slate-400">Comparison across attribution weighting algorithms</p>
              </div>
              <Badge variant="primary" size="sm">
                $842,500 Attributed
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-left">
                    <th className="pb-2 font-medium">Channel Touchpoint</th>
                    <th className="pb-2 font-medium text-center">First Touch</th>
                    <th className="pb-2 font-medium text-center">Last Touch</th>
                    <th className="pb-2 font-medium text-center">AI Multi-Touch</th>
                    <th className="pb-2 font-medium text-right">Attributed Rev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp
                    </td>
                    <td className="py-2.5 text-center text-slate-300">32%</td>
                    <td className="py-2.5 text-center text-slate-300">42%</td>
                    <td className="py-2.5 text-center text-emerald-400 font-bold">38%</td>
                    <td className="py-2.5 text-right text-emerald-400 font-bold">$320,150</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white flex items-center gap-1.5">
                      <Headphones className="h-3.5 w-3.5 text-blue-400" /> AI Voice Telephony
                    </td>
                    <td className="py-2.5 text-center text-slate-300">41%</td>
                    <td className="py-2.5 text-center text-slate-300">29%</td>
                    <td className="py-2.5 text-center text-blue-400 font-bold">34%</td>
                    <td className="py-2.5 text-right text-blue-400 font-bold">$286,450</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5 text-purple-400" /> Portal & Quotes
                    </td>
                    <td className="py-2.5 text-center text-slate-300">27%</td>
                    <td className="py-2.5 text-center text-slate-300">29%</td>
                    <td className="py-2.5 text-center text-purple-400 font-bold">28%</td>
                    <td className="py-2.5 text-right text-purple-400 font-bold">$235,900</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
              Primary Revenue Driver: <span className="text-white font-semibold">WhatsApp Conversational Flow (38.0%)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Omnichannel Telemetry & PTP */}
      {activeTab === "omnichannel" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp Telemetry */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">WhatsApp Performance</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">1,840 Sent</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Delivery Success:</span>
                <span className="text-emerald-400 font-bold">98.7%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Read Receipts:</span>
                <span className="text-sky-400 font-bold">94.2%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Customer Reply Rate:</span>
                <span className="text-purple-400 font-bold">44.6%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Autonomous Resolution:</span>
                <span className="text-emerald-400 font-bold">72.6%</span>
              </div>
            </div>
          </div>

          {/* Call Connection Telemetry */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Call Telephony Performance</h3>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">428 Calls</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Call Connect Rate:</span>
                <span className="text-emerald-400 font-bold">84.2%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Avg Handle Duration:</span>
                <span className="text-white font-bold">3m 42s</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Net Sentiment Index:</span>
                <span className="text-emerald-400 font-bold">+0.82 / 1.0</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Supervisor Transfer:</span>
                <span className="text-amber-400 font-bold">8.4%</span>
              </div>
            </div>
          </div>

          {/* Promise-to-Pay (PTP) Module */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Promise-to-Pay (PTP)</h3>
              </div>
              <Badge variant="success" size="sm">
                91.4% Fulfilled
              </Badge>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">PTP Commitments:</span>
                <span className="text-white font-bold">35 Invoices ($125K)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Kept & Settled:</span>
                <span className="text-emerald-400 font-bold">32 ($114,250)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800/80">
                <span className="text-slate-300">Broken / Rescheduled:</span>
                <span className="text-rose-400 font-bold">3 ($10,750)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Dispute Settlement Rate:</span>
              <span className="text-emerald-400 font-bold">100% On-Time</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Workflow Health & Automation */}
      {activeTab === "workflows" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Workflow Engine Health</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">99.6% Success</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span>Total Workflow Runs Dispatched:</span>
                <span className="text-white font-bold">2,450 Runs</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span>Failed Execution Runs:</span>
                <span className="text-rose-400 font-bold">8 Runs (0.4%)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span>Pending Approval Gates:</span>
                <span className="text-amber-400 font-bold">3 In-Flight</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span>Average Step Execution Latency:</span>
                <span className="text-emerald-400 font-bold">180ms</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Event Architecture & Outbox</h3>
              </div>
              <Badge variant="primary" size="sm">
                Idempotent
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Transactional outbox consumers maintain strict deduplication ledgers across Cloud Tasks and event consumers with Zero Message Loss.
            </p>

            <div className="space-y-2 pt-1 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Dead Letter Queue:</span>
                <span className="text-emerald-400 font-bold">0 Pending</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Cloud Tasks Queue Drain Velocity:</span>
                <span className="text-white font-bold">&lt; 250ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Inventory, DIO & Supply Chain */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Inventory Turnover & DIO</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">DIO: 28.4 Days</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Days Inventory Outstanding (DIO) improved by 4.2 days month-over-month. Turnover velocity stands at 8.6x annualized.
            </p>

            <div className="space-y-2 pt-1 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Total Asset Valuation:</span>
                <span className="text-emerald-400 font-bold">$1,428,500</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Inventory Turnover Ratio:</span>
                <span className="text-white font-bold">8.6x</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Shrinkage / Scrap Write-off:</span>
                <span className="text-emerald-400 font-bold">0.4% (&lt; 1% target)</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Supplier OTIF & Lead Times</h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400">OTIF: 94.6%</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              On-Time In-Full procurement delivery performance across Tier-1 strategic semiconductor and telephony vendors.
            </p>

            <div className="space-y-2 pt-1 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Average Supplier Lead Time:</span>
                <span className="text-white font-bold">8.4 Business Days</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Active Strategic Contracts:</span>
                <span className="text-sky-400 font-bold">6 Agreements</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Open PO Volume:</span>
                <span className="text-white font-bold">$184,200 (4 POs)</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Multi-Warehouse Utilization</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">3 Hubs Live</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Storage capacity distribution across Singapore, Malaysia, and Thailand regional distribution hubs.
            </p>

            <div className="space-y-2 pt-1 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Singapore Hub (WH-SG-01):</span>
                <span className="text-emerald-400 font-bold">71% Utilized (3,200 m²)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Malaysia Depo (WH-MY-01):</span>
                <span className="text-emerald-400 font-bold">68% Utilized (4,100 m²)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-800">
                <span className="text-slate-400">Thailand Depo (WH-TH-01):</span>
                <span className="text-emerald-400 font-bold">53% Utilized (1,850 m²)</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/inventory"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                Open Full Inventory & Procurement Studio <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
