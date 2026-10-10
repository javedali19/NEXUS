// ============================================================================
// Support Tickets Data Model & Live State Store
// Fully connected to Customer Support, Voice Calls, Customer 360, Invoices
// ============================================================================

export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "new" | "assigned" | "in_progress" | "pending_customer" | "on_hold" | "resolved" | "closed";
export type TicketType = "general" | "billing" | "technical" | "feature_request" | "complaint" | "voice_call_followup" | "escalation";
export type TicketSourceChannel = "portal" | "voice_call" | "whatsapp" | "email" | "api" | "ai_agent";

export interface TicketComment {
  id: string;
  authorType: "agent" | "customer" | "ai_copilot" | "system";
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketActivity {
  id: string;
  activityType: "created" | "assigned" | "status_changed" | "priority_changed" | "comment_added" | "escalated" | "resolved" | "closed";
  actorType: "system" | "agent" | "customer" | "ai_agent" | "supervisor";
  actorName: string;
  details: string;
  occurredAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  ticketType: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  sourceChannel: TicketSourceChannel;
  sourceReferenceId?: string;
  // Customer Connection
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName?: string;
  // Department & Agent
  assignedDepartment: string;
  assignedAgentName: string;
  // Connected Entities across the platform
  linkedSupportCaseId?: string;
  linkedCallId?: string;
  linkedCallSid?: string;
  linkedInvoiceId?: string;
  linkedWorkflowId?: string;
  // SLA Management
  slaResponseDue: string;
  slaResolutionDue: string;
  slaStatus: "within_sla" | "at_risk" | "breached";
  tags: string[];
  comments: TicketComment[];
  activities: TicketActivity[];
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "tck-101",
    ticketNumber: "TCK-2026-1081",
    title: "Post-Call Dispute: $1,200 Promo Discount Not Applied on INV-2026-089",
    description: "Customer reported during outbound recovery voice call that agreed promotional voucher VOUCH-1200 was absent from invoice INV-2026-089. Requires credit note or ledger adjustment before payment disbursement.",
    ticketType: "billing",
    priority: "high",
    status: "in_progress",
    sourceChannel: "voice_call",
    sourceReferenceId: "CA8a91b2c3d4e5f60718293a4b5c6d7e",
    customerId: "cust-101",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@acmeglobal.com",
    customerPhone: "+1 (415) 555-2671",
    companyName: "Acme Global Solutions",
    assignedDepartment: "Billing & Collections",
    assignedAgentName: "Elena Rostova",
    linkedSupportCaseId: "case-101",
    linkedCallId: "call-101",
    linkedCallSid: "CA8a91b2c3d4e5f60718293a4b5c6d7e",
    linkedInvoiceId: "INV-2026-089",
    slaResponseDue: "1h 15m remaining",
    slaResolutionDue: "6h 40m remaining",
    slaStatus: "within_sla",
    tags: ["billing-dispute", "voice-call", "invoice-inv-2026-089", "tier-2"],
    comments: [
      {
        id: "tc-1",
        authorType: "ai_copilot",
        authorName: "Nexus Telephony AI",
        content: "Auto-generated from Call CA8a91b2c3d4e5f60718293a4b5c6d7e. Transcript highlights positive customer intent conditional upon $1,200 credit adjustment.",
        isInternal: true,
        createdAt: "Today, 10:45 AM",
      },
      {
        id: "tc-2",
        authorType: "agent",
        authorName: "Elena Rostova",
        content: "Verified voucher code VOUCH-1200 in promotions ledger. Preparing credit note for Finance Manager approval.",
        isInternal: false,
        createdAt: "Today, 11:15 AM",
      },
    ],
    activities: [
      {
        id: "ta-1",
        activityType: "created",
        actorType: "ai_agent",
        actorName: "AI Voice Telephony",
        details: "Ticket raised automatically upon call disposition 'dispute_ticket_opened'",
        occurredAt: "Today, 10:45 AM",
      },
      {
        id: "ta-2",
        activityType: "assigned",
        actorType: "system",
        actorName: "SLA Router",
        details: "Assigned to Elena Rostova (Billing & Collections)",
        occurredAt: "Today, 10:46 AM",
      },
      {
        id: "ta-3",
        activityType: "status_changed",
        actorType: "agent",
        actorName: "Elena Rostova",
        details: "Status transitioned from 'new' to 'in_progress'",
        occurredAt: "Today, 11:12 AM",
      },
    ],
    createdAt: "Today, 10:45 AM",
    updatedAt: "Today, 11:15 AM",
  },
  {
    id: "tck-102",
    ticketNumber: "TCK-2026-1082",
    title: "Technical Onboarding: 75 Mobile Field Agent Licenses Provisioning",
    description: "Enterprise expansion request for 75 field technician mobile credentials, offline database sync, and SAML SSO bridge.",
    ticketType: "technical",
    priority: "medium",
    status: "assigned",
    sourceChannel: "portal",
    sourceReferenceId: "CAS-2026-0044",
    customerId: "cust-101",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@acmeglobal.com",
    customerPhone: "+1 (415) 555-2671",
    companyName: "Acme Global Solutions",
    assignedDepartment: "Customer Engineering",
    assignedAgentName: "David Kim",
    linkedSupportCaseId: "case-103",
    slaResponseDue: "3h 20m remaining",
    slaResolutionDue: "21h remaining",
    slaStatus: "within_sla",
    tags: ["onboarding", "provisioning", "saml-sso"],
    comments: [
      {
        id: "tc-3",
        authorType: "agent",
        authorName: "David Kim",
        content: "Initiated license pool allocation. Scheduled onboarding technical call for Thursday 2 PM EST.",
        isInternal: true,
        createdAt: "Today, 12:30 PM",
      },
    ],
    activities: [
      {
        id: "ta-4",
        activityType: "created",
        actorType: "agent",
        actorName: "Elena Chen",
        details: "Ticket raised from Customer Support Console for Technical Implementation Team",
        occurredAt: "Today, 12:18 PM",
      },
    ],
    createdAt: "Today, 12:18 PM",
    updatedAt: "Today, 12:30 PM",
  },
  {
    id: "tck-103",
    ticketNumber: "TCK-2026-1083",
    title: "Voice Call Follow-up: Promise to Pay Confirmation & Partial Payment Gateway Link",
    description: "Customer agreed to pay outstanding $42,500 balance in two tranches ($21,250 today, remainder next Friday). Send SMS & WhatsApp payment link.",
    ticketType: "voice_call_followup",
    priority: "high",
    status: "new",
    sourceChannel: "voice_call",
    sourceReferenceId: "CA7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
    customerId: "cust-102",
    customerName: "Marcus Brody",
    customerEmail: "m.brody@apexlogistics.io",
    customerPhone: "+1 (212) 555-8392",
    companyName: "Apex Logistics Corp",
    assignedDepartment: "Autonomous Collections",
    assignedAgentName: "Rachel (AI Voice Agent)",
    linkedCallId: "call-102",
    linkedCallSid: "CA7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
    linkedInvoiceId: "INV-2026-074",
    slaResponseDue: "45m remaining",
    slaResolutionDue: "3h 15m remaining",
    slaStatus: "at_risk",
    tags: ["collections", "promise-to-pay", "voice-dunning"],
    comments: [],
    activities: [
      {
        id: "ta-5",
        activityType: "created",
        actorType: "ai_agent",
        actorName: "Rachel (AI Voice Agent)",
        details: "Ticket raised during inbound collections follow-up",
        occurredAt: "Today, 01:10 PM",
      },
    ],
    createdAt: "Today, 01:10 PM",
    updatedAt: "Today, 01:10 PM",
  },
  {
    id: "tck-104",
    ticketNumber: "TCK-2026-1084",
    title: "VoIP SIP Trunking: Latency Spike & Packet Loss on EMEA Regional Line",
    description: "London DID +44 20 7946 0912 experienced audio degradation and 140ms jitter during peak business hours. Requires carrier edge rerouting inspection.",
    ticketType: "technical",
    priority: "critical",
    status: "in_progress",
    sourceChannel: "voice_call",
    sourceReferenceId: "pn-3",
    customerName: "Global Infrastructure Ops",
    assignedDepartment: "Voice Network Engineering",
    assignedAgentName: "Alex Vance",
    slaResponseDue: "Passed (15m response achieved)",
    slaResolutionDue: "1h 45m remaining",
    slaStatus: "within_sla",
    tags: ["telephony", "infrastructure", "sip-trunking", "sla-critical"],
    comments: [
      {
        id: "tc-4",
        authorType: "agent",
        authorName: "Alex Vance",
        content: "Shifted SIP gateway traffic to Frankfurt fallback edge. Jitter reduced to 18ms. Monitoring ongoing sessions.",
        isInternal: true,
        createdAt: "Today, 02:05 PM",
      },
    ],
    activities: [
      {
        id: "ta-6",
        activityType: "created",
        actorType: "system",
        actorName: "Nexus Telephony Observability",
        details: "Automated ticket raised on VoIP jitter SLA breach threshold (>120ms)",
        occurredAt: "Today, 01:50 PM",
      },
      {
        id: "ta-7",
        activityType: "status_changed",
        actorType: "agent",
        actorName: "Alex Vance",
        details: "Assigned & switched status to 'in_progress'",
        occurredAt: "Today, 02:00 PM",
      },
    ],
    createdAt: "Today, 01:50 PM",
    updatedAt: "Today, 02:05 PM",
  },
  {
    id: "tck-105",
    ticketNumber: "TCK-2026-1085",
    title: "WhatsApp Catalog Ingestion Failure: SKU Sync Error Code 409",
    description: "Omnichannel inventory sync failed for 12 newly published retail products due to currency precision mismatch.",
    ticketType: "general",
    priority: "medium",
    status: "resolved",
    sourceChannel: "whatsapp",
    sourceReferenceId: "wa_sess_9941",
    customerName: "Zenith Retail",
    customerPhone: "+65 9123 4567",
    companyName: "Zenith Retail Pte Ltd",
    assignedDepartment: "Integrations & API",
    assignedAgentName: "Sophie Taylor",
    slaResponseDue: "Met",
    slaResolutionDue: "Resolved in 1h 12m",
    slaStatus: "within_sla",
    tags: ["whatsapp", "catalog", "erp-sync"],
    comments: [
      {
        id: "tc-5",
        authorType: "agent",
        authorName: "Sophie Taylor",
        content: "Fixed decimal normalization in Meta Catalog webhook adapter. All 12 SKUs are now live.",
        isInternal: false,
        createdAt: "Today, 09:12 AM",
      },
    ],
    activities: [
      {
        id: "ta-8",
        activityType: "resolved",
        actorType: "agent",
        actorName: "Sophie Taylor",
        details: "Marked as resolved with patch deployment",
        occurredAt: "Today, 09:12 AM",
      },
    ],
    createdAt: "Today, 08:00 AM",
    updatedAt: "Today, 09:12 AM",
  },
];

const LOCAL_STORAGE_KEY = "nexus_support_tickets_v1";

export function getStoredTickets(): SupportTicket[] {
  if (typeof window === "undefined") return INITIAL_TICKETS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TICKETS;
  }
}

export function saveStoredTickets(tickets: SupportTicket[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event("nexus_tickets_updated"));
  } catch (err) {
    console.error("Failed to persist tickets to localStorage", err);
  }
}

export interface CreateTicketInput {
  title: string;
  description: string;
  ticketType: TicketType;
  priority: TicketPriority;
  sourceChannel: TicketSourceChannel;
  sourceReferenceId?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName?: string;
  assignedDepartment: string;
  assignedAgentName?: string;
  linkedSupportCaseId?: string;
  linkedCallId?: string;
  linkedCallSid?: string;
  linkedInvoiceId?: string;
  tags?: string[];
  createdBy?: string;
}

export function createNewTicket(input: CreateTicketInput): SupportTicket {
  const existing = getStoredTickets();
  const nextNum = 1086 + existing.length;
  const newTicketNumber = `TCK-2026-${nextNum}`;

  const createdTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newTicket: SupportTicket = {
    id: `tck-${Date.now()}`,
    ticketNumber: newTicketNumber,
    title: input.title,
    description: input.description,
    ticketType: input.ticketType,
    priority: input.priority,
    status: "new",
    sourceChannel: input.sourceChannel,
    sourceReferenceId: input.sourceReferenceId,
    customerId: input.customerId,
    customerName: input.customerName || "Anonymous Customer",
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    companyName: input.companyName,
    assignedDepartment: input.assignedDepartment || "Customer Support",
    assignedAgentName: input.assignedAgentName || "Unassigned (Auto-Queue)",
    linkedSupportCaseId: input.linkedSupportCaseId,
    linkedCallId: input.linkedCallId,
    linkedCallSid: input.linkedCallSid,
    linkedInvoiceId: input.linkedInvoiceId,
    slaResponseDue: input.priority === "critical" ? "30m remaining" : input.priority === "high" ? "2h remaining" : "4h remaining",
    slaResolutionDue: input.priority === "critical" ? "4h remaining" : input.priority === "high" ? "12h remaining" : "24h remaining",
    slaStatus: "within_sla",
    tags: input.tags && input.tags.length > 0 ? input.tags : [input.ticketType, input.sourceChannel],
    comments: [],
    activities: [
      {
        id: `ta-${Date.now()}`,
        activityType: "created",
        actorType: input.sourceChannel === "voice_call" ? "agent" : "system",
        actorName: input.createdBy || "Agent",
        details: `Ticket raised via ${input.sourceChannel}${input.linkedCallSid ? ` from Call ${input.linkedCallSid.slice(0, 10)}...` : ""}`,
        occurredAt: `Today, ${createdTime}`,
      },
    ],
    createdAt: `Today, ${createdTime}`,
    updatedAt: `Today, ${createdTime}`,
  };

  const updated = [newTicket, ...existing];
  saveStoredTickets(updated);
  return newTicket;
}

export function updateTicketStatus(ticketId: string, newStatus: TicketStatus, actorName = "Admin Agent"): SupportTicket | null {
  const existing = getStoredTickets();
  const index = existing.findIndex((t) => t.id === ticketId);
  if (index === -1) return null;

  const current = existing[index];
  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const updatedTicket: SupportTicket = {
    ...current,
    status: newStatus,
    updatedAt: `Today, ${timeStr}`,
    activities: [
      ...current.activities,
      {
        id: `ta-${Date.now()}`,
        activityType: newStatus === "resolved" ? "resolved" : newStatus === "closed" ? "closed" : "status_changed",
        actorType: "agent",
        actorName,
        details: `Status transitioned from '${current.status}' to '${newStatus}'`,
        occurredAt: `Today, ${timeStr}`,
      },
    ],
  };

  existing[index] = updatedTicket;
  saveStoredTickets(existing);
  return updatedTicket;
}

export function addTicketComment(ticketId: string, content: string, authorName = "Agent", isInternal = false): SupportTicket | null {
  const existing = getStoredTickets();
  const index = existing.findIndex((t) => t.id === ticketId);
  if (index === -1) return null;

  const current = existing[index];
  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newComment: TicketComment = {
    id: `tc-${Date.now()}`,
    authorType: "agent",
    authorName,
    content,
    isInternal,
    createdAt: `Today, ${timeStr}`,
  };

  const updatedTicket: SupportTicket = {
    ...current,
    updatedAt: `Today, ${timeStr}`,
    comments: [...current.comments, newComment],
    activities: [
      ...current.activities,
      {
        id: `ta-${Date.now()}`,
        activityType: "comment_added",
        actorType: "agent",
        actorName: authorName,
        details: isInternal ? "Added internal note" : "Added reply to customer",
        occurredAt: `Today, ${timeStr}`,
      },
    ],
  };

  existing[index] = updatedTicket;
  saveStoredTickets(existing);
  return updatedTicket;
}
