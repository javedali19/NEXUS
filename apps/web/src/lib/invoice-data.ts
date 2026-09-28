export type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type DiscountType = "percentage" | "fixed";

export interface InvoiceItem {
  id: string;
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number; // e.g. 0.08 for 8%
  lineTotal: number;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: "stripe_credit_card" | "bank_wire" | "ach_transfer" | "check" | "cash";
  transactionReference: string;
  status: "succeeded" | "pending" | "failed";
  settledAt: string;
  recordedBy: string;
  notes?: string;
}

export interface InvoiceTimelineEvent {
  id: string;
  eventType:
    | "created"
    | "issued"
    | "sent"
    | "opened"
    | "payment_recorded"
    | "partial_payment"
    | "overdue_escalated"
    | "collection_reminder"
    | "edited"
    | "cancelled";
  title: string;
  description: string;
  actorName: string;
  occurredAt: string;
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  status: InvoiceStatus;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  
  // Financial calculation breakdown
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;

  paymentTerms: string;
  notes?: string;
  termsConditions?: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  items: InvoiceItem[];
  payments: InvoicePayment[];
  timeline: InvoiceTimelineEvent[];

  // Connected Module Links
  customer360Id: string;
  contractId?: string;
  dealId?: string;
  documentPdfUrl?: string;
  collectionStage?: "current" | "courtesy_reminder" | "warning_notice" | "final_demand" | "legal";
  outboxEventsEmitted: number;
}

// ----------------------------------------------------------------------
// Calculation Helpers
// ----------------------------------------------------------------------

export function calculateInvoiceTotals(
  items: Array<Omit<InvoiceItem, "id" | "lineTotal"> & { id?: string }>,
  taxRate: number,
  discountType: DiscountType,
  discountValue: number,
  amountPaid: number = 0
) {
  let subtotal = 0;
  const computedItems: InvoiceItem[] = items.map((item, idx) => {
    const qty = item.quantity <= 0 ? 1 : item.quantity;
    const basePrice = qty * item.unitPrice;
    const lineDiscPct = Math.min(100, Math.max(0, item.discountPercent || 0));
    const lineDisc = basePrice * (lineDiscPct / 100);
    const lineSubtotal = Math.max(0, basePrice - lineDisc);
    const lineTaxRate = item.taxRate || 0;
    const lineTax = lineSubtotal * lineTaxRate;
    const lineTotal = Math.round((lineSubtotal + lineTax) * 100) / 100;

    subtotal += lineSubtotal;

    return {
      id: item.id || `item-${Date.now()}-${idx}`,
      itemCode: item.itemCode || `SKU-${idx + 1}`,
      description: item.description || "Service Item",
      quantity: qty,
      unitPrice: item.unitPrice,
      discountPercent: lineDiscPct,
      taxRate: lineTaxRate,
      lineTotal,
    };
  });

  const discVal = Math.max(0, discountValue || 0);
  let discountAmount = 0;
  if (discountType === "percentage") {
    const pct = Math.min(100, discVal);
    discountAmount = subtotal * (pct / 100);
  } else {
    discountAmount = Math.min(subtotal, discVal);
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableBase * Math.max(0, taxRate);
  const totalAmount = Math.round((taxableBase + taxAmount) * 100) / 100;
  const balanceDue = Math.max(0, Math.round((totalAmount - amountPaid) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount,
    balanceDue,
    computedItems,
  };
}

export const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; border: string; badgeVariant: string }
> = {
  draft: {
    label: "Draft",
    bg: "bg-slate-800/80",
    text: "text-slate-300",
    border: "border-slate-700",
    badgeVariant: "secondary",
  },
  issued: {
    label: "Issued",
    bg: "bg-blue-950/70",
    text: "text-blue-400",
    border: "border-blue-800",
    badgeVariant: "info",
  },
  sent: {
    label: "Sent",
    bg: "bg-indigo-950/70",
    text: "text-indigo-400",
    border: "border-indigo-800",
    badgeVariant: "primary",
  },
  partially_paid: {
    label: "Partially Paid",
    bg: "bg-amber-950/70",
    text: "text-amber-400",
    border: "border-amber-800",
    badgeVariant: "warning",
  },
  paid: {
    label: "Paid",
    bg: "bg-emerald-950/70",
    text: "text-emerald-400",
    border: "border-emerald-800",
    badgeVariant: "success",
  },
  overdue: {
    label: "Overdue",
    bg: "bg-rose-950/70",
    text: "text-rose-400",
    border: "border-rose-800",
    badgeVariant: "destructive",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-zinc-900/80",
    text: "text-zinc-500",
    border: "border-zinc-800",
    badgeVariant: "outline",
  },
};

// ----------------------------------------------------------------------
// Initial Mock Invoices Dataset
// ----------------------------------------------------------------------

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2026-0041",
    customerId: "cust-001",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@acmeglobal.com",
    companyName: "Acme Global Industries",
    status: "paid",
    currency: "USD",
    issueDate: "2026-08-15",
    dueDate: "2026-09-15",
    paidAt: "2026-09-10T14:32:00Z",
    subtotal: 42000.0,
    taxRate: 0.08,
    taxAmount: 3360.0,
    discountType: "fixed",
    discountValue: 360.0,
    discountAmount: 360.0,
    totalAmount: 45000.0,
    amountPaid: 45000.0,
    balanceDue: 0.0,
    paymentTerms: "Net 30",
    notes: "Annual enterprise platform license with 24/7 dedicated support SLA.",
    termsConditions: "Payment terms Net 30 days. Standard master service agreement applies.",
    billingAddress: {
      street: "100 Innovation Way, Suite 400",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
    },
    items: [
      {
        id: "item-101",
        itemCode: "ERP-ENTERPRISE",
        description: "Nexus Enterprise ERP + CRM Cloud Platform (Annual 50-Seat Tier)",
        quantity: 1,
        unitPrice: 35000.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 37800.0,
      },
      {
        id: "item-102",
        itemCode: "AI-TELEPHONY-ADDON",
        description: "AI Autonomous Voice Telephony & Speech-to-Text Package (100k Mins)",
        quantity: 1,
        unitPrice: 7000.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 7560.0,
      },
    ],
    payments: [
      {
        id: "pay-101",
        amount: 45000.0,
        currency: "USD",
        paymentMethod: "bank_wire",
        transactionReference: "WIRE-FED-20260910-8842",
        status: "succeeded",
        settledAt: "2026-09-10T14:32:00Z",
        recordedBy: "Finance Ops (Automated Reconciler)",
        notes: "Full settlement posted via ACH/Wire reconciliation gateway.",
      },
    ],
    timeline: [
      {
        id: "time-1",
        eventType: "created",
        title: "Invoice Draft Created",
        description: "Created by Finance Director Elena Rostova from Won Deal DL-8402.",
        actorName: "Elena Rostova",
        occurredAt: "2026-08-15T09:00:00Z",
      },
      {
        id: "time-2",
        eventType: "issued",
        title: "Invoice Issued & Locked",
        description: "Invoice status updated to Issued. Event invoice.issued.v1 written to Outbox.",
        actorName: "Elena Rostova",
        occurredAt: "2026-08-15T09:15:00Z",
      },
      {
        id: "time-3",
        eventType: "sent",
        title: "Dispatched to Customer",
        description: "Sent via Secure Email to s.jenkins@acmeglobal.com with payment link.",
        actorName: "Outbox Dispatcher",
        occurredAt: "2026-08-15T09:16:00Z",
      },
      {
        id: "time-4",
        eventType: "opened",
        title: "Customer Viewed Invoice",
        description: "Client portal token accessed from IP 64.233.160.1 (San Francisco, CA).",
        actorName: "Customer Portal",
        occurredAt: "2026-08-16T11:42:00Z",
      },
      {
        id: "time-5",
        eventType: "payment_recorded",
        title: "Payment Settled ($45,000.00)",
        description: "Wire transfer reference WIRE-FED-20260910-8842 received and cleared.",
        actorName: "Stripe/Bank Gateway",
        occurredAt: "2026-09-10T14:32:00Z",
      },
    ],
    customer360Id: "cust-001",
    dealId: "DL-8402",
    collectionStage: "current",
    outboxEventsEmitted: 4,
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2026-0042",
    customerId: "cust-002",
    customerName: "Michael Rodriguez",
    customerEmail: "m.rodriguez@cyberdyne.io",
    companyName: "CyberDyne Systems",
    status: "partially_paid",
    currency: "USD",
    issueDate: "2026-09-01",
    dueDate: "2026-10-01",
    subtotal: 17500.0,
    taxRate: 0.08,
    taxAmount: 1400.0,
    discountType: "fixed",
    discountValue: 150.0,
    discountAmount: 150.0,
    totalAmount: 18750.0,
    amountPaid: 10000.0,
    balanceDue: 8750.0,
    paymentTerms: "Net 30",
    notes: "Custom OCR document processing engine deployment & model tuning.",
    termsConditions: "50% upfront deposit on milestone completion, balance on final delivery.",
    billingAddress: {
      street: "500 Cybernetic Park, Bldg 3",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "USA",
    },
    items: [
      {
        id: "item-201",
        itemCode: "OCR-CUSTOM-ENG",
        description: "Custom Multimodal OCR Pipeline with Vision Extractors",
        quantity: 1,
        unitPrice: 12500.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 13500.0,
      },
      {
        id: "item-202",
        itemCode: "DEV-CONSULTING",
        description: "Specialized Integration Engineering (25 Hours @ $200/hr)",
        quantity: 25,
        unitPrice: 200.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 5400.0,
      },
    ],
    payments: [
      {
        id: "pay-201",
        amount: 10000.0,
        currency: "USD",
        paymentMethod: "stripe_credit_card",
        transactionReference: "ch_3N84kL2eZvKYlo2C1g7r0B9y",
        status: "succeeded",
        settledAt: "2026-09-02T16:05:00Z",
        recordedBy: "Stripe Webhook Listener",
        notes: "Milestone 1 initial deposit paid via corporate credit card.",
      },
    ],
    timeline: [
      {
        id: "time-201",
        eventType: "created",
        title: "Invoice Created",
        description: "Created for CyberDyne Systems milestone agreement.",
        actorName: "Sarah Connor (Account Exec)",
        occurredAt: "2026-09-01T10:00:00Z",
      },
      {
        id: "time-202",
        eventType: "issued",
        title: "Issued to Client",
        description: "Approved by Billing Operations and issued.",
        actorName: "Billing System",
        occurredAt: "2026-09-01T10:30:00Z",
      },
      {
        id: "time-203",
        eventType: "sent",
        title: "Sent via Email & WhatsApp",
        description: "Dispatched with instant payment checkout link.",
        actorName: "Notification Service",
        occurredAt: "2026-09-01T10:32:00Z",
      },
      {
        id: "time-204",
        eventType: "partial_payment",
        title: "Partial Payment of $10,000.00 Received",
        description: "Stripe charge ch_3N84kL2eZvKYlo2C1g7r0B9y captured. Balance remaining: $8,750.00.",
        actorName: "Stripe Connector",
        occurredAt: "2026-09-02T16:05:00Z",
      },
    ],
    customer360Id: "cust-002",
    dealId: "DL-8419",
    collectionStage: "current",
    outboxEventsEmitted: 4,
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2026-0043",
    customerId: "cust-003",
    customerName: "David Sterling",
    customerEmail: "d.sterling@nexusdynamics.co",
    companyName: "Nexus Dynamics Group",
    status: "sent",
    currency: "USD",
    issueDate: "2026-09-12",
    dueDate: "2026-09-27",
    subtotal: 11500.0,
    taxRate: 0.08,
    taxAmount: 920.0,
    discountType: "fixed",
    discountValue: 20.0,
    discountAmount: 20.0,
    totalAmount: 12400.0,
    amountPaid: 0.0,
    balanceDue: 12400.0,
    paymentTerms: "Net 15",
    notes: "Q3 Multi-Tenant Voice SIP Trunking & WhatsApp Enterprise Bridge.",
    termsConditions: "Net 15 days from issue date. Late fees of 1.5% apply after maturity.",
    billingAddress: {
      street: "742 Evergreen Terrace",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      country: "USA",
    },
    items: [
      {
        id: "item-301",
        itemCode: "VOICE-SIP-Q3",
        description: "High-Throughput Global SIP Trunking Core (150 Concurrent Channels)",
        quantity: 1,
        unitPrice: 8500.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 9180.0,
      },
      {
        id: "item-302",
        itemCode: "WHATSAPP-CONN",
        description: "Meta WhatsApp Business Verified API Connector (Unlimited Sessions)",
        quantity: 1,
        unitPrice: 3000.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 3240.0,
      },
    ],
    payments: [],
    timeline: [
      {
        id: "time-301",
        eventType: "created",
        title: "Invoice Generated",
        description: "Recurring contract auto-billing generated by ERP Scheduler.",
        actorName: "ERP Scheduler",
        occurredAt: "2026-09-12T00:00:00Z",
      },
      {
        id: "time-302",
        eventType: "issued",
        title: "Invoice Issued",
        description: "Verified against usage metering tables.",
        actorName: "Billing System",
        occurredAt: "2026-09-12T01:00:00Z",
      },
      {
        id: "time-303",
        eventType: "sent",
        title: "Sent to Billing Contact",
        description: "Emailed to d.sterling@nexusdynamics.co.",
        actorName: "Email Service",
        occurredAt: "2026-09-12T01:05:00Z",
      },
    ],
    customer360Id: "cust-003",
    collectionStage: "current",
    outboxEventsEmitted: 3,
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2026-0044",
    customerId: "cust-004",
    customerName: "Jessica Wong",
    customerEmail: "jwong@omnicorplogistics.com",
    companyName: "OmniCorp Logistics",
    status: "overdue",
    currency: "USD",
    issueDate: "2026-08-01",
    dueDate: "2026-09-01",
    subtotal: 30000.0,
    taxRate: 0.07,
    taxAmount: 2100.0,
    discountType: "percentage",
    discountValue: 0.0,
    discountAmount: 0.0,
    totalAmount: 32100.0,
    amountPaid: 0.0,
    balanceDue: 32100.0,
    paymentTerms: "Net 30",
    notes: "Automated Dispatch Routing & AI Predictive Fleet Logistics Modules.",
    termsConditions: "Overdue accounts subject to service suspension after 30 days past due.",
    billingAddress: {
      street: "88 Logistics Boulevard, Terminal 5",
      city: "Chicago",
      state: "IL",
      postalCode: "60601",
      country: "USA",
    },
    items: [
      {
        id: "item-401",
        itemCode: "FLEET-AI-SUITE",
        description: "Predictive Routing & Fleet Dispatch Orchestrator",
        quantity: 1,
        unitPrice: 22000.0,
        discountPercent: 0,
        taxRate: 0.07,
        lineTotal: 23540.0,
      },
      {
        id: "item-402",
        itemCode: "SLA-GOLD",
        description: "Gold Priority 99.99% Availability & Disaster Recovery Hot Standby",
        quantity: 1,
        unitPrice: 8000.0,
        discountPercent: 0,
        taxRate: 0.07,
        lineTotal: 8560.0,
      },
    ],
    payments: [],
    timeline: [
      {
        id: "time-401",
        eventType: "created",
        title: "Invoice Created",
        description: "Generated from Quote QT-9902.",
        actorName: "ERP System",
        occurredAt: "2026-08-01T08:00:00Z",
      },
      {
        id: "time-402",
        eventType: "sent",
        title: "Sent to Jessica Wong",
        description: "Delivered via email.",
        actorName: "Dispatcher",
        occurredAt: "2026-08-01T08:30:00Z",
      },
      {
        id: "time-403",
        eventType: "overdue_escalated",
        title: "Overdue Triggered (Maturity Passed)",
        description: "Due date 2026-09-01 elapsed without payment. Status transitioned to Overdue.",
        actorName: "Collections Engine",
        occurredAt: "2026-09-02T00:00:00Z",
      },
      {
        id: "time-404",
        eventType: "collection_reminder",
        title: "Automated Dunning Notice #2 Dispatched",
        description: "Sent gentle AI reminder call & email reminder.",
        actorName: "AI Collections Agent",
        occurredAt: "2026-09-15T10:00:00Z",
      },
    ],
    customer360Id: "cust-004",
    collectionStage: "warning_notice",
    outboxEventsEmitted: 4,
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2026-0045",
    customerId: "cust-005",
    customerName: "Dr. Jonathan Stark",
    customerEmail: "jstark@starkbiotech.org",
    companyName: "Stark BioTech Laboratories",
    status: "issued",
    currency: "USD",
    issueDate: "2026-09-18",
    dueDate: "2026-10-18",
    subtotal: 8500.0,
    taxRate: 0.05,
    taxAmount: 425.0,
    discountType: "fixed",
    discountValue: 25.0,
    discountAmount: 25.0,
    totalAmount: 8900.0,
    amountPaid: 0.0,
    balanceDue: 8900.0,
    paymentTerms: "Net 30",
    notes: "HIPAA Compliant Document Intelligence & OCR Extraction Connector.",
    termsConditions: "Strict medical compliance guidelines and confidentiality clauses active.",
    billingAddress: {
      street: "1200 Bio-Research Parkway",
      city: "Boston",
      state: "MA",
      postalCode: "02115",
      country: "USA",
    },
    items: [
      {
        id: "item-501",
        itemCode: "HIPAA-OCR-MED",
        description: "Medical Records OCR with PII/PHI Redaction Guarantee",
        quantity: 1,
        unitPrice: 8500.0,
        discountPercent: 0,
        taxRate: 0.05,
        lineTotal: 8925.0,
      },
    ],
    payments: [],
    timeline: [
      {
        id: "time-501",
        eventType: "created",
        title: "Draft Created",
        description: "Created by Marcus Vance.",
        actorName: "Marcus Vance",
        occurredAt: "2026-09-18T14:00:00Z",
      },
      {
        id: "time-502",
        eventType: "issued",
        title: "Invoice Issued & Approved",
        description: "Finance review passed. Ready for distribution.",
        actorName: "Elena Rostova",
        occurredAt: "2026-09-18T15:30:00Z",
      },
    ],
    customer360Id: "cust-005",
    collectionStage: "current",
    outboxEventsEmitted: 2,
  },
  {
    id: "inv-006",
    invoiceNumber: "INV-2026-0046",
    customerId: "cust-001",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@acmeglobal.com",
    companyName: "Acme Global Industries",
    status: "draft",
    currency: "USD",
    issueDate: "2026-09-22",
    dueDate: "2026-10-22",
    subtotal: 5200.0,
    taxRate: 0.08,
    taxAmount: 416.0,
    discountType: "fixed",
    discountValue: 116.0,
    discountAmount: 116.0,
    totalAmount: 5500.0,
    amountPaid: 0.0,
    balanceDue: 5500.0,
    paymentTerms: "Net 30",
    notes: "Custom dashboard analytics report templates and webhook streaming pipe.",
    termsConditions: "Draft document - subject to internal review before formal issuance.",
    billingAddress: {
      street: "100 Innovation Way, Suite 400",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
    },
    items: [
      {
        id: "item-601",
        itemCode: "REPORT-TEMPLATES",
        description: "Executive Multi-Tenant KPI Dashboard Pack",
        quantity: 1,
        unitPrice: 3200.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 3456.0,
      },
      {
        id: "item-602",
        itemCode: "STREAM-PIPE",
        description: "Low-Latency Kafka / GCP PubSub Event Ingestion Stream",
        quantity: 1,
        unitPrice: 2000.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 2160.0,
      },
    ],
    payments: [],
    timeline: [
      {
        id: "time-601",
        eventType: "created",
        title: "Draft Created in Workspace",
        description: "Work in progress draft.",
        actorName: "System Admin",
        occurredAt: "2026-09-22T08:00:00Z",
      },
    ],
    customer360Id: "cust-001",
    collectionStage: "current",
    outboxEventsEmitted: 1,
  },
  {
    id: "inv-007",
    invoiceNumber: "INV-2026-0047",
    customerId: "cust-006",
    customerName: "Arthur Pendelton",
    customerEmail: "apendelton@blueskylabs.net",
    companyName: "BlueSky Research Labs",
    status: "cancelled",
    currency: "USD",
    issueDate: "2026-08-20",
    dueDate: "2026-09-20",
    subtotal: 13000.0,
    taxRate: 0.08,
    taxAmount: 1040.0,
    discountType: "fixed",
    discountValue: 40.0,
    discountAmount: 40.0,
    totalAmount: 14000.0,
    amountPaid: 0.0,
    balanceDue: 0.0,
    paymentTerms: "Net 30",
    notes: "Cancelled due to contract renegotiation into multi-year enterprise agreement.",
    termsConditions: "VOID - Superseded by Enterprise Contract MSA-2026-8812.",
    billingAddress: {
      street: "300 Cloud Way",
      city: "Denver",
      state: "CO",
      postalCode: "80202",
      country: "USA",
    },
    items: [
      {
        id: "item-701",
        itemCode: "CLOUD-RESOURCES",
        description: "Dedicated Multi-Region AI Inference Cluster (Monthly)",
        quantity: 1,
        unitPrice: 13000.0,
        discountPercent: 0,
        taxRate: 0.08,
        lineTotal: 14040.0,
      },
    ],
    payments: [],
    timeline: [
      {
        id: "time-701",
        eventType: "created",
        title: "Invoice Created",
        description: "Initial monthly invoice generated.",
        actorName: "ERP Engine",
        occurredAt: "2026-08-20T10:00:00Z",
      },
      {
        id: "time-702",
        eventType: "cancelled",
        title: "Invoice Cancelled & Voided",
        description: "Voided by CFO request - replaced by annual multi-year contract.",
        actorName: "Elena Rostova",
        occurredAt: "2026-08-22T14:00:00Z",
      },
    ],
    customer360Id: "cust-006",
    collectionStage: "current",
    outboxEventsEmitted: 2,
  },
];
