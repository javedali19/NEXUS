"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Phone,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  ArrowRight,
  ExternalLink,
  Sliders,
  DollarSign,
  UserCheck,
  UserX,
  FileText,
  AlertOctagon,
  RefreshCw,
  Search,
  Filter,
  Check,
  PauseCircle,
  PlayCircle,
  HelpCircle,
  Plus,
  Send,
  Zap,
  Globe,
  Bell,
  Scale,
  Sparkles,
} from "lucide-react";

// Criteria Types
export type CustomerSegment = "enterprise_tier_1" | "mid_market" | "smb" | "high_risk";

export type CollectionsActionType =
  | "whatsapp"
  | "payment_link"
  | "task"
  | "reminder"
  | "call"
  | "escalation"
  | "pause"
  | "exception";

export type SuppressionReason =
  | "dnc_registered"
  | "outside_communication_window"
  | "ptp_active"
  | "cooling_off_active"
  | "no_consent"
  | "dispute_active";

export interface DebtorCase {
  id: string;
  customerName: string;
  companyName: string;
  invoiceNumber: string;
  overdueAmount: number;
  daysPastDue: number;
  segment: CustomerSegment;
  paymentHistoryScore: number; // 0 to 100
  country: "US" | "IN" | "GB" | "DE";
  recipientLocalHour: number; // 0 to 23
  isDncRegistered: boolean;
  whatsappOptIn: boolean;
  voiceOptIn: boolean;
  emailOptIn: boolean;
  lastContactHoursAgo: number;
  ptpStatus: "none" | "active" | "broken";
  ptpAmount?: number;
  ptpDate?: string;
  isUnderDispute: boolean;
}

export interface PromiseToPayRecord {
  id: string;
  caseId: string;
  customerName: string;
  invoiceNumber: string;
  ptpAmount: number;
  promisedDate: string;
  status: "pending" | "honored" | "broken";
  recordedAt: string;
  recordedBy: string;
  notes: string;
}

export interface ComplianceExecutionAudit {
  id: string;
  customerName: string;
  invoiceNumber: string;
  action: CollectionsActionType;
  status: "executed" | "suppressed";
  suppressionReason?: SuppressionReason;
  explanation: string;
  timestamp: string;
  channel: string;
}

const INITIAL_DEBTOR_CASES: DebtorCase[] = [
  {
    id: "case-001",
    customerName: "Jessica Wong",
    companyName: "OmniCorp Logistics",
    invoiceNumber: "INV-2026-0044",
    overdueAmount: 32100.0,
    daysPastDue: 52,
    segment: "smb",
    paymentHistoryScore: 68,
    country: "US",
    recipientLocalHour: 14, // 2:00 PM (inside TCPA window)
    isDncRegistered: false,
    whatsappOptIn: true,
    voiceOptIn: true,
    emailOptIn: true,
    lastContactHoursAgo: 72,
    ptpStatus: "none",
    isUnderDispute: false,
  },
  {
    id: "case-002",
    customerName: "Sarah Jenkins",
    companyName: "Acme Global Industries",
    invoiceNumber: "INV-2026-0041",
    overdueAmount: 64000.0,
    daysPastDue: 68,
    segment: "enterprise_tier_1", // VIP Strategic account
    paymentHistoryScore: 94,
    country: "US",
    recipientLocalHour: 11,
    isDncRegistered: false,
    whatsappOptIn: true,
    voiceOptIn: true,
    emailOptIn: true,
    lastContactHoursAgo: 96,
    ptpStatus: "none",
    isUnderDispute: false,
  },
  {
    id: "case-003",
    customerName: "Michael Rodriguez",
    companyName: "CyberDyne Systems",
    invoiceNumber: "INV-2026-0042",
    overdueAmount: 8750.0,
    daysPastDue: 22,
    segment: "mid_market",
    paymentHistoryScore: 82,
    country: "US",
    recipientLocalHour: 16,
    isDncRegistered: false,
    whatsappOptIn: true,
    voiceOptIn: true,
    emailOptIn: true,
    lastContactHoursAgo: 48,
    ptpStatus: "active", // Active PTP: holds collections
    ptpAmount: 8750.0,
    ptpDate: "2026-09-28",
    isUnderDispute: false,
  },
  {
    id: "case-004",
    customerName: "Dr. Jonathan Stark",
    companyName: "Stark BioTech Laboratories",
    invoiceNumber: "INV-2026-0045",
    overdueAmount: 14200.0,
    daysPastDue: 48,
    segment: "high_risk",
    paymentHistoryScore: 45,
    country: "US",
    recipientLocalHour: 10,
    isDncRegistered: false,
    whatsappOptIn: true,
    voiceOptIn: false,
    emailOptIn: true,
    lastContactHoursAgo: 48,
    ptpStatus: "broken", // Broken PTP: immediate escalation
    ptpAmount: 14200.0,
    ptpDate: "2026-09-18",
    isUnderDispute: false,
  },
  {
    id: "case-005",
    customerName: "Arthur Pendelton",
    companyName: "BlueSky Research Labs",
    invoiceNumber: "INV-2026-0047",
    overdueAmount: 14000.0,
    daysPastDue: 34,
    segment: "smb",
    paymentHistoryScore: 71,
    country: "US",
    recipientLocalHour: 15,
    isDncRegistered: true, // DNC registered!
    whatsappOptIn: true,
    voiceOptIn: true,
    emailOptIn: true,
    lastContactHoursAgo: 96,
    ptpStatus: "none",
    isUnderDispute: false,
  },
  {
    id: "case-006",
    customerName: "Rajesh Kumar",
    companyName: "Quantum Cloud India Pvt Ltd",
    invoiceNumber: "INV-2026-0091",
    overdueAmount: 4800.0,
    daysPastDue: 26,
    segment: "smb",
    paymentHistoryScore: 78,
    country: "IN",
    recipientLocalHour: 23, // 11:00 PM IST (Outside TRAI window!)
    isDncRegistered: false,
    whatsappOptIn: true,
    voiceOptIn: true,
    emailOptIn: true,
    lastContactHoursAgo: 72,
    ptpStatus: "none",
    isUnderDispute: false,
  },
];

const INITIAL_PTPS: PromiseToPayRecord[] = [
  {
    id: "ptp-01",
    caseId: "case-003",
    customerName: "Michael Rodriguez (CyberDyne Systems)",
    invoiceNumber: "INV-2026-0042",
    ptpAmount: 8750.0,
    promisedDate: "2026-09-28",
    status: "pending",
    recordedAt: "Yesterday, 14:15",
    recordedBy: "Sarah Jenkins (Collections Lead)",
    notes: "Client CFO confirmed payment will clear on next scheduled accounts payable run (Sep 28).",
  },
  {
    id: "ptp-02",
    caseId: "case-004",
    customerName: "Dr. Jonathan Stark (Stark BioTech)",
    invoiceNumber: "INV-2026-0045",
    ptpAmount: 14200.0,
    promisedDate: "2026-09-18",
    status: "broken",
    recordedAt: "Sep 12, 10:00",
    recordedBy: "Automated AI Collections Voice Agent",
    notes: "Promise date elapsed without payment. Status transitioned to Broken. Triggered credit committee escalation.",
  },
];

const INITIAL_COMPLIANCE_AUDITS: ComplianceExecutionAudit[] = [
  {
    id: "aud-01",
    customerName: "Arthur Pendelton (BlueSky Research Labs)",
    invoiceNumber: "INV-2026-0047",
    action: "task",
    status: "suppressed",
    suppressionReason: "dnc_registered",
    explanation: "Telephony call BLOCKED: Recipient is registered on Do Not Call (DNC) list. Diverted to manual collector task.",
    timestamp: "Today, 09:30 AM",
    channel: "Internal Task",
  },
  {
    id: "aud-02",
    customerName: "Rajesh Kumar (Quantum Cloud India)",
    invoiceNumber: "INV-2026-0091",
    action: "whatsapp",
    status: "suppressed",
    suppressionReason: "outside_communication_window",
    explanation: "WhatsApp reminder queued: Local hour (23:00 IST) is outside TRAI commercial window (09:00-21:00). Scheduled for delivery at 09:00 IST.",
    timestamp: "Today, 10:15 AM",
    channel: "WhatsApp",
  },
  {
    id: "aud-03",
    customerName: "Michael Rodriguez (CyberDyne Systems)",
    invoiceNumber: "INV-2026-0042",
    action: "pause",
    status: "suppressed",
    suppressionReason: "ptp_active",
    explanation: "Collection paused: Active Promise-to-Pay for $8,750.00 maturing on 2026-09-28.",
    timestamp: "Yesterday, 14:15 PM",
    channel: "System Standby",
  },
];

export default function CollectionsPolicyStudioPage() {
  const [activeTab, setActiveTab] = useState<"simulator" | "rules" | "ptp" | "audit">("simulator");
  const [cases, setCases] = useState<DebtorCase[]>(INITIAL_DEBTOR_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("case-001");
  const [ptps, setPtps] = useState<PromiseToPayRecord[]>(INITIAL_PTPS);
  const [audits, setAudits] = useState<ComplianceExecutionAudit[]>(INITIAL_COMPLIANCE_AUDITS);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: "success" | "warning" | "info" } | null>(null);

  // New PTP Modal State
  const [isPtpModalOpen, setIsPtpModalOpen] = useState<boolean>(false);
  const [ptpAmountInput, setPtpAmountInput] = useState<number>(5000);
  const [ptpDateInput, setPtpDateInput] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [ptpNotesInput, setPtpNotesInput] = useState<string>("");

  const showToast = (title: string, desc: string, type: "success" | "warning" | "info" = "info") => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Evaluator function implementing the 10 criteria
  const policyOutcome = useMemo(() => {
    const c = activeCase;

    // 1. Active Promise-to-Pay (PTP)
    if (c.ptpStatus === "active") {
      return {
        action: "pause" as CollectionsActionType,
        isSuppressed: true,
        suppressionReason: "ptp_active" as SuppressionReason,
        headline: "Collection Paused: Active Promise-to-Pay (PTP)",
        explanation: `Debtor committed to pay $${c.ptpAmount?.toFixed(2)} by ${c.ptpDate}. All dunning contacts are paused.`,
        badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        channel: "Pause Stay",
        priority: "Hold",
      };
    }

    if (c.ptpStatus === "broken") {
      return {
        action: "escalation" as CollectionsActionType,
        isSuppressed: false,
        suppressionReason: undefined,
        headline: "Critical Escalation: Promise-to-Pay Broken",
        explanation: `Customer failed to honor commitment of $${c.ptpAmount?.toFixed(2)} on ${c.ptpDate}. Immediate referral to Credit Committee & Legal.`,
        badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
        channel: "Credit Committee",
        priority: "Critical Priority 1",
      };
    }

    // 2. Active Commercial Dispute
    if (c.isUnderDispute) {
      return {
        action: "pause" as CollectionsActionType,
        isSuppressed: true,
        suppressionReason: "dispute_active" as SuppressionReason,
        headline: "Collection Paused: Commercial Billing Dispute",
        explanation: "Invoice is under active reconciliation. Dunning suspended to protect customer relationship.",
        badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
        channel: "Dispute Hold",
        priority: "Hold",
      };
    }

    // 3. Customer Segment: Enterprise Tier 1 VIP Exemption
    if (c.segment === "enterprise_tier_1") {
      if (c.daysPastDue > 60 || c.overdueAmount > 50000.0) {
        return {
          action: "task" as CollectionsActionType,
          isSuppressed: false,
          suppressionReason: undefined,
          headline: "Enterprise Tier 1: Strategic Account Director Task",
          explanation: "Automated robocalls strictly prohibited for VIP accounts. Assigned priority consultation task to Strategic Account Executive.",
          badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
          channel: "Internal CRM Task",
          priority: "High Priority 2",
        };
      } else {
        return {
          action: "payment_link" as CollectionsActionType,
          isSuppressed: false,
          suppressionReason: undefined,
          headline: "Enterprise Tier 1: Discrete Payment Link",
          explanation: "Generated white-glove digital statement with discrete online payment link token.",
          badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
          channel: "Executive Email",
          priority: "Normal Priority 4",
        };
      }
    }

    // 4. Aging (DPD) & Amount Target Action
    let targetAction: CollectionsActionType = "reminder";
    if (c.daysPastDue > 90 || (c.segment === "high_risk" && c.daysPastDue > 45)) {
      targetAction = "escalation";
    } else if (c.daysPastDue > 60 || c.overdueAmount >= 10000.0) {
      targetAction = "call";
    } else if (c.daysPastDue > 30) {
      targetAction = "whatsapp";
    } else if (c.daysPastDue > 14) {
      targetAction = "payment_link";
    }

    // 5. Cooling-off Period
    const requiredCooldown = c.segment === "high_risk" ? 24 : c.segment === "smb" ? 48 : 72;
    if (c.lastContactHoursAgo < requiredCooldown && targetAction !== "escalation") {
      return {
        action: "pause" as CollectionsActionType,
        isSuppressed: true,
        suppressionReason: "cooling_off_active" as SuppressionReason,
        headline: "Suppressed by Cooling-Off Rule",
        explanation: `Last contact was ${c.lastContactHoursAgo} hours ago (required cool-down: ${requiredCooldown} hours). Repetitive outreach blocked.`,
        badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        channel: "Cooling Off",
        priority: "Cooldown",
      };
    }

    // 6. Regulatory Windows Check
    // US: 08:00 - 21:00 | IN: 09:00 - 21:00
    const inWindow = c.country === "US" ? c.recipientLocalHour >= 8 && c.recipientLocalHour < 21 : c.recipientLocalHour >= 9 && c.recipientLocalHour < 21;

    // 7. DNC & Consent Checks
    if (targetAction === "call") {
      if (c.isDncRegistered) {
        return {
          action: "task" as CollectionsActionType,
          isSuppressed: true,
          suppressionReason: "dnc_registered" as SuppressionReason,
          headline: "Voice Call Blocked: Registered on Do Not Call (DNC)",
          explanation: "Outbound telephony prohibited under TCPA / National DNC registry. Diverted to manual collector task.",
          badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
          channel: "Internal Task",
          priority: "Priority 2",
        };
      }
      if (!c.voiceOptIn) {
        return {
          action: "task" as CollectionsActionType,
          isSuppressed: true,
          suppressionReason: "no_consent" as SuppressionReason,
          headline: "Voice Call Suppressed: No Consent Opt-In",
          explanation: "Recipient has not provided express consent for voice collection calls. Diverted to internal task.",
          badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          channel: "Internal Task",
          priority: "Priority 3",
        };
      }
      if (!inWindow) {
        return {
          action: "call" as CollectionsActionType,
          isSuppressed: true,
          suppressionReason: "outside_communication_window" as SuppressionReason,
          headline: "Voice Call Queued: Outside Legal Window",
          explanation: `Local time (${c.recipientLocalHour}:00 in ${c.country}) violates TCPA/TRAI communication hours. Queued for 09:00 window opening.`,
          badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          channel: "Telephony Queue",
          priority: "Scheduled",
        };
      }
      return {
        action: "call" as CollectionsActionType,
        isSuppressed: false,
        suppressionReason: undefined,
        headline: "Outbound Telephony Call Approved",
        explanation: `Permitted: In-window (${c.recipientLocalHour}:00), DNC clear, voice consent verified. Overdue balance exceeds threshold.`,
        badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        channel: "AI / Agent Telephony",
        priority: "High Priority 2",
      };
    }

    if (targetAction === "whatsapp") {
      if (!c.whatsappOptIn) {
        return {
          action: "reminder" as CollectionsActionType,
          isSuppressed: true,
          suppressionReason: "no_consent" as SuppressionReason,
          headline: "WhatsApp Suppressed: No Consent Opt-In",
          explanation: "Customer has not consented to WhatsApp messaging. Falling back to digital email notice.",
          badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          channel: "Email Statement",
          priority: "Priority 4",
        };
      }
      if (!inWindow) {
        return {
          action: "whatsapp" as CollectionsActionType,
          isSuppressed: true,
          suppressionReason: "outside_communication_window" as SuppressionReason,
          headline: "WhatsApp Queued: Outside Conversational Hours",
          explanation: `Local time (${c.recipientLocalHour}:00 in ${c.country}) is outside conversational window. Queued for 09:00 delivery.`,
          badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          channel: "WhatsApp Queue",
          priority: "Scheduled",
        };
      }
      return {
        action: "whatsapp" as CollectionsActionType,
        isSuppressed: false,
        suppressionReason: undefined,
        headline: "WhatsApp Template Approved with Payment Link",
        explanation: `Dispatched approved HSM payment reminder template via Meta WhatsApp Business API with instant checkout token.`,
        badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        channel: "Meta WhatsApp API",
        priority: "Priority 3",
      };
    }

    if (targetAction === "payment_link") {
      return {
        action: "payment_link" as CollectionsActionType,
        isSuppressed: false,
        suppressionReason: undefined,
        headline: "Payment Link Dispatched",
        explanation: "Generated secure time-limited Razorpay/Stripe checkout URL sent via digital invoice.",
        badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        channel: "Email / SMS Link",
        priority: "Priority 4",
      };
    }

    if (targetAction === "escalation") {
      return {
        action: "escalation" as CollectionsActionType,
        isSuppressed: false,
        suppressionReason: undefined,
        headline: "Severe Debt Escalation Triggered",
        explanation: `Invoice is ${c.daysPastDue} days past due (${c.overdueAmount >= 10000 ? "High Balance" : "Matured"}). Escalated to Senior Credit Officer.`,
        badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
        channel: "Credit Officer",
        priority: "Critical Priority 1",
      };
    }

    return {
      action: "reminder" as CollectionsActionType,
      isSuppressed: false,
      suppressionReason: undefined,
      headline: "Courtesy Reminder Dispatched",
      explanation: "Dispatched initial gentle dunning notice and digital invoice copy.",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      channel: "Email Statement",
      priority: "Priority 5",
    };
  }, [activeCase]);

  // Update simulator parameters on active case
  const handleUpdateCaseParam = (key: keyof DebtorCase, value: any) => {
    setCases((prev) =>
      prev.map((c) => (c.id === activeCase.id ? { ...c, [key]: value } : c))
    );
  };

  // Execute recommended action
  const handleExecuteAction = () => {
    const newAudit: ComplianceExecutionAudit = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      customerName: `${activeCase.customerName} (${activeCase.companyName})`,
      invoiceNumber: activeCase.invoiceNumber,
      action: policyOutcome.action,
      status: policyOutcome.isSuppressed ? "suppressed" : "executed",
      suppressionReason: policyOutcome.suppressionReason,
      explanation: policyOutcome.explanation,
      timestamp: "Just now",
      channel: policyOutcome.channel,
    };

    setAudits((prev) => [newAudit, ...prev]);

    // Update case last contacted
    if (!policyOutcome.isSuppressed) {
      handleUpdateCaseParam("lastContactHoursAgo", 0);
    }

    showToast(
      policyOutcome.isSuppressed ? "Action Handled via Compliance Guard" : "Collections Action Executed",
      policyOutcome.explanation,
      policyOutcome.isSuppressed ? "warning" : "success"
    );
  };

  // Log Promise-to-Pay
  const handleCreatePtp = () => {
    const newPtp: PromiseToPayRecord = {
      id: `ptp-${Date.now().toString().slice(-4)}`,
      caseId: activeCase.id,
      customerName: `${activeCase.customerName} (${activeCase.companyName})`,
      invoiceNumber: activeCase.invoiceNumber,
      ptpAmount: ptpAmountInput,
      promisedDate: ptpDateInput,
      status: "pending",
      recordedAt: "Just now",
      recordedBy: "Collections Specialist (You)",
      notes: ptpNotesInput || "Customer committed to pay full balance via corporate account.",
    };

    setPtps((prev) => [newPtp, ...prev]);

    // Update active case
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              ptpStatus: "active",
              ptpAmount: ptpAmountInput,
              ptpDate: ptpDateInput,
            }
          : c
      )
    );

    setIsPtpModalOpen(false);
    showToast(
      "Promise-to-Pay Registered",
      `Commitment for $${ptpAmountInput.toFixed(2)} maturing on ${ptpDateInput}. Collections paused.`,
      "success"
    );
  };

  // Toggle PTP Status
  const handleUpdatePtpStatus = (ptpId: string, newStatus: "honored" | "broken") => {
    setPtps((prev) =>
      prev.map((p) => (p.id === ptpId ? { ...p, status: newStatus } : p))
    );

    const ptp = ptps.find((p) => p.id === ptpId);
    if (ptp) {
      setCases((prev) =>
        prev.map((c) =>
          c.id === ptp.caseId
            ? {
                ...c,
                ptpStatus: newStatus === "honored" ? "none" : "broken",
              }
            : c
        )
      );
    }

    showToast(
      newStatus === "honored" ? "Promise-to-Pay Honored" : "Promise-to-Pay Broken",
      newStatus === "honored"
        ? "Payment verified. Collections stay released."
        : "Commitment broken. Triggered immediate severity escalation.",
      newStatus === "honored" ? "success" : "warning"
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border border-primary/20 bg-card shadow-2xl flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
          ) : toastMessage.type === "warning" ? (
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          ) : (
            <Zap className="h-5 w-5 text-primary mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-xs text-foreground">{toastMessage.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Collections Policy Engine
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                  Autonomous Dunning Engine Active
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluates aging, amount, customer segment, payment history, DNC, consent, country, communication windows, and promise-to-pay.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/workflows/collections"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" /> Launch Autonomous Workflow
          </Link>
          <button
            onClick={() => setIsPtpModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Register Promise-to-Pay (PTP)
          </button>
        </div>
      </div>

      {/* High-Level AR Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Total Overdue AR</div>
          <div className="text-lg font-bold font-mono text-foreground">$147,850.00</div>
          <div className="text-[10px] text-muted-foreground">Across 6 active dunning cases</div>
        </div>
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Active PTP Commitments</div>
          <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">$8,750.00</div>
          <div className="text-[10px] text-muted-foreground">1 pending • Collections paused</div>
        </div>
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">DNC Protected Debtors</div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">1 Account</div>
          <div className="text-[10px] text-muted-foreground">Telephony strictly blocked</div>
        </div>
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Window Hold / Delayed</div>
          <div className="text-lg font-bold font-mono text-primary">1 Queued</div>
          <div className="text-[10px] text-muted-foreground">Awaiting 09:00 local time</div>
        </div>
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Critical Escalations</div>
          <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">1 Broken PTP</div>
          <div className="text-[10px] text-muted-foreground">Credit Committee active</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "simulator"
              ? "bg-card text-foreground font-semibold shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="h-3.5 w-3.5 text-primary" />
          Active Cases & Policy Simulator
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "rules"
              ? "bg-card text-foreground font-semibold shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scale className="h-3.5 w-3.5 text-primary" />
          Regulatory & Policy Matrix
        </button>
        <button
          onClick={() => setActiveTab("ptp")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "ptp"
              ? "bg-card text-foreground font-semibold shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-primary" />
          Promise-to-Pay (PTP) Ledger ({ptps.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "audit"
              ? "bg-card text-foreground font-semibold shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Compliance & Action Ledger ({audits.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE CASES & POLICY SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Case Selector & Ledger (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Select Debtor Case
              </h3>

              <div className="space-y-2">
                {cases.map((c) => {
                  const isSelected = c.id === selectedCaseId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all space-y-1 ${
                        isSelected
                          ? "bg-primary/5 border-primary text-foreground shadow-xs"
                          : "bg-card hover:bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-foreground truncate">{c.companyName}</div>
                        <div className="font-mono font-bold text-foreground">
                          ${c.overdueAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Invoice: <strong className="font-mono text-foreground">{c.invoiceNumber}</strong></span>
                        <span className="font-mono">{c.daysPastDue} DPD</span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold font-mono bg-muted text-muted-foreground border border-border">
                          {c.segment.replace(/_/g, " ")}
                        </span>
                        {c.isDncRegistered && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            DNC Block
                          </span>
                        )}
                        {c.ptpStatus === "active" && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            Active PTP
                          </span>
                        )}
                        {c.ptpStatus === "broken" && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            Broken PTP
                          </span>
                        )}
                        {c.recipientLocalHour >= 21 || c.recipientLocalHour < 8 ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-primary/10 text-primary border border-primary/20">
                            Window Hold
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Interactive Policy Simulator & Multi-Factor Evaluator (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Evaluator Verdict Card */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Policy Engine Evaluator Verdict
                  </div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    {policyOutcome.headline}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${policyOutcome.badgeColor}`}>
                    Action: {policyOutcome.action.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {policyOutcome.explanation}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-muted/20 border border-border/70">
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">Dispatched Channel</div>
                  <div className="font-semibold text-foreground font-mono mt-0.5">{policyOutcome.channel}</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/70">
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">Execution Priority</div>
                  <div className="font-semibold text-foreground font-mono mt-0.5">{policyOutcome.priority}</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/70">
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">Compliance Verdict</div>
                  <div className={`font-semibold font-mono mt-0.5 ${policyOutcome.isSuppressed ? "text-amber-600" : "text-emerald-600"}`}>
                    {policyOutcome.isSuppressed ? "Suppressed / Hold" : "Permitted"}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/70">
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">Local Recipient Time</div>
                  <div className="font-semibold text-foreground font-mono mt-0.5">
                    {activeCase.recipientLocalHour}:00 ({activeCase.country})
                  </div>
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExecuteAction}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  {policyOutcome.isSuppressed ? "Queue / Record Compliance Hold" : `Execute ${policyOutcome.action.toUpperCase()} Action`}
                </button>
              </div>
            </div>

            {/* Interactive Criteria Tweaker */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary" /> 10-Criteria Policy Tuning Simulator
                </h3>
                <span className="text-[11px] text-muted-foreground font-mono">Live Reactive Engine</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. Days Past Due (Invoice Age) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground">1. Invoice Age (DPD)</label>
                    <span className="font-mono font-bold text-foreground">{activeCase.daysPastDue} Days</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    value={activeCase.daysPastDue}
                    onChange={(e) => handleUpdateCaseParam("daysPastDue", Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* 2. Overdue Amount */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground">2. Overdue Amount</label>
                    <span className="font-mono font-bold text-foreground">${activeCase.overdueAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={100000}
                    step={500}
                    value={activeCase.overdueAmount}
                    onChange={(e) => handleUpdateCaseParam("overdueAmount", Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* 3. Customer Segment */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">3. Customer Segment</label>
                  <select
                    value={activeCase.segment}
                    onChange={(e) => handleUpdateCaseParam("segment", e.target.value as CustomerSegment)}
                    className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-medium text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="enterprise_tier_1">Enterprise Tier 1 (VIP Account - Robocalls Blocked)</option>
                    <option value="mid_market">Mid-Market Standard</option>
                    <option value="smb">SMB High-Velocity Dunning</option>
                    <option value="high_risk">High-Risk (Accelerated Escalation)</option>
                  </select>
                </div>

                {/* 4. Payment History Score */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground">4. Payment History Score</label>
                    <span className="font-mono font-bold text-foreground">{activeCase.paymentHistoryScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={activeCase.paymentHistoryScore}
                    onChange={(e) => handleUpdateCaseParam("paymentHistoryScore", Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* 5. Communication Window (Local Hour) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground">5. Recipient Local Hour</label>
                    <span className="font-mono font-bold text-foreground">{activeCase.recipientLocalHour}:00 ({activeCase.country})</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={23}
                    value={activeCase.recipientLocalHour}
                    onChange={(e) => handleUpdateCaseParam("recipientLocalHour", Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* 6. Country Jurisdiction */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">6. Country Jurisdiction</label>
                  <select
                    value={activeCase.country}
                    onChange={(e) => handleUpdateCaseParam("country", e.target.value)}
                    className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-medium text-xs focus:outline-hidden"
                  >
                    <option value="US">United States (TCPA 08:00 - 21:00)</option>
                    <option value="IN">India (TRAI UCC 09:00 - 21:00)</option>
                    <option value="GB">United Kingdom (FCA Consumer Credit)</option>
                    <option value="DE">European Union (GDPR / Strict Contact)</option>
                  </select>
                </div>

                {/* 7. Promise-to-Pay (PTP) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">7. Promise-to-Pay (PTP) Status</label>
                  <select
                    value={activeCase.ptpStatus}
                    onChange={(e) => handleUpdateCaseParam("ptpStatus", e.target.value)}
                    className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-medium text-xs focus:outline-hidden"
                  >
                    <option value="none">No Active Commitment</option>
                    <option value="active">Active PTP (Pauses Collection)</option>
                    <option value="broken">Broken PTP (Triggers Immediate Escalation)</option>
                  </select>
                </div>

                {/* 8. Contact History (Hours Ago) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground">8. Last Contact (Cool-down)</label>
                    <span className="font-mono font-bold text-foreground">{activeCase.lastContactHoursAgo}h Ago</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    value={activeCase.lastContactHoursAgo}
                    onChange={(e) => handleUpdateCaseParam("lastContactHoursAgo", Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* 9 & 10. Toggles for Consent and DNC */}
              <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* DNC Toggle */}
                <button
                  type="button"
                  onClick={() => handleUpdateCaseParam("isDncRegistered", !activeCase.isDncRegistered)}
                  className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    activeCase.isDncRegistered
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                      : "bg-muted/20 border-border text-muted-foreground"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-[11px]">9. DNC Registry</div>
                    <div className="text-[10px]">{activeCase.isDncRegistered ? "Registered (Blocked)" : "Not Registered"}</div>
                  </div>
                  {activeCase.isDncRegistered ? <UserX className="h-4 w-4 text-rose-600" /> : <UserCheck className="h-4 w-4" />}
                </button>

                {/* WhatsApp Consent */}
                <button
                  type="button"
                  onClick={() => handleUpdateCaseParam("whatsappOptIn", !activeCase.whatsappOptIn)}
                  className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    activeCase.whatsappOptIn
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-[11px]">WhatsApp Consent</div>
                    <div className="text-[10px]">{activeCase.whatsappOptIn ? "Opted In" : "Revoked"}</div>
                  </div>
                  {activeCase.whatsappOptIn ? <Check className="h-4 w-4 text-emerald-600" /> : <UserX className="h-4 w-4 text-rose-600" />}
                </button>

                {/* Voice Consent */}
                <button
                  type="button"
                  onClick={() => handleUpdateCaseParam("voiceOptIn", !activeCase.voiceOptIn)}
                  className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    activeCase.voiceOptIn
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-[11px]">Voice Call Consent</div>
                    <div className="text-[10px]">{activeCase.voiceOptIn ? "Opted In" : "Revoked"}</div>
                  </div>
                  {activeCase.voiceOptIn ? <Check className="h-4 w-4 text-emerald-600" /> : <UserX className="h-4 w-4 text-rose-600" />}
                </button>

                {/* Commercial Dispute */}
                <button
                  type="button"
                  onClick={() => handleUpdateCaseParam("isUnderDispute", !activeCase.isUnderDispute)}
                  className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    activeCase.isUnderDispute
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
                      : "bg-muted/20 border-border text-muted-foreground"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-[11px]">Billing Dispute</div>
                    <div className="text-[10px]">{activeCase.isUnderDispute ? "Active Dispute" : "Clean"}</div>
                  </div>
                  {activeCase.isUnderDispute ? <AlertTriangle className="h-4 w-4 text-purple-600" /> : <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGULATORY & POLICY MATRIX */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Segment Rules Matrix */}
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" /> Segment Dunning Strategy Matrix
            </h3>
            <p className="text-xs text-muted-foreground">
              Configured policies governing outreach channels, thresholds, and robocall restrictions by customer segment.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Enterprise Tier 1 (VIP Strategic)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                    White-Glove Only
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Robocalls strictly forbidden. All dunning past 60 days routes exclusively to Strategic Account Director as a high-priority CRM Task.
                </p>
                <div className="text-[10px] text-muted-foreground font-mono pt-1">
                  Cool-down: 96 hours • Channel: Executive Email & Task
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Mid-Market Standard</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                    Balanced Cadence
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Payment links sent at 14 DPD; WhatsApp at 30 DPD. Telephony enabled after 60 DPD subject to DNC and TCPA verification.
                </p>
                <div className="text-[10px] text-muted-foreground font-mono pt-1">
                  Cool-down: 72 hours • Channels: Email, WhatsApp, Agent Voice
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">SMB High-Velocity</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    High Automation
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Rapid omnichannel outreach. WhatsApp + Payment link deployed at 15 DPD. Telephony deployed at 45 DPD.
                </p>
                <div className="text-[10px] text-muted-foreground font-mono pt-1">
                  Cool-down: 48 hours • Channels: Multi-channel automated
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">High-Risk / Default</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400">
                    Expedited Escalation
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Zero grace period. Immediate escalation to Credit Committee past 45 DPD. Broken PTP triggers immediate account suspension.
                </p>
                <div className="text-[10px] text-muted-foreground font-mono pt-1">
                  Cool-down: 24 hours • Channels: Escalation, Legal Notice
                </div>
              </div>
            </div>
          </div>

          {/* Legal Windows & Regulatory Framework */}
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Regulatory Communication Windows
            </h3>
            <p className="text-xs text-muted-foreground">
              Jurisdictional compliance rules automatically enforced based on recipient country and timezone.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">United States (TCPA / FDCPA)</span>
                  <span className="font-mono text-[11px] text-emerald-600 font-bold">08:00 - 21:00 Local</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  47 U.S.C. § 227 limits commercial and debt collection contacts to 08:00 - 21:00 recipient local time. Max 7 calls per 7 consecutive days.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">India (TRAI UCC Regulations)</span>
                  <span className="font-mono text-[11px] text-emerald-600 font-bold">09:00 - 21:00 IST</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Unsolicited Commercial Communication rules mandate strict national DND scrubbing. Commercial calls and messages prohibited on Sundays.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">United Kingdom (FCA Consumer Credit)</span>
                  <span className="font-mono text-[11px] text-emerald-600 font-bold">08:00 - 20:00 GMT</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Financial Conduct Authority (CONC 7.9) prohibits contacting debtors at unreasonable times. Weekend calls restricted to 09:00 - 17:00.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROMISE-TO-PAY (PTP) LEDGER */}
      {activeTab === "ptp" && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Promise-to-Pay (PTP) Commitments</h3>
              <p className="text-xs text-muted-foreground">
                Debtor payment commitments. Active PTPs pause dunning; broken PTPs trigger immediate severity escalation.
              </p>
            </div>
            <button
              onClick={() => setIsPtpModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" /> Log New PTP
            </button>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-3">Debtor</th>
                  <th className="py-2.5 px-3">Invoice</th>
                  <th className="py-2.5 px-3 text-right">Promised Amount</th>
                  <th className="py-2.5 px-3">Maturity Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Recorded By</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ptps.map((ptp) => (
                  <tr key={ptp.id} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-semibold text-foreground">{ptp.customerName}</td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{ptp.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      ${ptp.ptpAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 font-mono">{ptp.promisedDate}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                          ptp.status === "honored"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : ptp.status === "broken"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {ptp.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{ptp.recordedBy}</td>
                    <td className="py-2.5 px-3 text-right">
                      {ptp.status === "pending" && (
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleUpdatePtpStatus(ptp.id, "honored")}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
                          >
                            Mark Honored
                          </button>
                          <button
                            onClick={() => handleUpdatePtpStatus(ptp.id, "broken")}
                            className="px-2 py-1 rounded border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-[11px] font-semibold transition-colors"
                          >
                            Mark Broken
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE & ACTION AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Compliance & Action Audit Ledger</h3>
            <p className="text-xs text-muted-foreground">
              Immutable record of every collections action executed, suppressed, or scheduled, including legal justifications.
            </p>
          </div>

          <div className="space-y-3">
            {audits.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  item.status === "suppressed"
                    ? "bg-amber-500/5 border-amber-500/30"
                    : "bg-emerald-500/5 border-emerald-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        item.status === "suppressed"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {item.status.toUpperCase()}: {item.action.toUpperCase()}
                    </span>
                    <span className="font-bold text-foreground">{item.customerName}</span>
                    <span className="font-mono text-muted-foreground">({item.invoiceNumber})</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.timestamp}</span>
                </div>

                <p className="text-xs text-muted-foreground">{item.explanation}</p>

                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                  <span>Channel: <strong className="text-foreground">{item.channel}</strong></span>
                  {item.suppressionReason && (
                    <span>Reason: <strong className="text-amber-600">{item.suppressionReason.replace(/_/g, " ")}</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PTP REGISTRATION MODAL */}
      {isPtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Register Promise-to-Pay (PTP)</h3>
                <p className="text-[11px] text-muted-foreground">
                  Debtor: {activeCase.companyName} ({activeCase.invoiceNumber})
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Promised Settlement Amount ($)</label>
                <input
                  type="number"
                  value={ptpAmountInput}
                  onChange={(e) => setPtpAmountInput(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Maturity Date (Promised Payment Date)</label>
                <input
                  type="date"
                  value={ptpDateInput}
                  onChange={(e) => setPtpDateInput(e.target.value)}
                  className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Debtor Commitment Notes</label>
                <textarea
                  rows={3}
                  value={ptpNotesInput}
                  onChange={(e) => setPtpNotesInput(e.target.value)}
                  placeholder="e.g. Accounts payable director confirmed payment run will clear on Friday..."
                  className="w-full p-2 rounded-lg bg-card border border-border text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setIsPtpModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePtp}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Save PTP Commitment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
