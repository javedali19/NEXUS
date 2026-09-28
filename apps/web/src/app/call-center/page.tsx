"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Headphones,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneForwarded,
  Play,
  Pause,
  Volume2,
  Clock,
  Calendar,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  CreditCard,
  Lock,
  Activity,
  Sparkles,
  Filter,
  Search,
  Building,
  Check,
  Layers,
  FileText,
  History,
  Globe,
  Flame,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  LifeBuoy,
} from "lucide-react";

// ============================================================================
// Types & Domain Interfaces (18 Core Dimensions)
// ============================================================================

export type CallPriority = "urgent" | "high" | "medium" | "low";
export type CallStatus = "queued" | "ringing" | "in_progress" | "completed" | "failed" | "canceled";

export interface PromiseToPay {
  amount: number;
  currency: string;
  promisedDate: string;
  paymentMethod: "razorpay_link" | "ach_debit" | "wire_transfer";
  invoiceId: string;
  status: "pending_clearance" | "settled" | "breached";
}

export interface FollowUpAction {
  scheduledAt: string;
  channel: "whatsapp" | "sms" | "calendar_invite" | "callback";
  assignedAgent: string;
  notes: string;
}

export interface TranscriptTurn {
  speaker: "agent" | "customer";
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
}

export interface CallAuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  actorType: "system" | "ai_agent" | "supervisor" | "customer";
  actorName: string;
  details: string;
}

export interface CallCenterRecord {
  id: string;
  callSid: string;
  // 1. Call Queue
  queueSlug: "commercial_sales" | "collections_recovery" | "support_escalations" | "retention_renewals";
  queueName: string;
  // 2. Customer
  customerId: string;
  customerName: string;
  companyName: string;
  customerPhone: string;
  lifetimeValue: number;
  // 3. Purpose
  purpose: "collections_dunning" | "inbound_lead_qualification" | "contract_renewal" | "customer_support_dispute" | "onboarding_kickoff";
  // 4. Agent / Persona
  agentPersona: string;
  // 5. Language
  language: "en-US" | "es-ES" | "fr-FR" | "de-DE" | "hi-IN";
  // 6. Scheduled Time
  scheduledTime: string;
  queueWaitTimeSeconds: number;
  // 7. Outcome
  outcome?: "promise_to_pay_secured" | "qualified_opportunity_created" | "callback_scheduled" | "voicemail_left" | "wrong_number" | "dispute_ticket_opened" | "transferred_to_human_agent";
  // 8. Priority
  priority: CallPriority;
  // 9. Call Status
  status: CallStatus;
  direction: "inbound" | "outbound";
  durationSeconds: number;
  startedAt: string;
  // 10. Transcript
  transcripts: TranscriptTurn[];
  // 11. Summary
  executiveSummary: string;
  // 12. Sentiment / Intent
  sentimentScore: number; // -1.00 to +1.00
  intent: string;
  // 13. Promise-to-Pay
  promiseToPay?: PromiseToPay;
  // 14. Follow-Up
  followUp?: FollowUpAction;
  // 15. Recording Reference
  recordingSid?: string;
  storageUri?: string;
  retentionDaysLeft: number;
  // 16. Consent
  consentDisclosurePlayed: boolean;
  recordingConsentGranted: boolean;
  // 17. Calling-Window Status
  callingWindowStatus: "allowed" | "outside_hours" | "dnc_blocked";
  recipientLocalTime: string;
  // 18. Escalation
  escalation?: {
    triggerReason: string;
    priority: "standard" | "high" | "urgent";
    assignedSupervisor: string;
    targetQueue: string;
    handoffContext: string;
  };
  // 19. Audit Events
  auditEvents: CallAuditEvent[];
}

// ============================================================================
// Initial Mock Data (Rich multi-dimensional operational calls)
// ============================================================================

const INITIAL_CALL_CENTER_DATA: CallCenterRecord[] = [
  {
    id: "cc-1",
    callSid: "CA8a91b2c3d4e5f60718293a4b5c6d7e",
    queueSlug: "collections_recovery",
    queueName: "Collections & Recovery Tier 1",
    customerId: "cust-201",
    customerName: "David Miller",
    companyName: "Vanguard Logistics LLC",
    customerPhone: "+1 (312) 555-8492",
    lifetimeValue: 98000,
    purpose: "collections_dunning",
    agentPersona: "Adam (AI Recovery Lead)",
    language: "en-US",
    scheduledTime: "Today, 14:15 EST",
    queueWaitTimeSeconds: 14,
    outcome: "promise_to_pay_secured",
    priority: "urgent",
    status: "completed",
    direction: "outbound",
    durationSeconds: 198,
    startedAt: "18 mins ago",
    intent: "Payment Commitment for Past Due Invoice",
    sentimentScore: 0.42,
    executiveSummary:
      "Customer acknowledged past due balance ($12,400) resulting from recent controller departure. Committed to settle balance in full by this Friday via Razorpay checkout link.",
    promiseToPay: {
      amount: 12400,
      currency: "USD",
      promisedDate: "2026-09-25",
      paymentMethod: "razorpay_link",
      invoiceId: "INV-2026-089",
      status: "pending_clearance",
    },
    followUp: {
      scheduledAt: "Friday, 17:00 CST",
      channel: "whatsapp",
      assignedAgent: "Marcus Vance",
      notes: "Verify wire clearance; re-enable autonomous reminders if unconfirmed",
    },
    recordingSid: "RE99a8b7c6d5e4f3a2b1c09876543210f",
    storageUri: "gs://nexus-telephony-recordings/2026/09/call-cc-1.wav",
    retentionDaysLeft: 89,
    consentDisclosurePlayed: true,
    recordingConsentGranted: true,
    callingWindowStatus: "allowed",
    recipientLocalTime: "14:15 CST (Within TCPA 08:00 - 21:00)",
    transcripts: [
      {
        speaker: "agent",
        startMs: 0,
        endMs: 4800,
        text: "Hello David, this is Nexus Financial Services calling on a recorded line regarding Invoice INV-2026-089. May I speak with you for two minutes?",
        confidence: 0.99,
      },
      {
        speaker: "customer",
        startMs: 5000,
        endMs: 11200,
        text: "Hey, yes David here. We've been sorting out AP since our controller left last week.",
        confidence: 0.96,
      },
      {
        speaker: "agent",
        startMs: 11500,
        endMs: 19800,
        text: "Understood David, completely appreciate the transition. The outstanding balance is $12,400. We can dispatch a quick payment portal link right now.",
        confidence: 0.98,
      },
      {
        speaker: "customer",
        startMs: 20100,
        endMs: 26000,
        text: "Send it to my mobile and email. I'll execute the wire transfer by this Friday afternoon.",
        confidence: 0.97,
      },
    ],
    auditEvents: [
      {
        id: "aud-1",
        timestamp: "14:15:02",
        eventType: "call_queued",
        actorType: "system",
        actorName: "ACD Routing Engine",
        details: "Assigned to Collections & Recovery Tier 1 with priority 'urgent'",
      },
      {
        id: "aud-2",
        timestamp: "14:15:05",
        eventType: "consent_disclosed",
        actorType: "ai_agent",
        actorName: "Adam (AI Recovery Lead)",
        details: "Voice recording disclosure played and customer consent confirmed",
      },
      {
        id: "aud-3",
        timestamp: "14:16:30",
        eventType: "promise_to_pay_logged",
        actorType: "ai_agent",
        actorName: "Adam (AI Recovery Lead)",
        details: "Secured commitment: $12,400 USD by 2026-09-25 via Razorpay link",
      },
      {
        id: "aud-4",
        timestamp: "14:18:20",
        eventType: "call_completed",
        actorType: "system",
        actorName: "Twilio SIP Trunk",
        details: "Call completed successfully. Duration: 198s. Cost: $0.032 USD",
      },
    ],
  },
  {
    id: "cc-2",
    callSid: "CA8a91b2c3d4e5f60718293a4b5c6d7e",
    queueSlug: "commercial_sales",
    queueName: "Commercial Sales & Leads",
    customerId: "cust-101",
    customerName: "Sarah Jenkins",
    companyName: "Acme Global Solutions",
    customerPhone: "+1 (415) 555-2671",
    lifetimeValue: 145000,
    purpose: "inbound_lead_qualification",
    agentPersona: "Rachel (AI Solutions Advisor)",
    language: "en-US",
    scheduledTime: "Today, 14:02 EST",
    queueWaitTimeSeconds: 8,
    outcome: "qualified_opportunity_created",
    priority: "high",
    status: "completed",
    direction: "inbound",
    durationSeconds: 324,
    startedAt: "32 mins ago",
    intent: "Enterprise ERP Tier Expansion (75 Seats)",
    sentimentScore: 0.86,
    executiveSummary:
      "Customer inquired about enterprise ERP tier expansion for 75 additional field technicians before Q4 rollout. AI qualified budget ($50k+ ARR) and scheduled technical architecture deep dive for Thursday.",
    followUp: {
      scheduledAt: "Thursday, 14:00 EST",
      channel: "calendar_invite",
      assignedAgent: "Elena Chen",
      notes: "Technical architecture deep dive; Salesforce connector live demonstration",
    },
    recordingSid: "RE5f6e7d8c9b0a123456789abcdef012",
    storageUri: "gs://nexus-telephony-recordings/2026/09/call-cc-2.wav",
    retentionDaysLeft: 89,
    consentDisclosurePlayed: true,
    recordingConsentGranted: true,
    callingWindowStatus: "allowed",
    recipientLocalTime: "11:02 PST (Within TCPA 08:00 - 21:00)",
    transcripts: [
      {
        speaker: "agent",
        startMs: 0,
        endMs: 5200,
        text: "Thank you for calling Nexus Enterprise. This call is recorded for quality assurance. I'm Rachel, your AI solutions advisor. How can I help your business today?",
        confidence: 0.99,
      },
      {
        speaker: "customer",
        startMs: 5400,
        endMs: 14200,
        text: "Hi Rachel! We're currently expanding our field operations at Acme Global and need to add around 75 technician seats to our ERP system before November.",
        confidence: 0.98,
      },
    ],
    auditEvents: [
      {
        id: "aud-5",
        timestamp: "14:02:01",
        eventType: "call_queued",
        actorType: "system",
        actorName: "Inbound IVR Gateway",
        details: "Inbound call matched to customer 'Sarah Jenkins' (LTV: $145,000)",
      },
      {
        id: "aud-6",
        timestamp: "14:02:05",
        eventType: "ai_handshake",
        actorType: "ai_agent",
        actorName: "Rachel (AI Solutions Advisor)",
        details: "Connected full-duplex Deepgram STT and ElevenLabs turbo_v2_5 engine",
      },
      {
        id: "aud-7",
        timestamp: "14:07:25",
        eventType: "opportunity_created",
        actorType: "ai_agent",
        actorName: "Rachel (AI Solutions Advisor)",
        details: "Created CRM Deal: 'Acme Global - 75 Technician Seats Expansion' ($54,000 ARR)",
      },
    ],
  },
  {
    id: "cc-3",
    callSid: "CA112233445566778899aabbccddeeff",
    queueSlug: "support_escalations",
    queueName: "VIP Support & Escalation",
    customerId: "cust-305",
    customerName: "Elena Rostova",
    companyName: "Apex Cloud Innovations",
    customerPhone: "+1 (206) 555-4411",
    lifetimeValue: 220000,
    purpose: "customer_support_dispute",
    agentPersona: "Nicole (AI Specialist)",
    language: "en-US",
    scheduledTime: "Today, 13:45 EST",
    queueWaitTimeSeconds: 4,
    outcome: "transferred_to_human_agent",
    priority: "urgent",
    status: "completed",
    direction: "inbound",
    durationSeconds: 412,
    startedAt: "48 mins ago",
    intent: "Critical Production Webhook Rate-Limit Outage",
    sentimentScore: -0.68,
    executiveSummary:
      "Customer called distressed over batch inventory sync webhooks failing with 429 rate limit errors. AI detected negative sentiment threshold (-0.68) and performed warm transfer to Tier-3 Supervisor Marcus Vance.",
    escalation: {
      triggerReason: "Critical Webhook Rate Limit Disruption & High Negative Sentiment (-0.68)",
      priority: "urgent",
      assignedSupervisor: "Marcus Vance (Tier 3 Lead)",
      targetQueue: "Tier 3 Platform Engineering",
      handoffContext: "Tenant API burst limit hit 2,000 req/min during automated warehouse dispatch.",
    },
    followUp: {
      scheduledAt: "Today, 16:00 EST",
      channel: "callback",
      assignedAgent: "Marcus Vance",
      notes: "Post-incident review of adjusted rate limit threshold with Elena",
    },
    recordingSid: "RE4433221100aabbccddeeff99887766",
    storageUri: "gs://nexus-telephony-recordings/2026/09/call-cc-3.wav",
    retentionDaysLeft: 89,
    consentDisclosurePlayed: true,
    recordingConsentGranted: true,
    callingWindowStatus: "allowed",
    recipientLocalTime: "10:45 PST",
    transcripts: [
      {
        speaker: "agent",
        startMs: 0,
        endMs: 4200,
        text: "Nexus Technical Support, Nicole speaking on a recorded line. How can I assist you?",
        confidence: 0.99,
      },
      {
        speaker: "customer",
        startMs: 4400,
        endMs: 14100,
        text: "Our warehouse dispatch halted because your API started dropping all our inventory sync webhooks 20 minutes ago! I need a senior engineer immediately.",
        confidence: 0.98,
      },
    ],
    auditEvents: [
      {
        id: "aud-8",
        timestamp: "13:45:01",
        eventType: "call_queued",
        actorType: "system",
        actorName: "VIP Priority Router",
        details: "Assigned to VIP Support & Escalation (Queue Wait: 4s)",
      },
      {
        id: "aud-9",
        timestamp: "13:45:45",
        eventType: "sentiment_alert",
        actorType: "system",
        actorName: "Real-Time Sentiment Engine",
        details: "Detected negative sentiment spike (-0.68). Triggering supervisor warm transfer.",
      },
      {
        id: "aud-10",
        timestamp: "13:46:10",
        eventType: "warm_transfer_initiated",
        actorType: "ai_agent",
        actorName: "Nicole (AI Specialist)",
        details: "Transferred live WebRTC stream to Supervisor Marcus Vance with transcript context.",
      },
    ],
  },
  {
    id: "cc-4",
    callSid: "CA556677889900aabbccddeeff112233",
    queueSlug: "retention_renewals",
    queueName: "Retention & Renewals",
    customerId: "cust-408",
    customerName: "Carlos Mendez",
    companyName: "Solaria Clean Energy",
    customerPhone: "+34 91 123 4567",
    lifetimeValue: 72000,
    purpose: "contract_renewal",
    agentPersona: "Rachel (Multilingual AI)",
    language: "es-ES",
    scheduledTime: "Today, 15:30 CET",
    queueWaitTimeSeconds: 22,
    outcome: "callback_scheduled",
    priority: "medium",
    status: "queued",
    direction: "outbound",
    durationSeconds: 0,
    startedAt: "Scheduled",
    intent: "Annual Enterprise Contract Renewal with Co-Term Expansion",
    sentimentScore: 0.25,
    executiveSummary:
      "Scheduled outbound contract renewal discussion. Customer requested Spanish language interaction and pricing tier options for international subsidiaries.",
    followUp: {
      scheduledAt: "Today, 15:30 CET",
      channel: "callback",
      assignedAgent: "Rachel (Multilingual AI)",
      notes: "Review EU data residency SLA and co-term renewal terms",
    },
    retentionDaysLeft: 90,
    consentDisclosurePlayed: true,
    recordingConsentGranted: true,
    callingWindowStatus: "allowed",
    recipientLocalTime: "15:15 CET (Within EU regulations)",
    transcripts: [],
    auditEvents: [
      {
        id: "aud-11",
        timestamp: "12:00:00",
        eventType: "call_scheduled",
        actorType: "system",
        actorName: "Automated Renewal Engine",
        details: "Scheduled outbound renewal campaign slot. Language set to 'es-ES'.",
      },
    ],
  },
];

export default function CallCenterPage() {
  const [calls, setCalls] = useState<CallCenterRecord[]>(INITIAL_CALL_CENTER_DATA);
  const [selectedCall, setSelectedCall] = useState<CallCenterRecord | null>(INITIAL_CALL_CENTER_DATA[0]);

  // Filters
  const [selectedQueue, setSelectedQueue] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Audio Playback Simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(30);

  // New PTP Modal / Inline State
  const [isLoggingPtp, setIsLoggingPtp] = useState(false);
  const [ptpAmount, setPtpAmount] = useState("12400");
  const [ptpDate, setPtpDate] = useState("2026-09-25");

  // Audio playback ticker
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Filter logic
  const filteredCalls = calls.filter((c) => {
    const matchesQueue = selectedQueue === "all" || c.queueSlug === selectedQueue;
    const matchesPriority = selectedPriority === "all" || c.priority === selectedPriority;
    const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerPhone.includes(searchQuery) ||
      c.callSid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agentPersona.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQueue && matchesPriority && matchesStatus && matchesSearch;
  });

  const formatDuration = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSavePtp = () => {
    if (!selectedCall) return;
    const updatedPtp: PromiseToPay = {
      amount: parseFloat(ptpAmount) || 0,
      currency: "USD",
      promisedDate: ptpDate,
      paymentMethod: "razorpay_link",
      invoiceId: selectedCall.promiseToPay?.invoiceId || "INV-2026-089",
      status: "pending_clearance",
    };

    const newAudit: CallAuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType: "promise_to_pay_updated",
      actorType: "supervisor",
      actorName: "Marcus Vance",
      details: `Updated Promise-to-Pay: $${updatedPtp.amount} USD by ${updatedPtp.promisedDate}`,
    };

    const updatedCall = {
      ...selectedCall,
      outcome: "promise_to_pay_secured" as const,
      promiseToPay: updatedPtp,
      auditEvents: [...selectedCall.auditEvents, newAudit],
    };

    setSelectedCall(updatedCall);
    setCalls(calls.map((c) => (c.id === updatedCall.id ? updatedCall : c)));
    setIsLoggingPtp(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600/30 to-purple-600/20 border border-blue-500/30 text-blue-400">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">Call Center Operations Console</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  4 Queues Active
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Unified live console covering all 18 dimensions: call queues, customer 360, sentiment, STT transcripts, promise-to-pay, TCPA compliance, and audit logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/voice-calls"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            Softphone & Ledger
          </Link>

          <Link
            href="/voice-agent"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium border border-purple-500/40 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            Voice-Agent Pipeline
          </Link>

          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/40 transition-colors"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Support Console
          </Link>
        </div>
      </div>

      {/* 4 Routing Queues Live Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            name: "Commercial Sales",
            slug: "commercial_sales",
            activeCalls: 3,
            waitSec: 8,
            sla: "98% (SLA < 30s)",
            color: "text-purple-400",
            border: "border-purple-500/30",
          },
          {
            name: "Collections Recovery Tier 1",
            slug: "collections_recovery",
            activeCalls: 2,
            waitSec: 14,
            sla: "100% PTP Logged",
            color: "text-red-400",
            border: "border-red-500/30",
          },
          {
            name: "VIP Support & Escalation",
            slug: "support_escalations",
            activeCalls: 1,
            waitSec: 4,
            sla: "Human Transfer Ready",
            color: "text-amber-400",
            border: "border-amber-500/30",
          },
          {
            name: "Retention & Renewals",
            slug: "retention_renewals",
            activeCalls: 1,
            waitSec: 22,
            sla: "Multilingual EU/US",
            color: "text-blue-400",
            border: "border-blue-500/30",
          },
        ].map((q) => (
          <div
            key={q.slug}
            onClick={() => setSelectedQueue(selectedQueue === q.slug ? "all" : q.slug)}
            className={`p-4 rounded-xl border bg-slate-900 cursor-pointer transition-all ${
              selectedQueue === q.slug ? `ring-2 ring-purple-500 ${q.border}` : "border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{q.name}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">{q.activeCalls}</span>
              <span className="text-xs font-mono text-slate-400">Wait: {q.waitSec}s</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">{q.sla}</div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, company, agent, SID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {(selectedQueue !== "all" || selectedPriority !== "all" || selectedStatus !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedQueue("all");
                setSelectedPriority("all");
                setSelectedStatus("all");
                setSearchQuery("");
              }}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Calls Table (7 cols), Right = 18-Dimension Detail Drawer (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calls Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Customer & Queue</th>
                    <th className="px-3 py-3">Agent & Lang</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">PTP / Outcome</th>
                    <th className="px-3 py-3">TCPA Window</th>
                    <th className="px-3 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCalls.map((call) => {
                    const isSelected = selectedCall?.id === call.id;
                    return (
                      <tr
                        key={call.id}
                        onClick={() => setSelectedCall(call)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-purple-950/30 border-l-2 border-purple-500" : "hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {call.customerName}
                            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                              LTV: ${(call.lifetimeValue / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{call.companyName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <span>{call.queueName}</span> • <span>Wait: {call.queueWaitTimeSeconds}s</span>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="text-slate-300 font-medium">{call.agentPersona}</div>
                          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                            <Globe className="h-3 w-3 text-slate-400" />
                            {call.language}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              call.priority === "urgent"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : call.priority === "high"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {call.priority}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          {call.promiseToPay ? (
                            <div className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {call.promiseToPay.amount.toLocaleString()}
                              <span className="text-[10px] text-slate-400">({call.promiseToPay.promisedDate})</span>
                            </div>
                          ) : call.outcome ? (
                            <div className="text-[11px] text-slate-300 capitalize">
                              {call.outcome.replace(/_/g, " ")}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">None logged</span>
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                              call.callingWindowStatus === "allowed"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {call.callingWindowStatus === "allowed" ? (
                              <ShieldCheck className="h-3 w-3" />
                            ) : (
                              <ShieldAlert className="h-3 w-3" />
                            )}
                            {call.callingWindowStatus === "allowed" ? "Cleared" : "Blocked"}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              call.status === "completed"
                                ? "bg-slate-800 text-slate-300"
                                : call.status === "in_progress"
                                ? "bg-emerald-500/20 text-emerald-400 animate-pulse"
                                : "bg-purple-500/20 text-purple-300"
                            }`}
                          >
                            {call.status.replace(/_/g, " ")}
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

        {/* 18-Dimension Detailed Call Intelligence Drawer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCall ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5 sticky top-4 max-h-[85vh] overflow-y-auto">
              {/* Header: Customer 360 & Priority */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{selectedCall.customerName}</h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedCall.priority === "urgent"
                          ? "bg-red-500 text-white"
                          : selectedCall.priority === "high"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {selectedCall.priority}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedCall.companyName} • <span className="font-mono text-slate-300">{selectedCall.customerPhone}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Queue: <strong className="text-purple-300">{selectedCall.queueName}</strong> • Wait:{" "}
                    {selectedCall.queueWaitTimeSeconds}s
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">{selectedCall.startedAt}</span>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    {formatDuration(selectedCall.durationSeconds)}
                  </div>
                </div>
              </div>

              {/* Dimension: Calling Window & Consent Strip */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3 text-purple-400" />
                    Calling Window (TCPA)
                  </span>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {selectedCall.callingWindowStatus === "allowed" ? "TCPA Cleared (08:00 - 21:00)" : "Restricted"}
                  </div>
                  <div className="text-[10px] text-slate-500">{selectedCall.recipientLocalTime}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="h-3 w-3 text-purple-400" />
                    Recording Consent
                  </span>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Disclosure Played & Granted
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Lang: {selectedCall.language}</div>
                </div>
              </div>

              {/* Dimension: Promise-to-Pay (PTP) Module */}
              <div className="p-3.5 rounded-lg bg-gradient-to-r from-emerald-950/20 to-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    Promise-to-Pay (PTP) Commitment
                  </span>
                  <button
                    onClick={() => setIsLoggingPtp(!isLoggingPtp)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                  >
                    {isLoggingPtp ? "Cancel" : "Update PTP"}
                  </button>
                </div>

                {isLoggingPtp ? (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Promised Amount ($)</label>
                        <input
                          type="number"
                          value={ptpAmount}
                          onChange={(e) => setPtpAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Commitment Date</label>
                        <input
                          type="date"
                          value={ptpDate}
                          onChange={(e) => setPtpDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSavePtp}
                      className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                    >
                      Save PTP Commitment
                    </button>
                  </div>
                ) : selectedCall.promiseToPay ? (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <div className="text-[11px] text-slate-400">Promised Amount:</div>
                      <div className="text-base font-bold font-mono text-emerald-400">
                        ${selectedCall.promiseToPay.amount.toLocaleString()} USD
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Inv: {selectedCall.promiseToPay.invoiceId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Due Date:</div>
                      <div className="text-sm font-bold font-mono text-white">
                        {selectedCall.promiseToPay.promisedDate}
                      </div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                        Razorpay Link Active
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No formal payment commitment recorded yet.</div>
                )}
              </div>

              {/* Dimension: Audio Recording & Reference */}
              {selectedCall.recordingSid && (
                <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Volume2 className="h-3.5 w-3.5 text-purple-400" />
                      Encrypted Audio Recording ({selectedCall.retentionDaysLeft}d Retention)
                    </span>
                    <span className="font-mono text-slate-400">{formatDuration(selectedCall.durationSeconds)}</span>
                  </div>

                  {/* Audio scrubber waveform simulation */}
                  <div className="flex items-center gap-1 h-6 px-2 bg-slate-900 rounded border border-slate-800 overflow-hidden">
                    {[20, 60, 85, 45, 90, 75, 30, 95, 40, 65, 80, 50, 20, 85, 90, 40, 60].map((h, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-full ${
                          idx / 17 <= playbackProgress / 100 ? "bg-purple-500" : "bg-slate-700"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                    >
                      {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {isPlayingAudio ? "Pause" : "Play Recording"}
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">SID: {selectedCall.recordingSid.substring(0, 14)}••</span>
                  </div>
                </div>
              )}

              {/* Dimension: AI Executive Summary & Sentiment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    AI Executive Summary
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Sentiment:</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        selectedCall.sentimentScore >= 0.5
                          ? "bg-emerald-500/20 text-emerald-300"
                          : selectedCall.sentimentScore >= 0
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {selectedCall.sentimentScore > 0 ? `+${selectedCall.sentimentScore}` : selectedCall.sentimentScore}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {selectedCall.executiveSummary}
                </p>

                {selectedCall.intent && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <span>Intent Classified:</span>
                    <span className="font-semibold text-purple-300 font-mono">{selectedCall.intent}</span>
                  </div>
                )}
              </div>

              {/* Dimension: Follow-Up Action */}
              {selectedCall.followUp && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      Follow-Up Scheduled
                    </span>
                    <span className="text-[10px] font-mono text-purple-400 capitalize">
                      {selectedCall.followUp.channel.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Target: <strong className="text-white">{selectedCall.followUp.scheduledAt}</strong> (Assigned:{" "}
                    {selectedCall.followUp.assignedAgent})
                  </div>
                  <p className="text-[11px] text-slate-400 italic">"{selectedCall.followUp.notes}"</p>
                </div>
              )}

              {/* Dimension: Escalation & Warm Transfer */}
              {selectedCall.escalation && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400 flex items-center gap-1.5">
                      <PhoneForwarded className="h-3.5 w-3.5" />
                      Supervisor Warm Transfer Handoff
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500 text-white">
                      {selectedCall.escalation.priority}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Transferred to: <strong className="text-white">{selectedCall.escalation.assignedSupervisor}</strong> (
                    {selectedCall.escalation.targetQueue})
                  </div>
                  <p className="text-[11px] text-slate-400">Context: {selectedCall.escalation.handoffContext}</p>
                </div>
              )}

              {/* Dimension: Speaker-Diarized Transcripts */}
              {selectedCall.transcripts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Diarized Transcript Turns</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Deepgram nova-2</span>
                  </span>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {selectedCall.transcripts.map((turn, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded text-xs space-y-1 ${
                          turn.speaker === "agent"
                            ? "bg-purple-950/20 border border-purple-500/20 text-slate-200"
                            : "bg-slate-950 border border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-purple-300 uppercase">
                            {turn.speaker === "agent" ? selectedCall.agentPersona : selectedCall.customerName}
                          </span>
                          <span className="font-mono">{formatDuration(Math.round(turn.startMs / 1000))}</span>
                        </div>
                        <p>{turn.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dimension: Append-Only Call Audit Events Ledger */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-purple-400" />
                  Append-Only Call Audit Trail ({selectedCall.auditEvents.length})
                </span>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedCall.auditEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-purple-400 font-semibold">{evt.eventType}</span>
                        <span className="font-mono text-slate-500 text-[10px]">{evt.timestamp}</span>
                      </div>
                      <div className="text-slate-400">
                        Actor: <strong className="text-slate-300">{evt.actorName}</strong> ({evt.actorType})
                      </div>
                      <div className="text-slate-500 text-[10px]">{evt.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
              Select an active or historical call to inspect all 18 operational dimensions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
