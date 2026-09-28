"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shell";
import {
  Card,
  Badge,
  Button,
  Input,
  Dialog,
  Tabs,
  StatusIndicator,
  useToast,
} from "@/components/ui";
import {
  Users,
  Mail,
  Phone,
  DollarSign,
  Activity,
  Bot,
  ChevronRight,
  Plus,
  TrendingUp,
  Sparkles,
  Zap,
  ExternalLink,
} from "lucide-react";

interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  lifecycleStage: "lead" | "prospect" | "customer";
  leadScore: number;
  ltv: number;
  tags: string[];
}

const initialCustomers: CustomerData[] = [
  {
    id: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    firstName: "Sarah",
    lastName: "Jenkins",
    company: "Acme Global Solutions",
    title: "VP of Engineering",
    email: "sarah.j@acmeglobal.com",
    phone: "+1 (555) 234-5678",
    lifecycleStage: "customer",
    leadScore: 92,
    ltv: 145000.0,
    tags: ["enterprise", "vip", "ai-enabled"],
  },
  {
    id: "c2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
    firstName: "Michael",
    lastName: "Chen",
    company: "NexusOps Systems",
    title: "Chief Technology Officer",
    email: "mchen@nexusops.io",
    phone: "+1 (555) 876-5432",
    lifecycleStage: "prospect",
    leadScore: 78,
    ltv: 38000.0,
    tags: ["cloud-native", "evaluating"],
  },
];

export default function Customer360Page() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [selectedId, setSelectedId] = useState(initialCustomers[0].id);
  const [timelineFilter, setTimelineFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const activeCustomer = customers.find((c) => c.id === selectedId) || customers[0];

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirst || !newEmail) return;

    const newCust: CustomerData = {
      id: Math.random().toString(36).substring(2, 9),
      firstName: newFirst,
      lastName: newLast || "Client",
      company: newCompany || "Acme Partner",
      title: "Executive Lead",
      email: newEmail,
      phone: "+1 (555) 000-1122",
      lifecycleStage: "lead",
      leadScore: 50,
      ltv: 0.0,
      tags: ["new-lead"],
    };

    setCustomers((prev) => [newCust, ...prev]);
    setSelectedId(newCust.id);
    setIsModalOpen(false);

    // Reset Form
    setNewFirst("");
    setNewLast("");
    setNewCompany("");
    setNewEmail("");

    showToast({
      title: "Shared Customer Created",
      message: `Profile for ${newCust.firstName} ${newCust.lastName} propagated to CRM, ERP, and Outbox.`,
      type: "success",
    });
  };

  const timelineEntries = [
    {
      id: "t1",
      module: "ai_comms",
      title: "AI Voice Call Completed & Transcribed",
      desc: "AI Sentiment: +0.85 (High). Customer discussed upgrading 50 additional engineer seats.",
      time: "Today, 09:12 AM",
      icon: <Bot className="h-3.5 w-3.5 text-purple-400" />,
      badge: "AI Telephony",
      color: "border-purple-500/30",
    },
    {
      id: "t2",
      module: "erp",
      title: "ERP Invoice #INV-2026-089 Paid ($45,000.00)",
      desc: "Payment posted via Wire Transfer. Transactional Outbox published event to GCP Pub/Sub.",
      time: "Yesterday, 04:30 PM",
      icon: <DollarSign className="h-3.5 w-3.5 text-emerald-400" />,
      badge: "ERP Finance",
      color: "border-emerald-500/30",
    },
    {
      id: "t3",
      module: "crm",
      title: "CRM Deal 'Enterprise Expansion' Advanced to Closed-Won",
      desc: "Deal value $145,000.00 won. Auto-invoicing workflow triggered.",
      time: "2 days ago",
      icon: <TrendingUp className="h-3.5 w-3.5 text-sky-400" />,
      badge: "CRM Sales",
      color: "border-sky-500/30",
    },
  ];

  const filteredTimeline =
    timelineFilter === "all"
      ? timelineEntries
      : timelineEntries.filter((t) => t.module === timelineFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer 360 - Single Source of Truth"
        description="Unified customer profile, shared interaction history, and outbox event streams shared across CRM, ERP, and AI Comms."
        icon={<Users className="h-5 w-5 text-emerald-400" />}
        breadcrumbs={[{ label: "Customer 360" }]}
        badgeText="Unified Identity Core"
        badgeVariant="primary"
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Shared Customer
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer Directory */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Tenant Directory ({customers.length})
            </h2>
            <Badge variant="rls" size="sm">RLS Protected</Badge>
          </div>

          <div className="space-y-2">
            {customers.map((c) => {
              const isSelected = selectedId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? "border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/30 shadow-2xs"
                      : "border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {c.firstName} {c.lastName}
                    </span>
                    <Badge
                      variant={c.lifecycleStage === "customer" ? "success" : "warning"}
                      size="sm"
                    >
                      {c.lifecycleStage}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{c.company}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>LTV: ${c.ltv.toLocaleString()}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
                      Score {c.leadScore} <ChevronRight className="h-3 w-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Customer 360 Detail View */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-6">
            {/* Customer Profile Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-2xs shrink-0">
                  {activeCustomer.firstName[0]}
                  {activeCustomer.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {activeCustomer.firstName} {activeCustomer.lastName}
                    </h2>
                    <Badge variant="primary" size="sm">
                      {activeCustomer.lifecycleStage}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeCustomer.title} at{" "}
                    <strong className="text-slate-700 dark:text-slate-300 font-medium">{activeCustomer.company}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">AI Lead Score</span>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {activeCustomer.leadScore}/100
                  </span>
                </div>
                <Link href={`/customers/${activeCustomer.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                    Open Customer 360
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cross-Module Data Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Contact Channel</span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1 flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {activeCustomer.email}
                </p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {activeCustomer.phone}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">ERP Lifetime Value</span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  ${activeCustomer.ltv.toLocaleString()}.00
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Verified PostgreSQL RLS Ledger</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Unified Tags</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {activeCustomer.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Universal Timeline */}
            <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Centralized Interaction Timeline
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time cross-module event stream shared by CRM, ERP, and AI Comms
                  </p>
                </div>

                <Tabs
                  tabs={[
                    { id: "all", label: "All" },
                    { id: "ai_comms", label: "AI Comms" },
                    { id: "erp", label: "ERP" },
                    { id: "crm", label: "CRM" },
                  ]}
                  activeTab={timelineFilter}
                  onChange={setTimelineFilter}
                />
              </div>

              <div className="space-y-2.5">
                {filteredTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        {item.icon}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Dialog: Add Customer */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Shared Customer"
        description="Provision a unified customer identity shared instantly across CRM, ERP, and AI Telephony."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              required
              value={newFirst}
              onChange={(e) => setNewFirst(e.target.value)}
              placeholder="e.g. Eleanor"
            />
            <Input
              label="Last Name"
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
              placeholder="e.g. Vance"
            />
          </div>
          <Input
            label="Corporate Email"
            required
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="e.g. eleanor@vance.io"
          />
          <Input
            label="Company Account"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            placeholder="e.g. Vance Technologies"
          />

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save & Propagate
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
