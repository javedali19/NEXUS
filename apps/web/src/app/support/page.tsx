"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  MessageSquare,
  Send,
  Paperclip,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  FileText,
  Sparkles,
  History,
  Lock,
  Phone,
  PhoneCall,
  MessageCircle,
  Check,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Star,
  Play,
  Pause,
  Volume2,
  Building,
  RefreshCw,
  GitBranch,
  CreditCard,
  DollarSign,
} from "lucide-react";

// ============================================================================
// Types & Domain Interfaces
// ============================================================================

export type CasePriority = "urgent" | "high" | "medium" | "low";
export type CaseStatus = "open" | "in_progress" | "waiting_on_customer" | "escalated" | "resolved" | "closed";
export type SlaStatus = "within_sla" | "at_risk" | "breached";

export interface CaseMessage {
  id: string;
  senderType: "customer" | "agent" | "ai_copilot" | "system" | "supervisor";
  senderName: string;
  channel: "portal" | "whatsapp" | "phone_transcript" | "email";
  content: string;
  timestamp: string;
  externalMessageId?: string;
}

export interface CaseInternalNote {
  id: string;
  authorName: string;
  noteText: string;
  isPinned: boolean;
  timestamp: string;
}

export interface CaseAttachment {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageUri: string;
  uploaderName: string;
  uploadedAt: string;
}

export interface CaseAuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  actorName: string;
  actorType: string;
  details: string;
}

export interface SupportCaseItem {
  id: string;
  caseNumber: string;
  subject: string;
  description: string;
  category: "billing_dispute" | "technical_bug" | "feature_request" | "service_outage" | "account_access" | "onboarding";
  priority: CasePriority;
  status: CaseStatus;
  // Customer 360
  customerId: string;
  customerName: string;
  companyName: string;
  customerPhone: string;
  customerEmail: string;
  lifetimeValue: number;
  openInvoicesCount: number;
  // Assignment
  assignedTeam: string;
  assignedAgentName: string;
  assignedAiPersona: string;
  // SLA Architecture
  slaPolicy: string;
  firstResponseRemaining: string;
  firstResponsePassed: boolean;
  resolutionRemaining: string;
  slaStatus: SlaStatus;
  // Escalation
  isEscalated: boolean;
  escalatedToSupervisor?: string;
  escalationReason?: string;
  // Resolution
  resolutionSummary?: string;
  rootCauseCategory?: string;
  csatScore?: number; // 1-5
  // Omnichannel Connections
  channelSource: "whatsapp" | "phone" | "portal" | "email";
  whatsappSessionId?: string;
  linkedCallId?: string;
  linkedCallSid?: string;
  linkedInvoiceId?: string;
  linkedWorkflowExecutionId?: string;
  // Nested Data
  messages: CaseMessage[];
  notes: CaseInternalNote[];
  attachments: CaseAttachment[];
  auditEvents: CaseAuditEvent[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Initial Mock Support Cases Data
// ============================================================================

const INITIAL_SUPPORT_CASES: SupportCaseItem[] = [
  {
    id: "case-101",
    caseNumber: "CAS-2026-0042",
    subject: "Dispute regarding unapplied $1,200 discount voucher on Invoice INV-2026-089",
    description:
      "Customer states that an authorized promotional credit voucher VOUCH-1200 was not applied before the final invoice was dispatched. Requesting manual invoice credit or refund.",
    category: "billing_dispute",
    priority: "high",
    status: "in_progress",
    customerId: "cust-201",
    customerName: "David Miller",
    companyName: "Vanguard Logistics LLC",
    customerPhone: "+1 (312) 555-8492",
    customerEmail: "d.miller@vanguard.logistics",
    lifetimeValue: 98000,
    openInvoicesCount: 1,
    assignedTeam: "Billing Operations",
    assignedAgentName: "Elena Chen",
    assignedAiPersona: "Rachel (AI Support Copilot)",
    slaPolicy: "Enterprise Gold (1h FRT / 8h Resolution)",
    firstResponseRemaining: "Responded (12m FRT)",
    firstResponsePassed: true,
    resolutionRemaining: "4h 22m remaining",
    slaStatus: "within_sla",
    isEscalated: false,
    channelSource: "whatsapp",
    whatsappSessionId: "wa_sess_99182",
    linkedCallSid: "CA8a91b2c3d4e5f60718293a4b5c6d7e",
    linkedInvoiceId: "INV-2026-089",
    linkedWorkflowExecutionId: "wf-exec-billing-credit-771",
    messages: [
      {
        id: "msg-1",
        senderType: "customer",
        senderName: "David Miller",
        channel: "whatsapp",
        content:
          "Hi team, on our latest invoice INV-2026-089, the $1,200 promotional voucher wasn't deducted. Can someone verify this before we release the wire transfer?",
        timestamp: "10:14 AM",
        externalMessageId: "wamid.HBc817260",
      },
      {
        id: "msg-2",
        senderType: "ai_copilot",
        senderName: "Rachel (AI Support Copilot)",
        channel: "whatsapp",
        content:
          "Hello David! Thank you for reaching out. I have created case CAS-2026-0042 and verified voucher VOUCH-1200 with our billing team. Elena Chen is reviewing the adjustment.",
        timestamp: "10:16 AM",
      },
      {
        id: "msg-3",
        senderType: "agent",
        senderName: "Elena Chen",
        channel: "portal",
        content:
          "Hi David, I have verified the voucher approval. We are issuing credit memo CM-2026-004 to adjust your net balance to $11,200.",
        timestamp: "10:28 AM",
      },
    ],
    notes: [
      {
        id: "note-1",
        authorName: "Elena Chen",
        noteText:
          "Customer is in active dunning cycle for INV-2026-089. Applying the $1,200 credit memo will allow immediate wire clearance per phone agreement.",
        isPinned: true,
        timestamp: "10:25 AM",
      },
    ],
    attachments: [
      {
        id: "att-1",
        fileName: "voucher_approval_vouch1200.pdf",
        fileSizeBytes: 245000,
        mimeType: "application/pdf",
        storageUri: "gs://nexus-tenant-assets/2026/09/vouch1200.pdf",
        uploaderName: "David Miller (WhatsApp Inbound)",
        uploadedAt: "10:14 AM",
      },
      {
        id: "att-2",
        fileName: "INV-2026-089_disputed_invoice.pdf",
        fileSizeBytes: 184000,
        mimeType: "application/pdf",
        storageUri: "gs://nexus-tenant-assets/2026/09/inv-2026-089.pdf",
        uploaderName: "Nexus Billing System",
        uploadedAt: "10:15 AM",
      },
    ],
    auditEvents: [
      {
        id: "aud-1",
        timestamp: "10:14:02",
        eventType: "case_created",
        actorName: "Rachel (AI WhatsApp Agent)",
        actorType: "ai_copilot",
        details: "Auto-created from inbound WhatsApp conversation with Vanguard Logistics",
      },
      {
        id: "aud-2",
        timestamp: "10:16:00",
        eventType: "sla_started",
        actorName: "SLA Policy Engine",
        actorType: "system",
        details: "Applied policy 'Enterprise Gold': First response SLA satisfied in 12m",
      },
      {
        id: "aud-3",
        timestamp: "10:25:00",
        eventType: "assigned",
        actorName: "ACD Triage Router",
        actorType: "system",
        details: "Assigned to Elena Chen (Billing Operations)",
      },
    ],
    createdAt: "Today, 10:14 AM",
    updatedAt: "Today, 10:28 AM",
  },
  {
    id: "case-102",
    caseNumber: "CAS-2026-0043",
    subject: "Batch inventory sync webhooks returning 429 rate limit exceptions",
    description:
      "Customer warehouse dispatch operations halted due to sudden webhook drop. Inbound telemetry shows burst of 2,400 requests/min against default 1,000 limit.",
    category: "service_outage",
    priority: "urgent",
    status: "escalated",
    customerId: "cust-305",
    customerName: "Elena Rostova",
    companyName: "Apex Cloud Innovations",
    customerPhone: "+1 (206) 555-4411",
    customerEmail: "e.rostova@apexcloud.io",
    lifetimeValue: 220000,
    openInvoicesCount: 0,
    assignedTeam: "Tier 3 Platform Engineering",
    assignedAgentName: "Marcus Vance",
    assignedAiPersona: "Nicole (AI Specialist)",
    slaPolicy: "Mission Critical (15m FRT / 2h Resolution)",
    firstResponseRemaining: "Responded (4m FRT)",
    firstResponsePassed: true,
    resolutionRemaining: "48m remaining",
    slaStatus: "at_risk",
    isEscalated: true,
    escalatedToSupervisor: "Marcus Vance (Tier 3 Lead)",
    escalationReason: "Critical warehouse dispatch outage & negative customer sentiment (-0.68)",
    channelSource: "phone",
    linkedCallSid: "CA112233445566778899aabbccddeeff",
    linkedWorkflowExecutionId: "wf-exec-auto-burst-limit-902",
    messages: [
      {
        id: "msg-4",
        senderType: "customer",
        senderName: "Elena Rostova",
        channel: "phone_transcript",
        content:
          "Our entire warehouse dispatch halted because your API started dropping all our inventory sync webhooks 20 minutes ago! I need a senior engineer immediately.",
        timestamp: "11:45 AM",
      },
      {
        id: "msg-5",
        senderType: "ai_copilot",
        senderName: "Nicole (AI Specialist)",
        channel: "phone_transcript",
        content:
          "I completely recognize the urgency Elena. I am seeing 429 rate limit triggers in your telemetry. I am performing an immediate warm transfer to our Tier-3 Platform Supervisor Marcus Vance right now.",
        timestamp: "11:46 AM",
      },
      {
        id: "msg-6",
        senderType: "supervisor",
        senderName: "Marcus Vance",
        channel: "portal",
        content:
          "Elena, I have temporarily raised your tenant burst allowance to 3,500 req/min. The webhook backlog is clearing now.",
        timestamp: "11:58 AM",
      },
    ],
    notes: [
      {
        id: "note-2",
        authorName: "Marcus Vance",
        noteText:
          "Cloud Armor policy burst cap increased for Tenant Apex Cloud. Review permanent architectural rate limit allocation before contract renewal.",
        isPinned: true,
        timestamp: "11:55 AM",
      },
    ],
    attachments: [
      {
        id: "att-3",
        fileName: "cloud_armor_telemetry_burst_429.csv",
        fileSizeBytes: 412000,
        mimeType: "text/csv",
        storageUri: "gs://nexus-tenant-assets/2026/09/burst_429.csv",
        uploaderName: "Nexus Telemetry Daemon",
        uploadedAt: "11:46 AM",
      },
    ],
    auditEvents: [
      {
        id: "aud-4",
        timestamp: "11:45:00",
        eventType: "case_created",
        actorName: "Nicole (AI Voice Agent)",
        actorType: "ai_copilot",
        details: "Auto-filed during active telephony call CA112233...",
      },
      {
        id: "aud-5",
        timestamp: "11:46:10",
        eventType: "escalated",
        actorName: "Nicole (AI Voice Agent)",
        actorType: "ai_copilot",
        details: "Warm escalated to Supervisor Marcus Vance due to high negative sentiment (-0.68)",
      },
    ],
    createdAt: "Today, 11:45 AM",
    updatedAt: "Today, 11:58 AM",
  },
  {
    id: "case-103",
    caseNumber: "CAS-2026-0044",
    subject: "Request for technical onboarding architecture review for 75 field technician seats",
    description:
      "Customer inquiring about custom Salesforce two-way inventory sync and offline mobile dispatch workflows.",
    category: "onboarding",
    priority: "medium",
    status: "open",
    customerId: "cust-101",
    customerName: "Sarah Jenkins",
    companyName: "Acme Global Solutions",
    customerPhone: "+1 (415) 555-2671",
    customerEmail: "s.jenkins@acmeglobal.com",
    lifetimeValue: 145000,
    openInvoicesCount: 0,
    assignedTeam: "Commercial Solutions",
    assignedAgentName: "Elena Chen",
    assignedAiPersona: "Rachel (AI Solutions Advisor)",
    slaPolicy: "Enterprise Standard (4h FRT / 24h Resolution)",
    firstResponseRemaining: "1h 45m remaining",
    firstResponsePassed: false,
    resolutionRemaining: "21h 30m remaining",
    slaStatus: "within_sla",
    isEscalated: false,
    channelSource: "portal",
    linkedCallSid: "CA8a91b2c3d4e5f60718293a4b5c6d7e",
    messages: [
      {
        id: "msg-7",
        senderType: "customer",
        senderName: "Sarah Jenkins",
        channel: "portal",
        content:
          "Hi, following our conversation with Danielle earlier today, we would like to schedule our technical architecture session for Thursday at 2 PM EST.",
        timestamp: "12:15 PM",
      },
    ],
    notes: [],
    attachments: [],
    auditEvents: [
      {
        id: "aud-6",
        timestamp: "12:15:00",
        eventType: "case_created",
        actorName: "Sarah Jenkins",
        actorType: "customer",
        details: "Created via customer self-service portal",
      },
    ],
    createdAt: "Today, 12:15 PM",
    updatedAt: "Today, 12:15 PM",
  },
];

export default function SupportConsolePage() {
  const [cases, setCases] = useState<SupportCaseItem[]>(INITIAL_SUPPORT_CASES);
  const [selectedCase, setSelectedCase] = useState<SupportCaseItem | null>(INITIAL_SUPPORT_CASES[0]);

  // Tab navigation inside drawer
  const [drawerTab, setDrawerTab] = useState<"conversations" | "copilot" | "notes" | "attachments" | "connections" | "audit">("conversations");

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Composer State
  const [composerMode, setComposerMode] = useState<"reply" | "note">("reply");
  const [replyText, setReplyText] = useState("");
  const [replyChannel, setReplyChannel] = useState<"portal" | "whatsapp">("whatsapp");

  // Escalation Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateSupervisor, setEscalateSupervisor] = useState("Marcus Vance (Tier 3 Lead)");
  const [escalateReason, setEscalateReason] = useState("High complexity technical issue requiring Tier-3 architectural intervention.");

  // Resolution Modal
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveSummary, setResolveSummary] = useState("Issue investigated and resolved per operational guidelines.");
  const [rootCause, setRootCause] = useState("billing_adjustment");
  const [csatRating, setCsatRating] = useState(5);

  // Filtered Cases
  const filteredCases = cases.filter((c) => {
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesPriority = filterPriority === "all" || c.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || c.category === filterCategory;
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  // Handle Send Message or Internal Note
  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedCase) return;

    if (composerMode === "reply") {
      const newMsg: CaseMessage = {
        id: `msg-${Date.now()}`,
        senderType: "agent",
        senderName: "Support Agent",
        channel: replyChannel,
        content: replyText,
        timestamp: "Just now",
      };

      const updatedCase: SupportCaseItem = {
        ...selectedCase,
        status: selectedCase.status === "open" ? "in_progress" : selectedCase.status,
        messages: [...selectedCase.messages, newMsg],
        updatedAt: "Just now",
      };

      setSelectedCase(updatedCase);
      setCases(cases.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    } else {
      const newNote: CaseInternalNote = {
        id: `note-${Date.now()}`,
        authorName: "Support Agent",
        noteText: replyText,
        isPinned: false,
        timestamp: "Just now",
      };

      const updatedCase: SupportCaseItem = {
        ...selectedCase,
        notes: [newNote, ...selectedCase.notes],
        updatedAt: "Just now",
      };

      setSelectedCase(updatedCase);
      setCases(cases.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    }

    setReplyText("");
  };

  // Handle Confirm Escalation
  const handleConfirmEscalation = () => {
    if (!selectedCase) return;
    const newAudit: CaseAuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType: "escalated",
      actorName: "Support Staff",
      actorType: "agent",
      details: `Escalated to ${escalateSupervisor}: "${escalateReason}"`,
    };

    const updatedCase: SupportCaseItem = {
      ...selectedCase,
      status: "escalated",
      priority: "urgent",
      isEscalated: true,
      escalatedToSupervisor: escalateSupervisor,
      escalationReason: escalateReason,
      auditEvents: [...selectedCase.auditEvents, newAudit],
      updatedAt: "Just now",
    };

    setSelectedCase(updatedCase);
    setCases(cases.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    setShowEscalateModal(false);
  };

  // Handle Confirm Resolution
  const handleConfirmResolution = () => {
    if (!selectedCase) return;
    const newAudit: CaseAuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType: "resolved",
      actorName: "Support Staff",
      actorType: "agent",
      details: `Resolved with root cause '${rootCause}'. CSAT: ${csatRating}/5`,
    };

    const updatedCase: SupportCaseItem = {
      ...selectedCase,
      status: "resolved",
      resolutionSummary: resolveSummary,
      rootCauseCategory: rootCause,
      csatScore: csatRating,
      auditEvents: [...selectedCase.auditEvents, newAudit],
      updatedAt: "Just now",
    };

    setSelectedCase(updatedCase);
    setCases(cases.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    setShowResolveModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">Customer Support Command Center</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SLA Engine Active
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Omnichannel case management connected to Customer 360, WhatsApp, Telephony Calls, Documents, Workflows, and AI Copilots.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/call-center"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            Call Center Console
          </Link>
          <Link
            href="/whatsapp"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/40 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp Inbox
          </Link>
        </div>
      </div>

      {/* Support Analytics & KPI Ribbon (5 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Open Cases</span>
            <LifeBuoy className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">18</div>
          <span className="text-[11px] text-slate-500">12 In Progress • 6 Unassigned</span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Urgent / Escalated</span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-400">4</div>
          <span className="text-[11px] text-red-400/80">Immediate Supervisor Attention</span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg First Response</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">18 mins</div>
          <span className="text-[11px] text-emerald-400 font-medium">Faster than 1h SLA</span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">SLA Compliance Rate</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">97.4%</div>
          <span className="text-[11px] text-slate-500">Target &gt; 95.0%</span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Customer CSAT</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">4.8 / 5.0</div>
          <span className="text-[11px] text-emerald-400 font-medium">+0.3 vs last month</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases, customer, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories</option>
              <option value="billing_dispute">Billing Dispute</option>
              <option value="service_outage">Service Outage</option>
              <option value="technical_bug">Technical Bug</option>
              <option value="onboarding">Onboarding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Cases List (6 cols), Right = Case Detail Drawer (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases Table Area (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Case & Customer</th>
                    <th className="px-3 py-3">Channel</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">SLA Status</th>
                    <th className="px-3 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCases.map((c) => {
                    const isSelected = selectedCase?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-cyan-950/30 border-l-2 border-cyan-500" : "hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="font-mono text-cyan-400">{c.caseNumber}</span>
                          </div>
                          <div className="text-slate-300 font-medium truncate max-w-xs mt-0.5">{c.subject}</div>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <span>{c.customerName}</span> • <span className="text-slate-500">{c.companyName}</span>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              c.channelSource === "whatsapp"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : c.channelSource === "phone"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {c.channelSource === "whatsapp" ? (
                              <MessageCircle className="h-3 w-3" />
                            ) : c.channelSource === "phone" ? (
                              <Phone className="h-3 w-3" />
                            ) : (
                              <MessageSquare className="h-3 w-3" />
                            )}
                            {c.channelSource}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.priority === "urgent"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : c.priority === "high"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {c.priority}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-mono text-[11px] text-slate-300">{c.resolutionRemaining}</div>
                          <span
                            className={`inline-block text-[10px] font-medium mt-0.5 ${
                              c.slaStatus === "within_sla"
                                ? "text-emerald-400"
                                : c.slaStatus === "at_risk"
                                ? "text-amber-400"
                                : "text-red-400 font-bold"
                            }`}
                          >
                            {c.slaStatus === "within_sla" ? "● In SLA" : c.slaStatus === "at_risk" ? "▲ At Risk" : "✕ Breached"}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              c.status === "resolved"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : c.status === "escalated"
                                ? "bg-red-500/20 text-red-400 font-bold animate-pulse"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {c.status.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Case Detail Comprehensive Drawer (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {selectedCase ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5 sticky top-4 max-h-[85vh] overflow-y-auto">
              {/* Header: Case #, Priority, SLA Countdown */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{selectedCase.caseNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedCase.priority === "urgent"
                          ? "bg-red-500 text-white"
                          : selectedCase.priority === "high"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {selectedCase.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 capitalize">
                      {selectedCase.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">{selectedCase.subject}</h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Assigned: <strong className="text-slate-200">{selectedCase.assignedAgentName}</strong> (
                    {selectedCase.assignedTeam})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCase.status !== "resolved" && (
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                    >
                      Resolve Case
                    </button>
                  )}
                  {!selectedCase.isEscalated && selectedCase.status !== "resolved" && (
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold border border-red-500/30 transition-colors"
                    >
                      Escalate
                    </button>
                  )}
                </div>
              </div>

              {/* Customer 360 Ribbon */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {selectedCase.customerName}
                      <span className="text-[10px] font-mono text-purple-400">
                        LTV: ${(selectedCase.lifetimeValue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {selectedCase.companyName} • {selectedCase.customerPhone}
                    </div>
                  </div>
                </div>

                <Link
                  href="/customers"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  Customer 360 <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* SLA Target Progress Strip */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-purple-400" />
                    SLA Countdown: {selectedCase.slaPolicy}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      selectedCase.slaStatus === "within_sla" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {selectedCase.resolutionRemaining}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>First Response: {selectedCase.firstResponseRemaining}</span>
                  <span className="text-emerald-400">✓ SLA Maintained</span>
                </div>
              </div>

              {/* Cross-System Omnichannel Connections Card */}
              <div className="p-3.5 rounded-lg bg-gradient-to-r from-purple-950/20 to-slate-950 border border-purple-500/30 space-y-2 text-xs">
                <span className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Active Cross-System Connections
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {selectedCase.linkedCallSid && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <PhoneCall className="h-3 w-3 text-purple-400" /> Telephony Call
                      </span>
                      <div className="font-mono text-slate-200 mt-0.5 truncate">{selectedCase.linkedCallSid}</div>
                      <Link href="/call-center" className="text-purple-400 hover:text-purple-300 text-[10px]">
                        Inspect Call Audio →
                      </Link>
                    </div>
                  )}

                  {selectedCase.whatsappSessionId && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <MessageCircle className="h-3 w-3 text-emerald-400" /> WhatsApp Thread
                      </span>
                      <div className="font-mono text-slate-200 mt-0.5 truncate">{selectedCase.whatsappSessionId}</div>
                      <Link href="/whatsapp" className="text-emerald-400 hover:text-emerald-300 text-[10px]">
                        Open WhatsApp Chat →
                      </Link>
                    </div>
                  )}

                  {selectedCase.linkedInvoiceId && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <CreditCard className="h-3 w-3 text-blue-400" /> Linked Invoice
                      </span>
                      <div className="font-mono text-slate-200 mt-0.5 truncate">{selectedCase.linkedInvoiceId}</div>
                      <Link href="/invoices" className="text-blue-400 hover:text-blue-300 text-[10px]">
                        View ERP Invoice →
                      </Link>
                    </div>
                  )}

                  {selectedCase.linkedWorkflowExecutionId && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <GitBranch className="h-3 w-3 text-indigo-400" /> Automated Workflow
                      </span>
                      <div className="font-mono text-slate-200 mt-0.5 truncate">{selectedCase.linkedWorkflowExecutionId}</div>
                      <Link href="/workflows" className="text-indigo-400 hover:text-indigo-300 text-[10px]">
                        Workflow Execution →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Tabs: Conversations, AI Copilot, Internal Notes, Attachments, Audit */}
              <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto text-xs">
                <button
                  onClick={() => setDrawerTab("conversations")}
                  className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    drawerTab === "conversations"
                      ? "border-cyan-500 text-cyan-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Messages ({selectedCase.messages.length})
                </button>

                <button
                  onClick={() => setDrawerTab("copilot")}
                  className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
                    drawerTab === "copilot"
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  AI Copilot
                </button>

                <button
                  onClick={() => setDrawerTab("notes")}
                  className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    drawerTab === "notes"
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Staff Notes ({selectedCase.notes.length})
                </button>

                <button
                  onClick={() => setDrawerTab("attachments")}
                  className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    drawerTab === "attachments"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Files ({selectedCase.attachments.length})
                </button>

                <button
                  onClick={() => setDrawerTab("audit")}
                  className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    drawerTab === "audit"
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Audit Trail ({selectedCase.auditEvents.length})
                </button>
              </div>

              {/* TAB 1: Omnichannel Conversations */}
              {drawerTab === "conversations" && (
                <div className="space-y-3">
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {selectedCase.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg text-xs space-y-1 ${
                          m.senderType === "customer"
                            ? "bg-slate-950 border border-slate-800 text-slate-300"
                            : m.senderType === "ai_copilot"
                            ? "bg-purple-950/20 border border-purple-500/20 text-purple-200"
                            : "bg-blue-950/20 border border-blue-500/20 text-blue-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold uppercase tracking-wider">{m.senderName}</span>
                          <span className="font-mono flex items-center gap-1">
                            {m.channel === "whatsapp" && <MessageCircle className="h-2.5 w-2.5 text-emerald-400" />}
                            {m.timestamp}
                          </span>
                        </div>
                        <p className="leading-relaxed">{m.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Message / Note Composer */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setComposerMode("reply")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            composerMode === "reply"
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          Public Reply
                        </button>
                        <button
                          onClick={() => setComposerMode("note")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            composerMode === "note"
                              ? "bg-amber-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          Staff Note (Private)
                        </button>
                      </div>

                      {composerMode === "reply" && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <span>Channel:</span>
                          <select
                            value={replyChannel}
                            onChange={(e) => setReplyChannel(e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white"
                          >
                            <option value="whatsapp">WhatsApp</option>
                            <option value="portal">Customer Portal</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={
                          composerMode === "reply"
                            ? `Type response to customer via ${replyChannel}...`
                            : "Type internal note invisible to customer..."
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!replyText.trim()}
                        className="absolute right-2.5 bottom-3 p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI Copilot Assistant */}
              {drawerTab === "copilot" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-2">
                    <span className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Copilot Triage Suggestion
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      AI identified issue as <strong className="text-white">Billing Voucher Application</strong>.
                      Verified voucher VOUCH-1200 is valid in ERP database with active expiration date.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider">
                      Suggested Autonomous Actions:
                    </span>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setReplyText(
                            "Hi David, we have verified voucher VOUCH-1200 and dispatched credit memo CM-2026-004 adjusting your net payable balance to $11,200. Please release the wire transfer at your earliest convenience."
                          );
                          setDrawerTab("conversations");
                        }}
                        className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left text-purple-300 font-medium transition-colors flex items-center justify-between"
                      >
                        <span>Insert AI-Drafted Response for Voucher Credit</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Staff Notes */}
              {drawerTab === "notes" && (
                <div className="space-y-2.5 text-xs">
                  {selectedCase.notes.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-amber-300">{n.authorName}</span>
                        <span className="font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-200">{n.noteText}</p>
                    </div>
                  ))}
                  {selectedCase.notes.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No staff notes recorded for this case.</div>
                  )}
                </div>
              )}

              {/* TAB 4: Attachments */}
              {drawerTab === "attachments" && (
                <div className="space-y-2 text-xs">
                  {selectedCase.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-white truncate max-w-xs">{a.fileName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {(a.fileSizeBytes / 1000).toFixed(0)} KB • {a.uploaderName}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">GCS Stored</span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: Audit Trail */}
              {drawerTab === "audit" && (
                <div className="space-y-1.5 text-xs">
                  {selectedCase.auditEvents.map((aud) => (
                    <div key={aud.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 font-semibold">{aud.eventType}</span>
                        <span className="font-mono text-slate-500 text-[10px]">{aud.timestamp}</span>
                      </div>
                      <div className="text-slate-400">
                        Actor: <strong className="text-slate-300">{aud.actorName}</strong> ({aud.actorType})
                      </div>
                      <div className="text-slate-500 text-[10px]">{aud.details}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
              Select a support case from the list to view conversations, SLA targets, and omnichannel context.
            </div>
          )}
        </div>
      </div>

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-red-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Supervisor Warm Escalation
              </h3>
              <button onClick={() => setShowEscalateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Target Supervisor</label>
                <select
                  value={escalateSupervisor}
                  onChange={(e) => setEscalateSupervisor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  <option value="Marcus Vance (Tier 3 Lead)">Marcus Vance (Tier 3 Platform Lead)</option>
                  <option value="Elena Chen (Billing Lead)">Elena Chen (Billing Operations Lead)</option>
                  <option value="Sarah Connor (Incident Director)">Sarah Connor (Incident Director)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Escalation Justification</label>
                <textarea
                  rows={3}
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEscalation}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Execute Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-emerald-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Resolve Support Case
              </h3>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Root Cause Category</label>
                <select
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  <option value="billing_adjustment">Billing Adjustment Issued</option>
                  <option value="rate_limit_raised">API Rate Limit Raised</option>
                  <option value="software_bug_hotfixed">Software Bug Hotfixed</option>
                  <option value="customer_guidance_provided">Customer Guidance Provided</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Resolution Summary</label>
                <textarea
                  rows={3}
                  value={resolveSummary}
                  onChange={(e) => setResolveSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Customer CSAT Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCsatRating(star)}
                      className={`p-1.5 rounded transition-colors ${
                        star <= csatRating ? "text-amber-400" : "text-slate-600"
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                  <span className="font-mono text-white ml-2">{csatRating} / 5 Stars</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
