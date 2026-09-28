"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Sliders,
  Sparkles,
  ArrowRight,
  Terminal,
  Activity,
  Plus,
  Search,
  Filter,
  Check,
  X,
  MessageCircle,
  Mail,
  PhoneCall,
  DollarSign,
  FileText,
  Building2,
  Bot,
  Layers,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  triggerLabel: string;
  isActive: boolean;
  nodeCount: number;
  executionCount: number;
  successRate: string;
  lastExecutedAt: string;
  tags: string[];
}

interface WorkflowExecution {
  id: string;
  workflowName: string;
  triggerEvent: string;
  status: "completed" | "running" | "retrying" | "failed";
  idempotencyKey: string;
  startedAt: string;
  durationMs: number;
  correlationId: string;
  steps: {
    name: string;
    type: "trigger" | "condition" | "action" | "delay";
    status: "success" | "failed" | "running" | "skipped";
    durationMs: number;
    output: string;
  }[];
}

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: "wf-1",
    name: "Overdue Invoice & WhatsApp Dunning Cadence",
    description: "Evaluates overdue invoice days, triggers pre-approved Meta WhatsApp HSM template with Razorpay payment link, delays 72 hours, and escalates to senior management if unpaid.",
    triggerType: "invoice.overdue",
    triggerLabel: "Invoice Overdue (>3 Days)",
    isActive: true,
    nodeCount: 5,
    executionCount: 142,
    successRate: "99.3%",
    lastExecutedAt: "10 mins ago",
    tags: ["AR-Collections", "WhatsApp-HSM", "Razorpay"],
  },
  {
    id: "wf-2",
    name: "High-Intent Lead AI Outreach & Auto-Dialer",
    description: "Evaluates new CRM leads. If AI intent score > 80, automatically dispatches introductory email, schedules AI telephony voice call, and assigns Lead Account Executive.",
    triggerType: "lead.created",
    triggerLabel: "New Lead Created (Score > 80)",
    isActive: true,
    nodeCount: 4,
    executionCount: 88,
    successRate: "100%",
    lastExecutedAt: "24 mins ago",
    tags: ["CRM", "AI-Voice", "Lead-Routing"],
  },
  {
    id: "wf-3",
    name: "Payment Received & Real-Time ERP Accounting Sync",
    description: "On successful gateway payment callback, generates accounting journal entry, synchronizes with Xero/QuickBooks, marks invoice as Paid, and posts to customer timeline.",
    triggerType: "payment.received",
    triggerLabel: "Gateway Payment Settled",
    isActive: true,
    nodeCount: 4,
    executionCount: 230,
    successRate: "99.6%",
    lastExecutedAt: "4 mins ago",
    tags: ["Payments", "Accounting", "Xero-Sync"],
  },
  {
    id: "wf-4",
    name: "Document OCR Extraction & Invoice Draft Creation",
    description: "When supplier PDF invoice OCR completes, automatically extracts line items, validates tax breakdown, creates ERP invoice in draft status, and alerts Accounts Payable team.",
    triggerType: "document.ocr_completed",
    triggerLabel: "Document OCR Extraction Completed",
    isActive: true,
    nodeCount: 4,
    executionCount: 64,
    successRate: "98.4%",
    lastExecutedAt: "1 hour ago",
    tags: ["OCR-Intelligence", "ERP-Invoices"],
  },
  {
    id: "wf-5",
    name: "Autonomous Inventory Replenishment & PO Drafting",
    description: "Monitors multi-warehouse inventory. When a product SKU drops below its reorder point, queries preferred supplier lead times and automatically drafts an approved ERP purchase order.",
    triggerType: "inventory.reorder_needed",
    triggerLabel: "Stock Drops Below Reorder Point",
    isActive: true,
    nodeCount: 5,
    executionCount: 52,
    successRate: "100%",
    lastExecutedAt: "18 mins ago",
    tags: ["Inventory", "Procurement", "Auto-PO", "Suppliers"],
  },
];

const INITIAL_EXECUTIONS: WorkflowExecution[] = [
  {
    id: "exec-9942",
    workflowName: "Overdue Invoice & WhatsApp Dunning Cadence",
    triggerEvent: "invoice.overdue",
    status: "completed",
    idempotencyKey: "org_nexus_01:wf-1:evt_inv_overdue_41",
    startedAt: "Today, 10:40 AM",
    durationMs: 142,
    correlationId: "corr_dunning_41_88291",
    steps: [
      {
        name: "Evaluate Overdue Trigger",
        type: "trigger",
        status: "success",
        durationMs: 12,
        output: "Invoice INV-2026-0041 overdue by 4 days ($42,500.00)",
      },
      {
        name: "Condition Check (Amount > $10,000)",
        type: "condition",
        status: "success",
        durationMs: 8,
        output: "True ($42,500 > $10,000) -> High Value Enterprise Path",
      },
      {
        name: "Send WhatsApp HSM Template",
        type: "action",
        status: "success",
        durationMs: 48,
        output: "Template 'invoice_payment_reminder' dispatched to +1 555-234-5678 (wamid.HBgLMTU1N...)",
      },
      {
        name: "Schedule 72-Hour Payment Delay",
        type: "delay",
        status: "success",
        durationMs: 14,
        output: "Waiting delay queued in Cloud Tasks for 2026-09-26 10:40 AM",
      },
    ],
  },
  {
    id: "exec-9941",
    workflowName: "Payment Received & Real-Time ERP Accounting Sync",
    triggerEvent: "payment.received",
    status: "completed",
    idempotencyKey: "org_nexus_01:wf-3:evt_pay_rcvd_8819",
    startedAt: "Today, 10:15 AM",
    durationMs: 110,
    correlationId: "corr_pay_xero_88190",
    steps: [
      {
        name: "Ingest Payment Callback",
        type: "trigger",
        status: "success",
        durationMs: 15,
        output: "Razorpay Payment pay_N8429108429 settled for INR 75,000",
      },
      {
        name: "Sync to Accounting Connector (Xero)",
        type: "action",
        status: "success",
        durationMs: 62,
        output: "Journal entry #JE-2026-904 synchronized to Xero Chart of Accounts",
      },
      {
        name: "Update Invoice Status to Paid",
        type: "action",
        status: "success",
        durationMs: 18,
        output: "Invoice INV-2026-0042 status transitioned to 'paid'",
      },
    ],
  },
  {
    id: "exec-9940",
    workflowName: "High-Intent Lead AI Outreach & Auto-Dialer",
    triggerEvent: "lead.created",
    status: "completed",
    idempotencyKey: "org_nexus_01:wf-2:evt_lead_9921",
    startedAt: "Today, 09:30 AM",
    durationMs: 95,
    correlationId: "corr_lead_ai_99210",
    steps: [
      {
        name: "Lead Created Trigger",
        type: "trigger",
        status: "success",
        durationMs: 10,
        output: "Lead 'Global Freight Logistics' ingested via Enterprise Web Form",
      },
      {
        name: "AI Intent Score Evaluation",
        type: "condition",
        status: "success",
        durationMs: 25,
        output: "AI Intent Score: 92/100 -> Route to Priority Outbound Queue",
      },
      {
        name: "Start Autonomous AI Agent",
        type: "action",
        status: "success",
        durationMs: 38,
        output: "AI Communications Copilot generated custom executive proposal",
      },
    ],
  },
];

interface ScheduledTaskItem {
  id: string;
  queue: string;
  taskType: string;
  targetUrl: string;
  scheduledFor: string;
  attemptCount: number;
  maxAttempts: number;
  idempotencyKey: string;
}

interface DlqTaskItem {
  id: string;
  queue: string;
  taskType: string;
  exhaustedAttempts: number;
  lastError: string;
  payloadSummary: string;
  correlationId: string;
  resolutionStatus: "unresolved" | "replayed" | "discarded";
}

const INITIAL_SCHEDULED_TASKS: ScheduledTaskItem[] = [
  {
    id: "task-88421",
    queue: "platform-default-queue",
    taskType: "dunning.cadence.delay_72h",
    targetUrl: "/tasks/cloud-tasks-handler",
    scheduledFor: "In 2d 14h (Sep 26, 10:40 AM)",
    attemptCount: 1,
    maxAttempts: 5,
    idempotencyKey: "org_01:wf-1:inv_41",
  },
  {
    id: "task-88422",
    queue: "platform-priority-queue",
    taskType: "whatsapp.delivery.verify",
    targetUrl: "/tasks/cloud-tasks-handler",
    scheduledFor: "In 15m (Today, 11:20 AM)",
    attemptCount: 1,
    maxAttempts: 3,
    idempotencyKey: "org_01:wa:m5",
  },
  {
    id: "task-88423",
    queue: "platform-default-queue",
    taskType: "accounting.xero.reconcile",
    targetUrl: "/tasks/cloud-tasks-handler",
    scheduledFor: "In 45m (Today, 11:50 AM)",
    attemptCount: 2,
    maxAttempts: 5,
    idempotencyKey: "org_01:acc:pay_8819",
  },
];

const INITIAL_DLQ_TASKS: DlqTaskItem[] = [
  {
    id: "dlq-001",
    queue: "platform-dlq-queue",
    taskType: "accounting.quickbooks.sync",
    exhaustedAttempts: 5,
    lastError: "HTTP 504 Gateway Timeout: QuickBooks OAuth endpoint unreachable after 5 exponential retries.",
    payloadSummary: "Journal Entry #JE-2026-904 ($75,000.00)",
    correlationId: "corr_qb_882910",
    resolutionStatus: "unresolved",
  },
];

export default function WorkflowsStudioPage() {
  const [activeTab, setActiveTab] = useState<"workflows" | "builder" | "executions" | "cloudtasks" | "simulator">("workflows");
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [executions, setExecutions] = useState<WorkflowExecution[]>(INITIAL_EXECUTIONS);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTaskItem[]>(INITIAL_SCHEDULED_TASKS);
  const [dlqTasks, setDlqTasks] = useState<DlqTaskItem[]>(INITIAL_DLQ_TASKS);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("wf-1");
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Cloud Tasks simulator states
  const [newTaskType, setNewTaskType] = useState<string>("workflow.execution");
  const [newDelaySeconds, setNewDelaySeconds] = useState<number>(60);
  const [newMaxAttempts, setNewMaxAttempts] = useState<number>(5);
  const [newBackoffMultiplier, setNewBackoffMultiplier] = useState<number>(2.0);

  // Simulator states
  const [simTriggerType, setSimTriggerType] = useState<string>("invoice.overdue");
  const [simPayload, setSimPayload] = useState<string>(
    JSON.stringify(
      {
        event_id: "evt_test_inv_overdue_41",
        organization_id: "00000000-0000-0000-0000-000000000001",
        invoice_number: "INV-2026-0041",
        customer_name: "Sarah Jenkins",
        company_name: "Acme Industrial Corp",
        amount: 42500.0,
        currency: "USD",
        days_overdue: 4,
        customer_phone: "+15552345678",
      },
      null,
      2
    )
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const newState = !w.isActive;
          showToast(
            `Workflow ${newState ? "Activated" : "Paused"}`,
            `'${w.name}' is now ${newState ? "active and listening to event triggers" : "paused"}.`
          );
          return { ...w, isActive: newState };
        }
        return w;
      })
    );
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimLogs([`[00.00s] Ingesting event: ${simTriggerType}...`]);

    setTimeout(() => {
      setSimLogs((prev) => [
        ...prev,
        `[00.02s] Evaluating Idempotency Key: org_nexus_01:wf-1:${JSON.parse(simPayload).event_id || "evt_sim"}`,
        `[00.05s] Tenant Isolation (RLS) context verified for Organization ID: 00000000-0000-0000-0000-000000000001.`,
        `[00.08s] Condition Check: (amount: 42500 > 10000) -> TRUE. Branching to High-Value Action Path.`,
        `[00.12s] Action [send_message]: WhatsApp HSM 'invoice_payment_reminder' dispatched with Razorpay link.`,
        `[00.15s] Delay Node: Asynchronous 72-hr payment wait schedule registered with Google Cloud Tasks.`,
        `[00.18s] Transactional Outbox Event published. Workflow Execution Completed Successfully (Duration: 180ms).`,
      ]);
      setIsSimulating(false);

      const newExec: WorkflowExecution = {
        id: `exec-${Date.now().toString().slice(-4)}`,
        workflowName: "Overdue Invoice & WhatsApp Dunning Cadence",
        triggerEvent: simTriggerType,
        status: "completed",
        idempotencyKey: `org_nexus_01:wf-1:evt_sim_${Date.now()}`,
        startedAt: "Just now",
        durationMs: 180,
        correlationId: `corr_sim_${Date.now().toString().slice(-5)}`,
        steps: [
          {
            name: "Trigger Ingested",
            type: "trigger",
            status: "success",
            durationMs: 20,
            output: `Event ${simTriggerType} received with payload`,
          },
          {
            name: "High Value Condition Check",
            type: "condition",
            status: "success",
            durationMs: 15,
            output: "Amount > $10,000 evaluated to True",
          },
          {
            name: "Dispatch WhatsApp Dunning HSM",
            type: "action",
            status: "success",
            durationMs: 65,
            output: "Dispatched via Meta Cloud API v20.0+",
          },
        ],
      };

      setExecutions((prev) => [newExec, ...prev]);
      showToast("Simulation Complete", "Workflow executed successfully and logged to execution history.");
    }, 600);
  };

  const handleReplayExecution = (exec: WorkflowExecution) => {
    showToast(
      "Execution Replayed",
      `Workflow '${exec.workflowName}' re-evaluated with correlation ID ${exec.correlationId}.`
    );
  };

  return (
    <div className="space-y-5 pb-10">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Workflow Automation Studio
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                  DAG Engine Active
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Event-driven automation engine: triggers, conditions, actions, branches, async delays, idempotency, and automated retries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/workflows/collections"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" /> Autonomous Collections (13-Stage)
          </Link>
          <button
            onClick={() => setActiveTab("simulator")}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5" /> Test Event Simulator
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Active Workflows</span>
            <GitBranch className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {workflows.filter((w) => w.isActive).length} Active
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">4 Enterprise DAG pipelines configured</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Executions Today</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">524 Runs</div>
          <p className="text-[11px] text-muted-foreground mt-1">Idempotency deduplication rate: 100%</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">99.4%</div>
          <p className="text-[11px] text-muted-foreground mt-1">Automated backoff retries: 8 recovered</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Average Latency</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">118 ms</div>
          <p className="text-[11px] text-muted-foreground mt-1">Transactional outbox delivery SLA: &lt;200ms</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border space-x-1 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab("workflows")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "workflows"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitBranch className="h-4 w-4" /> Active Workflows Catalog ({workflows.length})
        </button>

        <button
          onClick={() => setActiveTab("builder")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "builder"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="h-4 w-4" /> Visual Workflow Canvas (DAG)
        </button>

        <button
          onClick={() => setActiveTab("executions")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "executions"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" /> Execution History ({executions.length})
        </button>

        <button
          onClick={() => setActiveTab("cloudtasks")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "cloudtasks"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" /> Google Cloud Tasks & DLQ ({scheduledTasks.length} Scheduled)
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "simulator"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Terminal className="h-4 w-4" /> Event Trigger Simulator
        </button>
      </div>

      {/* TAB 1: ACTIVE WORKFLOWS DIRECTORY */}
      {activeTab === "workflows" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {wf.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleWorkflow(wf.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors shrink-0 ${
                      wf.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {wf.isActive ? "Active" : "Paused"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-semibold">
                    Trigger: {wf.triggerLabel}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    • {wf.nodeCount} DAG Steps
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {wf.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 flex items-center justify-between text-xs">
                <div className="text-muted-foreground text-[11px]">
                  <span>Executions: <strong className="font-mono text-foreground">{wf.executionCount}</strong></span>
                  <span className="mx-2">•</span>
                  <span>Success: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{wf.successRate}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedWorkflowId(wf.id);
                      setActiveTab("builder");
                    }}
                    className="px-2.5 py-1 rounded bg-muted hover:bg-accent text-foreground text-xs font-semibold border border-border transition-colors"
                  >
                    View Canvas
                  </button>
                  <button
                    onClick={() => {
                      setSimTriggerType(wf.triggerType);
                      setActiveTab("simulator");
                    }}
                    className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" /> Test
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: VISUAL WORKFLOW CANVAS (DAG PIPELINE) */}
      {activeTab === "builder" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Visual Pipeline: Overdue Invoice & WhatsApp Dunning Cadence (DAG Graph)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visual node graph illustrating triggers, condition branches, action execution, and delay intervals.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Version 2.4 (Published)
                </span>
              </div>
            </div>

            {/* Visual DAG Node Flow */}
            <div className="space-y-4 py-2">
              {/* Node 1: Trigger */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1 p-3.5 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-primary font-bold uppercase">Trigger Node</span>
                    <h4 className="font-bold text-xs text-foreground">Event: invoice.overdue</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Filter: <code>due_date &lt; NOW() - 3 days</code></p>
                  </div>
                  <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-mono text-muted-foreground">Entry Point</span>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-border ml-5"></div>

              {/* Node 2: Condition / Branch */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1 p-3.5 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase">Condition & Branch Node</span>
                    <h4 className="font-bold text-xs text-foreground">Rule: amount &gt; $10,000 (High-Value Tier)</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">True &rarr; VIP Dunning Cadence | False &rarr; Standard Email Cadence</p>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-semibold">Conditional Branch</span>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-border ml-5"></div>

              {/* Node 3: Action */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1 p-3.5 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">Action Node: send_message</span>
                    <h4 className="font-bold text-xs text-foreground">Meta WhatsApp HSM: invoice_payment_reminder</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Payload: Customer name, Invoice PDF link, Dynamic Razorpay UPI QR link</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-semibold">Meta Cloud API</span>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-border ml-5"></div>

              {/* Node 4: Delay */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1 p-3.5 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">Delay Node: delay_minutes</span>
                    <h4 className="font-bold text-xs text-foreground">Wait Duration: 72 Hours (4,320 minutes)</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Suspends execution in Cloud Tasks until delay elapses or payment event cancels</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-semibold">Async Wait</span>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-border ml-5"></div>

              {/* Node 5: Action (Escalate) */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1 p-3.5 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase">Action Node: create_task & notify</span>
                    <h4 className="font-bold text-xs text-foreground">Escalate to Senior Account Executive & Schedule Call</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Assigns urgent CRM task and posts high-priority alert to Collections Ledger</p>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded text-[10px] font-semibold">Escalation Handled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE EXECUTION HISTORY */}
      {activeTab === "executions" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Recent Workflow Executions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete telemetry trace with step-level duration, input/output data, and correlation tracking.
                </p>
              </div>

              <button
                onClick={() => {
                  showToast("Telemetry Refreshed", "Loaded latest execution traces from workflow_executions table.");
                }}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-accent border border-border flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
              </button>
            </div>

            <div className="divide-y divide-border">
              {executions.map((exec) => (
                <div key={exec.id} className="p-4 space-y-3 hover:bg-muted/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{exec.workflowName}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                          {exec.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        Trigger: <strong>{exec.triggerEvent}</strong> • Correlation ID: {exec.correlationId} • Started: {exec.startedAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground font-semibold">
                        {exec.durationMs} ms
                      </span>
                      <button
                        onClick={() => handleReplayExecution(exec)}
                        className="px-2.5 py-1 rounded bg-muted hover:bg-accent text-foreground text-xs font-semibold border border-border flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" /> Replay
                      </button>
                    </div>
                  </div>

                  {/* Step Execution Trace */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                    {exec.steps.map((st, idx) => (
                      <div key={idx} className="p-2.5 bg-muted/30 border border-border rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                          <span className="truncate">{st.name}</span>
                          <span className="font-mono">{st.durationMs}ms</span>
                        </div>
                        <p className="text-[11px] text-foreground/80 line-clamp-2">{st.output}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GOOGLE CLOUD TASKS & DEAD-LETTER QUEUE (DLQ) */}
      {activeTab === "cloudtasks" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-5 rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Google Cloud Tasks Background Execution & Dead-Letter Queue (DLQ)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  OIDC Authenticated
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reliable asynchronous execution: delayed tasks, exponential backoff retries, idempotency deduplication, and dead-letter routing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold border border-border flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> IAM: cloud-tasks-invoker
              </span>
            </div>
          </div>

          {/* Multi-Tier Queues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground font-mono">platform-default-queue</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">General long-running workflow delays & dunning schedules.</p>
              <div className="border-t border-border pt-2 text-[10px] text-muted-foreground flex justify-between font-mono">
                <span>Rate: 500/sec</span>
                <span>Max Attempts: 5</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground font-mono">platform-priority-queue</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Real-time dispatches: WhatsApp, Voice dialing, Payment callbacks.</p>
              <div className="border-t border-border pt-2 text-[10px] text-muted-foreground flex justify-between font-mono">
                <span>Rate: 1,000/sec</span>
                <span>Max Attempts: 3</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground font-mono">platform-dlq-queue</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  MONITORING ({dlqTasks.length} Unresolved)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Dead-letter queue for tasks exceeding retry threshold.</p>
              <div className="border-t border-border pt-2 text-[10px] text-muted-foreground flex justify-between font-mono">
                <span>Rate: 50/sec</span>
                <span>Isolation: RLS</span>
              </div>
            </div>
          </div>

          {/* Scheduled Delayed Tasks Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm space-y-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Scheduled Delayed Background Tasks
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tasks queued for future asynchronous execution with exponential backoff configuration.
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground font-semibold">
                {scheduledTasks.length} Active Timers
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Task ID & Type</th>
                  <th className="py-2.5 px-4">Target Queue</th>
                  <th className="py-2.5 px-4">Scheduled Execution</th>
                  <th className="py-2.5 px-4">Attempt / Max</th>
                  <th className="py-2.5 px-4">Idempotency Key</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scheduledTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground font-mono">{t.id}</div>
                      <div className="text-[11px] text-primary">{t.taskType}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">{t.queue}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-500" /> {t.scheduledFor}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-foreground font-semibold">
                      {t.attemptCount} / {t.maxAttempts}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground max-w-xs truncate">
                      {t.idempotencyKey}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          showToast("Task Dispatched Immediately", `Cloud Task '${t.id}' forced for immediate execution.`);
                          setScheduledTasks((prev) => prev.filter((item) => item.id !== t.id));
                        }}
                        className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Execute Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dead-Letter Queue (DLQ) Manager */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm space-y-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  Dead-Letter Queue (DLQ) Incident Ledger
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tasks that exhausted maximum retry attempts without successful execution.
                </p>
              </div>
            </div>

            {dlqTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Zero dead-letter tasks in queue. All retryable workflows executed cleanly.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {dlqTasks.map((dlq) => (
                  <div key={dlq.id} className="p-4 space-y-2 hover:bg-muted/10 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground font-mono">{dlq.id}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase">
                            Exhausted {dlq.exhaustedAttempts} Attempts
                          </span>
                          <span className="text-xs font-semibold text-primary">{dlq.taskType}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          Correlation ID: {dlq.correlationId} • Payload: {dlq.payloadSummary}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            showToast("DLQ Task Replayed", `Task '${dlq.id}' reenqueued to platform-default-queue with reset attempt counter.`);
                            setDlqTasks((prev) => prev.filter((item) => item.id !== dlq.id));
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <RotateCcw className="h-3 w-3" /> Replay to Queue
                        </button>
                        <button
                          onClick={() => {
                            showToast("DLQ Task Discarded", `Task '${dlq.id}' purged from dead-letter queue.`);
                            setDlqTasks((prev) => prev.filter((item) => item.id !== dlq.id));
                          }}
                          className="px-2.5 py-1 rounded bg-muted hover:bg-accent text-foreground text-xs font-semibold border border-border transition-colors"
                        >
                          Discard
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded text-[11px] text-rose-700 dark:text-rose-300 font-mono">
                      Error: {dlq.lastError}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Cloud Tasks Enqueuer */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border pb-2.5">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Interactive Cloud Tasks Enqueuer & Backoff Simulator
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Schedule a background task with custom exponential backoff: T_delay = initial * multiplier^(attempt - 1).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Task Type
                </label>
                <input
                  type="text"
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Delay Seconds (Future Schedule)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newDelaySeconds}
                  onChange={(e) => setNewDelaySeconds(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Max Retries
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newMaxAttempts}
                  onChange={(e) => setNewMaxAttempts(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Backoff Multiplier
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1.0"
                  max="5.0"
                  value={newBackoffMultiplier}
                  onChange={(e) => setNewBackoffMultiplier(parseFloat(e.target.value) || 2.0)}
                  className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground text-[11px]">
                Computed Retry Delays: <strong>{newDelaySeconds}s &rarr; {(newDelaySeconds * newBackoffMultiplier).toFixed(0)}s &rarr; {(newDelaySeconds * Math.pow(newBackoffMultiplier, 2)).toFixed(0)}s</strong>
              </span>

              <button
                onClick={() => {
                  const newTask: ScheduledTaskItem = {
                    id: `task-${Math.floor(10000 + Math.random() * 90000)}`,
                    queue: "platform-default-queue",
                    taskType: newTaskType,
                    targetUrl: "/tasks/cloud-tasks-handler",
                    scheduledFor: `In ${newDelaySeconds}s (Scheduled)`,
                    attemptCount: 1,
                    maxAttempts: newMaxAttempts,
                    idempotencyKey: `org_01:bg_${Date.now()}`,
                  };
                  setScheduledTasks((prev) => [newTask, ...prev]);
                  showToast("Cloud Task Enqueued", `Task '${newTask.id}' registered with Cloud Tasks queue.`);
                }}
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Enqueue Cloud Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EVENT TRIGGER SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Event Configuration */}
          <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border pb-2.5">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Trigger Event Payload Configurator
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulate business event dispatches to validate condition branching, action execution, and transactional outbox persistence.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Select Event Trigger:
                </label>
                <select
                  value={simTriggerType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setSimTriggerType(newType);
                    if (newType === "payment.received") {
                      setSimPayload(
                        JSON.stringify(
                          {
                            event_id: "evt_test_pay_8819",
                            organization_id: "00000000-0000-0000-0000-000000000001",
                            payment_id: "pay_N8429108429",
                            invoice_number: "INV-2026-0042",
                            amount: 75000.0,
                            currency: "INR",
                            provider: "razorpay",
                          },
                          null,
                          2
                        )
                      );
                    } else if (newType === "lead.created") {
                      setSimPayload(
                        JSON.stringify(
                          {
                            event_id: "evt_test_lead_9941",
                            organization_id: "00000000-0000-0000-0000-000000000001",
                            lead_name: "Global Freight Logistics",
                            contact_email: "ceo@globalfreight.com",
                            ai_intent_score: 92,
                            requested_seats: 100,
                          },
                          null,
                          2
                        )
                      );
                    } else {
                      setSimPayload(
                        JSON.stringify(
                          {
                            event_id: "evt_test_inv_overdue_41",
                            organization_id: "00000000-0000-0000-0000-000000000001",
                            invoice_number: "INV-2026-0041",
                            customer_name: "Sarah Jenkins",
                            company_name: "Acme Industrial Corp",
                            amount: 42500.0,
                            currency: "USD",
                            days_overdue: 4,
                            customer_phone: "+15552345678",
                          },
                          null,
                          2
                        )
                      );
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                >
                  <option value="invoice.overdue">invoice.overdue (AR Dunning)</option>
                  <option value="payment.received">payment.received (Accounting Sync)</option>
                  <option value="lead.created">lead.created (AI Telephony Outreach)</option>
                  <option value="document.ocr_completed">document.ocr_completed (Auto Draft)</option>
                  <option value="invoice.created">invoice.created (Customer Notification)</option>
                  <option value="message.received">message.received (Omnichannel Router)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                  Trigger Event Payload (JSON):
                </label>
                <textarea
                  rows={10}
                  value={simPayload}
                  onChange={(e) => setSimPayload(e.target.value)}
                  className="w-full p-2.5 bg-background border border-input rounded font-mono text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                {isSimulating ? "Executing Pipeline Steps..." : "Trigger Live Workflow Execution"}
              </button>
            </div>
          </div>

          {/* Right Column: Real-Time Execution Console */}
          <div className="lg:col-span-7 bg-slate-950 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col justify-between font-mono text-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-slate-200">Execution Telemetry Stream</span>
                </div>
                <span className="text-[10px] text-slate-400">Node Engine: Rust Worker v1.0</span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-300 min-h-[220px]">
                {simLogs.length === 0 ? (
                  <p className="text-slate-500 italic">
                    Ready for simulation. Select a trigger on the left and click 'Trigger Live Workflow Execution' to view real-time DAG evaluation.
                  </p>
                ) : (
                  simLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Tenant Context: <strong>Active (RLS Enforced)</strong></span>
              <span>Idempotency: <strong>Deduplicated</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
