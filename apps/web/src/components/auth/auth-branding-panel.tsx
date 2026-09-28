"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  TrendingUp,
  Landmark,
  Headphones,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Activity,
} from "lucide-react";

export const AuthBrandingPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1E293B] text-white p-10 xl:p-14 relative overflow-hidden border-r border-slate-800 select-none">
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
              NEXUS
            </h1>
            <span className="text-[10px] uppercase tracking-widest font-mono text-blue-400 block font-semibold">
              ERP + CRM + AI
            </span>
          </div>
        </Link>
      </div>

      {/* Center Value Proposition & Abstract Enterprise Workflow Architecture */}
      <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Autonomous Enterprise Operating System</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
            One platform. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
              Every business operation.
            </span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Synthesized operational intelligence unifying ERP financials, CRM pipelines, omnichannel AI telephony, and autonomous transactional outbox workflows.
          </p>
        </div>

        {/* Abstract 4-Quadrant Operational Architecture Visualization */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-2xl space-y-3 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Unified Data Fabric Architecture
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-medium">
              14/14 Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {/* Node 1: CRM & Sales */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>CRM & Growth</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">$4.25M In-Flight</p>
              <span className="text-[10px] text-slate-400">142 Leads • 38% Win</span>
            </div>

            {/* Node 2: ERP Financials */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Landmark className="h-3.5 w-3.5" />
                <span>ERP Financials</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">$1.84M Settled</p>
              <span className="text-[10px] text-slate-400">Auto Wire Reconciliation</span>
            </div>

            {/* Node 3: AI Telephony */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <Headphones className="h-3.5 w-3.5" />
                <span>AI Telephony</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">Twilio + Deepgram</p>
              <span className="text-[10px] text-slate-400">+0.88 Net Sentiment</span>
            </div>

            {/* Node 4: Autonomous Workflows */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <GitBranch className="h-3.5 w-3.5" />
                <span>Workflows Engine</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">Outbox Event Bus</p>
              <span className="text-[10px] text-slate-400">99.9% Policy Passed</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Isolation: PostgreSQL Tenant RLS</span>
            <span className="text-blue-400">Zero Direct DB Leak</span>
          </div>
        </div>

        {/* Enterprise Testimonial / Social Proof Card */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs space-y-2">
          <p className="italic text-slate-300 text-[11px] leading-relaxed">
            &ldquo;Nexus unified our entire ERP billing ledger and autonomous telephony into a single real-time console. Financial reconciliation time dropped by 84%.&rdquo;
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-blue-900/30">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
              SJ
            </div>
            <div>
              <p className="text-white font-semibold text-[11px] leading-none">Sarah Jenkins</p>
              <p className="text-[10px] text-slate-400">VP of Operations, Acme Global Solutions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Compliance & Security Assurance */}
      <div className="relative z-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          SOC2 Type II Certified
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-blue-400" />
          PostgreSQL RLS Enforced
        </span>
        <span>99.99% SLA Uptime</span>
      </div>
    </div>
  );
};
