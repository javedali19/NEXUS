"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Users,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui";

type DealStage = "qualification" | "proposal" | "negotiation" | "won";

interface DealItem {
  id: string;
  title: string;
  company: string;
  amount: number;
  stage: DealStage;
  probability: number;
  contactName: string;
}

const INITIAL_DEALS: DealItem[] = [
  {
    id: "deal-1",
    title: "Starter Cloud Package",
    company: "Acme Corp Ltd",
    amount: 18000.0,
    stage: "qualification",
    probability: 30,
    contactName: "Alex Rivera",
  },
  {
    id: "deal-2",
    title: "Enterprise Multi-Region Rollout",
    company: "NexusOps Systems",
    amount: 38000.0,
    stage: "proposal",
    probability: 60,
    contactName: "Michael Chen",
  },
  {
    id: "deal-3",
    title: "Omnichannel Communications Hub",
    company: "Apex Global FinTech",
    amount: 72000.0,
    stage: "negotiation",
    probability: 80,
    contactName: "Elena Rostova",
  },
  {
    id: "deal-4",
    title: "Enterprise Expansion Phase 2",
    company: "Acme Global Solutions",
    amount: 145000.0,
    stage: "won",
    probability: 100,
    contactName: "Sarah Jenkins",
  },
  {
    id: "deal-5",
    title: "AI Voice Telephony Trunk",
    company: "Vanguard Logistics",
    amount: 24500.0,
    stage: "proposal",
    probability: 50,
    contactName: "David Miller",
  },
];

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: "qualification", label: "Qualification", color: "border-sky-500/30 text-sky-500" },
  { id: "proposal", label: "Proposal", color: "border-indigo-500/30 text-indigo-500" },
  { id: "negotiation", label: "Negotiation", color: "border-amber-500/30 text-amber-500" },
  { id: "won", label: "Closed Won", color: "border-emerald-500/30 text-emerald-500" },
];

export default function CrmPage() {
  const { showToast } = useToast();
  const [deals, setDeals] = useState<DealItem[]>(INITIAL_DEALS);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Deal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newStage, setNewStage] = useState<DealStage>("qualification");
  const [newContact, setNewContact] = useState("");

  const filteredDeals = deals.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.company.toLowerCase().includes(search.toLowerCase()) ||
      d.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPipeline = deals.reduce((acc, d) => acc + d.amount, 0);
  const wonRevenue = deals.filter((d) => d.stage === "won").reduce((acc, d) => acc + d.amount, 0);
  const weightedPipeline = deals.reduce((acc, d) => acc + (d.amount * d.probability) / 100, 0);

  const moveDeal = (id: string, direction: "next" | "prev") => {
    const stageOrder: DealStage[] = ["qualification", "proposal", "negotiation", "won"];
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== id) return deal;
        const currentIdx = stageOrder.indexOf(deal.stage);
        const newIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1;
        if (newIdx < 0 || newIdx >= stageOrder.length) return deal;
        const newStageVal = stageOrder[newIdx];
        const newProb =
          newStageVal === "qualification" ? 30 : newStageVal === "proposal" ? 60 : newStageVal === "negotiation" ? 80 : 100;

        showToast({
          title: "Deal Stage Advanced",
          description: `"${deal.title}" advanced to ${newStageVal.toUpperCase()} (${newProb}% probability).`,
          type: "success",
        });

        return { ...deal, stage: newStageVal, probability: newProb };
      })
    );
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    const prob =
      newStage === "qualification" ? 30 : newStage === "proposal" ? 60 : newStage === "negotiation" ? 80 : 100;

    const newDeal: DealItem = {
      id: `deal-${Date.now()}`,
      title: newTitle,
      company: newCompany || "Acme Enterprise Client",
      amount: parseFloat(newAmount) || 20000,
      stage: newStage,
      probability: prob,
      contactName: newContact || "Primary Stakeholder",
    };

    setDeals([newDeal, ...deals]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewCompany("");
    setNewAmount("");
    setNewContact("");

    showToast({
      title: "Deal Created",
      description: `"${newDeal.title}" added to CRM pipeline with PostgreSQL RLS context.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                CRM Pipeline & Deals
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-stage enterprise revenue progression with customer identity synchronization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/leads"
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Users className="h-4 w-4" /> View Leads
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            id="create-deal-btn"
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md shadow-sky-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Deal
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Total Pipeline Value
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            ${totalPipeline.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {deals.length} Active Enterprise Deals
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Weighted Forecast
          </span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
            ${weightedPipeline.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
            Probability Adjusted
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Closed Won Revenue
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            ${wonRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
            <CheckCircle2 className="h-3 w-3" /> Auto-Invoiced to ERP
          </span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search deals, companies, contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Showing {filteredDeals.length} deals
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((acc, d) => acc + d.amount, 0);

          return (
            <div
              key={stage.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col space-y-3 min-h-[420px]"
            >
              {/* Stage Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {stage.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-semibold">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                  ${stageTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Deals List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageDeals.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
                    No deals in this stage
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-sky-300 dark:hover:border-sky-700 transition-all space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                          {deal.company}
                        </span>
                        <span>{deal.probability}% Prob</span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {deal.title}
                      </h3>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                          ${deal.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {deal.contactName}
                        </span>
                      </div>

                      {/* Stage Progression Action Buttons */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                        {deal.stage !== "qualification" ? (
                          <button
                            onClick={() => moveDeal(deal.id, "prev")}
                            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer font-medium"
                          >
                            <ArrowLeft className="h-3 w-3" /> Back
                          </button>
                        ) : (
                          <span />
                        )}

                        {deal.stage !== "won" ? (
                          <button
                            onClick={() => moveDeal(deal.id, "next")}
                            className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold flex items-center gap-0.5 cursor-pointer ml-auto"
                          >
                            Advance <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 ml-auto">
                            <CheckCircle2 className="h-3 w-3" /> Closed Won
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky-500" />
                Create New Sales Deal
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deal Name / Project *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Call Center Migration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Global Logistics Holdings"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deal Value (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="35000.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as DealStage)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="qualification">Qualification (30%)</option>
                    <option value="proposal">Proposal (60%)</option>
                    <option value="negotiation">Negotiation (80%)</option>
                    <option value="won">Closed Won (100%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. David Miller"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
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
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-colors cursor-pointer"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
