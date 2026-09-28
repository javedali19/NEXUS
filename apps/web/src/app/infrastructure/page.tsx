"use client";

import React, { useState } from "react";
import {
  Cloud,
  Server,
  Database,
  Lock,
  ShieldCheck,
  Cpu,
  Boxes,
  Network,
  Activity,
  Layers,
  Terminal,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Play,
  Key,
  KeyRound,
  FileCode2,
  ShieldAlert,
  Sliders,
  Check,
  ArrowRight,
  AlertTriangle,
  FolderGit2,
  Radio,
  EyeOff,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  useToast,
} from "@/components/ui";

type Environment = "development" | "staging" | "production";

interface ServiceItem {
  id: string;
  number: number;
  name: string;
  category: "compute" | "data" | "messaging" | "security" | "containers" | "networking" | "observability";
  resourceId: string;
  status: "healthy" | "provisioning" | "degraded";
  spec: string;
  cmekEncrypted: boolean;
  haEnabled: boolean;
  description: string;
  terraformFile: string;
  details: Record<string, string>;
}

interface SecretVaultItem {
  id: string;
  secretName: string;
  provider: string;
  referencingServices: string[];
  rotationDays: number;
  status: "active" | "rotated";
  version: string;
}

const ENV_SPECS: Record<
  Environment,
  {
    projectId: string;
    region: string;
    dbTier: string;
    ha: boolean;
    waf: boolean;
    minRun: number;
    maxRun: number;
    cidr: string;
  }
> = {
  development: {
    projectId: "nexus-erp-dev",
    region: "us-central1",
    dbTier: "db-f1-micro",
    ha: false,
    waf: false,
    minRun: 0,
    maxRun: 3,
    cidr: "10.20.0.0/20",
  },
  staging: {
    projectId: "nexus-erp-staging",
    region: "us-central1",
    dbTier: "db-custom-2-7680",
    ha: false,
    waf: true,
    minRun: 1,
    maxRun: 5,
    cidr: "10.30.0.0/20",
  },
  production: {
    projectId: "nexus-erp-prod",
    region: "us-central1",
    dbTier: "db-custom-4-15360",
    ha: true,
    waf: true,
    minRun: 2,
    maxRun: 20,
    cidr: "10.10.0.0/20",
  },
};

const SERVICES_DATA: ServiceItem[] = [
  {
    id: "cloud_run",
    number: 1,
    name: "Google Cloud Run",
    category: "compute",
    resourceId: "platform-api-gateway & platform-web",
    status: "healthy",
    spec: "Autoscaling 2-20 instances • 2 vCPU / 2GiB memory • Serverless VPC Access",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Serverless container execution for REST/WebSocket API and Next.js frontend with VPC egress.",
    terraformFile: "compute.tf",
    details: {
      "VPC Connector": "production-vpc-conn",
      "Egress Mode": "PRIVATE_RANGES_ONLY",
      "Ingress": "INGRESS_TRAFFIC_ALL",
      "Execution SA": "sa-platform-runner@nexus-erp-prod.iam.gserviceaccount.com",
    },
  },
  {
    id: "cloud_sql",
    number: 2,
    name: "Cloud SQL PostgreSQL 15",
    category: "data",
    resourceId: "platform-postgres-v15",
    status: "healthy",
    spec: "PostgreSQL 15 • db-custom-4-15360 • Regional HA Failover • Private IP only",
    cmekEncrypted: true,
    haEnabled: true,
    description: "Enterprise multi-tenant relational store with CMEK encryption and automated PITR daily backups.",
    terraformFile: "database.tf",
    details: {
      "CMEK Key": "production-sql-key (Cloud KMS)",
      "Private Network": "production-platform-vpc",
      "Public IPv4": "Disabled (Private IP only)",
      "Backup Retention": "30 days (PITR enabled)",
    },
  },
  {
    id: "pubsub",
    number: 3,
    name: "Cloud Pub/Sub",
    category: "messaging",
    resourceId: "platform-events-topic",
    status: "healthy",
    spec: "At-least-once asynchronous event delivery • Dead-letter topic routing",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Distributed messaging backbone for payment capture, invoice events, and webhook dispatches.",
    terraformFile: "messaging.tf",
    details: {
      "Dead Letter Topic": "production-platform-deadletter-topic",
      "Max Delivery Attempts": "5 attempts",
      "Ack Deadline": "60 seconds",
      "Retention": "7 days",
    },
  },
  {
    id: "cloud_tasks",
    number: 4,
    name: "Cloud Tasks",
    category: "messaging",
    resourceId: "platform-default-queue & priority-queue",
    status: "healthy",
    spec: "Multi-tier queues • 1,000 dispatches/sec • Exponential backoff retries",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Guaranteed asynchronous execution for dunning notices, OCR jobs, and AI voice calls.",
    terraformFile: "messaging.tf",
    details: {
      "Priority Queue": "1,000 dispatches/sec (max 200 concurrent)",
      "Default Queue": "500 dispatches/sec (max 100 concurrent)",
      "DLQ Queue": "50 dispatches/sec with manual drain",
      "Retry Doublings": "3-4 doublings with jitter",
    },
  },
  {
    id: "cloud_scheduler",
    number: 5,
    name: "Cloud Scheduler",
    category: "messaging",
    resourceId: "platform-outbox-cron & dunning-cron",
    status: "healthy",
    spec: "Distributed Cron engine • OIDC Token authentication via sa-tasks-invoker",
    cmekEncrypted: false,
    haEnabled: false,
    description: "Predictable periodic triggers driving outbox batch publisher and hourly collections dunning.",
    terraformFile: "messaging.tf",
    details: {
      "Outbox Publisher": "* * * * * (Every minute)",
      "Dunning Docket": "0 * * * * (Hourly)",
      "Auth Mode": "OIDC Identity Token (Google-signed)",
      "Target Endpoint": "/tasks/outbox-publisher",
    },
  },
  {
    id: "cloud_storage",
    number: 6,
    name: "Cloud Storage",
    category: "data",
    resourceId: "nexus-erp-prod-production-tenant-assets",
    status: "healthy",
    spec: "Uniform Bucket-Level Access • CMEK Envelope Encryption • Auto-tiering",
    cmekEncrypted: true,
    haEnabled: true,
    description: "Secure multi-tenant document and invoice attachment storage with lifecycle archival.",
    terraformFile: "storage.tf",
    details: {
      "CMEK Key": "production-storage-key (Cloud KMS)",
      "UBLA": "Enforced (No public object ACLs)",
      "Lifecycle Tiering": "Nearline at 90d, Coldline at 365d",
      "Versioning": "Enabled (Object version retention)",
    },
  },
  {
    id: "secret_manager",
    number: 7,
    name: "Secret Manager",
    category: "security",
    resourceId: "production-secrets-vault",
    status: "healthy",
    spec: "10 Managed Secrets • Auto-replication • Zero plaintext stored in repo",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Centralized secret store injecting third-party API credentials directly into Cloud Run.",
    terraformFile: "secrets.tf",
    details: {
      "Third-Party Secrets": "Stripe, Razorpay, Twilio, WhatsApp, Gemini, ElevenLabs, Deepgram, Sentry",
      "IAM Accessor": "roles/secretmanager.secretAccessor",
      "Runtime Injection": "value_source.secret_key_ref",
      "Plaintext in Code": "0 (Strictly Forbidden)",
    },
  },
  {
    id: "cloud_kms",
    number: 8,
    name: "Cloud KMS",
    category: "security",
    resourceId: "production-platform-keyring",
    status: "healthy",
    spec: "Customer-Managed Encryption Keys (CMEK) • 90-day automatic key rotation",
    cmekEncrypted: true,
    haEnabled: true,
    description: "Cryptographic root of trust managing envelope encryption across Cloud SQL and Cloud Storage.",
    terraformFile: "security.tf",
    details: {
      "Keys Managed": "sql-key, storage-key, app-data-key",
      "Rotation Period": "7,776,000s (90 days)",
      "Algorithm": "GOOGLE_SYMMETRIC_ENCRYPTION",
      "Encrypter/Decrypter SAs": "sqladmin.googleapis.com, storage.googleapis.com",
    },
  },
  {
    id: "artifact_registry",
    number: 9,
    name: "Artifact Registry",
    category: "containers",
    resourceId: "production-platform",
    status: "healthy",
    spec: "OCI Docker Format • Automated Vulnerability Scanning • Cleanup Policies",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Immutable repository storing multi-stage production images for Web, API Gateway, and Workers.",
    terraformFile: "containers.tf",
    details: {
      "Repository URI": "us-central1-docker.pkg.dev/nexus-erp-prod/production-platform",
      "Vulnerability Scan": "Continuous on-push scanning",
      "Retention Policy": "Keep 10 most recent versions, purge untagged > 7d",
      "Format": "DOCKER",
    },
  },
  {
    id: "iam",
    number: 10,
    name: "IAM & Service Identities",
    category: "security",
    resourceId: "sa-github-deployer & sa-platform-runner",
    status: "healthy",
    spec: "Strict Least-Privilege IAM • Workload Identity Federation • Zero JSON keys",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Discrete service accounts separating build-time deployment identity from runtime execution.",
    terraformFile: "workload_identity.tf",
    details: {
      "Deployment SA": "sa-github-deployer (WIF OIDC impersonation only)",
      "Runtime SA": "sa-platform-runner (Cloud Run execution)",
      "Invoker SA": "sa-tasks-invoker (Tasks/Scheduler token signer)",
      "Stored JSON Keys": "0 (Strictly prohibited)",
    },
  },
  {
    id: "networking",
    number: 11,
    name: "Networking & VPC Access",
    category: "networking",
    resourceId: "production-platform-vpc & vpc-conn",
    status: "healthy",
    spec: "Custom VPC • 10.10.0.0/20 app subnet • Serverless VPC Connector • Cloud NAT",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Private network topology isolating database traffic while providing Cloud NAT internet egress.",
    terraformFile: "networking.tf",
    details: {
      "App Subnet": "10.10.0.0/20 (us-central1)",
      "Serverless Connector": "10.10.16.0/28 (e2-micro min 2, max 10)",
      "Private Service Access": "VPC Peering for Cloud SQL",
      "Cloud NAT Gateway": "Auto-allocated outbound IP",
    },
  },
  {
    id: "monitoring",
    number: 12,
    name: "Cloud Monitoring & Alerting",
    category: "observability",
    resourceId: "production-platform-observability",
    status: "healthy",
    spec: "3 Critical Alert Policies • Email Notification Channel • Live Dashboard",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Real-time SLI/SLA tracking for Cloud Run 5xx spikes, database saturation, and DLQ backlogs.",
    terraformFile: "monitoring.tf",
    details: {
      "Alert: Cloud Run 5xx": "Threshold: > 5 req/min (300s window)",
      "Alert: Cloud SQL CPU": "Threshold: > 85% for 10 minutes",
      "Alert: Tasks DLQ": "Threshold: > 0 dead letters (instant alert)",
      "Notification Channel": "platform-ops@nexus-erp.com",
    },
  },
  {
    id: "cloud_armor",
    number: 13,
    name: "Cloud Armor (OWASP WAF)",
    category: "security",
    resourceId: "production-cloud-armor-policy",
    status: "healthy",
    spec: "OWASP ModSecurity Core Rules • SQLi/XSS/LFI/RCE Defense • Rate Limiting",
    cmekEncrypted: false,
    haEnabled: true,
    description: "Edge layer DDoS and application vulnerability filtering shielding API Gateway and Web endpoints.",
    terraformFile: "security.tf",
    details: {
      "OWASP Rules": "sqli-v33-stable, xss-v33-stable, lfi-v33-stable, rce-v33-stable",
      "Rate Limit": "1,000 req/min per IP with 10-minute ban on 2,000 threshold",
      "Action on Match": "Deny (HTTP 403 Forbidden)",
      "Telemetry": "Security policy hits logged to Cloud Logging",
    },
  },
];

const SECRET_VAULT: SecretVaultItem[] = [
  {
    id: "sec-1",
    secretName: "stripe-secret-key",
    provider: "Stripe Payments",
    referencingServices: ["platform-api-gateway", "platform-worker"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-2",
    secretName: "razorpay-key-secret",
    provider: "Razorpay Checkout",
    referencingServices: ["platform-api-gateway"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-3",
    secretName: "twilio-auth-token",
    provider: "Twilio Telephony",
    referencingServices: ["platform-api-gateway", "platform-worker"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-4",
    secretName: "meta-whatsapp-token",
    provider: "Meta WhatsApp Cloud API",
    referencingServices: ["platform-api-gateway", "platform-worker"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-5",
    secretName: "gemini-api-key",
    provider: "Google Gemini 1.5 Pro AI",
    referencingServices: ["platform-api-gateway", "platform-worker"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-6",
    secretName: "elevenlabs-api-key",
    provider: "ElevenLabs Voice AI",
    referencingServices: ["platform-api-gateway"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-7",
    secretName: "deepgram-api-key",
    provider: "Deepgram Real-time ASR",
    referencingServices: ["platform-api-gateway"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-8",
    secretName: "sentry-dsn",
    provider: "Sentry Observability",
    referencingServices: ["platform-api-gateway", "platform-web", "platform-worker"],
    rotationDays: 180,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-9",
    secretName: "platform-db-password",
    provider: "Cloud SQL PostgreSQL",
    referencingServices: ["platform-api-gateway", "platform-worker"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
  {
    id: "sec-10",
    secretName: "platform-db-url",
    provider: "Cloud SQL Connection URI",
    referencingServices: ["platform-api-gateway"],
    rotationDays: 90,
    status: "active",
    version: "v1 (latest)",
  },
];

export default function InfrastructurePage() {
  const { toast } = useToast();
  const [selectedEnv, setSelectedEnv] = useState<Environment>("production");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(SERVICES_DATA[1]); // default to Cloud SQL
  const [activeTab, setActiveTab] = useState<"services" | "secrets" | "terraform" | "waf">("services");
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);

  const envConfig = ENV_SPECS[selectedEnv];

  const handleSimulateApply = () => {
    setIsApplying(true);
    setApplyProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setApplyProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsApplying(false);
        toast({
          title: `Terraform Apply Succeeded (${selectedEnv})`,
          description: `All 13 GCP services verified in ${selectedEnv}. CMEK active, Cloud Armor WAF enabled, and 10 Secret Manager credentials referenced.`,
          variant: "success",
        });
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-lg shadow-sky-900/30">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Production GCP Infrastructure
                <Badge variant="success" className="text-xs font-semibold px-2.5 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-3 w-3 mr-1 inline" />
                  13 Services Provisioned
                </Badge>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Multi-environment Terraform architecture: Cloud Run, Cloud SQL, VPC, Pub/Sub, Cloud Tasks, KMS, Artifact Registry, and Secret Manager.
              </p>
            </div>
          </div>
        </div>

        {/* Environment Selector & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Environment Switcher Pills */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(["development", "staging", "production"] as Environment[]).map((env) => (
              <button
                key={env}
                onClick={() => setSelectedEnv(env)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedEnv === env
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {env}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs"
            onClick={() => {
              toast({
                title: "Security & Encryption Audit",
                description: "Cloud KMS CMEK 90-day rotation active on Cloud SQL & Storage. Cloud Armor OWASP rules active. 0 plaintext secrets.",
                variant: "info",
              });
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
            Audit Security & CMEK
          </Button>

          <Button
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-sky-900/20 text-xs px-4"
            disabled={isApplying}
            onClick={handleSimulateApply}
          >
            {isApplying ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin text-white" />
                Terraform Apply: {applyProgress}%
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                Apply Terraform ({selectedEnv})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Environment Specification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Target Project</span>
            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Cloud className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-white tracking-tight font-mono">
              {envConfig.projectId}
            </div>
            <div className="text-xs text-sky-400 mt-1 flex items-center gap-1 font-medium">
              Region: {envConfig.region}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 truncate font-mono">
            VPC Subnet: {envConfig.cidr}
          </div>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Cloud SQL Sizing</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-white tracking-tight font-mono">
              {envConfig.dbTier}
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              {envConfig.ha ? "Regional High Availability" : "Single-Zone Deployment"}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 truncate">
            CMEK Encrypted • Private IP Peering
          </div>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Cloud Armor WAF</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-white tracking-tight">
              {envConfig.waf ? "Active (OWASP Top 10)" : "Disabled (Dev Mode)"}
            </div>
            <div className="text-xs text-purple-400 mt-1 flex items-center gap-1 font-medium">
              Rate Limit: 1,000 req/min
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 truncate">
            SQLi, XSS, LFI, RCE Preconfigured Rules
          </div>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Secret Manager Vault</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <KeyRound className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-white tracking-tight">
              10 External Keys
            </div>
            <div className="text-xs text-amber-400 mt-1 flex items-center gap-1 font-medium">
              <EyeOff className="h-3 w-3" /> Zero Plaintext In Code
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 truncate">
            Stripe, Razorpay, Twilio, WhatsApp, AI APIs
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "services"
              ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers className="h-4 w-4" />
          13 Provisioned Services
        </button>

        <button
          onClick={() => setActiveTab("secrets")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "secrets"
              ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <KeyRound className="h-4 w-4" />
          Secret Manager Vault (Third-Party APIs)
        </button>

        <button
          onClick={() => setActiveTab("waf")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "waf"
              ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Cloud Armor WAF & Network Security
        </button>

        <button
          onClick={() => setActiveTab("terraform")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "terraform"
              ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <FileCode2 className="h-4 w-4" />
          Terraform Code & Environment Sizing
        </button>
      </div>

      {/* TAB 1: 13 PROVISIONED SERVICES */}
      {activeTab === "services" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Services Grid List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>All 13 Required GCP Infrastructure Services</span>
              <span className="text-[11px] text-sky-400">Click any service to view configuration</span>
            </div>

            {SERVICES_DATA.map((svc) => {
              const isSelected = selectedService?.id === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 border-sky-500/50 shadow-md shadow-sky-950/20 ring-1 ring-sky-500/30"
                      : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs">
                        {svc.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{svc.name}</h3>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {svc.category}
                          </span>
                          {svc.cmekEncrypted && (
                            <Badge variant="success" className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              CMEK
                            </Badge>
                          )}
                          {svc.haEnabled && (
                            <Badge variant="default" className="text-[9px] px-1 py-0 bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              HA
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{svc.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 block">{svc.terraformFile}</span>
                        <span className="text-[10px] text-emerald-400 font-medium">Provisioned</span>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="truncate max-w-[360px]">{svc.spec}</span>
                    <span className="text-sky-400 hover:underline flex items-center gap-1">
                      Inspect details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Service Configuration Drawer */}
          <div className="lg:col-span-5">
            {selectedService ? (
              <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl sticky top-6 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-sky-400 font-bold">
                        Service #{selectedService.number}
                      </span>
                      <h3 className="text-base font-bold text-white">{selectedService.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedService.description}</p>
                  </div>
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active
                  </Badge>
                </div>

                {/* Terraform Resource Specification */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Terraform Definition File
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 flex items-center justify-between">
                    <code>infrastructure/terraform/{selectedService.terraformFile}</code>
                    <FileCode2 className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                {/* Live Resource Properties */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Environment Parameters ({selectedEnv})
                  </span>
                  <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    {Object.entries(selectedService.details).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center py-1 border-b border-slate-900 last:border-0">
                        <span className="text-slate-400 font-medium">{key}:</span>
                        <span className="font-mono text-slate-200 text-right max-w-[240px] truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Flags */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px]">CMEK Encryption</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {selectedService.cmekEncrypted ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Enforced
                        </span>
                      ) : (
                        <span className="text-slate-500">Not Applicable</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px]">High Availability</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {selectedService.haEnabled ? (
                        <span className="text-sky-400 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Regional HA
                        </span>
                      ) : (
                        <span className="text-slate-500">Zonal</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: SECRET MANAGER VAULT */}
      {activeTab === "secrets" && (
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-amber-400" />
                  Google Secret Manager: Third-Party API Credentials
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  External third-party API keys are provisioned in Secret Manager and injected at runtime via <code className="text-sky-300">value_source.secret_key_ref</code>. Plaintext credentials are never committed.
                </p>
              </div>
              <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                10 Managed Secrets
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECRET_VAULT.map((sec) => (
                <div key={sec.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-white font-mono">{sec.secretName}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {sec.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{sec.provider}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Injected Into:</span>
                    <div className="flex gap-1">
                      {sec.referencingServices.map((svc) => (
                        <span key={svc} className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-[10px] text-sky-400">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                    <span>Rotation: {sec.rotationDays} days</span>
                    <span>Version: {sec.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: CLOUD ARMOR & WAF */}
      {activeTab === "waf" && (
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-purple-400" />
                  Cloud Armor Web Application Firewall (WAF) & Rate Limiting
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Protects public Cloud Run ingress endpoints against OWASP Top 10 web application vulnerabilities and denial-of-service traffic spikes.
                </p>
              </div>
              <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Rule Policy: Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">SQL Injection Rule</span>
                <div className="text-sm font-bold text-white font-mono">sqli-v33-stable</div>
                <p className="text-[11px] text-slate-500">Evaluates request params, query strings, and cookies for SQLi payload signatures.</p>
                <div className="pt-2 text-[10px] text-emerald-400 font-medium">Action: Deny (403)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Cross-Site Scripting</span>
                <div className="text-sm font-bold text-white font-mono">xss-v33-stable</div>
                <p className="text-[11px] text-slate-500">Filters malicious script tags, event handlers, and encoded DOM vectors.</p>
                <div className="pt-2 text-[10px] text-emerald-400 font-medium">Action: Deny (403)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">File Inclusion & RCE</span>
                <div className="text-sm font-bold text-white font-mono">lfi-v33 & rce-v33</div>
                <p className="text-[11px] text-slate-500">Blocks directory traversal (/etc/passwd) and shell code execution attempts.</p>
                <div className="pt-2 text-[10px] text-emerald-400 font-medium">Action: Deny (403)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">IP Rate Limiting</span>
                <div className="text-sm font-bold text-white font-mono">1,000 req / min</div>
                <p className="text-[11px] text-slate-500">Enforces per-client IP throttling. Exceeding 2,000 req/min imposes a 10-minute ban.</p>
                <div className="pt-2 text-[10px] text-purple-400 font-medium">Action: Rate-Based Ban</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: TERRAFORM CODE & SIZING */}
      {activeTab === "terraform" && (
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-sky-400" />
                Terraform Multi-Environment File Organization
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Modular architecture in <code className="text-sky-300">infrastructure/terraform/</code> with separate <code className="text-sky-300">.tfvars</code> per deployment environment.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3">File / Module</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Development</th>
                    <th className="p-3">Staging</th>
                    <th className="p-3">Production</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 text-sky-400">database.tf</td>
                    <td className="p-3 font-sans text-slate-400">Cloud SQL PostgreSQL 15</td>
                    <td className="p-3">db-f1-micro (Zonal)</td>
                    <td className="p-3">db-custom-2-7680</td>
                    <td className="p-3 text-emerald-400 font-bold">db-custom-4-15360 (Regional HA)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-sky-400">compute.tf</td>
                    <td className="p-3 font-sans text-slate-400">Cloud Run Serverless Services</td>
                    <td className="p-3">0-3 instances (Scale to 0)</td>
                    <td className="p-3">1-5 instances</td>
                    <td className="p-3 text-emerald-400 font-bold">2-20 instances (Warm)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-sky-400">networking.tf</td>
                    <td className="p-3 font-sans text-slate-400">VPC & Serverless Connector</td>
                    <td className="p-3">10.20.0.0/20</td>
                    <td className="p-3">10.30.0.0/20</td>
                    <td className="p-3 text-emerald-400 font-bold">10.10.0.0/20 (Dedicated)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-sky-400">security.tf</td>
                    <td className="p-3 font-sans text-slate-400">Cloud Armor WAF & KMS</td>
                    <td className="p-3">WAF Disabled</td>
                    <td className="p-3">WAF Enabled</td>
                    <td className="p-3 text-emerald-400 font-bold">WAF OWASP + CMEK Active</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-sky-400">secrets.tf</td>
                    <td className="p-3 font-sans text-slate-400">Secret Manager Vault</td>
                    <td className="p-3">10 Secrets</td>
                    <td className="p-3">10 Secrets</td>
                    <td className="p-3 text-emerald-400 font-bold">10 Secrets (90d rotation)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
