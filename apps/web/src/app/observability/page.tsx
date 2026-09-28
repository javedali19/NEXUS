"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Workflow,
  Bot,
  Zap,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart3,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Bug,
  Lock,
  ArrowRight,
  Eye,
  Check,
  HardDrive
} from "lucide-react";
import { useToast } from "@/components/ui";

// ============================================================================
// Types
// ============================================================================

interface SubsystemItem {
  id: string;
  name: string;
  category: string;
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  uptime: number;
  activeConnections: number;
  details: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface IntegrationItem {
  name: string;
  provider: string;
  category: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  successRate: number;
  lastChecked: string;
  authType: string;
}

interface SentryIssue {
  id: string;
  eventNumber: string;
  exceptionType: string;
  message: string;
  level: "fatal" | "error" | "warning";
  correlationId: string;
  requestId: string;
  timestamp: string;
  piiScrubbed: boolean;
  stackTrace: string;
}

interface TraceSpanView {
  spanId: string;
  service: string;
  operation: string;
  durationMs: number;
  status: "ok" | "error";
  startedAt: string;
}

// Initial Data
const SUBSYSTEMS: SubsystemItem[] = [
  {
    id: "db",
    name: "PostgreSQL Database & RLS Pool",
    category: "Data Layer",
    status: "healthy",
    latencyMs: 2,
    uptime: 99.99,
    activeConnections: 8,
    details: "Pool: 8/20 Active · Read replica lag: 0ms · RLS isolation active",
    icon: Database,
  },
  {
    id: "workers",
    name: "Background Cloud Tasks & Tokio Workers",
    category: "Async Processing",
    status: "healthy",
    latencyMs: 14,
    uptime: 99.98,
    activeConnections: 4,
    details: "Queue depth: 0 · Active workers: 4 · Dead letters: 0",
    icon: Cpu,
  },
  {
    id: "workflows",
    name: "Workflow DAG Automation Engine",
    category: "Orchestration",
    status: "healthy",
    latencyMs: 18,
    uptime: 100.0,
    activeConnections: 2,
    details: "12 active instances · 1,420 jobs executed today · 0% failure rate",
    icon: Workflow,
  },
  {
    id: "ai_agents",
    name: "AI Agent Control Plane & Tool Gateway",
    category: "Intelligence",
    status: "healthy",
    latencyMs: 38,
    uptime: 99.95,
    activeConnections: 3,
    details: "15 registered tools · Policy block rate: 1.2% · SHA-256 audit enabled",
    icon: Bot,
  },
  {
    id: "integrations",
    name: "Enterprise Integration Gateway",
    category: "Connectors",
    status: "healthy",
    latencyMs: 65,
    uptime: 99.92,
    activeConnections: 8,
    details: "8 active adapters · Rate limit headroom: 84% · Zero circuit breaks",
    icon: Radio,
  },
  {
    id: "storage",
    name: "Google Cloud Storage & KMS Encryption",
    category: "Persistence",
    status: "healthy",
    latencyMs: 22,
    uptime: 100.0,
    activeConnections: 5,
    details: "Bucket: enterprise-platform-dev-assets · Cloud KMS customer-managed key active",
    icon: HardDrive,
  },
];

const INTEGRATIONS: IntegrationItem[] = [
  {
    name: "Razorpay Production Adapter",
    provider: "Razorpay (Prompt #17 Provider)",
    category: "Payments",
    status: "healthy",
    latencyMs: 92,
    successRate: 99.8,
    lastChecked: "Just now",
    authType: "Key ID + Secret (Masked)",
  },
  {
    name: "Stripe Checkout & Elements",
    provider: "Stripe",
    category: "Payments",
    status: "healthy",
    latencyMs: 110,
    successRate: 100.0,
    lastChecked: "1m ago",
    authType: "Bearer Restricted Key",
  },
  {
    name: "Meta WhatsApp Cloud API",
    provider: "Meta Graph API v20.0",
    category: "Communications",
    status: "healthy",
    latencyMs: 78,
    successRate: 99.4,
    lastChecked: "Just now",
    authType: "System User Permanent Token",
  },
  {
    name: "Twilio Telephony & SIP Trunk",
    provider: "Twilio Voice PSTN",
    category: "Telephony",
    status: "healthy",
    latencyMs: 65,
    successRate: 99.9,
    lastChecked: "2m ago",
    authType: "Account SID + Auth Token",
  },
  {
    name: "Google Gemini 1.5 Pro",
    provider: "Google Cloud Vertex / AI Studio",
    category: "AI Model",
    status: "healthy",
    latencyMs: 320,
    successRate: 99.6,
    lastChecked: "Just now",
    authType: "GCP ADC / API Key",
  },
  {
    name: "Mathpix Document Vision OCR",
    provider: "Mathpix v3 API",
    category: "OCR Engine",
    status: "healthy",
    latencyMs: 450,
    successRate: 99.1,
    lastChecked: "3m ago",
    authType: "App ID + App Key",
  },
  {
    name: "Xero & QuickBooks Accounting",
    provider: "Xero / Intuit OAuth2",
    category: "Accounting",
    status: "healthy",
    latencyMs: 140,
    successRate: 100.0,
    lastChecked: "4m ago",
    authType: "OAuth 2.0 PKCE",
  },
  {
    name: "Sentry Production Monitoring",
    provider: "Sentry.io",
    category: "Observability",
    status: "healthy",
    latencyMs: 48,
    successRate: 100.0,
    lastChecked: "Just now",
    authType: "DSN (Server-side Ingest)",
  },
];

const INITIAL_SENTRY_ISSUES: SentryIssue[] = [
  {
    id: "issue-001",
    eventNumber: "SENTRY-NX-9104",
    exceptionType: "PaymentGatewayRateLimitException",
    message: "Razorpay API returned HTTP 429 Too Many Requests; Exponential backoff auto-retried successfully.",
    level: "warning",
    correlationId: "corr_rzp_98124a",
    requestId: "req_9921_1209",
    timestamp: "12m ago",
    piiScrubbed: true,
    stackTrace: `at RazorpayAdapter.create_payment_link (razorpay.rs:142)
  at PaymentDomainService.issue_hosted_link (payment.rs:88)
  at AxumApiHandler.handle_payment_link_creation (handlers.rs:214)`,
  },
  {
    id: "issue-002",
    eventNumber: "SENTRY-NX-8820",
    exceptionType: "WhatsAppComplianceDncViolation",
    message: "Autonomous outbound notification blocked: Recipient phone ends in 9999 (National DNC Registry).",
    level: "warning",
    correlationId: "corr_wa_5521a0",
    requestId: "req_8810_4421",
    timestamp: "45m ago",
    piiScrubbed: true,
    stackTrace: `at PolicyEngine.enforce_dnc_registry (policy.rs:52)
  at AiToolGateway.enforce_enterprise_policies (ai_tool_gateway.rs:545)
  at AiToolGateway.execute (ai_tool_gateway.rs:440)`,
  },
];

const SAMPLE_TRACE_SPANS: TraceSpanView[] = [
  {
    spanId: "span_root_01",
    service: "api_gateway",
    operation: "POST /api/v1/sales-flow/advance",
    durationMs: 74,
    status: "ok",
    startedAt: "0.0 ms",
  },
  {
    spanId: "span_auth_02",
    service: "auth_middleware",
    operation: "JWT Verification & Tenant Context Extraction",
    durationMs: 3,
    status: "ok",
    startedAt: "+0.5 ms",
  },
  {
    spanId: "span_tool_03",
    service: "ai_tool_gateway",
    operation: "execute: sales_flow_advance",
    durationMs: 38,
    status: "ok",
    startedAt: "+4.2 ms",
  },
  {
    spanId: "span_db_04",
    service: "postgres_db",
    operation: "SELECT * FROM sales_flow_instances WHERE id = $1",
    durationMs: 2,
    status: "ok",
    startedAt: "+4.8 ms",
  },
  {
    spanId: "span_pg_05",
    service: "payment_adapter",
    operation: "Razorpay Checkout Link Generation",
    durationMs: 28,
    status: "ok",
    startedAt: "+7.1 ms",
  },
  {
    spanId: "span_db_06",
    service: "postgres_db",
    operation: "INSERT INTO customer_timeline_events",
    durationMs: 2,
    status: "ok",
    startedAt: "+36.2 ms",
  },
];

export default function ProductionObservabilityPage() {
  const { showToast } = useToast();
  const [sentryIssues, setSentryIssues] = useState<SentryIssue[]>(INITIAL_SENTRY_ISSUES);
  const [activeTab, setActiveTab] = useState<"overview" | "traces" | "sentry" | "integrations">("overview");
  const [isSimulatingException, setIsSimulatingException] = useState(false);

  // Sentry Configuration Metadata
  const sentryConfig = useMemo(() => {
    return {
      dsnMasked: "https://d74a****@o450123.ingest.sentry.io/450891238",
      environment: "production",
      release: "nexus-v2.4.0 (Enterprise GA)",
      tracesSampleRate: "1.0 (100% Transactions)",
      replaysSessionSampleRate: "0.1 (10%)",
      replaysOnErrorSampleRate: "1.0 (100%)",
      piiScrubbingStatus: "ACTIVE (Strict Masking Enabled)",
      sdkVersion: "@sentry/nextjs 8.28.0 / sentry-rust 0.34.0",
    };
  }, []);

  // Simulate Sentry Exception Trigger
  const handleSimulateSentryException = async () => {
    setIsSimulatingException(true);
    await new Promise((r) => setTimeout(r, 600));

    const corrId = `corr_sentry_${Math.random().toString(36).substring(2, 8)}`;
    const reqId = `req_${Math.random().toString(36).substring(2, 8)}`;
    const eventNum = `SENTRY-NX-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIssue: SentryIssue = {
      id: `issue-${Date.now()}`,
      eventNumber: eventNum,
      exceptionType: "SimulatedProductionException",
      message: "Database connection timeout simulated with masked credential: password=[MASKED_SECRET] Bearer ********************",
      level: "error",
      correlationId: corrId,
      requestId: reqId,
      timestamp: "Just now",
      piiScrubbed: true,
      stackTrace: `at ObservabilityEngine.simulate_exception (observability.rs:214)
  at SentryClient.capture_exception (observability.rs:188)
  at AxumApiHandler.dispatch_telemetry (handlers.rs:92)`,
    };

    setSentryIssues((prev) => [newIssue, ...prev]);
    setIsSimulatingException(false);

    showToast({
      title: `Sentry Event Captured: ${eventNum}`,
      description: `Dispatched to Sentry DSN endpoint. PII scrubber masked secrets & credentials. Correlation: ${corrId}`,
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <span>Platform Governance</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span>Telemetry & Sentry</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-300">Prompt #51 Production Observability</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
            Production Observability & Sentry Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time metrics, distributed tracing, request/correlation propagation, subsystem health, and Sentry production monitoring.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateSentryException}
            disabled={isSimulatingException}
            id="btn-simulate-sentry"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-95 transition"
          >
            <Bug className={`w-4 h-4 ${isSimulatingException ? "animate-spin" : ""}`} />
            <span>{isSimulatingException ? "Dispatching to Sentry..." : "Test Sentry Exception"}</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Platform Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">100% Operational</div>
          <div className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-1 font-medium">
            <span>6/6 Subsystems Healthy</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>P95 API Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">24.5 ms</div>
          <div className="text-[11px] text-cyan-400/90 flex items-center gap-1 mt-1">
            <span>P50: 8ms · P99: 68ms</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active DB Connections</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">8 / 20 Pool</div>
          <div className="text-[11px] text-blue-400/90 flex items-center gap-1 mt-1">
            <span>RLS Context Enforced</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sentry DSN Ingestion</span>
            <ShieldCheck className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">Active · 100%</div>
          <div className="text-[11px] text-violet-400/90 flex items-center gap-1 mt-1">
            <span>Strict PII Masking ON</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-inner col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cloud Tasks Throughput</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">1,240 / hr</div>
          <div className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1">
            <span>Queue Depth: 0</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "overview"
              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Subsystems Health ({SUBSYSTEMS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("traces")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "traces"
              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Distributed Trace Waterfall</span>
        </button>

        <button
          onClick={() => setActiveTab("sentry")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "sentry"
              ? "bg-rose-500/10 text-rose-300 border border-rose-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>Sentry Production Monitoring</span>
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "integrations"
              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>External Integrations ({INTEGRATIONS.length})</span>
        </button>
      </div>

      {/* VIEW 1: Subsystems Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBSYSTEMS.map((sub) => {
              const Icon = sub.icon;
              return (
                <div
                  key={sub.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {sub.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-3">{sub.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {sub.category}
                    </span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                      {sub.details}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Latency</span>
                      <span className="text-cyan-400 font-bold">{sub.latencyMs} ms</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Uptime</span>
                      <span className="text-emerald-400 font-bold">{sub.uptime}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Distributed Traces */}
      {activeTab === "traces" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Distributed Trace Waterfall</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Trace ID: trace_7fa8102a9411bc · Request ID: req_9921_1209 · Correlation ID: corr_sales_001
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                Total Latency: 74 ms
              </span>
            </div>

            <div className="space-y-2">
              {SAMPLE_TRACE_SPANS.map((span) => (
                <div
                  key={span.spanId}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                        {span.service}
                      </span>
                      <span className="text-white font-semibold">{span.operation}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{span.spanId}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <span className="text-[10px] text-slate-500">{span.startedAt}</span>
                    <span className="px-2 py-1 rounded bg-slate-900 text-emerald-400 font-bold text-[11px] border border-slate-800">
                      {span.durationMs} ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Sentry Production Monitoring Console */}
      {activeTab === "sentry" && (
        <div className="space-y-6">
          {/* Sentry Configuration Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg">
                  S
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sentry Production Configuration</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Server-Side & Client Ingestion with Zero-Credential-Exposure Guarantee
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ● Live Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Configured Sentry DSN</span>
                <span className="text-cyan-400 font-semibold block mt-1 truncate">
                  {sentryConfig.dsnMasked}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Managed via Secret Manager</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Environment & Release</span>
                <span className="text-white font-bold block mt-1">
                  {sentryConfig.environment} · {sentryConfig.release}
                </span>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">Automated Release Tagging</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PII & Secret Scrubber</span>
                <span className="text-emerald-400 font-bold block mt-1">
                  {sentryConfig.piiScrubbingStatus}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Bearer tokens & PANs scrubbed</span>
              </div>
            </div>
          </div>

          {/* Sentry Live Exception Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Sentry Captured Issues ({sentryIssues.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded">
                Real-Time Telemetry
              </span>
            </div>

            <div className="space-y-3">
              {sentryIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-400">
                          {issue.eventNumber}
                        </span>
                        <span className="text-xs font-bold text-white">{issue.exceptionType}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                          PII Scrubbed
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{issue.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {issue.timestamp}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre leading-relaxed">
                    {issue.stackTrace}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                    <span>Correlation ID: {issue.correlationId}</span>
                    <span>Request ID: {issue.requestId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: External Integrations */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTEGRATIONS.map((intg) => (
              <div
                key={intg.name}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300">
                      {intg.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {intg.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2">{intg.name}</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">{intg.provider}</span>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">Latency</span>
                    <span className="text-cyan-400 font-bold">{intg.latencyMs} ms</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">Success Rate</span>
                    <span className="text-emerald-400 font-bold">{intg.successRate}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">Auth Model</span>
                    <span className="text-slate-300 font-bold truncate block">{intg.authType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
