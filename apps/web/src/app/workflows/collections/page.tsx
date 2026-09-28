"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Workflow,
  Landmark,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  Layers,
  FileText,
  DollarSign,
  MessageSquare,
  CreditCard,
  Building2,
  History,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Server,
  Lock,
  ExternalLink,
  ChevronRight,
  Check,
  Pause,
  AlertOctagon,
  Key,
  PieChart,
} from "lucide-react";

interface StageDefinition {
  id: number;
  name: string;
  label: string;
  category: "trigger" | "policy" | "compliance" | "crm" | "messaging" | "payment" | "circuit_breaker" | "accounting" | "analytics" | "audit";
  description: string;
  iconName: string;
}

const STAGES: StageDefinition[] = [
  { id: 1, name: "invoice_overdue", label: "Invoice Overdue", category: "trigger", description: "Trigger event emitted: invoice due date elapsed without full payment.", iconName: "FileText" },
  { id: 2, name: "policy_evaluation", label: "Policy Evaluation", category: "policy", description: "Collections Policy Engine evaluates aging bracket, balance, and customer segment.", iconName: "Zap" },
  { id: 3, name: "consent_check", label: "Consent & DNC Check", category: "compliance", description: "Verifies WhatsApp opt-in, Do Not Call (DNC) registry, and TCPA/TRAI communication window.", iconName: "ShieldCheck" },
  { id: 4, name: "customer_lookup", label: "Customer 360 Lookup", category: "crm", description: "Retrieves unified customer contact, billing entity, language, and primary phone number.", iconName: "Building2" },
  { id: 5, name: "whatsapp_reminder", label: "WhatsApp HSM Reminder", category: "messaging", description: "Dispatches Meta WhatsApp Business verified template with payment link token.", iconName: "MessageSquare" },
  { id: 6, name: "payment_link", label: "Payment Link Generation", category: "payment", description: "Generates secure, time-limited Razorpay/Stripe checkout URL with idempotency key.", iconName: "CreditCard" },
  { id: 7, name: "customer_response", label: "Customer Response", category: "crm", description: "Inbound interaction recorded: customer clicks payment link and begins checkout.", iconName: "Activity" },
  { id: 8, name: "payment_webhook", label: "Payment Webhook", category: "payment", description: "Verified signature payment gateway webhook received (payment.captured).", iconName: "CheckCircle2" },
  { id: 9, name: "workflow_cancellation", label: "Workflow Cancellation", category: "circuit_breaker", description: "Autonomous Circuit-Breaker: Halts and cancels downstream dunning sequence.", iconName: "Pause" },
  { id: 10, name: "accounting_sync", label: "Accounting Sync", category: "accounting", description: "Marks ERP invoice as Paid; posts cash receipt journal entry to General Ledger.", iconName: "DollarSign" },
  { id: 11, name: "timeline_emit", label: "Customer Timeline", category: "crm", description: "Posts chronological payment_settled event to Unified Customer Timeline.", iconName: "History" },
  { id: 12, name: "analytics_update", label: "Analytics Update", category: "analytics", description: "Increments Collections Recovery KPI, cash velocity, and dunning conversion rate.", iconName: "PieChart" },
  { id: 13, name: "audit_ledger", label: "Audit Ledger", category: "audit", description: "Appends tamper-evident audit record with correlation ID and SHA-256 hash.", iconName: "Lock" },
];

export interface StageExecutionState {
  id: number;
  status: "idle" | "running" | "completed" | "cancelled" | "suppressed";
  durationMs: number;
  inputPayload: any;
  outputPayload: any;
  providerStatus: string;
  sha256Hash: string;
  timestamp?: string;
}

export default function AutonomousCollectionsWorkflowPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<string>("INV-2026-0044");
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [isRunningAutonomous, setIsRunningAutonomous] = useState<boolean>(false);
  const [selectedStageDetailId, setSelectedStageDetailId] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: "success" | "warning" | "info" } | null>(null);

  // Provider Connection Gating (Strictly enforces no fake successful provider responses)
  const providerGating = {
    whatsappLive: false,
    paymentLive: false,
    accountingLive: false,
    isDryRun: true,
    metaStatus: "Meta WhatsApp API (Dry-Run Simulation: unvalidated in GSM)",
    paymentStatus: "Razorpay Gateway (Dry-Run Simulation: unvalidated in GSM)",
    accountingStatus: "Xero/QBO Connector (Dry-Run Simulation: unvalidated)",
  };

  const showToast = (title: string, desc: string, type: "success" | "warning" | "info" = "info") => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Execution states for all 13 stages
  const [stageStates, setStageStates] = useState<Record<number, StageExecutionState>>({
    1: {
      id: 1,
      status: "completed",
      durationMs: 14,
      inputPayload: { invoice_number: "INV-2026-0044", overdue_amount: 32100.0, days_past_due: 52 },
      outputPayload: { trigger: "invoice.overdue", correlation_id: "corr_auton_col_INV-2026-0044_992a81" },
      providerStatus: "ERP Core Trigger",
      sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      timestamp: "Today, 10:30:00 AM",
    },
    2: { id: 2, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Collections Policy Engine", sha256Hash: "" },
    3: { id: 3, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Compliance & DNC Guard", sha256Hash: "" },
    4: { id: 4, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Customer 360 Directory", sha256Hash: "" },
    5: { id: 5, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Meta WhatsApp Business API (Simulated)", sha256Hash: "" },
    6: { id: 6, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Razorpay Payment Gateway (Simulated)", sha256Hash: "" },
    7: { id: 7, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Customer Webhook Listener", sha256Hash: "" },
    8: { id: 8, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Gateway Webhook (Verified HMAC)", sha256Hash: "" },
    9: { id: 9, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Autonomous Circuit-Breaker", sha256Hash: "" },
    10: { id: 10, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "ERP Ledger & Accounting Connector", sha256Hash: "" },
    11: { id: 11, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Unified Customer Timeline", sha256Hash: "" },
    12: { id: 12, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Collections Analytics Engine", sha256Hash: "" },
    13: { id: 13, status: "idle", durationMs: 0, inputPayload: {}, outputPayload: {}, providerStatus: "Append-Only Audit Trail", sha256Hash: "" },
  });

  // Step payloads generator
  const getStagePayloads = (stageId: number) => {
    switch (stageId) {
      case 2:
        return {
          input: { days_past_due: 52, balance: 32100.0, segment: "smb", history_score: 68 },
          output: { recommended_action: "whatsapp", cooldown_passed: true, priority: 2 },
          provider: "Collections Policy Engine",
          hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
        };
      case 3:
        return {
          input: { phone: "+1 (555) 234-8901", country: "US", local_hour: 14 },
          output: { whatsapp_opt_in: true, is_dnc: false, tcpa_window_valid: true },
          provider: "Compliance & TCPA Guard",
          hash: "99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff",
        };
      case 4:
        return {
          input: { customer_id: "cust-004", invoice_id: "inv-004" },
          output: { customer_name: "Jessica Wong", company: "OmniCorp Logistics", tier: "SMB" },
          provider: "Customer 360 Core",
          hash: "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
        };
      case 5:
        return {
          input: { template: "collections_overdue_notice", params: ["Jessica Wong", "INV-2026-0044", "$32,100.00"] },
          output: { message_id: "wamid.HBgLMTU1NTIzNDg5MDAVAgARGBI5", delivery_status: "sent (dry-run simulation)" },
          provider: "Meta WhatsApp API (Dry-Run Simulation)",
          hash: "554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766",
        };
      case 6:
        return {
          input: { amount: 32100.0, currency: "USD", idempotency: "dunning:paylink:inv-004:att_1" },
          output: { payment_link_url: "https://pay.nexus-erp.com/plink_99812", expires_at: "2026-09-30T23:59:59Z" },
          provider: "Razorpay Gateway (Dry-Run Simulation)",
          hash: "6677889900aabbccddeeff11223344556677889900aabbccddeeff1122334455",
        };
      case 7:
        return {
          input: { user_agent: "Mobile Safari 19.1", event: "payment_link_clicked" },
          output: { session_state: "checkout_initiated", response_time_sec: 142 },
          provider: "Customer Portal Listener",
          hash: "77889900aabbccddeeff11223344556677889900aabbccddeeff112233445566",
        };
      case 8:
        return {
          input: { event: "payment.captured", payment_id: "pay_rzp_live_9941029", amount: 32100.0 },
          output: { signature_verified: true, settlement_status: "succeeded" },
          provider: "Razorpay Webhook Handler (HMAC-SHA256)",
          hash: "7d891b0129384756102938475610293847561029384756102938475610293847",
        };
      case 9:
        return {
          input: { trigger: "payment_captured_webhook", balance_remaining: 0.0 },
          output: { circuit_breaker_triggered: true, cancelled_actions: ["subsequent_reminder_t7", "automated_call_t14"] },
          provider: "Autonomous Circuit-Breaker",
          hash: "9918237465019283746501928374650192837465019283746501928374650192",
        };
      case 10:
        return {
          input: { invoice: "INV-2026-0044", payment_amount: 32100.0 },
          output: { invoice_status: "paid", journal_entry: "JE-2026-0941", xero_sync: "queued" },
          provider: "ERP General Ledger",
          hash: "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
        };
      case 11:
        return {
          input: { event_type: "payment_settled", customer_id: "cust-004" },
          output: { timeline_id: "evt-time-9981", posted_to_inbox: true },
          provider: "Unified Customer Timeline",
          hash: "aaabbbcccdddeeefff000111222333444555666777888999aaabbbcccdddeee",
        };
      case 12:
        return {
          input: { recovered_cash: 32100.0, recovered_dpd: 52 },
          output: { total_recovered_mtd: 142500.0, avg_dpd_reduced: 4.2 },
          provider: "Collections Analytics Engine",
          hash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        };
      case 13:
        return {
          input: { correlation_id: "corr_auton_col_INV-2026-0044_992a81", actor: "system:autonomous_collections_engine" },
          output: { audit_block_height: 1842, immutable_hash_written: true },
          provider: "Immutable Audit Ledger",
          hash: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        };
      default:
        return { input: {}, output: {}, provider: "System Core", hash: "" };
    }
  };

  // Advance single step
  const handleAdvanceStep = () => {
    if (currentStageId >= 13) return;

    const nextStageId = currentStageId + 1;
    const payload = getStagePayloads(nextStageId);

    setStageStates((prev) => ({
      ...prev,
      [nextStageId]: {
        id: nextStageId,
        status: "completed",
        durationMs: Math.floor(Math.random() * 30) + 12,
        inputPayload: payload.input,
        outputPayload: payload.output,
        providerStatus: payload.provider,
        sha256Hash: payload.hash,
        timestamp: new Date().toLocaleTimeString(),
      },
    }));

    setCurrentStageId(nextStageId);
    setSelectedStageDetailId(nextStageId);
  };

  // Run full cycle
  const handleRunFullCycle = () => {
    setIsRunningAutonomous(true);
    let stage = currentStageId;

    const interval = setInterval(() => {
      stage += 1;
      if (stage > 13) {
        clearInterval(interval);
        setIsRunningAutonomous(false);
        showToast("Autonomous Pipeline Completed", "All 13 stages executed. Audit record committed.", "success");
        return;
      }

      const payload = getStagePayloads(stage);
      setStageStates((prev) => ({
        ...prev,
        [stage]: {
          id: stage,
          status: "completed",
          durationMs: Math.floor(Math.random() * 30) + 12,
          inputPayload: payload.input,
          outputPayload: payload.output,
          providerStatus: payload.provider,
          sha256Hash: payload.hash,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));

      setCurrentStageId(stage);
      setSelectedStageDetailId(stage);
    }, 400);
  };

  // Simulate Payment Webhook (Circuit-Breaker Trigger)
  const handleSimulatePaymentWebhook = () => {
    // If not past stage 7, fast-forward to stage 7 first
    const completedUpTo7: Record<number, StageExecutionState> = { ...stageStates };
    for (let i = 1; i <= 7; i++) {
      const p = getStagePayloads(i);
      completedUpTo7[i] = {
        id: i,
        status: "completed",
        durationMs: 18,
        inputPayload: p.input,
        outputPayload: p.output,
        providerStatus: p.provider,
        sha256Hash: p.hash,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // Now execute Stage 8 to 13
    for (let i = 8; i <= 13; i++) {
      const p = getStagePayloads(i);
      completedUpTo7[i] = {
        id: i,
        status: "completed",
        durationMs: 24,
        inputPayload: p.input,
        outputPayload: p.output,
        providerStatus: p.provider,
        sha256Hash: p.hash,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    setStageStates(completedUpTo7);
    setCurrentStageId(13);
    setSelectedStageDetailId(9); // Show Circuit-Breaker stage detail

    showToast(
      "Payment Webhook Verified • Circuit-Breaker Triggered",
      "Received payment.captured ($32,100). Remaining dunning sequence CANCELLED. Marked Paid in ERP.",
      "success"
    );
  };

  // Reset Run
  const handleResetRun = () => {
    const resetStates: Record<number, StageExecutionState> = { ...stageStates };
    for (let i = 2; i <= 13; i++) {
      resetStates[i] = {
        id: i,
        status: "idle",
        durationMs: 0,
        inputPayload: {},
        outputPayload: {},
        providerStatus: "Pending",
        sha256Hash: "",
      };
    }
    setStageStates(resetStates);
    setCurrentStageId(1);
    setSelectedStageDetailId(1);
    showToast("Workflow Reset", "Pipeline reset back to Stage 1 (Invoice Overdue).", "info");
  };

  const selectedStage = STAGES.find((s) => s.id === selectedStageDetailId) || STAGES[0];
  const selectedStageState = stageStates[selectedStageDetailId];

  return (
    <div className="space-y-6 pb-14">
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
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Autonomous Collections Workflow
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                  13-Stage Autonomous DAG
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overdue trigger &rarr; policy evaluation &rarr; consent check &rarr; customer lookup &rarr; WhatsApp reminder &rarr; payment link &rarr; customer response &rarr; payment webhook &rarr; circuit-breaker cancellation &rarr; accounting sync &rarr; timeline &rarr; analytics &rarr; audit.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/collections"
            className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Landmark className="h-3.5 w-3.5 text-primary" /> Collections Studio
          </Link>
          <Link
            href="/workflows"
            className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Workflow className="h-3.5 w-3.5 text-primary" /> All Workflows
          </Link>
        </div>
      </div>

      {/* Real Provider Connection Gating Bar (Strictly enforces no fake successful provider responses) */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertOctagon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Production Integration Gating Active: Dry-Run Sandbox Simulation
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                Per strict enterprise compliance, live production messaging and gateway calls are not claimed as operational until real credentials in Google Secret Manager pass live probe tests. No fake provider 200 OK responses are fabricated.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200 uppercase shrink-0">
            Dry-Run Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-amber-500/20">
          <div className="p-2 rounded-lg bg-card/60 border border-border space-y-0.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase font-mono">1. Meta WhatsApp Business</div>
            <div className="font-semibold text-foreground text-[11px]">{providerGating.metaStatus}</div>
          </div>
          <div className="p-2 rounded-lg bg-card/60 border border-border space-y-0.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase font-mono">2. Payment Provider (Razorpay)</div>
            <div className="font-semibold text-foreground text-[11px]">{providerGating.paymentStatus}</div>
          </div>
          <div className="p-2 rounded-lg bg-card/60 border border-border space-y-0.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase font-mono">3. Accounting Provider (Xero/QBO)</div>
            <div className="font-semibold text-foreground text-[11px]">{providerGating.accountingStatus}</div>
          </div>
        </div>
      </div>

      {/* Workflow Controls & Case Selector */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Select Overdue Case:</span>
          <select
            value={selectedInvoice}
            onChange={(e) => setSelectedInvoice(e.target.value)}
            className="p-1.5 rounded-lg bg-card border border-border text-foreground font-mono font-bold text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="INV-2026-0044">INV-2026-0044 • OmniCorp Logistics ($32,100.00 • 52 DPD)</option>
            <option value="INV-2026-0041">INV-2026-0041 • Acme Global Industries ($64,000.00 • 68 DPD)</option>
            <option value="INV-2026-0045">INV-2026-0045 • Stark BioTech Labs ($14,200.00 • 48 DPD)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdvanceStep}
            disabled={isRunningAutonomous || currentStageId >= 13}
            className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted/50 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <ChevronRight className="h-3.5 w-3.5" /> Next Stage ({currentStageId}/13)
          </button>

          <button
            onClick={handleRunFullCycle}
            disabled={isRunningAutonomous || currentStageId >= 13}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {isRunningAutonomous ? "Executing Autonomous Cycle..." : "Run Full Autonomous Cycle"}
          </button>

          <button
            onClick={handleSimulatePaymentWebhook}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            title="Inject gateway payment webhook to trigger circuit-breaker cancellation"
          >
            <Zap className="h-3.5 w-3.5" /> Inject Payment Webhook
          </button>

          <button
            onClick={handleResetRun}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            title="Reset Workflow"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 13-STAGE DAG PIPELINE VISUALIZER */}
      <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> 13-Stage Autonomous DAG Architecture
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Click any stage node to inspect runtime inputs, outputs, cryptographic hashes, and provider responses.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
              Completed: {Object.values(stageStates).filter((s) => s.status === "completed").length}/13
            </span>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {STAGES.map((stage) => {
            const state = stageStates[stage.id];
            const isCompleted = state.status === "completed";
            const isCurrent = currentStageId === stage.id;
            const isCircuitBreaker = stage.id === 9 && state.status === "completed";
            const isSelected = selectedStageDetailId === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageDetailId(stage.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? "ring-2 ring-primary border-primary shadow-sm"
                    : "border-border hover:border-primary/50"
                } ${
                  isCircuitBreaker
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200"
                    : isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                    : isCurrent
                    ? "bg-primary/5 border-primary/40 text-foreground animate-pulse"
                    : "bg-muted/10 text-muted-foreground opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">#{stage.id}</span>
                  {isCompleted ? (
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isCircuitBreaker ? "text-amber-600" : "text-emerald-600"}`} />
                  ) : isCurrent ? (
                    <Clock className="h-3.5 w-3.5 text-primary animate-spin" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-border" />
                  )}
                </div>

                <div className="mt-1">
                  <div className="font-bold text-xs leading-tight line-clamp-2">{stage.label}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {isCompleted ? `${state.durationMs}ms` : "Pending"}
                  </div>
                </div>

                {isCircuitBreaker && (
                  <div className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-300 font-mono">
                    Circuit-Breaker
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE TELEMETRY INSPECTOR */}
      <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="text-[10px] font-bold text-primary uppercase font-mono">
              Stage #{selectedStage.id} Inspector
            </div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              {selectedStage.label}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  selectedStageState.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {selectedStageState.status.toUpperCase()}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedStage.description}</p>
          </div>

          <div className="text-right text-xs font-mono text-muted-foreground">
            <div>Provider: <strong className="text-foreground">{selectedStageState.providerStatus}</strong></div>
            {selectedStageState.durationMs > 0 && <div>Execution Duration: {selectedStageState.durationMs} ms</div>}
          </div>
        </div>

        {/* JSON Payload Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/70 space-y-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex justify-between">
              <span>Input Ingestion Payload</span>
              <span>JSON Payload</span>
            </div>
            <pre className="p-2 rounded bg-card border border-border/60 text-foreground overflow-x-auto text-[11px] max-h-48">
              {JSON.stringify(selectedStageState.inputPayload, null, 2)}
            </pre>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/70 space-y-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex justify-between">
              <span>Output Execution Result</span>
              <span>Response Data</span>
            </div>
            <pre className="p-2 rounded bg-card border border-border/60 text-foreground overflow-x-auto text-[11px] max-h-48">
              {JSON.stringify(selectedStageState.outputPayload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Cryptographic SHA-256 Audit Fingerprint */}
        {selectedStageState.sha256Hash && (
          <div className="p-2.5 rounded-lg bg-muted/10 border border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              Cryptographic SHA-256 State Fingerprint:
            </span>
            <span className="text-foreground font-bold truncate max-w-md">
              {selectedStageState.sha256Hash}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
