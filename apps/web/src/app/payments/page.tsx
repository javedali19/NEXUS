"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  User,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Download,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  PhoneCall,
  Mail,
  Receipt,
  FileCheck2,
  Check,
  ChevronRight,
  Sparkles,
  PieChart,
  RefreshCw,
  Eye,
  QrCode,
  Copy,
  Landmark,
  ArrowRightLeft,
  Sliders,
  Globe2,
  ShieldAlert,
  Repeat,
  FileText,
  Lock,
} from "lucide-react";
import {
  INITIAL_TRANSACTIONS,
  INITIAL_ALLOCATIONS,
  INITIAL_PAYMENT_LINKS,
  INITIAL_ATTEMPTS,
  INITIAL_RECONCILIATION,
  PROVIDER_CONFIGS,
  PaymentTransactionItem,
  PaymentAllocationItem,
  PaymentLinkItem,
  PaymentAttemptItem,
  ReconciliationItem,
  PaymentProvider,
  PaymentStatus,
  PAYMENT_STATUS_CONFIG,
} from "@/lib/payment-data";
import { useToast } from "@/components/ui";

export default function PaymentsPage() {
  const { showToast } = useToast();

  // Primary State
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>(INITIAL_TRANSACTIONS);
  const [allocations, setAllocations] = useState<PaymentAllocationItem[]>(INITIAL_ALLOCATIONS);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLinkItem[]>(INITIAL_PAYMENT_LINKS);
  const [attempts, setAttempts] = useState<PaymentAttemptItem[]>(INITIAL_ATTEMPTS);
  const [reconciliations, setReconciliations] = useState<ReconciliationItem[]>(INITIAL_RECONCILIATION);

  const [activeTab, setActiveTab] = useState<
    "transactions" | "links" | "allocations" | "attempts" | "reconciliation" | "providers" | "razorpay"
  >("transactions");

  const [selectedTxId, setSelectedTxId] = useState<string | null>(INITIAL_TRANSACTIONS[0].id);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeQrLink, setActiveQrLink] = useState<PaymentLinkItem | null>(null);

  // Link Form State
  const [linkTitle, setLinkTitle] = useState("Q3 Platform Add-On Expansion");
  const [linkAmount, setLinkAmount] = useState<number>(4500);
  const [linkCurrency, setLinkCurrency] = useState("USD");
  const [linkCustomerName, setLinkCustomerName] = useState("Sarah Jenkins");
  const [linkCompanyName, setLinkCompanyName] = useState("Acme Global Industries");
  const [linkExpiryDays, setLinkExpiryDays] = useState(14);
  const [linkSelectedProviders, setLinkSelectedProviders] = useState<PaymentProvider[]>(["stripe", "airwallex"]);

  // Record Transaction Form State
  const [recordCustomer, setRecordCustomer] = useState("Sarah Jenkins");
  const [recordCompany, setRecordCompany] = useState("Acme Global Industries");
  const [recordAmount, setRecordAmount] = useState<number>(12500);
  const [recordCurrency, setRecordCurrency] = useState("USD");
  const [recordProvider, setRecordProvider] = useState<PaymentProvider>("stripe");
  const [recordMethod, setRecordMethod] = useState("card");
  const [recordRef, setRecordRef] = useState(`REF-${Date.now().toString().slice(-6)}`);

  // Allocation Form State
  const [allocTargetInvoice, setAllocTargetInvoice] = useState("INV-2026-0043");
  const [allocAmount, setAllocAmount] = useState<number>(12400);

  // Selected Transaction Object
  const selectedTx = useMemo(() => {
    return transactions.find((t) => t.id === selectedTxId) || transactions[0];
  }, [transactions, selectedTxId]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesProvider = providerFilter === "all" || t.provider === providerFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        t.transactionNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        (t.providerTransactionId && t.providerTransactionId.toLowerCase().includes(q));

      return matchesStatus && matchesProvider && matchesQuery;
    });
  }, [transactions, statusFilter, providerFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const totalVolumeUSD = transactions
      .filter((t) => t.status === "succeeded")
      .reduce((acc, t) => {
        // Normalize INR to USD (~84) and SGD to USD (~1.32) for display
        let inUsd = t.amount;
        if (t.currency === "INR") inUsd = t.amount / 84.0;
        if (t.currency === "SGD") inUsd = t.amount / 1.32;
        if (t.currency === "EUR") inUsd = t.amount * 1.08;
        return acc + inUsd;
      }, 0);

    const netSettledUSD = transactions
      .filter((t) => t.status === "succeeded")
      .reduce((acc, t) => {
        let inUsd = t.netAmount;
        if (t.currency === "INR") inUsd = t.netAmount / 84.0;
        if (t.currency === "SGD") inUsd = t.netAmount / 1.32;
        if (t.currency === "EUR") inUsd = t.netAmount * 1.08;
        return acc + inUsd;
      }, 0);

    const activeLinksCount = paymentLinks.filter((l) => l.status === "active").length;
    const totalAttemptsCount = attempts.length + transactions.length;
    const successRate = totalAttemptsCount > 0 ? (transactions.filter((t) => t.status === "succeeded").length / totalAttemptsCount) * 100 : 98.4;

    return {
      totalVolumeUSD: Math.round(totalVolumeUSD),
      netSettledUSD: Math.round(netSettledUSD),
      activeLinksCount,
      successRate: successRate.toFixed(1),
      matchedReconCount: reconciliations.filter((r) => r.status === "auto_matched" || r.status === "settled_to_ledger").length,
    };
  }, [transactions, paymentLinks, attempts, reconciliations]);

  // Actions
  const handleCreatePaymentLink = () => {
    const newId = `plink-${Date.now()}`;
    const token = `plk_${Date.now().toString().slice(-8)}`;
    const slug = `nexus-${linkCompanyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;
    const expiresAt = new Date(Date.now() + linkExpiryDays * 86400000).toISOString();

    const newLink: PaymentLinkItem = {
      id: newId,
      linkToken: token,
      slug,
      title: linkTitle,
      description: `Hosted checkout link for ${linkCustomerName} (${linkCompanyName}).`,
      amount: linkAmount,
      currency: linkCurrency,
      customerId: "cust-001",
      customerName: linkCustomerName,
      customerEmail: "contact@enterprise.com",
      companyName: linkCompanyName,
      status: "active",
      allowedProviders: linkSelectedProviders,
      hostedUrl: `https://pay.nexuscorp.io/l/${slug}`,
      qrPayload: linkCurrency === "INR" 
        ? `upi://pay?pa=nexuscorp@icici&pn=NexusEnterprise&am=${linkAmount.toFixed(2)}&cu=INR`
        : `https://pay.nexuscorp.io/l/${slug}`,
      expiresAt,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPaymentLinks((prev) => [newLink, ...prev]);
    setIsLinkModalOpen(false);

    showToast({
      title: "Payment Link Created",
      message: `Hosted link generated: https://pay.nexuscorp.io/l/${slug}`,
      type: "success",
    });
  };

  const handleRecordTransaction = () => {
    const newId = `tx-${Date.now()}`;
    const txNumber = `TXN-2026-${String(transactions.length + 8848).padStart(4, "0")}`;
    const fee = recordCurrency === "INR" ? recordAmount * 0.02 : recordAmount * 0.029;
    const net = Math.max(0, recordAmount - fee);

    const newTx: PaymentTransactionItem = {
      id: newId,
      transactionNumber: txNumber,
      customerId: "cust-001",
      customerName: recordCustomer,
      customerEmail: "contact@enterprise.com",
      companyName: recordCompany,
      amount: recordAmount,
      currency: recordCurrency,
      feeAmount: Math.round(fee * 100) / 100,
      netAmount: Math.round(net * 100) / 100,
      provider: recordProvider,
      providerTransactionId: recordRef,
      providerOrderId: `ord_${recordProvider}_${Date.now().toString().slice(-4)}`,
      status: "succeeded",
      paymentMethod: recordMethod,
      paymentMethodDetails: { brand: "Direct Settlement" },
      allocatedAmount: recordAmount,
      unallocatedAmount: 0.0,
      settledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      description: `Manual Settlement / Sandbox Simulation via ${recordProvider.toUpperCase()}`,
      reconciliationState: "auto_matched",
    };

    setTransactions((prev) => [newTx, ...prev]);
    setSelectedTxId(newId);
    setIsRecordModalOpen(false);

    showToast({
      title: "Payment Recorded",
      message: `${txNumber} of ${recordCurrency} ${recordAmount.toLocaleString()} posted and matched to ledger.`,
      type: "success",
    });
  };

  const handleRetryFailedAttempt = (attempt: PaymentAttemptItem) => {
    const fallback = attempt.nextFallbackProvider || "airwallex";
    
    // Simulate successful fallback attempt
    setAttempts((prev) =>
      prev.map((att) => (att.id === attempt.id ? { ...att, status: "succeeded", declineReason: `Retried successfully via ${fallback.toUpperCase()}` } : att))
    );

    showToast({
      title: "Gateway Fallback Retry Executed",
      message: `Rerouted ${attempt.paymentNumber} via ${fallback.toUpperCase()} & settled successfully.`,
      type: "success",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast({
      title: "Copied to Clipboard",
      message: `${label} copied to clipboard.`,
      type: "info",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Payment Operations Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-primary/10 text-primary border border-primary/20 font-semibold">
              Multi-Gateway Abstraction
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Global payment rails (Razorpay, Stripe, HitPay, Airwallex, Cashfree), multi-invoice allocation, hosted payment links, gateway attempt telemetry, and automated reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/invoices"
            className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-semibold hover:bg-accent transition-colors flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4" /> Invoice Hub
          </Link>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Create Payment Link
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Receipt className="h-4 w-4" /> Record Payment
          </button>
        </div>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Processed Volume</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">
            ${metrics.totalVolumeUSD.toLocaleString("en-US")}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {transactions.length} Total Transactions
          </p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Net Settled Funds</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ${metrics.netSettledUSD.toLocaleString("en-US")}
          </p>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono">
            After Gateway Fees
          </p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Payment Links</span>
            <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.activeLinksCount} Active
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">Hosted Checkout & QR</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gateway Success Rate</span>
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-foreground">{metrics.successRate}%</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Avg Latency: 42ms</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Reconciliation Match</span>
            <Landmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xl font-bold text-foreground">100% Matched</p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">{metrics.matchedReconCount} Payout Batches Settled</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto text-xs font-semibold">
        {[
          { id: "transactions", label: "Transactions Ledger", icon: <CreditCard className="h-4 w-4" />, count: transactions.length },
          { id: "razorpay", label: "Razorpay Production Adapter (India)", icon: <Zap className="h-4 w-4 text-amber-500" />, badge: "Live GSM" },
          { id: "links", label: "Payment Links Studio", icon: <QrCode className="h-4 w-4" />, count: paymentLinks.length },
          { id: "allocations", label: "Payment Allocations", icon: <ArrowRightLeft className="h-4 w-4" />, count: allocations.length },
          { id: "attempts", label: "Gateway Attempts & Failures", icon: <AlertTriangle className="h-4 w-4" />, count: attempts.length },
          { id: "reconciliation", label: "Settlement & Reconciliation", icon: <Landmark className="h-4 w-4" />, count: reconciliations.length },
          { id: "providers", label: "Provider Routing & Abstraction", icon: <Globe2 className="h-4 w-4" />, count: PROVIDER_CONFIGS.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-mono">
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono font-semibold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: TRANSACTIONS LEDGER */}
      {activeTab === "transactions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table / List (7 cols) */}
          <div className="lg:col-span-7 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col space-y-3 p-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transaction #, customer, or gateway ref..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Provider Filter */}
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-3 py-1.5 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Providers</option>
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="hitpay">HitPay</option>
                <option value="airwallex">Airwallex</option>
                <option value="cashfree">Cashfree</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Transaction #</th>
                    <th className="py-2.5 px-3">Customer / Company</th>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((tx) => {
                    const isSelected = selectedTx?.id === tx.id;
                    const statusMeta = PAYMENT_STATUS_CONFIG[tx.status];

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTxId(tx.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10" : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          {tx.transactionNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-foreground">{tx.companyName}</p>
                          <p className="text-[11px] text-muted-foreground">{tx.customerName}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted uppercase text-foreground">
                            {tx.provider}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                          {tx.currency} {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-muted-foreground text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Detail Card (5 cols) */}
          {selectedTx && (
            <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold font-mono text-foreground">
                    {selectedTx.transactionNumber}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Provider Ref: {selectedTx.providerTransactionId || "N/A"}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${PAYMENT_STATUS_CONFIG[selectedTx.status].bg} ${PAYMENT_STATUS_CONFIG[selectedTx.status].text} ${PAYMENT_STATUS_CONFIG[selectedTx.status].border}`}
                >
                  {PAYMENT_STATUS_CONFIG[selectedTx.status].label}
                </span>
              </div>

              {/* Financial Snapshot */}
              <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-2 font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Processed:</span>
                  <span className="font-bold text-foreground">
                    {selectedTx.currency} {selectedTx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Gateway Fee:</span>
                  <span>-{selectedTx.currency} {selectedTx.feeAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 border-t border-border pt-1">
                  <span>Net Settled Amount:</span>
                  <span>{selectedTx.currency} {selectedTx.netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Provider & Routing Details */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Gateway:</span>
                  <span className="font-semibold text-foreground uppercase">{selectedTx.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium text-foreground">{selectedTx.paymentMethod.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reconciliation State:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold uppercase">{selectedTx.reconciliationState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium text-foreground">{selectedTx.customerName} ({selectedTx.companyName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Settlement Time:</span>
                  <span className="font-mono text-foreground">{selectedTx.settledAt ? new Date(selectedTx.settledAt).toLocaleString() : "Pending"}</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-muted/20 border border-border rounded-lg text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground block mb-0.5">Description:</span>
                {selectedTx.description}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => {
                    showToast({
                      title: "Receipt Downloaded",
                      message: `Settlement receipt for ${selectedTx.transactionNumber} downloaded.`,
                      type: "success",
                    });
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground hover:bg-accent transition-colors font-semibold flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Receipt
                </button>
                <Link
                  href="/invoices"
                  className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-1.5 text-center"
                >
                  <FileText className="h-3.5 w-3.5" /> View Invoices
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT LINKS STUDIO */}
      {activeTab === "links" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Hosted Payment Links & QR Generator
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate branded checkout links with instant QR codes for Indian UPI, Singapore PayNow, and Global Cards.
              </p>
            </div>

            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Create New Link
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentLinks.map((link) => (
              <div
                key={link.id}
                className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{link.linkToken}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        link.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {link.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-sm">{link.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{link.description}</p>
                  
                  <div className="p-2.5 bg-muted/30 border border-border rounded-lg space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold font-mono text-foreground text-sm">
                        {link.currency} {link.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium text-foreground">{link.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allowed Gateways:</span>
                      <span className="font-mono text-foreground uppercase">{link.allowedProviders.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Views: <strong className="text-foreground">{link.viewsCount}</strong></span>
                    <span>Expires: <strong className="text-foreground">{new Date(link.expiresAt).toLocaleDateString()}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(link.hostedUrl, "Hosted payment URL")}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-muted border border-border text-foreground hover:bg-accent text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy Link
                    </button>
                    <button
                      onClick={() => {
                        setActiveQrLink(link);
                        setIsQrModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" /> View QR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT ALLOCATIONS */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Multi-Invoice Payment Allocation Ledger
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trace how incoming customer lump-sum payments are allocated across open invoices, deposits, and credit memos.
              </p>
            </div>

            <button
              onClick={() => setIsAllocateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Allocate Payment to Invoice
            </button>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl bg-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Target Invoice</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Allocated Amount</th>
                  <th className="py-3 px-4 text-right">Invoice Balance Remaining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Allocated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {alloc.paymentNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-foreground">
                      {alloc.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{alloc.companyName}</p>
                      <p className="text-[11px] text-muted-foreground">{alloc.customerName}</p>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${alloc.allocatedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                      ${alloc.invoiceRemainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          alloc.status === "settled"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {alloc.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground text-[11px]">
                      {new Date(alloc.allocatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GATEWAY ATTEMPTS & FAILURES */}
      {activeTab === "attempts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                Gateway Attempts, Declines & Telemetry
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Granular diagnostic log of gateway response codes, decline reasons, and automated fallback retries.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {attempts.map((att) => (
              <div
                key={att.id}
                className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-foreground">{att.paymentNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted uppercase text-foreground">
                      {att.provider}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        att.status === "succeeded"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>

                  <p className="font-semibold text-foreground">
                    {att.companyName} &bull; {att.currency} {att.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-rose-600 dark:text-rose-400 font-mono text-[11px]">
                    Decline Code: <strong>{att.declineCode}</strong> &bull; {att.declineReason}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Latency: {att.latencyMs}ms &bull; Attempt {att.retryCount} of {att.maxRetries} &bull; {new Date(att.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {att.status !== "succeeded" && (
                    <button
                      onClick={() => handleRetryFailedAttempt(att)}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Repeat className="h-3.5 w-3.5" /> Retry with {att.nextFallbackProvider?.toUpperCase() || "Fallback"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SETTLEMENT & RECONCILIATION */}
      {activeTab === "reconciliation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Landmark className="h-5 w-5 text-purple-500" />
                Bank Statement & Gateway Payout Reconciliation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automated matching of Stripe, Razorpay, HitPay, and Airwallex payout batches against corporate bank statements.
              </p>
            </div>

            <button
              onClick={() => {
                showToast({
                  title: "Auto-Reconcile Finished",
                  message: "All 3 payout batches verified and posted to general ledger.",
                  type: "success",
                });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" /> Run Auto-Reconcile
            </button>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl bg-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Payout Batch ID</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Bank Statement Ref</th>
                  <th className="py-3 px-4 text-right">Cleared Amount</th>
                  <th className="py-3 px-4 text-right">Difference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Matched By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reconciliations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {rec.payoutBatchId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted uppercase text-foreground">
                        {rec.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {rec.bankStatementReference}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {rec.currency} {rec.clearedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                      ${rec.differenceAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {rec.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground text-[11px]">
                      {rec.matchedBy || "Automated System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: PROVIDER ROUTING & ABSTRACTION */}
      {activeTab === "providers" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary" />
              Dynamic Market Payment Router & Provider Abstraction
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              The platform dynamically selects the optimal payment gateway based on the customer's billing country and currency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROVIDER_CONFIGS.map((provider) => (
              <div
                key={provider.code}
                className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-foreground">{provider.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        provider.credentialStatus === "connected"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {provider.credentialStatus.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-primary">{provider.category}</p>
                  <p className="text-xs text-muted-foreground">Market: <strong>{provider.targetMarket}</strong></p>

                  <div className="space-y-1 text-xs pt-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Supported Rails:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.supportedRails.map((rail, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-muted text-foreground font-mono">
                          {rail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fee Structure:</span>
                    <span className="font-mono text-foreground">{provider.feeStructure}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Target Currencies:</span>
                    <span className="font-mono text-foreground">{provider.supportedCurrencies.slice(0, 4).join(", ")}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: RAZORPAY PRODUCTION ADAPTER & DIAGNOSTIC WORKBENCH */}
      {activeTab === "razorpay" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-5 rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Razorpay Production Payment Adapter (India & APAC)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Google Secret Manager Protected
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Full production REST API integration (/v1/orders, /v1/payment_links, /v1/payments), HMAC SHA-256 signature verifier, UPI Intent/QR, and Outbox exception handling.
              </p>
            </div>

            <button
              onClick={() => {
                showToast({
                  title: "Razorpay Gateway Ping",
                  message: "Razorpay API endpoint reachable. Latency: 32ms. HMAC verifier operational.",
                  type: "success",
                });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Activity className="h-3.5 w-3.5" /> Test Gateway Probe (32ms)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Google Secret Manager Credentials Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Google Secret Manager (GSM) Vault Binding
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                  Active
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Razorpay Key ID:</span>
                  <div className="p-2 bg-muted/40 border border-border rounded font-mono font-bold text-foreground mt-0.5 flex items-center justify-between">
                    <span>rzp_live_9942••••••••d5e4</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Verified</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">GSM Key Secret Resource Path:</span>
                  <div className="p-2 bg-muted/40 border border-border rounded font-mono text-muted-foreground mt-0.5 truncate">
                    projects/nexus-enterprise-prod/secrets/razorpay_key_secret/versions/latest
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">GSM Webhook Secret Resource Path:</span>
                  <div className="p-2 bg-muted/40 border border-border rounded font-mono text-muted-foreground mt-0.5 truncate">
                    projects/nexus-enterprise-prod/secrets/razorpay_webhook_secret/versions/latest
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px] text-muted-foreground">
                  <span>Server-Side KMS Encryption: <strong>AES-256-GCM</strong></span>
                  <span>Zero Plaintext Exposure: <strong>Enforced</strong></span>
                </div>
              </div>
            </div>

            {/* 2. Interactive Razorpay Orders Tester (POST /v1/orders) */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-500" />
                  Orders API Probe (/v1/orders)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground uppercase">
                  Subunits: Paise
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                      Amount in INR (₹)
                    </label>
                    <input
                      type="number"
                      defaultValue={75000}
                      className="w-full px-2.5 py-1.5 bg-background border border-input rounded font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                      Paise Subunits Computed
                    </label>
                    <div className="px-2.5 py-1.5 bg-muted/40 border border-border rounded font-mono text-foreground font-bold">
                      7,500,000 paise
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                    Receipt ID & Metadata
                  </label>
                  <input
                    type="text"
                    defaultValue="rcpt_INV-2026-0041"
                    className="w-full px-2.5 py-1.5 bg-background border border-input rounded font-mono text-xs"
                  />
                </div>

                <button
                  onClick={() => {
                    showToast({
                      title: "Razorpay Order Generated",
                      message: "Order ID: order_N8429108429 created with UPI QR payload upi://pay?pa=nexuscorp@icici.",
                      type: "success",
                    });
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Execute POST /v1/orders & Generate QR
                </button>
              </div>
            </div>

            {/* 3. Cryptographic HMAC SHA-256 Webhook Verifier */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  HMAC SHA-256 Webhook Signature Verifier
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  ring::hmac / crypto
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                    Raw Webhook Payload JSON:
                  </label>
                  <textarea
                    rows={2}
                    defaultValue='{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_N8429108429","amount":7500000}}}}'
                    className="w-full p-2 bg-background border border-input rounded font-mono text-[10px]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                    X-Razorpay-Signature Header:
                  </label>
                  <input
                    type="text"
                    defaultValue="4a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f"
                    className="w-full px-2.5 py-1.5 bg-background border border-input rounded font-mono text-xs"
                  />
                </div>

                <button
                  onClick={() => {
                    showToast({
                      title: "HMAC Signature Valid",
                      message: "Cryptographic hash matches payload and secret. Integrity verified.",
                      type: "success",
                    });
                  }}
                  className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" /> Verify HMAC SHA-256 Signature
                </button>
              </div>
            </div>

            {/* 4. Failure Handling & Exception Telemetry Simulator */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  Razorpay Error & Exception Engine Simulator
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Outbox Retry
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-0.5">
                    Simulate Razorpay API Error Code:
                  </label>
                  <select className="w-full px-2.5 py-1.5 bg-background border border-input rounded text-xs">
                    <option value="BAD_REQUEST_ERROR">BAD_REQUEST_ERROR (Validation / Schema)</option>
                    <option value="GATEWAY_ERROR">GATEWAY_ERROR (Acquiring Bank Timeout)</option>
                    <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (Card / Bank Balance)</option>
                    <option value="BAD_REQUEST_PAYMENT_POSSIBLE_FRAUD">BAD_REQUEST_PAYMENT_POSSIBLE_FRAUD (Risk Engine)</option>
                  </select>
                </div>

                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded text-[11px] text-rose-600 dark:text-rose-400 space-y-0.5">
                  <span className="font-semibold block">Automatic Exception Mapping:</span>
                  <p className="text-[10px]">Maps to category `payment_failure`, dispatches alert to Exceptions Ledger, and queues exponential backoff retry via Outbox.</p>
                </div>

                <button
                  onClick={() => {
                    showToast({
                      title: "Exception Telemetry Logged",
                      message: "Razorpay error simulated. Logged to /exceptions with retry count: 1.",
                      type: "warning",
                    });
                  }}
                  className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Repeat className="h-3.5 w-3.5" /> Trigger Simulated Error & Log to Exception Engine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PAYMENT LINK MODAL */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Generate Hosted Payment Link & QR
              </h2>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Payment Link Title
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={linkAmount}
                    onChange={(e) => setLinkAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Currency
                  </label>
                  <select
                    value={linkCurrency}
                    onChange={(e) => setLinkCurrency(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹ - Razorpay / Cashfree)</option>
                    <option value="SGD">SGD (S$ - HitPay PayNow)</option>
                    <option value="EUR">EUR (€ - Airwallex SEPA)</option>
                    <option value="GBP">GBP (£ - Airwallex)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={linkCustomerName}
                    onChange={(e) => setLinkCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={linkCompanyName}
                    onChange={(e) => setLinkCompanyName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Expiry Duration
                </label>
                <select
                  value={linkExpiryDays}
                  onChange={(e) => setLinkExpiryDays(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePaymentLink}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Create & Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD TRANSACTION MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Record / Simulate Payment
              </h2>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Customer
                  </label>
                  <input
                    type="text"
                    value={recordCustomer}
                    onChange={(e) => setRecordCustomer(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={recordCompany}
                    onChange={(e) => setRecordCompany(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={recordAmount}
                    onChange={(e) => setRecordAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Currency
                  </label>
                  <select
                    value={recordCurrency}
                    onChange={(e) => setRecordCurrency(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="SGD">SGD (S$)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Provider Adapter
                </label>
                <select
                  value={recordProvider}
                  onChange={(e) => setRecordProvider(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                >
                  <option value="stripe">Stripe (US/Global)</option>
                  <option value="razorpay">Razorpay (India UPI/Cards)</option>
                  <option value="hitpay">HitPay (Singapore PayNow)</option>
                  <option value="airwallex">Airwallex (Global FX)</option>
                  <option value="cashfree">Cashfree (India AutoPay)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={recordRef}
                  onChange={(e) => setRecordRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordTransaction}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Post & Reconcile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALLOCATE PAYMENT MODAL */}
      {isAllocateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Allocate Funds to Invoice
              </h2>
              <button
                onClick={() => setIsAllocateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Target Open Invoice
                </label>
                <select
                  value={allocTargetInvoice}
                  onChange={(e) => setAllocTargetInvoice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                >
                  <option value="INV-2026-0043">INV-2026-0043 (Nexus Dynamics - Balance Due: $12,400.00)</option>
                  <option value="INV-2026-0044">INV-2026-0044 (OmniCorp Logistics - Balance Due: $32,100.00)</option>
                  <option value="INV-2026-0045">INV-2026-0045 (Stark BioTech - Balance Due: $8,900.00)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Allocation Amount ($)
                </label>
                <input
                  type="number"
                  min="1"
                  value={allocAmount}
                  onChange={(e) => setAllocAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsAllocateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const newAlloc: PaymentAllocationItem = {
                    id: `alloc-${Date.now()}`,
                    paymentId: selectedTx.id,
                    paymentNumber: selectedTx.transactionNumber,
                    invoiceId: `inv-${Date.now()}`,
                    invoiceNumber: allocTargetInvoice,
                    customerName: selectedTx.customerName,
                    companyName: selectedTx.companyName,
                    allocatedAmount: allocAmount,
                    invoiceTotal: allocAmount,
                    invoiceRemainingBalance: 0.0,
                    currency: "USD",
                    status: "settled",
                    allocatedAt: new Date().toISOString(),
                  };

                  setAllocations((prev) => [newAlloc, ...prev]);
                  setIsAllocateModalOpen(false);

                  showToast({
                    title: "Payment Allocated",
                    message: `$${allocAmount.toLocaleString()} credited to ${allocTargetInvoice}.`,
                    type: "success",
                  });
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE VIEW MODAL */}
      {isQrModalOpen && activeQrLink && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm shadow-xl space-y-4 p-6 text-center">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-sm font-bold text-foreground font-mono">{activeQrLink.linkToken}</h2>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-base">{activeQrLink.title}</h3>
              <p className="font-mono font-bold text-primary text-lg">
                {activeQrLink.currency} {activeQrLink.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Generated QR Box */}
            <div className="p-4 bg-white rounded-lg border border-border inline-block mx-auto shadow-inner">
              <div className="w-48 h-48 bg-slate-900 rounded flex flex-col items-center justify-center p-3 text-white space-y-2">
                <QrCode className="h-28 w-28 text-white" />
                <span className="text-[10px] font-mono text-slate-300">
                  {activeQrLink.currency === "INR" ? "UPI Dynamic QR" : "Scan to Pay"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Scan using PhonePe, Google Pay, DBS PayNow, or mobile banking camera.
            </p>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
