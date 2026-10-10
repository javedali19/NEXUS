"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Ticket,
  AlertTriangle,
  PhoneCall,
  LifeBuoy,
  FileText,
  User,
  Building2,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  TicketPriority,
  TicketType,
  TicketSourceChannel,
  createNewTicket,
  SupportTicket,
} from "@/lib/tickets-data";

interface RaiseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: SupportTicket) => void;
  // Pre-fill parameters when raised from Voice Call, Support Case, etc.
  sourceChannel?: TicketSourceChannel;
  sourceReferenceId?: string;
  linkedCallId?: string;
  linkedCallSid?: string;
  linkedSupportCaseId?: string;
  linkedInvoiceId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  companyName?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialType?: TicketType;
  initialPriority?: TicketPriority;
}

export const RaiseTicketModal: React.FC<RaiseTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
  sourceChannel = "portal",
  sourceReferenceId,
  linkedCallId,
  linkedCallSid,
  linkedSupportCaseId,
  linkedInvoiceId,
  customerId,
  customerName: initialCustomerName = "",
  customerPhone: initialCustomerPhone = "",
  customerEmail: initialCustomerEmail = "",
  companyName: initialCompanyName = "",
  initialTitle = "",
  initialDescription = "",
  initialType = "general",
  initialPriority = "medium",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [ticketType, setTicketType] = useState<TicketType>(initialType);
  const [priority, setPriority] = useState<TicketPriority>(initialPriority);
  const [custName, setCustName] = useState(initialCustomerName);
  const [custPhone, setCustPhone] = useState(initialCustomerPhone);
  const [custEmail, setCustEmail] = useState(initialCustomerEmail);
  const [compName, setCompName] = useState(initialCompanyName);
  const [department, setDepartment] = useState("Customer Support");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<SupportTicket | null>(null);

  // Sync props when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setTicketType(initialType);
      setPriority(initialPriority);
      setCustName(initialCustomerName);
      setCustPhone(initialCustomerPhone);
      setCustEmail(initialCustomerEmail);
      setCompName(initialCompanyName);
      setSuccessTicket(null);
      setIsSubmitting(false);

      if (sourceChannel === "voice_call") {
        setDepartment("Voice Ops & Telephony");
        setTicketType("voice_call_followup");
      } else if (linkedSupportCaseId) {
        setDepartment("Customer Support");
      }
    }
  }, [
    isOpen,
    initialTitle,
    initialDescription,
    initialType,
    initialPriority,
    initialCustomerName,
    initialCustomerPhone,
    initialCustomerEmail,
    initialCompanyName,
    sourceChannel,
    linkedSupportCaseId,
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !custName.trim()) return;

    setIsSubmitting(true);

    const parsedTags = tags
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [ticketType, sourceChannel];

    const ticket = createNewTicket({
      title: title.trim(),
      description: description.trim() || `Ticket raised via ${sourceChannel} regarding ${title.trim()}`,
      ticketType,
      priority,
      sourceChannel,
      sourceReferenceId,
      customerId,
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      customerEmail: custEmail.trim(),
      companyName: compName.trim(),
      assignedDepartment: department,
      linkedSupportCaseId,
      linkedCallId,
      linkedCallSid,
      linkedInvoiceId,
      tags: parsedTags,
      createdBy: "Agent (Console)",
    });

    setSuccessTicket(ticket);
    setIsSubmitting(false);

    if (onTicketCreated) {
      onTicketCreated(ticket);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">Raise Support Ticket</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono uppercase tracking-wider font-semibold border border-blue-400/30">
                  {sourceChannel.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected to Nexus Enterprise OS — Support, Voice Telephony & Customer 360
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success View */}
        {successTicket ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Ticket Raised Successfully</h4>
              <p className="text-slate-500 text-sm mt-1">
                Assigned ticket number <span className="font-mono font-bold text-blue-600">{successTicket.ticketNumber}</span>
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Subject:</span>
                <span className="font-medium text-slate-900">{successTicket.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Customer:</span>
                <span className="font-medium text-slate-900">{successTicket.customerName} ({successTicket.companyName || "Personal"})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-900">{successTicket.assignedDepartment}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">SLA Target:</span>
                <span className="font-mono text-emerald-700 font-semibold">{successTicket.slaResponseDue}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Close & Continue
              </button>
            </div>
          </div>
        ) : (
          /* Ticket Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Linked Context Notice */}
            {(linkedCallSid || linkedSupportCaseId || linkedInvoiceId) && (
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-medium">Context Linked:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedCallSid && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-blue-200 font-mono text-[11px] text-blue-800">
                        <PhoneCall className="h-3 w-3 text-blue-600" />
                        Call: {linkedCallSid.slice(0, 12)}...
                      </span>
                    )}
                    {linkedSupportCaseId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-blue-200 font-mono text-[11px] text-blue-800">
                        <LifeBuoy className="h-3 w-3 text-blue-600" />
                        Case: {linkedSupportCaseId}
                      </span>
                    )}
                    {linkedInvoiceId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-blue-200 font-mono text-[11px] text-blue-800">
                        <FileText className="h-3 w-3 text-blue-600" />
                        Invoice: {linkedInvoiceId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ticket Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ticket Title / Subject *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Voice Call Follow-up: Credit Note Verification for INV-2026-089"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-hidden font-medium text-slate-900"
              />
            </div>

            {/* Ticket Type & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category / Type
                </label>
                <select
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value as TicketType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-900"
                >
                  <option value="voice_call_followup">Voice Call Follow-up</option>
                  <option value="billing">Billing Dispute / Credit Note</option>
                  <option value="technical">Technical Bug / Infrastructure</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="complaint">Customer Complaint</option>
                  <option value="escalation">Executive Escalation</option>
                  <option value="general">General Support Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority & SLA
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold text-slate-900"
                >
                  <option value="low">Low Priority (24h SLA)</option>
                  <option value="medium">Medium Priority (8h SLA)</option>
                  <option value="high">High Priority (2h SLA)</option>
                  <option value="critical">Critical (30m Urgent SLA)</option>
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>Customer Association</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="customer@domain.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Department Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-900"
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="Voice Ops & Telephony">Voice Ops & Telephony</option>
                  <option value="Billing & Collections">Billing & Collections</option>
                  <option value="Customer Engineering">Customer Engineering</option>
                  <option value="Integrations & API">Integrations & API</option>
                  <option value="Tier-3 Architecture">Tier-3 Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="voice-call, high-value, dispute"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 outline-hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Description / Call Summary
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the issue, customer sentiment, actions required, or transcript notes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-hidden text-slate-900 resize-none font-normal"
              />
            </div>

            {/* SLA Indicator Card */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="font-semibold">Calculated SLA:</span>
                <span>
                  {priority === "critical"
                    ? "30-min response / 4h target resolution"
                    : priority === "high"
                    ? "2-hour response / 12h target resolution"
                    : "4-hour response / 24h target resolution"}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                Active Policy
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !custName.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
              >
                <Ticket className="h-4 w-4" />
                <span>{isSubmitting ? "Raising Ticket..." : "Raise Support Ticket"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
