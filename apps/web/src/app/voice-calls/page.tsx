"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneOff,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Clock,
  Calendar,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Headphones,
  Radio,
  FileText,
  RefreshCw,
  Sliders,
  Search,
  Filter,
  ArrowUpRight,
  Lock,
  Activity,
  Check,
  Building,
  Info,
  ChevronRight,
  BadgeAlert,
  Layers,
} from "lucide-react";

// ============================================================================
// Types & Domain Interfaces
// ============================================================================

export type CallDirection = "inbound" | "outbound";
export type CallStatus = "queued" | "ringing" | "in_progress" | "completed" | "busy" | "no_answer" | "failed";
export type CallPurpose =
  | "collections_dunning"
  | "inbound_lead_qualification"
  | "contract_renewal"
  | "customer_support_dispute"
  | "onboarding_kickoff";

export type CallOutcome =
  | "promise_to_pay_secured"
  | "qualified_opportunity_created"
  | "callback_scheduled"
  | "voicemail_left"
  | "wrong_number"
  | "dispute_ticket_opened"
  | "transferred_to_human_agent";

export interface TranscriptTurn {
  speaker: "agent" | "customer";
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
}

export interface CallRecord {
  id: string;
  callSid: string;
  direction: CallDirection;
  fromNumber: string;
  toNumber: string;
  customerName: string;
  companyName: string;
  queueSlug: string;
  purpose: CallPurpose;
  status: CallStatus;
  outcome?: CallOutcome;
  durationSeconds: number;
  costUsd: number;
  startedAt: string;
  recordingSid?: string;
  storageUri?: string;
  sentimentScore: number; // -1.0 to +1.0
  executiveSummary: string;
  actionItems: string[];
  buyingSignals: string[];
  churnRisks: string[];
  consentDisclosurePlayed: boolean;
  dncVerified: boolean;
  transcripts: TranscriptTurn[];
  escalation?: {
    assignedSupervisor: string;
    targetQueue: string;
    priority: "standard" | "high" | "urgent";
    reason: string;
  };
}

export interface PhoneNumberItem {
  id: string;
  phoneNumber: string;
  friendlyName: string;
  countryCode: string;
  capabilities: string[];
  assignedQueue: string;
  status: "active" | "released" | "suspended";
}

export interface TelephonyQueueItem {
  id: string;
  name: string;
  slug: string;
  routingStrategy: "round_robin" | "skills_based" | "longest_idle";
  activeCalls: number;
  maxWaitSeconds: number;
  holdMusic: string;
  isActive: boolean;
}

// ============================================================================
// Initial Mock Data
// ============================================================================

const INITIAL_CALLS: CallRecord[] = [
  {
    id: "call-101",
    callSid: "CA8a91b2c3d4e5f60718293a4b5c6d7e",
    direction: "inbound",
    fromNumber: "+1 (415) 555-2671",
    toNumber: "+1 (800) 555-0199",
    customerName: "Sarah Jenkins",
    companyName: "Acme Global Solutions",
    queueSlug: "commercial_sales",
    purpose: "inbound_lead_qualification",
    status: "completed",
    outcome: "qualified_opportunity_created",
    durationSeconds: 324,
    costUsd: 0.054,
    startedAt: "10 mins ago",
    recordingSid: "RE5f6e7d8c9b0a123456789abcdef012",
    storageUri: "gs://nexus-telephony-recordings/2026/09/call-101.wav",
    sentimentScore: 0.86,
    executiveSummary:
      "Customer inquired about enterprise ERP tier expansion for 75 additional field technicians. AI qualified budget ($50k+ ARR) and verified timeline for Q4 rollout. Scheduled follow-up demonstration.",
    actionItems: [
      "Send formal multi-seat pricing proposal via email",
      "Schedule technical architecture deep dive for Thursday 2 PM EST",
      "Sync HubSpot deal record to Stage: Evaluation",
    ],
    buyingSignals: [
      "Immediate Q4 budget approved",
      "Dissatisfied with incumbent legacy ERP speed",
      "Need rapid deployment for 75 field technicians",
    ],
    churnRisks: [],
    consentDisclosurePlayed: true,
    dncVerified: true,
    transcripts: [
      {
        speaker: "agent",
        startMs: 0,
        endMs: 5200,
        text: "Thank you for calling Nexus Enterprise. This call is recorded for quality assurance. I'm Danielle, your AI solutions advisor. How can I help your business today?",
        confidence: 0.99,
      },
      {
        speaker: "customer",
        startMs: 5400,
        endMs: 14200,
        text: "Hi Danielle! We're currently expanding our field operations at Acme Global and need to add around 75 technician seats to our ERP system before November.",
        confidence: 0.98,
      },
      {
        speaker: "agent",
        startMs: 14500,
        endMs: 23100,
        text: "That's fantastic news, Sarah. Our field technician mobile dispatch module includes offline sync and automated work orders. Are you currently using a specific CRM integration?",
        confidence: 0.99,
      },
      {
        speaker: "customer",
        startMs: 23400,
        endMs: 31000,
        text: "Yes, we use Salesforce and require seamless two-way invoicing and inventory reconciliation.",
        confidence: 0.97,
      },
      {
        speaker: "agent",
        startMs: 31300,
        endMs: 42000,
        text: "Understood! Our native Salesforce connector handles continuous inventory sync. I have prepared a tier summary and scheduled our technical team for Thursday at 2:00 PM EST. Would that work?",
        confidence: 0.99,
      },
      {
        speaker: "customer",
        startMs: 42300,
        endMs: 46000,
        text: "That sounds perfect Danielle. Send over the calendar invite!",
        confidence: 0.98,
      },
    ],
  },
  {
    id: "call-102",
    callSid: "CA49b2c8d1e0f3a4b5c6d7e8f9a0b1c2",
    direction: "outbound",
    fromNumber: "+1 (800) 555-0199",
    toNumber: "+1 (312) 555-8492",
    customerName: "David Miller",
    companyName: "Vanguard Logistics LLC",
    queueSlug: "collections_recovery",
    purpose: "collections_dunning",
    status: "completed",
    outcome: "promise_to_pay_secured",
    durationSeconds: 198,
    costUsd: 0.033,
    startedAt: "38 mins ago",
    recordingSid: "RE99a8b7c6d5e4f3a2b1c09876543210f",
    storageUri: "gs://nexus-telephony-recordings/2026/09/call-102.wav",
    sentimentScore: 0.42,
    executiveSummary:
      "Outbound automated collections check on Invoice INV-2026-089 ($12,400, 18 days overdue). Customer acknowledged missing invoice due to controller transition. Secured payment commitment for Friday via Razorpay link.",
    actionItems: [
      "Send payment link via WhatsApp and email to d.miller@vanguard.logistics",
      "Pause autonomous dunning reminders until Friday 5:00 PM CST",
    ],
    buyingSignals: [],
    churnRisks: ["Recent leadership turnover in finance department"],
    consentDisclosurePlayed: true,
    dncVerified: true,
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
        text: "Understood David, completely understand the transition. The outstanding balance is $12,400. We can dispatch a quick payment portal link right now.",
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
  },
  {
    id: "call-103",
    callSid: "CA112233445566778899aabbccddeeff",
    direction: "inbound",
    fromNumber: "+1 (206) 555-4411",
    toNumber: "+1 (800) 555-0199",
    customerName: "Elena Rostova",
    companyName: "Apex Cloud Innovations",
    queueSlug: "support_escalations",
    purpose: "customer_support_dispute",
    status: "completed",
    outcome: "transferred_to_human_agent",
    durationSeconds: 412,
    costUsd: 0.068,
    startedAt: "1 hour ago",
    recordingSid: "RE4433221100aabbccddeeff99887766",
    storageUri: "gs://nexus-telephony-recordings/2026/09/call-103.wav",
    sentimentScore: -0.68,
    executiveSummary:
      "Customer called frustrated over recurring API webhook rate limits blocking batch sync. AI detected negative sentiment threshold (-0.68) and initiated warm transfer to Tier-3 Supervisor Marcus Vance with full live transcript context.",
    actionItems: [
      "Supervisor Marcus Vance took over live WebRTC bridge",
      "Adjust tenant API burst limit to 2,000 req/min pending review",
      "Open JIRA escalation ticket ENG-8491",
    ],
    buyingSignals: [],
    churnRisks: [
      "Threatened to freeze contract renewal if API stability is not addressed",
      "High negative sentiment (-0.68)",
    ],
    consentDisclosurePlayed: true,
    dncVerified: true,
    escalation: {
      assignedSupervisor: "Marcus Vance",
      targetQueue: "Tier 3 Platform Engineering",
      priority: "urgent",
      reason: "High Negative Sentiment (-0.68) & Critical Production Webhook Outage",
    },
    transcripts: [
      {
        speaker: "agent",
        startMs: 0,
        endMs: 4200,
        text: "Nexus Technical Support, Danielle speaking on a recorded line. How can I assist you?",
        confidence: 0.99,
      },
      {
        speaker: "customer",
        startMs: 4400,
        endMs: 14100,
        text: "Our entire warehouse dispatch halted because your API started dropping all our inventory sync webhooks 20 minutes ago! I need a senior engineer immediately.",
        confidence: 0.98,
      },
      {
        speaker: "agent",
        startMs: 14400,
        endMs: 23200,
        text: "I completely recognize the urgency Elena. I am seeing 429 rate limit triggers in your telemetry. I am performing an immediate warm transfer to our Tier-3 Platform Supervisor Marcus Vance right now.",
        confidence: 0.99,
      },
      {
        speaker: "customer",
        startMs: 23500,
        endMs: 27000,
        text: "Please hurry, we are losing shipments every minute.",
        confidence: 0.98,
      },
    ],
  },
];

const INITIAL_PHONE_NUMBERS: PhoneNumberItem[] = [
  {
    id: "pn-1",
    phoneNumber: "+1 (800) 555-0199",
    friendlyName: "Nexus US Toll-Free Primary",
    countryCode: "US",
    capabilities: ["Voice", "SMS", "SIP Trunking"],
    assignedQueue: "Commercial Sales",
    status: "active",
  },
  {
    id: "pn-2",
    phoneNumber: "+1 (415) 555-9012",
    friendlyName: "San Francisco Direct Inbound",
    countryCode: "US",
    capabilities: ["Voice", "SMS"],
    assignedQueue: "VIP Support",
    status: "active",
  },
  {
    id: "pn-3",
    phoneNumber: "+44 20 7946 0912",
    friendlyName: "London EMEA Regional DID",
    countryCode: "GB",
    capabilities: ["Voice", "SMS"],
    assignedQueue: "Collections Recovery",
    status: "active",
  },
  {
    id: "pn-4",
    phoneNumber: "+1 (888) 555-4321",
    friendlyName: "Automated Collections Dunning Line",
    countryCode: "US",
    capabilities: ["Voice"],
    assignedQueue: "Collections Recovery",
    status: "active",
  },
];

const INITIAL_QUEUES: TelephonyQueueItem[] = [
  {
    id: "q-1",
    name: "Commercial Sales & Inbound Leads",
    slug: "commercial_sales",
    routingStrategy: "skills_based",
    activeCalls: 4,
    maxWaitSeconds: 120,
    holdMusic: "Corporate Ambient Stream #1",
    isActive: true,
  },
  {
    id: "q-2",
    name: "Autonomous Collections & Dunning",
    slug: "collections_recovery",
    routingStrategy: "longest_idle",
    activeCalls: 2,
    maxWaitSeconds: 300,
    holdMusic: "Neutral Chimes #3",
    isActive: true,
  },
  {
    id: "q-3",
    name: "Tier-3 Support Escalations",
    slug: "support_escalations",
    routingStrategy: "round_robin",
    activeCalls: 1,
    maxWaitSeconds: 60,
    holdMusic: "Acoustic Minimalist #2",
    isActive: true,
  },
];

// ============================================================================
// Main AI Voice & Telephony Command Studio Component
// ============================================================================

export default function VoiceCallsPage() {
  const [activeTab, setActiveTab] = useState<"calls" | "dialpad" | "numbers" | "queues" | "compliance">("calls");
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALLS);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(INITIAL_CALLS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState(24); // %

  // Softphone & Dialpad State
  const [dialNumber, setDialNumber] = useState("");
  const [dialQueue, setDialQueue] = useState("commercial_sales");
  const [dialPurpose, setDialPurpose] = useState<CallPurpose>("inbound_lead_qualification");
  const [isCallingActive, setIsCallingActive] = useState(false);
  const [activeCallDuration, setActiveCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationSupervisor, setEscalationSupervisor] = useState("Marcus Vance");
  const [escalationReason, setEscalationReason] = useState("Complex commercial negotiation requires human approval");

  // Telephony Connection Test State
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatusMessage, setConnectionStatusMessage] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [filterOutcome, setFilterOutcome] = useState<string>("all");

  // Timer for active call
  useEffect(() => {
    let interval: any;
    if (isCallingActive) {
      interval = setInterval(() => {
        setActiveCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setActiveCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallingActive]);

  // Audio Playback Simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Format seconds to mm:ss
  const formatDuration = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Pre-dial TCPA Validation
  const checkTcpaCompliance = (phone: string) => {
    const isDnc = phone.includes("9999") || phone.includes("0000");
    const currentHour = new Date().getHours();
    const isWithinHours = currentHour >= 8 && currentHour < 21; // 08:00 to 21:00
    return {
      isPermitted: !isDnc && isWithinHours,
      isDnc,
      isWithinHours,
      message: isDnc
        ? "TCPA Block: Recipient is registered on the National DNC registry."
        : !isWithinHours
        ? "TCPA Block: Current time is outside legal calling hours (08:00 - 21:00 local)."
        : "TCPA Compliant: Within allowable calling window (08:00 - 21:00).",
    };
  };

  const tcpaStatus = checkTcpaCompliance(dialNumber);

  // Handle Dialpad Key Press
  const handleDialpadDigit = (digit: string) => {
    setDialNumber((prev) => prev + digit);
  };

  // Start Call Handler
  const handleStartCall = () => {
    if (!dialNumber) return;
    setIsCallingActive(true);
    setIsMuted(false);
    setIsOnHold(false);
  };

  // Hang Up Call Handler
  const handleHangUp = () => {
    if (!isCallingActive) return;
    const newCall: CallRecord = {
      id: `call-${Date.now()}`,
      callSid: `CA${Math.random().toString(36).substring(2, 15)}`,
      direction: "outbound",
      fromNumber: "+1 (800) 555-0199",
      toNumber: dialNumber,
      customerName: "Active Contact",
      companyName: "Direct Dial Recipient",
      queueSlug: dialQueue,
      purpose: dialPurpose,
      status: "completed",
      outcome: "callback_scheduled",
      durationSeconds: activeCallDuration || 45,
      costUsd: (activeCallDuration || 45) * 0.00018,
      startedAt: "Just now",
      recordingSid: `RE${Math.random().toString(36).substring(2, 15)}`,
      storageUri: `gs://nexus-telephony-recordings/2026/09/active-${Date.now()}.wav`,
      sentimentScore: 0.75,
      executiveSummary: `Outbound AI agent conversation dialed to ${dialNumber}. Verified contact identity, answered inquiries, and registered follow-up callback.`,
      actionItems: ["Send recap SMS with calendar reservation link", "Verify contact role in CRM"],
      buyingSignals: ["Expressed interest in automated dispatch features"],
      churnRisks: [],
      consentDisclosurePlayed: true,
      dncVerified: true,
      transcripts: [
        {
          speaker: "agent",
          startMs: 0,
          endMs: 3500,
          text: "Hello! This is Danielle with Nexus Enterprise calling on a recorded line. Am I speaking with the primary account holder?",
          confidence: 0.99,
        },
        {
          speaker: "customer",
          startMs: 3800,
          endMs: 7200,
          text: "Yes this is him. What is this call regarding?",
          confidence: 0.98,
        },
        {
          speaker: "agent",
          startMs: 7500,
          endMs: 14500,
          text: "I am following up on your recent request for ERP enterprise voice automation details. I'm glad we connected!",
          confidence: 0.99,
        },
      ],
    };

    setCalls([newCall, ...calls]);
    setSelectedCall(newCall);
    setIsCallingActive(false);
    setActiveCallDuration(0);
  };

  // Confirm Warm Transfer Handoff
  const handleConfirmWarmTransfer = () => {
    if (selectedCall) {
      const updated = {
        ...selectedCall,
        outcome: "transferred_to_human_agent" as CallOutcome,
        escalation: {
          assignedSupervisor: escalationSupervisor,
          targetQueue: "Tier 2 Commercial Escalations",
          priority: "high" as const,
          reason: escalationReason,
        },
      };
      setSelectedCall(updated);
      setCalls(calls.map((c) => (c.id === updated.id ? updated : c)));
    }
    setShowEscalationModal(false);
  };

  // Filtered Calls
  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.fromNumber.includes(searchQuery) ||
      call.toNumber.includes(searchQuery) ||
      call.callSid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPurpose = filterPurpose === "all" || call.purpose === filterPurpose;
    const matchesOutcome = filterOutcome === "all" || call.outcome === filterOutcome;
    return matchesSearch && matchesPurpose && matchesOutcome;
  });

  // Twilio Connection Test
  const handleTestTwilioConnection = () => {
    setIsTestingConnection(true);
    setConnectionStatusMessage(null);
    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionStatusMessage(
        "Twilio SIP Voice Trunks, WebRTC Media Stream, and DID catalog verified healthy (Latency: 38ms)."
      );
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/20 border border-purple-500/30 text-purple-400">
              <PhoneCall className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">AI Voice & Telephony Command Studio</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Twilio SIP Engine Active
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Full-stack voice infrastructure: WebRTC streaming, speaker-diarized STT, sentiment extraction, TCPA compliance, and warm human escalations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/call-center"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/40 transition-colors"
          >
            <Headphones className="h-3.5 w-3.5" />
            Call Center Console
          </Link>
          <Link
            href="/voice-agent"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-xs font-semibold border border-pink-500/40 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            AI Voice-Agent Pipeline
          </Link>
          <button
            onClick={() => setActiveTab("dialpad")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium shadow-lg shadow-purple-600/20 transition-colors"
          >
            <Phone className="h-4 w-4" />
            Launch Softphone
          </button>
        </div>
      </div>

      {/* Twilio Provider Integration Bar */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-500/30 p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex-shrink-0">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Telephony Provider</span>
                <span className="text-sm font-bold text-white">Twilio SIP & Voice WebRTC Trunks</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  SID: AC8f9e••••••••b10a
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Healthy (38ms)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Primary DID: <span className="font-mono text-slate-200">+1 (800) 555-0199</span> • Codec:{" "}
                <span className="font-mono text-purple-300">PCMU / G.711u</span> • Encrypted GCS Archiving:{" "}
                <span className="text-emerald-400 font-medium">90-Day Retention</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="https://console.twilio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              Twilio Developer Console
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>

            <button
              onClick={handleTestTwilioConnection}
              disabled={isTestingConnection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium border border-purple-500/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isTestingConnection ? "animate-spin" : ""}`} />
              {isTestingConnection ? "Testing SIP Ping..." : "Test Connection"}
            </button>
          </div>
        </div>

        {connectionStatusMessage && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{connectionStatusMessage}</span>
          </div>
        )}
      </div>

      {/* 4 Quick Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Calls Today</span>
            <PhoneCall className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">142</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +18.4%
            </span>
          </div>
          <span className="text-[11px] text-slate-500">89 Inbound • 53 Outbound</span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Handle Duration</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">03m 48s</span>
            <span className="text-xs font-medium text-slate-400">per call</span>
          </div>
          <span className="text-[11px] text-slate-500">100% automated transcription</span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg AI Sentiment</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">+0.72</span>
            <span className="text-xs font-medium text-slate-400">/ 1.00</span>
          </div>
          <span className="text-[11px] text-emerald-500">Delighted • 89% positive sentiment</span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">TCPA Legal Compliance</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">100%</span>
            <span className="text-xs font-medium text-emerald-400">0 Violations</span>
          </div>
          <span className="text-[11px] text-slate-500">Strict 08:00 - 21:00 & DNC checks</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("calls")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "calls"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <PhoneCall className="h-4 w-4" />
          Master Calls Ledger & Intelligence ({calls.length})
        </button>

        <button
          onClick={() => setActiveTab("dialpad")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "dialpad"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Phone className="h-4 w-4" />
          Softphone & Outbound AI Dialer
          {isCallingActive && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500 text-white font-mono animate-pulse">
              LIVE CALL
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("numbers")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "numbers"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Provisioned DIDs ({INITIAL_PHONE_NUMBERS.length})
        </button>

        <button
          onClick={() => setActiveTab("queues")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "queues"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Headphones className="h-4 w-4" />
          Routing Queues ({INITIAL_QUEUES.length})
        </button>

        <button
          onClick={() => setActiveTab("compliance")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "compliance"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          TCPA Calling Windows & Consent Audit
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: Master Calls Ledger & Detail Intelligence Drawer             */}
      {/* ==================================================================== */}
      {activeTab === "calls" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search caller, company, SID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Filter className="h-3.5 w-3.5" />
                <span>Purpose:</span>
                <select
                  value={filterPurpose}
                  onChange={(e) => setFilterPurpose(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Purposes</option>
                  <option value="inbound_lead_qualification">Lead Qualification</option>
                  <option value="collections_dunning">Collections Dunning</option>
                  <option value="customer_support_dispute">Support Dispute</option>
                  <option value="contract_renewal">Contract Renewal</option>
                  <option value="onboarding_kickoff">Onboarding Kickoff</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Outcome:</span>
                <select
                  value={filterOutcome}
                  onChange={(e) => setFilterOutcome(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Outcomes</option>
                  <option value="qualified_opportunity_created">Opportunity Created</option>
                  <option value="promise_to_pay_secured">Promise to Pay</option>
                  <option value="transferred_to_human_agent">Transferred to Human</option>
                  <option value="callback_scheduled">Callback Scheduled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ledger Table and Side Detail Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Table Area (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 py-3">Customer / Party</th>
                        <th className="px-3 py-3">Direction</th>
                        <th className="px-3 py-3">Purpose</th>
                        <th className="px-3 py-3">Duration</th>
                        <th className="px-3 py-3">Sentiment</th>
                        <th className="px-3 py-3 text-right">Action</th>
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
                              <div className="font-medium text-white">{call.customerName}</div>
                              <div className="text-[11px] text-slate-400">{call.companyName}</div>
                              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                {call.direction === "inbound" ? call.fromNumber : call.toNumber}
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                                  call.direction === "inbound"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                }`}
                              >
                                {call.direction === "inbound" ? (
                                  <PhoneIncoming className="h-3 w-3" />
                                ) : (
                                  <PhoneOutgoing className="h-3 w-3" />
                                )}
                                {call.direction === "inbound" ? "Inbound" : "Outbound"}
                              </span>
                            </td>

                            <td className="px-3 py-3">
                              <div className="font-medium text-slate-300 capitalize">
                                {call.purpose.replace(/_/g, " ")}
                              </div>
                              {call.outcome && (
                                <span className="inline-block mt-0.5 text-[10px] text-slate-400 capitalize">
                                  {call.outcome.replace(/_/g, " ")}
                                </span>
                              )}
                            </td>

                            <td className="px-3 py-3 font-mono text-slate-300">
                              {formatDuration(call.durationSeconds)}
                            </td>

                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                  call.sentimentScore >= 0.5
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : call.sentimentScore >= 0
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}
                              >
                                {call.sentimentScore > 0 ? `+${call.sentimentScore}` : call.sentimentScore}
                              </span>
                            </td>

                            <td className="px-3 py-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCall(call);
                                  setIsPlayingAudio(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 transition-colors"
                                title="Listen to Recording"
                              >
                                <Play className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Call Detail Drawer (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              {selectedCall ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5 sticky top-4">
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white">{selectedCall.customerName}</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-purple-300 border border-purple-500/30">
                          {selectedCall.companyName}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        SID: {selectedCall.callSid.substring(0, 18)}••••
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400">{selectedCall.startedAt}</span>
                      <div className="text-xs text-slate-500 font-mono">Cost: ${selectedCall.costUsd.toFixed(4)}</div>
                    </div>
                  </div>

                  {/* Audio Player & Recording Reference */}
                  <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-purple-400" />
                        Encrypted Voice Recording
                      </span>
                      <span className="font-mono text-slate-400">
                        {formatDuration(Math.round((selectedCall.durationSeconds * audioPlaybackProgress) / 100))} /{" "}
                        {formatDuration(selectedCall.durationSeconds)}
                      </span>
                    </div>

                    {/* Fake Audio Waveform */}
                    <div className="flex items-center gap-1 h-8 px-2 bg-slate-900 rounded border border-slate-800 overflow-hidden">
                      {[15, 45, 80, 60, 30, 90, 75, 40, 20, 65, 85, 95, 30, 50, 70, 45, 30, 85, 60, 40, 90, 30].map(
                        (h, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              idx / 22 <= audioPlaybackProgress / 100
                                ? "bg-purple-500"
                                : "bg-slate-700 hover:bg-slate-600"
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                      >
                        {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        {isPlayingAudio ? "Pause Audio" : "Play Recording"}
                      </button>

                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Lock className="h-3 w-3 text-emerald-400" />
                        AES-256 (GCS)
                      </div>
                    </div>
                  </div>

                  {/* AI Summary & Sentiment Gauge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        AI Executive Summary
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Sentiment:</span>
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            selectedCall.sentimentScore >= 0.5
                              ? "bg-emerald-500/20 text-emerald-300"
                              : selectedCall.sentimentScore >= 0
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {selectedCall.sentimentScore > 0
                            ? `+${selectedCall.sentimentScore}`
                            : selectedCall.sentimentScore}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      {selectedCall.executiveSummary}
                    </p>
                  </div>

                  {/* Key Signals (Buying or Churn) */}
                  {(selectedCall.buyingSignals.length > 0 || selectedCall.churnRisks.length > 0) && (
                    <div className="space-y-2">
                      {selectedCall.buyingSignals.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                            Buying Signals:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedCall.buyingSignals.map((signal, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              >
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCall.churnRisks.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wide">
                            Churn Risk Flags:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedCall.churnRisks.map((risk, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] bg-red-500/10 text-red-300 border border-red-500/20 flex items-center gap-1"
                              >
                                <AlertTriangle className="h-3 w-3" />
                                {risk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Items */}
                  {selectedCall.actionItems.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Autonomous Action Items
                      </span>
                      <ul className="space-y-1">
                        {selectedCall.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Supervisor Warm Transfer Status if present */}
                  {selectedCall.escalation && (
                    <div className="rounded-lg bg-red-950/30 border border-red-500/30 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-red-400 flex items-center gap-1.5">
                          <PhoneForwarded className="h-3.5 w-3.5" />
                          Escalated to Supervisor
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500 text-white">
                          {selectedCall.escalation.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Assigned: <strong className="text-white">{selectedCall.escalation.assignedSupervisor}</strong> (
                        {selectedCall.escalation.targetQueue})
                      </p>
                      <p className="text-[11px] text-slate-400 italic">"{selectedCall.escalation.reason}"</p>
                    </div>
                  )}

                  {/* Speaker-Diarized Transcript Feed */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Diarized Transcript turns ({selectedCall.transcripts.length})</span>
                      <span className="text-[10px] text-emerald-400 font-mono">STT: 98.4% Confidence</span>
                    </span>

                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                      {selectedCall.transcripts.map((turn, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-lg text-xs space-y-1 ${
                            turn.speaker === "agent"
                              ? "bg-purple-950/20 border border-purple-500/20 text-slate-200"
                              : "bg-slate-800/40 border border-slate-700/40 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-semibold text-purple-300 uppercase">
                              {turn.speaker === "agent" ? "Danielle (AI Agent)" : selectedCall.customerName}
                            </span>
                            <span className="font-mono">{formatDuration(Math.round(turn.startMs / 1000))}</span>
                          </div>
                          <p className="leading-relaxed">{turn.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Escalation Button if not yet escalated */}
                  {!selectedCall.escalation && (
                    <button
                      onClick={() => setShowEscalationModal(true)}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <PhoneForwarded className="h-3.5 w-3.5 text-purple-400" />
                      Initiate Warm Transfer to Human Supervisor
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
                  Select a call from the ledger to view diarized transcripts and AI sentiment analysis.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: Interactive Softphone & Outbound AI Dialer                   */}
      {/* ==================================================================== */}
      {activeTab === "dialpad" && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Dialpad Controller (5 cols) */}
          <div className="md:col-span-5 rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">WebRTC Softphone</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Online
              </span>
            </div>

            {/* Target Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Recipient Phone (E.164)</label>
              <div className="relative">
                <input
                  type="text"
                  value={dialNumber}
                  onChange={(e) => setDialNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-base font-mono text-white text-center tracking-wider focus:outline-none focus:border-purple-500"
                />
                {dialNumber && (
                  <button
                    onClick={() => setDialNumber("")}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Pre-Call TCPA Warning / Status */}
            {dialNumber && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                  tcpaStatus.isPermitted
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-red-950/20 border-red-500/30 text-red-300"
                }`}
              >
                {tcpaStatus.isPermitted ? (
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{tcpaStatus.isPermitted ? "TCPA Cleared" : "TCPA Blocked"}</div>
                  <div className="text-[11px] opacity-90">{tcpaStatus.message}</div>
                </div>
              </div>
            )}

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { d: "1", sub: "" },
                { d: "2", sub: "ABC" },
                { d: "3", sub: "DEF" },
                { d: "4", sub: "GHI" },
                { d: "5", sub: "JKL" },
                { d: "6", sub: "MNO" },
                { d: "7", sub: "PQRS" },
                { d: "8", sub: "TUV" },
                { d: "9", sub: "WXYZ" },
                { d: "*", sub: "" },
                { d: "0", sub: "+" },
                { d: "#", sub: "" },
              ].map((k) => (
                <button
                  key={k.d}
                  onClick={() => handleDialpadDigit(k.d)}
                  className="py-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 flex flex-col items-center justify-center transition-colors active:scale-95"
                >
                  <span className="text-base font-bold font-mono">{k.d}</span>
                  {k.sub && <span className="text-[9px] text-slate-500 tracking-wider">{k.sub}</span>}
                </button>
              ))}
            </div>

            {/* Call / Hangup CTA */}
            {!isCallingActive ? (
              <button
                onClick={handleStartCall}
                disabled={!dialNumber || !tcpaStatus.isPermitted}
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                Initiate AI Voice Call
              </button>
            ) : (
              <button
                onClick={handleHangUp}
                className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-colors animate-pulse"
              >
                <PhoneOff className="h-4 w-4" />
                End Call ({formatDuration(activeCallDuration)})
              </button>
            )}
          </div>

          {/* Call Configuration & Live Session (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Call Settings Box */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" />
                AI Voice Campaign Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Routing Queue</label>
                  <select
                    value={dialQueue}
                    onChange={(e) => setDialQueue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="commercial_sales">Commercial Sales (Skills-Based)</option>
                    <option value="collections_recovery">Collections Recovery (Longest-Idle)</option>
                    <option value="support_escalations">Support Escalations (Round-Robin)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Call Purpose</label>
                  <select
                    value={dialPurpose}
                    onChange={(e) => setDialPurpose(e.target.value as CallPurpose)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="inbound_lead_qualification">Lead Qualification</option>
                    <option value="collections_dunning">Collections Dunning</option>
                    <option value="contract_renewal">Contract Renewal</option>
                    <option value="customer_support_dispute">Support Dispute</option>
                    <option value="onboarding_kickoff">Onboarding Kickoff</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs text-slate-400">
                <div className="font-semibold text-slate-300">Automated Voice Invariants Enforced:</div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="h-3 w-3" /> Mandatory call recording disclosure played automatically
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="h-3 w-3" /> Real-time bidirectional WebRTC media streaming at 16kHz
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="h-3 w-3" /> TCPA 08:00 - 21:00 recipient local time boundary gate
                </div>
              </div>
            </div>

            {/* In-Call Active Session HUD */}
            {isCallingActive ? (
              <div className="rounded-xl border border-purple-500/40 bg-gradient-to-b from-purple-950/30 to-slate-900 p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-ping"></div>
                    <div>
                      <div className="text-sm font-bold text-white">Active Telephony Session</div>
                      <div className="text-xs font-mono text-purple-300">{dialNumber}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-emerald-400">
                      {formatDuration(activeCallDuration)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Codec: PCMU (42ms latency)</div>
                  </div>
                </div>

                {/* Animated Pulsing Waveform */}
                <div className="flex items-center justify-center gap-1 h-12 bg-slate-950/80 rounded-lg p-2 border border-slate-800">
                  {[20, 60, 90, 40, 100, 70, 30, 85, 95, 45, 80, 60, 20, 75, 90, 35, 60, 80].map((h, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${idx * 75}ms`,
                      }}
                    />
                  ))}
                </div>

                {/* Live Stream Diarized Transcription */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Live Streaming Transcript
                  </span>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="text-purple-300 font-semibold">
                      Danielle (AI Voice):{" "}
                      <span className="text-slate-300 font-normal">
                        "Hello! This is Danielle with Nexus Enterprise calling on a recorded line. Am I speaking with the
                        primary account holder?"
                      </span>
                    </div>
                    {activeCallDuration > 4 && (
                      <div className="text-blue-300 font-semibold animate-fadeIn">
                        Recipient: <span className="text-slate-300 font-normal">"Yes this is him. What is this call regarding?"</span>
                      </div>
                    )}
                    {activeCallDuration > 8 && (
                      <div className="text-purple-300 font-semibold animate-fadeIn">
                        Danielle (AI Voice):{" "}
                        <span className="text-slate-300 font-normal">
                          "I am following up regarding your invoice and enterprise expansion inquiry..."
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Call Controls */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      isMuted
                        ? "bg-red-500/20 border-red-500 text-red-300"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    }`}
                  >
                    {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {isMuted ? "Unmute" : "Mute"}
                  </button>

                  <button
                    onClick={() => setIsOnHold(!isOnHold)}
                    className={`py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      isOnHold
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    }`}
                  >
                    {isOnHold ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                    {isOnHold ? "Resume" : "Hold"}
                  </button>

                  <button
                    onClick={() => setShowEscalationModal(true)}
                    className="py-2 rounded-lg text-xs font-medium bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500 text-purple-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PhoneForwarded className="h-3.5 w-3.5" />
                    Warm Transfer
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 space-y-2">
                <PhoneCall className="h-8 w-8 text-slate-600 mx-auto" />
                <div className="text-sm font-medium text-slate-400">Softphone Idle</div>
                <div className="text-xs text-slate-500">
                  Enter an E.164 phone number and click "Initiate AI Voice Call" to test live outbound streaming.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: Provisioned Phone Numbers Catalog                             */}
      {/* ==================================================================== */}
      {activeTab === "numbers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Provisioned Direct Inward Dialing (DID) Catalog</h3>
              <p className="text-xs text-slate-400">
                Managed phone numbers attached to Twilio SIP voice trunks and routing queues.
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors">
              + Provision New DID
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3">Friendly Name</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Capabilities</th>
                  <th className="px-4 py-3">Assigned Queue</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {INITIAL_PHONE_NUMBERS.map((pn) => (
                  <tr key={pn.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-semibold text-white">{pn.phoneNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{pn.friendlyName}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{pn.countryCode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {pn.capabilities.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-purple-400 font-medium">{pn.assignedQueue}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: Routing Queues & Strategies                                   */}
      {/* ==================================================================== */}
      {activeTab === "queues" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Inbound & Outbound Telephony Queues</h3>
              <p className="text-xs text-slate-400">
                Configure automatic call distribution strategies, hold music, and SLA wait thresholds.
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors">
              + Create Queue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INITIAL_QUEUES.map((q) => (
              <div key={q.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{q.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">slug: {q.slug}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Routing Strategy:</span>
                    <span className="font-semibold text-purple-400 capitalize">
                      {q.routingStrategy.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Active Live Calls:</span>
                    <span className="font-mono text-white font-bold">{q.activeCalls}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Max Wait Timeout:</span>
                    <span className="font-mono text-slate-300">{q.maxWaitSeconds}s</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Hold Audio Stream:</span>
                    <span className="text-slate-300 truncate max-w-[140px]">{q.holdMusic}</span>
                  </div>
                </div>

                <button className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors">
                  Edit Routing Policies
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: TCPA Legal Calling Windows & Consent Audit                    */}
      {/* ==================================================================== */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">TCPA Legal Calling Windows (Automated Enforcement)</h3>
                <p className="text-xs text-slate-400">
                  Strict federal regulatory limits: Outbound telemarketing and collections calls are restricted to 08:00
                  to 21:00 recipient local time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-medium text-slate-400">Permitted Calling Hours</div>
                <div className="text-xl font-bold font-mono text-white">08:00 - 21:00</div>
                <div className="text-[11px] text-slate-500">Recipient Local Timezone</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-medium text-slate-400">Weekend Call Policy</div>
                <div className="text-xl font-bold font-mono text-amber-400">Restricted</div>
                <div className="text-[11px] text-slate-500">Automated dunning paused on Sundays</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-medium text-slate-400">National DNC Registry</div>
                <div className="text-xl font-bold font-mono text-emerald-400">Pre-Dial Scrubbing</div>
                <div className="text-[11px] text-slate-500">Real-time suppression active</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              Mandatory Consent Disclosure Script
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
              "This call is conducted by Nexus AI and may be monitored or recorded for quality assurance and compliance.
              By continuing, you consent to this recording in compliance with state two-party and federal regulations."
            </p>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: Supervisor Warm Transfer / Escalation                         */}
      {/* ==================================================================== */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-purple-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PhoneForwarded className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Supervisor Warm Transfer</h3>
              </div>
              <button
                onClick={() => setShowEscalationModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Transfer this call session to a human supervisor with complete structured context and live transcript history.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Assigned Human Supervisor</label>
                <select
                  value={escalationSupervisor}
                  onChange={(e) => setEscalationSupervisor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Marcus Vance">Marcus Vance (Tier 3 Platform Lead)</option>
                  <option value="Elena Chen">Elena Chen (Commercial Sales Director)</option>
                  <option value="Jason Reed">Jason Reed (Collections Risk Officer)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Escalation Trigger Reason</label>
                <textarea
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEscalationModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmWarmTransfer}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-lg shadow-purple-600/20 transition-colors flex items-center gap-1.5"
              >
                <PhoneForwarded className="h-3.5 w-3.5" />
                Execute Warm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
