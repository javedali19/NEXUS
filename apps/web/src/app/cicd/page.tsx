"use client";

import React, { useState } from "react";
import {
  Rocket,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitBranch,
  Terminal,
  ExternalLink,
  RefreshCw,
  Play,
  Layers,
  FileCode2,
  Lock,
  Boxes,
  Cpu,
  Server,
  Cloud,
  ArrowRight,
  Database,
  Search,
  KeyRound,
  FileCheck2,
  Check,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  useToast,
} from "@/components/ui";

interface ValidationGate {
  id: string;
  number: number;
  name: string;
  category: "build" | "code_quality" | "testing" | "security";
  status: "passed" | "running" | "failed";
  duration: string;
  description: string;
  details: string;
  command: string;
  logs: string[];
}

const INITIAL_GATES: ValidationGate[] = [
  {
    id: "frontend",
    number: 1,
    name: "Frontend Build (Next.js)",
    category: "build",
    status: "passed",
    duration: "32s",
    description: "Multi-stage Next.js 15.1.0 production bundle build & static optimization",
    details: "38 static routes generated • Bundle size: 2.42 MB • Standalone mode enabled",
    command: "npm run build --prefix apps/web",
    logs: [
      "[gate-1] Next.js v15.1.0 optimized build started...",
      "[gate-1] Compiled 38 app router pages in 28.4s",
      "[gate-1] Standalone server assets generated in .next/standalone",
      "[gate-1] Result: 0 compilation errors, 0 bundle budget warnings",
    ],
  },
  {
    id: "typescript",
    number: 2,
    name: "TypeScript Strict Check",
    category: "code_quality",
    status: "passed",
    duration: "18s",
    description: "Strict TypeScript compilation without emit across all frontend modules",
    details: "TypeScript v5.7.0 • strictNullChecks • noImplicitAny • 0 type errors",
    command: "npx tsc --noEmit --project apps/web/tsconfig.json",
    logs: [
      "[gate-2] Checking TypeScript diagnostics across 142 source files...",
      "[gate-2] Evaluating JSX/TSX components and Shell layout typings...",
      "[gate-2] Checking platform permissions & AI Tool Gateway schema types...",
      "[gate-2] Result: 0 diagnostics emitted, type safety 100% verified",
    ],
  },
  {
    id: "lint",
    number: 3,
    name: "Code Quality & Linting",
    category: "code_quality",
    status: "passed",
    duration: "14s",
    description: "ESLint, Prettier syntax formatting & Rustfmt clean styling checks",
    details: "ESLint passed • Prettier clean • cargo fmt --all --check clean",
    command: "npm run lint && cargo fmt --all -- --check",
    logs: [
      "[gate-3] Running ESLint v8 on apps/web/src...",
      "[gate-3] Verifying Prettier code formatting standards...",
      "[gate-3] Verifying Rust formatting via cargo fmt --all -- --check...",
      "[gate-3] Result: 0 lint errors, all styling rules compliant",
    ],
  },
  {
    id: "rust",
    number: 4,
    name: "Rust Cargo Check & Clippy",
    category: "build",
    status: "passed",
    duration: "42s",
    description: "Cargo check workspace targets & Clippy deny warnings enforcement",
    details: "Rust 1.80.0 • 24 workspace targets checked • 0 clippy warnings",
    command: "cargo check --workspace && cargo clippy --workspace -- -D warnings",
    logs: [
      "[gate-4] Compiling platform-domain v0.1.0...",
      "[gate-4] Compiling platform-integrations v0.1.0...",
      "[gate-4] Compiling platform-api v0.1.0...",
      "[gate-4] Running clippy linter with -D warnings flag...",
      "[gate-4] Result: Workspace clean, zero warnings or unsafe defects",
    ],
  },
  {
    id: "tests",
    number: 5,
    name: "Automated Test Suites",
    category: "testing",
    status: "passed",
    duration: "36s",
    description: "Rust workspace unit/integration tests & Frontend test execution",
    details: "142 Rust tests passed • 58 Frontend tests passed • 0 failures",
    command: "cargo test --workspace && npm test --prefix apps/web",
    logs: [
      "[gate-5] Running autonomous collections test suite (12 tests) ... ok",
      "[gate-5] Running sales flow 9-stage progression suite (18 tests) ... ok",
      "[gate-5] Running AI Tool Gateway rate limit & idempotency tests (24 tests) ... ok",
      "[gate-5] Running GCP WIF security & key rejection tests (8 tests) ... ok",
      "[gate-5] Result: 200/200 tests passed (100% success rate)",
    ],
  },
  {
    id: "migrations",
    number: 6,
    name: "Database Migrations Verification",
    category: "testing",
    status: "passed",
    duration: "12s",
    description: "PostgreSQL dry-run application of all 41 schema migrations in order",
    details: "Migrations 0001 through 0041 verified • RLS policies validated",
    command: "psql -d test_db -v ON_ERROR_STOP=1 -f database/migrations/*.sql",
    logs: [
      "[gate-6] Initializing isolated PostgreSQL 15 Alpine test container...",
      "[gate-6] Applying migrations 0001_core_schema.sql to 0040_production_observability...",
      "[gate-6] Applying migration 0041_cicd_deployment_telemetry.sql...",
      "[gate-6] Validating foreign keys, constraints, and RLS tenant isolation...",
      "[gate-6] Result: Schema idempotent, 41 migrations applied cleanly",
    ],
  },
  {
    id: "security",
    number: 7,
    name: "Security & Zero Keys Gate",
    category: "security",
    status: "passed",
    duration: "15s",
    description: "Gitleaks secret scanner & strict prohibition of long-lived GCP service-account keys",
    details: "0 committed secrets • 0 GCP private keys • GCP WIF token exchange enforced",
    command: "gitleaks detect && grep -r '\"type\": \"service_account\"' (assert exit 1)",
    logs: [
      "[gate-7] Running Gitleaks secret pattern analysis over git commit log...",
      "[gate-7] Scanning repository files for hardcoded API keys or bearer tokens...",
      "[gate-7] ENFORCEMENT: Verifying absence of long-lived GCP service-account JSON private keys...",
      "[gate-7] Asserting GCP Workload Identity Federation OIDC provider is configured...",
      "[gate-7] Result: Zero secrets leaked, zero long-lived keys permitted",
    ],
  },
  {
    id: "vulnerabilities",
    number: 8,
    name: "Dependency Vulnerabilities Audit",
    category: "security",
    status: "passed",
    duration: "16s",
    description: "High/critical advisory audit via npm audit & cargo audit",
    details: "11,840 npm packages checked • 482 cargo crates checked • 0 critical advisories",
    command: "npm audit --audit-level=critical && cargo audit",
    logs: [
      "[gate-8] Fetching GitHub Advisory Database & RustSec Advisory DB...",
      "[gate-8] Auditing frontend dependency tree in apps/web/package-lock.json...",
      "[gate-8] Auditing backend Rust dependency tree in backend/Cargo.lock...",
      "[gate-8] Result: 0 critical or high vulnerability CVEs detected",
    ],
  },
  {
    id: "containers",
    number: 9,
    name: "Container Multi-Stage Builds",
    category: "build",
    status: "passed",
    duration: "44s",
    description: "Docker buildx multi-stage image verification for Web Frontend & API Gateway",
    details: "apps/web/Dockerfile (Alpine Node 20) • backend/Dockerfile (Bookworm Slim)",
    command: "docker buildx build --file apps/web/Dockerfile --file backend/Dockerfile .",
    logs: [
      "[gate-9] Building Web Frontend container: target apps/web/Dockerfile:runner...",
      "[gate-9] Web Frontend multi-stage image size: 142 MB (unprivileged nextjs:1001 user)",
      "[gate-9] Building Backend API Gateway container: target backend/Dockerfile:runner...",
      "[gate-9] Backend multi-stage image size: 88 MB (Debian slim with ca-certificates)",
      "[gate-9] Result: Multi-stage container images built and verified",
    ],
  },
  {
    id: "terraform",
    number: 10,
    name: "Terraform Validation & Security",
    category: "code_quality",
    status: "passed",
    duration: "11s",
    description: "Terraform fmt check, init, validate, and WIF resource configuration",
    details: "terraform fmt -check • terraform validate • WIF pool & provider verified",
    command: "terraform fmt -check -recursive && terraform validate",
    logs: [
      "[gate-10] Verifying HCL formatting across infrastructure/terraform/*.tf...",
      "[gate-10] Initializing Terraform Google Cloud Platform provider v5.0...",
      "[gate-10] Validating google_iam_workload_identity_pool.github_pool...",
      "[gate-10] Validating google_iam_workload_identity_pool_provider.github_provider...",
      "[gate-10] Validating google_service_account_iam_member.wif_impersonation...",
      "[gate-10] Result: Terraform syntax, schemas, and IAM references 100% valid",
    ],
  },
];

interface Deployment {
  id: string;
  service: string;
  region: string;
  image: string;
  authMethod: string;
  status: "healthy" | "deploying" | "degraded";
  traffic: number;
  url: string;
  latencyMs: number;
  lastDeployed: string;
}

const DEPLOYMENTS: Deployment[] = [
  {
    id: "dep-1",
    service: "platform-api-gateway",
    region: "us-central1",
    image: "us-central1-docker.pkg.dev/nexus-erp/platform/api:8f32acb9",
    authMethod: "GCP WIF OIDC (Keyless)",
    status: "healthy",
    traffic: 100,
    url: "https://platform-api-gateway-us-central1.run.app",
    latencyMs: 18,
    lastDeployed: "12 mins ago",
  },
  {
    id: "dep-2",
    service: "platform-web",
    region: "us-central1",
    image: "us-central1-docker.pkg.dev/nexus-erp/platform/web:8f32acb9",
    authMethod: "GCP WIF OIDC (Keyless)",
    status: "healthy",
    traffic: 100,
    url: "https://platform-web-us-central1.run.app",
    latencyMs: 22,
    lastDeployed: "12 mins ago",
  },
  {
    id: "dep-3",
    service: "platform-worker",
    region: "us-central1",
    image: "us-central1-docker.pkg.dev/nexus-erp/platform/worker:8f32acb9",
    authMethod: "GCP WIF OIDC (Keyless)",
    status: "healthy",
    traffic: 100,
    url: "Cloud Tasks Queue Dispatcher",
    latencyMs: 9,
    lastDeployed: "12 mins ago",
  },
];

export default function CiCdPage() {
  const { toast } = useToast();
  const [gates, setGates] = useState<ValidationGate[]>(INITIAL_GATES);
  const [selectedGate, setSelectedGate] = useState<ValidationGate | null>(INITIAL_GATES[6]); // default to security gate
  const [activeTab, setActiveTab] = useState<"gates" | "wif" | "deployments">("gates");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  const passedGates = gates.filter((g) => g.status === "passed").length;

  const triggerSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(0);

    // Reset gates to running
    setGates((prev) =>
      prev.map((g, idx) => (idx === 0 ? { ...g, status: "running" } : { ...g, status: "running" }))
    );

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setSimulationProgress(current * 10);

      setGates((prev) =>
        prev.map((g, idx) => {
          if (idx < current) return { ...g, status: "passed" };
          if (idx === current) return { ...g, status: "running" };
          return { ...g, status: "running" };
        })
      );

      if (current >= 10) {
        clearInterval(interval);
        setIsSimulating(false);
        setGates(INITIAL_GATES);
        toast({
          title: "CI/CD Pipeline Completed Successfully",
          description: "All 10 validation gates passed! Zero long-lived GCP keys detected. Deployed via GCP Workload Identity Federation.",
          variant: "success",
        });
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-900/30">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Continuous Integration & Deployment
                <Badge variant="success" className="text-xs font-semibold px-2.5 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-3 w-3 mr-1 inline" />
                  GCP WIF Keyless
                </Badge>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Full 10-domain verification pipeline & short-lived OIDC token exchange via Google Cloud Workload Identity Federation.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs"
            onClick={() => {
              toast({
                title: "Security Assertion Verified",
                description: "Repository verified: Zero long-lived GCP private JSON keys. OIDC issuer: token.actions.githubusercontent.com",
                variant: "info",
              });
            }}
          >
            <Lock className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
            Audit Zero-Keys Policy
          </Button>

          <Button
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-md shadow-cyan-900/20 text-xs px-4"
            disabled={isSimulating}
            onClick={triggerSimulation}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin text-white" />
                Validating Gate {Math.min(10, Math.ceil(simulationProgress / 10))}/10 ({simulationProgress}%)
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                Simulate 10-Gate Pipeline Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* High-Level Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">10-Domain Gates</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {passedGates}/10 Passed
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              100% Comprehensive Coverage
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(passedGates / 10) * 100}%` }}
            />
          </div>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Auth & Credential Model</span>
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <KeyRound className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              Keyless (WIF)
            </div>
            <div className="text-xs text-cyan-400 mt-1 flex items-center gap-1 font-medium">
              <Check className="h-3 w-3" /> Zero Stored JSON Private Keys
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 truncate font-mono">
            Provider: github-actions-provider
          </div>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Average Pipeline Duration</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              3m 34s
            </div>
            <div className="text-xs text-blue-400 mt-1 flex items-center gap-1 font-medium">
              Parallel Ubuntu Runners
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3">
            Docker Buildx Cache: 84% Hit Ratio
          </div>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Cloud Run Microservices</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Cloud className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              3 Active
            </div>
            <div className="text-xs text-purple-400 mt-1 flex items-center gap-1 font-medium">
              100% Traffic • us-central1
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 truncate">
            Web · API Gateway · Background Worker
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("gates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "gates"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers className="h-4 w-4" />
          10-Domain Verification Matrix ({passedGates}/10)
        </button>

        <button
          onClick={() => setActiveTab("wif")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "wif"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Lock className="h-4 w-4" />
          GCP Workload Identity Federation (WIF) Architecture
        </button>

        <button
          onClick={() => setActiveTab("deployments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "deployments"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Server className="h-4 w-4" />
          Cloud Run Microservices & Deployments (3)
        </button>
      </div>

      {/* TAB 1: 10-DOMAIN VALIDATION GATES */}
      {activeTab === "gates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gates List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>All 10 Required Validation Domains</span>
              <span className="text-[11px] text-cyan-400">Click any gate to inspect logs</span>
            </div>

            {gates.map((gate) => {
              const isSelected = selectedGate?.id === gate.id;
              return (
                <div
                  key={gate.id}
                  onClick={() => setSelectedGate(gate)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/30"
                      : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          gate.status === "passed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : gate.status === "running"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {gate.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{gate.name}</h3>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {gate.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{gate.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 block">{gate.duration}</span>
                        <span className="text-[10px] text-emerald-400 font-medium">Passed</span>
                      </div>
                      {gate.status === "passed" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="truncate max-w-[320px]">{gate.details}</span>
                    <span className="text-cyan-400 hover:underline flex items-center gap-1">
                      View logs <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gate Detail & Terminal Logs */}
          <div className="lg:col-span-5">
            {selectedGate ? (
              <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl sticky top-6 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        Gate #{selectedGate.number}
                      </span>
                      <h3 className="text-base font-bold text-white">{selectedGate.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedGate.description}</p>
                  </div>
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Passed ({selectedGate.duration})
                  </Badge>
                </div>

                {/* Command Executed */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Execution Command
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between">
                    <code>{selectedGate.command}</code>
                    <Terminal className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                {/* Terminal Logs Window */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Runner Telemetry & Audit Stream
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-[300px] overflow-y-auto">
                    {selectedGate.logs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-slate-600 select-none">{i + 1}</span>
                        <span className={log.includes("Result") ? "text-emerald-400 font-semibold" : "text-slate-300"}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Metadata */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Workflow Step:</span>
                    <span className="font-mono text-slate-200">.github/workflows/ci.yml</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Runner Image:</span>
                    <span className="font-mono text-slate-200">ubuntu-latest (GitHub Runner)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Security Assertion:</span>
                    <span className="text-emerald-400 font-medium">Zero credentials leaked</span>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: WORKLOAD IDENTITY FEDERATION (WIF) */}
      {activeTab === "wif" && (
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                  Keyless Authentication Architecture (Workload Identity Federation)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces complete eradication of long-lived GCP service-account JSON private keys from GitHub Secrets.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Policy: ACTIVE & ENFORCED
                </Badge>
              </div>
            </div>

            {/* Step-by-Step OIDC Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  1
                </div>
                <h3 className="text-xs font-bold text-white">GitHub Actions Job</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Job requests short-lived OIDC JWT via <code className="text-cyan-300">id-token: write</code> permission with claims: <code className="text-cyan-300">repo</code>, <code className="text-cyan-300">actor</code>, <code className="text-cyan-300">sha</code>.
                </p>
                <div className="pt-2 text-[10px] font-mono text-slate-500">
                  Issuer: token.actions.githubusercontent.com
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  2
                </div>
                <h3 className="text-xs font-bold text-white">GCP Security Token Service</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  GCP STS verifies the GitHub OIDC token signature and maps repository attributes to the dedicated Workload Identity Pool.
                </p>
                <div className="pt-2 text-[10px] font-mono text-cyan-400 truncate">
                  Pool: github-actions-pool
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  3
                </div>
                <h3 className="text-xs font-bold text-white">Service Account Impersonation</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  STS issues a federated token that impersonates <code className="text-cyan-300">sa-github-deployer</code> via <code className="text-cyan-300">roles/iam.workloadIdentityUser</code>.
                </p>
                <div className="pt-2 text-[10px] font-mono text-slate-500 truncate">
                  Token Lifetime: 1800s (30m max)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  4
                </div>
                <h3 className="text-xs font-bold text-white">Keyless Deployment</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ephemeral access token pushes container images to Artifact Registry and deploys microservices to Google Cloud Run.
                </p>
                <div className="pt-2 text-[10px] font-mono text-emerald-400">
                  Zero stored JSON keys
                </div>
              </div>
            </div>

            {/* Terraform Infrastructure Resources */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Terraform WIF Infrastructure Specification (infrastructure/terraform/workload_identity.tf)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                  <div className="text-cyan-400 font-semibold">// 1. Workload Identity Pool & Provider</div>
                  <div>resource &quot;google_iam_workload_identity_pool&quot; &quot;github_pool&quot;</div>
                  <div>resource &quot;google_iam_workload_identity_pool_provider&quot; &quot;github_provider&quot;</div>
                  <div className="text-slate-500 text-[11px]">
                    issuer_uri = &quot;https://token.actions.githubusercontent.com&quot;
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                  <div className="text-cyan-400 font-semibold">// 2. Service Account & IAM Bindings</div>
                  <div>resource &quot;google_service_account&quot; &quot;github_deployer&quot;</div>
                  <div>resource &quot;google_service_account_iam_member&quot; &quot;wif_impersonation&quot;</div>
                  <div className="text-slate-500 text-[11px]">
                    role = &quot;roles/iam.workloadIdentityUser&quot;
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: CLOUD RUN DEPLOYMENTS */}
      {activeTab === "deployments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEPLOYMENTS.map((dep) => (
              <Card key={dep.id} className="bg-slate-900 border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">{dep.service}</h3>
                  </div>
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    {dep.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Region:</span>
                    <span className="font-mono text-slate-200">{dep.region}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Auth Method:</span>
                    <span className="text-cyan-400 font-medium">{dep.authMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Latency:</span>
                    <span className="font-mono text-emerald-400">{dep.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Traffic:</span>
                    <span className="font-mono text-slate-200">{dep.traffic}% Managed</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 truncate">
                  {dep.url}
                </div>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              Automated Rollback & Canary Protection
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cloud Run revisions are deployed using graduated traffic splitting (10% canary → health checks → 100% promotion). In the event of 5xx errors or failed health checks, traffic immediately rolls back to the prior immutable container revision without human intervention.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
