"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Home,
  Building2,
  MapPin,
  Calendar,
  User,
  Plus,
  MoreHorizontal,
  Sparkles,
  History,
  Search,
  DollarSign,
  PhoneCall,
  MessageCircle,
  FileText,
  Layers,
  Briefcase,
  Check,
  Copy,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
  Share2,
  Linkedin,
  Mail,
  Phone,
  ArrowRight,
  Clock,
  Activity,
  ChevronDown,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";

interface TimelineEvent {
  id: string;
  time: string;
  timeAgo: string;
  module: "erp" | "telephony" | "whatsapp" | "ocr" | "crm" | "ai" | "workflow";
  title: string;
  moduleBadge: string;
  moduleBadgeColor: string;
  statusBadge: string;
  statusBadgeColor: string;
  description: string;
  actorName: string;
  actorType: "user" | "ai" | "system" | "customer";
  entityType: string;
  entityId: string;
  correlationId: string;
  metadata: Record<string, any>;
}

const SAMPLE_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt-001",
    time: "14:15",
    timeAgo: "25 min ago",
    module: "erp",
    title: "ERP Payment Received (₹45,000.00)",
    moduleBadge: "ERP Financials",
    moduleBadgeColor: "bg-blue-50 text-blue-600 border-blue-200/60",
    statusBadge: "Completed",
    statusBadgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    description: "Wire transfer posted successfully against Invoice #INV-2026-089. Outbox event dispatched.",
    actorName: "Alex Morgan (Finance)",
    actorType: "user",
    entityType: "invoices",
    entityId: "INV-2026-089",
    correlationId: "c1f83a2e-4b91-4e78-bc5a-10f8a9e01234",
    metadata: { amount: 45000.0, currency: "INR", payment_method: "wire_transfer", status: "settled" },
  },
  {
    id: "evt-002",
    time: "14:12",
    timeAgo: "28 min ago",
    module: "telephony",
    title: "AI Voice Call Completed & Positive Sentiment (+0.88)",
    moduleBadge: "AI Voice Call",
    moduleBadgeColor: "bg-purple-50 text-purple-600 border-purple-200/60",
    statusBadge: "Completed",
    statusBadgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    description: "4m 12s discussion with VP Sarah Jenkins. AI detected high buying intent for enterprise expansion.",
    actorName: "Nexus Autonomous Voice AI",
    actorType: "ai",
    entityType: "calls",
    entityId: "CALL-2026-9941",
    correlationId: "c1f83a2e-4b91-4e78-bc5a-10f8a9e01234",
    metadata: { duration_seconds: 252, sentiment_score: 0.88, sentiment_label: "positive", topics: ["expansion", "multi-tenant licensing"] },
  },
  {
    id: "evt-003",
    time: "13:45",
    timeAgo: "55 min ago",
    module: "whatsapp",
    title: "WhatsApp Message Received",
    moduleBadge: "WhatsApp",
    moduleBadgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    statusBadge: "Customer Reply",
    statusBadgeColor: "bg-cyan-50 text-cyan-600 border-cyan-200/60",
    description: 'Re: Invoice #INV-2026-089 - "Payment has been initiated, please confirm once received."',
    actorName: "Sarah Jenkins",
    actorType: "customer",
    entityType: "message",
    entityId: "MSG-2026-7782",
    correlationId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    metadata: { sender_phone: "+1-555-0199", channel: "whatsapp_business", status: "delivered" },
  },
  {
    id: "evt-004",
    time: "11:30",
    timeAgo: "Today",
    module: "ocr",
    title: "Document Processed via OCR",
    moduleBadge: "OCR Vision",
    moduleBadgeColor: "bg-teal-50 text-teal-600 border-teal-200/60",
    statusBadge: "Completed",
    statusBadgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    description: "Valid purchase order extracted from PDF. 98% confidence. 5 line items identified.",
    actorName: "Mathpix OCR",
    actorType: "system",
    entityType: "document",
    entityId: "DOC-2026-5561",
    correlationId: "33ee44ff-55aa-66bb-77cc-88dd99ee0011",
    metadata: { pages: 3, confidence_score: 0.98, document_type: "purchase_order", items_count: 5 },
  },
  {
    id: "evt-005",
    time: "10:15",
    timeAgo: "Today",
    module: "crm",
    title: "Deal Stage Updated",
    moduleBadge: "CRM & Deals",
    moduleBadgeColor: "bg-blue-50 text-blue-600 border-blue-200/60",
    statusBadge: "Automated",
    statusBadgeColor: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
    description: "Deal moved from Proposal to Negotiation based on recent call and payment activity.",
    actorName: "AI Workflow",
    actorType: "ai",
    entityType: "deal",
    entityId: "DEAL-2026-1123",
    correlationId: "e9f01832-6a77-4c12-984e-f2a991004115",
    metadata: { previous_stage: "proposal", new_stage: "negotiation", value: 150000.0, probability: 0.7 },
  },
  {
    id: "evt-006",
    time: "09:20",
    timeAgo: "Today",
    module: "ai",
    title: "AI Insight Generated",
    moduleBadge: "AI Agent",
    moduleBadgeColor: "bg-purple-50 text-purple-600 border-purple-200/60",
    statusBadge: "High Value",
    statusBadgeColor: "bg-pink-50 text-pink-600 border-pink-200/60",
    description: "Customer shows strong expansion intent. Suggested next action: Create enterprise quote.",
    actorName: "Nexus AI Agent",
    actorType: "ai",
    entityType: "insight",
    entityId: "INS-2026-4456",
    correlationId: "8f7e6d5c-4b3a-2109-8765-43210fedcba9",
    metadata: { intent: "expansion", recommended_action: "create_quote", confidence: 0.94 },
  },
];

export default function CustomerTimelinePage() {
  const [selectedTab, setSelectedTab] = useState<string>("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvents = useMemo(() => {
    return SAMPLE_TIMELINE_EVENTS.filter((e) => {
      const matchesTab =
        selectedTab === "timeline" ||
        (selectedTab === "invoices" && e.module === "erp") ||
        (selectedTab === "payments" && e.module === "erp") ||
        (selectedTab === "calls" && e.module === "telephony") ||
        (selectedTab === "whatsapp" && e.module === "whatsapp") ||
        (selectedTab === "documents" && e.module === "ocr") ||
        (selectedTab === "deals" && e.module === "crm") ||
        (selectedTab === "workflows" && e.module === "workflow");

      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.actorName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [selectedTab, searchQuery]);

  const getNodeIcon = (module: string) => {
    switch (module) {
      case "erp":
        return <div className="h-7 w-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs"><DollarSign className="h-3.5 w-3.5" /></div>;
      case "telephony":
        return <div className="h-7 w-7 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-xs"><PhoneCall className="h-3.5 w-3.5" /></div>;
      case "whatsapp":
        return <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs"><MessageCircle className="h-3.5 w-3.5" /></div>;
      case "ocr":
        return <div className="h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs"><FileText className="h-3.5 w-3.5" /></div>;
      case "crm":
        return <div className="h-7 w-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs"><Briefcase className="h-3.5 w-3.5" /></div>;
      case "ai":
        return <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs"><Sparkles className="h-3.5 w-3.5" /></div>;
      default:
        return <div className="h-7 w-7 rounded-full bg-slate-500 text-white flex items-center justify-center shadow-xs"><History className="h-3.5 w-3.5" /></div>;
    }
  };

  return (
    <div className="space-y-4 max-w-[1560px] mx-auto text-slate-800">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
        <Home className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-300">&gt;</span>
        <Link href="/customers" className="hover:text-slate-600 transition-colors">
          Customers
        </Link>
        <span className="text-slate-300">&gt;</span>
        <span className="text-slate-500">Acme Global Technologies Inc.</span>
        <span className="text-slate-300">&gt;</span>
        <span className="font-bold text-slate-900">Timeline</span>
      </nav>

      {/* 2. Top Banner Row: Customer Header Card + Relationship Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Customer Profile Banner Card */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="h-14 w-14 rounded-2xl bg-blue-100/80 border border-blue-200/60 flex items-center justify-center font-bold text-xl text-blue-600 shadow-xs shrink-0">
                AG
              </div>
              <div>
                <div className="flex items-center space-x-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Acme Global Technologies Inc.
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>Customer ID:</span>
                  <code className="text-slate-500 font-mono text-xs">c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c</code>
                  <span className="text-slate-300">|</span>
                  <span>Primary: <strong className="font-semibold text-slate-600">Sarah Jenkins</strong></span>
                </p>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center space-x-2 shrink-0 self-start">
              <button
                onClick={() => window.location.href = "/customers/c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>View Full Profile</span>
              </button>
              <button
                onClick={() => alert("Quick action triggered")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create</span>
              </button>
              <button
                className="p-1.5 rounded-xl border border-slate-200/80 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                title="More Actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bottom Metadata Badges */}
          <div className="pt-3 border-t border-slate-100 flex items-center space-x-6 sm:space-x-10 text-xs">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 text-xs block leading-tight">Technology</span>
                <span className="text-[10px] text-slate-400 block font-mono">Industry</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 text-xs block leading-tight">North America</span>
                <span className="text-[10px] text-slate-400 block font-mono">Region</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 text-xs block leading-tight">Active</span>
                <span className="text-[10px] text-slate-400 block font-mono">Status</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 text-xs block leading-tight">Since 2023</span>
                <span className="text-[10px] text-slate-400 block font-mono">Customer Since</span>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship Health Card */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">Relationship Health</h2>
          </div>

          <div className="flex items-center justify-between py-1">
            {/* Circular Gauge */}
            <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="88, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-slate-900 text-sm font-mono">88</span>
            </div>

            {/* Health Info */}
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-900">Very Positive</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 block">↑ +12%</span>
              <span className="text-[10px] text-slate-400 font-mono block">AI Analysis</span>
            </div>

            {/* Sentiment mini bar graph */}
            <div className="flex items-end space-x-1 h-9 self-center">
              <div className="w-1.5 bg-emerald-300 rounded-t h-3" />
              <div className="w-1.5 bg-emerald-400 rounded-t h-4" />
              <div className="w-1.5 bg-emerald-400 rounded-t h-5" />
              <div className="w-1.5 bg-emerald-500 rounded-t h-4" />
              <div className="w-1.5 bg-emerald-500 rounded-t h-6" />
              <div className="w-1.5 bg-emerald-600 rounded-t h-7" />
              <div className="w-1.5 bg-emerald-600 rounded-t h-8" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <Link href="/analytics" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              <span>View AI Insights</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 6 KPI Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Lifetime Value</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">$320,000</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">↑ +12%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Invoices</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">24</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              8 Paid • <strong className="text-rose-500 font-semibold">3 Overdue</strong>
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Outstanding</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">$45,000</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[11px] text-red-500 font-semibold">2 Overdue</span>
              <svg className="w-12 h-4 text-red-400" viewBox="0 0 50 16" fill="none">
                <path d="M0 12 Q 15 2, 25 8 T 50 4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Calls</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">36</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[11px] text-sky-600 font-semibold">↑ +18%</span>
              <svg className="w-12 h-4 text-sky-400" viewBox="0 0 50 16" fill="none">
                <path d="M0 14 Q 15 12, 25 6 T 50 2" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">WhatsApp Conversations</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">128</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[11px] text-emerald-600 font-semibold">↑ +25%</span>
              <svg className="w-12 h-4 text-emerald-400" viewBox="0 0 50 16" fill="none">
                <path d="M0 12 Q 15 14, 25 8 T 50 2" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">AI Sentiment</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">+0.88</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[11px] text-purple-600 font-semibold">Positive</span>
              {/* Waveform mini visualizer */}
              <div className="flex items-end space-x-0.5 h-3">
                <div className="w-1 bg-purple-400 rounded-full h-1.5" />
                <div className="w-1 bg-purple-500 rounded-full h-3" />
                <div className="w-1 bg-purple-400 rounded-full h-2" />
                <div className="w-1 bg-purple-600 rounded-full h-3.5" />
                <div className="w-1 bg-purple-400 rounded-full h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabs Toolbar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Left Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "timeline", label: "Timeline" },
            { id: "invoices", label: "Invoices" },
            { id: "payments", label: "Payments" },
            { id: "calls", label: "AI Voice Calls" },
            { id: "whatsapp", label: "WhatsApp" },
            { id: "documents", label: "Documents" },
            { id: "deals", label: "Deals" },
            { id: "notes", label: "Notes" },
            { id: "emails", label: "Emails" },
            { id: "workflows", label: "Workflows" },
          ].map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Last 30 days</span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            <Share2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 5. Main Split View: Left Timeline (72%) & Right Context Cards (28%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Search + Connected Timeline */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search timeline events by title, description, or correlation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
            />
          </div>

          {/* Date Group Header */}
          <div className="flex items-center space-x-3 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200/70">
              Today
            </span>
            <div className="flex-1 h-px bg-slate-200/70" />
          </div>

          {/* Connected Timeline Spine Stream */}
          <div className="relative space-y-3.5">
            {filteredEvents.map((ev, index) => (
              <div key={ev.id} className="relative flex items-start gap-3 sm:gap-4 group">
                {/* Time & TimeAgo Column on Left */}
                <div className="w-16 sm:w-20 pt-3 text-right shrink-0">
                  <span className="font-bold text-xs text-slate-800 font-mono block leading-tight">{ev.time}</span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{ev.timeAgo}</span>
                </div>

                {/* Vertical Rail + Colored Node Icon */}
                <div className="relative flex flex-col items-center shrink-0 pt-2.5">
                  {getNodeIcon(ev.module)}
                  {index !== filteredEvents.length - 1 && (
                    <div className="w-0.5 bg-slate-200 absolute top-10 bottom-[-20px]" />
                  )}
                </div>

                {/* Event Card Content */}
                <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          {ev.title}
                        </h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ev.moduleBadgeColor}`}>
                          {ev.moduleBadge}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ev.statusBadgeColor}`}>
                          {ev.statusBadge}
                        </span>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => setExpandedEventId(expandedEventId === ev.id ? null : ev.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200/80 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          {expandedEventId === ev.id ? "Hide Details" : "View Details"}
                        </button>
                        <button
                          onClick={() => handleCopy(ev.correlationId, ev.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                          title="Copy Trace Correlation ID"
                        >
                          {copiedId === ev.id ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ev.description}
                    </p>

                    {/* Footer Metadata */}
                    <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                        {ev.actorType === "ai" ? (
                          <Bot className="h-3.5 w-3.5 text-purple-600" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        {ev.actorName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>
                        Entity: <strong className="font-mono text-slate-700 font-medium">{ev.entityType}:{ev.entityId}</strong>
                      </span>
                    </div>

                    {/* Structured JSON Payload Accordion */}
                    {expandedEventId === ev.id && (
                      <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono animate-in fade-in duration-100">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
                          <span className="text-slate-400 uppercase text-[10px] font-bold">
                            Structured Payload • Trace: {ev.correlationId}
                          </span>
                          <span className="text-blue-400 text-[10px]">JSON Payload</span>
                        </div>
                        <pre className="text-slate-200 overflow-x-auto">
                          {JSON.stringify(ev.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Context Cards (Key Contacts, Recent Deal, Open Invoices) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Card 1: Key Contacts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Key Contacts</h3>
              <Link href="/contacts" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                View All
              </Link>
            </div>

            {/* Contact 1 */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200/80">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Sarah Jenkins</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">VP Operations</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60">
                      Primary
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                      Decision Maker
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center space-x-1.5 pl-12">
                <button className="p-1.5 rounded-lg border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <Phone className="h-3 w-3" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <Mail className="h-3 w-3" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <Linkedin className="h-3 w-3" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Contact 2 */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-200/80">
                  MC
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Michael Chen</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">Finance Director</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60">
                      Finance
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center space-x-1.5 pl-12">
                <button className="p-1.5 rounded-lg border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <Phone className="h-3 w-3" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <Mail className="h-3 w-3" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <Linkedin className="h-3 w-3" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Recent Deal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Recent Deal</h3>
              <Link href="/crm" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                View Deal →
              </Link>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Enterprise Expansion</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                  Negotiation
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono mt-1">$150,000</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Progress</span>
                <span className="font-semibold text-slate-700">70%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[70%]" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono block pt-0.5">
                Expected Close: Oct 30, 2026
              </span>
            </div>
          </div>

          {/* Card 3: Open Invoices */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Open Invoices</h3>
              <Link href="/invoices" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {/* Invoice 1 */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-mono text-slate-700 font-medium">INV-2026-089</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900">₹45,000</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    Paid
                  </span>
                </div>
              </div>

              {/* Invoice 2 */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-mono text-slate-700 font-medium">INV-2026-078</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900">₹32,000</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
                    Overdue
                  </span>
                </div>
              </div>

              {/* Invoice 3 */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-mono text-slate-700 font-medium">INV-2026-065</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900">₹28,500</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
