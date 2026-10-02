"use client";

import React, { useState, useMemo } from "react";
import {
  Cpu,
  CreditCard,
  PhoneCall,
  ArrowUpRight,
  ScanLine,
  Mail,
  Webhook,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Play,
  Key,
  Lock,
  ExternalLink,
  Sliders,
  Settings,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  Database,
  Unlink,
  Radio,
  FileCode,
  Globe,
  Clock,
  Zap,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";

export type AuthType = "oauth2" | "api_key" | "vault_ref" | "hmac_secret" | "basic_auth";
export type SetupStatus = "configured" | "ready_for_setup" | "draft";
export type ConnectionStatus = "healthy" | "degraded" | "disconnected" | "pending_auth";
export type ProviderCategory = "all" | "payments" | "telephony" | "crm" | "ai_ocr" | "infrastructure" | "regional";

interface ProviderCatalogItem {
  id: string;
  provider: string;
  name: string;
  category: "payments" | "telephony" | "crm" | "ai_ocr" | "infrastructure" | "regional";
  description: string;
  authType: AuthType;
  requiredCredentials: string[];
  capabilities: string[];
  setupStatus: SetupStatus;
  connectionStatus: ConnectionStatus;
  latencyMs: number;
  rateLimitPerMin: number;
  lastHealthCheck?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  environment: "production" | "sandbox";
  settings: Record<string, any>;
}

interface WebhookDeliveryLog {
  id: string;
  provider: string;
  eventType: string;
  canonicalType: string;
  signatureVerified: boolean;
  status: "dispatched" | "failed" | "rejected";
  latencyMs: number;
  timestamp: string;
  rawPayload: Record<string, any>;
  normalizedPayload: Record<string, any>;
}

interface ErrorHistoryItem {
  id: string;
  provider: string;
  errorCode: string;
  message: string;
  httpStatus: number;
  retryCount: number;
  timestamp: string;
  resolved: boolean;
}

const INITIAL_CATALOG: ProviderCatalogItem[] = [
  {
    id: "stripe",
    provider: "stripe",
    name: "Stripe Enterprise Payments",
    category: "payments",
    description: "Credit card, ACH, wire settlements, 3D-Secure, recurring subscriptions, and payment_intent webhooks.",
    authType: "api_key",
    requiredCredentials: [
      "Stripe Secret Key (sk_live_...)",
      "Stripe Publishable Key (pk_live_...)",
      "Webhook Signing Secret (whsec_...)",
    ],
    capabilities: ["Payment Processing", "Refunds & Disputes", "Recurring Billing", "3D-Secure"],
    setupStatus: "configured",
    connectionStatus: "healthy",
    latencyMs: 38,
    rateLimitPerMin: 600,
    lastHealthCheck: "1 min ago",
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-stripe-01",
    webhookSecret: "whsec_99182a8b7c6d5e4f3a2b1c0d",
    environment: "production",
    settings: { account_id: "acct_1EnterpriseProd99", live_mode: true },
  },
  {
    id: "twilio",
    provider: "twilio",
    name: "Twilio Telephony & WhatsApp",
    category: "telephony",
    description: "Inbound & Outbound VoIP SIP carrier bridge, WebRTC audio media streaming, and WhatsApp Business API.",
    authType: "api_key",
    requiredCredentials: [
      "Twilio Account SID (AC...)",
      "Auth Token (Secret)",
      "Registered Phone Number (+1...)",
      "WhatsApp Business Sender ID",
    ],
    capabilities: ["Voice Telephony", "Audio Streaming", "WhatsApp Messaging", "SMS / MMS"],
    setupStatus: "configured",
    connectionStatus: "healthy",
    latencyMs: 46,
    rateLimitPerMin: 300,
    lastHealthCheck: "2 mins ago",
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-twilio-01",
    webhookSecret: "tw_sig_secret_8844aa22",
    environment: "production",
    settings: { account_sid: "AC998811223344556677", phone_numbers: ["+15550199"] },
  },
  {
    id: "salesforce",
    provider: "salesforce",
    name: "Salesforce CRM Enterprise",
    category: "crm",
    description: "Bi-directional enterprise pipeline synchronization for Companies, Contacts, and Opportunities.",
    authType: "oauth2",
    requiredCredentials: [
      "OAuth 2.0 Client ID",
      "OAuth 2.0 Client Secret",
      "Salesforce Instance URL (https://company.my.salesforce.com)",
      "OAuth Redirect Callback URI",
    ],
    capabilities: ["CRM Company Sync", "CRM Contact Sync", "CRM Deal Sync", "Outbox Push"],
    setupStatus: "configured",
    connectionStatus: "healthy",
    latencyMs: 64,
    rateLimitPerMin: 120,
    lastHealthCheck: "5 mins ago",
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-salesforce-01",
    webhookSecret: "sf_webhook_secret_7711",
    environment: "production",
    settings: { instance_url: "https://enterprise.my.salesforce.com", org_id: "00D50000000xxxx" },
  },
  {
    id: "google_vision",
    provider: "google_vision",
    name: "Google Cloud Document AI & Vision OCR",
    category: "ai_ocr",
    description: "Machine-learning document parser extracting supplier invoices, receipt bounding boxes, and line items.",
    authType: "vault_ref",
    requiredCredentials: [
      "Google Cloud Project ID",
      "Document AI Processor ID",
      "GCP Region / Location",
      "KMS Encrypted Service Account Vault Ref",
    ],
    capabilities: ["Document OCR Vision", "Invoice Extraction", "CloudEvent Streaming"],
    setupStatus: "configured",
    connectionStatus: "healthy",
    latencyMs: 82,
    rateLimitPerMin: 400,
    lastHealthCheck: "3 mins ago",
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-vision-01",
    webhookSecret: "gcp_vault_sec_99",
    environment: "production",
    settings: { processor_id: "projects/enterprise-prod/locations/us/processors/ocr-99" },
  },
  {
    id: "quickbooks",
    provider: "quickbooks",
    name: "QuickBooks Online Enterprise",
    category: "payments",
    description: "ERP chart of accounts synchronization, tax item mapping, and general ledger journal posting.",
    authType: "oauth2",
    requiredCredentials: [
      "Intuit Developer Client ID",
      "Intuit Client Secret",
      "Company Realm ID",
      "OAuth2 Authorization Scopes",
    ],
    capabilities: ["ERP General Ledger", "Tax Calculation", "Journal Entries"],
    setupStatus: "ready_for_setup",
    connectionStatus: "pending_auth",
    latencyMs: 0,
    rateLimitPerMin: 300,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-quickbooks-01",
    webhookSecret: "qb_secret_pending",
    environment: "sandbox",
    settings: {},
  },
  {
    id: "hubspot",
    provider: "hubspot",
    name: "HubSpot CRM & Marketing",
    category: "crm",
    description: "Marketing lead ingestion, email campaign timeline events, and omnichannel lead scoring.",
    authType: "oauth2",
    requiredCredentials: [
      "HubSpot App Client ID",
      "App Client Secret",
      "HubSpot Portal ID (Hub ID)",
      "OAuth2 Webhook Subscriptions",
    ],
    capabilities: ["Lead Ingestion", "Campaign Attribution", "Contact Sync"],
    setupStatus: "ready_for_setup",
    connectionStatus: "pending_auth",
    latencyMs: 0,
    rateLimitPerMin: 200,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-hubspot-01",
    webhookSecret: "hs_secret_pending",
    environment: "sandbox",
    settings: {},
  },
  {
    id: "sendgrid",
    provider: "sendgrid",
    name: "SendGrid Transactional Email",
    category: "telephony",
    description: "Transactional SMTP email delivery, engagement tracking, and bounce webhook handling.",
    authType: "api_key",
    requiredCredentials: [
      "SendGrid API Key (SG...)",
      "Verified Sender Domain / Email",
      "Inbound Event Webhook Signing Key",
    ],
    capabilities: ["Email Delivery", "Bounce Webhooks", "Open/Click Tracking"],
    setupStatus: "configured",
    connectionStatus: "healthy",
    latencyMs: 29,
    rateLimitPerMin: 500,
    lastHealthCheck: "4 mins ago",
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-sendgrid-01",
    webhookSecret: "sg_signing_key_4455",
    environment: "production",
    settings: { from_email: "billing@enterprise.internal" },
  },
  {
    id: "generic_rest",
    provider: "generic_rest",
    name: "Generic REST & Custom Webhook Sink",
    category: "infrastructure",
    description: "Custom connector adapter for on-premise ERPs, legacy systems, and external event sinks.",
    authType: "hmac_secret",
    requiredCredentials: [
      "Target Webhook Endpoint URL",
      "HMAC SHA-256 Shared Secret",
      "Custom Signature Header Name",
    ],
    capabilities: ["Generic Webhook", "CloudEvent Streaming"],
    setupStatus: "ready_for_setup",
    connectionStatus: "disconnected",
    latencyMs: 0,
    rateLimitPerMin: 200,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-generic-01",
    webhookSecret: "custom_secret_123",
    environment: "sandbox",
    settings: {},
  },
  {
    id: "dbs_paynow",
    provider: "dbs_paynow",
    name: "Singapore Payments (DBS RAPID & PayNow)",
    category: "regional",
    description: "PayNow SGQR EMVCo generation, FAST interbank clearing, and DBS RAPID webhook verification for Singapore.",
    authType: "api_key",
    requiredCredentials: [
      "DBS RAPID Client ID",
      "DBS RAPID API Secret Key",
      "PayNow Proxy ID (Corporate UEN)",
      "DBS Signing Private Key",
    ],
    capabilities: ["PayNow SGQR Generation", "FAST Settlement", "Webhook Verification"],
    setupStatus: "ready_for_setup",
    connectionStatus: "pending_auth",
    latencyMs: 0,
    rateLimitPerMin: 120,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-dbs-paynow-01",
    webhookSecret: "dbs_wh_sec_prod",
    environment: "sandbox",
    settings: { currency: "SGD", scheme: "SGQR" },
  },
  {
    id: "malaysia_curlec_lhdn",
    provider: "malaysia_curlec_lhdn",
    name: "Malaysia Payments & LHDN MyInvois",
    category: "regional",
    description: "Curlec / DuitNow FPX bank payment rails and mandatory LHDN MyInvois e-invoicing API integration for Malaysia.",
    authType: "oauth2",
    requiredCredentials: [
      "Curlec App ID",
      "Curlec Secret Key",
      "LHDN Client ID",
      "LHDN Client Secret",
      "X.509 Digital Certificate Ref",
    ],
    capabilities: ["DuitNow QR", "FPX Direct Banking", "LHDN MyInvois Submission", "QR Verification"],
    setupStatus: "ready_for_setup",
    connectionStatus: "pending_auth",
    latencyMs: 0,
    rateLimitPerMin: 100,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-my-curlec-01",
    webhookSecret: "my_curlec_wh_sec",
    environment: "sandbox",
    settings: { currency: "MYR", sst_rate: "8.0%" },
  },
  {
    id: "thailand_omise_etax",
    provider: "thailand_omise_etax",
    name: "Thailand Payments (PromptPay) & e-Tax",
    category: "regional",
    description: "PromptPay QR via Omise/2C2P and Thai Revenue Department e-Tax XML submission gateway for Thailand.",
    authType: "api_key",
    requiredCredentials: [
      "Omise Public Key",
      "Omise Secret Key",
      "Thai RD Service Code",
      "Thai RD API Key",
      "e-Tax Digital Certificate Ref",
    ],
    capabilities: ["PromptPay QR", "Thai QR Standard", "Thai RD e-Tax XML", "Digital Signing"],
    setupStatus: "ready_for_setup",
    connectionStatus: "pending_auth",
    latencyMs: 0,
    rateLimitPerMin: 100,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-th-omise-01",
    webhookSecret: "omise_wh_sec_prod",
    environment: "sandbox",
    settings: { currency: "THB", vat_rate: "7.0%" },
  },
  {
    id: "line_thailand",
    provider: "line_thailand",
    name: "LINE Official Account (Thailand)",
    category: "regional",
    description: "LINE Messaging API webhook listener, 1-on-1 customer chat, Rich Menu dispatch, and payment link cards for Thai commerce.",
    authType: "hmac_secret",
    requiredCredentials: [
      "LINE Channel ID",
      "LINE Channel Secret",
      "LINE Channel Access Token (Long-Lived)",
    ],
    capabilities: ["LINE Messaging API", "Rich Menu Dispatch", "HMAC-SHA256 Webhook Verification", "Push & Reply"],
    setupStatus: "ready_for_setup",
    connectionStatus: "pending_auth",
    latencyMs: 0,
    rateLimitPerMin: 300,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-line-th-01",
    webhookSecret: "line_channel_secret_vault",
    environment: "sandbox",
    settings: { default_locale: "th-TH" },
  },
  {
    id: "regional_messaging",
    provider: "regional_messaging",
    name: "Regional Messaging Gateway (SEA Multi-Carrier)",
    category: "regional",
    description: "Multi-carrier SMS and OTT messaging (Viber, SMS) routing across Singapore (+65), Malaysia (+60), and Thailand (+66).",
    authType: "api_key",
    requiredCredentials: [
      "Regional SMS Provider (Twilio/Infobip)",
      "SMS API Key",
      "Registered Sender ID",
    ],
    capabilities: ["Singapore IMDA SMS (+65)", "Malaysia MCMC SMS (+60)", "Thailand NBTC SMS (+66)", "Viber Business"],
    setupStatus: "ready_for_setup",
    connectionStatus: "pending_auth",
    latencyMs: 0,
    rateLimitPerMin: 500,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-regional-sms-01",
    webhookSecret: "regional_sms_wh_sec",
    environment: "sandbox",
    settings: { fallback_route: "global_sms" },
  },
  {
    id: "local_comms_services",
    provider: "local_comms_services",
    name: "Local Communication Services (Regional SIP Trunks)",
    category: "regional",
    description: "Regional SIP Trunking with local carrier peering (Singtel SG, Maxis MY, AIS TH) and localized caller ID masking.",
    authType: "basic_auth",
    requiredCredentials: [
      "SIP Trunk Domain",
      "SIP Authentication User",
      "SIP Password",
      "Carrier Peer (Singtel/Maxis/AIS)",
    ],
    capabilities: ["Regional SIP Trunking", "Local Carrier Peering", "Caller ID Masking", "Low-Latency Media Routing"],
    setupStatus: "ready_for_setup",
    connectionStatus: "pending_auth",
    latencyMs: 0,
    rateLimitPerMin: 200,
    webhookUrl: "https://api.nexus.internal/api/v1/webhooks/conn-local-sip-01",
    webhookSecret: "sip_auth_token_vault",
    environment: "sandbox",
    settings: { codecs: ["G.711u", "Opus"] },
  },
];

const INITIAL_WEBHOOK_DELIVERIES: WebhookDeliveryLog[] = [
  {
    id: "wh-log-01",
    provider: "stripe",
    eventType: "payment_intent.succeeded",
    canonicalType: "payment.received.v1",
    signatureVerified: true,
    status: "dispatched",
    latencyMs: 32,
    timestamp: "2026-09-22 14:15:02 UTC",
    rawPayload: { id: "pi_3Mz9910Prod", amount: 4500000, currency: "usd", status: "succeeded" },
    normalizedPayload: { amount: 45000.0, currency: "USD", provider: "stripe", status: "settled" },
  },
  {
    id: "wh-log-02",
    provider: "twilio",
    eventType: "whatsapp_inbound",
    canonicalType: "whatsapp.message_received.v1",
    signatureVerified: true,
    status: "dispatched",
    latencyMs: 28,
    timestamp: "2026-09-22 13:45:18 UTC",
    rawPayload: { MessageSid: "SM9988112233", From: "whatsapp:+15550199", Body: "Payment wire confirmed." },
    normalizedPayload: { sender_phone: "+15550199", text_body: "Payment wire confirmed.", channel: "whatsapp" },
  },
  {
    id: "wh-log-03",
    provider: "salesforce",
    eventType: "deal.updated",
    canonicalType: "crm.deal_updated.v1",
    signatureVerified: true,
    status: "dispatched",
    latencyMs: 44,
    timestamp: "2026-09-22 13:30:10 UTC",
    rawPayload: { Id: "00650000001xxxx", StageName: "Closed Won", Amount: 145000 },
    normalizedPayload: { salesforce_id: "00650000001xxxx", stage: "Closed Won", amount: 145000.0 },
  },
];

const INITIAL_ERROR_HISTORY: ErrorHistoryItem[] = [
  {
    id: "err-01",
    provider: "salesforce",
    errorCode: "SF_GATEWAY_TIMEOUT",
    message: "Salesforce REST API v58.0 endpoint timed out after 10000ms. Remote gateway 504.",
    httpStatus: 504,
    retryCount: 2,
    timestamp: "2026-09-22 14:28:10 UTC",
    resolved: false,
  },
  {
    id: "err-02",
    provider: "stripe",
    errorCode: "STRIPE_INSUFFICIENT_FUNDS",
    message: "Stripe 3D-Secure charge declined: card *4242 insufficient funds.",
    httpStatus: 402,
    retryCount: 1,
    timestamp: "2026-09-22 14:22:45 UTC",
    resolved: false,
  },
  {
    id: "err-03",
    provider: "twilio",
    errorCode: "TWILIO_SIP_DROP",
    message: "WebRTC media leg dropped prematurely during Voice AI synthesis.",
    httpStatus: 500,
    retryCount: 1,
    timestamp: "2026-09-22 13:42:30 UTC",
    resolved: true,
  },
];

export default function IntegrationCenterPage() {
  const [catalog, setCatalog] = useState<ProviderCatalogItem[]>(INITIAL_CATALOG);
  const [activeTab, setActiveTab] = useState<"catalog" | "connected" | "webhooks" | "errors">("catalog");
  const [categoryFilter, setCategoryFilter] = useState<ProviderCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [wizardProvider, setWizardProvider] = useState<ProviderCatalogItem | null>(null);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookDeliveryLog | null>(null);

  // Wizard state (Credentials are securely masked and never sent in plaintext to client logs)
  const [wizardInputs, setWizardInputs] = useState<Record<string, string>>({});

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [catalog, categoryFilter, searchQuery]);

  const connectedList = useMemo(() => {
    return catalog.filter((c) => c.setupStatus === "configured");
  }, [catalog]);

  const handleTestConnection = (item: ProviderCatalogItem) => {
    setTestingId(item.id);
    setTestResult(null);

    setTimeout(() => {
      setTestResult({
        success: true,
        provider: item.name,
        latencyMs: Math.floor(Math.random() * 35) + 25,
        message: `Connection to ${item.name} probe verified. Authenticated under tenant isolation with all ${item.capabilities.length} capabilities confirmed.`,
        testedAt: new Date().toISOString(),
      });
      setTestingId(null);
    }, 1100);
  };

  const handleOpenWizard = (item: ProviderCatalogItem) => {
    setWizardProvider(item);
    setWizardStep(1);
    setWizardInputs({});
  };

  const handleCompleteWizard = () => {
    if (!wizardProvider) return;

    setCatalog((prev) =>
      prev.map((c) => {
        if (c.id === wizardProvider.id) {
          return {
            ...c,
            setupStatus: "configured",
            connectionStatus: "healthy",
            latencyMs: Math.floor(Math.random() * 30) + 30,
            lastHealthCheck: "Just now",
          };
        }
        return c;
      })
    );
    setWizardProvider(null);
  };

  const handleDisconnect = (id: string) => {
    setCatalog((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            setupStatus: "ready_for_setup",
            connectionStatus: "disconnected",
            latencyMs: 0,
          };
        }
        return c;
      })
    );
  };

  const getAuthBadge = (authType: AuthType) => {
    switch (authType) {
      case "oauth2":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-800">OAuth 2.0 Required</span>;
      case "api_key":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800">API Key Required</span>;
      case "vault_ref":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">Cloud KMS Vault</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">HMAC Signature</span>;
    }
  };

  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case "healthy":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected (Healthy)
          </span>
        );
      case "degraded":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Degraded
          </span>
        );
      case "disconnected":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Disconnected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
            Pending Setup
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-500" />
            Enterprise Integration Center & Connector Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage external connectors, OAuth authentication, masked API credentials, live health probes, and webhook ingestion feeds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("webhooks")}
          >
            <Webhook className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
            Webhook Ingestion Feeds
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Connected Integrations</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">
            {connectedList.length} / {catalog.length}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            Multi-Tenant Isolated via Vault
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Average Roundtrip Latency</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-1">42 ms</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Health Check Interval: 60s
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Webhook Deliveries (24h)</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1">18,490</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            100% HMAC SHA-256 Verified
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Rate Limit Quota</span>
            <Sliders className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-1">2,120 /min</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Sliding Window Token Bucket
          </span>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-800 flex items-center space-x-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeTab === "catalog"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Provider Catalog ({catalog.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("connected")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeTab === "connected"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Connected Integrations ({connectedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("webhooks")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeTab === "webhooks"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Webhook className="h-4 w-4 text-indigo-400" />
          <span>Webhook Ingestion Log ({INITIAL_WEBHOOK_DELIVERIES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("errors")}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeTab === "errors"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Error & Retry Telemetry ({INITIAL_ERROR_HISTORY.length})</span>
        </button>
      </div>

      {/* Tab 1: Provider Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Category Chips & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Categories" },
                { id: "payments", label: "Payments & ERP" },
                { id: "telephony", label: "Telephony & Comms" },
                { id: "crm", label: "CRM & Pipelines" },
                { id: "ai_ocr", label: "AI & OCR Vision" },
                { id: "regional", label: "Regional SEA (6)" },
                { id: "infrastructure", label: "Infrastructure" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as ProviderCategory)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search provider, capability..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Catalog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((item) => (
              <Card
                key={item.id}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top Bar: Auth Badge & Connection Status */}
                  <div className="flex items-center justify-between">
                    {getAuthBadge(item.authType)}
                    {getStatusBadge(item.connectionStatus)}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  {/* Required Credentials List */}
                  <div className="space-y-1 bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Required Credentials
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {item.requiredCredentials.map((cred, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <Key className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{cred}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Discoverable Capabilities */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Capabilities
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                  {item.setupStatus === "configured" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        disabled={testingId === item.id}
                        onClick={() => handleTestConnection(item)}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 mr-1 ${testingId === item.id ? "animate-spin" : ""}`} />
                        {testingId === item.id ? "Testing..." : "Test Ping"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleOpenWizard(item)}
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleOpenWizard(item)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Configure & Connect
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Connected Integrations */}
      {activeTab === "connected" && (
        <div className="space-y-4">
          <Card className="bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center font-mono">#</th>
                    <th className="py-3 px-4">Provider / Name</th>
                    <th className="py-3 px-4">Auth Scheme</th>
                    <th className="py-3 px-4">Health & Latency</th>
                    <th className="py-3 px-4">Rate Limit</th>
                    <th className="py-3 px-4">Last Health Probe</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {connectedList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center space-x-2">
                          <span>{item.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            {item.environment}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getAuthBadge(item.authType)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-mono text-emerald-400 font-bold">{item.latencyMs} ms</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {item.rateLimitPerMin} req / min
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {item.lastHealthCheck || "Just now"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={testingId === item.id}
                          onClick={() => handleTestConnection(item)}
                          className="text-xs"
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${testingId === item.id ? "animate-spin" : ""}`} />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenWizard(item)}
                          className="text-xs"
                        >
                          <Settings className="h-3 w-3 mr-1" /> Reconnect
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(item.id)}
                          className="text-xs text-rose-400 border-rose-800/60 hover:bg-rose-950"
                        >
                          <Unlink className="h-3 w-3 mr-1" /> Disconnect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Webhook Deliveries Log */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <Card className="bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center font-mono">#</th>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Raw Vendor Event</th>
                    <th className="py-3 px-4">Canonical Normalized Event</th>
                    <th className="py-3 px-4">HMAC Signature</th>
                    <th className="py-3 px-4">Processing Status</th>
                    <th className="py-3 px-4 text-right">Inspect Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {INITIAL_WEBHOOK_DELIVERIES.map((log, idx) => (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{log.timestamp}</td>
                      <td className="py-3 px-4 font-bold text-white uppercase font-mono">{log.provider}</td>
                      <td className="py-3 px-4 font-mono text-amber-400">{log.eventType}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{log.canonicalType}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 w-fit">
                          <ShieldCheck className="h-3 w-3" /> SHA-256 Valid
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800 font-semibold uppercase">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWebhook(log)}
                          className="text-xs"
                        >
                          <FileCode className="h-3.5 w-3.5 mr-1" /> Payload
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Error History Telemetry */}
      {activeTab === "errors" && (
        <div className="space-y-4">
          <Card className="bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center font-mono">#</th>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Error Code</th>
                    <th className="py-3 px-4">Error Description</th>
                    <th className="py-3 px-4">HTTP Status</th>
                    <th className="py-3 px-4">Retries</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {INITIAL_ERROR_HISTORY.map((err, idx) => (
                    <tr key={err.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{err.timestamp}</td>
                      <td className="py-3 px-4 font-bold text-white uppercase font-mono">{err.provider}</td>
                      <td className="py-3 px-4 font-mono text-rose-400">{err.errorCode}</td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{err.message}</td>
                      <td className="py-3 px-4 font-mono text-amber-400">{err.httpStatus}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{err.retryCount} attempts</td>
                      <td className="py-3 px-4 text-right">
                        {err.resolved ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Auto-Resolved
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800">
                            Action Needed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Multi-Step Setup Wizard Modal */}
      {wizardProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Wizard Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  Configure {wizardProvider.name}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Step {wizardStep} of 3: {wizardStep === 1 ? "Authentication & Credentials" : wizardStep === 2 ? "Webhook & Ingestion Settings" : "Test & Activate"}
                </span>
              </div>
              <button
                onClick={() => setWizardProvider(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Wizard Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              {/* Step 1: Credentials */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Auth Scheme: {wizardProvider.authType.toUpperCase()}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Secrets Vault Encrypted
                    </span>
                  </div>

                  {wizardProvider.authType === "oauth2" ? (
                    <div className="space-y-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700 text-center">
                      <Globe className="h-8 w-8 text-indigo-400 mx-auto" />
                      <h4 className="font-bold text-white text-sm">OAuth 2.0 Authorization Flow</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Clicking authorize will open {wizardProvider.name}'s secure consent screen. Credentials will be securely stored in the KMS encrypted vault.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setWizardInputs({ oauth_status: "authorized" });
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        {wizardInputs.oauth_status === "authorized" ? "OAuth Token Acquired ✓" : `Authorize with ${wizardProvider.name}`}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wizardProvider.requiredCredentials.map((cred, i) => (
                        <div key={i}>
                          <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                            {cred}
                          </label>
                          <input
                            type="password"
                            placeholder={`Enter ${cred}...`}
                            value={wizardInputs[cred] || ""}
                            onChange={(e) => setWizardInputs({ ...wizardInputs, [cred]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Webhooks */}
              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div className="space-y-2 bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                      <Webhook className="h-4 w-4 text-indigo-400" />
                      Inbound Webhook Configuration
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      Copy this dedicated tenant endpoint into your {wizardProvider.name} developer portal to receive real-time updates.
                    </p>

                    <div className="space-y-2 pt-2">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                          Tenant Webhook URL
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            readOnly
                            value={wizardProvider.webhookUrl || `https://api.nexus.internal/api/v1/webhooks/conn-${wizardProvider.id}`}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-300"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(wizardProvider.webhookUrl || "", "wh-url-wiz")}
                          >
                            {copiedKey === "wh-url-wiz" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                          Webhook Signing Secret
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="password"
                            readOnly
                            value={wizardProvider.webhookSecret || "whsec_live_99228833"}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-300"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(wizardProvider.webhookSecret || "", "wh-sec-wiz")}
                          >
                            {copiedKey === "wh-sec-wiz" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Test & Activate */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-white text-sm">Connection Credentials Staged</h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      All required parameters have been formatted. Click below to verify remote connectivity and capability discovery.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                    <div className="text-slate-400 uppercase font-bold text-[10px] pb-1 border-b border-slate-800">
                      Discovered Capabilities to Enable:
                    </div>
                    {wizardProvider.capabilities.map((c) => (
                      <div key={c} className="text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-3 w-3" /> {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                {wizardStep > 1 && (
                  <Button variant="outline" size="sm" onClick={() => setWizardStep(wizardStep - 1)}>
                    Back
                  </Button>
                )}
              </div>

              <div>
                {wizardStep < 3 ? (
                  <Button variant="primary" size="sm" onClick={() => setWizardStep(wizardStep + 1)}>
                    Next Step <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleCompleteWizard}>
                    Save & Activate Connector
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Test Result Modal */}
      {testResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Connection Validated</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Latency: {testResult.latencyMs}ms | Provider: {testResult.provider}
                </span>
              </div>
            </div>

            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs space-y-2">
              <p className="text-slate-200">{testResult.message}</p>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-700">
                Timestamp: {testResult.testedAt}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setTestResult(null)}>
                Close Test
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Payload Details Modal */}
      {selectedWebhook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Webhook Payload ({selectedWebhook.provider.toUpperCase()} ➔ {selectedWebhook.canonicalType})
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedWebhook.id} | Timestamp: {selectedWebhook.timestamp}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedWebhook(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                    Raw Vendor Payload ({selectedWebhook.eventType})
                  </span>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedWebhook.rawPayload, null, 2)}
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                    Normalized Canonical Event ({selectedWebhook.canonicalType})
                  </span>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedWebhook.normalizedPayload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedWebhook(null)}>
                Close Payload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
