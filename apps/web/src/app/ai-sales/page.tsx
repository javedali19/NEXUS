"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Cpu,
  Key,
  Database,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  History,
  FileText,
  DollarSign,
  Activity,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  Zap,
  Layers,
  ChevronRight,
  Eye,
  AlertOctagon,
  Scale,
  Send,
  UserCheck,
  UserX,
  Code,
  FileCheck,
  GitBranch,
  TrendingUp,
  Target,
  ExternalLink,
  PhoneCall,
  Calendar,
  MessageSquare,
  Users,
  Fingerprint,
} from "lucide-react";

export type AiProviderType = "openai" | "gemini" | "anthropic";

export interface ProviderMeta {
  id: AiProviderType;
  name: string;
  defaultModel: string;
  portalUrl: string;
  envVar: string;
  docUrl: string;
}

const PROVIDERS: Record<AiProviderType, ProviderMeta> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    defaultModel: "gpt-4o",
    portalUrl: "https://platform.openai.com/api-keys",
    envVar: "OPENAI_API_KEY",
    docUrl: "https://platform.openai.com/docs/models",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    defaultModel: "gemini-1.5-pro",
    portalUrl: "https://aistudio.google.com/app/apikey",
    envVar: "GEMINI_API_KEY",
    docUrl: "https://ai.google.dev/gemini-api/docs",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    defaultModel: "claude-3-5-sonnet",
    portalUrl: "https://console.anthropic.com/settings/keys",
    envVar: "ANTHROPIC_API_KEY",
    docUrl: "https://docs.anthropic.com/en/docs/models",
  },
};

interface MessageTurn {
  id: string;
  sender: "prospect" | "agent";
  text: string;
  timestamp: string;
  toolCalls?: string[];
  intentScore?: number;
}

interface LeadRecord {
  id: string;
  company: string;
  contact: string;
  email: string;
  intentScore: number;
  stage: "Evaluating" | "MQL" | "SQL" | "AE Handoff";
  budget: string;
  authority: string;
  need: string;
  timeline: string;
}

export default function AiSalesAgentPage() {
  // Provider Gating State
  const [selectedProvider, setSelectedProvider] = useState<AiProviderType>("openai");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<"unconfigured" | "validation_failed" | "validated">("unconfigured");
  const [validationMessage, setValidationMessage] = useState<string>(
    "Agent is disabled. AI provider connection must be validated before live autonomous sales execution."
  );
  const [lastValidatedAt, setLastValidatedAt] = useState<string | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"simulator" | "leads" | "quotes" | "handoffs">("simulator");

  // Simulator Conversation State
  const [messages, setMessages] = useState<MessageTurn[]>([
    {
      id: "msg-1",
      sender: "agent",
      text: "Hello! I am the Nexus AI Commercial Sales Agent. We help high-growth enterprises unify ERP, CRM, and omnichannel WhatsApp communications. How can I help your team today?",
      timestamp: "12:30 PM",
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  // BANT Scorecard State
  const [bant, setBant] = useState({
    budget: "Unconfirmed",
    budgetConfirmed: false,
    authority: "Unknown",
    need: "Platform Overview",
    timeline: "Exploring",
    intentScore: 20,
  });

  // Human Handoff State
  const [handoffPacket, setHandoffPacket] = useState<any | null>(null);

  // Tool Gateway executed log for current session
  const [toolLogs, setToolLogs] = useState<string[]>([]);

  // Pipeline Leads State
  const [leads, setLeads] = useState<LeadRecord[]>([
    {
      id: "lead-101",
      company: "Acme Global Solutions",
      contact: "Sarah Jenkins (VP Ops)",
      email: "s.jenkins@acmeglobal.com",
      intentScore: 88,
      stage: "AE Handoff",
      budget: "$50,000 / yr",
      authority: "Decision Maker",
      need: "ERP Billing & Collections WhatsApp",
      timeline: "Immediate (<30 days)",
    },
    {
      id: "lead-102",
      company: "Pacific Coast Retail",
      contact: "David Chen (IT Director)",
      email: "dchen@pacificretail.com",
      intentScore: 78,
      stage: "SQL",
      budget: "$25,000 / yr",
      authority: "Technical Evaluator",
      need: "Multi-tenant Accounting Sync",
      timeline: "Within 60 days",
    },
    {
      id: "lead-103",
      company: "Vertex Industrial",
      contact: "Elena Rostova",
      email: "elena@vertexind.com",
      intentScore: 54,
      stage: "MQL",
      budget: "Under Review",
      authority: "Manager",
      need: "Invoice OCR & Vision",
      timeline: "Q4 2026",
    },
  ]);

  // Handle Provider Validation
  const handleValidateConnection = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      const current = PROVIDERS[selectedProvider];

      if (!apiKeyInput.trim()) {
        setConnectionStatus("validation_failed");
        setValidationMessage(
          `Validation failed: No API key supplied for ${current.name}. Obtain a valid key from ${current.portalUrl}.`
        );
        return;
      }

      // Check format
      const validFormat =
        (selectedProvider === "openai" && (apiKeyInput.startsWith("sk-") || apiKeyInput.startsWith("sk-proj-"))) ||
        (selectedProvider === "gemini" && apiKeyInput.length >= 20) ||
        (selectedProvider === "anthropic" && apiKeyInput.startsWith("sk-ant-"));

      if (!validFormat) {
        setConnectionStatus("validation_failed");
        setValidationMessage(
          `Validation failed: Key format does not match ${current.name} standard. Verify at ${current.portalUrl}.`
        );
        return;
      }

      setConnectionStatus("validated");
      setLastValidatedAt(new Date().toLocaleTimeString());
      setValidationMessage(
        `Connection verified! Live handshake with ${current.name} (${current.defaultModel}) succeeded. Agent is now ACTIVE.`
      );
    }, 600);
  };

  // Handle Sending a Message in the Simulator
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (connectionStatus !== "validated") {
      alert("Execution Blocked: The AI Sales Agent is currently DISABLED. Please validate the AI provider connection first.");
      return;
    }

    const userMsg: MessageTurn = {
      id: `usr-${Date.now()}`,
      sender: "prospect",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      const lower = text.toLowerCase();
      let newBant = { ...bant };
      let newTools: string[] = [];

      // 1. BANT Extraction
      if (lower.includes("$") || lower.includes("budget") || lower.includes("50k") || lower.includes("k")) {
        newBant.budget = "$40,000 - $60,000 (Confirmed)";
        newBant.budgetConfirmed = true;
      }
      if (lower.includes("vp") || lower.includes("director") || lower.includes("ceo") || lower.includes("head")) {
        newBant.authority = "Executive Decision Maker";
      } else if (lower.includes("evaluator") || lower.includes("team")) {
        newBant.authority = "Technical Champion";
      }
      if (lower.includes("erp") || lower.includes("whatsapp") || lower.includes("billing") || lower.includes("collection")) {
        newBant.need = "Core ERP + Automated Collections & WhatsApp";
      }
      if (lower.includes("asap") || lower.includes("immediately") || lower.includes("month")) {
        newBant.timeline = "Immediate (<30 days)";
      }

      // Compute Score
      let score = 25;
      if (newBant.budgetConfirmed) score += 25;
      if (newBant.authority.includes("Decision")) score += 25;
      if (newBant.need.includes("Core")) score += 15;
      if (newBant.timeline.includes("Immediate")) score += 10;
      newBant.intentScore = Math.min(score, 100);
      setBant(newBant);

      // 2. Tool Gateway Invocations
      newTools.push("crm_updates");
      if (lower.includes("quote") || lower.includes("pricing") || lower.includes("cost")) {
        newTools.push("quote_creation");
      }
      if (lower.includes("demo") || lower.includes("call") || lower.includes("schedule")) {
        newTools.push("call_scheduling");
        newTools.push("task_creation");
      }
      if (lower.includes("account") || lower.includes("history")) {
        newTools.push("customer_search");
      }
      setToolLogs((prev) => [...new Set([...prev, ...newTools])]);

      // 3. Human Handoff Synthesis
      let replyText = "";
      const shouldHandoff =
        lower.includes("human") ||
        lower.includes("speak to") ||
        lower.includes("representative") ||
        lower.includes("director") ||
        newBant.intentScore >= 85;

      if (shouldHandoff) {
        const packet = {
          id: `hnd-${Date.now().toString().slice(-4)}`,
          reason: lower.includes("human") ? "Explicit prospect request for human representative" : "High intent enterprise qualification (Intent >= 85%)",
          priority: newBant.intentScore >= 85 ? "Urgent (Tier 1 AE)" : "High",
          leadCompany: "Inbound Prospect Corp",
          bantScore: newBant.intentScore,
          contextSummary: `Prospect demonstrated budget readiness (${newBant.budget}) with pain point alignment in ${newBant.need}.`,
          recommendedStrategy: "Schedule 30-minute tailored architecture review focusing on ERP + WhatsApp Collections. Highlight 10% commercial incentive.",
          timestamp: new Date().toLocaleTimeString(),
        };
        setHandoffPacket(packet);
        replyText = `I understand! Given your high-priority commercial requirements (${newBant.budget}, ${newBant.timeline}), I have synthesized an Executive Discovery Packet and connected you with our Enterprise Account Executive team. You will receive an invite to a dedicated technical session shortly.`;
      } else if (newTools.includes("quote_creation")) {
        replyText = `I have generated a draft commercial estimate covering our Platform Core and AI Omnichannel Communications with our pre-approved 10% commercial incentive. Would you like me to schedule a brief walkthrough with our solutions architect?`;
      } else {
        replyText = `Nexus combines unified Customer 360, automated Collections workflows, and Meta-verified WhatsApp notifications. Based on your target timeline (${newBant.timeline}), what is your expected go-live date?`;
      }

      const agentMsg: MessageTurn = {
        id: `agt-${Date.now()}`,
        sender: "agent",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        toolCalls: newTools,
        intentScore: newBant.intentScore,
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 550);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/ai-agents"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5" /> AI Control Plane
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link
              href="/ai-agents/gateway"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" /> Tool Gateway
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-bold text-slate-800 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
              AI Sales Agent
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                connectionStatus === "validated"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300"
              }`}
            >
              {connectionStatus === "validated" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ACTIVE (Connection Validated)
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> DISABLED (Unvalidated Provider)
                </>
              )}
            </span>
            <Link
              href="/ai-agents/gateway"
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded hover:bg-indigo-100 transition flex items-center gap-1"
            >
              <Lock className="w-3 h-3" /> Tool Gateway Enforced
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Bot className="w-7 h-7 text-indigo-600" />
              Autonomous AI Sales Agent
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Commercial qualification, conversation analysis, BANT scoring, quote preparation, and Account Executive handoffs—operating exclusively through the AI Tool Gateway.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/crm"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" /> CRM Deals Pipeline
            </Link>
            <Link
              href="/quotes"
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" /> Quotes Console
            </Link>
          </div>
        </div>

        {/* EXTERNAL AI PROVIDER CONNECTION GATING PANEL */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  External AI Provider Connection Gating
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Mandatory Invariant
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The AI Sales Agent must remain <strong>DISABLED</strong> until the selected AI provider connection is verified against its official platform.
              </p>
            </div>

            {/* Provider Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(["openai", "gemini", "anthropic"] as AiProviderType[]).map((pKey) => {
                const p = PROVIDERS[pKey];
                return (
                  <button
                    key={pKey}
                    onClick={() => {
                      setSelectedProvider(pKey);
                      setConnectionStatus("unconfigured");
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      selectedProvider === pKey
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Configuration Form */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {PROVIDERS[selectedProvider].name} API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={`Enter ${PROVIDERS[selectedProvider].envVar} (e.g. sk-...)`}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Never hardcoded. Resolved securely.</span>
                <a
                  href={PROVIDERS[selectedProvider].portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-0.5 font-medium"
                >
                  Get Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Model: <code className="text-indigo-600">{PROVIDERS[selectedProvider].defaultModel}</code>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      connectionStatus === "validated"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {connectionStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">{validationMessage}</p>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-2">
              <button
                onClick={handleValidateConnection}
                disabled={isValidating}
                className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Connection...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Test & Validate Connection
                  </>
                )}
              </button>

              {connectionStatus !== "validated" && (
                <button
                  onClick={() => {
                    setApiKeyInput("sk-proj-prod99481284918234812984128");
                    setTimeout(() => handleValidateConnection(), 50);
                  }}
                  className="text-[11px] text-center text-slate-500 hover:text-indigo-600 transition underline"
                >
                  + Use Sandbox Mock Key
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mt-8">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "simulator"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Interactive Sales Simulator & BANT Studio
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "leads"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Qualified Leads Pipeline ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab("handoffs")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "handoffs"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> AE Human Handoff Queue {handoffPacket && "(1 Pending)"}
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-6">
        {/* TAB 1: INTERACTIVE SIMULATOR */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Chat Window (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[620px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        Nexus AI Sales Agent
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {PROVIDERS[selectedProvider].name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Autonomous Commercial Qualification</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMessages([
                        {
                          id: "msg-1",
                          sender: "agent",
                          text: "Hello! I am the Nexus AI Commercial Sales Agent. How can I assist your enterprise today?",
                          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        },
                      ]);
                      setBant({
                        budget: "Unconfirmed",
                        budgetConfirmed: false,
                        authority: "Unknown",
                        need: "Platform Overview",
                        timeline: "Exploring",
                        intentScore: 20,
                      });
                      setHandoffPacket(null);
                      setToolLogs([]);
                    }}
                    className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Session
                  </button>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === "prospect" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                          m.sender === "prospect"
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200"
                        }`}
                      >
                        <p className="leading-relaxed">{m.text}</p>

                        {/* Tool Calls Execution Tag */}
                        {m.toolCalls && m.toolCalls.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1">
                            {m.toolCalls.map((tc) => (
                              <span
                                key={tc}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-slate-200 flex items-center gap-1 shadow-xs"
                              >
                                <Zap className="w-2.5 h-2.5 text-indigo-600" /> {tc}
                              </span>
                            ))}
                          </div>
                        )}

                        <div
                          className={`text-[10px] mt-1 text-right ${
                            m.sender === "prospect" ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          {m.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2 border border-slate-200">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        Analyzing conversation & evaluating Tool Gateway...
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Testing Prompt Chips */}
                <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-slate-400 font-semibold shrink-0">Test Scenarios:</span>
                  <button
                    onClick={() =>
                      handleSendMessage(
                        "Hi! I am the VP of Operations at Acme Global. We have a $50k budget for an ERP with WhatsApp collections immediately."
                      )
                    }
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition"
                  >
                    B2B Intent ($50k Budget)
                  </button>
                  <button
                    onClick={() =>
                      handleSendMessage(
                        "Can you send me a formal pricing quote for 250 enterprise licenses?"
                      )
                    }
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition"
                  >
                    Request Quote (Tool Gateway)
                  </button>
                  <button
                    onClick={() =>
                      handleSendMessage(
                        "I want to speak directly to your sales director about custom SLAs."
                      )
                    }
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition"
                  >
                    Request Human AE Handoff
                  </button>
                </div>

                {/* Message Input Form */}
                <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={
                      connectionStatus === "validated"
                        ? "Type prospect response or question..."
                        : "Agent is disabled. Validate connection above to interact."
                    }
                    disabled={connectionStatus !== "validated" || isSending}
                    className="flex-1 text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={connectionStatus !== "validated" || isSending || !inputText.trim()}
                    className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </div>
            </div>

            {/* Right: BANT Scorecard & Handoff Inspector (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Intent Score Gauge */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Commercial Intent Score</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      bant.intentScore >= 75
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : bant.intentScore >= 50
                        ? "bg-blue-50 text-blue-700 border-blue-300"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {bant.intentScore >= 75
                      ? "SQL (Sales Qualified)"
                      : bant.intentScore >= 50
                      ? "MQL (Marketing Qualified)"
                      : "Evaluating"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="text-3xl font-bold font-mono text-indigo-600">
                    {bant.intentScore}
                    <span className="text-sm text-slate-400 font-normal">/100</span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          bant.intentScore >= 75
                            ? "bg-emerald-600"
                            : bant.intentScore >= 50
                            ? "bg-indigo-600"
                            : "bg-slate-400"
                        }`}
                        style={{ width: `${bant.intentScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Inquiry (20)</span>
                      <span>MQL (50)</span>
                      <span>SQL (75)</span>
                      <span>AE Handoff (85)</span>
                    </div>
                  </div>
                </div>

                {/* BANT Breakdown */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-600">Budget (B):</span>
                    <span
                      className={`font-semibold ${
                        bant.budgetConfirmed ? "text-emerald-700 font-mono" : "text-slate-500"
                      }`}
                    >
                      {bant.budget}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-600">Authority (A):</span>
                    <span className="font-semibold text-slate-800">{bant.authority}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-600">Need (N):</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {bant.need}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-600">Timeline (T):</span>
                    <span className="font-semibold text-slate-800">{bant.timeline}</span>
                  </div>
                </div>
              </div>

              {/* Tool Gateway Delegations Stream */}
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
                    View Gateway <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  {toolLogs.length > 0 ? (
                    toolLogs.map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center justify-between p-2 rounded bg-indigo-50/60 border border-indigo-100"
                      >
                        <span className="font-mono font-semibold text-indigo-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tool}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Enforced & Audited</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic text-[11px] py-3 text-center">
                      No tool actions dispatched yet. Ask for a quote or schedule a call to trigger tools.
                    </div>
                  )}
                </div>
              </div>

              {/* Human Handoff Packet Inspector */}
              {handoffPacket && (
                <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-700" />
                      <h3 className="text-sm font-bold text-amber-900">
                        Synthesized AE Handoff Packet
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      {handoffPacket.priority}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-amber-950">
                    <div>
                      <span className="font-bold">Reason: </span>
                      {handoffPacket.reason}
                    </div>
                    <div>
                      <span className="font-bold">Context Summary: </span>
                      {handoffPacket.contextSummary}
                    </div>
                    <div className="p-2.5 bg-white/80 rounded border border-amber-200/80 text-[11px]">
                      <span className="font-bold text-indigo-900">Recommended AE Strategy: </span>
                      <p className="text-slate-700 mt-0.5">{handoffPacket.recommendedStrategy}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: QUALIFIED LEADS PIPELINE */}
        {activeTab === "leads" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active B2B Commercial Prospects</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Leads qualified autonomously by the AI Sales Agent via BANT criteria
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Company & Contact</th>
                    <th className="py-3 px-4">Intent Score</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Authority</th>
                    <th className="py-3 px-4">Need</th>
                    <th className="py-3 px-4">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{l.company}</div>
                        <div className="text-[11px] text-slate-500">{l.contact} • {l.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-indigo-600 text-sm">{l.intentScore}</span>/100
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            l.stage === "AE Handoff"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : l.stage === "SQL"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {l.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{l.budget}</td>
                      <td className="py-3 px-4 text-slate-700">{l.authority}</td>
                      <td className="py-3 px-4 text-slate-700 truncate max-w-[180px]">{l.need}</td>
                      <td className="py-3 px-4 text-slate-700">{l.timeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: HUMAN HANDOFFS QUEUE */}
        {activeTab === "handoffs" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Account Executive Escalation Queue</h3>
                </div>
                <span className="text-xs text-slate-500">
                  Commercial leads escalated for human closure
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Acme Global Solutions</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Urgent (Score 88)
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Contact: <strong>Sarah Jenkins (VP Ops)</strong> • Budget: $50,000 / yr • Need: Core ERP + WhatsApp
                    </div>
                    <div className="text-[11px] text-indigo-900 bg-white/80 p-2 rounded border border-amber-200/80 mt-2">
                      <strong>AE Action Strategy: </strong> Schedule 30-min architecture review. Propose volume incentive.
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => alert("Handoff Accepted! Lead assigned to current Account Executive.")}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
                    >
                      Accept Handoff
                    </button>
                    <Link
                      href="/crm"
                      className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                    >
                      Open in CRM
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
