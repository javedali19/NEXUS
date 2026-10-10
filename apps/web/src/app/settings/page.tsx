"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Network,
  Users,
  UserCheck,
  KeyRound,
  FileCheck,
  Layers,
  Bell,
  ShieldCheck,
  History,
  Archive,
  PhoneOff,
  Globe,
  Sparkles,
  Workflow,
  CreditCard,
  Search,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Plus,
  RefreshCw,
  Sliders,
  Copy,
  Check,
  Lock,
  Eye,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Download,
} from "lucide-react";
import {
  Card,
  Badge,
  Button,
  Input,
} from "@/components/ui";

// ============================================================================
// Types & Section Definitions
// ============================================================================

type SectionKey =
  | "organization"
  | "business_units"
  | "users"
  | "roles"
  | "permissions"
  | "consent"
  | "integrations"
  | "notifications"
  | "security"
  | "audit"
  | "retention"
  | "dnc"
  | "regional"
  | "ai_policies"
  | "workflow_policies"
  | "billing";

interface SectionMeta {
  key: SectionKey;
  label: string;
  category: "General" | "Access & Governance" | "Compliance & Security" | "Intelligence & Automation";
  icon: React.ElementType;
  badge?: string;
  description: string;
}

const SECTIONS: SectionMeta[] = [
  // General
  {
    key: "organization",
    label: "Organization",
    category: "General",
    icon: Building2,
    description: "Corporate entity profile, registration UEN/TIN, domain, and branding.",
  },
  {
    key: "business_units",
    label: "Business Units",
    category: "General",
    icon: Network,
    badge: "3 Units",
    description: "Regional operating subsidiaries, head offices, and branch codes.",
  },
  {
    key: "regional",
    label: "Regional Configuration",
    category: "General",
    icon: Globe,
    badge: "SG · MY · TH",
    description: "Primary country packs, reporting currencies, calendar, and locale rules.",
  },
  {
    key: "billing",
    label: "Billing Metadata",
    category: "General",
    icon: CreditCard,
    badge: "Enterprise",
    description: "Subscription tier, payment method on file, and metered consumption limits.",
  },

  // Access & Governance
  {
    key: "users",
    label: "Users",
    category: "Access & Governance",
    icon: Users,
    badge: "12 Members",
    description: "Enterprise user directory, MFA security status, and identity provider state.",
  },
  {
    key: "roles",
    label: "Roles",
    category: "Access & Governance",
    icon: UserCheck,
    badge: "8 Roles",
    description: "Standard & custom role definitions, role hierarchy, and member counts.",
  },
  {
    key: "permissions",
    label: "Permissions",
    category: "Access & Governance",
    icon: KeyRound,
    badge: "10 Domains",
    description: "Granular RBAC matrix across CRM, ERP, Voice, AI, and Admin modules.",
  },
  {
    key: "consent",
    label: "Consent",
    category: "Access & Governance",
    icon: FileCheck,
    description: "GDPR and SEA PDPA customer opt-in rules, voice consent, and retention.",
  },

  // Compliance & Security
  {
    key: "security",
    label: "Security",
    category: "Compliance & Security",
    icon: ShieldCheck,
    badge: "MFA Enforced",
    description: "Password complexity, SSO SAML/OIDC, session timeouts, and IP whitelisting.",
  },
  {
    key: "audit",
    label: "Audit",
    category: "Compliance & Security",
    icon: History,
    badge: "SHA-256",
    description: "Immutable append-only trail settings, SIEM export, and tamper monitoring.",
  },
  {
    key: "retention",
    label: "Retention",
    category: "Compliance & Security",
    icon: Archive,
    description: "Statutory data lifecycle periods, auto-purging, and legal hold lock.",
  },
  {
    key: "dnc",
    label: "DNC (Do Not Call)",
    category: "Compliance & Security",
    icon: PhoneOff,
    badge: "Active Gate",
    description: "National DNC registry syncing, tenant blacklist, and cooling-off limits.",
  },

  // Intelligence & Automation
  {
    key: "integrations",
    label: "Integrations",
    category: "Intelligence & Automation",
    icon: Layers,
    badge: "14 Rails",
    description: "Connector governance and Secret Manager vault reference redirection.",
  },
  {
    key: "notifications",
    label: "Notifications",
    category: "Intelligence & Automation",
    icon: Bell,
    description: "Omnichannel alerts (Slack, Email, SMS Pager), SLA triggers, and quiet hours.",
  },
  {
    key: "ai_policies",
    label: "AI Policies",
    category: "Intelligence & Automation",
    icon: Sparkles,
    badge: "PII Filter",
    description: "LLM model governance, temperature caps, prompt defense, and escalation caps.",
  },
  {
    key: "workflow_policies",
    label: "Workflow Policies",
    category: "Intelligence & Automation",
    icon: Workflow,
    badge: "500 Concurrency",
    description: "Execution bounds, timeout limits, circuit breaker, and emergency killswitch.",
  },
];

// ============================================================================
// Component Definition
// ============================================================================

export default function SettingsAndPolicyCenterPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("organization");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSavedToast, setIsSavedToast] = useState(false);

  // 1. Organization State
  const [orgProfile, setOrgProfile] = useState({
    legalName: "Acme Global Solutions Pte Ltd",
    tradingName: "Acme Global Solutions",
    taxIdentifier: "201812345M",
    taxAuthority: "IRAS",
    domain: "acmeglobal.com",
    hqAddress: "1 Marina Boulevard, #28-00, Marina Bay Financial Centre, Singapore 018989",
    contactEmail: "admin@acmeglobal.com",
    contactPhone: "+65 6789 0123",
    baseCurrency: "SGD",
    brandColor: "#0ea5e9",
    darkMode: true,
  });

  // 2. Business Units State
  const [businessUnits] = useState([
    {
      code: "BU-SG-HQ",
      name: "Singapore APAC Headquarters",
      region: "Singapore",
      branchCode: "00000",
      currency: "SGD",
      manager: "Alex Morgan",
      status: "Active",
      isDefault: true,
    },
    {
      code: "BU-MY-OPS",
      name: "Malaysia Operations Branch",
      region: "Malaysia",
      branchCode: "00001",
      currency: "MYR",
      manager: "Siti Nurhaliza",
      status: "Active",
      isDefault: false,
    },
    {
      code: "BU-TH-RET",
      name: "Thailand Commercial & Retail",
      region: "Thailand",
      branchCode: "00002",
      currency: "THB",
      manager: "Somchai Prasert",
      status: "Active",
      isDefault: false,
    },
  ]);

  // 3. Users State
  const [users] = useState([
    {
      id: "usr-01",
      name: "Alex Morgan",
      email: "alex.morgan@acmeglobal.com",
      role: "Super Admin",
      bu: "BU-SG-HQ",
      mfa: true,
      provider: "Google Identity",
      lastActive: "Just now",
      status: "Active",
    },
    {
      id: "usr-02",
      name: "Marcus Vance",
      email: "marcus.v@acmeglobal.com",
      role: "Sales Director",
      bu: "BU-SG-HQ",
      mfa: true,
      provider: "Google Identity",
      lastActive: "14 mins ago",
      status: "Active",
    },
    {
      id: "usr-03",
      name: "Siti Nurhaliza",
      email: "siti.my@acmeglobal.com",
      role: "Finance Controller",
      bu: "BU-MY-OPS",
      mfa: true,
      provider: "Okta SAML",
      lastActive: "1 hour ago",
      status: "Active",
    },
    {
      id: "usr-04",
      name: "Somchai Prasert",
      email: "somchai.th@acmeglobal.com",
      role: "Support Lead",
      bu: "BU-TH-RET",
      mfa: true,
      provider: "Okta SAML",
      lastActive: "3 hours ago",
      status: "Active",
    },
    {
      id: "usr-05",
      name: "Elena Rostova",
      email: "elena.r@acmeglobal.com",
      role: "Compliance Auditor",
      bu: "BU-SG-HQ",
      mfa: true,
      provider: "Google Identity",
      lastActive: "Yesterday",
      status: "Active",
    },
    {
      id: "usr-06",
      name: "Kanya Wattana",
      email: "kanya.w@acmeglobal.com",
      role: "Voice Agent",
      bu: "BU-TH-RET",
      mfa: false,
      provider: "Google Identity",
      lastActive: "2 days ago",
      status: "Active",
    },
  ]);

  // 4. Roles State
  const [roles] = useState([
    {
      key: "super_admin",
      name: "Super Admin",
      description: "Unrestricted platform ownership, tenant root administration, and billing access.",
      isSystem: true,
      memberCount: 2,
    },
    {
      key: "tenant_admin",
      name: "Tenant Administrator",
      description: "Organization-wide operational control, business unit administration, and role assignments.",
      isSystem: true,
      memberCount: 3,
    },
    {
      key: "sales_director",
      name: "Sales Director",
      description: "Full access to CRM deals, quote approvals, customer accounts, and sales AI agents.",
      isSystem: true,
      memberCount: 4,
    },
    {
      key: "finance_controller",
      name: "Finance Controller",
      description: "Authority over ERP invoices, payment clearing, tax ledgers, and credit limits.",
      isSystem: true,
      memberCount: 2,
    },
    {
      key: "support_lead",
      name: "Support Lead",
      description: "Escalation handling, SLA configuration, ticket dispatch, and call reviews.",
      isSystem: true,
      memberCount: 5,
    },
    {
      key: "voice_agent",
      name: "Voice / Call Agent",
      description: "Inbound and outbound telephony operator with customer transcript access.",
      isSystem: true,
      memberCount: 18,
    },
    {
      key: "compliance_auditor",
      name: "Compliance Auditor",
      description: "Read-only access to immutable audit trails, DNC checks, and consent records.",
      isSystem: true,
      memberCount: 2,
    },
    {
      key: "read_only_observer",
      name: "Read-Only Observer",
      description: "Read-only visibility for executive stakeholder reviews without write capability.",
      isSystem: false,
      memberCount: 6,
    },
  ]);

  // 5. Permissions Matrix State
  const [permissionsMatrix] = useState([
    { module: "CRM & Pipelines", view: true, create: true, edit: true, delete: false, exportPii: false, admin: false },
    { module: "ERP & Invoicing", view: true, create: true, edit: true, delete: false, exportPii: true, admin: false },
    { module: "Payments & Settlements", view: true, create: true, edit: false, delete: false, exportPii: true, admin: false },
    { module: "Voice & Telephony", view: true, create: true, edit: true, delete: false, exportPii: false, admin: false },
    { module: "Customer Support & SLA", view: true, create: true, edit: true, delete: false, exportPii: false, admin: false },
    { module: "AI Agent Orchestration", view: true, create: false, edit: false, delete: false, exportPii: false, admin: false },
    { module: "Workflow Automation", view: true, create: true, edit: true, delete: false, exportPii: false, admin: false },
    { module: "Audit & Compliance", view: true, create: false, edit: false, delete: false, exportPii: true, admin: false },
    { module: "Integrations & Vault", view: true, create: false, edit: false, delete: false, exportPii: false, admin: false },
    { module: "Settings & Governance", view: true, create: false, edit: false, delete: false, exportPii: false, admin: false },
  ]);

  // 6. Consent State
  const [consentPolicy, setConsentPolicy] = useState({
    gdprEnabled: true,
    pdpaSingapore: true,
    pdpaThailand: true,
    voiceConsentRequired: true,
    whatsappOptIn: true,
    smsOptOutKeyword: "STOP",
    retentionMonths: 24,
    explicitDunningConsent: true,
  });

  // 8. Notifications State
  const [notifPolicy, setNotifPolicy] = useState({
    defaultEmail: "secops-alerts@acmeglobal.com",
    slackWebhook: true,
    slackChannel: "#secops-monitoring",
    smsPager: "+65 9123 4567",
    onPaymentFailure: true,
    onDncViolation: true,
    onSlaBreach: true,
    onAiGuardrailTrip: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  });

  // 9. Security State
  const [securityPolicy, setSecurityPolicy] = useState({
    mfaEnforced: true,
    minPasswordLength: 14,
    requireSpecialChars: true,
    idleTimeoutMinutes: 30,
    maxSessions: 3,
    ipWhitelisting: false,
    allowedCidr: "203.0.113.0/24, 198.51.100.0/24",
    ssoProvider: "Google Identity & Okta SAML 2.0",
    ssoEnforced: false,
    tokenSigningAlgo: "Ed25519 (RFC 8032)",
    tokenExpiryHours: 24,
  });

  // 10. Audit Policy State
  const [auditPolicy, setAuditPolicy] = useState({
    immutableAppendOnly: true,
    sha256Chain: true,
    logLevel: "INFO",
    tamperDetection: true,
    siemForwarding: false,
    siemEndpoint: "syslog.corp.acmeglobal.com:6514",
    alertBulkExport: true,
  });

  // 11. Retention State
  const [retentionRules, setRetentionRules] = useState([
    { entity: "Tax Invoices & Credit Notes", period: "7 Years", statutory: "IRAS / LHDN / Thai RD Mandatory", action: "Cold Archive", legalHold: false },
    { entity: "Payment Transactions & Receipts", period: "7 Years", statutory: "MAS / BNM Anti-Money Laundering", action: "Cold Archive", legalHold: false },
    { entity: "Telephony Call Audio Recordings", period: "90 Days", statutory: "Internal Quality & Training", action: "Auto Purge", legalHold: false },
    { entity: "AI Call & Chat Transcripts", period: "180 Days", statutory: "Model Evaluation & Dispute", action: "Cold Archive", legalHold: false },
    { entity: "Customer Support Tickets", period: "3 Years", statutory: "Commercial Dispute Resolution", action: "Cold Archive", legalHold: false },
    { entity: "Audit Log Cryptographic Ledger", period: "7 Years", statutory: "SOC2 Type II / ISO 27001", action: "Permanent", legalHold: false },
  ]);
  const [masterLegalHold, setMasterLegalHold] = useState(false);

  // 12. DNC Policy State
  const [dncPolicy, setDncPolicy] = useState({
    pdpcSg: true,
    mcmcMy: true,
    nbtcTh: true,
    coolingOffDays: 30,
    hardBlockTelephony: true,
    agentOverrideAllowed: false,
  });
  const [dncSearch, setDncSearch] = useState("");
  const [dncList, setDncList] = useState([
    { phone: "+65 9123 4567", country: "SG", source: "Customer Opt-out", date: "2026-09-18", status: "Suppressed" },
    { phone: "+65 8234 5678", country: "SG", source: "Singapore PDPC DNC Registry", date: "2026-09-20", status: "Suppressed" },
    { phone: "+60 12 345 6789", country: "MY", source: "MCMC DNC National Registry", date: "2026-09-15", status: "Suppressed" },
    { phone: "+66 81 234 5678", country: "TH", source: "Customer Opt-out (SMS ยกเลิก)", date: "2026-09-22", status: "Suppressed" },
  ]);
  const [newDncPhone, setNewDncPhone] = useState("");

  // 13. Regional Configuration State
  const [regionalConfig, setRegionalConfig] = useState({
    defaultCountryPack: "SG",
    baseCurrency: "SGD (S$)",
    calendarSystem: "gregorian",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
  });

  // 14. AI Governance Policy State
  const [aiPolicy, setAiPolicy] = useState({
    allowedModels: ["claude-3-5-sonnet", "gemini-1-5-pro", "gpt-4o"],
    temperatureCap: 0.5,
    piiRedaction: true,
    redactCards: true,
    redactNric: true,
    promptDefense: true,
    adversarialThreshold: 0.85,
    escalateSentiment: -0.65,
    escalateDisputeAmount: 2500,
    prohibitExecutiveClones: true,
  });

  // 15. Workflow Policy State
  const [workflowPolicy, setWorkflowPolicy] = useState({
    maxConcurrent: 500,
    stepTimeout: 300,
    maxRetries: 5,
    circuitBreakerErrorRate: 15,
    emergencyKillswitch: false,
    autoRouteExceptions: true,
  });

  // 16. Billing Metadata State
  const [billingMeta] = useState({
    planName: "Enterprise SEA Unlimited",
    billingCycle: "Annual (Billed Sept 1)",
    renewalDate: "2027-09-01",
    billingContact: "finance@acmeglobal.com",
    paymentRail: "DBS FAST Corporate Direct Debit",
    last4: "4242",
    metered: [
      { name: "AI Inference Tokens", used: 14250000, limit: 50000000, unit: "tokens", pct: 28.5 },
      { name: "Voice Telephony Minutes", used: 8450, limit: 25000, unit: "minutes", pct: 33.8 },
      { name: "WhatsApp Conversations", used: 4320, limit: 10000, unit: "sessions", pct: 43.2 },
      { name: "Document OCR Pages", used: 1890, limit: 5000, unit: "pages", pct: 37.8 },
    ],
  });

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSave = () => {
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleAddDnc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDncPhone.trim()) return;
    setDncList([
      {
        phone: newDncPhone,
        country: newDncPhone.startsWith("+65") ? "SG" : newDncPhone.startsWith("+60") ? "MY" : "TH",
        source: "Manual Tenant Admin Entry",
        date: "2026-09-23",
        status: "Suppressed",
      },
      ...dncList,
    ]);
    setNewDncPhone("");
  };

  const activeMeta = SECTIONS.find((s) => s.key === activeSection) || SECTIONS[0];
  const IconComponent = activeMeta.icon;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-blue-600/20 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Enterprise Settings & Policy Center
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  16 Policy Domains
                </span>
                <Badge variant="rls" size="sm">
                  Tenant RLS Enforced
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Unified multi-tenant administrative governance, compliance boundaries, RBAC matrix, and security policies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isSavedToast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Settings Saved
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search policy domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Grouped Section Links */}
          <div className="space-y-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
            {(["General", "Access & Governance", "Compliance & Security", "Intelligence & Automation"] as const).map(
              (category) => {
                const groupSections = filteredSections.filter((s) => s.category === category);
                if (groupSections.length === 0) return null;

                return (
                  <div key={category} className="space-y-1">
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                      {category}
                    </div>
                    {groupSections.map((sec) => {
                      const SecIcon = sec.icon;
                      const isActive = activeSection === sec.key;
                      return (
                        <button
                          key={sec.key}
                          onClick={() => setActiveSection(sec.key)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                            isActive
                              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <SecIcon
                              className={`h-4 w-4 shrink-0 ${
                                isActive ? "text-indigo-400" : "text-slate-400"
                              }`}
                            />
                            <span className="truncate">{sec.label}</span>
                          </div>
                          {sec.badge && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                                isActive
                                  ? "bg-indigo-500/20 text-indigo-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {sec.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Right Column: Active Policy Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section Sub-header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {activeMeta.label}
                  {activeMeta.badge && (
                    <Badge variant="outline" size="sm">
                      {activeMeta.badge}
                    </Badge>
                  )}
                </h2>
                <p className="text-xs text-slate-400">{activeMeta.description}</p>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* 1. ORGANIZATION SECTION */}
          {/* =============================================================== */}
          {activeSection === "organization" && (
            <div className="space-y-6">
              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-400" />
                  Primary Organization Legal Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Corporate Legal Entity Name"
                    value={orgProfile.legalName}
                    onChange={(e) => setOrgProfile({ ...orgProfile, legalName: e.target.value })}
                  />
                  <Input
                    label="Trading / Brand Name"
                    value={orgProfile.tradingName}
                    onChange={(e) => setOrgProfile({ ...orgProfile, tradingName: e.target.value })}
                  />
                  <Input
                    label="Tax Identifier / UEN / TIN"
                    value={orgProfile.taxIdentifier}
                    onChange={(e) => setOrgProfile({ ...orgProfile, taxIdentifier: e.target.value })}
                  />
                  <Input
                    label="Tax Authority"
                    value={orgProfile.taxAuthority}
                    onChange={(e) => setOrgProfile({ ...orgProfile, taxAuthority: e.target.value })}
                  />
                  <Input
                    label="Corporate Domain"
                    value={orgProfile.domain}
                    onChange={(e) => setOrgProfile({ ...orgProfile, domain: e.target.value })}
                  />
                  <Input
                    label="Tenant UUID (Immutable)"
                    value="00000000-0000-0000-0000-000000000001"
                    disabled
                  />
                </div>
                <Input
                  label="Registered Head Office Address"
                  value={orgProfile.hqAddress}
                  onChange={(e) => setOrgProfile({ ...orgProfile, hqAddress: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Primary Administrative Contact Email"
                    value={orgProfile.contactEmail}
                    onChange={(e) => setOrgProfile({ ...orgProfile, contactEmail: e.target.value })}
                  />
                  <Input
                    label="Primary Contact Phone (E.164)"
                    value={orgProfile.contactPhone}
                    onChange={(e) => setOrgProfile({ ...orgProfile, contactPhone: e.target.value })}
                  />
                </div>
              </Card>

              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-400" />
                  Branding & Visual Theme
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Primary Brand Accent</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border border-slate-700 shadow-sm"
                        style={{ backgroundColor: orgProfile.brandColor }}
                      />
                      <input
                        type="text"
                        value={orgProfile.brandColor}
                        onChange={(e) => setOrgProfile({ ...orgProfile, brandColor: e.target.value })}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Interface Mode</label>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium border border-slate-700">
                      <Lock className="h-3 w-3 text-emerald-400" />
                      Sleek Dark Mode (Enforced)
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Base Currency</label>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-xs text-blue-300 font-mono font-medium border border-blue-500/20">
                      SGD ($) Singapore Dollar
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 2. BUSINESS UNITS SECTION */}
          {/* =============================================================== */}
          {activeSection === "business_units" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Multinational divisional entities isolated with PostgreSQL Row-Level Security and branch code compliance.
                </p>
                <Button size="sm" variant="outline" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Add Business Unit
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {businessUnits.map((bu) => (
                  <Card key={bu.code} className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                          <Network className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{bu.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-400 border border-slate-700">
                              {bu.code}
                            </span>
                            {bu.isDefault && (
                              <Badge variant="primary" size="sm">
                                Primary HQ
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            Region: {bu.region} · Branch Code: <span className="font-mono text-slate-300">{bu.branchCode}</span> · Manager: {bu.manager}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700">
                          {bu.currency}
                        </span>
                        <Badge variant="success" size="sm">
                          {bu.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 3. USERS SECTION */}
          {/* =============================================================== */}
          {activeSection === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  User accounts provisioned under tenant domain with SSO synchronization and MFA audit verification.
                </p>
                <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Invite User
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center font-mono">#</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Business Unit</th>
                      <th className="py-3 px-4">Security / MFA</th>
                      <th className="py-3 px-4">Identity Provider</th>
                      <th className="py-3 px-4">Last Active</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {users.map((u, idx) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" size="sm">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">{u.bu}</td>
                        <td className="py-3 px-4">
                          {u.mfa ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                              <ShieldCheck className="h-3 w-3" />
                              MFA Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]">
                              <AlertTriangle className="h-3 w-3" />
                              MFA Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{u.provider}</td>
                        <td className="py-3 px-4 text-slate-400">{u.lastActive}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="success" size="sm">
                            {u.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 4. ROLES SECTION */}
          {/* =============================================================== */}
          {activeSection === "roles" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Role-Based Access Control (RBAC) definitions governing system capabilities and privilege boundaries.
                </p>
                <Button size="sm" variant="outline" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Create Custom Role
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((r) => (
                  <Card key={r.key} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{r.name}</span>
                        {r.isSystem && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                            System
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {r.memberCount} Members
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">ID: {r.key}</span>
                      <button
                        onClick={() => setActiveSection("permissions")}
                        className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                      >
                        View Matrix <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 5. PERMISSIONS SECTION */}
          {/* =============================================================== */}
          {activeSection === "permissions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Granular Capability Matrix</h3>
                  <p className="text-xs text-slate-400">
                    Matrix shows capabilities enabled for standard administrative roles across all 10 core modules.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Viewing Role:</span>
                  <select className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white">
                    <option>Super Admin (Full)</option>
                    <option>Finance Controller</option>
                    <option>Sales Director</option>
                    <option>Support Lead</option>
                    <option>Compliance Auditor</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center font-mono">#</th>
                      <th className="py-3 px-4">Functional Module</th>
                      <th className="py-3 px-4 text-center">View</th>
                      <th className="py-3 px-4 text-center">Create</th>
                      <th className="py-3 px-4 text-center">Edit</th>
                      <th className="py-3 px-4 text-center">Delete</th>
                      <th className="py-3 px-4 text-center">Export PII</th>
                      <th className="py-3 px-4 text-center">Administer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {permissionsMatrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-white">{row.module}</td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-slate-600 font-mono">—</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {row.exportPii ? (
                            <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <span className="text-slate-600 font-mono">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-slate-600 font-mono">—</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 6. CONSENT SECTION */}
          {/* =============================================================== */}
          {activeSection === "consent" && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  Regulatory Consent Frameworks
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-white">Singapore PDPA 2012 Compliance</div>
                      <div className="text-[11px] text-slate-400">
                        Mandatory opt-out keywords (`STOP`), consent capture on voice dunning calls, and DNC cross-check.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={consentPolicy.pdpaSingapore}
                      onChange={(e) => setConsentPolicy({ ...consentPolicy, pdpaSingapore: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-white">Thailand PDPA B.E. 2562 & Debt Collection Act</div>
                      <div className="text-[11px] text-slate-400">
                        Mandatory Thai opt-out keyword (`ยกเลิก`), explicit debtor disclosure consent, and max 1 contact/day.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={consentPolicy.pdpaThailand}
                      onChange={(e) => setConsentPolicy({ ...consentPolicy, pdpaThailand: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-white">Voice Call Recording Consent Prompt</div>
                      <div className="text-[11px] text-slate-400">
                        Synthesizes pre-call disclosure notification prior to bi-directional agent/customer audio streaming.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={consentPolicy.voiceConsentRequired}
                      onChange={(e) => setConsentPolicy({ ...consentPolicy, voiceConsentRequired: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-white">WhatsApp Business Explicit Opt-In</div>
                      <div className="text-[11px] text-slate-400">
                        Enforces Meta approved template usage and customer opt-in confirmation before automated messaging.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={consentPolicy.whatsappOptIn}
                      onChange={(e) => setConsentPolicy({ ...consentPolicy, whatsappOptIn: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                    />
                  </div>
                </div>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Consent Expiration & Dunning Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Consent Record Retention Window (Months)"
                    type="number"
                    value={consentPolicy.retentionMonths.toString()}
                    onChange={(e) => setConsentPolicy({ ...consentPolicy, retentionMonths: parseInt(e.target.value) || 24 })}
                  />
                  <Input
                    label="Default SMS Opt-Out Keyword"
                    value={consentPolicy.smsOptOutKeyword}
                    onChange={(e) => setConsentPolicy({ ...consentPolicy, smsOptOutKeyword: e.target.value })}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 7. INTEGRATIONS SECTION (MANDATORY ARCHITECTURAL GUARDRAIL) */}
          {/* =============================================================== */}
          {activeSection === "integrations" && (
            <div className="space-y-6">
              {/* Mandatory Architectural Guardrail Alert */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/30 space-y-2">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-200">
                      Integration Credential Security Boundary Enforced
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      <strong>Architectural Guardrail:</strong> In accordance with enterprise security policy, integration credentials
                      (API keys, OAuth tokens, client secrets, and signing certificates) are <strong>NEVER stored in ordinary settings tables or plaintext configurations</strong>.
                      All external provider credentials must be managed exclusively through the dedicated <strong>Integration Center and Google Secret Manager Vault</strong>.
                    </p>
                    <div className="mt-3">
                      <Link href="/integrations">
                        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                          Open Integration Center & Secret Manager
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Rails Read-Only Overview */}
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    Enterprise Connector Governance Summary (14 Connectors)
                  </h3>
                  <Badge variant="outline" size="sm">
                    Vault: projects/nexus-erp/secrets
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {[
                    { name: "Stripe Enterprise Payments", status: "Active (Vault Ref sk_live_...)", type: "Global Payments" },
                    { name: "Telephony & VoIP SIP Gateway", status: "Provider-Neutral (Simulation/Carrier)", type: "Telephony Carrier" },
                    { name: "Singapore DBS RAPID & PayNow", status: "Configured (SGQR Direct)", type: "Regional SG" },
                    { name: "Malaysia Curlec & LHDN MyInvois", status: "Configured (DuitNow FPX)", type: "Regional MY" },
                    { name: "Thailand Omise & RD e-Tax", status: "Configured (PromptPay)", type: "Regional TH" },
                    { name: "LINE Official Account (TH)", status: "Active (Channel Access)", type: "OTT Messaging" },
                    { name: "Google Document AI OCR", status: "Active (GCP KMS Vault)", type: "AI Vision" },
                    { name: "Salesforce Enterprise CRM", status: "Active (OAuth2 Sync)", type: "Enterprise CRM" },
                  ].map((conn, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{conn.name}</div>
                        <div className="text-[11px] text-slate-400">{conn.status}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 font-mono">
                        {conn.type}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 8. NOTIFICATIONS SECTION */}
          {/* =============================================================== */}
          {activeSection === "notifications" && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-400" />
                  Omnichannel Alert Routing Channels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Default SecOps Alert Email"
                    value={notifPolicy.defaultEmail}
                    onChange={(e) => setNotifPolicy({ ...notifPolicy, defaultEmail: e.target.value })}
                  />
                  <Input
                    label="Slack Incident Webhook Channel"
                    value={notifPolicy.slackChannel}
                    onChange={(e) => setNotifPolicy({ ...notifPolicy, slackChannel: e.target.value })}
                  />
                  <Input
                    label="Critical Urgent SMS Pager"
                    value={notifPolicy.smsPager}
                    onChange={(e) => setNotifPolicy({ ...notifPolicy, smsPager: e.target.value })}
                  />
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Quiet Hours Timezone</label>
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono w-full">
                      Asia/Singapore (UTC+8) · 22:00 to 07:00
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Automated Trigger Policies</h3>
                <div className="space-y-2">
                  {[
                    { label: "Payment Settlement Failures & Reversals", key: "onPaymentFailure", val: notifPolicy.onPaymentFailure },
                    { label: "DNC Registry or Out-of-Window Calling Violation", key: "onDncViolation", val: notifPolicy.onDncViolation },
                    { label: "Customer Support SLA Imminent Breach (< 1 Hour)", key: "onSlaBreach", val: notifPolicy.onSlaBreach },
                    { label: "AI Safety Guardrail or Prompt Injection Trip", key: "onAiGuardrailTrip", val: notifPolicy.onAiGuardrailTrip },
                  ].map((trigger, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-xs text-slate-200">{trigger.label}</span>
                      <input
                        type="checkbox"
                        checked={trigger.val}
                        onChange={() => setNotifPolicy({ ...notifPolicy, [trigger.key]: !trigger.val } as any)}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 9. SECURITY SECTION */}
          {/* =============================================================== */}
          {activeSection === "security" && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Authentication & Access Bounds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Mandatory Two-Factor Authentication (2FA/MFA)</div>
                      <div className="text-[11px] text-slate-400">Enforce TOTP / WebAuthn FIDO2 for all organization users.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={securityPolicy.mfaEnforced}
                      onChange={(e) => setSecurityPolicy({ ...securityPolicy, mfaEnforced: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Enforce Corporate SSO (SAML 2.0 / OIDC)</div>
                      <div className="text-[11px] text-slate-400">Block standard password logins; require IdP assertion.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={securityPolicy.ssoEnforced}
                      onChange={(e) => setSecurityPolicy({ ...securityPolicy, ssoEnforced: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                    />
                  </div>

                  <Input
                    label="Minimum Password Length (Chars)"
                    type="number"
                    value={securityPolicy.minPasswordLength.toString()}
                    onChange={(e) => setSecurityPolicy({ ...securityPolicy, minPasswordLength: parseInt(e.target.value) || 14 })}
                  />

                  <Input
                    label="Session Idle Timeout (Minutes)"
                    type="number"
                    value={securityPolicy.idleTimeoutMinutes.toString()}
                    onChange={(e) => setSecurityPolicy({ ...securityPolicy, idleTimeoutMinutes: parseInt(e.target.value) || 30 })}
                  />
                </div>

                <Input
                  label="IP Whitelist CIDR Blocks (Comma separated)"
                  value={securityPolicy.allowedCidr}
                  onChange={(e) => setSecurityPolicy({ ...securityPolicy, allowedCidr: e.target.value })}
                />
              </Card>

              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-400" />
                  Cryptographic Token Signing Keys
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Token Signing Algorithm" value={securityPolicy.tokenSigningAlgo} disabled />
                  <Input label="Token Validity Lifetime" value={`${securityPolicy.tokenExpiryHours} Hours`} disabled />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Ed25519 Key Fingerprint: SHA256:7b49...e28f</span>
                  <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                    Rotate Signing Keys
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 10. AUDIT SECTION */}
          {/* =============================================================== */}
          {activeSection === "audit" && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <History className="h-4 w-4 text-indigo-400" />
                    Immutable Audit Trail & Cryptographic Verification
                  </h3>
                  <Link href="/audit">
                    <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                      Open Full Audit Console
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      Cryptographic Hash Chaining Verified
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Each audit record is linked via SHA-256 block hash to the previous entry. Tamper-evident and append-only.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                      <Lock className="h-4 w-4" />
                      Database Write-Only Rule Enforced
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      PostgreSQL permissions strictly prohibit `UPDATE` and `DELETE` on the `audit_logs` table.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Input
                    label="External SIEM / Syslog Forwarding Endpoint (RFC 5424 TLS)"
                    value={auditPolicy.siemEndpoint}
                    onChange={(e) => setAuditPolicy({ ...auditPolicy, siemEndpoint: e.target.value })}
                  />
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-white">Alert on Bulk Customer PII Export</div>
                      <div className="text-[11px] text-slate-400">Trigger immediate security notification when &gt; 100 customer records are exported.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={auditPolicy.alertBulkExport}
                      onChange={(e) => setAuditPolicy({ ...auditPolicy, alertBulkExport: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 11. RETENTION SECTION */}
          {/* =============================================================== */}
          {activeSection === "retention" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Data lifecycle schedules complying with statutory requirements across IRAS (SG), LHDN (MY), and RD (TH).
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">Master Legal Hold:</span>
                  <button
                    onClick={() => setMasterLegalHold(!masterLegalHold)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      masterLegalHold
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {masterLegalHold ? "Active (All Purges Frozen)" : "Inactive"}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center font-mono">#</th>
                      <th className="py-3 px-4">Entity Type</th>
                      <th className="py-3 px-4">Retention Period</th>
                      <th className="py-3 px-4">Statutory Basis</th>
                      <th className="py-3 px-4">Purge Action</th>
                      <th className="py-3 px-4 text-right">Legal Hold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {retentionRules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-white">{rule.entity}</td>
                        <td className="py-3 px-4 font-mono text-indigo-400">{rule.period}</td>
                        <td className="py-3 px-4 text-slate-400">{rule.statutory}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {rule.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {masterLegalHold || rule.legalHold ? (
                            <Badge variant="destructive" size="sm">
                              Protected
                            </Badge>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Normal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 12. DNC (DO NOT CALL) SECTION */}
          {/* =============================================================== */}
          {activeSection === "dnc" && (
            <div className="space-y-6">
              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <PhoneOff className="h-4 w-4 text-rose-400" />
                  National DNC Registry Synchronization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Singapore (PDPC DNC)</span>
                      <input
                        type="checkbox"
                        checked={dncPolicy.pdpcSg}
                        onChange={(e) => setDncPolicy({ ...dncPolicy, pdpcSg: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Syncs weekly with Personal Data Protection Commission.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Malaysia (MCMC DNC)</span>
                      <input
                        type="checkbox"
                        checked={dncPolicy.mcmcMy}
                        onChange={(e) => setDncPolicy({ ...dncPolicy, mcmcMy: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Enforces Communications & Multimedia Act register.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Thailand (NBTC DNC)</span>
                      <input
                        type="checkbox"
                        checked={dncPolicy.nbtcTh}
                        onChange={(e) => setDncPolicy({ ...dncPolicy, nbtcTh: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Debt Collection Act B.E. 2558 hard compliance check.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-rose-300">Hard Dialing Block on DNC Matched Numbers</div>
                    <div className="text-[11px] text-slate-300">
                      When enabled, automated telephony and AI voice agents will strictly refuse to dial suppressed numbers.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dncPolicy.hardBlockTelephony}
                    onChange={(e) => setDncPolicy({ ...dncPolicy, hardBlockTelephony: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800 text-rose-600 focus:ring-0 h-4 w-4"
                  />
                </div>
              </Card>

              {/* Real-Time Tenant Suppression Table */}
              <Card className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">Tenant Real-Time Phone Suppression List</h3>
                  <form onSubmit={handleAddDnc} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add E.164 (e.g. +6591234567)"
                      value={newDncPhone}
                      onChange={(e) => setNewDncPhone(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <Button size="sm" variant="outline" type="submit">
                      Add to DNC
                    </Button>
                  </form>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center font-mono">#</th>
                        <th className="py-3 px-4">Phone Number</th>
                        <th className="py-3 px-4">Country</th>
                        <th className="py-3 px-4">Source</th>
                        <th className="py-3 px-4">Suppressed Since</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {dncList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-rose-400">{item.phone}</td>
                          <td className="py-3 px-4 font-mono">{item.country}</td>
                          <td className="py-3 px-4 text-slate-400">{item.source}</td>
                          <td className="py-3 px-4 text-slate-400">{item.date}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 13. REGIONAL CONFIGURATION SECTION */}
          {/* =============================================================== */}
          {activeSection === "regional" && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    Regional Localization & Country Pack Engine
                  </h3>
                  <Link href="/country-packs">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      Open Country Pack Engine
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Default Primary Country Pack</label>
                    <select
                      value={regionalConfig.defaultCountryPack}
                      onChange={(e) => setRegionalConfig({ ...regionalConfig, defaultCountryPack: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="SG">Singapore (🇸🇬 SGT UTC+8 · GST 9% · InvoiceNow Peppol)</option>
                      <option value="MY">Malaysia (🇲🇾 MYT UTC+8 · SST 8% · LHDN MyInvois)</option>
                      <option value="TH">Thailand (🇹🇭 ICT UTC+7 · VAT 7% · Thai RD e-Tax)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Base Reporting Currency</label>
                    <select
                      value={regionalConfig.baseCurrency}
                      onChange={(e) => setRegionalConfig({ ...regionalConfig, baseCurrency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    >
                      <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                      <option value="MYR">MYR (RM - Malaysian Ringgit)</option>
                      <option value="THB">THB (฿ - Thai Baht)</option>
                      <option value="USD">USD ($ - United States Dollar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Calendar System</label>
                    <select
                      value={regionalConfig.calendarSystem}
                      onChange={(e) => setRegionalConfig({ ...regionalConfig, calendarSystem: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="gregorian">Gregorian Calendar (2026)</option>
                      <option value="buddhist_era">Buddhist Era - BE 2569 (Thailand Official)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Standard Time Format</label>
                    <select
                      value={regionalConfig.timeFormat}
                      onChange={(e) => setRegionalConfig({ ...regionalConfig, timeFormat: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="24h">24-Hour International (14:30:00)</option>
                      <option value="12h">12-Hour AM/PM (02:30:00 PM)</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 14. AI POLICIES SECTION */}
          {/* =============================================================== */}
          {activeSection === "ai_policies" && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  LLM Reasoning & Agent Control Plane Guardrails
                </h3>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                    <label className="text-xs text-slate-300 font-semibold block mb-2">Approved Model Whitelist</label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {["claude-3-5-sonnet", "gemini-1-5-pro", "gpt-4o", "mistral-large"].map((model) => (
                        <label key={model} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                          <input
                            type="checkbox"
                            defaultChecked={aiPolicy.allowedModels.includes(model)}
                            className="rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-0 h-3.5 w-3.5"
                          />
                          <span className="font-mono text-[11px]">{model}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Maximum Inference Temperature Cap: <span className="text-indigo-400 font-mono">{aiPolicy.temperatureCap}</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mb-2">Constrains hallucination probability in billing conversations.</p>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={aiPolicy.temperatureCap}
                        onChange={(e) => setAiPolicy({ ...aiPolicy, temperatureCap: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Adversarial Prompt Defense Threshold: <span className="text-purple-400 font-mono">{aiPolicy.adversarialThreshold}</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mb-2">Jailbreak sensitivity threshold before rejecting user input.</p>
                      <input
                        type="range"
                        min="0.5"
                        max="0.99"
                        step="0.01"
                        value={aiPolicy.adversarialThreshold}
                        onChange={(e) => setAiPolicy({ ...aiPolicy, adversarialThreshold: parseFloat(e.target.value) })}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">Strict PII Redactor Filter</div>
                        <div className="text-[11px] text-slate-400">
                          Automatically masks Credit Cards (Luhn check), NRIC, TIN, and bank accounts prior to model inference.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={aiPolicy.piiRedaction}
                        onChange={(e) => setAiPolicy({ ...aiPolicy, piiRedaction: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">Prohibit Executive Deepfake Clones</div>
                        <div className="text-[11px] text-slate-400">
                          Strict policy prohibition against synthesizing voice or persona likenesses of company leadership.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={aiPolicy.prohibitExecutiveClones}
                        onChange={(e) => setAiPolicy({ ...aiPolicy, prohibitExecutiveClones: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 h-4 w-4"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 15. WORKFLOW POLICIES SECTION */}
          {/* =============================================================== */}
          {activeSection === "workflow_policies" && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-emerald-400" />
                  Automation Bounds & Circuit Breakers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Maximum Concurrent Executions"
                    type="number"
                    value={workflowPolicy.maxConcurrent.toString()}
                    onChange={(e) => setWorkflowPolicy({ ...workflowPolicy, maxConcurrent: parseInt(e.target.value) || 500 })}
                  />

                  <Input
                    label="Step Timeout (Seconds)"
                    type="number"
                    value={workflowPolicy.stepTimeout.toString()}
                    onChange={(e) => setWorkflowPolicy({ ...workflowPolicy, stepTimeout: parseInt(e.target.value) || 300 })}
                  />

                  <Input
                    label="Max Exponential Backoff Retries"
                    type="number"
                    value={workflowPolicy.maxRetries.toString()}
                    onChange={(e) => setWorkflowPolicy({ ...workflowPolicy, maxRetries: parseInt(e.target.value) || 5 })}
                  />

                  <Input
                    label="Circuit Breaker Error Rate Threshold (%)"
                    type="number"
                    value={workflowPolicy.circuitBreakerErrorRate.toString()}
                    onChange={(e) => setWorkflowPolicy({ ...workflowPolicy, circuitBreakerErrorRate: parseInt(e.target.value) || 15 })}
                  />
                </div>

                {/* Emergency Killswitch */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-rose-400" />
                      Emergency Autonomous Campaign Killswitch
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Immediately suspends all outbound AI calls, collections dunning, and bulk messaging workflows.
                    </p>
                  </div>
                  <button
                    onClick={() => setWorkflowPolicy({ ...workflowPolicy, emergencyKillswitch: !workflowPolicy.emergencyKillswitch })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      workflowPolicy.emergencyKillswitch
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-900/50"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                    }`}
                  >
                    {workflowPolicy.emergencyKillswitch ? "KILLSWITCH ENGAGED" : "Disarmed"}
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* =============================================================== */}
          {/* 16. BILLING METADATA SECTION */}
          {/* =============================================================== */}
          {activeSection === "billing" && (
            <div className="space-y-6">
              <Card className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-indigo-400" />
                      Enterprise Subscription & Billing Profile
                    </h3>
                    <p className="text-xs text-slate-400">Multi-country SEA tenant license with consolidated invoicing.</p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {billingMeta.planName}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Billing Cadence</span>
                    <span className="text-xs font-semibold text-white">{billingMeta.billingCycle}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Next Renewal Date</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">{billingMeta.renewalDate}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Payment Method on File</span>
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                      {billingMeta.paymentRail} (•••• {billingMeta.last4})
                    </span>
                  </div>
                </div>
              </Card>

              {/* Metered Consumption Progress */}
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Metered Resource Quotas & Usage</h3>
                  <Button size="sm" variant="outline" leftIcon={<Download className="h-3.5 w-3.5" />}>
                    Download Billing Ledger (PDF)
                  </Button>
                </div>

                <div className="space-y-3">
                  {billingMeta.metered.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">{item.name}</span>
                        <span className="font-mono text-slate-400">
                          {item.used.toLocaleString()} / {item.limit.toLocaleString()} {item.unit} ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
