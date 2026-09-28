export type AccountingProvider = "xero" | "zoho_books" | "quickbooks";

export type AccountingSyncStatus =
  | "idle"
  | "in_progress"
  | "synced"
  | "error"
  | "partial_failure";

export interface AccountingConnectionItem {
  id: string;
  provider: AccountingProvider;
  name: string;
  category: string;
  status: "connected" | "pending_auth" | "disconnected" | "token_expired";
  externalTenantId?: string; // Xero Tenant ID or Zoho Org ID
  realmId?: string;          // QuickBooks Company / Realm ID
  syncStatus: AccountingSyncStatus;
  lastSyncedAt?: string;
  autoSyncEnabled: boolean;
  syncFrequencyMinutes: number;
  syncedCounts: {
    customers: number;
    invoices: number;
    payments: number;
  };
  supportedFeatures: string[];
  webhookStatus: "active" | "pending_endpoint" | "unverified";
  tokenExpiresInHours: number;
}

export interface AccountingEntityMappingItem {
  id: string;
  provider: AccountingProvider;
  entityType: "customer" | "invoice" | "payment";
  localEntityId: string;
  localEntityNumber: string;
  localTitle: string;
  remoteEntityId: string;
  remoteEntityNumber: string;
  syncDirection: "inbound" | "outbound" | "bidirectional";
  status: "synced" | "pending_push" | "pending_pull" | "conflict" | "error";
  lastSyncedAt: string;
  errorMessage?: string;
}

export interface AccountingSyncLogItem {
  id: string;
  batchId: string;
  provider: AccountingProvider;
  entityType: "customers" | "invoices" | "payments" | "full_suite";
  syncDirection: "inbound" | "outbound" | "bidirectional";
  entitiesProcessed: number;
  entitiesCreated: number;
  entitiesUpdated: number;
  entitiesFailed: number;
  status: "succeeded" | "failed" | "in_progress";
  startedAt: string;
  durationMs: number;
  errorSummary?: string;
}

export interface AccountingDiscrepancyItem {
  id: string;
  provider: AccountingProvider;
  entityType: "invoice" | "payment";
  localEntityNumber: string;
  remoteEntityNumber: string;
  companyName: string;
  erpAmount: number;
  accountingAmount: number;
  discrepancyAmount: number;
  discrepancyType: "amount_mismatch" | "missing_in_accounting" | "tax_code_divergence" | "unapplied_payment";
  status: "detected" | "reconciled" | "under_review";
  detectedAt: string;
}

// ----------------------------------------------------------------------
// Initial Datasets
// ----------------------------------------------------------------------

export const INITIAL_ACCOUNTING_CONNECTIONS: AccountingConnectionItem[] = [
  {
    id: "acc-conn-001",
    provider: "xero",
    name: "Xero Cloud Accounting",
    category: "Global General Ledger & Reconciliation",
    status: "connected",
    externalTenantId: "xero_tenant_9942a8-881b-44f2",
    syncStatus: "synced",
    lastSyncedAt: "2026-09-22T21:00:00Z",
    autoSyncEnabled: true,
    syncFrequencyMinutes: 30,
    syncedCounts: {
      customers: 142,
      invoices: 88,
      payments: 64,
    },
    supportedFeatures: [
      "ACCREC Invoices Push",
      "Contacts Two-Way Sync",
      "Bank Transaction Matching",
      "HMAC SHA-256 Webhooks",
    ],
    webhookStatus: "active",
    tokenExpiresInHours: 58,
  },
  {
    id: "acc-conn-002",
    provider: "zoho_books",
    name: "Zoho Books",
    category: "APAC Multi-Currency Invoicing",
    status: "connected",
    externalTenantId: "zb_org_884210982",
    syncStatus: "synced",
    lastSyncedAt: "2026-09-22T20:45:00Z",
    autoSyncEnabled: true,
    syncFrequencyMinutes: 60,
    syncedCounts: {
      customers: 45,
      invoices: 32,
      payments: 28,
    },
    supportedFeatures: [
      "GST / VAT Tax Codes",
      "Contacts Two-Way Sync",
      "Customer Payment Receipts",
      "Real-time Webhook Ingestion",
    ],
    webhookStatus: "active",
    tokenExpiresInHours: 120,
  },
  {
    id: "acc-conn-003",
    provider: "quickbooks",
    name: "QuickBooks Online (Intuit)",
    category: "US & Canada Financial Ledger",
    status: "pending_auth",
    realmId: "934145209841882",
    syncStatus: "idle",
    autoSyncEnabled: false,
    syncFrequencyMinutes: 60,
    syncedCounts: {
      customers: 0,
      invoices: 0,
      payments: 0,
    },
    supportedFeatures: [
      "Intuit Accounts OAuth 2.0",
      "Customer & Sub-Account Mapping",
      "Sales Receipts & Invoices",
      "Payment Deposit Reconciliation",
    ],
    webhookStatus: "pending_endpoint",
    tokenExpiresInHours: 0,
  },
];

export const INITIAL_ENTITY_MAPPINGS: AccountingEntityMappingItem[] = [
  {
    id: "map-001",
    provider: "xero",
    entityType: "customer",
    localEntityId: "cust-001",
    localEntityNumber: "CUST-001",
    localTitle: "Acme Global Industries (Sarah Jenkins)",
    remoteEntityId: "xero_con_8842109",
    remoteEntityNumber: "CON-88421",
    syncDirection: "bidirectional",
    status: "synced",
    lastSyncedAt: "2026-09-22T21:00:00Z",
  },
  {
    id: "map-002",
    provider: "xero",
    entityType: "invoice",
    localEntityId: "inv-001",
    localEntityNumber: "INV-2026-0041",
    localTitle: "Annual Enterprise License ($45,000.00)",
    remoteEntityId: "xero_inv_991823",
    remoteEntityNumber: "INV-00842",
    syncDirection: "outbound",
    status: "synced",
    lastSyncedAt: "2026-09-22T21:00:00Z",
  },
  {
    id: "map-003",
    provider: "xero",
    entityType: "invoice",
    localEntityId: "inv-002",
    localEntityNumber: "INV-2026-0042",
    localTitle: "Custom OCR Pipeline ($18,750.00)",
    remoteEntityId: "xero_inv_991824",
    remoteEntityNumber: "INV-00843",
    syncDirection: "outbound",
    status: "synced",
    lastSyncedAt: "2026-09-22T21:00:00Z",
  },
  {
    id: "map-004",
    provider: "zoho_books",
    entityType: "invoice",
    localEntityId: "inv-003",
    localEntityNumber: "INV-2026-0043",
    localTitle: "SIP Trunking Q3 ($12,400.00)",
    remoteEntityId: "zb_inv_771920",
    remoteEntityNumber: "INV-ZB-991",
    syncDirection: "outbound",
    status: "synced",
    lastSyncedAt: "2026-09-22T20:45:00Z",
  },
  {
    id: "map-005",
    provider: "xero",
    entityType: "payment",
    localEntityId: "tx-001",
    localEntityNumber: "TXN-2026-8842",
    localTitle: "Wire Settlement ($45,000.00)",
    remoteEntityId: "xero_pay_554109",
    remoteEntityNumber: "PAY-XERO-992",
    syncDirection: "outbound",
    status: "synced",
    lastSyncedAt: "2026-09-22T21:00:00Z",
  },
];

export const INITIAL_SYNC_LOGS: AccountingSyncLogItem[] = [
  {
    id: "slog-001",
    batchId: "batch-xero-20260922-2100",
    provider: "xero",
    entityType: "full_suite",
    syncDirection: "bidirectional",
    entitiesProcessed: 42,
    entitiesCreated: 3,
    entitiesUpdated: 39,
    entitiesFailed: 0,
    status: "succeeded",
    startedAt: "2026-09-22T21:00:00Z",
    durationMs: 1420,
  },
  {
    id: "slog-002",
    batchId: "batch-zoho-20260922-2045",
    provider: "zoho_books",
    entityType: "invoices",
    syncDirection: "outbound",
    entitiesProcessed: 12,
    entitiesCreated: 1,
    entitiesUpdated: 11,
    entitiesFailed: 0,
    status: "succeeded",
    startedAt: "2026-09-22T20:45:00Z",
    durationMs: 890,
  },
  {
    id: "slog-003",
    batchId: "batch-xero-20260922-1800",
    provider: "xero",
    entityType: "payments",
    syncDirection: "outbound",
    entitiesProcessed: 8,
    entitiesCreated: 2,
    entitiesUpdated: 6,
    entitiesFailed: 0,
    status: "succeeded",
    startedAt: "2026-09-22T18:00:00Z",
    durationMs: 640,
  },
];

export const INITIAL_DISCREPANCIES: AccountingDiscrepancyItem[] = [
  {
    id: "disc-001",
    provider: "xero",
    entityType: "invoice",
    localEntityNumber: "INV-2026-0044",
    remoteEntityNumber: "INV-00845",
    companyName: "OmniCorp Logistics",
    erpAmount: 32100.0,
    accountingAmount: 30000.0,
    discrepancyAmount: 2100.0,
    discrepancyType: "tax_code_divergence",
    status: "detected",
    detectedAt: "2026-09-22T21:00:00Z",
  },
];
