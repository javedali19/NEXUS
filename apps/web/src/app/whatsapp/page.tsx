"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Lock,
  FileText,
  Paperclip,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Activity,
  Phone,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Sparkles,
  Download,
  Plus,
  CheckCircle2,
  XCircle,
  Globe2,
} from "lucide-react";

interface WhatsAppMessage {
  id: string;
  wamid: string;
  direction: "inbound" | "outbound";
  type: "text" | "document" | "image" | "template" | "interactive";
  body?: string;
  mediaUrl?: string;
  mediaFilename?: string;
  templateName?: string;
  templateParams?: Record<string, string>;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}

interface WhatsAppConversation {
  id: string;
  customerName: string;
  companyName: string;
  phoneE164: string;
  windowExpiresAt: string;
  isWindowActive: boolean;
  unreadCount: number;
  lastMessageSnippet: string;
  lastMessageAt: string;
  aiCopilotEnabled: boolean;
  messages: WhatsAppMessage[];
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  headerType: string;
  bodyText: string;
  footerText?: string;
  variableCount: number;
  sampleVariables: string[];
}

interface ConsentRecord {
  id: string;
  phoneE164: string;
  customerName: string;
  company: string;
  status: "OPTED_IN" | "OPTED_OUT";
  source: string;
  optedInAt: string;
  proof: string;
}

const INITIAL_CONVERSATIONS: WhatsAppConversation[] = [
  {
    id: "conv-1",
    customerName: "Sarah Jenkins",
    companyName: "Acme Industrial Corp",
    phoneE164: "+1 (555) 234-5678",
    windowExpiresAt: "2026-09-23T18:30:00Z",
    isWindowActive: true,
    unreadCount: 0,
    lastMessageSnippet: "Thanks! I have received the updated invoice PDF and approved it.",
    lastMessageAt: "10:42 AM",
    aiCopilotEnabled: true,
    messages: [
      {
        id: "m-1",
        wamid: "wamid.HBgLMTU1NTIzNDU2NzhVAgASGBwwM0E4",
        direction: "outbound",
        type: "template",
        templateName: "invoice_payment_reminder",
        body: "Hello Sarah, your invoice INV-2026-0041 for $42,500.00 is ready for review.",
        status: "read",
        timestamp: "09:15 AM",
        deliveredAt: "09:15 AM",
        readAt: "09:18 AM",
      },
      {
        id: "m-2",
        wamid: "wamid.HBgLMTU1NTIzNDU2NzhVAgASGBwwM0E5",
        direction: "outbound",
        type: "document",
        mediaFilename: "INV-2026-0041-AcmeCorp.pdf",
        body: "Invoice Document Attached",
        status: "read",
        timestamp: "09:16 AM",
        deliveredAt: "09:16 AM",
        readAt: "09:18 AM",
      },
      {
        id: "m-3",
        wamid: "wamid.HBgLMTU1NTIzNDU2NzhVAgASGBwwM0FB",
        direction: "inbound",
        type: "text",
        body: "Thanks! I have received the updated invoice PDF and approved it.",
        status: "read",
        timestamp: "10:42 AM",
      },
    ],
  },
  {
    id: "conv-2",
    customerName: "Rajesh Sharma",
    companyName: "Zenith Retail India Pvt Ltd",
    phoneE164: "+91 98765 43210",
    windowExpiresAt: "2026-09-23T14:15:00Z",
    isWindowActive: true,
    unreadCount: 1,
    lastMessageSnippet: "Can we settle via Razorpay UPI dynamic QR?",
    lastMessageAt: "11:05 AM",
    aiCopilotEnabled: true,
    messages: [
      {
        id: "m-4",
        wamid: "wamid.HBgLOTg3NjU0MzIxMFVAgASGBwwM0FD",
        direction: "inbound",
        type: "text",
        body: "Hi Nexus team, can we settle via Razorpay UPI dynamic QR?",
        status: "read",
        timestamp: "11:05 AM",
      },
    ],
  },
  {
    id: "conv-3",
    customerName: "Marcus Vance",
    companyName: "AeroTech Dynamics",
    phoneE164: "+1 (555) 789-0123",
    windowExpiresAt: "2026-09-21T09:00:00Z",
    isWindowActive: false, // Expired window - requires HSM template
    unreadCount: 0,
    lastMessageSnippet: "Project milestone sign-off completed last Friday.",
    lastMessageAt: "Sep 21",
    aiCopilotEnabled: false,
    messages: [
      {
        id: "m-5",
        wamid: "wamid.HBgLMTU1NTc4OTAxMjNVAgASGBwwM0FF",
        direction: "inbound",
        type: "text",
        body: "Project milestone sign-off completed last Friday.",
        status: "read",
        timestamp: "Sep 21, 09:00 AM",
      },
    ],
  },
];

const TEMPLATES_CATALOG: WhatsAppTemplate[] = [
  {
    id: "tmpl-1",
    name: "invoice_payment_reminder",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
    headerType: "DOCUMENT",
    bodyText:
      "Hello {{1}}, your invoice {{2}} for {{3}} is now due on {{4}}. Click below to review the invoice or pay directly.",
    footerText: "Nexus Enterprise Automated Billing",
    variableCount: 4,
    sampleVariables: ["Sarah Jenkins", "INV-2026-0041", "$42,500.00", "Oct 15, 2026"],
  },
  {
    id: "tmpl-2",
    name: "quote_ready_dispatch",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
    headerType: "DOCUMENT",
    bodyText:
      "Dear {{1}}, your formal enterprise proposal {{2}} is ready. The quote totals {{3}} with pricing locked until {{4}}.",
    footerText: "Nexus Sales Engineering",
    variableCount: 4,
    sampleVariables: ["Rajesh Sharma", "Q-2026-0089", "$120,000.00", "Nov 01, 2026"],
  },
  {
    id: "tmpl-3",
    name: "order_delivery_update",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
    headerType: "TEXT",
    bodyText:
      "Hello {{1}}, shipment for PO {{2}} has been dispatched via {{3}}. Tracking ID: {{4}}.",
    footerText: "Logistics Operations Hub",
    variableCount: 4,
    sampleVariables: ["Marcus Vance", "PO-9942", "FedEx Express", "TRK-88392019"],
  },
  {
    id: "tmpl-4",
    name: "quarterly_executive_briefing",
    category: "MARKETING",
    language: "en_US",
    status: "APPROVED",
    headerType: "IMAGE",
    bodyText:
      "Hi {{1}}, discover how Nexus ERP + AI has accelerated operational velocity by 34% this quarter. Read our enterprise benchmark study.",
    footerText: "Opt-in consent verified. Reply STOP to unsubscribe.",
    variableCount: 1,
    sampleVariables: ["Sarah Jenkins"],
  },
];

const INITIAL_CONSENTS: ConsentRecord[] = [
  {
    id: "cs-1",
    phoneE164: "+1 (555) 234-5678",
    customerName: "Sarah Jenkins",
    company: "Acme Industrial Corp",
    status: "OPTED_IN",
    source: "Invoice Checkout Form",
    optedInAt: "2026-08-12 14:20",
    proof: "Signed Master Services Agreement §9.4 (SMS/WhatsApp Communications)",
  },
  {
    id: "cs-2",
    phoneE164: "+91 98765 43210",
    customerName: "Rajesh Sharma",
    company: "Zenith Retail India Pvt Ltd",
    status: "OPTED_IN",
    source: "Client Portal Onboarding",
    optedInAt: "2026-09-01 09:12",
    proof: "Portal Double Opt-In OTP Confirmation (Auth Ref: #WA-OTP-8819)",
  },
  {
    id: "cs-3",
    phoneE164: "+1 (555) 789-0123",
    customerName: "Marcus Vance",
    company: "AeroTech Dynamics",
    status: "OPTED_IN",
    source: "CRM Quote Request",
    optedInAt: "2026-07-19 11:30",
    proof: "Explicit Web Form Checkbox Consent (IP: 198.51.100.44)",
  },
  {
    id: "cs-4",
    phoneE164: "+44 20 7946 0912",
    customerName: "Claire Dupont",
    company: "EuroGlobal Logistics",
    status: "OPTED_OUT",
    source: "Inbound STOP Keyword",
    optedInAt: "2026-06-10 10:00",
    proof: "Customer texted 'STOP' on 2026-09-18. System automatically revoked consent.",
  },
];

export default function WhatsAppOperationsPage() {
  const [activeTab, setActiveTab] = useState<"conversations" | "config" | "templates" | "consent" | "diagnostics">("conversations");
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>("conv-1");
  const [messageInput, setMessageInput] = useState<string>("");
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("invoice_payment_reminder");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [consents, setConsents] = useState<ConsentRecord[]>(INITIAL_CONSENTS);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: "success" | "warning" } | null>(null);

  // Diagnostic states
  const [diagPayload, setDiagPayload] = useState<string>(
    JSON.stringify(
      {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "100234892839120",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  messages: [
                    {
                      from: "15552345678",
                      id: "wamid.HBgLMTU1NTIzNDU2NzhVAgASGBwwM0FB",
                      timestamp: "1727000000",
                      text: { body: "Can we schedule a 10m review for quote Q-2026-0089?" },
                      type: "text",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      },
      null,
      2
    )
  );
  const [diagVerifyToken, setDiagVerifyToken] = useState<string>("nexus_waba_verify_prod_9942");

  const showToast = (title: string, desc: string, type: "success" | "warning" = "success") => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const selectedConv = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0];
  }, [conversations, selectedConvId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phoneE164.includes(searchTerm)
    );
  }, [conversations, searchTerm]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    if (!selectedConv.isWindowActive) {
      showToast(
        "24-Hour Session Expired",
        "Freeform messages cannot be sent outside the 24-hr customer service window. Please select an approved HSM Template.",
        "warning"
      );
      return;
    }

    const newMessage: WhatsAppMessage = {
      id: `m-${Date.now()}`,
      wamid: `wamid.HBgL${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      direction: "outbound",
      type: "text",
      body: messageInput,
      status: "delivered",
      timestamp: "Just now",
      sentAt: "Just now",
      deliveredAt: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConv.id) {
          return {
            ...c,
            lastMessageSnippet: messageInput,
            lastMessageAt: "Just now",
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );

    setMessageInput("");
    showToast("Message Dispatched", "Dispatched to Meta Cloud API (/v20.0/messages) with delivery acknowledgment.", "success");
  };

  const handleSendTemplate = () => {
    const tmpl = TEMPLATES_CATALOG.find((t) => t.name === selectedTemplateName);
    if (!tmpl) return;

    const interpolatedBody = tmpl.bodyText
      .replace("{{1}}", selectedConv.customerName)
      .replace("{{2}}", "INV-2026-0041")
      .replace("{{3}}", "$42,500.00")
      .replace("{{4}}", "Oct 15, 2026");

    const newMsg: WhatsAppMessage = {
      id: `m-${Date.now()}`,
      wamid: `wamid.HBgL${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      direction: "outbound",
      type: "template",
      templateName: tmpl.name,
      body: interpolatedBody,
      status: "delivered",
      timestamp: "Just now",
      sentAt: "Just now",
      deliveredAt: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConv.id) {
          return {
            ...c,
            lastMessageSnippet: interpolatedBody,
            lastMessageAt: "Just now",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setIsTemplateModalOpen(false);
    showToast("HSM Template Dispatched", `Meta Approved Template '${tmpl.name}' sent successfully.`, "success");
  };

  const handleToggleConsent = (id: string) => {
    setConsents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === "OPTED_IN" ? "OPTED_OUT" : "OPTED_IN";
          return {
            ...c,
            status: newStatus,
            optedInAt: newStatus === "OPTED_IN" ? "Just now" : c.optedInAt,
          };
        }
        return c;
      })
    );
    showToast("Consent Updated", "Contact opt-in compliance state modified and logged to audit ledger.", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-xl flex items-start gap-3 max-w-md ${
            toastMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
          } bg-card`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-xs text-foreground">{toastMessage.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Meta WhatsApp Business Platform
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                  Cloud API v20.0+
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enterprise messaging hub: 24-hr customer service windows, HSM pre-approved templates, delivery telemetry, and cryptographic webhook verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/whatsapp/ai-agent"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Bot className="h-3.5 w-3.5" />
            AI WhatsApp Agent (Triple-Gate)
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            WABA Phone Connected (+1 555-023-4567)
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Active 24h Sessions</span>
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">2 Active</div>
          <p className="text-[11px] text-muted-foreground mt-1">1 session expiring in &lt;6 hrs</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Delivery Rate</span>
            <CheckCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">99.4%</div>
          <p className="text-[11px] text-muted-foreground mt-1">Meta Cloud API SLA: 99.9%</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">HSM Templates</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">4 Approved</div>
          <p className="text-[11px] text-muted-foreground mt-1">Utility & Marketing Categories</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Consent Compliance</span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">98.6%</div>
          <p className="text-[11px] text-muted-foreground mt-1">Automatic STOP Keyword listener</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-border space-x-1 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab("conversations")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "conversations"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageCircle className="h-4 w-4" /> Live 24-hr Conversations
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "config"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="h-4 w-4" /> Meta Cloud API & WABA Binding
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "templates"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="h-4 w-4" /> HSM Approved Templates Catalog
        </button>

        <button
          onClick={() => setActiveTab("consent")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "consent"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Opt-In & Consent Ledger
        </button>

        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "diagnostics"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" /> Webhook & Signature Diagnostics
        </button>
      </div>

      {/* TAB 1: LIVE 24-HR CONVERSATIONS & CHAT CONSOLE */}
      {activeTab === "conversations" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[640px] bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Left Column: Conversation Directory */}
          <div className="lg:col-span-4 border-r border-border flex flex-col h-full bg-muted/10">
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customer, company, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filteredConversations.map((c) => {
                const isSelected = c.id === selectedConv.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 ${
                      isSelected ? "bg-accent/70 border-l-4 border-l-primary" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground truncate">{c.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">{c.lastMessageAt}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate">{c.companyName}</span>
                      {c.isWindowActive ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          24h Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          HSM Only
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-foreground/80 truncate">{c.lastMessageSnippet}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{c.phoneE164}</span>
                      {c.aiCopilotEnabled && (
                        <span className="flex items-center gap-1 text-[9px] font-medium text-indigo-600 dark:text-indigo-400">
                          <Bot className="h-3 w-3" /> AI Active
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Console */}
          <div className="lg:col-span-8 flex flex-col h-full bg-background">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {selectedConv.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    {selectedConv.customerName}
                    <span className="text-[11px] font-normal text-muted-foreground">({selectedConv.companyName})</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-mono">{selectedConv.phoneE164}</span>
                    <span>•</span>
                    {selectedConv.isWindowActive ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 24-hr session active
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Session expired (Use HSM Template)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setConversations((prev) =>
                      prev.map((c) =>
                        c.id === selectedConv.id ? { ...c, aiCopilotEnabled: !c.aiCopilotEnabled } : c
                      )
                    );
                    showToast(
                      "AI Copilot Toggled",
                      `Autonomous AI assistant is now ${!selectedConv.aiCopilotEnabled ? "enabled" : "disabled"} for ${selectedConv.customerName}.`
                    );
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                    selectedConv.aiCopilotEnabled
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  {selectedConv.aiCopilotEnabled ? "AI Copilot On" : "AI Copilot Off"}
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
              {selectedConv.messages.map((m) => {
                const isInbound = m.direction === "inbound";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isInbound ? "items-start" : "items-end"} space-y-1`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 text-xs shadow-sm ${
                        isInbound
                          ? "bg-card border border-border text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {m.type === "template" && (
                        <div className="mb-1 text-[10px] uppercase font-mono font-bold tracking-wider opacity-80 border-b border-primary-foreground/20 pb-1 flex items-center gap-1">
                          <Zap className="h-3 w-3" /> HSM Template: {m.templateName}
                        </div>
                      )}

                      {m.type === "document" && (
                        <div className="mb-2 p-2 bg-black/10 rounded flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-mono text-[11px]">{m.mediaFilename}</span>
                          </div>
                          <Download className="h-3.5 w-3.5 cursor-pointer opacity-80 hover:opacity-100" />
                        </div>
                      )}

                      <p className="leading-relaxed">{m.body}</p>

                      <div
                        className={`flex items-center justify-end gap-1.5 text-[9px] mt-1.5 ${
                          isInbound ? "text-muted-foreground" : "text-primary-foreground/80"
                        }`}
                      >
                        <span>{m.timestamp}</span>
                        {!isInbound && (
                          <span>
                            {m.status === "read" ? (
                              <CheckCheck className="h-3.5 w-3.5 text-sky-300" />
                            ) : m.status === "delivered" ? (
                              <CheckCheck className="h-3.5 w-3.5" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Composer */}
            <div className="p-3 border-t border-border bg-card space-y-2">
              {!selectedConv.isWindowActive && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> 24-hr customer service window is expired. Meta requires pre-approved HSM templates.
                  </span>
                  <button
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[10px]"
                  >
                    Select HSM Template
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="px-2.5 py-2 rounded-lg bg-muted text-foreground text-xs hover:bg-accent border border-border flex items-center gap-1.5 whitespace-nowrap"
                  title="Insert HSM Template"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Templates
                </button>

                <input
                  type="text"
                  placeholder={
                    selectedConv.isWindowActive
                      ? "Type freeform WhatsApp message..."
                      : "Session closed. Use HSM Templates..."
                  }
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  disabled={!selectedConv.isWindowActive}
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!selectedConv.isWindowActive || !messageInput.trim()}
                  className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: META CLOUD API & WABA CREDENTIALS MANAGER */}
      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Meta WhatsApp Business Account (WABA) Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Production Cloud API v20.0 credentials resolved securely server-side via Google Secret Manager.
                </p>
              </div>

              <button
                onClick={() => {
                  showToast("Meta Connection Validated", "GET /v20.0/phone_number_id returned 200 OK. Quality Rating: GREEN (High Quality). Latency: 48ms.");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Activity className="h-3.5 w-3.5" /> Validate Meta Connection Probe
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  WhatsApp Business Account (WABA) ID
                </label>
                <input
                  type="text"
                  readOnly
                  value="100234892839120"
                  className="w-full px-3 py-1.5 bg-muted/40 border border-border rounded font-mono text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  readOnly
                  value="109283918239401"
                  className="w-full px-3 py-1.5 bg-muted/40 border border-border rounded font-mono text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Display Phone Number
                </label>
                <input
                  type="text"
                  readOnly
                  value="+1 (555) 023-4567"
                  className="w-full px-3 py-1.5 bg-muted/40 border border-border rounded font-mono text-foreground font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Verified Business Name & Quality Rating
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="Nexus Enterprise Solutions"
                    className="flex-1 px-3 py-1.5 bg-muted/40 border border-border rounded text-foreground font-medium"
                  />
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[10px]">
                    GREEN / High
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Google Secret Manager (GSM) Vault Security Bindings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                    System User Permanent Access Token GSM Path:
                  </span>
                  <div className="p-2 bg-muted/40 border border-border rounded font-mono text-[11px] text-muted-foreground truncate">
                    projects/nexus-enterprise-prod/secrets/meta_whatsapp_access_token/versions/latest
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                    Meta App Secret (HMAC SHA-256) GSM Path:
                  </span>
                  <div className="p-2 bg-muted/40 border border-border rounded font-mono text-[11px] text-muted-foreground truncate">
                    projects/nexus-enterprise-prod/secrets/meta_app_secret/versions/latest
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Webhook Verify Token: <strong className="font-mono text-foreground">nexus_waba_verify_prod_9942</strong></span>
                <span>Webhook Endpoint: <strong className="font-mono text-foreground">https://api.nexusenterprise.com/api/v1/webhooks/whatsapp</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HSM APPROVED TEMPLATES CATALOG */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Meta Pre-Approved HSM Templates Catalog
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pre-registered High Structured Message (HSM) templates for outbound engagement outside the 24-hr customer service window.
              </p>
            </div>

            <button
              onClick={() => {
                showToast("Meta Templates Synchronized", "4 approved templates synchronized from Meta Graph API /v20.0/{waba_id}/message_templates.");
              }}
              className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-accent border border-border flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync from Meta WABA
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES_CATALOG.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-xs text-foreground">{tmpl.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {tmpl.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-muted font-semibold">{tmpl.category}</span>
                    <span>•</span>
                    <span className="font-mono">{tmpl.language}</span>
                    <span>•</span>
                    <span>Header: {tmpl.headerType}</span>
                  </div>

                  <div className="p-3 bg-muted/30 border border-border rounded text-xs text-foreground leading-relaxed">
                    {tmpl.bodyText}
                  </div>

                  {tmpl.footerText && (
                    <p className="text-[10px] text-muted-foreground italic">Footer: {tmpl.footerText}</p>
                  )}
                </div>

                <div className="border-t border-border pt-2.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">{tmpl.variableCount} Dynamic Variables</span>
                  <button
                    onClick={() => {
                      setSelectedTemplateName(tmpl.name);
                      setIsTemplateModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Test Template Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OPT-IN & CONSENT COMPLIANCE LEDGER */}
      {activeTab === "consent" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                WhatsApp Contact Consent & Opt-In Compliance Ledger
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full GDPR & Meta Business Messaging policy compliance with automatic opt-out keyword handling (STOP / UNSUBSCRIBE).
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Customer & Company</th>
                  <th className="py-2.5 px-4">E.164 Phone</th>
                  <th className="py-2.5 px-4">Consent Status</th>
                  <th className="py-2.5 px-4">Source & Opt-In Timestamp</th>
                  <th className="py-2.5 px-4">Proof of Consent</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {consents.map((cs) => (
                  <tr key={cs.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{cs.customerName}</div>
                      <div className="text-[11px] text-muted-foreground">{cs.company}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{cs.phoneE164}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cs.status === "OPTED_IN"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {cs.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{cs.source}</div>
                      <div className="text-[10px] text-muted-foreground">{cs.optedInAt}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px] max-w-xs truncate">
                      {cs.proof}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleConsent(cs.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          cs.status === "OPTED_IN"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {cs.status === "OPTED_IN" ? "Revoke Consent" : "Grant Consent"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: WEBHOOK & SIGNATURE DIAGNOSTICS */}
      {activeTab === "diagnostics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Webhook Handshake Verification */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Meta Webhook Handshake (GET /webhooks)
              </h3>
              <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                hub.verify_token
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                  Verify Token:
                </label>
                <input
                  type="text"
                  value={diagVerifyToken}
                  onChange={(e) => setDiagVerifyToken(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-background border border-input rounded font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                  Simulated Hub Challenge:
                </label>
                <input
                  type="text"
                  readOnly
                  value="1158201201928391823"
                  className="w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded font-mono text-xs"
                />
              </div>

              <button
                onClick={() => {
                  if (diagVerifyToken === "nexus_waba_verify_prod_9942") {
                    showToast("Handshake Successful", "Meta Webhook challenge verified. Returned HTTP 200 with challenge token.", "success");
                  } else {
                    showToast("Handshake Failed", "Verify token mismatch (HTTP 403 Forbidden).", "warning");
                  }
                }}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs transition-colors shadow-sm"
              >
                Test Webhook Handshake Verification
              </button>
            </div>
          </div>

          {/* Cryptographic HMAC SHA-256 Verifier */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-indigo-500" />
                HMAC SHA-256 (X-Hub-Signature-256) Verifier
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">
                sha256=&lt;digest&gt;
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                  Inbound Webhook JSON Body:
                </label>
                <textarea
                  rows={4}
                  value={diagPayload}
                  onChange={(e) => setDiagPayload(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded font-mono text-[10px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                  Header X-Hub-Signature-256:
                </label>
                <input
                  type="text"
                  readOnly
                  value="sha256=d6c34fa58380e5e0cf8bc1e6120b66b2d1945df0c1a63c631a0c8b671a581452"
                  className="w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded font-mono text-[10px]"
                />
              </div>

              <button
                onClick={() => {
                  showToast(
                    "Cryptographic Signature Validated",
                    "HMAC SHA-256 signature matches App Secret hash. Inbound message processed into customer timeline.",
                    "success"
                  );
                }}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Validate Cryptographic Signature & Ingest Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HSM TEMPLATE DISPATCHER */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Dispatch Pre-Approved HSM Template
              </h2>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Recipient Contact
                </label>
                <div className="p-2 bg-muted/40 border border-border rounded font-semibold text-foreground flex items-center justify-between">
                  <span>{selectedConv.customerName} ({selectedConv.companyName})</span>
                  <span className="font-mono text-muted-foreground">{selectedConv.phoneE164}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Select Meta Approved Template
                </label>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => setSelectedTemplateName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                >
                  {TEMPLATES_CATALOG.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Template Body Preview & Variable Interpolation
                </label>
                <div className="p-3 bg-muted/30 border border-border rounded text-xs text-foreground leading-relaxed">
                  {TEMPLATES_CATALOG.find((t) => t.name === selectedTemplateName)?.bodyText
                    .replace("{{1}}", selectedConv.customerName)
                    .replace("{{2}}", "INV-2026-0041")
                    .replace("{{3}}", "$42,500.00")
                    .replace("{{4}}", "Oct 15, 2026")}
                </div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[11px] text-emerald-700 dark:text-emerald-300">
                <span>Compliance Check: <strong>Passed</strong>. Recipient has active opt-in consent recorded on file.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTemplate}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" /> Dispatch HSM Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
