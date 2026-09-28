"use client";

import React from "react";
import { Bot, PhoneCall, MessageSquare, Sparkles, Activity, Check } from "lucide-react";

export default function AiCommsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-400" />
            AI Communications & Telephony Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Omnichannel call transcription, sentiment score calculation, and real-time timeline event logging.
          </p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-lg shadow-purple-600/30 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" /> Trigger AI Call Transcription
        </button>
      </div>

      {/* Touchpoint Communications Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-purple-400" />
            Recent AI Telephony Touchpoints
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-xl glass-card border border-purple-500/20 bg-purple-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 font-mono border border-purple-800">
                    Channel: Phone Call
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                    Direction: Inbound
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Today, 09:12 AM</span>
              </div>

              <div>
                <span className="text-xs font-bold text-white">Customer: Sarah Jenkins (Acme Global)</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <strong className="text-purple-300">AI Summary:</strong> Customer requested pricing details for upgrading 50 additional engineer seats under the existing contract. Expressed high satisfaction with recent deployment stability.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-400">Sentiment Score:</span>
                  <span className="font-bold text-emerald-400">+0.85 (Highly Positive)</span>
                </div>
                <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                  <Check className="h-3 w-3" /> Logged to Customer 360
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl glass-card border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-sky-950 text-sky-300 font-mono border border-sky-800">
                    Channel: Email Sync
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                    Direction: Outbound
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Yesterday</span>
              </div>

              <div>
                <span className="text-xs font-bold text-white">Customer: Michael Chen (NexusOps)</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <strong className="text-purple-300">AI Summary:</strong> Proposal document dispatched automatically following workflow trigger.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-sky-400" />
                  <span className="text-slate-400">Sentiment Score:</span>
                  <span className="font-bold text-sky-400">+0.42 (Neutral Positive)</span>
                </div>
                <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                  <Check className="h-3 w-3" /> Logged to Customer 360
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Communications Capabilities Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            AI Telephony Features
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-semibold text-white">Real-Time Transcription</span>
              <p className="text-[11px] text-slate-400">Converts voice audio directly into searchable text streams.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-semibold text-white">Sentiment Analytics</span>
              <p className="text-[11px] text-slate-400">Classifies tone and satisfaction scores (-1.0 to +1.0).</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-semibold text-white">Automated Timeline Injection</span>
              <p className="text-[11px] text-slate-400">Posts transcripts instantly to shared customer timeline.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
