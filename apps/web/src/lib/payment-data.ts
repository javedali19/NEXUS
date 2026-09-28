export type PaymentStatus =
  | "pending"
  | "authorized"
  | "succeeded"
  | "failed"
  | "partially_refunded"
  | "refunded"
  | "disputed"
  | "cancelled";

export type PaymentProvider =
  | "razorpay"
  | "stripe"
  | "hitpay"
  | "airwallex"
  | "cashfree"
  | "manual_wire"
  | "ach";

export type ReconciliationState =
  | "unreconciled"
  | "auto_matched"
  | "manual_matched"
  | "disputed"
  | "settled_to_ledger";

export interface PaymentTransactionItem {
  id: string;
  transactionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  amount: number;
  currency: string;
  feeAmount: number;
  netAmount: number;
  provider: PaymentProvider;
  providerTransactionId?: string;
  providerOrderId?: string;
  status: PaymentStatus;
  paymentMethod: string;
  paymentMethodDetails: {
    brand?: string;
    last4?: string;
    upiVpa?: string;
    bankName?: string;
    walletType?: string;
  };
  allocatedAmount: number;
  unallocatedAmount: number;
  settledAt?: string;
  createdAt: string;
  description: string;
  reconciliationState: ReconciliationState;
}

export interface PaymentAllocationItem {
  id: string;
  paymentId: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  companyName: string;
  allocatedAmount: number;
  invoiceTotal: number;
  invoiceRemainingBalance: number;
  currency: string;
  status: "settled" | "partially_paid";
  allocatedAt: string;
}

export interface PaymentLinkItem {
  id: string;
  linkToken: string;
  slug: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  status: "active" | "completed" | "expired" | "cancelled";
  allowedProviders: PaymentProvider[];
  hostedUrl: string;
  qrPayload: string;
  expiresAt: string;
  completedAt?: string;
  viewsCount: number;
  createdAt: string;
}

export interface PaymentAttemptItem {
  id: string;
  paymentNumber: string;
  customerName: string;
  companyName: string;
  provider: PaymentProvider;
  attemptNumber: number;
  status: "succeeded" | "failed" | "declined" | "timeout" | "blocked_fraud";
  amount: number;
  currency: string;
  gatewayResponseCode: string;
  declineCode: string;
  declineReason: string;
  errorCategory: "insufficient_funds" | "card_expired" | "do_not_honor" | "network_timeout" | "fraud_suspected";
  latencyMs: number;
  retryCount: number;
  maxRetries: number;
  nextFallbackProvider?: PaymentProvider;
  timestamp: string;
}

export interface ReconciliationItem {
  id: string;
  payoutBatchId: string;
  provider: PaymentProvider;
  bankStatementReference: string;
  status: ReconciliationState;
  expectedAmount: number;
  clearedAmount: number;
  differenceAmount: number;
  currency: string;
  transactionsCount: number;
  matchedAt?: string;
  matchedBy?: string;
  createdAt: string;
}

export interface ProviderCapabilityConfig {
  code: PaymentProvider;
  name: string;
  category: string;
  targetMarket: string;
  supportedCurrencies: string[];
  supportedRails: string[];
  credentialStatus: "connected" | "pending_vault" | "sandbox_ready";
  feeStructure: string;
  isPrimaryForMarket: boolean;
}

// ----------------------------------------------------------------------
// Status Badges & Styling Helpers
// ----------------------------------------------------------------------

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  succeeded: {
    label: "Succeeded",
    bg: "bg-emerald-950/70",
    text: "text-emerald-400",
    border: "border-emerald-800",
  },
  authorized: {
    label: "Authorized",
    bg: "bg-blue-950/70",
    text: "text-blue-400",
    border: "border-blue-800",
  },
  pending: {
    label: "Pending",
    bg: "bg-amber-950/70",
    text: "text-amber-400",
    border: "border-amber-800",
  },
  failed: {
    label: "Failed",
    bg: "bg-rose-950/70",
    text: "text-rose-400",
    border: "border-rose-800",
  },
  partially_refunded: {
    label: "Partially Refunded",
    bg: "bg-purple-950/70",
    text: "text-purple-400",
    border: "border-purple-800",
  },
  refunded: {
    label: "Refunded",
    bg: "bg-purple-950/70",
    text: "text-purple-400",
    border: "border-purple-800",
  },
  disputed: {
    label: "Disputed",
    bg: "bg-red-950/80",
    text: "text-red-400",
    border: "border-red-800",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-zinc-900/80",
    text: "text-zinc-500",
    border: "border-zinc-800",
  },
};

export const PROVIDER_CONFIGS: ProviderCapabilityConfig[] = [
  {
    code: "razorpay",
    name: "Razorpay",
    category: "India & APAC Payments",
    targetMarket: "India / APAC (INR, Multi-Currency)",
    supportedCurrencies: ["INR", "USD", "EUR", "SGD", "AED", "GBP"],
    supportedRails: ["UPI Collect", "UPI Intent", "Dynamic QR", "Cards", "NetBanking", "eNACH"],
    credentialStatus: "sandbox_ready",
    feeStructure: "2.0% + GST per transaction",
    isPrimaryForMarket: true,
  },
  {
    code: "stripe",
    name: "Stripe",
    category: "Global Cards & Subscriptions",
    targetMarket: "US / EU / Global (135+ Currencies)",
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
    supportedRails: ["Cards (Visa/MC/Amex)", "Apple Pay", "Google Pay", "SEPA", "ACH Direct Debit"],
    credentialStatus: "connected",
    feeStructure: "2.9% + $0.30 per transaction",
    isPrimaryForMarket: true,
  },
  {
    code: "hitpay",
    name: "HitPay",
    category: "Southeast Asia PayNow & Local Rails",
    targetMarket: "Singapore / Malaysia / Southeast Asia",
    supportedCurrencies: ["SGD", "MYR", "USD", "AUD"],
    supportedRails: ["PayNow QR", "GrabPay", "ShopeePay", "FPX", "Cards"],
    credentialStatus: "sandbox_ready",
    feeStructure: "0.95% + S$0.30 (PayNow)",
    isPrimaryForMarket: true,
  },
  {
    code: "airwallex",
    name: "Airwallex",
    category: "Cross-Border FX & Virtual Accounts",
    targetMarket: "Global B2B & Foreign Exchange Clearing",
    supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD", "HKD", "SGD", "JPY", "CNY"],
    supportedRails: ["Global Virtual Accounts", "Local Clearing (ACH/FedNow/SEPA)", "SWIFT Wire", "FX Conversion"],
    credentialStatus: "sandbox_ready",
    feeStructure: "0.3% FX markup, zero inbound fee",
    isPrimaryForMarket: true,
  },
  {
    code: "cashfree",
    name: "Cashfree",
    category: "Instant UPI & Auto-Debit Engine",
    targetMarket: "India High-Velocity Payouts & Recurring UPI",
    supportedCurrencies: ["INR", "USD"],
    supportedRails: ["Instant UPI 2.0 AutoPay", "Card Tokenization", "IMPS/NEFT Payouts"],
    credentialStatus: "sandbox_ready",
    feeStructure: "1.90% per successful payment",
    isPrimaryForMarket: false,
  },
];

// ----------------------------------------------------------------------
// Initial Mock Datasets
// ----------------------------------------------------------------------

export const INITIAL_TRANSACTIONS: PaymentTransactionItem[] = [
  {
    id: "tx-001",
    transactionNumber: "TXN-2026-8842",
    customerId: "cust-001",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@acmeglobal.com",
    companyName: "Acme Global Industries",
    amount: 45000.0,
    currency: "USD",
    feeAmount: 1305.0,
    netAmount: 43695.0,
    provider: "stripe",
    providerTransactionId: "ch_3N84kL2eZvKYlo2C1g7r0B9y",
    providerOrderId: "ord_stripe_9941",
    status: "succeeded",
    paymentMethod: "card",
    paymentMethodDetails: { brand: "Visa", last4: "4242" },
    allocatedAmount: 45000.0,
    unallocatedAmount: 0.0,
    settledAt: "2026-09-10T14:32:00Z",
    createdAt: "2026-09-10T14:30:00Z",
    description: "Annual Enterprise License & AI Telephony Settled",
    reconciliationState: "auto_matched",
  },
  {
    id: "tx-002",
    transactionNumber: "TXN-2026-8843",
    customerId: "cust-002",
    customerName: "Michael Rodriguez",
    customerEmail: "m.rodriguez@cyberdyne.io",
    companyName: "CyberDyne Systems",
    amount: 10000.0,
    currency: "USD",
    feeAmount: 290.0,
    netAmount: 9710.0,
    provider: "stripe",
    providerTransactionId: "ch_3N92uM4eXwPZki8B3h1r9C2e",
    providerOrderId: "ord_stripe_9942",
    status: "succeeded",
    paymentMethod: "card",
    paymentMethodDetails: { brand: "Mastercard", last4: "8891" },
    allocatedAmount: 10000.0,
    unallocatedAmount: 0.0,
    settledAt: "2026-09-02T16:05:00Z",
    createdAt: "2026-09-02T16:04:00Z",
    description: "Milestone 1 Custom OCR Pipeline Deposit",
    reconciliationState: "auto_matched",
  },
  {
    id: "tx-003",
    transactionNumber: "TXN-2026-8844",
    customerId: "cust-007",
    customerName: "Vikram Malhotra",
    customerEmail: "v.malhotra@tata-enterprise.in",
    companyName: "Tata Enterprise Solutions",
    amount: 750000.0,
    currency: "INR",
    feeAmount: 15000.0,
    netAmount: 735000.0,
    provider: "razorpay",
    providerTransactionId: "pay_N8429108429",
    providerOrderId: "order_rzp_99182",
    status: "succeeded",
    paymentMethod: "upi_intent",
    paymentMethodDetails: { upiVpa: "tata.corp@icici", bankName: "ICICI Bank" },
    allocatedAmount: 750000.0,
    unallocatedAmount: 0.0,
    settledAt: "2026-09-20T11:20:00Z",
    createdAt: "2026-09-20T11:18:00Z",
    description: "APAC Enterprise Speech Engine Annual Subscription",
    reconciliationState: "settled_to_ledger",
  },
  {
    id: "tx-004",
    transactionNumber: "TXN-2026-8845",
    customerId: "cust-008",
    customerName: "Wei Ling Tan",
    customerEmail: "wltan@singaporetelecom.sg",
    companyName: "SingaTel Corporate",
    amount: 14500.0,
    currency: "SGD",
    feeAmount: 137.75,
    netAmount: 14362.25,
    provider: "hitpay",
    providerTransactionId: "hp_pay_884920",
    providerOrderId: "hp_ord_7719",
    status: "succeeded",
    paymentMethod: "paynow_qr",
    paymentMethodDetails: { bankName: "DBS PayNow Corporate QR" },
    allocatedAmount: 14500.0,
    unallocatedAmount: 0.0,
    settledAt: "2026-09-18T09:40:00Z",
    createdAt: "2026-09-18T09:35:00Z",
    description: "Southeast Asia Regional SIP Trunking Core",
    reconciliationState: "auto_matched",
  },
  {
    id: "tx-005",
    transactionNumber: "TXN-2026-8846",
    customerId: "cust-009",
    customerName: "Hans Zimmer",
    customerEmail: "hzimmer@bavaria-motors.de",
    companyName: "Bavaria Automotive AG",
    amount: 28000.0,
    currency: "EUR",
    feeAmount: 84.0,
    netAmount: 27916.0,
    provider: "airwallex",
    providerTransactionId: "awx_tx_881920",
    providerOrderId: "awx_ord_5521",
    status: "succeeded",
    paymentMethod: "bank_transfer",
    paymentMethodDetails: { bankName: "SEPA Clearing Virtual IBAN DE89..." },
    allocatedAmount: 28000.0,
    unallocatedAmount: 0.0,
    settledAt: "2026-09-15T15:00:00Z",
    createdAt: "2026-09-15T14:45:00Z",
    description: "European Telephony & Omnichannel WhatsApp Suite",
    reconciliationState: "manual_matched",
  },
  {
    id: "tx-006",
    transactionNumber: "TXN-2026-8847",
    customerId: "cust-004",
    customerName: "Jessica Wong",
    customerEmail: "jwong@omnicorplogistics.com",
    companyName: "OmniCorp Logistics",
    amount: 32100.0,
    currency: "USD",
    feeAmount: 0.0,
    netAmount: 0.0,
    provider: "stripe",
    status: "failed",
    paymentMethod: "card",
    paymentMethodDetails: { brand: "Visa", last4: "1109" },
    allocatedAmount: 0.0,
    unallocatedAmount: 0.0,
    createdAt: "2026-09-02T10:00:00Z",
    description: "Automated Monthly Billing Collection Attempt",
    reconciliationState: "unreconciled",
  },
];

export const INITIAL_ALLOCATIONS: PaymentAllocationItem[] = [
  {
    id: "alloc-001",
    paymentId: "tx-001",
    paymentNumber: "TXN-2026-8842",
    invoiceId: "inv-001",
    invoiceNumber: "INV-2026-0041",
    customerName: "Sarah Jenkins",
    companyName: "Acme Global Industries",
    allocatedAmount: 45000.0,
    invoiceTotal: 45000.0,
    invoiceRemainingBalance: 0.0,
    currency: "USD",
    status: "settled",
    allocatedAt: "2026-09-10T14:32:00Z",
  },
  {
    id: "alloc-002",
    paymentId: "tx-002",
    paymentNumber: "TXN-2026-8843",
    invoiceId: "inv-002",
    invoiceNumber: "INV-2026-0042",
    customerName: "Michael Rodriguez",
    companyName: "CyberDyne Systems",
    allocatedAmount: 10000.0,
    invoiceTotal: 18750.0,
    invoiceRemainingBalance: 8750.0,
    currency: "USD",
    status: "partially_paid",
    allocatedAt: "2026-09-02T16:05:00Z",
  },
];

export const INITIAL_PAYMENT_LINKS: PaymentLinkItem[] = [
  {
    id: "plink-001",
    linkToken: "plk_88429104",
    slug: "nexus-acme-sep2026",
    title: "Acme Global Q3 Add-on License",
    description: "Hosted payment link for Q3 seats expansion and WhatsApp bridge.",
    amount: 5500.0,
    currency: "USD",
    customerId: "cust-001",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@acmeglobal.com",
    companyName: "Acme Global Industries",
    status: "active",
    allowedProviders: ["stripe", "airwallex"],
    hostedUrl: "https://pay.nexuscorp.io/l/nexus-acme-sep2026",
    qrPayload: "https://pay.nexuscorp.io/l/nexus-acme-sep2026",
    expiresAt: "2026-10-15T23:59:59Z",
    viewsCount: 14,
    createdAt: "2026-09-20T10:00:00Z",
  },
  {
    id: "plink-002",
    linkToken: "plk_77192044",
    slug: "nexus-tata-india-q3",
    title: "Tata Enterprise High-Speed SIP Trunking",
    description: "Instant UPI & NetBanking checkout for APAC Telephony Core.",
    amount: 350000.0,
    currency: "INR",
    customerId: "cust-007",
    customerName: "Vikram Malhotra",
    customerEmail: "v.malhotra@tata-enterprise.in",
    companyName: "Tata Enterprise Solutions",
    status: "active",
    allowedProviders: ["razorpay", "cashfree"],
    hostedUrl: "https://pay.nexuscorp.io/l/nexus-tata-india-q3",
    qrPayload: "upi://pay?pa=nexuscorp@icici&pn=NexusEnterprise&am=350000.00&cu=INR",
    expiresAt: "2026-10-05T23:59:59Z",
    viewsCount: 28,
    createdAt: "2026-09-18T14:30:00Z",
  },
  {
    id: "plink-003",
    linkToken: "plk_99182341",
    slug: "nexus-singatel-paynow",
    title: "SingaTel Southeast Asia Add-on Nodes",
    description: "PayNow QR instant SG checkout.",
    amount: 4200.0,
    currency: "SGD",
    customerId: "cust-008",
    customerName: "Wei Ling Tan",
    customerEmail: "wltan@singaporetelecom.sg",
    companyName: "SingaTel Corporate",
    status: "completed",
    allowedProviders: ["hitpay"],
    hostedUrl: "https://pay.nexuscorp.io/l/nexus-singatel-paynow",
    qrPayload: "00020101021226500009SG.PAYNOW010120210202619202025204000053037025404200.005802SG",
    expiresAt: "2026-09-25T23:59:59Z",
    completedAt: "2026-09-18T09:40:00Z",
    viewsCount: 6,
    createdAt: "2026-09-17T08:00:00Z",
  },
];

export const INITIAL_ATTEMPTS: PaymentAttemptItem[] = [
  {
    id: "att-001",
    paymentNumber: "TXN-2026-8847",
    customerName: "Jessica Wong",
    companyName: "OmniCorp Logistics",
    provider: "stripe",
    attemptNumber: 1,
    status: "declined",
    amount: 32100.0,
    currency: "USD",
    gatewayResponseCode: "card_declined",
    declineCode: "do_not_honor",
    declineReason: "The customer's bank declined the charge. Reason: do_not_honor.",
    errorCategory: "do_not_honor",
    latencyMs: 340,
    retryCount: 2,
    maxRetries: 3,
    nextFallbackProvider: "airwallex",
    timestamp: "2026-09-02T10:00:00Z",
  },
  {
    id: "att-002",
    paymentNumber: "TXN-2026-8848",
    customerName: "Arthur Pendelton",
    companyName: "BlueSky Research Labs",
    provider: "stripe",
    attemptNumber: 1,
    status: "failed",
    amount: 14000.0,
    currency: "USD",
    gatewayResponseCode: "insufficient_funds",
    declineCode: "insufficient_funds",
    declineReason: "Insufficient credit balance available on card.",
    errorCategory: "insufficient_funds",
    latencyMs: 410,
    retryCount: 1,
    maxRetries: 3,
    nextFallbackProvider: "manual_wire",
    timestamp: "2026-08-20T10:01:00Z",
  },
];

export const INITIAL_RECONCILIATION: ReconciliationItem[] = [
  {
    id: "recon-001",
    payoutBatchId: "po_stripe_20260911_881",
    provider: "stripe",
    bankStatementReference: "SVB-ACH-CR-9948201",
    status: "auto_matched",
    expectedAmount: 53405.0,
    clearedAmount: 53405.0,
    differenceAmount: 0.0,
    currency: "USD",
    transactionsCount: 2,
    matchedAt: "2026-09-11T04:00:00Z",
    matchedBy: "Automated Bank Feed Matcher",
    createdAt: "2026-09-10T23:59:59Z",
  },
  {
    id: "recon-002",
    payoutBatchId: "po_rzp_20260921_992",
    provider: "razorpay",
    bankStatementReference: "ICICI-NODAL-NEFT-884102",
    status: "settled_to_ledger",
    expectedAmount: 735000.0,
    clearedAmount: 735000.0,
    differenceAmount: 0.0,
    currency: "INR",
    transactionsCount: 1,
    matchedAt: "2026-09-21T06:30:00Z",
    matchedBy: "Elena Rostova (CFO)",
    createdAt: "2026-09-20T23:59:59Z",
  },
  {
    id: "recon-003",
    payoutBatchId: "po_hitpay_20260919_441",
    provider: "hitpay",
    bankStatementReference: "DBS-FAST-CR-7729104",
    status: "manual_matched",
    expectedAmount: 14362.25,
    clearedAmount: 14362.25,
    differenceAmount: 0.0,
    currency: "SGD",
    transactionsCount: 1,
    matchedAt: "2026-09-19T10:15:00Z",
    matchedBy: "Finance Auditor",
    createdAt: "2026-09-18T23:59:59Z",
  },
];
