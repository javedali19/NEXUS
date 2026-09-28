"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Cpu,
  Key,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  FileText,
  DollarSign,
  Activity,
  RefreshCw,
  Zap,
  ChevronRight,
  ExternalLink,
  Users,
  Send,
  Ticket,
  Clock,
  PhoneCall,
  UserCheck,
  Building,
  Check,
  Sparkles,
  ArrowRight,
  Fingerprint,
} from "lucide-react";

interface WhatsAppMessage {
  id: string;
  sender: "customer" | "ai_copilot";
  text: string;
  timestamp: string;
  templateName?: string;
  toolCalls?: string[];
  payLinkUrl?: string;
  caseId?: string;
  quoteId?: string;
  isEscalation?: boolean;
}

interface SupportTicket {
  caseNumber: string;
  category: string;
  severity: "low" | "normal" | "high" | "urgent";
  summary: string;
  slaTarget: string;
  status: "open" | "investigating" | "resolved";
}

export default function AiWhatsAppAgentPage() {
  // Triple-Gating Interactive State
  const [gateConsent, setGateConsent] = useState<boolean>(true);
  const [gateWhatsApp, setGateWhatsApp] = useState<boolean>(true);
  const [gateAiProvider, setGateAiProvider] = useState<boolean>(true);

  const isAutonomousEnabled = gateConsent && gateWhatsApp && gateAiProvider;

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"simulator" | "cases" | "customer360" | "logs">("simulator");

  // Phone Simulator Conversation State
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: "wa-1",
      sender: "ai_copilot",
      text: "Hello Sarah! This is Nexus Enterprise Copilot. We noticed invoice INV-2026-0041 for Acme Global Solutions is currently overdue ($4,500.00). How can I assist you today?",
      timestamp: "10:14 AM",
      templateName: "collections_overdue_notice",
      toolCalls: ["customer_search"],
    },
  ]);

  const [inputMsg, setInputMsg] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Active Tool Invocations for Session
  const [sessionTools, setSessionTools] = useState<string[]>(["customer_search"]);

  // Support Tickets Created via WhatsApp
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      caseNumber: "CASE-2026-8812",
      category: "billing_inquiry",
      severity: "normal",
      summary: "Inquired about payment terms extension for Acme Global.",
      slaTarget: "Within 4 hours",
      status: "open",
    },
  ]);

  // Customer 360 Context Data
  const customerContext = {
    name: "Sarah Jenkins",
    title: "VP Operations",
    company: "Acme Global Solutions",
    phone: "+1 555 234 8901",
    email: "s.jenkins@acmeglobal.com",
    segment: "Enterprise Core",
    lifetimeValue: "$145,000.00",
    openInvoices: 1,
    balanceDue: "$4,500.00",
    optInConsent: "Verified (Opted In)",
    dncStatus: "Clear (Not on DNC)",
    channelWindow: "Active (23h 45m left)",
  };

  const handleSendMessage = (customText?: string) => {
    const text = customText || inputMsg;
    if (!text.trim()) return;

    if (!isAutonomousEnabled) {
      alert(
        "Autonomous messaging is DISABLED by the Triple-Gate invariant. Please verify Customer Consent, WhatsApp connection, and AI Provider connection."
      );
      return;
    }

    const userMsg: WhatsAppMessage = {
      id: `usr-${Date.now()}`,
      sender: "customer",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMsg("");
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const lower = text.toLowerCase();
      let replyText = "";
      let newTools: string[] = [];
      let template: string | undefined = undefined;
      let payUrl: string | undefined = undefined;
      let caseId: string | undefined = undefined;
      let quoteId: string | undefined = undefined;
      let isEsc = false;

      // 1. Payment Link Request
      if (lower.includes("pay") || lower.includes("link") || lower.includes("balance") || lower.includes("invoice")) {
        newTools.push("payment_link_creation", "whatsapp_sending");
        payUrl = "https://pay.nexus-erp.com/plink_rzp_994812";
        template = "payment_link_notice";
        replyText = `Certainly, Sarah! I have generated your secure, encrypted payment link for ${customerContext.balanceDue}: ${payUrl}. You can settle via Card, ACH, or Wire Transfer.`;
      }
      // 2. Technical Support Issue
      else if (lower.includes("error") || lower.includes("bug") || lower.includes("problem") || lower.includes("issue") || lower.includes("500")) {
        newTools.push("exception_creation", "whatsapp_sending");
        caseId = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        template = "support_ticket_created";
        replyText = `I apologize for the disruption! I have logged high-priority ticket #${caseId} with our engineering team. Current SLA response time is within 2 hours. We will update you right here.`;
        setSupportTickets((prev) => [
          {
            caseNumber: caseId!,
            category: "api_webhook_failure",
            severity: "high",
            summary: text,
            slaTarget: "Within 2 hours",
            status: "investigating",
          },
          ...prev,
        ]);
      }
      // 3. Human Escalation Request
      else if (lower.includes("human") || lower.includes("representative") || lower.includes("manager") || lower.includes("agent")) {
        newTools.push("task_creation", "whatsapp_sending");
        isEsc = true;
        template = "human_escalation_transfer";
        replyText = `I have paused autonomous copilot responses and escalated this thread directly to Alex Morgan (Senior Account Executive). A live representative will join this chat in approximately 2 minutes.`;
      }
      // 4. Commercial Quote / Pricing
      else if (lower.includes("quote") || lower.includes("pricing") || lower.includes("license") || lower.includes("cost")) {
        newTools.push("quote_creation", "crm_updates", "whatsapp_sending");
        quoteId = `QUO-2026-${Math.floor(100 + Math.random() * 900)}`;
        template = "sales_quote_notice";
        replyText = `I've prepared draft commercial estimate #${quoteId} for Acme Global Solutions ($24,840.00 / yr, including our 10% approved commercial incentive). Our AE team is ready to walk through it.`;
      }
      // 5. Default General Inquiry
      else {
        newTools.push("customer_search", "whatsapp_sending");
        replyText = `Nexus combines unified Customer 360, automated Collections workflows, and Meta-verified WhatsApp communications. Would you like to request a payment link, review pricing, or open a support ticket?`;
      }

      setSessionTools((prev) => [...new Set([...prev, ...newTools])]);

      const aiMsg: WhatsAppMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai_copilot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        templateName: template,
        toolCalls: newTools,
        payLinkUrl: payUrl,
        caseId,
        quoteId,
        isEscalation: isEsc,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 550);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/whatsapp"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Business
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link
              href="/ai-agents/gateway"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" /> Tool Gateway
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-bold text-slate-800 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
              AI WhatsApp Agent
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isAutonomousEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300"
              }`}
            >
              {isAutonomousEnabled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AUTONOMOUS MESSAGING ACTIVE
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> AUTONOMOUS MESSAGING DISABLED
                </>
              )}
            </span>
            <Link
              href="/conversations"
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-3 py-1 rounded hover:bg-slate-50 transition"
            >
              Omnichannel Inbox
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <MessageCircle className="w-7 h-7 text-emerald-600" />
              AI WhatsApp Sales & Support Agent
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              End-to-End Orchestrator: WhatsApp Inbound &rarr; Inbox &rarr; Customer 360 &rarr; AI Agent &rarr; Tool Gateway &rarr; CRM / Quotes / Payments / Support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ai-sales"
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5" /> AI Sales Studio
            </Link>
            <Link
              href="/ai-agents/gateway"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" /> Tool Gateway
            </Link>
          </div>
        </div>

        {/* TRIPLE-GATE STATUS & DIAGNOSTICS BAR */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Mandatory Triple-Gate Invariant Status
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Autonomous messaging requires all 3 conditions to be validated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
            {/* Gate 1 */}
            <div
              className={`p-3.5 rounded-lg border flex items-center justify-between text-xs transition ${
                gateConsent
                  ? "bg-emerald-50/60 border-emerald-200"
                  : "bg-rose-50/60 border-rose-200"
              }`}
            >
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  {gateConsent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  Gate 1: Customer Consent
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {gateConsent ? "Opt-in verified • Not on DNC" : "Consent missing or DNC flagged"}
                </div>
              </div>
              <button
                onClick={() => setGateConsent(!gateConsent)}
                className="text-[10px] font-semibold underline text-slate-500 hover:text-slate-800"
              >
                {gateConsent ? "Simulate Revoke" : "Grant Consent"}
              </button>
            </div>

            {/* Gate 2 */}
            <div
              className={`p-3.5 rounded-lg border flex items-center justify-between text-xs transition ${
                gateWhatsApp
                  ? "bg-emerald-50/60 border-emerald-200"
                  : "bg-rose-50/60 border-rose-200"
              }`}
            >
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  {gateWhatsApp ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  Gate 2: Meta WhatsApp Connection
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {gateWhatsApp ? "WABA ID & Phone ID Validated" : "Credentials unconfigured"}
                </div>
              </div>
              <button
                onClick={() => setGateWhatsApp(!gateWhatsApp)}
                className="text-[10px] font-semibold underline text-slate-500 hover:text-slate-800"
              >
                {gateWhatsApp ? "Disconnect" : "Validate"}
              </button>
            </div>

            {/* Gate 3 */}
            <div
              className={`p-3.5 rounded-lg border flex items-center justify-between text-xs transition ${
                gateAiProvider
                  ? "bg-emerald-50/60 border-emerald-200"
                  : "bg-rose-50/60 border-rose-200"
              }`}
            >
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  {gateAiProvider ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  Gate 3: External AI Provider
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {gateAiProvider ? "OpenAI gpt-4o Verified" : "Provider unvalidated"}
                </div>
              </div>
              <button
                onClick={() => setGateAiProvider(!gateAiProvider)}
                className="text-[10px] font-semibold underline text-slate-500 hover:text-slate-800"
              >
                {gateAiProvider ? "Disconnect" : "Validate"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mt-8">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "simulator"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Interactive WhatsApp Phone Simulator
          </button>
          <button
            onClick={() => setActiveTab("cases")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "cases"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" /> Support Cases ({supportTickets.length})
          </button>
          <button
            onClick={() => setActiveTab("customer360")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "customer360"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Customer 360 Phone Identification
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-6">
        {/* TAB 1: WHATSAPP PHONE SIMULATOR */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: WhatsApp Phone UI (7 cols) */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl border-4 border-slate-800 shadow-xl overflow-hidden flex flex-col h-[640px]">
                {/* WhatsApp Green Top Header */}
                <div className="bg-emerald-700 text-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        Nexus Commercial Copilot
                        <CheckCircle2 className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                      </div>
                      <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                        online • 24h care window
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    +1 555 0199
                  </span>
                </div>

                {/* Chat Bubble Area (Pattern Background) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl p-3 text-xs shadow-xs ${
                          m.sender === "customer"
                            ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none"
                            : "bg-white text-slate-900 rounded-tl-none border border-slate-200"
                        }`}
                      >
                        {m.templateName && (
                          <div className="text-[9px] font-mono text-emerald-800 font-bold uppercase tracking-wider mb-1 bg-emerald-50 px-1 py-0.5 rounded inline-block border border-emerald-200">
                            HSM: {m.templateName}
                          </div>
                        )}

                        <p className="leading-relaxed">{m.text}</p>

                        {/* Interactive Pay Link Button */}
                        {m.payLinkUrl && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200">
                            <a
                              href={m.payLinkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full block text-center font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded transition shadow-xs"
                            >
                              💳 Settle Now via Razorpay &rarr;
                            </a>
                          </div>
                        )}

                        {/* Escalation Tag */}
                        {m.isEscalation && (
                          <div className="mt-2 p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-900 font-medium">
                            👤 <strong>Transferred to Human Representative</strong>
                          </div>
                        )}

                        <div className="text-[9px] text-slate-400 mt-1 text-right flex items-center justify-end gap-1">
                          <span>{m.timestamp}</span>
                          <Check className="w-2.5 h-2.5 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-xl rounded-tl-none p-2.5 text-xs text-slate-500 flex items-center gap-2 border border-slate-200 shadow-xs">
                        <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                        AI Agent evaluating Tool Gateway...
                      </div>
                    </div>
                  )}
                </div>

                {/* Scenario Testing Chips */}
                <div className="p-2 border-t border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto text-[10px]">
                  <button
                    onClick={() => handleSendMessage("Can I pay my overdue invoice of $4,500.00 right now?")}
                    className="whitespace-nowrap px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition font-medium"
                  >
                    💳 Pay $4.5k Invoice
                  </button>
                  <button
                    onClick={() => handleSendMessage("Our API webhook is throwing 500 errors, please help!")}
                    className="whitespace-nowrap px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition font-medium"
                  >
                    🛠️ API 500 Bug (Open Case)
                  </button>
                  <button
                    onClick={() => handleSendMessage("We need pricing for 100 enterprise users.")}
                    className="whitespace-nowrap px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition font-medium"
                  >
                    💼 Enterprise Quote
                  </button>
                  <button
                    onClick={() => handleSendMessage("Please transfer me to a human manager.")}
                    className="whitespace-nowrap px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition font-medium"
                  >
                    👤 Human Escalation
                  </button>
                </div>

                {/* Text Input Footer */}
                <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={
                      isAutonomousEnabled
                        ? "Type customer reply on WhatsApp..."
                        : "Triple-Gate blocked. Check diagnostics above."
                    }
                    disabled={!isAutonomousEnabled || isProcessing}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-200"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!isAutonomousEnabled || isProcessing || !inputMsg.trim()}
                    className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Customer 360 & Tool Gateway Stream (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Customer 360 Resolved Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Customer 360 Identity</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Phone Identified
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-bold text-slate-900">{customerContext.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Company:</span>
                    <span className="font-semibold text-slate-800">{customerContext.company}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Phone (E.164):</span>
                    <span className="font-mono text-indigo-700">{customerContext.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Lifetime Value:</span>
                    <span className="font-mono font-bold text-slate-900">{customerContext.lifetimeValue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Overdue Balance:</span>
                    <span className="font-mono font-bold text-rose-600">{customerContext.balanceDue} (INV-0041)</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">WhatsApp Opt-in:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {customerContext.optInConsent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tool Gateway Dispatches Stream */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Tool Gateway Actions</h3>
                  </div>
                  <Link
                    href="/ai-agents/gateway"
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    Gateway Studio <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  {sessionTools.map((tool) => (
                    <div
                      key={tool}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-mono font-bold text-indigo-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tool}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Enforced & Audited</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUPPORT CASES */}
        {activeTab === "cases" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp Inbound Support Cases</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tickets created autonomously by the AI WhatsApp Agent via Tool Gateway
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ticket Number</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Summary</th>
                    <th className="py-3 px-4">SLA Target</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supportTickets.map((t) => (
                    <tr key={t.caseNumber} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">{t.caseNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{t.category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            t.severity === "high" || t.severity === "urgent"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {t.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{t.summary}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{t.slaTarget}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER 360 IDENTIFICATION */}
        {activeTab === "customer360" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Customer 360 Unified Profile</h3>
            <p className="text-xs text-slate-600 mb-4">
              Real-time synchronization between Meta WhatsApp E.164 phone numbers and enterprise CRM/ERP accounts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Account Overview</div>
                <div>Company: <strong>Acme Global Solutions</strong></div>
                <div>Contact: <strong>Sarah Jenkins (VP Ops)</strong></div>
                <div>Direct Phone: <code className="text-indigo-600 font-mono">+1 555 234 8901</code></div>
                <div>Billing Email: <code>billing@acmeglobal.com</code></div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Financials & Communications Status</div>
                <div>Lifetime Value: <strong>$145,000.00</strong></div>
                <div>Delinquency Status: <strong className="text-rose-600">1 Overdue Invoice ($4,500.00)</strong></div>
                <div>WhatsApp Consent: <strong className="text-emerald-700">Express Opt-in Granted</strong></div>
                <div>Do Not Call (DNC): <strong className="text-emerald-700">Clear</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
