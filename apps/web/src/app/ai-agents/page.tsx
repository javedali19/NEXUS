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
} from "lucide-react";

// Types
export interface AgentModel {
  id: string;
  name: string;
  slug: string;
  role: "collections_copilot" | "lead_qualifier" | "invoice_auditor" | "dispatch_optimizer";
  description: string;
  status: "active" | "draft" | "paused" | "deprecated";
  currentVersion: string;
  modelTarget: string;
  capabilitiesCount: number;
  toolsCount: number;
  totalRuns: number;
  systemInstructions: string;
}

export interface AgentVersionModel {
  id: string;
  agentId: string;
  versionNumber: string;
  environment: "production" | "staging" | "archived";
  modelName: string;
  temperature: number;
  maxTokens: number;
  promptSnapshot: string;
  changelog: string;
  deployedAt: string;
  isActive: boolean;
}

export interface AgentToolModel {
  id: string;
  toolName: string;
  toolType: "read_only" | "idempotent_write" | "sensitive_mutation";
  description: string;
  requiredCapability: string;
  isApprovalRequired: boolean;
  parametersSchema: string;
}

export interface AgentPolicyModel {
  id: string;
  policyName: string;
  policyType: "rate_limit" | "approval_threshold" | "pii_masking" | "budget_cap";
  ruleDescription: string;
  isEnforced: boolean;
  blockedCount: number;
}

export interface AgentRunModel {
  id: string;
  agentName: string;
  correlationId: string;
  triggerSource: string;
  status: "completed" | "awaiting_approval" | "running" | "failed";
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  durationMs: number;
  startedAt: string;
  actionSummary: string;
}

export interface AgentApprovalModel {
  id: string;
  runId: string;
  agentName: string;
  requestedAction: string;
  riskLevel: "critical" | "high" | "medium";
  proposedPayload: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  notes?: string;
}

export interface AgentFailureModel {
  id: string;
  runId: string;
  agentName: string;
  failureCategory: "policy_blocked" | "schema_validation" | "tool_timeout" | "permission_denied";
  errorMessage: string;
  remediationHint: string;
  timestamp: string;
}

export interface AgentAuditModel {
  id: string;
  eventType: string;
  actorName: string;
  description: string;
  sha256Hash: string;
  timestamp: string;
}

const INITIAL_AGENTS: AgentModel[] = [
  {
    id: "agt-001",
    name: "Collections Copilot",
    slug: "collections-copilot",
    role: "collections_copilot",
    description: "Evaluates collections policy, verifies DNC/consent, crafts personalized WhatsApp notices, and generates payment links.",
    status: "active",
    currentVersion: "v1.2.0",
    modelTarget: "GPT-4o (Azure OpenAI)",
    capabilitiesCount: 4,
    toolsCount: 5,
    totalRuns: 642,
    systemInstructions: "You are the Enterprise Collections Copilot. Act with professional empathy. Strictly respect Do Not Call registries and communication windows. Never fabricate settlement discounts without human approval.",
  },
  {
    id: "agt-002",
    name: "Lead Qualification Agent",
    slug: "lead-qualifier",
    role: "lead_qualifier",
    description: "Interviews inbound commercial prospects, calculates B2B intent score, enriches company firmographics, and schedules AE calls.",
    status: "active",
    currentVersion: "v1.1.0",
    modelTarget: "Claude 3.5 Sonnet",
    capabilitiesCount: 3,
    toolsCount: 4,
    totalRuns: 420,
    systemInstructions: "You are the Inbound Lead Qualifier. Extract budget, authority, need, and timeline (BANT). Enrich contact records via CRM domain APIs.",
  },
  {
    id: "agt-003",
    name: "Invoice OCR Auditor",
    slug: "invoice-auditor",
    role: "invoice_auditor",
    description: "Validates Mathpix tabular extractions, verifies arithmetic invariants, matches master vendor IDs, and flags duplicate claims.",
    status: "active",
    currentVersion: "v1.0.0",
    modelTarget: "Gemini 1.5 Pro",
    capabilitiesCount: 3,
    toolsCount: 3,
    totalRuns: 280,
    systemInstructions: "Verify mathematical invariants: sum(qty * price) == subtotal. Grand total must equal subtotal + tax - discount. Flag any mismatch exceeding 5 cents.",
  },
  {
    id: "agt-004",
    name: "Fleet & Dispatch Optimizer",
    slug: "dispatch-optimizer",
    role: "dispatch_optimizer",
    description: "Optimizes multi-stop courier routes, monitors real-time traffic anomalies, and notifies shipping recipients via SMS.",
    status: "active",
    currentVersion: "v1.0.1",
    modelTarget: "GPT-4o",
    capabilitiesCount: 2,
    toolsCount: 3,
    totalRuns: 140,
    systemInstructions: "Calculate optimal delivery sequences within driver HOS (Hours of Service) constraints.",
  },
];

const INITIAL_VERSIONS: AgentVersionModel[] = [
  {
    id: "ver-01",
    agentId: "agt-001",
    versionNumber: "v1.2.0",
    environment: "production",
    modelName: "gpt-4o",
    temperature: 0.2,
    maxTokens: 2048,
    promptSnapshot: "Strict Collections Copilot Prompt v1.2 with TRAI & TCPA boundary adherence.",
    changelog: "Added mandatory approval check when proposing settlement discounts >10%.",
    deployedAt: "Sep 21, 2026",
    isActive: true,
  },
  {
    id: "ver-02",
    agentId: "agt-001",
    versionNumber: "v1.3.0-rc",
    environment: "staging",
    modelName: "gpt-4o-mini",
    temperature: 0.1,
    maxTokens: 2048,
    promptSnapshot: "Cost-optimized collections model with few-shot dunning examples.",
    changelog: "Testing latency reduction on high-throughput WhatsApp notice generation.",
    deployedAt: "Yesterday, 14:00",
    isActive: false,
  },
];

const INITIAL_TOOLS: AgentToolModel[] = [
  {
    id: "tool-01",
    toolName: "lookup_invoice",
    toolType: "read_only",
    description: "Fetches normalized invoice header, line items, and current payment status by invoice number.",
    requiredCapability: "invoices:read",
    isApprovalRequired: false,
    parametersSchema: JSON.stringify({ type: "object", properties: { invoice_number: { type: "string" } }, required: ["invoice_number"] }, null, 2),
  },
  {
    id: "tool-02",
    toolName: "generate_payment_link",
    toolType: "idempotent_write",
    description: "Generates secure, time-limited Razorpay/Stripe payment checkout URL. Requires approval if amount >$25k.",
    requiredCapability: "payments:generate_link",
    isApprovalRequired: false,
    parametersSchema: JSON.stringify({ type: "object", properties: { amount: { type: "number" }, currency: { type: "string" } }, required: ["amount"] }, null, 2),
  },
  {
    id: "tool-03",
    toolName: "apply_settlement_discount",
    toolType: "sensitive_mutation",
    description: "Proposes or applies a settlement discount to close delinquent balance. Hard cap 15%. Approval required if >10%.",
    requiredCapability: "invoices:discount",
    isApprovalRequired: true,
    parametersSchema: JSON.stringify({ type: "object", properties: { invoice_id: { type: "string" }, discount_percent: { type: "number" } }, required: ["invoice_id", "discount_percent"] }, null, 2),
  },
  {
    id: "tool-04",
    toolName: "send_whatsapp_template",
    toolType: "idempotent_write",
    description: "Dispatches approved Meta WhatsApp Business template. Strictly validates opt-in consent and TCPA window.",
    requiredCapability: "whatsapp:send_notice",
    isApprovalRequired: false,
    parametersSchema: JSON.stringify({ type: "object", properties: { recipient_phone: { type: "string" }, template_name: { type: "string" } }, required: ["recipient_phone", "template_name"] }, null, 2),
  },
  {
    id: "tool-05",
    toolName: "create_crm_task",
    toolType: "idempotent_write",
    description: "Creates follow-up task assigned to Collections Specialist or Account Director in CRM.",
    requiredCapability: "crm:write_tasks",
    isApprovalRequired: false,
    parametersSchema: JSON.stringify({ type: "object", properties: { title: { type: "string" }, priority: { type: "string" } }, required: ["title"] }, null, 2),
  },
];

const INITIAL_POLICIES: AgentPolicyModel[] = [
  {
    id: "pol-01",
    policyName: "Max Actions Rate Limit",
    policyType: "rate_limit",
    ruleDescription: "Limits agent to maximum 50 external tool actions per hour to prevent accidental spamming.",
    isEnforced: true,
    blockedCount: 3,
  },
  {
    id: "pol-02",
    policyName: "Financial Mutation Approval Gate",
    policyType: "approval_threshold",
    ruleDescription: "Any proposed settlement discount >10.0% or payment link >$25,000 must halt for human manager sign-off.",
    isEnforced: true,
    blockedCount: 12,
  },
  {
    id: "pol-03",
    policyName: "PII & Banking Masking Guardrail",
    policyType: "pii_masking",
    ruleDescription: "Scrubs credit card numbers, SSNs, and raw bank account details before passing data to LLM prompts.",
    isEnforced: true,
    blockedCount: 4,
  },
];

const INITIAL_RUNS: AgentRunModel[] = [
  {
    id: "run-9842",
    agentName: "Collections Copilot",
    correlationId: "corr_agt_9842_inv044",
    triggerSource: "workflow_autonomous",
    status: "awaiting_approval",
    promptTokens: 1420,
    completionTokens: 280,
    costUsd: 0.0084,
    durationMs: 840,
    startedAt: "10 mins ago",
    actionSummary: "Proposed 12.5% settlement discount ($4,012.50) on overdue invoice INV-2026-0044.",
  },
  {
    id: "run-9841",
    agentName: "Collections Copilot",
    correlationId: "corr_agt_9841_inv041",
    triggerSource: "workflow_autonomous",
    status: "completed",
    promptTokens: 1100,
    completionTokens: 190,
    costUsd: 0.0052,
    durationMs: 620,
    startedAt: "24 mins ago",
    actionSummary: "Dispatched WhatsApp HSM notice with Razorpay link to Jessica Wong ($32,100).",
  },
  {
    id: "run-9840",
    agentName: "Lead Qualification Agent",
    correlationId: "corr_agt_9840_lead881",
    triggerSource: "user_chat",
    status: "completed",
    promptTokens: 890,
    completionTokens: 310,
    costUsd: 0.0061,
    durationMs: 740,
    startedAt: "45 mins ago",
    actionSummary: "Interviewed prospect from Acme Cloud. Intent score 88. Assigned to Account Exec.",
  },
];

const INITIAL_APPROVALS: AgentApprovalModel[] = [
  {
    id: "appr-01",
    runId: "run-9842",
    agentName: "Collections Copilot",
    requestedAction: "apply_settlement_discount",
    riskLevel: "high",
    proposedPayload: JSON.stringify({ invoice_number: "INV-2026-0044", discount_percent: 12.5, discount_amount: 4012.5, reason: "Debtor offered instant wire settlement if 12.5% discount granted." }, null, 2),
    status: "pending",
    requestedAt: "10 mins ago",
  },
  {
    id: "appr-02",
    runId: "run-9839",
    agentName: "Collections Copilot",
    requestedAction: "generate_payment_link",
    riskLevel: "medium",
    proposedPayload: JSON.stringify({ invoice_number: "INV-2026-0041", amount: 64000.0, client: "Acme Global Industries", note: "Large single-transaction checkout link generation." }, null, 2),
    status: "pending",
    requestedAt: "1 hour ago",
  },
];

const INITIAL_FAILURES: AgentFailureModel[] = [
  {
    id: "fail-01",
    runId: "run-9835",
    agentName: "Collections Copilot",
    failureCategory: "policy_blocked",
    errorMessage: "Policy Guardrail Block: Agent attempted to apply 20.0% settlement discount, which exceeds the absolute ceiling of 15.0%.",
    remediationHint: "Adjust system prompt instructions to restrict discount proposals to maximum 10-15%.",
    timestamp: "Today, 08:15 AM",
  },
  {
    id: "fail-02",
    runId: "run-9829",
    agentName: "Lead Qualification Agent",
    failureCategory: "permission_denied",
    errorMessage: "Agent lacked capability 'invoices:read'. Attempted to call tool 'lookup_invoice' without authorization.",
    remediationHint: "Grant 'invoices:read' capability to Lead Qualification Agent if invoice lookups are required.",
    timestamp: "Yesterday, 17:30 PM",
  },
];

const INITIAL_AUDITS: AgentAuditModel[] = [
  {
    id: "aud-01",
    eventType: "action_approval_requested",
    actorName: "Collections Copilot (Agent)",
    description: "Halted execution run run-9842: Proposed settlement discount 12.5% requires manager approval.",
    sha256Hash: "88a91b0129384756102938475610293847561029384756102938475610293847",
    timestamp: "10 mins ago",
  },
  {
    id: "aud-02",
    eventType: "tool_invoked",
    actorName: "Collections Copilot (Agent)",
    description: "Invoked tool 'generate_payment_link' for $32,100.00 via Razorpay gateway adapter.",
    sha256Hash: "9918237465019283746501928374650192837465019283746501928374650192",
    timestamp: "24 mins ago",
  },
  {
    id: "aud-03",
    eventType: "policy_enforced",
    actorName: "Governance Guardrail Engine",
    description: "Blocked unauthorized 20% discount attempt on run run-9835.",
    sha256Hash: "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
    timestamp: "Today, 08:15 AM",
  },
];

export default function AiAgentsControlPlanePage() {
  const [activeTab, setActiveTab] = useState<"agents" | "tools" | "policies" | "runs" | "approvals" | "failures" | "audit">("agents");
  const [agents, setAgents] = useState<AgentModel[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("agt-001");
  const [tools, setTools] = useState<AgentToolModel[]>(INITIAL_TOOLS);
  const [policies, setPolicies] = useState<AgentPolicyModel[]>(INITIAL_POLICIES);
  const [runs, setRuns] = useState<AgentRunModel[]>(INITIAL_RUNS);
  const [approvals, setApprovals] = useState<AgentApprovalModel[]>(INITIAL_APPROVALS);
  const [failures, setFailures] = useState<AgentFailureModel[]>(INITIAL_FAILURES);
  const [audits, setAudits] = useState<AgentAuditModel[]>(INITIAL_AUDITS);
  const [isSimulatingRun, setIsSimulatingRun] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: "success" | "warning" | "info" } | null>(null);

  const showToast = (title: string, desc: string, type: "success" | "warning" | "info" = "info") => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedAgent = useMemo(() => {
    return agents.find((a) => a.id === selectedAgentId) || agents[0];
  }, [agents, selectedAgentId]);

  // Handle Approving a Pending Action
  const handleApproveAction = (approvalId: string) => {
    const appr = approvals.find((a) => a.id === approvalId);
    if (!appr) return;

    setApprovals((prev) =>
      prev.map((a) => (a.id === approvalId ? { ...a, status: "approved", notes: "Approved by Financial Controller" } : a))
    );

    // Update corresponding run to completed
    setRuns((prev) =>
      prev.map((r) => (r.id === appr.runId ? { ...r, status: "completed", actionSummary: `${r.actionSummary} [APPROVED BY HUMAN CONTROLLER]` } : r))
    );

    // Emit Audit
    const newAudit: AgentAuditModel = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      eventType: "action_approved",
      actorName: "Sarah Reviewer (Financial Controller)",
      description: `Human-in-the-loop approved sensitive action '${appr.requestedAction}' on run ${appr.runId}.`,
      sha256Hash: "44556677889900aabbccddeeff11223344556677889900aabbccddeeff112233",
      timestamp: "Just now",
    };
    setAudits((prev) => [newAudit, ...prev]);

    showToast("Action Approved", `Approved '${appr.requestedAction}'. Run ${appr.runId} transitioned to Completed.`, "success");
  };

  // Handle Rejecting a Pending Action
  const handleRejectAction = (approvalId: string) => {
    const appr = approvals.find((a) => a.id === approvalId);
    if (!appr) return;

    setApprovals((prev) =>
      prev.map((a) => (a.id === approvalId ? { ...a, status: "rejected", notes: "Rejected by Manager: Exceeds authorized budget." } : a))
    );

    setRuns((prev) =>
      prev.map((r) => (r.id === appr.runId ? { ...r, status: "failed", actionSummary: `${r.actionSummary} [REJECTED BY HUMAN CONTROLLER]` } : r))
    );

    const newAudit: AgentAuditModel = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      eventType: "action_rejected",
      actorName: "Sarah Reviewer (Financial Controller)",
      description: `Rejected proposed action '${appr.requestedAction}' on run ${appr.runId}. Execution halted.`,
      sha256Hash: "1234567890123456789012345678901234567890123456789012345678901234",
      timestamp: "Just now",
    };
    setAudits((prev) => [newAudit, ...prev]);

    showToast("Action Rejected", `Action '${appr.requestedAction}' rejected. Run cancelled.`, "warning");
  };

  // Simulate an Autonomous Agent Run in the Playground
  const handleSimulateAutonomousRun = () => {
    setIsSimulatingRun(true);
    setTimeout(() => {
      setIsSimulatingRun(false);
      const newRunId = `run-${Date.now().toString().slice(-4)}`;
      const newRun: AgentRunModel = {
        id: newRunId,
        agentName: selectedAgent.name,
        correlationId: `corr_play_${newRunId}`,
        triggerSource: "control_plane_playground",
        status: "completed",
        promptTokens: 1250,
        completionTokens: 210,
        costUsd: 0.0058,
        durationMs: 720,
        startedAt: "Just now",
        actionSummary: `Autonomous execution: Invoked tool 'lookup_invoice' and verified payment link requirements.`,
      };

      setRuns((prev) => [newRun, ...prev]);

      const newAudit: AgentAuditModel = {
        id: `aud-${Date.now().toString().slice(-4)}`,
        eventType: "run_executed",
        actorName: `${selectedAgent.name} (Agent)`,
        description: `Executed autonomous run ${newRunId} mediated strictly via typed tools. Zero direct database access.`,
        sha256Hash: "abcdef99887766554433221100aabbccddeeffabcdef99887766554433221100",
        timestamp: "Just now",
      };
      setAudits((prev) => [newAudit, ...prev]);

      showToast("Autonomous Run Completed", `Executed run ${newRunId} via ${selectedAgent.name}. Logged to audit trail.`, "success");
    }, 1200);
  };

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
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                AI Agent Control Plane
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                  Zero Direct DB Access • Mediated Sandbox
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unified agent governance: versions, capabilities, typed tools, permissions, policy guardrails, human approvals, and cryptographic audit.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ai-sales"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Bot className="h-3.5 w-3.5 text-emerald-600" />
            AI Sales Agent
          </Link>
          <Link
            href="/ai-agents/gateway"
            className="px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-600" />
            AI Tool Gateway (12 Tools)
          </Link>
          <button
            onClick={handleSimulateAutonomousRun}
            disabled={isSimulatingRun}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {isSimulatingRun ? "Executing Tool Sandbox..." : "Trigger Playground Run"}
          </button>
        </div>
      </div>

      {/* Mandatory Architectural Safety Guarantee Banner */}
      <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              Architectural Security Guarantee: Agents Never Have Direct Database Access
            </h4>
            <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300 mt-0.5">
              All agent data retrieval and mutations are strictly mediated through typed tools, JSON-schema validators, and scoped domain handlers. Raw SQL queries are unconditionally blocked. Sensitive financial mutations require explicit human sign-off.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 uppercase shrink-0">
          Enforced by Sandbox
        </span>
      </div>

      {/* Control Plane KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Configured Agents</div>
          <div className="text-lg font-bold font-mono text-foreground">{agents.length} Active</div>
          <div className="text-[10px] text-muted-foreground">All production versions healthy</div>
        </div>
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Typed Domain Tools</div>
          <div className="text-lg font-bold font-mono text-primary">{tools.length} Tools</div>
          <div className="text-[10px] text-muted-foreground">Schema-validated sandbox</div>
        </div>
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Total Autonomous Runs</div>
          <div className="text-lg font-bold font-mono text-foreground">1,482 Runs</div>
          <div className="text-[10px] text-muted-foreground">Avg duration: 740ms</div>
        </div>
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Pending Human Approvals</div>
          <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
            {approvals.filter((a) => a.status === "pending").length} Awaiting
          </div>
          <div className="text-[10px] text-muted-foreground">High-risk financial mutations</div>
        </div>
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">Policy Guardrail Blocks</div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">19 Actions Blocked</div>
          <div className="text-[10px] text-muted-foreground">Rate limits & ceiling caps active</div>
        </div>
      </div>

      {/* Subsystem Navigation Tabs */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("agents")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "agents" ? "bg-card text-foreground font-semibold shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bot className="h-3.5 w-3.5 text-primary" />
          Agents & Versions ({agents.length})
        </button>

        <button
          onClick={() => setActiveTab("tools")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "tools" ? "bg-card text-foreground font-semibold shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Cpu className="h-3.5 w-3.5 text-primary" />
          Typed Tools & Sandbox ({tools.length})
        </button>

        <button
          onClick={() => setActiveTab("policies")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "policies" ? "bg-card text-foreground font-semibold shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scale className="h-3.5 w-3.5 text-primary" />
          Policies & Guardrails ({policies.length})
        </button>

        <button
          onClick={() => setActiveTab("runs")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "runs" ? "bg-card text-foreground font-semibold shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-primary" />
          Execution Runs ({runs.length})
        </button>

        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "approvals" ? "bg-card text-foreground font-semibold shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          Human Approvals ({approvals.filter((a) => a.status === "pending").length})
        </button>

        <button
          onClick={() => setActiveTab("failures")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "failures" ? "bg-card text-foreground font-semibold shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertOctagon className="h-3.5 w-3.5 text-rose-500" />
          Failures & Blocks ({failures.length})
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "audit" ? "bg-card text-foreground font-semibold shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-3.5 w-3.5 text-primary" />
          Audit Trail ({audits.length})
        </button>
      </div>

      {/* TAB 1: AGENTS & VERSIONS REGISTRY */}
      {activeTab === "agents" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Agent Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-primary" /> Deployed Autonomous Agents
              </h3>

              <div className="space-y-2">
                {agents.map((agt) => {
                  const isSelected = agt.id === selectedAgentId;
                  return (
                    <button
                      key={agt.id}
                      onClick={() => setSelectedAgentId(agt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all space-y-1.5 ${
                        isSelected
                          ? "bg-primary/5 border-primary text-foreground shadow-xs"
                          : "bg-card hover:bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-foreground text-sm">{agt.name}</div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          {agt.currentVersion}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2">{agt.description}</p>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1 border-t border-border/50">
                        <span>Target: {agt.modelTarget}</span>
                        <span>{agt.totalRuns} total runs</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Agent Detail & Version Inspector (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    {selectedAgent.name}
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {selectedAgent.currentVersion}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedAgent.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">Model Target:</span>
                  <span className="text-xs font-mono font-bold text-foreground bg-muted/40 px-2 py-1 rounded border border-border">
                    {selectedAgent.modelTarget}
                  </span>
                </div>
              </div>

              {/* System Instructions / Prompt Snapshot */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground font-mono">System Instructions & Governance Framing</span>
                  <span className="text-[10px] font-mono text-muted-foreground">Immutable Prompt Snapshot</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-border text-foreground font-mono text-[11px] leading-relaxed">
                  {selectedAgent.systemInstructions}
                </div>
              </div>

              {/* Active Versions Tree */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold uppercase text-muted-foreground font-mono">Version Deployments</div>
                <div className="space-y-2 text-xs">
                  {INITIAL_VERSIONS.map((v) => (
                    <div key={v.id} className="p-3 rounded-lg bg-card border border-border/80 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-foreground">{v.versionNumber}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                              v.environment === "production" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            }`}
                          >
                            {v.environment}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{v.changelog}</p>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Deployed: {v.deployedAt} • Temp: {v.temperature} • Max Tokens: {v.maxTokens}
                        </div>
                      </div>

                      {v.isActive ? (
                        <span className="text-[10px] font-bold font-mono text-emerald-600 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Active Route
                        </span>
                      ) : (
                        <button
                          onClick={() => showToast("Version Promoted", `Promoted ${v.versionNumber} to production active route.`, "success")}
                          className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-[10px] font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Promote to Prod
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TYPED TOOLS & SANDBOX SECURITY */}
      {activeTab === "tools" && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Typed Tools & Mediated Sandbox Registry
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Agents access enterprise data exclusively through these typed JSON-schema tools. Raw database SQL execution is strictly forbidden.
            </p>
          </div>

          <div className="space-y-3">
            {tools.map((tool) => (
              <div key={tool.id} className="p-4 rounded-xl border border-border/80 bg-card space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-foreground">{tool.toolName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        tool.toolType === "read_only"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : tool.toolType === "idempotent_write"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {tool.toolType.replace(/_/g, " ")}
                    </span>
                    {tool.isApprovalRequired && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase font-mono">
                        Human Approval Gate
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground">
                    Required Capability: <strong className="text-foreground">{tool.requiredCapability}</strong>
                  </span>
                </div>

                <p className="text-muted-foreground">{tool.description}</p>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Parameter JSON Schema</span>
                  <pre className="p-2.5 rounded-lg bg-muted/20 border border-border/70 text-foreground font-mono text-[11px] overflow-x-auto max-h-32">
                    {tool.parametersSchema}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: POLICIES & GUARDRAILS */}
      {activeTab === "policies" && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" /> Active Safety Policies & Guardrails
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Autonomous governance bounds enforced on agent tool calls, mutation amounts, and token consumption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {policies.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-border bg-card space-y-2.5 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{p.policyName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono">
                    ENFORCED
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">{p.ruleDescription}</p>
                <div className="pt-2 border-t border-border flex justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Type: {p.policyType}</span>
                  <span>Interventions: <strong className="text-foreground">{p.blockedCount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXECUTION RUNS & PLAYGROUND */}
      {activeTab === "runs" && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Autonomous Execution Runs</h3>
              <p className="text-xs text-muted-foreground">
                Chronological ledger of agent runs mediated strictly via typed tools.
              </p>
            </div>
            <button
              onClick={handleSimulateAutonomousRun}
              disabled={isSimulatingRun}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {isSimulatingRun ? "Executing..." : "Trigger Playground Run"}
            </button>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action Summary</th>
                  <th className="py-2.5 px-3 text-right">Tokens</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-right">Duration</th>
                  <th className="py-2.5 px-3">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runs.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground">{r.id}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.agentName}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                          r.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : r.status === "awaiting_approval"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 animate-pulse"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate">{r.actionSummary}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{r.promptTokens + r.completionTokens}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${r.costUsd.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{r.durationMs}ms</td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono">{r.startedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: HUMAN-IN-THE-LOOP APPROVALS */}
      {activeTab === "approvals" && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> Human-in-the-Loop Approvals Queue
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              High-risk actions proposed by agents that require explicit human controller sign-off before domain execution.
            </p>
          </div>

          <div className="space-y-3">
            {approvals.map((appr) => (
              <div
                key={appr.id}
                className={`p-4 rounded-xl border text-xs space-y-3 ${
                  appr.status === "pending" ? "bg-amber-500/5 border-amber-500/30" : "bg-card border-border opacity-70"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{appr.agentName}</span>
                    <span className="text-muted-foreground font-mono">requests action</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                      {appr.requestedAction}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                        appr.riskLevel === "high" ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}
                    >
                      {appr.riskLevel} Risk
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground">{appr.requestedAt}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Proposed Payload / Parameters</span>
                  <pre className="p-2.5 rounded-lg bg-card border border-border/70 text-foreground font-mono text-[11px] overflow-x-auto">
                    {appr.proposedPayload}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Status: <strong className="text-foreground capitalize">{appr.status}</strong>
                    {appr.notes && ` (${appr.notes})`}
                  </span>

                  {appr.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectAction(appr.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                      >
                        Reject Action
                      </button>
                      <button
                        onClick={() => handleApproveAction(appr.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        Approve & Execute Action
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FAILURES & ANOMALIES */}
      {activeTab === "failures" && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-500" /> Failures & Policy Blocks Ledger
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Root-cause diagnostics for actions blocked by governance guardrails, validation timeouts, or permission errors.
            </p>
          </div>

          <div className="space-y-3">
            {failures.map((f) => (
              <div key={f.id} className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      {f.failureCategory.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-foreground">{f.agentName}</span>
                    <span className="text-muted-foreground font-mono">({f.runId})</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{f.timestamp}</span>
                </div>

                <p className="text-rose-900 dark:text-rose-200 font-medium">{f.errorMessage}</p>

                <div className="p-2.5 rounded-lg bg-card border border-border text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Remediation Recommendation:</strong> {f.remediationHint}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CRYPTOGRAPHIC AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Tamper-Evident Cryptographic Audit Ledger
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Immutable log of agent configuration changes, version promotions, tool calls, and human approvals.
            </p>
          </div>

          <div className="space-y-2.5">
            {audits.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl border border-border/80 bg-muted/10 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono bg-primary/10 text-primary border border-primary/20">
                      {a.eventType.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-foreground">{a.actorName}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{a.timestamp}</span>
                </div>

                <p className="text-muted-foreground">{a.description}</p>

                <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 pt-1 border-t border-border/40">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  SHA-256 State Fingerprint: <span className="text-foreground font-bold truncate">{a.sha256Hash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
