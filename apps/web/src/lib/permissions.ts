export type UserRole = "admin" | "manager" | "sales_agent" | "finance_officer" | "auditor";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: string;
  badgeVariant?: "default" | "primary" | "success" | "warning" | "ai";
  requiredRoles: UserRole[];
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const ALL_ROLES: UserRole[] = ["admin", "manager", "sales_agent", "finance_officer", "auditor"];

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: "core",
    title: "Core & Identity",
    items: [
      { id: "dashboard", label: "Command Center", href: "/", iconName: "LayoutDashboard", badge: "Live 14/14", badgeVariant: "ai", requiredRoles: ALL_ROLES },
      { id: "customers", label: "Customer 360", href: "/customers", iconName: "Users", badge: "Unified", badgeVariant: "primary", requiredRoles: ALL_ROLES },
      { id: "timeline", label: "Customer Timeline", href: "/timeline", iconName: "History", badge: "Real-time", badgeVariant: "default", requiredRoles: ALL_ROLES },
      { id: "companies", label: "Companies", href: "/companies", iconName: "Building2", requiredRoles: ["admin", "manager", "sales_agent", "finance_officer"] },
      { id: "contacts", label: "Contacts", href: "/contacts", iconName: "Contact", requiredRoles: ["admin", "manager", "sales_agent"] },
      { id: "search", label: "Global Search", href: "/search", iconName: "Search", badge: "Omni 13", badgeVariant: "ai", requiredRoles: ALL_ROLES },
    ],
  },
  {
    id: "crm",
    title: "CRM & Sales",
    items: [
      { id: "leads", label: "Leads", href: "/leads", iconName: "UserPlus", badge: "12 New", badgeVariant: "ai", requiredRoles: ["admin", "manager", "sales_agent"] },
      { id: "deals", label: "Deals", href: "/crm", iconName: "TrendingUp", requiredRoles: ["admin", "manager", "sales_agent"] },
      { id: "quotes", label: "Quotes", href: "/quotes", iconName: "FileCheck", requiredRoles: ["admin", "manager", "sales_agent", "finance_officer"] },
      { id: "sales-flow", label: "Complete Sales Flow", href: "/sales-flow", iconName: "TrendingUp", badge: "9-Stage Flow", badgeVariant: "ai", requiredRoles: ALL_ROLES },
    ],
  },
  {
    id: "erp",
    title: "ERP & Financials",
    items: [
      { id: "invoices", label: "Invoices", href: "/invoices", iconName: "DollarSign", requiredRoles: ["admin", "manager", "finance_officer", "auditor"] },
      { id: "payments", label: "Payments", href: "/payments", iconName: "CreditCard", requiredRoles: ["admin", "manager", "finance_officer", "auditor"] },
      { id: "accounting", label: "Accounting", href: "/accounting", iconName: "Landmark", badge: "Xero / QBO", badgeVariant: "primary", requiredRoles: ["admin", "manager", "finance_officer", "auditor"] },
      { id: "collections", label: "Collections", href: "/collections", iconName: "Landmark", badge: "RLS Isolated", badgeVariant: "warning", requiredRoles: ["admin", "manager", "finance_officer"] },
      { id: "inventory", label: "Inventory & Procurement", href: "/inventory", iconName: "FolderGit2", badge: "Procure-to-Pay", badgeVariant: "ai", requiredRoles: ["admin", "manager", "finance_officer"] },
    ],
  },
  {
    id: "documents",
    title: "Documents & OCR",
    items: [
      { id: "documents", label: "Documents", href: "/documents", iconName: "FolderGit2", requiredRoles: ALL_ROLES },
      { id: "ocr", label: "OCR & Vision", href: "/ocr", iconName: "ScanLine", badge: "AI Vision", badgeVariant: "ai", requiredRoles: ["admin", "manager", "finance_officer", "sales_agent"] },
    ],
  },
  {
    id: "comms",
    title: "AI Communications",
    items: [
      { id: "whatsapp", label: "WhatsApp", href: "/whatsapp", iconName: "MessageCircle", badge: "Live", badgeVariant: "success", requiredRoles: ["admin", "manager", "sales_agent"] },
      { id: "conversations", label: "Conversations", href: "/conversations", iconName: "MessagesSquare", requiredRoles: ["admin", "manager", "sales_agent"] },
      { id: "call-center", label: "Call Center", href: "/call-center", iconName: "Headphones", badge: "Live Ops", badgeVariant: "ai", requiredRoles: ["admin", "manager", "sales_agent", "finance_officer"] },
      { id: "support", label: "Customer Support", href: "/support", iconName: "LifeBuoy", badge: "SLA Ready", badgeVariant: "ai", requiredRoles: ["admin", "manager", "sales_agent", "finance_officer"] },
      { id: "voice-calls", label: "Voice Calls", href: "/voice-calls", iconName: "PhoneCall", badge: "AI Transcribed", badgeVariant: "ai", requiredRoles: ["admin", "manager", "sales_agent"] },
      { id: "voice-agent", label: "AI Voice Agent", href: "/voice-agent", iconName: "Volume2", badge: "Full-Duplex", badgeVariant: "ai", requiredRoles: ["admin", "manager", "sales_agent"] },
      { id: "ai-agents", label: "AI Agents", href: "/ai-agents", iconName: "Bot", badge: "Copilot", badgeVariant: "ai", requiredRoles: ["admin", "manager"] },
      { id: "ai-sales", label: "AI Sales Agent", href: "/ai-sales", iconName: "TrendingUp", badge: "Commercial", badgeVariant: "ai", requiredRoles: ["admin", "manager", "sales_agent"] },
    ],
  },
  {
    id: "automation",
    title: "Workflows & Intelligence",
    items: [
      { id: "workflows", label: "Workflows", href: "/workflows", iconName: "GitBranch", requiredRoles: ["admin", "manager", "sales_agent", "finance_officer"] },
      { id: "analytics", label: "Analytics", href: "/analytics", iconName: "BarChart3", requiredRoles: ALL_ROLES },
      { id: "roi", label: "ROI Dashboard", href: "/roi", iconName: "PiggyBank", requiredRoles: ["admin", "manager", "finance_officer"] },
    ],
  },
  {
    id: "governance",
    title: "Platform & Governance",
    items: [
      { id: "exceptions", label: "Exceptions & Remediation", href: "/exceptions", iconName: "AlertTriangle", badge: "6 Domains", badgeVariant: "warning", requiredRoles: ["admin", "manager", "finance_officer"] },
      { id: "audit", label: "Audit Trail", href: "/audit", iconName: "ShieldAlert", badge: "Append-Only", badgeVariant: "default", requiredRoles: ["admin", "auditor"] },
      { id: "country-packs", label: "Regional Packs", href: "/country-packs", iconName: "Globe", badge: "SG · MY · TH", badgeVariant: "ai", requiredRoles: ["admin", "manager", "finance_officer"] },
      { id: "integrations", label: "Integrations", href: "/integrations", iconName: "Cpu", requiredRoles: ["admin", "manager"] },
      { id: "settings", label: "Settings", href: "/settings", iconName: "Settings", requiredRoles: ["admin"] },
      { id: "observability", label: "Observability & Sentry", href: "/observability", iconName: "Activity", badge: "Telemetry", badgeVariant: "ai", requiredRoles: ["admin", "manager", "auditor"] },
      { id: "cicd", label: "CI/CD & Deployments", href: "/cicd", iconName: "Rocket", badge: "GCP WIF", badgeVariant: "ai", requiredRoles: ["admin", "manager", "auditor"] },
      { id: "infrastructure", label: "GCP Infrastructure", href: "/infrastructure", iconName: "Cloud", badge: "13 Services", badgeVariant: "ai", requiredRoles: ["admin", "manager", "auditor"] },
      { id: "security", label: "Enterprise Security Audit", href: "/security", iconName: "ShieldCheck", badge: "19 Domains", badgeVariant: "ai", requiredRoles: ALL_ROLES },
      { id: "e2e-audit", label: "End-to-End Platform Audit", href: "/e2e-audit", iconName: "Workflow", badge: "10 Flows", badgeVariant: "ai", requiredRoles: ALL_ROLES },
      { id: "design-system", label: "Design System", href: "/design-system", iconName: "Sparkles", requiredRoles: ALL_ROLES },
    ],
  },
];

export function hasPermission(itemRoles: UserRole[], currentRole: UserRole): boolean {
  return itemRoles.includes(currentRole);
}
