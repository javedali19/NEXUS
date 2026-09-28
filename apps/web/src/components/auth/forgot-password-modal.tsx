"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = "",
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid corporate work email address.");
      return;
    }

    setIsSubmitting(true);
    // Simulate enterprise SSO/password reset dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 700);
  };

  const handleReset = () => {
    setIsSent(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {isSent ? (
          <div className="text-center space-y-4 py-2">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Check Your Corporate Inbox</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                We have dispatched password recovery instructions to <strong className="text-slate-800 font-medium">{email}</strong>.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Enterprise SSO Notice:</p>
              <p className="text-slate-500">
                If your tenant uses Google Workspace or Microsoft Entra ID SSO, please reset credentials through your company identity portal.
              </p>
            </div>
            <Button variant="primary" size="md" className="w-full" onClick={handleReset}>
              Return to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-left">
              <h3 className="text-lg font-bold text-slate-900">Reset Enterprise Password</h3>
              <p className="text-xs text-slate-500">
                Enter your verified work email address to receive password reset instructions.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
