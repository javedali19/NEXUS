"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Cpu,
  Zap,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Key,
  Clock,
  Layers,
  ArrowRight,
  Database,
  Hash,
  Activity,
  FileText,
  DollarSign,
  MessageSquare,
  PhoneCall,
  CheckSquare,
  Settings,
  Flame,
  Fingerprint,
  RefreshCw,
  Sliders,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export type SafetyTier = "read_only" | "idempotent_write" | "sensitive_mutation";
export type ToolCategory = "crm" | "finance" | "communications" | "automation" | "intelligence";

export interface ToolDef {
  name: string;
  displayName: string;
  category: ToolCategory;
  safetyTier: SafetyTier;
  requiredCapability: string;
  description: string;
  rateLimitPerMin: number;
  isIdempotent: boolean;
  samplePayload: Record<string, any>;
  schemaProps: { name: string; type: string; required: boolean; description: string }[];
}

const TOOLS_CATALOG: ToolDef[] = [
  {
    name: "customer_search",
    displayName: "Customer Search",
    category: "crm",
    safetyTier: "read_only",
    requiredCapability: "customers:read",
    description: "Search customers across unified 360 database by name, email, phone, company, or tax ID with tenant isolation.",
    rateLimitPerMin: 120,
    isIdempotent: false,
    samplePayload: { query: "Acme Global", limit: 10, include_financials: true },
    schemaProps: [
      { name: "query", type: "string", required: true, description: "Search query string (name, tax ID, email)" },
      { name: "limit", type: "integer", required: false, description: "Max results to return (max 50, default 10)" },
      { name: "include_financials", type: "boolean", required: false, description: "Include current balances and DSO metrics" },
    ],
  },
  {
    name: "customer_timeline",
    displayName: "Customer Timeline",
    category: "crm",
    safetyTier: "read_only",
    requiredCapability: "timeline:read",
    description: "Retrieve chronological activity timeline (WhatsApp notices, voice calls, invoices, payments, and exceptions).",
    rateLimitPerMin: 100,
    isIdempotent: false,
    samplePayload: { customer_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112", limit: 15 },
    schemaProps: [
      { name: "customer_id", type: "uuid", required: true, description: "Canonical customer UUID" },
      { name: "limit", type: "integer", required: false, description: "Number of timeline events to retrieve" },
    ],
  },
  {
    name: "invoice_lookup",
    displayName: "Invoice Lookup",
    category: "finance",
    safetyTier: "read_only",
    requiredCapability: "invoices:read",
    description: "Retrieve invoice balance, status, line items, payment terms, and aging days past due.",
    rateLimitPerMin: 120,
    isIdempotent: false,
    samplePayload: { invoice_number: "INV-2026-0041" },
    schemaProps: [
      { name: "invoice_number", type: "string", required: true, description: "Canonical invoice identifier (e.g. INV-2026-0041)" },
    ],
  },
  {
    name: "quote_creation",
    displayName: "Quote Creation",
    category: "finance",
    safetyTier: "idempotent_write",
    requiredCapability: "quotes:write",
    description: "Generate commercial quote/estimate with line items, tax, discounts, and expiration date (Max 15% discount).",
    rateLimitPerMin: 30,
    isIdempotent: true,
    samplePayload: {
      customer_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112",
      title: "Enterprise Annual Subscription",
      items: [
        { description: "Nexus Platform Enterprise Core", quantity: 1, unit_price: 24000.0 },
        { description: "Dedicated WhatsApp Business Trunk", quantity: 1, unit_price: 3600.0 },
      ],
      discount_percentage: 10.0,
      valid_until: "2026-10-31",
    },
    schemaProps: [
      { name: "customer_id", type: "uuid", required: true, description: "Target customer UUID" },
      { name: "items", type: "array", required: true, description: "Line items array with quantity and unit_price" },
      { name: "discount_percentage", type: "number", required: false, description: "Discount % (cap 15% without approval)" },
      { name: "valid_until", type: "date", required: true, description: "Quote expiration date" },
    ],
  },
  {
    name: "payment_link_creation",
    displayName: "Payment Link Creation",
    category: "finance",
    safetyTier: "idempotent_write",
    requiredCapability: "payments:generate_link",
    description: "Create dynamic Razorpay/Stripe checkout payment link with expiry and invoice association (Cap $25k).",
    rateLimitPerMin: 60,
    isIdempotent: true,
    samplePayload: {
      customer_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112",
      invoice_id: "inv_9981_0041",
      amount: 4500.0,
      currency: "USD",
      expires_in_hours: 72,
    },
    schemaProps: [
      { name: "customer_id", type: "uuid", required: true, description: "Customer account identifier" },
      { name: "amount", type: "number", required: true, description: "Settlement amount ($1 to $25,000)" },
      { name: "currency", type: "string", required: false, description: "ISO 3-letter currency code (USD, EUR, INR)" },
      { name: "expires_in_hours", type: "integer", required: false, description: "Checkout token validity duration" },
    ],
  },
  {
    name: "whatsapp_sending",
    displayName: "WhatsApp Dispatch",
    category: "communications",
    safetyTier: "sensitive_mutation",
    requiredCapability: "whatsapp:send",
    description: "Dispatch WhatsApp HSM template or session message after verifying customer consent and DNC compliance.",
    rateLimitPerMin: 40,
    isIdempotent: true,
    samplePayload: {
      phone_number: "+15552348901",
      template_name: "collections_overdue_notice",
      parameters: { customer_name: "Acme Global", invoice_no: "INV-2026-0041", balance: "$45,000.00" },
      consent_verified: true,
    },
    schemaProps: [
      { name: "phone_number", type: "e164_string", required: true, description: "E.164 phone number with country code" },
      { name: "template_name", type: "string", required: true, description: "Meta approved HSM template identifier" },
      { name: "consent_verified", type: "boolean", required: true, description: "Explicit customer opt-in confirmation" },
    ],
  },
  {
    name: "call_scheduling",
    displayName: "Voice Call Scheduling",
    category: "communications",
    safetyTier: "sensitive_mutation",
    requiredCapability: "telephony:schedule",
    description: "Schedule automated AI voice call or human representative callback within legal communication hours (08:00 - 21:00).",
    rateLimitPerMin: 20,
    isIdempotent: true,
    samplePayload: {
      phone_number: "+15552348901",
      customer_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112",
      scheduled_time: "2026-09-24T14:30:00Z",
      purpose: "Invoice settlement plan review",
    },
    schemaProps: [
      { name: "phone_number", type: "string", required: true, description: "Destination telephone number" },
      { name: "scheduled_time", type: "iso_datetime", required: true, description: "UTC timestamp within business hours" },
      { name: "purpose", type: "string", required: true, description: "Call intent and script parameters" },
    ],
  },
  {
    name: "task_creation",
    displayName: "CRM Task Creation",
    category: "crm",
    safetyTier: "idempotent_write",
    requiredCapability: "tasks:write",
    description: "Create actionable CRM task with priority, due date, and assign to agent queue or representative.",
    rateLimitPerMin: 80,
    isIdempotent: true,
    samplePayload: {
      title: "Follow up on Promise-to-Pay for INV-0041",
      priority: "high",
      due_date: "2026-09-26T17:00:00Z",
      customer_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112",
      description: "Customer agreed to pay balance by Friday. Confirm settlement receipt.",
    },
    schemaProps: [
      { name: "title", type: "string", required: true, description: "Task summary header" },
      { name: "priority", type: "enum", required: false, description: "low, normal, high, urgent" },
      { name: "due_date", type: "iso_datetime", required: true, description: "Due date timestamp" },
    ],
  },
  {
    name: "crm_updates",
    displayName: "CRM Field Updates",
    category: "crm",
    safetyTier: "idempotent_write",
    requiredCapability: "crm:update",
    description: "Update whitelisted fields on customer, lead, or deal records without exposing direct table writes.",
    rateLimitPerMin: 60,
    isIdempotent: true,
    samplePayload: {
      entity_type: "customer",
      entity_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112",
      fields_to_update: {
        lifecycle_stage: "payment_renegotiation",
        risk_tier: "medium",
        last_contacted_at: "2026-09-23T10:45:00Z",
      },
    },
    schemaProps: [
      { name: "entity_type", type: "enum", required: true, description: "customer, lead, deal, contact" },
      { name: "entity_id", type: "uuid", required: true, description: "Entity primary UUID" },
      { name: "fields_to_update", type: "object", required: true, description: "Whitelisted properties only" },
    ],
  },
  {
    name: "workflow_execution",
    displayName: "Workflow Execution",
    category: "automation",
    safetyTier: "idempotent_write",
    requiredCapability: "workflows:execute",
    description: "Trigger a workflow automation DAG with an input payload and correlation ID.",
    rateLimitPerMin: 30,
    isIdempotent: true,
    samplePayload: {
      workflow_slug: "autonomous_collections_recovery",
      trigger_payload: {
        invoice_id: "inv_9981_0041",
        customer_id: "c1a8d052-1982-4fae-9ef7-47b2c019a112",
        recovery_urgency: "expedited",
      },
    },
    schemaProps: [
      { name: "workflow_slug", type: "string", required: true, description: "Identifier of registered workflow DAG" },
      { name: "trigger_payload", type: "object", required: true, description: "Initial workflow variables" },
    ],
  },
  {
    name: "analytics_lookup",
    displayName: "Analytics & KPIs Lookup",
    category: "intelligence",
    safetyTier: "read_only",
    requiredCapability: "analytics:read",
    description: "Query high-level financial and operational metrics (DSO, recovery rate, pipeline value, cash flow).",
    rateLimitPerMin: 60,
    isIdempotent: false,
    samplePayload: { metric_category: "dso", timeframe: "30d" },
    schemaProps: [
      { name: "metric_category", type: "enum", required: true, description: "dso, collections_recovery, pipeline_summary, cash_flow" },
      { name: "timeframe", type: "enum", required: false, description: "7d, 30d, 90d, ytd (default 30d)" },
    ],
  },
  {
    name: "exception_creation",
    displayName: "Platform Exception Logging",
    category: "automation",
    safetyTier: "idempotent_write",
    requiredCapability: "exceptions:write",
    description: "Create structured system or business domain exception with severity, correlation ID, and remediation task.",
    rateLimitPerMin: 50,
    isIdempotent: true,
    samplePayload: {
      category: "payment_webhook_timeout",
      severity: "high",
      description: "Gateway response delayed past 15000ms. Queued for Cloud Tasks exponential retry.",
      entity_type: "invoice",
      entity_id: "inv_9981_0041",
      error_code: "GATEWAY_TIMEOUT_504",
    },
    schemaProps: [
      { name: "category", type: "string", required: true, description: "Exception domain classification" },
      { name: "severity", type: "enum", required: true, description: "low, medium, high, critical" },
      { name: "description", type: "string", required: true, description: "Root cause narrative" },
    ],
  },
];

interface ExecutionLog {
  id: string;
  toolName: string;
  caller: string;
  status: "SUCCESS" | "POLICY_BLOCKED" | "RATE_LIMITED" | "UNAUTHORIZED" | "SECURITY_VIOLATION" | "VALIDATION_FAILED";
  durationMs: number;
  timestamp: string;
  correlationId: string;
  wasCachedReplay: boolean;
  sha256Hash: string;
  resultSummary: string;
}

export default function AiToolGatewayPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"catalog" | "invoker" | "idempotency" | "audit">("invoker");
  const [selectedToolName, setSelectedToolName] = useState<string>("quote_creation");
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(TOOLS_CATALOG.find((t) => t.name === "quote_creation")?.samplePayload, null, 2)
  );
  const [idempotencyKey, setIdempotencyKey] = useState<string>("idem_quote_9941a");
  const [callerRole, setCallerRole] = useState<string>("autonomous_agent");
  const [grantedCapabilities, setGrantedCapabilities] = useState<string[]>([
    "customers:read",
    "timeline:read",
    "invoices:read",
    "quotes:write",
    "payments:generate_link",
    "whatsapp:send",
    "telephony:schedule",
    "tasks:write",
    "crm:update",
    "workflows:execute",
    "analytics:read",
    "exceptions:write",
  ]);

  // Invocation result state
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([
    {
      id: "inv_01",
      toolName: "customer_search",
      caller: "CollectionsCopilot",
      status: "SUCCESS",
      durationMs: 14,
      timestamp: "10:48:12",
      correlationId: "corr_99182a",
      wasCachedReplay: false,
      sha256Hash: "sha256-a94f091bc2e84128",
      resultSummary: "2 customers matched query 'Acme Global'",
    },
    {
      id: "inv_02",
      toolName: "whatsapp_sending",
      caller: "CollectionsCopilot",
      status: "POLICY_BLOCKED",
      durationMs: 8,
      timestamp: "10:47:33",
      correlationId: "corr_dnc_1288",
      wasCachedReplay: false,
      sha256Hash: "sha256-4b918ca1209e8432",
      resultSummary: "Blocked: Recipient number is listed in National DNC Registry",
    },
    {
      id: "inv_03",
      toolName: "payment_link_creation",
      caller: "CollectionsCopilot",
      status: "SUCCESS",
      durationMs: 2,
      timestamp: "10:46:55",
      correlationId: "corr_replay_7712",
      wasCachedReplay: true,
      sha256Hash: "sha256-fe91092a4819ca77",
      resultSummary: "Cached Replay: plink_rzp_994812 ($4,500.00)",
    },
  ]);

  // Filter tools
  const filteredTools = useMemo(() => {
    if (selectedCategory === "all") return TOOLS_CATALOG;
    return TOOLS_CATALOG.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const selectedTool = useMemo(() => {
    return TOOLS_CATALOG.find((t) => t.name === selectedToolName) || TOOLS_CATALOG[0];
  }, [selectedToolName]);

  const handleSelectTool = (tool: ToolDef) => {
    setSelectedToolName(tool.name);
    setPayloadText(JSON.stringify(tool.samplePayload, null, 2));
    if (tool.isIdempotent) {
      setIdempotencyKey(`idem_${tool.name}_${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setIdempotencyKey("");
    }
  };

  const handleGenerateKey = () => {
    setIdempotencyKey(`idem_${selectedTool.name}_${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const toggleCapability = (cap: string) => {
    if (grantedCapabilities.includes(cap)) {
      setGrantedCapabilities(grantedCapabilities.filter((c) => c !== cap));
    } else {
      setGrantedCapabilities([...grantedCapabilities, cap]);
    }
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setLastResponse(null);

    setTimeout(() => {
      let parsedArgs: any = {};
      try {
        parsedArgs = JSON.parse(payloadText);
      } catch (err) {
        setIsExecuting(false);
        setLastResponse({
          status: "VALIDATION_FAILED",
          error: "Invalid JSON format in arguments payload.",
          policiesEvaluated: ["JSON_SYNTAX_PARSER"],
          durationMs: 2,
          sha256: "sha256-syntax-error",
        });
        return;
      }

      // Check Invariant 0: Zero Raw SQL Guard
      const sqlKeywords = ["sql", "query_sql", "raw_sql", "select", "insert", "update", "delete", "drop", "table"];
      const hasSqlKeys = Object.keys(parsedArgs).some((k) => sqlKeywords.includes(k.toLowerCase()));

      if (hasSqlKeys) {
        const errorResp = {
          status: "SECURITY_VIOLATION",
          error: "Direct raw SQL queries or database manipulation arguments are unconditionally prohibited. All access must use typed domain tools.",
          policiesEvaluated: ["ZERO_RAW_SQL_INVARIANT", "SECURITY_PERIMETER_ENFORCEMENT"],
          durationMs: 4,
          sha256: "sha256-sec-blocked-" + Math.floor(Math.random() * 100000),
          wasCachedReplay: false,
        };
        setLastResponse(errorResp);
        setIsExecuting(false);
        setExecutionLogs((prev) => [
          {
            id: `inv_${Date.now()}`,
            toolName: selectedTool.name,
            caller: callerRole,
            status: "SECURITY_VIOLATION",
            durationMs: 4,
            timestamp: new Date().toLocaleTimeString(),
            correlationId: `corr_${Math.random().toString(36).substring(2, 9)}`,
            wasCachedReplay: false,
            sha256Hash: errorResp.sha256,
            resultSummary: "Blocked: Raw SQL keyword detected in arguments",
          },
          ...prev,
        ]);
        return;
      }

      // Check 1: Authorization
      const hasCap = grantedCapabilities.includes(selectedTool.requiredCapability);
      if (!hasCap) {
        const authResp = {
          status: "UNAUTHORIZED",
          error: `Agent lacking required capability '${selectedTool.requiredCapability}' for tool '${selectedTool.name}'.`,
          policiesEvaluated: ["AUTH_CAPABILITY_VERIFICATION"],
          durationMs: 6,
          sha256: "sha256-unauth-" + Math.floor(Math.random() * 100000),
          wasCachedReplay: false,
        };
        setLastResponse(authResp);
        setIsExecuting(false);
        setExecutionLogs((prev) => [
          {
            id: `inv_${Date.now()}`,
            toolName: selectedTool.name,
            caller: callerRole,
            status: "UNAUTHORIZED",
            durationMs: 6,
            timestamp: new Date().toLocaleTimeString(),
            correlationId: `corr_${Math.random().toString(36).substring(2, 9)}`,
            wasCachedReplay: false,
            sha256Hash: authResp.sha256,
            resultSummary: `Authorization Failed: Missing ${selectedTool.requiredCapability}`,
          },
          ...prev,
        ]);
        return;
      }

      // Check 2: Idempotency Replay
      const isReplay =
        selectedTool.isIdempotent &&
        idempotencyKey &&
        executionLogs.some((l) => l.toolName === selectedTool.name && l.status === "SUCCESS" && l.id.includes(idempotencyKey));

      if (isReplay) {
        const replayResp = {
          status: "SUCCESS",
          wasCachedReplay: true,
          durationMs: 2,
          result: {
            cached_result: true,
            idempotency_key: idempotencyKey,
            note: "Response served from 24h gateway replay cache. No duplicate side effects executed.",
          },
          policiesEvaluated: [
            "AUTH_CAPABILITY_VERIFICATION",
            "RATE_LIMIT_SLIDING_WINDOW",
            "IDEMPOTENCY_REPLAY_DEFENSE",
          ],
          sha256: "sha256-cached-replay-" + Math.floor(Math.random() * 100000),
        };
        setLastResponse(replayResp);
        setIsExecuting(false);
        return;
      }

      // Check 3: Enterprise Policy Guardrails
      if (selectedTool.name === "quote_creation" && parsedArgs.discount_percentage > 15.0) {
        const policyResp = {
          status: "POLICY_BLOCKED",
          error: `Proposed discount (${parsedArgs.discount_percentage}%) exceeds autonomous agent policy cap (15.0%). Requires human approval.`,
          policiesEvaluated: [
            "AUTH_CAPABILITY_VERIFICATION",
            "RATE_LIMIT_SLIDING_WINDOW",
            "ENTERPRISE_POLICY_GUARDRAILS",
          ],
          durationMs: 12,
          sha256: "sha256-policy-cap-" + Math.floor(Math.random() * 100000),
          wasCachedReplay: false,
        };
        setLastResponse(policyResp);
        setIsExecuting(false);
        setExecutionLogs((prev) => [
          {
            id: `inv_${Date.now()}`,
            toolName: selectedTool.name,
            caller: callerRole,
            status: "POLICY_BLOCKED",
            durationMs: 12,
            timestamp: new Date().toLocaleTimeString(),
            correlationId: `corr_${Math.random().toString(36).substring(2, 9)}`,
            wasCachedReplay: false,
            sha256Hash: policyResp.sha256,
            resultSummary: `Policy Blocked: Discount ${parsedArgs.discount_percentage}% > 15%`,
          },
          ...prev,
        ]);
        return;
      }

      if (selectedTool.name === "whatsapp_sending" && parsedArgs.consent_verified === false) {
        const policyResp = {
          status: "POLICY_BLOCKED",
          error: "Customer has not provided express consent for WhatsApp communications.",
          policiesEvaluated: [
            "AUTH_CAPABILITY_VERIFICATION",
            "RATE_LIMIT_SLIDING_WINDOW",
            "ENTERPRISE_POLICY_GUARDRAILS",
          ],
          durationMs: 9,
          sha256: "sha256-wa-consent-" + Math.floor(Math.random() * 100000),
          wasCachedReplay: false,
        };
        setLastResponse(policyResp);
        setIsExecuting(false);
        setExecutionLogs((prev) => [
          {
            id: `inv_${Date.now()}`,
            toolName: selectedTool.name,
            caller: callerRole,
            status: "POLICY_BLOCKED",
            durationMs: 9,
            timestamp: new Date().toLocaleTimeString(),
            correlationId: `corr_${Math.random().toString(36).substring(2, 9)}`,
            wasCachedReplay: false,
            sha256Hash: policyResp.sha256,
            resultSummary: "Policy Blocked: Unconsented WhatsApp attempt",
          },
          ...prev,
        ]);
        return;
      }

      if (selectedTool.name === "payment_link_creation" && parsedArgs.amount > 25000) {
        const policyResp = {
          status: "POLICY_BLOCKED",
          error: `Payment link amount ($${parsedArgs.amount}) exceeds automatic creation limit ($25,000). Requires human controller sign-off.`,
          policiesEvaluated: [
            "AUTH_CAPABILITY_VERIFICATION",
            "RATE_LIMIT_SLIDING_WINDOW",
            "ENTERPRISE_POLICY_GUARDRAILS",
          ],
          durationMs: 11,
          sha256: "sha256-paylink-cap-" + Math.floor(Math.random() * 100000),
          wasCachedReplay: false,
        };
        setLastResponse(policyResp);
        setIsExecuting(false);
        setExecutionLogs((prev) => [
          {
            id: `inv_${Date.now()}`,
            toolName: selectedTool.name,
            caller: callerRole,
            status: "POLICY_BLOCKED",
            durationMs: 11,
            timestamp: new Date().toLocaleTimeString(),
            correlationId: `corr_${Math.random().toString(36).substring(2, 9)}`,
            wasCachedReplay: false,
            sha256Hash: policyResp.sha256,
            resultSummary: `Policy Blocked: Amount $${parsedArgs.amount} > $25k limit`,
          },
          ...prev,
        ]);
        return;
      }

      // Successful simulated domain connector execution
      let mockOutput: any = {};
      switch (selectedTool.name) {
        case "customer_search":
          mockOutput = {
            customers: [
              { id: "c1a8d052", name: "Acme Global Solutions", email: "billing@acmeglobal.com", balance: 45000.0 },
              { id: "e9b41829", name: "Pacific Retail Logistics", email: "finance@pacificretail.com", balance: 12850.0 },
            ],
            total_count: 2,
            query: parsedArgs.query,
          };
          break;
        case "quote_creation":
          const subtotal = 27600.0;
          const discPct = parsedArgs.discount_percentage || 0;
          const discAmt = subtotal * (discPct / 100);
          mockOutput = {
            quote_id: "quo_89218201",
            quote_number: "QUO-2026-0419",
            customer_id: parsedArgs.customer_id,
            subtotal,
            discount_percentage: discPct,
            discount_amount: discAmt,
            total: subtotal - discAmt,
            currency: "USD",
            valid_until: parsedArgs.valid_until,
            status: "draft_approved",
          };
          break;
        case "payment_link_creation":
          mockOutput = {
            payment_link_id: "plink_rzp_" + Math.floor(100000 + Math.random() * 900000),
            checkout_url: "https://pay.nexus-erp.com/plink_rzp_994812",
            amount: parsedArgs.amount,
            currency: parsedArgs.currency || "USD",
            expires_at: "2026-09-30T23:59:59Z",
            status: "active",
          };
          break;
        case "whatsapp_sending":
          mockOutput = {
            message_id: "wamid.HBgL" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            recipient: parsedArgs.phone_number,
            template: parsedArgs.template_name,
            status: "queued_to_meta_provider",
            timestamp: new Date().toISOString(),
          };
          break;
        case "call_scheduling":
          mockOutput = {
            call_id: "call_" + Math.random().toString(36).substring(2, 9),
            phone_number: parsedArgs.phone_number,
            scheduled_time: parsedArgs.scheduled_time,
            status: "scheduled",
            telephony_queue: "priority_collections",
          };
          break;
        case "task_creation":
          mockOutput = {
            task_id: "tsk_" + Math.random().toString(36).substring(2, 9),
            title: parsedArgs.title,
            priority: parsedArgs.priority || "normal",
            due_date: parsedArgs.due_date,
            status: "open",
          };
          break;
        case "crm_updates":
          mockOutput = {
            entity_type: parsedArgs.entity_type,
            entity_id: parsedArgs.entity_id,
            updated_fields: Object.keys(parsedArgs.fields_to_update || {}),
            status: "updated_successfully",
          };
          break;
        case "workflow_execution":
          mockOutput = {
            execution_id: "wf_exec_" + Math.random().toString(36).substring(2, 9),
            workflow_slug: parsedArgs.workflow_slug,
            status: "initiated",
            graph_nodes_count: 8,
          };
          break;
        case "analytics_lookup":
          mockOutput = {
            metric_category: parsedArgs.metric_category,
            metrics: {
              days_sales_outstanding: 34.2,
              benchmark_target: 30.0,
              recovery_rate: 94.8,
              cash_recovered_ytd: 1420500.0,
            },
          };
          break;
        case "exception_creation":
          mockOutput = {
            exception_id: "exc_" + Math.random().toString(36).substring(2, 9),
            category: parsedArgs.category,
            severity: parsedArgs.severity,
            status: "unresolved",
            remediation: "Auto-retry via Cloud Tasks exponential backoff",
          };
          break;
        default:
          mockOutput = { status: "executed", tool: selectedTool.name };
      }

      const execDuration = Math.floor(14 + Math.random() * 22);
      const shaHash = "sha256-" + Math.random().toString(36).substring(2, 14) + Math.random().toString(36).substring(2, 14);

      const successResp = {
        status: "SUCCESS",
        toolName: selectedTool.name,
        result: mockOutput,
        wasCachedReplay: false,
        durationMs: execDuration,
        correlationId: `corr_${Math.random().toString(36).substring(2, 9)}`,
        sha256: shaHash,
        policiesEvaluated: [
          "AUTH_CAPABILITY_VERIFICATION",
          "RATE_LIMIT_SLIDING_WINDOW",
          "IDEMPOTENCY_REPLAY_DEFENSE",
          "SCHEMA_PARAM_BOUNDS_VALIDATION",
          "ENTERPRISE_POLICY_GUARDRAILS",
          "CRYPTOGRAPHIC_AUDIT_SIGNING",
        ],
      };

      setLastResponse(successResp);
      setIsExecuting(false);

      setExecutionLogs((prev) => [
        {
          id: `inv_${idempotencyKey || Date.now()}`,
          toolName: selectedTool.name,
          caller: callerRole,
          status: "SUCCESS",
          durationMs: execDuration,
          timestamp: new Date().toLocaleTimeString(),
          correlationId: successResp.correlationId,
          wasCachedReplay: false,
          sha256Hash: shaHash,
          resultSummary: `Executed ${selectedTool.name} successfully`,
        },
        ...prev,
      ]);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/ai-agents"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5" /> AI Control Plane
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-bold text-slate-800 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
              Tool Gateway
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 12/12 Safe Tools Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Lock className="w-3.5 h-3.5 text-indigo-600" /> Zero Direct DB Access
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Zap className="w-7 h-7 text-indigo-600" />
              AI Tool Gateway & Execution Sandbox
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Enterprise execution mediator for AI agents. Enforces authorization, strict JSON schema validation,
              regulatory policy guardrails, sliding window rate limits, 24h idempotency replay defense, and tamper-evident audit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ai-agents"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Agent Control Plane
            </Link>
            <Link
              href="/workflows"
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
            >
              Workflow Engine <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mt-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Safe Tools</span>
              <Cpu className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">12 / 12</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">All 5 domains covered</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Raw SQL Invariant</span>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">100%</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Strictly Mediated</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Rate Limit Defense</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">Active</div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">20 - 120 req/min</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Idempotency Cache</span>
              <RotateCw className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">24h TTL</div>
            <div className="text-[11px] text-purple-600 font-medium mt-0.5">Replay Protected</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Audit Integrity</span>
              <Fingerprint className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">SHA-256</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Append-Only Ledger</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mt-8">
          <button
            onClick={() => setActiveTab("invoker")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "invoker"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Interactive Tool Invoker & Sandbox
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "catalog"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 12 Safe Tools Catalog & Schemas
          </button>
          <button
            onClick={() => setActiveTab("idempotency")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "idempotency"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" /> Idempotency & Rate Limit Engine
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" /> Gateway Audit Trail ({executionLogs.length})
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-6">
        {/* TAB 1: INTERACTIVE TOOL INVOKER */}
        {activeTab === "invoker" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Configuration & Invoker Form (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Zap className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Select Tool to Execute</h2>
                      <p className="text-[11px] text-slate-500">Pick from 12 safe platform tools</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      selectedTool.safetyTier === "read_only"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : selectedTool.safetyTier === "idempotent_write"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {selectedTool.safetyTier.replace("_", " ")}
                  </span>
                </div>

                {/* Tool Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  {TOOLS_CATALOG.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => handleSelectTool(tool)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition ${
                        selectedToolName === tool.name
                          ? "border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-900 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50"
                      }`}
                    >
                      <div className="truncate">{tool.displayName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tool.category}</div>
                    </button>
                  ))}
                </div>

                {/* Tool Context / Scope Info */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{selectedTool.displayName}</span>
                    <span className="font-mono text-[11px] text-indigo-600">{selectedTool.requiredCapability}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">{selectedTool.description}</p>
                </div>

                {/* Idempotency Key Section */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-slate-500" /> Idempotency Key
                      </span>
                      {selectedTool.isIdempotent && (
                        <button
                          onClick={handleGenerateKey}
                          className="text-[11px] text-indigo-600 hover:underline"
                        >
                          New Key
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={idempotencyKey}
                      onChange={(e) => setIdempotencyKey(e.target.value)}
                      placeholder={selectedTool.isIdempotent ? "e.g. idem_tx_9912a" : "Not applicable (read-only)"}
                      disabled={!selectedTool.isIdempotent}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Caller Identity / Role
                    </label>
                    <select
                      value={callerRole}
                      onChange={(e) => setCallerRole(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="autonomous_agent">Autonomous Agent (CollectionsCopilot)</option>
                      <option value="lead_qualifier">Lead Qualifier Agent</option>
                      <option value="human_copilot">Human Controller (Interactive)</option>
                      <option value="unauthorized_agent">Unauthorized Caller (Test Scope Block)</option>
                      <option value="rogue_sql_agent">Rogue Agent (Simulate SQL Attack)</option>
                    </select>
                  </div>
                </div>

                {/* Capability Scope Toggles */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Caller Capabilities Granted:</span>
                    <span className="text-[11px] text-slate-500">
                      Required: <code className="text-indigo-600 font-mono">{selectedTool.requiredCapability}</code>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                    {[
                      "customers:read",
                      "timeline:read",
                      "invoices:read",
                      "quotes:write",
                      "payments:generate_link",
                      "whatsapp:send",
                      "telephony:schedule",
                      "tasks:write",
                      "crm:update",
                      "workflows:execute",
                      "analytics:read",
                      "exceptions:write",
                    ].map((cap) => {
                      const isGranted = grantedCapabilities.includes(cap);
                      const isRequired = cap === selectedTool.requiredCapability;
                      return (
                        <button
                          key={cap}
                          onClick={() => toggleCapability(cap)}
                          className={`text-[11px] font-mono px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                            isGranted
                              ? isRequired
                                ? "bg-indigo-100 text-indigo-800 border-indigo-300 font-bold"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-white text-slate-400 border-slate-200 line-through"
                          }`}
                        >
                          {isGranted ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                          {cap}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Arguments JSON Editor */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Tool Arguments Payload (JSON):</span>
                    <button
                      onClick={() => setPayloadText(JSON.stringify(selectedTool.samplePayload, null, 2))}
                      className="text-[11px] text-indigo-600 hover:underline"
                    >
                      Reset to Sample
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={payloadText}
                    onChange={(e) => setPayloadText(e.target.value)}
                    className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Invocation Action Button */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Inject SQL attack for testing
                        try {
                          const obj = JSON.parse(payloadText);
                          obj.raw_sql = "SELECT * FROM users WHERE role = 'admin'";
                          setPayloadText(JSON.stringify(obj, null, 2));
                        } catch {}
                      }}
                      className="text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition"
                    >
                      + Inject SQL Attack Test
                    </button>
                    {selectedTool.name === "quote_creation" && (
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const obj = JSON.parse(payloadText);
                            obj.discount_percentage = 25.0; // Trigger policy cap
                            setPayloadText(JSON.stringify(obj, null, 2));
                          } catch {}
                        }}
                        className="text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg transition"
                      >
                        + Set 25% Discount (Policy Test)
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isExecuting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Dispatching...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Execute via Gateway
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Real-time Gateway Output & Pipeline Inspector (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900">Execution Telemetry</h2>
                  </div>
                  {lastResponse && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        lastResponse.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : lastResponse.status === "SECURITY_VIOLATION"
                          ? "bg-rose-50 text-rose-700 border-rose-300"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {lastResponse.status}
                    </span>
                  )}
                </div>

                {/* Pipeline Step Sequence */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Enforcement Pipeline Stages
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" /> 1. Zero-SQL Invariant
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600">PASSED</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> 2. Authorization Grant
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600">CHECKED</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Activity className="w-3.5 h-3.5 text-blue-600" /> 3. Rate Limit Check
                      </span>
                      <span className="text-[10px] font-semibold text-blue-600">HEADROOM OK</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <RotateCw className="w-3.5 h-3.5 text-purple-600" /> 4. Idempotency Cache
                      </span>
                      <span className="text-[10px] font-semibold text-purple-600">
                        {lastResponse?.wasCachedReplay ? "CACHE HIT (REPLAY)" : "EVALUATED"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> 5. Schema Validation
                      </span>
                      <span className="text-[10px] font-semibold text-teal-600">VALIDATED</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 6. Enterprise Policy
                      </span>
                      <span className="text-[10px] font-semibold text-amber-600">ENFORCED</span>
                    </div>
                  </div>
                </div>

                {/* Gateway Execution Result Display */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Gateway Result Payload:</span>
                    {lastResponse && (
                      <span className="text-[11px] font-mono text-slate-500">
                        Latency: {lastResponse.durationMs}ms
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono overflow-x-auto max-h-64">
                    {lastResponse ? (
                      <pre className={lastResponse.status === "SUCCESS" ? "text-emerald-400" : "text-rose-400"}>
                        {JSON.stringify(lastResponse, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-slate-500 italic py-6 text-center">
                        Select a tool and click "Execute via Gateway" to test safe execution and view telemetry.
                      </div>
                    )}
                  </div>

                  {lastResponse?.sha256 && (
                    <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 text-indigo-600" /> Cryptographic SHA-256:
                      </span>
                      <span className="font-mono text-slate-700 truncate max-w-[220px]">
                        {lastResponse.sha256}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 12 SAFE TOOLS CATALOG */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {["all", "crm", "finance", "communications", "automation", "intelligence"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat} {cat === "all" ? `(${TOOLS_CATALOG.length})` : ""}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <div
                  key={tool.name}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        {tool.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          tool.safetyTier === "read_only"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : tool.safetyTier === "idempotent_write"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {tool.safetyTier.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2">{tool.displayName}</h3>
                    <code className="text-[11px] font-mono text-slate-500">{tool.name}</code>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{tool.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[11px] text-slate-400">Required Capability:</span>
                        <code className="text-[11px] font-mono text-indigo-700">{tool.requiredCapability}</code>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[11px] text-slate-400">Rate Limit:</span>
                        <span className="font-semibold text-slate-800">{tool.rateLimitPerMin} req/min</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[11px] text-slate-400">Idempotency Support:</span>
                        <span className={`font-semibold ${tool.isIdempotent ? "text-emerald-600" : "text-slate-400"}`}>
                          {tool.isIdempotent ? "24h Cached" : "Not Required"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        handleSelectTool(tool);
                        setActiveTab("invoker");
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Test in Sandbox <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: IDEMPOTENCY & RATE LIMIT ENGINE */}
        {activeTab === "idempotency" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">24-Hour Idempotency Cache</h3>
                </div>
                <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Replay Protected
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-3">
                All mutating tools accept an <code className="font-mono text-purple-700">idempotency_key</code>.
                When repeated within a 24-hour window, the original cached result is returned without executing duplicate side effects.
              </p>

              <div className="mt-4 space-y-2.5">
                {[
                  {
                    key: "idem_quote_9941a",
                    tool: "quote_creation",
                    createdAt: "10:45:10",
                    expiresIn: "23h 58m",
                    hash: "sha256-fe91092a4819",
                  },
                  {
                    key: "idem_payment_link_creation_4412",
                    tool: "payment_link_creation",
                    createdAt: "09:30:22",
                    expiresIn: "22h 45m",
                    hash: "sha256-4b918ca1209e",
                  },
                  {
                    key: "idem_whatsapp_sending_8819",
                    tool: "whatsapp_sending",
                    createdAt: "08:15:00",
                    expiresIn: "21h 30m",
                    hash: "sha256-a94f091bc2e8",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-800">{item.key}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tool: <code className="text-indigo-600">{item.tool}</code> • Created: {item.createdAt}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        TTL: {item.expiresIn}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rate Limiting Monitor */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Sliding Window Rate Limiter</h3>
                </div>
                <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Token Bucket
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-3">
                Prevents infinite agent loops and resource starvation. Requests exceeding the per-minute limit receive HTTP 429 RateLimitExceeded.
              </p>

              <div className="mt-4 space-y-3">
                {[
                  { tool: "customer_search", limit: 120, used: 28, pct: 23 },
                  { tool: "customer_timeline", limit: 100, used: 14, pct: 14 },
                  { tool: "quote_creation", limit: 30, used: 6, pct: 20 },
                  { tool: "payment_link_creation", limit: 60, used: 12, pct: 20 },
                  { tool: "whatsapp_sending", limit: 40, used: 18, pct: 45 },
                  { tool: "call_scheduling", limit: 20, used: 3, pct: 15 },
                ].map((item) => (
                  <div key={item.tool} className="text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-700 mb-1">
                      <code className="font-mono text-indigo-700">{item.tool}</code>
                      <span className="text-[11px] text-slate-500">
                        {item.used} / {item.limit} req/min ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LEDGER */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Cryptographic Gateway Invocations Ledger</h3>
              </div>
              <span className="text-xs text-slate-500">
                Append-only • Immutable database trigger enforced
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Tool Name</th>
                    <th className="py-2.5 px-4">Caller</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4">Replay</th>
                    <th className="py-2.5 px-4">SHA-256 Audit Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {executionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <code className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-mono">
                          {log.toolName}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{log.caller}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.status === "SECURITY_VIOLATION"
                              ? "bg-rose-50 text-rose-700 border-rose-300"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{log.durationMs}ms</td>
                      <td className="py-3 px-4">
                        {log.wasCachedReplay ? (
                          <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            Replay
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 truncate max-w-[160px]">
                        {log.sha256Hash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
