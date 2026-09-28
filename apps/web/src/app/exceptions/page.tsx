"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Play,
  RotateCcw,
  Check,
  Search,
  Filter,
  Layers,
  CreditCard,
  GitBranch,
  Bot,
  ScanLine,
  PhoneCall,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Terminal,
} from "lucide-react";
import { Badge, Button, Card, Tabs } from "@/components/ui";

export type ExceptionCategory =
  | "all"
  | "integration"
  | "payment"
  | "workflow"
  | "ai"
  | "ocr"
  | "communication";

interface ExceptionItem {
  id: string;
  category: "integration" | "payment" | "workflow" | "ai" | "ocr" | "communication";
  serviceName: string;
  exceptionType: string;
  message: string;
  errorCode: string;
  severity: "critical" | "error" | "warning" | "info";
  status: "open" | "acknowledged" | "resolved" | "retrying";
  correlationId: string;
  entityType: string;
  entityId: string;
  retryCount: number;
  maxRetries: number;
  timestamp: string;
  stackTrace: string;
  requestPayload: Record<string, any>;
}

const INITIAL_EXCEPTIONS: ExceptionItem[] = [
  {
    id: "exc-001",
    category: "integration",
    serviceName: "nexus-integration-hub",
    exceptionType: "WebhookDeliveryTimeout",
    message: "Salesforce CRM sync endpoint timed out after 10000ms. Remote gateway 504.",
    errorCode: "INT_SF_GATEWAY_TIMEOUT",
    severity: "error",
    status: "open",
    correlationId: "8f7e6d5c-4b3a-2109-8765-43210fedcba9",
    entityType: "crm_deals",
    entityId: "deal-8819",
    retryCount: 2,
    maxRetries: 3,
    timestamp: "2026-09-22 14:28:10 UTC",
    stackTrace: `IntegrationTimeoutException: Salesforce REST Endpoint unreachable
  at IntegrationDispatcher.dispatchWebhook (crates/integrations/src/client.rs:142)
  at async OutboxProcessor.processNextBatch (crates/events/src/outbox.rs:248)`,
    requestPayload: { target_system: "salesforce", deal_id: "deal-8819", event: "deal.won.v1", payload_bytes: 1420 },
  },
  {
    id: "exc-002",
    category: "payment",
    serviceName: "nexus-billing-engine",
    exceptionType: "PaymentGatewayDeclined",
    message: "Stripe 3D-Secure card authorization failed: insufficient_funds on card *4242.",
    errorCode: "PAY_STRIPE_INSUFFICIENT_FUNDS",
    severity: "critical",
    status: "open",
    correlationId: "b2c3d4e5-f6a7-8901-2345-6789abcdef01",
    entityType: "invoices",
    entityId: "inv-2026-091",
    retryCount: 1,
    maxRetries: 3,
    timestamp: "2026-09-22 14:22:45 UTC",
    stackTrace: `PaymentGatewayException: Code 402 - insufficient_funds
  at StripeConnector.processCharge (crates/erp/src/payments.rs:88)
  at InvoiceSettlementService.collectPayment (crates/erp/src/settlement.rs:210)`,
    requestPayload: { customer_id: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c", invoice_id: "inv-2026-091", amount: 18500.0, currency: "USD" },
  },
  {
    id: "exc-003",
    category: "workflow",
    serviceName: "nexus-workflow-orchestrator",
    exceptionType: "WorkflowStepConditionFault",
    message: "BPMN execution failed at step #4 (EscalateToFinance): condition node received null budget_limit.",
    errorCode: "WF_STEP_EVAL_NULL_POINTER",
    severity: "error",
    status: "open",
    correlationId: "e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b",
    entityType: "workflows",
    entityId: "wf-exec-992",
    retryCount: 0,
    maxRetries: 3,
    timestamp: "2026-09-22 14:18:22 UTC",
    stackTrace: `WorkflowExecutionError: Unresolved expression in BPMN step #4
  at WorkflowEngine.evaluateStepCondition (crates/workflows/src/engine.rs:319)
  at WorkflowEngine.runStepAsync (crates/workflows/src/engine.rs:188)`,
    requestPayload: { workflow_id: "wf-auto-approval", step_index: 4, inputs: { total_value: 85000 } },
  },
  {
    id: "exc-004",
    category: "ai",
    serviceName: "nexus-ai-agents",
    exceptionType: "LLMRateLimitExceeded",
    message: "OpenAI GPT-4o inference returned HTTP 429 Too Many Requests (Rate limit token bucket exhausted).",
    errorCode: "AI_LLM_RATE_LIMIT_429",
    severity: "warning",
    status: "open",
    correlationId: "99aa88bb-77cc-66dd-55ee-44ff33aa2211",
    entityType: "ai_copilot",
    entityId: "agent-run-5510",
    retryCount: 3,
    maxRetries: 5,
    timestamp: "2026-09-22 14:10:05 UTC",
    stackTrace: `OpenAIRateLimitException: 429 Too Many Requests
  at LLMClient.generateCompletion (crates/ai/src/llm.rs:94)
  at AutonomousCopilot.synthesizeResponse (crates/ai/src/copilot.rs:145)`,
    requestPayload: { model: "gpt-4o", prompt_tokens: 1240, max_tokens: 500 },
  },
  {
    id: "exc-005",
    category: "ocr",
    serviceName: "nexus-vision-ocr",
    exceptionType: "LowConfidenceDocumentScan",
    message: "Google Cloud Document AI confidence score 0.42 is below security threshold (0.75). Manual review required.",
    errorCode: "OCR_LOW_CONFIDENCE_THRESHOLD",
    severity: "warning",
    status: "acknowledged",
    correlationId: "77665544-3322-1100-ffeeddccbbaa",
    entityType: "documents",
    entityId: "doc-ocr-1092",
    retryCount: 1,
    maxRetries: 1,
    timestamp: "2026-09-22 13:55:12 UTC",
    stackTrace: `OCRConfidenceException: Document scan confidence score below threshold (0.42 < 0.75)
  at VisionExtractor.extractFields (crates/ocr/src/vision.rs:172)
  at DocumentPipeline.ingestPdf (crates/documents/src/pipeline.rs:88)`,
    requestPayload: { filename: "supplier_receipt_scan_smudged.pdf", bytes: 482010, detected_fields: { total: null } },
  },
  {
    id: "exc-006",
    category: "communication",
    serviceName: "nexus-telephony-gateway",
    exceptionType: "SIPTrunkCarrierDrop",
    message: "Twilio Voice SIP bridge disconnected prematurely during AI audio synthesis. Call hung up at 00:42.",
    errorCode: "COMMS_SIP_PREMATURE_DISCONNECT",
    severity: "error",
    status: "open",
    correlationId: "33445566-7788-9900-aabb-ccddeeff1122",
    entityType: "calls",
    entityId: "call-9945",
    retryCount: 0,
    maxRetries: 1,
    timestamp: "2026-09-22 13:42:30 UTC",
    stackTrace: `SIPCarrierException: Call leg dropped with error 31005 (WebRTC Media Timeout)
  at TwilioVoiceConnector.handleCallEvent (crates/telephony/src/twilio.rs:204)
  at MediaStreamBridge.streamAudioToClient (crates/telephony/src/webrtc.rs:98)`,
    requestPayload: { call_sid: "CA99482710182", direction: "outbound", customer_phone: "+15550199" },
  },
];

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(INITIAL_EXCEPTIONS);
  const [activeCategory, setActiveCategory] = useState<ExceptionCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const filteredExceptions = exceptions.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.errorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRetry = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      setExceptions((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              status: "resolved",
              retryCount: item.retryCount + 1,
            };
          }
          return item;
        })
      );
      setRetryingId(null);
    }, 1200);
  };

  const handleAcknowledge = (id: string) => {
    setExceptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "acknowledged" } : item))
    );
  };

  const handleResolve = (id: string) => {
    setExceptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "resolved" } : item))
    );
    if (selectedException?.id === id) {
      setSelectedException((prev) => prev ? { ...prev, status: "resolved" } : null);
    }
  };

  const counts = {
    all: exceptions.length,
    integration: exceptions.filter((e) => e.category === "integration").length,
    payment: exceptions.filter((e) => e.category === "payment").length,
    workflow: exceptions.filter((e) => e.category === "workflow").length,
    ai: exceptions.filter((e) => e.category === "ai").length,
    ocr: exceptions.filter((e) => e.category === "ocr").length,
    communication: exceptions.filter((e) => e.category === "communication").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Platform Exceptions & Automated Remediation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized error telemetry, automated retry queues, and root-cause analysis across all 6 core subsystem failure domains.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              // Inject test exception
              const newExc: ExceptionItem = {
                id: `exc-${Date.now().toString().slice(-3)}`,
                category: "payment",
                serviceName: "nexus-billing-engine",
                exceptionType: "SimulatedGatewayError",
                message: "ACH Direct Debit timeout: Remote clearinghouse response delayed.",
                errorCode: "SIMULATED_PAY_ERR",
                severity: "error",
                status: "open",
                correlationId: "sim-" + Math.random().toString(36).substring(2, 10),
                entityType: "invoices",
                entityId: "inv-2026-099",
                retryCount: 0,
                maxRetries: 3,
                timestamp: "Just now",
                stackTrace: "Simulated Error for Resilience Testing\n  at TestService.triggerFailure()",
                requestPayload: { test_mode: true, amount: 9500 },
              };
              setExceptions([newExc, ...exceptions]);
            }}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Simulate Exception
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Open Exceptions</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">
            {exceptions.filter((e) => e.status === "open").length}
          </p>
          <span className="text-[10px] text-rose-400 font-mono mt-1 block">
            Requires Active Investigation / Action
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Critical Severity</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1">
            {exceptions.filter((e) => e.severity === "critical" && e.status !== "resolved").length}
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Immediate SLA Impact (Billing / Payments)
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Auto-Retry Success Rate</span>
            <RefreshCw className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">94.2%</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            Exponential Backoff Outbox Queue
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Mean Time to Remediation</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-1">3.4 min</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Average Across Last 100 Faults
          </span>
        </Card>
      </div>

      {/* 6 Category Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeCategory === "all"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>All Failures ({counts.all})</span>
        </button>

        <button
          onClick={() => setActiveCategory("integration")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeCategory === "integration"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <ArrowUpRight className="h-4 w-4 text-sky-400" />
          <span>1. Integration Failures ({counts.integration})</span>
        </button>

        <button
          onClick={() => setActiveCategory("payment")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeCategory === "payment"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <CreditCard className="h-4 w-4 text-rose-400" />
          <span>2. Payment Failures ({counts.payment})</span>
        </button>

        <button
          onClick={() => setActiveCategory("workflow")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeCategory === "workflow"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <GitBranch className="h-4 w-4 text-amber-400" />
          <span>3. Workflow Failures ({counts.workflow})</span>
        </button>

        <button
          onClick={() => setActiveCategory("ai")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeCategory === "ai"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Bot className="h-4 w-4 text-purple-400" />
          <span>4. AI Failures ({counts.ai})</span>
        </button>

        <button
          onClick={() => setActiveCategory("ocr")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeCategory === "ocr"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <ScanLine className="h-4 w-4 text-teal-400" />
          <span>5. OCR Failures ({counts.ocr})</span>
        </button>

        <button
          onClick={() => setActiveCategory("communication")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeCategory === "communication"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <PhoneCall className="h-4 w-4 text-emerald-400" />
          <span>6. Comms Failures ({counts.communication})</span>
        </button>
      </div>

      {/* Search Bar */}
      <Card className="p-3 bg-slate-900 border border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search error message, code, service name, or affected entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </Card>

      {/* Exceptions Feed */}
      <div className="space-y-3">
        {filteredExceptions.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900 border border-slate-800 text-slate-400">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">No active exceptions in this category</p>
            <p className="text-xs text-slate-400 mt-1">All subsystems are executing normally without unhandled faults.</p>
          </Card>
        ) : (
          filteredExceptions.map((item) => (
            <Card
              key={item.id}
              className={`p-4 bg-slate-900 border transition-all ${
                item.status === "resolved"
                  ? "border-emerald-900/40 opacity-75"
                  : item.severity === "critical"
                  ? "border-rose-800 shadow-sm"
                  : "border-slate-800"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left side: Icon, Message, Details */}
                <div className="flex items-start space-x-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.category === "payment"
                        ? "bg-rose-950 text-rose-400 border border-rose-800"
                        : item.category === "integration"
                        ? "bg-sky-950 text-sky-400 border border-sky-800"
                        : item.category === "workflow"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : item.category === "ai"
                        ? "bg-purple-950 text-purple-400 border border-purple-800"
                        : item.category === "ocr"
                        ? "bg-teal-950 text-teal-400 border border-teal-800"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    }`}
                  >
                    {item.category === "payment" && <CreditCard className="h-4 w-4" />}
                    {item.category === "integration" && <ArrowUpRight className="h-4 w-4" />}
                    {item.category === "workflow" && <GitBranch className="h-4 w-4" />}
                    {item.category === "ai" && <Bot className="h-4 w-4" />}
                    {item.category === "ocr" && <ScanLine className="h-4 w-4" />}
                    {item.category === "communication" && <PhoneCall className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">
                        {item.exceptionType}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {item.errorCode}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">
                        {item.serviceName}
                      </span>
                      {item.severity === "critical" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800">
                          Critical
                        </span>
                      )}
                      {item.status === "resolved" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Resolved
                        </span>
                      )}
                      {item.status === "acknowledged" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800">
                          Acknowledged
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{item.message}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400 pt-1">
                      <span>Target: {item.entityType}:{item.entityId}</span>
                      <span>Correlation: {item.correlationId.substring(0, 8)}...</span>
                      <span>Retries: {item.retryCount}/{item.maxRetries}</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedException(item)}
                    className="text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Inspect
                  </Button>

                  {item.status !== "resolved" && (
                    <>
                      {item.status === "open" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(item.id)}
                          className="text-xs text-amber-400 border-amber-800/60 hover:bg-amber-950"
                        >
                          Ack
                        </Button>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={retryingId === item.id}
                        onClick={() => handleRetry(item.id)}
                        className="text-xs"
                      >
                        <RotateCcw className={`h-3.5 w-3.5 mr-1 ${retryingId === item.id ? "animate-spin" : ""}`} />
                        {retryingId === item.id ? "Retrying..." : "Retry Execution"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stack Trace & Request Payload Modal */}
      {selectedException && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    {selectedException.exceptionType} ({selectedException.errorCode})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Service: {selectedException.serviceName} | Correlation: {selectedException.correlationId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedException(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Error Message */}
              <div className="bg-rose-950/40 border border-rose-900/60 p-3 rounded-xl text-rose-300">
                <p className="font-semibold text-rose-200">Error Description:</p>
                <p className="mt-1">{selectedException.message}</p>
              </div>

              {/* Stack Trace */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-white font-mono uppercase">
                  Engine Stack Trace
                </span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {selectedException.stackTrace}
                </pre>
              </div>

              {/* Request Payload */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-white font-mono uppercase">
                  Captured Event Request Payload
                </span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedException.requestPayload, null, 2)}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                {selectedException.status !== "resolved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(selectedException.id)}
                    className="text-emerald-400 border-emerald-800"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                  </Button>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedException(null)}>
                Close Stacktrace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
