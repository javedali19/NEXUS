export interface Customer360Profile {
  id: string;
  organizationId: string;
  businessUnitId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  title: string;
  company: {
    id: string;
    name: string;
    industry: string;
    annualRevenue: string;
    domain: string;
  };
  lifecycleStage: "customer" | "prospect" | "lead" | "churned";
  leadScore: number;
  sentimentScore: number;
  totalLtv: number;
  openPipelineValue: number;
  outstandingBalance: number;
  tags: string[];

  // 1. Universal Timeline
  timeline: Array<{
    id: string;
    sourceModule: "crm" | "erp" | "ai_comms" | "support" | "workflow" | "audit";
    entryType: string;
    title: string;
    description: string;
    timestamp: string;
    actor: string;
    metadata?: Record<string, any>;
  }>;

  // 2. Sales (Leads, Deals, Quotes)
  sales: {
    leads: Array<{
      id: string;
      source: string;
      aiScore: number;
      estimatedValue: number;
      status: string;
      createdAt: string;
    }>;
    deals: Array<{
      id: string;
      title: string;
      stage: string;
      value: number;
      probability: number;
      closeDate: string;
    }>;
    quotes: Array<{
      id: string;
      quoteNumber: string;
      totalAmount: number;
      status: string;
      expiryDate: string;
    }>;
  };

  // 3. ERP Financials (Invoices & Payments)
  financials: {
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      amount: number;
      status: "paid" | "issued" | "overdue";
      dueDate: string;
      paidDate?: string;
    }>;
    payments: Array<{
      id: string;
      paymentNumber: string;
      amount: number;
      method: string;
      status: string;
      date: string;
    }>;
  };

  // 4. Conversations & WhatsApp
  conversations: Array<{
    id: string;
    channel: "whatsapp" | "email" | "sms" | "webchat";
    subject?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
  }>;

  // 5. Calls & Telephony
  calls: Array<{
    id: string;
    channel: string;
    direction: "inbound" | "outbound";
    duration: string;
    date: string;
    transcript: string;
    aiSummary: string;
    sentimentScore: number;
  }>;

  // 6. Support Tickets
  support: Array<{
    id: string;
    ticketNumber: string;
    subject: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "open" | "in_progress" | "resolved";
    slaDue: string;
    assignedAgent: string;
  }>;

  // 7. Documents & OCR
  documents: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    uploadedAt: string;
    storageBucket: string;
    ocrConfidence?: number;
  }>;

  // 8. Consents
  consents: Array<{
    id: string;
    channel: "Voice Telephony" | "WhatsApp Messages" | "Email Marketing" | "SMS Notifications" | "AI Audio Recording";
    purpose: string;
    isGranted: boolean;
    grantedAt: string;
    ipAddress: string;
  }>;

  // 9. AI Insights
  aiInsights: {
    healthScore: number;
    churnRisk: "low" | "medium" | "high";
    nextBestActions: string[];
    summary: string;
    sentimentTrend: string;
  };

  // 10. Audit History
  auditHistory: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    resource: string;
    details: string;
  }>;
}

export const SAMPLE_CUSTOMER_360: Customer360Profile = {
  id: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  organizationId: "00000000-0000-0000-0000-000000000001",
  businessUnitId: "22222222-2222-2222-2222-222222222221",
  firstName: "Sarah",
  lastName: "Jenkins",
  fullName: "Sarah Jenkins",
  email: "sarah.j@acmeglobal.com",
  phone: "+1 (555) 234-5678",
  title: "VP of Enterprise Engineering",
  company: {
    id: "cmp-1",
    name: "Acme Global Solutions",
    industry: "Enterprise Cloud & SaaS",
    annualRevenue: "$24.5M",
    domain: "acmeglobal.com",
  },
  lifecycleStage: "customer",
  leadScore: 94,
  sentimentScore: 0.88,
  totalLtv: 145000.0,
  openPipelineValue: 45000.0,
  outstandingBalance: 0.0,
  tags: ["enterprise-tier", "vip", "ai-transcribed", "high-ltv"],

  timeline: [
    {
      id: "t1",
      sourceModule: "ai_comms",
      entryType: "voice_call",
      title: "Quarterly Telephony Review Call Completed",
      description: "AI Voice Transcript: Customer requested expansion quote for 50 additional engineer seats. Sentiment: +0.88 (Highly Satisfied).",
      timestamp: "Today, 09:12 AM",
      actor: "AI Telephony Copilot",
    },
    {
      id: "t2",
      sourceModule: "erp",
      entryType: "invoice_paid",
      title: "ERP Invoice #INV-2026-089 Settled ($45,000.00)",
      description: "Payment posted via Wire Transfer. Transactional Outbox published event to GCP Pub/Sub.",
      timestamp: "Yesterday, 04:30 PM",
      actor: "Finance Officer (Auto-Sync)",
    },
    {
      id: "t3",
      sourceModule: "crm",
      entryType: "deal_won",
      title: "CRM Deal 'Enterprise Expansion Phase 2' Closed-Won",
      description: "Deal value $145,000.00 closed. Auto-invoicing workflow triggered automatically.",
      timestamp: "2 days ago",
      actor: "Alex Morgan",
    },
    {
      id: "t4",
      sourceModule: "support",
      entryType: "ticket_resolved",
      title: "Support Case #SUP-991 Resolved (SSO Integration)",
      description: "Assisted customer engineering team with Google Cloud Identity Platform SAML setup.",
      timestamp: "3 days ago",
      actor: "Tier-2 Engineering Support",
    },
    {
      id: "t5",
      sourceModule: "audit",
      entryType: "consent_granted",
      title: "TCPA & AI Voice Recording Consent Granted",
      description: "Customer agreed to AI audio transcription & WhatsApp communication.",
      timestamp: "Sep 18, 2026",
      actor: "Sarah Jenkins (Self-Serve Portal)",
    },
  ],

  sales: {
    leads: [
      {
        id: "l1",
        source: "Inbound Telephony",
        aiScore: 94,
        estimatedValue: 45000,
        status: "Converted",
        createdAt: "2026-09-10",
      },
    ],
    deals: [
      {
        id: "d1",
        title: "Enterprise Expansion Phase 2",
        stage: "Closed-Won",
        value: 145000,
        probability: 100,
        closeDate: "2026-09-20",
      },
      {
        id: "d2",
        title: "AI Communications Add-on (50 Seats)",
        stage: "Proposal",
        value: 45000,
        probability: 80,
        closeDate: "2026-10-15",
      },
    ],
    quotes: [
      {
        id: "q1",
        quoteNumber: "QT-2026-104",
        totalAmount: 145000,
        status: "Accepted & Invoiced",
        expiryDate: "2026-10-01",
      },
      {
        id: "q2",
        quoteNumber: "QT-2026-105",
        totalAmount: 45000,
        status: "Draft Sent",
        expiryDate: "2026-10-20",
      },
    ],
  },

  financials: {
    invoices: [
      {
        id: "inv-1",
        invoiceNumber: "INV-2026-089",
        amount: 45000.0,
        status: "paid",
        dueDate: "2026-10-01",
        paidDate: "2026-09-21",
      },
      {
        id: "inv-2",
        invoiceNumber: "INV-2026-090",
        amount: 100000.0,
        status: "paid",
        dueDate: "2026-08-01",
        paidDate: "2026-07-28",
      },
    ],
    payments: [
      {
        id: "pay-1",
        paymentNumber: "PAY-8839-2026",
        amount: 45000.0,
        method: "ACH / Wire",
        status: "Settled",
        date: "2026-09-21",
      },
    ],
  },

  conversations: [
    {
      id: "conv-1",
      channel: "whatsapp",
      subject: "WhatsApp Direct",
      lastMessage: "Thank you for sending over the add-on quote PDF!",
      timestamp: "Today, 09:45 AM",
      unreadCount: 0,
    },
    {
      id: "conv-2",
      channel: "email",
      subject: "Quarterly Enterprise SLA & Telephony Review",
      lastMessage: "The engineering team approved the contract amendment.",
      timestamp: "Yesterday, 03:10 PM",
      unreadCount: 0,
    },
  ],

  calls: [
    {
      id: "call-1",
      channel: "Voice PSTN",
      direction: "inbound",
      duration: "08m 42s",
      date: "Today, 09:12 AM",
      transcript: "Sarah: 'We have seen a 35% reduction in ticket resolution time with the AI telephony copilot. We'd like to extend this to 50 additional engineers.'",
      aiSummary: "Customer highly satisfied with deployment stability and ROI. Discussed adding 50 engineer seats for the next quarter.",
      sentimentScore: 0.88,
    },
  ],

  support: [
    {
      id: "sup-1",
      ticketNumber: "SUP-991",
      subject: "Google Cloud Identity Platform SAML Integration",
      priority: "high",
      status: "resolved",
      slaDue: "2026-09-19",
      assignedAgent: "Alex Morgan",
    },
  ],

  documents: [
    {
      id: "doc-1",
      fileName: "Acme_Master_Services_Agreement_2026.pdf",
      fileType: "application/pdf",
      fileSize: "2.4 MB",
      uploadedAt: "2026-09-18",
      storageBucket: "enterprise-platform-assets",
      ocrConfidence: 99.4,
    },
    {
      id: "doc-2",
      fileName: "Security_Compliance_Audit_Report.pdf",
      fileType: "application/pdf",
      fileSize: "1.8 MB",
      uploadedAt: "2026-09-15",
      storageBucket: "enterprise-platform-assets",
    },
  ],

  consents: [
    {
      id: "cns-1",
      channel: "Voice Telephony",
      purpose: "AI Call Audio Recording & Transcription",
      isGranted: true,
      grantedAt: "2026-09-18",
      ipAddress: "192.168.1.45",
    },
    {
      id: "cns-2",
      channel: "WhatsApp Messages",
      purpose: "Direct Enterprise Support & Quote Delivery",
      isGranted: true,
      grantedAt: "2026-09-18",
      ipAddress: "192.168.1.45",
    },
    {
      id: "cns-3",
      channel: "Email Marketing",
      purpose: "Product Updates & ROI Reports",
      isGranted: true,
      grantedAt: "2026-09-18",
      ipAddress: "192.168.1.45",
    },
  ],

  aiInsights: {
    healthScore: 96,
    churnRisk: "low",
    nextBestActions: [
      "Send Proposal for 50 AI Telephony Add-On Seats ($45,000)",
      "Schedule Executive Business Review for Q4",
      "Request customer testimonial quote for website",
    ],
    summary: "Acme Global Solutions is a flagship enterprise customer. Their deployment is operating at peak performance with zero critical issues. High probability of contract renewal and seat expansion.",
    sentimentTrend: "Strong Positive (+0.88)",
  },

  auditHistory: [
    {
      id: "aud-1",
      timestamp: "2026-09-22 09:12:00",
      actor: "system-telephony-worker",
      action: "AI_CALL_TRANSCRIBED",
      resource: "ai_communications",
      details: "Call recording transcribed. Sentiment scored as +0.88.",
    },
    {
      id: "aud-2",
      timestamp: "2026-09-21 16:30:12",
      actor: "finance-webhook@gcp",
      action: "ERP_INVOICE_PAID",
      resource: "erp_invoices",
      details: "Invoice #INV-2026-089 marked paid ($45,000.00).",
    },
    {
      id: "aud-3",
      timestamp: "2026-09-20 11:15:00",
      actor: "alex.morgan@enterprise.internal",
      action: "CRM_DEAL_CLOSED_WON",
      resource: "crm_deals",
      details: "Stage changed from negotiation to closed_won ($145,000.00).",
    },
  ],
};
