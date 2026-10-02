"use client";

import React from "react";
import { DollarSign, FileText, CheckCircle2, Clock, Plus, ExternalLink } from "lucide-react";

export default function ErpPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-amber-400" />
            ERP Financial Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Financial Ledger & Invoicing bound to shared customer identity and transactional outbox event streams.
          </p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors shadow-lg shadow-amber-600/30 flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Issue New Invoice
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Issued Revenue</span>
          <p className="text-2xl font-extrabold text-white">$1,845,200.00</p>
          <span className="text-[10px] text-emerald-400 font-mono">Posted to PostgreSQL RLS Ledger</span>
        </div>

        <div className="glass-card p-5 rounded-xl space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Paid Invoices</span>
          <p className="text-2xl font-extrabold text-emerald-400">$1,540,000.00</p>
          <span className="text-[10px] text-slate-500 font-mono">142 Invoices Settled</span>
        </div>

        <div className="glass-card p-5 rounded-xl space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Outstanding Receivables</span>
          <p className="text-2xl font-extrabold text-amber-400">$305,200.00</p>
          <span className="text-[10px] text-amber-400 font-mono">12 Invoices Pending</span>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-400" />
          Tenant Invoice Ledger
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Shared Customer</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Outbox Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-medium">1</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-white">#INV-2026-089</td>
                <td className="py-3.5 px-4 font-semibold text-indigo-300">Sarah Jenkins (Acme Global)</td>
                <td className="py-3.5 px-4 text-right font-bold text-white font-mono">$45,000.00</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Paid
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400 font-mono">2026-10-01</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    Pub/Sub Synced
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-medium">2</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-white">#INV-2026-090</td>
                <td className="py-3.5 px-4 font-semibold text-indigo-300">Michael Chen (NexusOps)</td>
                <td className="py-3.5 px-4 text-right font-bold text-white font-mono">$12,500.00</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Issued
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400 font-mono">2026-10-15</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 px-2 py-1 rounded border border-indigo-800">
                    Post Outbox Event
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
