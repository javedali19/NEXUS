"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  PhoneCall,
  Bot,
  User,
  Send,
  Lock,
  Paperclip,
  Check,
  CheckCheck,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Sparkles,
  Tag,
  Plus,
  X,
  FileText,
  Download,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  Play,
  RotateCcw,
  Zap,
  DollarSign,
  Receipt,
  HelpCircle,
} from "lucide-react";

type Channel = "all" | "whatsapp" | "email" | "voice" | "support" | "ai_chat";
type Priority = "urgent" | "high" | "medium" | "low";
type Status = "open" | "pending" | "resolved" | "closed";

interface Attachment {
  filename: string;
  url: string;
  size: string;
  type: "pdf" | "image" | "doc";
}

interface MessageItem {
  id: string;
  channel: "whatsapp" | "email" | "sms" | "voice" | "support" | "internal_note";
  direction: "inbound" | "outbound";
  senderType: "customer" | "agent" | "ai_copilot" | "system";
  senderName: string;
  isInternalNote: boolean;
  subject?: string;
  body: string;
  timestamp: string;
  deliveryStatus?: "sent" | "delivered" | "read" | "failed";
  attachments?: Attachment[];
  voiceMetadata?: {
    duration: string;
    sentimentScore: number;
    audioUrl?: string;
  };
}

interface OmnichannelThread {
  id: string;
  customerName: string;
  companyName: string;
  customerEmail: string;
  customerPhone: string;
  primaryChannel: "whatsapp" | "email" | "voice" | "support" | "ai_chat";
  title: string;
  status: Status;
  priority: Priority;
  assignedAgent: string;
  slaDueText: string;
  isSlaBreached: boolean;
  sentimentScore: number; // -1.0 to 1.0
  aiSummary: string;
  aiIntent: string;
  unreadCount: number;
  lastMessageSnippet: string;
  lastMessageAt: string;
  tags: string[];
  ltv: number;
  openInvoiceBalance: number;
  openInvoiceNumber?: string;
  messages: MessageItem[];
}

const INITIAL_THREADS: OmnichannelThread[] = [
  {
    id: "th-1",
    customerName: "Sarah Jenkins",
    companyName: "Acme Industrial Corp",
    customerEmail: "sarah.jenkins@acmeguard.com",
    customerPhone: "+1 (555) 234-5678",
    primaryChannel: "whatsapp",
    title: "Invoice Settlement & Enterprise Quote Expansion",
    status: "open",
    priority: "high",
    assignedAgent: "Alex Chen (Lead TAM)",
    slaDueText: "1h 14m remaining",
    isSlaBreached: false,
    sentimentScore: 0.82,
    aiSummary: "Customer approved invoice INV-2026-0041 and requested expansion quote for 50 additional engineer seats.",
    aiIntent: "Invoice Payment & Upsell Proposal",
    unreadCount: 1,
    lastMessageSnippet: "Thanks! I have received the updated invoice PDF and approved it.",
    lastMessageAt: "10:42 AM",
    tags: ["VIP-Enterprise", "Renewal-Q4", "Invoice-Review"],
    ltv: 184500,
    openInvoiceBalance: 42500,
    openInvoiceNumber: "INV-2026-0041",
    messages: [
      {
        id: "m-1",
        channel: "email",
        direction: "outbound",
        senderType: "agent",
        senderName: "Alex Chen",
        isInternalNote: false,
        subject: "Formal Proposal Q-2026-0089 & Master Agreement Draft",
        body: "Hi Sarah,\n\nAttached is the updated proposal Q-2026-0089 reflecting the enterprise volume discount we discussed.",
        timestamp: "Yesterday, 04:15 PM",
        deliveryStatus: "read",
        attachments: [
          {
            filename: "Proposal-Q-2026-0089-AcmeCorp.pdf",
            url: "#",
            size: "1.4 MB",
            type: "pdf",
          },
        ],
      },
      {
        id: "m-2",
        channel: "internal_note",
        direction: "outbound",
        senderType: "agent",
        senderName: "Alex Chen",
        isInternalNote: true,
        body: "@finance-team Customer Sarah Jenkins confirmed verbal signoff for the expansion. Let's make sure billing is ready once payment link settles.",
        timestamp: "Yesterday, 05:00 PM",
      },
      {
        id: "m-3",
        channel: "voice",
        direction: "inbound",
        senderType: "customer",
        senderName: "Sarah Jenkins",
        isInternalNote: false,
        body: "Call Transcript: 'Hi Alex, I reviewed the PDF with our CFO. We will execute the payment directly via the link once the revised invoice is generated.'",
        timestamp: "Today, 09:30 AM",
        voiceMetadata: {
          duration: "04m 18s",
          sentimentScore: 0.88,
        },
      },
      {
        id: "m-4",
        channel: "whatsapp",
        direction: "outbound",
        senderType: "agent",
        senderName: "Nexus Automated Billing",
        isInternalNote: false,
        body: "Hello Sarah, your invoice INV-2026-0041 for $42,500.00 has been issued. Payment link: https://pay.nexus.io/inv-41",
        timestamp: "Today, 10:15 AM",
        deliveryStatus: "read",
        attachments: [
          {
            filename: "INV-2026-0041-AcmeCorp.pdf",
            url: "#",
            size: "420 KB",
            type: "pdf",
          },
        ],
      },
      {
        id: "m-5",
        channel: "whatsapp",
        direction: "inbound",
        senderType: "customer",
        senderName: "Sarah Jenkins",
        isInternalNote: false,
        body: "Thanks! I have received the updated invoice PDF and approved it. Will trigger the wire/card payment now.",
        timestamp: "Today, 10:42 AM",
        deliveryStatus: "read",
      },
    ],
  },
  {
    id: "th-2",
    customerName: "Rajesh Sharma",
    companyName: "Zenith Retail India Pvt Ltd",
    customerEmail: "r.sharma@zenithretail.in",
    customerPhone: "+91 98765 43210",
    primaryChannel: "whatsapp",
    title: "Razorpay Dynamic UPI Payment Inquiry",
    status: "open",
    priority: "urgent",
    assignedAgent: "Priya Patel",
    slaDueText: "28m remaining",
    isSlaBreached: false,
    sentimentScore: 0.65,
    aiSummary: "Customer requesting UPI dynamic QR code for instant INR 75,000 settlement.",
    aiIntent: "Payment Method Inquiry",
    unreadCount: 1,
    lastMessageSnippet: "Can we settle invoice INV-2026-0042 via Razorpay UPI dynamic QR?",
    lastMessageAt: "11:05 AM",
    tags: ["APAC-Region", "Razorpay-UPI", "High-Priority"],
    ltv: 92000,
    openInvoiceBalance: 75000,
    openInvoiceNumber: "INV-2026-0042",
    messages: [
      {
        id: "m-6",
        channel: "whatsapp",
        direction: "inbound",
        senderType: "customer",
        senderName: "Rajesh Sharma",
        isInternalNote: false,
        body: "Hi Nexus team, can we settle invoice INV-2026-0042 via Razorpay UPI dynamic QR?",
        timestamp: "Today, 11:05 AM",
        deliveryStatus: "read",
      },
    ],
  },
  {
    id: "th-3",
    customerName: "Marcus Vance",
    companyName: "AeroTech Dynamics",
    customerEmail: "m.vance@aerotech.com",
    customerPhone: "+1 (555) 789-0123",
    primaryChannel: "email",
    title: "API Integration Webhook Delivery Latency Inquiry",
    status: "pending",
    priority: "medium",
    assignedAgent: "David Kim",
    slaDueText: "3h 40m remaining",
    isSlaBreached: false,
    sentimentScore: 0.1,
    aiSummary: "Technical inquiry regarding webhook retry policy on ERP payload ingestion.",
    aiIntent: "Technical Support",
    unreadCount: 0,
    lastMessageSnippet: "We will review your webhook signature implementation and test next Tuesday.",
    lastMessageAt: "Sep 22",
    tags: ["Tech-Support", "Webhooks-API"],
    ltv: 240000,
    openInvoiceBalance: 0,
    messages: [
      {
        id: "m-7",
        channel: "email",
        direction: "inbound",
        senderType: "customer",
        senderName: "Marcus Vance",
        isInternalNote: false,
        subject: "Webhook Retries and HMAC Validation Specs",
        body: "Could you confirm whether the X-Hub-Signature-256 header is sent with raw bytes or formatted JSON payload?",
        timestamp: "Sep 22, 02:10 PM",
      },
      {
        id: "m-8",
        channel: "email",
        direction: "outbound",
        senderType: "agent",
        senderName: "David Kim",
        isInternalNote: false,
        subject: "Re: Webhook Retries and HMAC Validation Specs",
        body: "Hi Marcus, the signature is computed over raw UTF-8 body bytes using HMAC SHA-256 with the app secret.",
        timestamp: "Sep 22, 03:00 PM",
        deliveryStatus: "delivered",
      },
    ],
  },
  {
    id: "th-4",
    customerName: "Claire Dupont",
    companyName: "EuroGlobal Logistics",
    customerEmail: "c.dupont@euroglobal.fr",
    customerPhone: "+44 20 7946 0912",
    primaryChannel: "voice",
    title: "Voice Inquiry: Multi-Currency SEPA Transfer Settlement",
    status: "resolved",
    priority: "low",
    assignedAgent: "Alex Chen",
    slaDueText: "Resolved",
    isSlaBreached: false,
    sentimentScore: 0.95,
    aiSummary: "Confirmed SEPA direct debit settlement for EUR 14,200.",
    aiIntent: "Billing Confirmation",
    unreadCount: 0,
    lastMessageSnippet: "Call resolved with customer confirming receipt of IBAN mandate.",
    lastMessageAt: "Sep 21",
    tags: ["EU-Region", "SEPA-Payment"],
    ltv: 64000,
    openInvoiceBalance: 0,
    messages: [
      {
        id: "m-9",
        channel: "voice",
        direction: "inbound",
        senderType: "customer",
        senderName: "Claire Dupont",
        isInternalNote: false,
        body: "Call Transcript: 'Everything looks great with the SEPA setup. Thanks for the quick walkthrough.'",
        timestamp: "Sep 21, 11:15 AM",
        voiceMetadata: {
          duration: "06m 12s",
          sentimentScore: 0.95,
        },
      },
    ],
  },
];

export default function OmnichannelInboxPage() {
  const [threads, setThreads] = useState<OmnichannelThread[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("th-1");
  const [activeChannelFilter, setActiveChannelFilter] = useState<Channel>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Composer states
  const [composerMode, setComposerMode] = useState<"whatsapp" | "email" | "sms" | "internal_note">("whatsapp");
  const [composerText, setComposerText] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [isAiDrafting, setIsAiDrafting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedThread = useMemo(() => {
    return threads.find((t) => t.id === selectedThreadId) || threads[0];
  }, [threads, selectedThreadId]);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchChannel = activeChannelFilter === "all" || t.primaryChannel === activeChannelFilter;
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchSearch =
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some((tg) => tg.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchChannel && matchStatus && matchSearch;
    });
  }, [threads, activeChannelFilter, statusFilter, searchTerm]);

  const handleSendMessage = () => {
    if (!composerText.trim()) return;

    const isNote = composerMode === "internal_note";
    const newMsg: MessageItem = {
      id: `m-${Date.now()}`,
      channel: composerMode,
      direction: "outbound",
      senderType: "agent",
      senderName: "Alex Chen (You)",
      isInternalNote: isNote,
      subject: composerMode === "email" ? (emailSubject || `Re: ${selectedThread.title}`) : undefined,
      body: composerText,
      timestamp: "Just now",
      deliveryStatus: isNote ? undefined : "delivered",
    };

    setThreads((prev) =>
      prev.map((th) => {
        if (th.id === selectedThread.id) {
          return {
            ...th,
            lastMessageSnippet: isNote ? `[Internal Note] ${composerText}` : composerText,
            lastMessageAt: "Just now",
            messages: [...th.messages, newMsg],
          };
        }
        return th;
      })
    );

    setComposerText("");
    setEmailSubject("");
    showToast(
      isNote ? "Internal Note Logged" : `Dispatched via ${composerMode.toUpperCase()}`,
      isNote
        ? "Private team note posted to conversation timeline."
        : `Message transmitted to ${selectedThread.customerName} via ${composerMode}.`
    );
  };

  const handleGenerateAiDraft = () => {
    setIsAiDrafting(true);
    setTimeout(() => {
      setIsAiDrafting(false);
      if (composerMode === "internal_note") {
        setComposerText("Customer verified invoice approval. Recommending auto-reconciliation upon gateway settlement callback.");
      } else if (selectedThread.id === "th-2") {
        setComposerText("Hello Rajesh, you can pay instantly via UPI Dynamic QR code at https://pay.nexus.io/in/qr-inv-42. Generated via Razorpay Gateway.");
      } else {
        setComposerText(
          `Hi ${selectedThread.customerName.split(" ")[0]}, thank you for confirming! I have logged the invoice confirmation and dispatched our engineering kickoff schedule.`
        );
      }
      showToast("AI Draft Generated", "Nexus Copilot synthesized contextual reply from customer timeline.");
    }, 450);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      const tagToAdd = newTagInput.trim();
      setThreads((prev) =>
        prev.map((th) => {
          if (th.id === selectedThread.id && !th.tags.includes(tagToAdd)) {
            return { ...th, tags: [...th.tags, tagToAdd] };
          }
          return th;
        })
      );
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setThreads((prev) =>
      prev.map((th) => {
        if (th.id === selectedThread.id) {
          return { ...th, tags: th.tags.filter((t) => t !== tagToRemove) };
        }
        return th;
      })
    );
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border border-primary/20 bg-card shadow-xl flex items-start gap-3 max-w-md">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-bold text-xs text-foreground">{toastMessage.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Unified Omnichannel Inbox
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              Live Gateway Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidated customer conversations across WhatsApp, Email, SMS, Voice recordings, Support, and AI Copilot.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-card border border-border text-foreground flex items-center gap-1.5 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-primary" /> SLA Health: <strong>100% On-Track</strong>
          </span>
        </div>
      </div>

      {/* Main 3-Pane Omnichannel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px] bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* PANE 1: CONVERSATION LIST & FILTERS (Col 1-4) */}
        <div className="lg:col-span-4 border-r border-border flex flex-col h-full bg-muted/10">
          {/* Channel Selector Subnav */}
          <div className="p-3 border-b border-border space-y-2.5">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setActiveChannelFilter("all")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  activeChannelFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                All ({threads.length})
              </button>
              <button
                onClick={() => setActiveChannelFilter("whatsapp")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                  activeChannelFilter === "whatsapp"
                    ? "bg-emerald-600 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <MessageCircle className="h-3 w-3 text-emerald-500" /> WhatsApp
              </button>
              <button
                onClick={() => setActiveChannelFilter("email")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                  activeChannelFilter === "email"
                    ? "bg-sky-600 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <Mail className="h-3 w-3 text-sky-500" /> Email
              </button>
              <button
                onClick={() => setActiveChannelFilter("voice")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                  activeChannelFilter === "voice"
                    ? "bg-purple-600 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <PhoneCall className="h-3 w-3 text-purple-500" /> Voice
              </button>
            </div>

            {/* Search & Status Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customer, tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 bg-background border border-input rounded text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 bg-background border border-input rounded text-xs text-foreground"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Conversation Feed List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredThreads.map((th) => {
              const isSelected = th.id === selectedThread.id;
              return (
                <button
                  key={th.id}
                  onClick={() => setSelectedThreadId(th.id)}
                  className={`w-full text-left p-3 transition-colors flex flex-col gap-1.5 ${
                    isSelected ? "bg-accent/70 border-l-4 border-l-primary" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {th.primaryChannel === "whatsapp" && (
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                      {th.primaryChannel === "email" && (
                        <Mail className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                      )}
                      {th.primaryChannel === "voice" && (
                        <PhoneCall className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-foreground truncate max-w-[130px]">
                        {th.customerName}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{th.lastMessageAt}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate">{th.companyName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                        th.priority === "urgent"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : th.priority === "high"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {th.priority}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/80 line-clamp-1">{th.lastMessageSnippet}</p>

                  <div className="flex items-center justify-between pt-0.5 text-[10px]">
                    <span className="text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" /> {th.slaDueText}
                    </span>
                    <div className="flex items-center gap-1">
                      {th.unreadCount > 0 && (
                        <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[9px]">
                          {th.unreadCount}
                        </span>
                      )}
                      <span
                        className={`h-2 w-2 rounded-full ${
                          th.sentimentScore >= 0.7
                            ? "bg-emerald-500"
                            : th.sentimentScore >= 0.3
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        title={`Sentiment: ${(th.sentimentScore * 100).toFixed(0)}%`}
                      ></span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANE 2: CONVERSATION DETAIL & MULTI-MODE COMPOSER (Col 5-9) */}
        <div className="lg:col-span-5 flex flex-col h-full bg-background border-r border-border">
          {/* Detail Header */}
          <div className="p-3 border-b border-border flex items-center justify-between bg-card">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-foreground">{selectedThread.title}</h3>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                    selectedThread.status === "open"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {selectedThread.status}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {selectedThread.customerName} • {selectedThread.customerEmail}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  showToast(
                    "Conversation Status Updated",
                    `Thread '${selectedThread.title}' marked as ${selectedThread.status === "open" ? "Resolved" : "Open"}.`
                  );
                  setThreads((prev) =>
                    prev.map((th) =>
                      th.id === selectedThread.id
                        ? { ...th, status: th.status === "open" ? "resolved" : "open" }
                        : th
                    )
                  );
                }}
                className="px-2.5 py-1 rounded bg-muted hover:bg-accent text-foreground text-xs font-semibold border border-border transition-colors"
              >
                {selectedThread.status === "open" ? "Resolve" : "Re-open"}
              </button>
            </div>
          </div>

          {/* AI Intent & Summary Banner */}
          <div className="p-2.5 bg-indigo-500/5 border-b border-indigo-500/10 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="text-[11px] text-foreground font-medium line-clamp-1">
                <strong>AI Summary:</strong> {selectedThread.aiSummary}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-semibold font-mono whitespace-nowrap">
              {selectedThread.aiIntent}
            </span>
          </div>

          {/* Chronological Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
            {selectedThread.messages.map((m) => {
              if (m.isInternalNote) {
                return (
                  <div key={m.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1 my-2">
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-semibold text-[10px]">
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Private Internal Note • {m.senderName}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="text-foreground leading-relaxed text-xs">{m.body}</p>
                  </div>
                );
              }

              if (m.channel === "voice") {
                return (
                  <div key={m.id} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-2">
                    <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 font-semibold text-[10px]">
                      <span className="flex items-center gap-1">
                        <PhoneCall className="h-3 w-3" /> Telephony Recording & Transcript ({m.voiceMetadata?.duration})
                      </span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-background border border-border rounded">
                      <button className="p-1 rounded-full bg-purple-600 text-white">
                        <Play className="h-3 w-3" />
                      </button>
                      <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-purple-500 w-1/3"></div>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">01:14 / {m.voiceMetadata?.duration}</span>
                    </div>

                    <p className="text-foreground text-xs leading-relaxed italic">{m.body}</p>
                  </div>
                );
              }

              if (m.channel === "email") {
                const isInbound = m.direction === "inbound";
                return (
                  <div key={m.id} className="p-3 rounded-lg bg-card border border-border text-xs space-y-2 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Mail className="h-3.5 w-3.5 text-sky-500" />
                        <span>{m.subject || "Email Communication"}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{m.timestamp}</span>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                      From: <strong>{m.senderName}</strong>
                    </div>

                    <p className="text-foreground whitespace-pre-line leading-relaxed text-xs">{m.body}</p>

                    {m.attachments && m.attachments.length > 0 && (
                      <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                        {m.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded bg-muted/50 border border-border flex items-center gap-2 text-[11px]"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono">{att.filename}</span>
                            <span className="text-muted-foreground text-[10px]">({att.size})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // WhatsApp / SMS Chat Bubble
              const isInbound = m.direction === "inbound";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isInbound ? "items-start" : "items-end"} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs shadow-sm ${
                      isInbound
                        ? "bg-card border border-border text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mb-2 p-2 bg-black/10 rounded flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-mono text-[11px]">{m.attachments[0].filename}</span>
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
                          {m.deliveryStatus === "read" ? (
                            <CheckCheck className="h-3.5 w-3.5 text-sky-300" />
                          ) : m.deliveryStatus === "delivered" ? (
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

          {/* Multi-Mode Composer */}
          <div className="p-3 border-t border-border bg-card space-y-2.5">
            {/* Channel Switcher */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setComposerMode("whatsapp")}
                  className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                    composerMode === "whatsapp"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="h-3 w-3 text-emerald-500" /> WhatsApp
                </button>

                <button
                  onClick={() => setComposerMode("email")}
                  className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                    composerMode === "email"
                      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="h-3 w-3 text-sky-500" /> Email
                </button>

                <button
                  onClick={() => setComposerMode("sms")}
                  className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                    composerMode === "sms"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="h-3 w-3 text-amber-500" /> SMS
                </button>

                <button
                  onClick={() => setComposerMode("internal_note")}
                  className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                    composerMode === "internal_note"
                      ? "bg-amber-600 text-white font-bold"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Lock className="h-3 w-3" /> Team Note
                </button>
              </div>

              {/* AI Copilot Prompt */}
              <button
                type="button"
                onClick={handleGenerateAiDraft}
                disabled={isAiDrafting}
                className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold flex items-center gap-1 hover:bg-indigo-500/20 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                {isAiDrafting ? "Synthesizing..." : "Draft with AI"}
              </button>
            </div>

            {composerMode === "email" && (
              <input
                type="text"
                placeholder="Email Subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-1.5 bg-background border border-input rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            )}

            <div className="relative">
              <textarea
                rows={3}
                placeholder={
                  composerMode === "internal_note"
                    ? "Write a private internal note for the team (not visible to customer)..."
                    : `Type reply to send via ${composerMode.toUpperCase()}...`
                }
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                className={`w-full p-2.5 bg-background border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                  composerMode === "internal_note" ? "border-amber-500/40 bg-amber-500/5" : "border-input"
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setComposerText(
                      (prev) => prev + " [Attached: Invoice-INV-2026-0041.pdf (Payment Link Included)]"
                    );
                    showToast("Document Attached", "Invoice INV-2026-0041 attached to composer.");
                  }}
                  className="p-1 hover:text-foreground hover:bg-muted rounded"
                  title="Attach Invoice PDF"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <span className="text-[11px]">
                  {composerMode === "internal_note" ? "🔒 Locked to internal team" : "🚀 Ready for external dispatch"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!composerText.trim()}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors ${
                  composerMode === "internal_note"
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                } disabled:opacity-50`}
              >
                <Send className="h-3.5 w-3.5" />
                {composerMode === "internal_note" ? "Post Note" : "Send Reply"}
              </button>
            </div>
          </div>
        </div>

        {/* PANE 3: CUSTOMER 360 CONTEXT & QUICK ACTIONS (Col 10-12) */}
        <div className="lg:col-span-3 flex flex-col h-full bg-card p-4 space-y-4 overflow-y-auto">
          <div>
            <h4 className="font-bold text-xs text-foreground uppercase tracking-wider text-muted-foreground mb-2">
              Customer 360 Profile
            </h4>

            <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {selectedThread.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">{selectedThread.customerName}</div>
                  <div className="text-[10px] text-muted-foreground">{selectedThread.companyName}</div>
                </div>
              </div>

              <div className="border-t border-border pt-2 space-y-1 text-xs">
                <div className="text-[11px] text-muted-foreground flex justify-between">
                  <span>Phone:</span>
                  <span className="font-mono text-foreground">{selectedThread.customerPhone}</span>
                </div>
                <div className="text-[11px] text-muted-foreground flex justify-between">
                  <span>Email:</span>
                  <span className="text-foreground truncate max-w-[130px]">{selectedThread.customerEmail}</span>
                </div>
                <div className="text-[11px] text-muted-foreground flex justify-between">
                  <span>Owner:</span>
                  <span className="text-foreground">{selectedThread.assignedAgent}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Snapshot */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
              Financial Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
                <span className="text-[10px] text-muted-foreground block">Customer LTV</span>
                <span className="font-bold font-mono text-foreground">${selectedThread.ltv.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
                <span className="text-[10px] text-muted-foreground block">Open Invoices</span>
                <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                  ${selectedThread.openInvoiceBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {selectedThread.openInvoiceNumber && (
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-[11px] flex items-center justify-between">
                <span>Active: <strong>{selectedThread.openInvoiceNumber}</strong></span>
                <Link
                  href="/payments"
                  className="text-primary hover:underline font-semibold text-[10px] flex items-center gap-0.5"
                >
                  Pay Link <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Dynamic Tags Manager */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
              Classification Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedThread.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 text-muted-foreground"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              placeholder="+ Add tag (Press Enter)..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-2.5 py-1 bg-background border border-input rounded text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Quick CRM Navigation Links */}
          <div className="pt-2 border-t border-border space-y-1.5">
            <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Quick Actions
            </h4>
            <Link
              href="/invoices"
              className="w-full py-1.5 px-2.5 rounded bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-between transition-colors border border-border"
            >
              <span className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" /> View Invoices
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Link>

            <Link
              href="/timeline"
              className="w-full py-1.5 px-2.5 rounded bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-between transition-colors border border-border"
            >
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-500" /> Customer Timeline
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Link>

            <Link
              href="/whatsapp"
              className="w-full py-1.5 px-2.5 rounded bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-between transition-colors border border-border"
            >
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Console
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
