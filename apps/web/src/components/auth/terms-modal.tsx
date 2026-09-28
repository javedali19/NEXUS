"use client";

import React from "react";
import { ShieldCheck, Lock, X } from "lucide-react";
import { Button } from "@/components/ui";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">NEXUS Enterprise Terms & Privacy</h3>
            <p className="text-[11px] text-slate-500">Master Cloud Service Agreement & Data Governance</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900">1. PostgreSQL Tenant Row-Level Security (RLS)</h4>
            <p>
              NEXUS enforces strict hardware and cryptographic tenant isolation. Every database transaction executes with a mandatory server-verified `app.current_tenant_id` session context, preventing cross-tenant data leakage.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900">2. Telephony & TCPA Compliance</h4>
            <p>
              All AI voice dialing and SMS/WhatsApp communications strictly adhere to TCPA legal calling windows (08:00–21:00 recipient local time) with automated suppression lists and immutable consent ledger verification.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900">3. AI Safe Tool Gateway & Zero-Data Retention</h4>
            <p>
              Invocations through OpenAI, Gemini, and Anthropic are routed via an isolated enterprise proxy with automated PII token redaction and zero model training agreements.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900">4. Financial Outbox Guarantees</h4>
            <p>
              Invoices, quotes, and payment gateway webhooks operate on at-least-once transactional outbox delivery with automated ledger reconciliation.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">SOC2 Type II • ISO 27001</span>
          <Button variant="primary" size="sm" onClick={onClose}>
            I Understand & Agree
          </Button>
        </div>
      </div>
    </div>
  );
};
