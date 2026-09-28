"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PiggyBank,
  TrendingUp,
  Clock,
  DollarSign,
  Bot,
  Zap,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart3,
  Calculator,
} from "lucide-react";
import {
  Badge,
  Sparkline,
  DonutProgress,
  Button,
} from "@/components/ui";

export default function RoiPage() {
  // Interactive ROI Simulator State
  const [teamSize, setTeamSize] = useState(5);
  const [hourlyWage, setHourlyWage] = useState(45);
  const [monthlyVolume, setMonthlyVolume] = useState(15000);

  // Dynamic calculations
  const simulatedHoursSaved = Math.round((monthlyVolume * 2) / 60); // ~2 mins saved per interaction
  const simulatedLaborCostSaved = simulatedHoursSaved * hourlyWage;
  const simulatedComputeCost = Math.round(monthlyVolume * 0.12); // ~$0.12 avg cost per AI interaction
  const simulatedNetSavings = simulatedLaborCostSaved - simulatedComputeCost;
  const simulatedAnnualized = simulatedNetSavings * 12;
  const simulatedRoiMultiplier =
    simulatedComputeCost > 0
      ? (simulatedLaborCostSaved / simulatedComputeCost).toFixed(1)
      : "10.0";

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600/30 to-teal-600/20 border border-emerald-500/30 text-emerald-400">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  AI Automation ROI Command Center
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  8.4x Financial Return
                </span>
                <Badge variant="success" size="sm">
                  Calculated Live
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Quantifiable economic impact, agent-assisted revenue velocity, labor cost reduction, and persona productivity ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/40 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Operational Analytics Hub →
          </Link>
        </div>
      </div>

      {/* 4 Core Hero ROI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Net Direct Savings */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Net Cost Savings
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">+24.2% MoM</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">$78,400/mo</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Net Value
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Direct operational expenses reduced
          </p>
        </div>

        {/* Metric 2: Agent Hours Saved */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sky-400" />
              Human Labor Preserved
            </span>
            <span className="text-xs text-sky-400 font-mono font-semibold">3.0 FTE Equiv</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">480 hrs/mo</span>
            <Sparkline data={[280, 310, 360, 410, 440, 465, 480]} color="#38bdf8" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Autonomous voice & WhatsApp triage
          </p>
        </div>

        {/* Metric 3: Agent-Assisted Revenue */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              Agent-Assisted Revenue
            </span>
            <span className="text-xs text-purple-400 font-mono font-semibold">Closed & Recovered</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">$842,500</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
              In-Flow
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Rachel Sales + Adam Collections
          </p>
        </div>

        {/* Metric 4: ROI Multiplier */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              ROI Capital Multiplier
            </span>
            <span className="text-xs text-amber-400 font-mono font-semibold">Net Multiple</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400 font-mono">8.4x</span>
            <span className="text-xs font-mono text-slate-400">per $1 invested</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Compute & telephony overhead: $1,800
          </p>
        </div>
      </div>

      {/* Main Grid: Persona Impact Ledger + Cost Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persona Impact Ledger */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">AI Agent Persona Productivity & Impact</h3>
              <p className="text-xs text-slate-400">Granular economic attribution per deployed persona</p>
            </div>
            <span className="text-xs font-mono text-slate-400">14,820 Total Actions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="pb-2 font-medium">Agent Persona</th>
                  <th className="pb-2 font-medium text-center">Actions</th>
                  <th className="pb-2 font-medium text-right">Revenue Inflow</th>
                  <th className="pb-2 font-medium text-right">Hours Saved</th>
                  <th className="pb-2 font-medium text-right">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="py-3 font-sans font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-400" />
                      <div>
                        <p className="font-semibold">Rachel</p>
                        <p className="text-[10px] text-slate-400 font-mono">Commercial AI Sales</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-300">5,240</td>
                  <td className="py-3 text-right text-purple-400 font-bold">$485,000</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">180 hrs</td>
                  <td className="py-3 text-right text-emerald-400 font-bold">+$492,480</td>
                </tr>

                <tr>
                  <td className="py-3 font-sans font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-sky-400" />
                      <div>
                        <p className="font-semibold">Adam</p>
                        <p className="text-[10px] text-slate-400 font-mono">Autonomous Collections</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-300">4,680</td>
                  <td className="py-3 text-right text-sky-400 font-bold">$298,000</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">160 hrs</td>
                  <td className="py-3 text-right text-emerald-400 font-bold">+$304,660</td>
                </tr>

                <tr>
                  <td className="py-3 font-sans font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-400" />
                      <div>
                        <p className="font-semibold">Nicole</p>
                        <p className="text-[10px] text-slate-400 font-mono">Billing & OCR Specialist</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-300">2,890</td>
                  <td className="py-3 text-right text-indigo-400 font-bold">$59,500</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">90 hrs</td>
                  <td className="py-3 text-right text-emerald-400 font-bold">+$63,170</td>
                </tr>

                <tr>
                  <td className="py-3 font-sans font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <div>
                        <p className="font-semibold">Support Copilot</p>
                        <p className="text-[10px] text-slate-400 font-mono">Tier-1 Support Triage</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-300">2,010</td>
                  <td className="py-3 text-right text-slate-500">—</td>
                  <td className="py-3 text-right text-sky-400 font-semibold">50 hrs</td>
                  <td className="py-3 text-right text-emerald-400 font-bold">+$1,990</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Total Net Economic Value Delivered:</span>
            <span className="text-emerald-400 font-bold text-sm">+$862,300</span>
          </div>
        </div>

        {/* Cost Comparison Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Cost Reduction Comparison</h3>
              <p className="text-xs text-slate-400">Human vs AI infrastructure</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">91.7% Less</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Equivalent Labor Cost:</span>
                <span className="text-white font-bold">$21,600/mo</span>
              </div>
              <p className="text-[10px] text-slate-400">480 hours @ $45.00/hr fully loaded</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">AI Compute & Telephony:</span>
                <span className="text-emerald-400 font-bold">$1,800/mo</span>
              </div>
              <p className="text-[10px] text-slate-400">Tokens, Twilio, Deepgram & ElevenLabs</p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1">
              <div className="flex justify-between">
                <span className="text-emerald-300 font-semibold">Net Monthly Operational Gain:</span>
                <span className="text-emerald-400 font-bold">+$19,800/mo</span>
              </div>
              <p className="text-[10px] text-emerald-400/80">Direct bottom-line margin expansion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive ROI Simulator */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Enterprise ROI Modeling Simulator</h3>
              <p className="text-xs text-slate-400">Simulate financial savings based on your team scale and workload volume</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
            Dynamic Simulator
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Team Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Human Agents Supported:</span>
              <span className="text-white font-bold">{teamSize} Reps</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-500">Sales reps, collections officers, and support staff</p>
          </div>

          {/* Slider 2: Wage Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Fully Loaded Wage Rate:</span>
              <span className="text-white font-bold">${hourlyWage}/hour</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              step="5"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-500">Base salary + benefits + overhead allocation</p>
          </div>

          {/* Slider 3: Monthly Interaction Volume */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Monthly AI Interactions:</span>
              <span className="text-white font-bold">{monthlyVolume.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="100000"
              step="1000"
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-500">WhatsApp chats, calls, quotes, dunning messages</p>
          </div>
        </div>

        {/* Dynamic Simulation Result Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800 text-center">
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] text-slate-400 font-mono uppercase">Preserved Labor Hours</p>
            <p className="text-lg font-bold font-mono text-white">{simulatedHoursSaved} hrs/mo</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] text-slate-400 font-mono uppercase">Monthly Net Savings</p>
            <p className="text-lg font-bold font-mono text-emerald-400">
              ${simulatedNetSavings.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] text-slate-400 font-mono uppercase">Annualized Impact</p>
            <p className="text-lg font-bold font-mono text-sky-400">
              ${simulatedAnnualized.toLocaleString()}/yr
            </p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30">
            <p className="text-[10px] text-indigo-300 font-mono uppercase">Simulated ROI Multiple</p>
            <p className="text-lg font-bold font-mono text-amber-400">{simulatedRoiMultiplier}x</p>
          </div>
        </div>
      </div>
    </div>
  );
}
