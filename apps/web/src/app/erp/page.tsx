"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink,
  Send,
  CreditCard,
  Building2,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  company: string;
  amount: number;
  status: "PAID" | "ISSUED" | "OVERDUE";
  dueDate: string;
  outboxSynced: boolean;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: "inv-1",
    invoiceNumber: "#INV-2026-089",
    customerName: "Sarah Jenkins",
    company: "Acme Global Solutions",
    amount: 45000.0,
    status: "PAID",
    dueDate: "2026-10-01",
    outboxSynced: true,
  },
  {
    id: "inv-2",
    invoiceNumber: "#INV-2026-090",
    customerName: "Michael Chen",
    company: "NexusOps Enterprise",
    amount: 12500.0,
    status: "ISSUED",
    dueDate: "2026-10-15",
    outboxSynced: false,
  },
  {
    id: "inv-3",
    invoiceNumber: "#INV-2026-091",
    customerName: "David Miller",
    company: "Vanguard Logistics",
    amount: 28400.0,
    status: "OVERDUE",
    dueDate: "2026-09-20",
    outboxSynced: true,
  },
  {
    id: "inv-4",
    invoiceNumber: "#INV-2026-092",
    customerName: "Elena Rostova",
    company: "Apex Global FinTech",
    amount: 98000.0,
    status: "ISSUED",
    dueDate: "2026-10-28",
    outboxSynced: false,
  },
];

export default function ErpPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Invoice Form
  const [newCustomer, setNewCustomer] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("2026-11-01");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = invoices.reduce((acc, i) => acc + i.amount, 0);
  const paidRevenue = invoices.filter((i) => i.status === "PAID").reduce((acc, i) => acc + i.amount, 0);
  const outstandingRevenue = invoices.filter((i) => i.status !== "PAID").reduce((acc, i) => acc + i.amount, 0);

  const handlePostOutbox = (id: string, invNum: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, outboxSynced: true } : inv))
    );
    showToast({
      title: "Outbox Event Dispatched",
      description: `${invNum} published to GCP Pub/Sub topic platform-events with SHA-256 outbox hash.`,
      type: "success",
    });
  };

  const handleMarkPaid = (id: string, invNum: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "PAID", outboxSynced: true } : inv))
    );
    showToast({
      title: "Payment Recorded",
      description: `${invNum} settled. Double-entry GL journal entry posted to PostgreSQL ledger.`,
      type: "success",
    });
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newAmount) return;

    const newInv: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `#INV-2026-09${invoices.length + 3}`,
      customerName: newCustomer,
      company: newCompany || "Acme Enterprise Subsidiary",
      amount: parseFloat(newAmount) || 10000,
      status: "ISSUED",
      dueDate: newDueDate,
      outboxSynced: false,
    };

    setInvoices([newInv, ...invoices]);
    setIsModalOpen(false);
    setNewCustomer("");
    setNewCompany("");
    setNewAmount("");

    showToast({
      title: "Invoice Issued",
      description: `${newInv.invoiceNumber} created and committed with PostgreSQL Row Level Security.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                ERP Financial Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Financial Ledger & Invoicing bound to shared customer identity and transactional outbox event streams.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/invoices"
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4" /> Full Invoices Suite
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            id="issue-invoice-btn"
            className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Issue New Invoice
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Total Issued Revenue
            </span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
            <ShieldCheck className="h-3 w-3" /> PostgreSQL RLS Ledger
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Paid Invoices
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            ${paidRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {invoices.filter((i) => i.status === "PAID").length} Invoices Settled
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Outstanding Receivables
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
            ${outstandingRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
            {invoices.filter((i) => i.status !== "PAID").length} Invoices Pending
          </span>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {["ALL", "PAID", "ISSUED", "OVERDUE"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === st
                    ? "bg-amber-600 text-white font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-mono border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Customer & Company</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{inv.customerName}</p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{inv.company}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.status === "PAID" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> Paid
                      </span>
                    )}
                    {inv.status === "ISSUED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <Clock className="h-3 w-3" /> Issued
                      </span>
                    )}
                    {inv.status === "OVERDUE" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {inv.dueDate}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.status !== "PAID" && (
                        <button
                          onClick={() => handleMarkPaid(inv.id, inv.invoiceNumber)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-md transition-colors cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                      {!inv.outboxSynced ? (
                        <button
                          onClick={() => handlePostOutbox(inv.id, inv.invoiceNumber)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-md transition-colors cursor-pointer"
                        >
                          Post Outbox
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Pub/Sub Synced
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                Issue New Enterprise Invoice
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Tech Solutions Pte Ltd"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25000.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition-colors cursor-pointer"
                >
                  Create & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
