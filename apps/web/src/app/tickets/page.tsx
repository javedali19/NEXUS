"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket,
  Search,
  Filter,
  Plus,
  PhoneCall,
  LifeBuoy,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  User,
  Building,
  Send,
  Lock,
  Tag,
  History,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Phone,
  ArrowUpRight,
  TrendingUp,
  Table,
  LayoutList,
  Eye,
} from "lucide-react";
import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  getStoredTickets,
  updateTicketStatus,
  addTicketComment,
} from "@/lib/tickets-data";
import { RaiseTicketModal } from "@/components/tickets/raise-ticket-modal";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "split">("table");

  // Modal
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  // Comment Thread
  const [commentText, setCommentText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Detail Sub-tab
  const [activeDetailTab, setActiveDetailTab] = useState<"thread" | "activity" | "details">("thread");

  // Load and subscribe
  const loadTickets = () => {
    const list = getStoredTickets();
    setTickets(list);
    if (!selectedTicket && list.length > 0) {
      setSelectedTicket(list[0]);
    } else if (selectedTicket) {
      const updatedSelected = list.find((t) => t.id === selectedTicket.id);
      if (updatedSelected) setSelectedTicket(updatedSelected);
    }
  };

  useEffect(() => {
    loadTickets();
    const handleUpdate = () => loadTickets();
    window.addEventListener("nexus_tickets_updated", handleUpdate);
    return () => window.removeEventListener("nexus_tickets_updated", handleUpdate);
  }, []);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.companyName && t.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.sourceReferenceId && t.sourceReferenceId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchesSource = filterSource === "all" || t.sourceChannel === filterSource;

    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  // Handle comment submit
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    const updated = addTicketComment(selectedTicket.id, commentText.trim(), "Support Agent", isInternalNote);
    if (updated) {
      setSelectedTicket(updated);
      setCommentText("");
    }
  };

  // Handle status update
  const handleStatusChange = (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    const updated = updateTicketStatus(selectedTicket.id, newStatus, "Support Agent");
    if (updated) {
      setSelectedTicket(updated);
    }
  };

  // Channel Icon helper
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "voice_call":
        return <PhoneCall className="h-3.5 w-3.5 text-blue-600" />;
      case "whatsapp":
        return <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />;
      case "portal":
        return <LifeBuoy className="h-3.5 w-3.5 text-indigo-600" />;
      default:
        return <Ticket className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  // Priority Badge helper
  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case "critical":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">Critical</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">Medium</span>;
      case "low":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
    }
  };

  // Status Badge helper
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">New</span>;
      case "assigned":
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Assigned</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">In Progress</span>;
      case "pending_customer":
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Pending Customer</span>;
      case "resolved":
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      case "closed":
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  // Metrics
  const openCount = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length;
  const criticalCount = tickets.filter((t) => t.priority === "critical" || t.priority === "high").length;
  const voiceOriginCount = tickets.filter((t) => t.sourceChannel === "voice_call").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Support Tickets & Raising Module</h1>
              <p className="text-xs text-slate-500">
                Unified Omnichannel Ticketing connected with Voice Calls, Customer Support & Customer 360
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadTickets()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsRaiseModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Raise Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Tickets</span>
            <Ticket className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{tickets.length}</div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <span>{openCount} active tickets</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Urgent / High Priority</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{criticalCount}</div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            Requires priority SLA adherence
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Voice Call Origin</span>
            <PhoneCall className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{voiceOriginCount}</div>
          <div className="mt-1 text-[11px] text-indigo-700 font-medium">
            Linked to AI Telephony recordings
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Resolution Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {tickets.length > 0 ? `${Math.round((resolvedCount / tickets.length) * 100)}%` : "100%"}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            {resolvedCount} resolved tickets
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket #, subject, customer, company, or Call SID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-900"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2.5 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-medium outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_customer">Pending Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-medium outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-medium outline-hidden"
          >
            <option value="all">All Sources</option>
            <option value="voice_call">Voice Calls</option>
            <option value="portal">Support Portal</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      {/* View Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Display Mode:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Full Data Table (with S.No)</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span>Split Queue & Inspector</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <strong className="text-slate-800">{filteredTickets.length}</strong> of <strong className="text-slate-800">{tickets.length}</strong> tickets
        </div>
      </div>

      {/* Table View with Serial Numbers */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4 text-blue-600" />
              <span>Support Tickets Master Table</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Numbered Rows (S.No 1 to {filteredTickets.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 border-b border-slate-200/90 text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-3.5 py-3.5 text-center font-mono w-14">S.No</th>
                  <th className="px-4 py-3.5 w-36">Ticket #</th>
                  <th className="px-4 py-3.5 min-w-[260px]">Subject & Description</th>
                  <th className="px-4 py-3.5 w-48">Customer & Company</th>
                  <th className="px-3.5 py-3.5 text-center w-28">Channel</th>
                  <th className="px-3.5 py-3.5 w-36">Department</th>
                  <th className="px-3.5 py-3.5 text-center w-28">Priority</th>
                  <th className="px-3.5 py-3.5 text-center w-32">Status</th>
                  <th className="px-3.5 py-3.5 w-32 font-mono">SLA Target</th>
                  <th className="px-4 py-3.5 text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 text-xs">
                      No tickets matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t, index) => (
                    <tr
                      key={t.id}
                      onClick={() => {
                        setSelectedTicket(t);
                        setViewMode("split");
                      }}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        selectedTicket?.id === t.id ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {/* S.No column */}
                      <td className="px-3.5 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center h-6 w-7 rounded-md font-mono text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs">
                          {index + 1}
                        </span>
                      </td>

                      {/* Ticket # */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {t.ticketNumber}
                        </span>
                        {t.linkedCallSid && (
                          <div className="mt-0.5 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <PhoneCall className="h-2.5 w-2.5 text-blue-500" />
                            {t.linkedCallSid.slice(0, 10)}...
                          </div>
                        )}
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 leading-snug">{t.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.description}</div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{t.customerName}</div>
                        {t.companyName && (
                          <div className="text-[11px] text-slate-400">{t.companyName}</div>
                        )}
                      </td>

                      {/* Channel */}
                      <td className="px-3.5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                          {getSourceIcon(t.sourceChannel)}
                          {t.sourceChannel.replace("_", " ")}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-3.5 py-3.5 text-slate-700 font-medium">
                        {t.assignedDepartment}
                      </td>

                      {/* Priority */}
                      <td className="px-3.5 py-3.5 text-center">
                        {getPriorityBadge(t.priority)}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3.5 text-center">
                        {getStatusBadge(t.status)}
                      </td>

                      {/* SLA */}
                      <td className="px-3.5 py-3.5 font-mono text-[11px] text-amber-700 font-medium">
                        {t.slaResponseDue}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(t);
                            setViewMode("split");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Master-Detail Layout (Split View) */}
      {viewMode === "split" && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Ticket List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Ticket Queue ({filteredTickets.length})</span>
            <span className="text-[11px] text-slate-400 font-mono">Numbered S.No #1 - #{filteredTickets.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[750px]">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tickets matching current filters.
              </div>
            ) : (
              filteredTickets.map((t, index) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 cursor-pointer transition-all hover:bg-slate-50/80 ${
                      isSelected
                        ? "bg-blue-50/60 border-l-4 border-l-blue-600"
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {/* Serial Number Badge */}
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs" title={`Serial Number #${index + 1}`}>
                          #{index + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {t.ticketNumber}
                        </span>
                        {getPriorityBadge(t.priority)}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {getSourceIcon(t.sourceChannel)}
                        <span className="text-[11px] text-slate-400 capitalize">
                          {t.sourceChannel.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <h4 className="mt-1 text-xs font-semibold text-slate-900 line-clamp-1">
                      {t.title}
                    </h4>

                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1 font-medium truncate max-w-[180px]">
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{t.customerName}</span>
                        {t.companyName && (
                          <span className="text-slate-400 truncate">({t.companyName})</span>
                        )}
                      </div>
                      <div>{getStatusBadge(t.status)}</div>
                    </div>

                    {/* Quick Link Badge if Voice Call or Support Case */}
                    {(t.linkedCallSid || t.linkedSupportCaseId) && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        {t.linkedCallSid && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200/60">
                            <PhoneCall className="h-2.5 w-2.5 text-blue-600" />
                            Call: {t.linkedCallSid.slice(0, 10)}...
                          </span>
                        )}
                        {t.linkedSupportCaseId && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <LifeBuoy className="h-2.5 w-2.5 text-indigo-600" />
                            Case: {t.linkedSupportCaseId}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ticket Detail Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-200/80 space-y-3 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-sm font-bold text-blue-600 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                      {selectedTicket.ticketNumber}
                    </span>
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                      {getSourceIcon(selectedTicket.sourceChannel)}
                      {selectedTicket.sourceChannel.replace("_", " ")}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800 shadow-2xs outline-hidden"
                    >
                      <option value="new">New</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="pending_customer">Pending Customer</option>
                      <option value="resolved">Mark Resolved</option>
                      <option value="closed">Close Ticket</option>
                    </select>
                  </div>
                </div>

                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedTicket.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/70">
                  {selectedTicket.description}
                </p>

                {/* Connected Enterprise Entities Card */}
                <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span>Connected Project Entities</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {/* Voice Call Link */}
                    {selectedTicket.linkedCallSid ? (
                      <Link
                        href="/voice-calls"
                        className="p-2 rounded-lg bg-white border border-blue-200/80 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between group"
                      >
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block">Voice Call</span>
                          <span className="font-mono text-xs font-semibold text-blue-700 truncate block">
                            {selectedTicket.linkedCallSid.slice(0, 14)}...
                          </span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-100/60 border border-slate-200 text-slate-400">
                        <span className="text-[10px] block">Voice Call</span>
                        <span className="text-xs italic">No Call Linked</span>
                      </div>
                    )}

                    {/* Support Case Link */}
                    {selectedTicket.linkedSupportCaseId ? (
                      <Link
                        href="/support"
                        className="p-2 rounded-lg bg-white border border-blue-200/80 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between group"
                      >
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block">Support Case</span>
                          <span className="font-mono text-xs font-semibold text-indigo-700 truncate block">
                            {selectedTicket.linkedSupportCaseId}
                          </span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-100/60 border border-slate-200 text-slate-400">
                        <span className="text-[10px] block">Support Case</span>
                        <span className="text-xs italic">Direct Ticket</span>
                      </div>
                    )}

                    {/* Customer 360 Link */}
                    <Link
                      href="/customers"
                      className="p-2 rounded-lg bg-white border border-blue-200/80 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between group"
                    >
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block">Customer 360</span>
                        <span className="text-xs font-semibold text-slate-900 truncate block">
                          {selectedTicket.customerName}
                        </span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Metadata Summary Line */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <div className="flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Agent: <strong className="text-slate-800">{selectedTicket.assignedAgentName}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>Dept: <strong className="text-slate-800">{selectedTicket.assignedDepartment}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>SLA: <strong className="text-amber-700">{selectedTicket.slaResponseDue}</strong></span>
                  </div>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="px-6 border-b border-slate-200 flex items-center space-x-6 text-xs font-semibold">
                <button
                  onClick={() => setActiveDetailTab("thread")}
                  className={`py-3 border-b-2 transition-colors ${
                    activeDetailTab === "thread"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Comments & Thread ({selectedTicket.comments.length})
                </button>
                <button
                  onClick={() => setActiveDetailTab("activity")}
                  className={`py-3 border-b-2 transition-colors ${
                    activeDetailTab === "activity"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Audit Timeline ({selectedTicket.activities.length})
                </button>
                <button
                  onClick={() => setActiveDetailTab("details")}
                  className={`py-3 border-b-2 transition-colors ${
                    activeDetailTab === "details"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Technical Details & Tags
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeDetailTab === "thread" && (
                  <div className="space-y-4">
                    {/* Existing Comments */}
                    {selectedTicket.comments.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No comments or internal notes yet. Add one below.
                      </div>
                    ) : (
                      selectedTicket.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                            comment.isInternal
                              ? "bg-amber-50/70 border-amber-200 text-amber-950"
                              : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 font-bold">
                              {comment.isInternal ? (
                                <Lock className="h-3 w-3 text-amber-600" />
                              ) : (
                                <User className="h-3 w-3 text-blue-600" />
                              )}
                              <span>{comment.authorName}</span>
                              {comment.isInternal && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-amber-200/60 rounded text-amber-800 font-normal">
                                  Internal Note
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {comment.createdAt}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))
                    )}

                    {/* New Comment Composer */}
                    <form onSubmit={handleAddComment} className="pt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-slate-700">Add Note / Customer Reply</label>
                        <label className="flex items-center space-x-1.5 cursor-pointer text-amber-800">
                          <input
                            type="checkbox"
                            checked={isInternalNote}
                            onChange={(e) => setIsInternalNote(e.target.checked)}
                            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-[11px] font-medium">Internal note only</span>
                        </label>
                      </div>
                      <textarea
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={
                          isInternalNote
                            ? "Write internal team notes, investigation findings, or handover details..."
                            : "Write a reply or update for the customer..."
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit Note</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeDetailTab === "activity" && (
                  <div className="space-y-3">
                    {selectedTicket.activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs"
                      >
                        <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <History className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{act.actorName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {act.occurredAt}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{act.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeDetailTab === "details" && (
                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                      <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        System Metadata
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-slate-600">
                        <div>
                          <span className="block text-[10px] text-slate-400">Ticket ID</span>
                          <span className="font-mono text-slate-900 font-medium">{selectedTicket.id}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Created At</span>
                          <span className="text-slate-900">{selectedTicket.createdAt}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Source Channel</span>
                          <span className="font-mono text-slate-900 capitalize">{selectedTicket.sourceChannel}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Source Reference</span>
                          <span className="font-mono text-slate-900 truncate block">
                            {selectedTicket.sourceReferenceId || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        Assigned Tags
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTicket.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium"
                          >
                            <Tag className="h-3 w-3 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a ticket from the left panel to view its full details and connected entities.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Global Raise Ticket Modal */}
      <RaiseTicketModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        onTicketCreated={(newTicket) => {
          setSelectedTicket(newTicket);
          loadTickets();
        }}
        sourceChannel="portal"
      />
    </div>
  );
}
