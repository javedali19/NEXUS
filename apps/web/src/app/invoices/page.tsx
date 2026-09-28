"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Send,
  CreditCard,
  Building2,
  User,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Download,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  PhoneCall,
  Mail,
  Receipt,
  FileCheck2,
  CornerDownRight,
  Check,
  ChevronRight,
  Sparkles,
  PieChart,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  INITIAL_INVOICES,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoicePayment,
  InvoiceTimelineEvent,
  STATUS_CONFIG,
  calculateInvoiceTotals,
  DiscountType,
} from "@/lib/invoice-data";
import { useToast } from "@/components/ui";

export default function InvoicesPage() {
  const { showToast } = useToast();

  // Primary State
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(INITIAL_INVOICES[0].id);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDetailTab, setActiveDetailTab] = useState<
    "items" | "timeline" | "customer360" | "payments" | "collections" | "document" | "analytics" | "audit"
  >("items");

  // Creation / Edit Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  
  // Editor Form Fields
  const [formInvoiceNumber, setFormInvoiceNumber] = useState("");
  const [formCustomerId, setFormCustomerId] = useState("cust-001");
  const [formCustomerName, setFormCustomerName] = useState("Sarah Jenkins");
  const [formCustomerEmail, setFormCustomerEmail] = useState("s.jenkins@acmeglobal.com");
  const [formCompanyName, setFormCompanyName] = useState("Acme Global Industries");
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [formPaymentTerms, setFormPaymentTerms] = useState("Net 30");
  const [formTaxRate, setFormTaxRate] = useState<number>(0.08);
  const [formDiscountType, setFormDiscountType] = useState<DiscountType>("fixed");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(0);
  const [formNotes, setFormNotes] = useState("");
  const [formTermsConditions, setFormTermsConditions] = useState("Standard Master Services Agreement applies. Net 30 days.");
  const [formItems, setFormItems] = useState<
    Array<{
      id: string;
      itemCode: string;
      description: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      taxRate: number;
    }>
  >([
    {
      id: "item-init-1",
      itemCode: "ERP-LICENSE",
      description: "Nexus Enterprise Core Platform License",
      quantity: 1,
      unitPrice: 15000,
      discountPercent: 0,
      taxRate: 0.08,
    },
  ]);

  // Payment Recording Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe_credit_card" | "bank_wire" | "ach_transfer" | "check" | "cash"
  >("stripe_credit_card");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Calculated selected invoice
  const selectedInvoice = useMemo(() => {
    return invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];
  }, [invoices, selectedInvoiceId]);

  // Editor Real-time Calculation
  const editorCalculation = useMemo(() => {
    return calculateInvoiceTotals(
      formItems,
      formTaxRate,
      formDiscountType,
      formDiscountValue,
      0
    );
  }, [formItems, formTaxRate, formDiscountType, formDiscountValue]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus =
        activeStatusFilter === "all" || inv.status === activeStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.companyName.toLowerCase().includes(q) ||
        inv.items.some((it) => it.description.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [invoices, activeStatusFilter, searchQuery]);

  // High-Level Financial Metrics
  const metrics = useMemo(() => {
    const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.status !== "cancelled" ? inv.totalAmount : 0), 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
    const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.status !== "cancelled" ? inv.balanceDue : 0), 0);
    const totalOverdue = invoices
      .filter((inv) => inv.status === "overdue")
      .reduce((acc, inv) => acc + inv.balanceDue, 0);
    const paidCount = invoices.filter((inv) => inv.status === "paid").length;
    const activeCount = invoices.filter((inv) => inv.status !== "cancelled").length;

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      totalOverdue,
      paidRatio: activeCount > 0 ? Math.round((paidCount / activeCount) * 100) : 0,
      averageDso: 24,
    };
  }, [invoices]);

  // Handlers for Creation / Editing
  const openCreateModal = () => {
    setEditingInvoiceId(null);
    setFormInvoiceNumber(`INV-2026-${String(invoices.length + 42).padStart(4, "0")}`);
    setFormCustomerId("cust-001");
    setFormCustomerName("Sarah Jenkins");
    setFormCustomerEmail("s.jenkins@acmeglobal.com");
    setFormCompanyName("Acme Global Industries");
    setFormIssueDate(new Date().toISOString().split("T")[0]);
    setFormDueDate(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
    setFormPaymentTerms("Net 30");
    setFormTaxRate(0.08);
    setFormDiscountType("percentage");
    setFormDiscountValue(0);
    setFormNotes("Standard annual subscription fee.");
    setFormTermsConditions("Net 30 payment terms.");
    setFormItems([
      {
        id: `item-${Date.now()}-1`,
        itemCode: "ERP-SaaS",
        description: "Enterprise SaaS Platform License",
        quantity: 1,
        unitPrice: 12000,
        discountPercent: 0,
        taxRate: 0.08,
      },
    ]);
    setIsEditorOpen(true);
  };

  const openEditModal = (inv: Invoice) => {
    setEditingInvoiceId(inv.id);
    setFormInvoiceNumber(inv.invoiceNumber);
    setFormCustomerId(inv.customerId);
    setFormCustomerName(inv.customerName);
    setFormCustomerEmail(inv.customerEmail);
    setFormCompanyName(inv.companyName);
    setFormIssueDate(inv.issueDate);
    setFormDueDate(inv.dueDate);
    setFormPaymentTerms(inv.paymentTerms);
    setFormTaxRate(inv.taxRate);
    setFormDiscountType(inv.discountType);
    setFormDiscountValue(inv.discountValue);
    setFormNotes(inv.notes || "");
    setFormTermsConditions(inv.termsConditions || "");
    setFormItems(
      inv.items.map((it) => ({
        id: it.id,
        itemCode: it.itemCode || "",
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent,
        taxRate: it.taxRate,
      }))
    );
    setIsEditorOpen(true);
  };

  const handleSaveInvoice = (targetStatus: InvoiceStatus = "draft") => {
    if (formItems.length === 0) {
      showToast({
        title: "Validation Error",
        message: "Invoice must contain at least one line item.",
        type: "error",
      });
      return;
    }

    const totals = calculateInvoiceTotals(
      formItems,
      formTaxRate,
      formDiscountType,
      formDiscountValue,
      editingInvoiceId ? selectedInvoice?.amountPaid || 0 : 0
    );

    if (editingInvoiceId) {
      // Edit existing
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === editingInvoiceId) {
            const updatedTimeline: InvoiceTimelineEvent[] = [
              {
                id: `time-${Date.now()}`,
                eventType: "edited",
                title: "Invoice Edited & Recalculated",
                description: `Updated by Finance Admin. Recalculated total: $${totals.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
                actorName: "Finance Admin",
                occurredAt: new Date().toISOString(),
              },
              ...inv.timeline,
            ];

            return {
              ...inv,
              invoiceNumber: formInvoiceNumber,
              customerId: formCustomerId,
              customerName: formCustomerName,
              customerEmail: formCustomerEmail,
              companyName: formCompanyName,
              status: targetStatus === "issued" ? "issued" : inv.status,
              issueDate: formIssueDate,
              dueDate: formDueDate,
              paymentTerms: formPaymentTerms,
              subtotal: totals.subtotal,
              taxRate: formTaxRate,
              taxAmount: totals.taxAmount,
              discountType: formDiscountType,
              discountValue: formDiscountValue,
              discountAmount: totals.discountAmount,
              totalAmount: totals.totalAmount,
              balanceDue: totals.balanceDue,
              notes: formNotes,
              termsConditions: formTermsConditions,
              items: totals.computedItems,
              timeline: updatedTimeline,
              outboxEventsEmitted: inv.outboxEventsEmitted + 1,
            };
          }
          return inv;
        })
      );

      showToast({
        title: "Invoice Updated",
        message: `Invoice ${formInvoiceNumber} updated and recalculations committed.`,
        type: "success",
      });
    } else {
      // Create new
      const newInvoiceId = `inv-${Date.now()}`;
      const newTimeline: InvoiceTimelineEvent[] = [
        {
          id: `time-${Date.now()}-1`,
          eventType: "created",
          title: "Invoice Draft Created",
          description: "New invoice staged in database ledger.",
          actorName: "Finance Director Elena",
          occurredAt: new Date().toISOString(),
        },
      ];

      if (targetStatus === "issued") {
        newTimeline.unshift({
          id: `time-${Date.now()}-2`,
          eventType: "issued",
          title: "Invoice Formally Issued",
          description: "Posted to Outbox Event Stream: invoice.issued.v1.",
          actorName: "Finance Director Elena",
          occurredAt: new Date().toISOString(),
        });
      }

      const newInvoice: Invoice = {
        id: newInvoiceId,
        invoiceNumber: formInvoiceNumber,
        customerId: formCustomerId,
        customerName: formCustomerName,
        customerEmail: formCustomerEmail,
        companyName: formCompanyName,
        status: targetStatus,
        currency: "USD",
        issueDate: formIssueDate,
        dueDate: formDueDate,
        subtotal: totals.subtotal,
        taxRate: formTaxRate,
        taxAmount: totals.taxAmount,
        discountType: formDiscountType,
        discountValue: formDiscountValue,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        amountPaid: 0,
        balanceDue: totals.totalAmount,
        paymentTerms: formPaymentTerms,
        notes: formNotes,
        termsConditions: formTermsConditions,
        billingAddress: {
          street: "100 Innovation Way",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "USA",
        },
        items: totals.computedItems,
        payments: [],
        timeline: newTimeline,
        customer360Id: formCustomerId,
        collectionStage: "current",
        outboxEventsEmitted: targetStatus === "issued" ? 2 : 1,
      };

      setInvoices((prev) => [newInvoice, ...prev]);
      setSelectedInvoiceId(newInvoiceId);

      showToast({
        title: targetStatus === "issued" ? "Invoice Issued" : "Draft Created",
        message: `Invoice ${formInvoiceNumber} saved with total $${totals.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
        type: "success",
      });
    }

    setIsEditorOpen(false);
  };

  // Status Progression Workflow Handlers
  const handleTransitionStatus = (target: InvoiceStatus) => {
    if (!selectedInvoice) return;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          const updatedTimeline: InvoiceTimelineEvent[] = [
            {
              id: `time-${Date.now()}`,
              eventType: target === "sent" ? "sent" : target === "cancelled" ? "cancelled" : "issued",
              title: `Status Changed to ${STATUS_CONFIG[target].label}`,
              description: `Invoice status transitioned from ${inv.status} to ${target}. Outbox event published.`,
              actorName: "Elena Rostova (Finance)",
              occurredAt: new Date().toISOString(),
            },
            ...inv.timeline,
          ];

          return {
            ...inv,
            status: target,
            timeline: updatedTimeline,
            outboxEventsEmitted: inv.outboxEventsEmitted + 1,
          };
        }
        return inv;
      })
    );

    showToast({
      title: "Invoice Status Updated",
      message: `${selectedInvoice.invoiceNumber} transitioned to ${STATUS_CONFIG[target].label}. Event written to Outbox.`,
      type: "success",
    });
  };

  const handleSendInvoice = (channel: "email" | "whatsapp") => {
    if (!selectedInvoice) return;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          const updatedTimeline: InvoiceTimelineEvent[] = [
            {
              id: `time-${Date.now()}`,
              eventType: "sent",
              title: `Invoice Dispatched via ${channel === "email" ? "Email" : "WhatsApp"}`,
              description: `Sent to ${inv.customerEmail} with hosted payment checkout link.`,
              actorName: "Integration Outbox Dispatcher",
              occurredAt: new Date().toISOString(),
            },
            ...inv.timeline,
          ];

          return {
            ...inv,
            status: inv.status === "draft" || inv.status === "issued" ? "sent" : inv.status,
            timeline: updatedTimeline,
            outboxEventsEmitted: inv.outboxEventsEmitted + 1,
          };
        }
        return inv;
      })
    );

    showToast({
      title: "Invoice Dispatched",
      message: `Invoice ${selectedInvoice.invoiceNumber} sent to ${selectedInvoice.customerEmail} via ${channel.toUpperCase()}.`,
      type: "success",
    });
  };

  // Payment Recording
  const openPaymentModal = () => {
    if (!selectedInvoice) return;
    setPaymentAmount(selectedInvoice.balanceDue);
    setPaymentReference(`CH-${Date.now().toString().slice(-6)}`);
    setPaymentNotes("Payment settlement recorded via manual finance entry.");
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || paymentAmount <= 0) {
      showToast({
        title: "Invalid Amount",
        message: "Please enter a valid positive payment amount.",
        type: "error",
      });
      return;
    }

    const currentPaid = selectedInvoice.amountPaid;
    const newTotalPaid = currentPaid + paymentAmount;
    const remainingBalance = Math.max(0, selectedInvoice.totalAmount - newTotalPaid);
    const newStatus: InvoiceStatus = remainingBalance <= 0 ? "paid" : "partially_paid";

    const newPayment: InvoicePayment = {
      id: `pay-${Date.now()}`,
      amount: paymentAmount,
      currency: "USD",
      paymentMethod,
      transactionReference: paymentReference || `REF-${Date.now()}`,
      status: "succeeded",
      settledAt: new Date().toISOString(),
      recordedBy: "Finance Auditor (Portal)",
      notes: paymentNotes,
    };

    const newTimelineEvent: InvoiceTimelineEvent = {
      id: `time-${Date.now()}`,
      eventType: newStatus === "paid" ? "payment_recorded" : "partial_payment",
      title: newStatus === "paid" ? `Full Payment Settled ($${paymentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })})` : `Partial Payment Recorded ($${paymentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })})`,
      description: `Payment via ${paymentMethod.replace("_", " ")} ref: ${paymentReference}. Remaining balance: $${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
      actorName: "Payment Gateway Adapter",
      occurredAt: new Date().toISOString(),
    };

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          return {
            ...inv,
            status: newStatus,
            amountPaid: newTotalPaid,
            balanceDue: remainingBalance,
            paidAt: newStatus === "paid" ? new Date().toISOString() : inv.paidAt,
            payments: [newPayment, ...inv.payments],
            timeline: [newTimelineEvent, ...inv.timeline],
            outboxEventsEmitted: inv.outboxEventsEmitted + 1,
          };
        }
        return inv;
      })
    );

    setIsPaymentModalOpen(false);
    showToast({
      title: "Payment Recorded",
      message: `$${paymentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} credited to ${selectedInvoice.invoiceNumber}. Status is now ${STATUS_CONFIG[newStatus].label}.`,
      type: "success",
    });
  };

  // Trigger Collections Call
  const handleTriggerCollectionsReminder = () => {
    if (!selectedInvoice) return;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          const updatedTimeline: InvoiceTimelineEvent[] = [
            {
              id: `time-${Date.now()}`,
              eventType: "collection_reminder",
              title: "AI Voice Telephony Collection Outreach Dispatched",
              description: `Autonomous voice outreach call queued for ${inv.customerName} regarding overdue balance of $${inv.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
              actorName: "AI Telephony Engine",
              occurredAt: new Date().toISOString(),
            },
            ...inv.timeline,
          ];

          return {
            ...inv,
            timeline: updatedTimeline,
            outboxEventsEmitted: inv.outboxEventsEmitted + 1,
          };
        }
        return inv;
      })
    );

    showToast({
      title: "Collections Action Dispatched",
      message: `AI Voice Outreach agent initiated for ${selectedInvoice.customerName}. Event written to Outbox.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Invoice Management Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-primary/10 text-primary border border-primary/20 font-semibold">
              Multi-Tenant ERP Domain
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complete lifecycle billing, line item tax & discount calculations, payment settlements, and canonical event outbox pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Invoiced</span>
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">
            ${metrics.totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {invoices.length} Registered Invoices
          </p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Collected Revenue</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ${metrics.totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono">
            {metrics.paidRatio}% Collection Rate
          </p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Outstanding Balance</span>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            ${metrics.totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">Active Receivables</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overdue Receivables</span>
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
            ${metrics.totalOverdue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-mono">Automated Dunning Active</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Days Sales Out (DSO)</span>
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-foreground">{metrics.averageDso} Days</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">-4.2 Days vs Last Month</p>
        </div>
      </div>

      {/* Main Grid: Left List (40%) & Right Detail/Workbench (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search, Filters & Invoice Directory */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Filter Bar */}
          <div className="p-3.5 border-b border-border bg-muted/40 space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice #, customer, company..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: "all", label: "All", count: invoices.length },
                { id: "draft", label: "Draft", count: invoices.filter((i) => i.status === "draft").length },
                { id: "issued", label: "Issued", count: invoices.filter((i) => i.status === "issued").length },
                { id: "sent", label: "Sent", count: invoices.filter((i) => i.status === "sent").length },
                { id: "partially_paid", label: "Partial", count: invoices.filter((i) => i.status === "partially_paid").length },
                { id: "paid", label: "Paid", count: invoices.filter((i) => i.status === "paid").length },
                { id: "overdue", label: "Overdue", count: invoices.filter((i) => i.status === "overdue").length },
                { id: "cancelled", label: "Void", count: invoices.filter((i) => i.status === "cancelled").length },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveStatusFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                    activeStatusFilter === pill.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted border border-border"
                  }`}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}
            </div>
          </div>

          {/* Invoices List */}
          <div className="divide-y divide-border max-h-[680px] overflow-y-auto">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No invoices found matching current filters.
              </div>
            ) : (
              filteredInvoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                const statusMeta = STATUS_CONFIG[inv.status];

                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`p-3.5 cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? "bg-primary/5 border-l-4 border-l-primary"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">
                            {inv.invoiceNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="font-medium text-foreground mt-1">{inv.companyName}</p>
                        <p className="text-[11px] text-muted-foreground">{inv.customerName}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-foreground font-mono">
                          ${inv.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        {inv.balanceDue > 0 && inv.status !== "cancelled" ? (
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                            Due: ${inv.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            Settled
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1 font-mono">
                          <Calendar className="h-3 w-3" /> Due {inv.dueDate}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Invoice Management & Connected Ecosystem Workbench */}
        {selectedInvoice && (
          <div className="lg:col-span-7 space-y-4">
            {/* Invoice Header Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-foreground font-mono">
                      {selectedInvoice.invoiceNumber}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[selectedInvoice.status].bg} ${STATUS_CONFIG[selectedInvoice.status].text} ${STATUS_CONFIG[selectedInvoice.status].border}`}
                    >
                      {STATUS_CONFIG[selectedInvoice.status].label}
                    </span>
                    {selectedInvoice.status === "overdue" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Dunning Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Issued: {selectedInvoice.issueDate} &bull; Payment Terms: {selectedInvoice.paymentTerms} &bull; Due: {selectedInvoice.dueDate}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center flex-wrap gap-2">
                  {selectedInvoice.status === "draft" && (
                    <button
                      onClick={() => handleTransitionStatus("issued")}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <FileCheck2 className="h-3.5 w-3.5" /> Issue Invoice
                    </button>
                  )}

                  {(selectedInvoice.status === "issued" || selectedInvoice.status === "draft") && (
                    <button
                      onClick={() => handleSendInvoice("email")}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" /> Dispatch
                    </button>
                  )}

                  {selectedInvoice.balanceDue > 0 && selectedInvoice.status !== "cancelled" && (
                    <button
                      onClick={openPaymentModal}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Record Payment
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(selectedInvoice)}
                    className="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-xs font-semibold hover:bg-accent transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>

              {/* Financial Breakdown Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-lg border border-border text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Subtotal</span>
                  <p className="font-bold text-foreground font-mono">
                    ${selectedInvoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Tax & Discount
                  </span>
                  <p className="font-medium text-foreground font-mono">
                    +${selectedInvoice.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} / -${selectedInvoice.discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Grand Total</span>
                  <p className="font-bold text-foreground font-mono">
                    ${selectedInvoice.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Balance Due</span>
                  <p className={`font-bold font-mono ${selectedInvoice.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    ${selectedInvoice.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Connected Tabs Navigation */}
              <div className="flex items-center gap-1 border-b border-border overflow-x-auto text-xs font-medium">
                {[
                  { id: "items", label: "Line Items", icon: <Layers className="h-3.5 w-3.5" /> },
                  { id: "timeline", label: "Invoice Timeline", icon: <Clock className="h-3.5 w-3.5" />, badge: selectedInvoice.timeline.length },
                  { id: "customer360", label: "Customer 360", icon: <User className="h-3.5 w-3.5" /> },
                  { id: "payments", label: "Payments", icon: <CreditCard className="h-3.5 w-3.5" />, badge: selectedInvoice.payments.length },
                  { id: "collections", label: "Collections & Dunning", icon: <PhoneCall className="h-3.5 w-3.5" /> },
                  { id: "document", label: "Document & PDF", icon: <FileText className="h-3.5 w-3.5" /> },
                  { id: "analytics", label: "Analytics", icon: <PieChart className="h-3.5 w-3.5" /> },
                  { id: "audit", label: "Audit & Outbox", icon: <ShieldCheck className="h-3.5 w-3.5" />, badge: selectedInvoice.outboxEventsEmitted },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)}
                    className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      activeDetailTab === tab.id
                        ? "border-primary text-primary font-semibold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="pt-2 text-xs">
                {/* 1. Line Items Tab */}
                {activeDetailTab === "items" && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto border border-border rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                          <tr>
                            <th className="py-2.5 px-3">Item / SKU</th>
                            <th className="py-2.5 px-3">Description</th>
                            <th className="py-2.5 px-3 text-right">Qty</th>
                            <th className="py-2.5 px-3 text-right">Unit Price</th>
                            <th className="py-2.5 px-3 text-right">Disc %</th>
                            <th className="py-2.5 px-3 text-right">Line Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedInvoice.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-muted/30">
                              <td className="py-2.5 px-3 font-mono text-primary font-medium">
                                {item.itemCode || `SKU-${idx + 1}`}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-foreground">
                                {item.description}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-foreground">
                                {item.quantity}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-foreground">
                                ${item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                                {item.discountPercent}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                                ${item.lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Calculation Notes */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 p-3.5 bg-muted/20 border border-border rounded-lg">
                      <div className="space-y-1 text-muted-foreground max-w-sm">
                        <span className="font-semibold text-foreground text-[11px]">Notes & Terms:</span>
                        <p className="text-[11px]">{selectedInvoice.notes || "No custom notes."}</p>
                        <p className="text-[10px] italic">{selectedInvoice.termsConditions}</p>
                      </div>

                      <div className="space-y-1.5 font-mono text-right min-w-[220px]">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal:</span>
                          <span>${selectedInvoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        {selectedInvoice.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>Discount:</span>
                            <span>-${selectedInvoice.discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <span>Tax ({(selectedInvoice.taxRate * 100).toFixed(1)}%):</span>
                          <span>+${selectedInvoice.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-bold text-foreground border-t border-border pt-1">
                          <span>Total Amount:</span>
                          <span>${selectedInvoice.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Amount Paid:</span>
                          <span>-${selectedInvoice.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400 border-t border-border pt-1">
                          <span>Balance Due:</span>
                          <span>${selectedInvoice.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Invoice Timeline Tab */}
                {activeDetailTab === "timeline" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="font-semibold text-foreground text-xs">
                        Lifecycle Event Audit Trail
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Append-Only Chronological Stream
                      </span>
                    </div>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      {selectedInvoice.timeline.map((evt) => (
                        <div key={evt.id} className="relative space-y-1">
                          <div className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{evt.title}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(evt.occurredAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-[11px]">{evt.description}</p>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-muted text-muted-foreground">
                            Actor: {evt.actorName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Customer 360 Tab */}
                {activeDetailTab === "customer360" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-primary" />
                            {selectedInvoice.companyName}
                          </h3>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            Contact: {selectedInvoice.customerName} &bull; {selectedInvoice.customerEmail}
                          </p>
                        </div>
                        <Link
                          href={`/customers/${selectedInvoice.customer360Id}`}
                          className="px-3 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 flex items-center gap-1"
                        >
                          Open Customer 360 <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Billing Address
                          </span>
                          <p className="text-foreground mt-0.5">
                            {selectedInvoice.billingAddress.street}, {selectedInvoice.billingAddress.city},{" "}
                            {selectedInvoice.billingAddress.state} {selectedInvoice.billingAddress.postalCode}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Credit Health
                          </span>
                          <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" /> Prime (Risk: Low)
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Lifetime Invoiced
                          </span>
                          <p className="text-foreground font-mono font-bold mt-0.5">$92,500.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Payments Tab */}
                {activeDetailTab === "payments" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs">
                        Settled Payments Ledger
                      </span>
                      {selectedInvoice.balanceDue > 0 && selectedInvoice.status !== "cancelled" && (
                        <button
                          onClick={openPaymentModal}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-500 transition-colors flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Record New Payment
                        </button>
                      )}
                    </div>

                    {selectedInvoice.payments.length === 0 ? (
                      <div className="p-6 border border-dashed border-border rounded-lg text-center text-muted-foreground text-xs">
                        No payments recorded for this invoice yet. Balance due: ${selectedInvoice.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedInvoice.payments.map((p) => (
                          <div
                            key={p.id}
                            className="p-3 border border-border rounded-lg bg-muted/20 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                  +${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {p.currency}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                                  {p.status}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-[11px]">
                                Method: <span className="font-medium text-foreground">{p.paymentMethod.replace("_", " ")}</span> &bull; Ref: <span className="font-mono text-foreground">{p.transactionReference}</span>
                              </p>
                              {p.notes && <p className="text-[10px] italic text-muted-foreground">{p.notes}</p>}
                            </div>

                            <div className="text-right text-[10px] text-muted-foreground font-mono">
                              <p>{new Date(p.settledAt).toLocaleDateString()}</p>
                              <p>{p.recordedBy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Collections Tab */}
                {activeDetailTab === "collections" && (
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                            <PhoneCall className="h-4 w-4 text-amber-500" />
                            Autonomous Collections Escalation
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            Collections stage: <span className="font-semibold text-foreground uppercase">{selectedInvoice.collectionStage || "current"}</span>
                          </p>
                        </div>

                        <button
                          onClick={handleTriggerCollectionsReminder}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Zap className="h-3.5 w-3.5" /> Dispatch AI Collection Call
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                        <div className="p-2.5 bg-background border border-border rounded-md">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Dunning Level</span>
                          <p className="font-bold text-foreground mt-0.5">Level 2 (Active Outreach)</p>
                        </div>
                        <div className="p-2.5 bg-background border border-border rounded-md">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Reminder Sequence</span>
                          <p className="font-medium text-foreground mt-0.5">WhatsApp + Voice Call + SMS</p>
                        </div>
                        <div className="p-2.5 bg-background border border-border rounded-md">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Grace Period</span>
                          <p className="font-medium text-foreground mt-0.5">5 Business Days Remaining</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Document & PDF View Tab */}
                {activeDetailTab === "document" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs">
                        Standard Formatted Tax Invoice Document
                      </span>
                      <button
                        onClick={() => {
                          showToast({
                            title: "PDF Generated",
                            message: `Invoice ${selectedInvoice.invoiceNumber}.pdf downloaded.`,
                            type: "success",
                          });
                        }}
                        className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" /> Download PDF
                      </button>
                    </div>

                    {/* Clean Paper Invoice Preview */}
                    <div className="p-6 bg-background border border-border rounded-lg space-y-6 text-xs shadow-sm font-sans">
                      {/* Document Header */}
                      <div className="flex justify-between items-start border-b border-border pb-4">
                        <div>
                          <h2 className="text-lg font-bold tracking-tight text-foreground">
                            NEXUS ENTERPRISE CORP
                          </h2>
                          <p className="text-[11px] text-muted-foreground">
                            100 Innovation Way &bull; San Francisco, CA 94105
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Tax ID: US-EIN-88492019
                          </p>
                        </div>
                        <div className="text-right">
                          <h3 className="text-base font-bold font-mono text-primary">
                            TAX INVOICE
                          </h3>
                          <p className="font-mono font-semibold text-foreground">
                            {selectedInvoice.invoiceNumber}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Date: {selectedInvoice.issueDate}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-semibold">
                            Due: {selectedInvoice.dueDate}
                          </p>
                        </div>
                      </div>

                      {/* Bill To */}
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                            Billed To:
                          </span>
                          <p className="font-bold text-foreground">{selectedInvoice.companyName}</p>
                          <p className="text-muted-foreground">{selectedInvoice.customerName}</p>
                          <p className="text-muted-foreground">{selectedInvoice.billingAddress.street}</p>
                          <p className="text-muted-foreground">
                            {selectedInvoice.billingAddress.city}, {selectedInvoice.billingAddress.state}{" "}
                            {selectedInvoice.billingAddress.postalCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                            Payment Instructions:
                          </span>
                          <p className="text-foreground">Bank: Silicon Valley Corporate Bank</p>
                          <p className="text-foreground font-mono">Routing: 121000358</p>
                          <p className="text-foreground font-mono">Account: 99482018442</p>
                          <p className="text-muted-foreground">Terms: {selectedInvoice.paymentTerms}</p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="border border-border rounded">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-muted/60 border-b border-border text-[10px] uppercase font-mono text-muted-foreground">
                            <tr>
                              <th className="py-2 px-3">Description</th>
                              <th className="py-2 px-3 text-right">Qty</th>
                              <th className="py-2 px-3 text-right">Unit Price</th>
                              <th className="py-2 px-3 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {selectedInvoice.items.map((it) => (
                              <tr key={it.id}>
                                <td className="py-2 px-3">
                                  <p className="font-medium text-foreground">{it.description}</p>
                                  {it.itemCode && (
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {it.itemCode}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right font-mono">{it.quantity}</td>
                                <td className="py-2 px-3 text-right font-mono">
                                  ${it.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-semibold">
                                  ${it.lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals */}
                      <div className="flex justify-end font-mono text-xs">
                        <div className="w-64 space-y-1">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal:</span>
                            <span>${selectedInvoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Tax ({(selectedInvoice.taxRate * 100).toFixed(0)}%):</span>
                            <span>${selectedInvoice.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between font-bold text-foreground border-t border-border pt-1">
                            <span>Total Due:</span>
                            <span>${selectedInvoice.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Analytics Tab */}
                {activeDetailTab === "analytics" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-muted/20 border border-border rounded-lg space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Gross Margin Contribution
                        </span>
                        <p className="text-lg font-bold text-foreground font-mono">82.4%</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">High Profitability Tier</p>
                      </div>
                      <div className="p-3.5 bg-muted/20 border border-border rounded-lg space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Settlement Velocity
                        </span>
                        <p className="text-lg font-bold text-foreground font-mono">18.5 Days</p>
                        <p className="text-[10px] text-muted-foreground">Within Net 30 Terms</p>
                      </div>
                      <div className="p-3.5 bg-muted/20 border border-border rounded-lg space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Revenue Recognition
                        </span>
                        <p className="text-lg font-bold text-foreground font-mono">ASC 606 Compliant</p>
                        <p className="text-[10px] text-muted-foreground">Ratable over 12 Months</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Audit & Outbox Tab */}
                {activeDetailTab === "audit" && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-muted/20 border border-border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-primary" />
                          Canonical Outbox Event Envelope (CloudEvent Format)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Committed to PostgreSQL Outbox
                        </span>
                      </div>

                      <pre className="p-3 bg-background border border-border rounded text-[11px] font-mono text-foreground overflow-x-auto">
{JSON.stringify(
  {
    event_id: `evt-${selectedInvoice.id}-8821`,
    event_type: `invoice.${selectedInvoice.status}.v1`,
    organization_id: "00000000-0000-0000-0000-000000000001",
    entity_type: "invoice",
    entity_id: selectedInvoice.id,
    source_system: "platform-erp-billing",
    schema_version: "1.0.0",
    occurred_at: new Date().toISOString(),
    payload: {
      invoice_number: selectedInvoice.invoiceNumber,
      customer_id: selectedInvoice.customerId,
      customer_email: selectedInvoice.customerEmail,
      total_amount: selectedInvoice.totalAmount,
      currency: selectedInvoice.currency,
      status: selectedInvoice.status,
      balance_due: selectedInvoice.balanceDue,
    },
  },
  null,
  2
)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Creation / Edit Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl w-full max-w-3xl shadow-xl space-y-4 p-6 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {editingInvoiceId ? "Edit Invoice" : "Create New Invoice"}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Invoice #
                </label>
                <input
                  type="text"
                  value={formInvoiceNumber}
                  onChange={(e) => setFormInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Customer / Company
                </label>
                <input
                  type="text"
                  value={formCompanyName}
                  onChange={(e) => setFormCompanyName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formCustomerEmail}
                  onChange={(e) => setFormCustomerEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formIssueDate}
                  onChange={(e) => setFormIssueDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Payment Terms
                </label>
                <select
                  value={formPaymentTerms}
                  onChange={(e) => setFormPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Net 90">Net 90</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Line Items Grid Editor */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs">Line Items</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormItems((prev) => [
                      ...prev,
                      {
                        id: `item-${Date.now()}-${prev.length + 1}`,
                        itemCode: `SKU-${prev.length + 1}`,
                        description: "New Service / Product Item",
                        quantity: 1,
                        unitPrice: 1000,
                        discountPercent: 0,
                        taxRate: 0.08,
                      },
                    ])
                  }
                  className="px-2.5 py-1 rounded bg-muted border border-border text-foreground hover:bg-accent text-[11px] font-medium flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Line Item
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {formItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 bg-muted/20 border border-border rounded-lg text-xs"
                  >
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, itemCode: val } : it))
                          );
                        }}
                        placeholder="SKU / Code"
                        className="w-full px-2 py-1 bg-background border border-input rounded text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, description: val } : it))
                          );
                        }}
                        placeholder="Item Description"
                        className="w-full px-2 py-1 bg-background border border-input rounded text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1;
                          setFormItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, quantity: val } : it))
                          );
                        }}
                        placeholder="Qty"
                        className="w-full px-2 py-1 bg-background border border-input rounded text-xs font-mono text-right"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, unitPrice: val } : it))
                          );
                        }}
                        placeholder="Unit Price"
                        className="w-full px-2 py-1 bg-background border border-input rounded text-xs font-mono text-right"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => setFormItems((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-500 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations & Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Tax Rate %:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formTaxRate}
                    onChange={(e) => setFormTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-background border border-input rounded font-mono text-xs"
                  />
                  <span className="text-muted-foreground font-mono">
                    ({(formTaxRate * 100).toFixed(1)}%)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Discount:
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="px-2 py-1 bg-background border border-input rounded text-xs"
                  >
                    <option value="fixed">Fixed ($)</option>
                    <option value="percentage">Percent (%)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-background border border-input rounded font-mono text-xs"
                  />
                </div>
              </div>

              {/* Real-time Computed Totals */}
              <div className="p-3 bg-muted/30 border border-border rounded-lg font-mono text-xs space-y-1 text-right">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>${editorCalculation.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount:</span>
                  <span>-${editorCalculation.discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax:</span>
                  <span>+${editorCalculation.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground border-t border-border pt-1">
                  <span>Grand Total:</span>
                  <span>${editorCalculation.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice("draft")}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice("issued")}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Save & Issue Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Record Payment for {selectedInvoice.invoiceNumber}
              </h2>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Invoice Amount:</span>
                  <span className="font-mono font-bold text-foreground">
                    ${selectedInvoice.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span>Current Balance Due:</span>
                  <span className="font-mono">
                    ${selectedInvoice.balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="stripe_credit_card">Stripe Credit Card</option>
                  <option value="bank_wire">Bank Wire Transfer</option>
                  <option value="ach_transfer">ACH Corporate Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Transaction Reference / Auth Code
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. WIRE-884291 or ch_3N84k..."
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Settlement Notes
                </label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Confirm & Post Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
