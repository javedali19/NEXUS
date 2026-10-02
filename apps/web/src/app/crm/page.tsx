"use client";

import React from "react";
import { Building, TrendingUp, Plus, ArrowRight } from "lucide-react";

export default function CrmPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building className="h-6 w-6 text-sky-400" />
            CRM Pipeline & Deal Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sales pipeline advancing leads into active shared customer identities with instant timeline entry generation.
          </p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors shadow-lg shadow-sky-600/30 flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Create Deal
        </button>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Qualification Column */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Qualification</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">1</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Acme Corp</span>
            <h3 className="text-xs font-bold text-white">Starter Cloud Package</h3>
            <p className="text-xs font-semibold text-sky-400">$18,000.00</p>
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60">
              <span>Prob: 30%</span>
              <span className="text-indigo-400 cursor-pointer flex items-center">
                Move <ArrowRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Proposal Column */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Proposal</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">1</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-mono">NexusOps</span>
            <h3 className="text-xs font-bold text-white">Cloud Rollout</h3>
            <p className="text-xs font-semibold text-sky-400">$38,000.00</p>
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60">
              <span>Prob: 60%</span>
              <span className="text-indigo-400 cursor-pointer flex items-center">
                Move <ArrowRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Negotiation Column */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Negotiation</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">0</span>
          </div>
          <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-[11px] text-slate-500">
            Drop deal here
          </div>
        </div>

        {/* Closed Won Column */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Closed Won</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 font-mono">1</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
            <span className="text-[10px] text-emerald-400 uppercase font-mono">Acme Global</span>
            <h3 className="text-xs font-bold text-white">Enterprise Expansion Phase 2</h3>
            <p className="text-xs font-extrabold text-emerald-400">$145,000.00</p>
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60">
              <span className="text-emerald-400 font-semibold">Won & Synced</span>
              <span className="text-indigo-400 font-mono">Auto-Invoiced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
