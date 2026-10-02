"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  TrendingUp,
  Landmark,
  Headphones,
  ShieldCheck,
  Lock,
  Sparkles,
  Zap,
  Globe,
  ArrowUpRight,
  Users,
  Award,
} from "lucide-react";

export const AuthBrandingPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-[52%] flex-col justify-between relative overflow-hidden select-none auth-brand-panel">
      {/* Deep Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0c1425] to-[#0f172a]" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full auth-orb-1" />
      <div className="absolute bottom-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full auth-orb-2" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full auth-orb-3" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 auth-grid-pattern opacity-[0.04]" />

      {/* Seamless Right Edge Gradient */}
      <div className="auth-panel-edge" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
        
        {/* Top Brand */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-tight">
                NEXUS
              </h1>
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-blue-400/80 block font-semibold">
                Enterprise Platform
              </span>
            </div>
          </Link>

          {/* Trust Badges - Top Right */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="auth-trust-badge text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              <span>SOC2</span>
            </div>
            <div className="auth-trust-badge text-blue-400">
              <Award className="h-3 w-3" />
              <span>ISO 27001</span>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="my-auto py-8 space-y-8 max-w-[480px]">
          {/* Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-400/15 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 auth-sparkle" />
            <span className="text-[11px] font-medium text-blue-300/90 tracking-wide">
              Autonomous Enterprise OS
            </span>
          </div>
          
          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-[2.6rem] xl:text-[3rem] font-extrabold tracking-tight leading-[1.05]">
              <span className="text-white">One platform.</span>
              <br />
              <span className="auth-gradient-text">
                Every operation.
              </span>
            </h2>
            <p className="text-[14px] text-slate-400 leading-relaxed max-w-[420px]">
              Unified intelligence across ERP, CRM, AI telephony, 
              and autonomous workflows — all in one pane of glass.
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="auth-glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 auth-pulse-dot" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400/80 font-semibold">
                  Live Platform
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80 font-medium px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/15">
                All Systems Go
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* CRM */}
              <div className="auth-stat-card p-3.5 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">CRM</span>
                  </div>
                  <span className="auth-trend-up"><ArrowUpRight className="h-3 w-3" />12%</span>
                </div>
                <p className="text-xl font-bold text-white font-mono tracking-tight">$4.25M</p>
                <span className="text-[10px] text-slate-500">142 Active Leads</span>
              </div>

              {/* ERP */}
              <div className="auth-stat-card p-3.5 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Landmark className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">ERP</span>
                  </div>
                  <span className="auth-trend-up"><ArrowUpRight className="h-3 w-3" />8%</span>
                </div>
                <p className="text-xl font-bold text-white font-mono tracking-tight">$1.84M</p>
                <span className="text-[10px] text-slate-500">Auto Reconciled</span>
              </div>

              {/* AI */}
              <div className="auth-stat-card p-3.5 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Headphones className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">AI Voice</span>
                  </div>
                  <span className="auth-trend-up"><ArrowUpRight className="h-3 w-3" />24%</span>
                </div>
                <p className="text-xl font-bold text-white font-mono tracking-tight">+0.88</p>
                <span className="text-[10px] text-slate-500">Net Sentiment</span>
              </div>

              {/* Workflows */}
              <div className="auth-stat-card p-3.5 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Zap className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Engine</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-white font-mono tracking-tight">99.9%</p>
                <span className="text-[10px] text-slate-500">Event Processing</span>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="auth-glass-card p-5 rounded-xl space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[13px] text-slate-300/90 leading-relaxed italic">
              &ldquo;Nexus unified our entire ERP billing ledger and AI telephony 
              into a single real-time console. Reconciliation time dropped by 84%.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-lg shadow-blue-500/20">
                SJ
              </div>
              <div>
                <p className="text-white font-semibold text-[12px] leading-none">Sarah Jenkins</p>
                <p className="text-[11px] text-slate-500 mt-0.5">VP of Operations, Acme Global</p>
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="flex items-center gap-6 text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-blue-400/60" />
              <span>2,400+ Companies</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-indigo-400/60" />
              <span>48 Countries</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-wrap items-center gap-5 text-[11px] text-slate-500 font-mono pt-4 border-t border-white/[0.04]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/60" />SOC2 Type II
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-blue-400/60" />RLS Enforced
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-indigo-400/60" />99.99% SLA
          </span>
        </div>
      </div>
    </div>
  );
};
