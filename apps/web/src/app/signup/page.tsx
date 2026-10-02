"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { TermsModal } from "@/components/auth/terms-modal";
import {
  LayoutGrid,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Rocket,
  Loader2,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string; email?: string; organizationName?: string;
    password?: string; confirmPassword?: string; agreeTerms?: string;
  }>({});
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200", textColor: "text-slate-400" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500", textColor: "text-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500", textColor: "text-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500", textColor: "text-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500" };
  };
  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    const errors: typeof fieldErrors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Work email is required.";
    else if (!email.includes("@") || !email.includes(".")) errors.email = "Please enter a valid email.";
    if (!organizationName.trim()) errors.organizationName = "Organization name is required.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 8) errors.password = "Must be at least 8 characters.";
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    if (!agreeTerms) errors.agreeTerms = "You must accept the terms.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await login("admin", email, fullName);
      setSuccessMessage(`Account created for ${fullName}. Provisioning workspace...`);
      setTimeout(() => router.push("/"), 700);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create workspace. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (id: string, label: string, icon: React.ReactNode, type: string, value: string,
    onChange: (v: string) => void, placeholder: string, autoComplete: string, errorKey: string,
    error?: string, showToggle?: boolean, isVisible?: boolean, onToggle?: () => void, extra?: React.ReactNode
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
        {id === "signup-password" && password && (
          <span className={`text-[10px] font-bold ${passwordStrength.textColor} uppercase tracking-wider`}>{passwordStrength.label}</span>
        )}
      </div>
      <div className="relative">
        <div className={`absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none transition-colors duration-200 ${focusedField === id ? 'text-blue-500' : 'text-slate-400'}`}>
          {icon}
        </div>
        <input
          id={id}
          type={showToggle ? (isVisible ? "text" : "password") : type}
          value={value}
          onChange={(e) => { onChange(e.target.value); if (error) setFieldErrors({ ...fieldErrors, [errorKey]: undefined }); }}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`auth-input w-full pl-11 ${showToggle ? 'pr-12' : 'pr-4'} py-3 rounded-xl text-[13px] text-slate-900 ${
            error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" : ""
          }`}
        />
        {showToggle && (
          <button type="button" onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100/80 transition-all"
            aria-label={isVisible ? "Hide" : "Show"}>
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {/* Password Strength Bar */}
      {id === "signup-password" && password && (
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.score >= step ? passwordStrength.color : "bg-slate-200"}`} />
          ))}
        </div>
      )}
      {error && <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pl-0.5"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc]">
      <AuthBrandingPanel />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto auth-form-panel relative py-20 sm:py-16">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-5 sm:p-7 z-20">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-[13px] tracking-tight text-slate-900 block leading-tight">NEXUS</span>
              <span className="text-[9px] text-blue-600 font-mono tracking-widest">ENTERPRISE</span>
            </div>
          </div>
          <div className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
            <Rocket className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-[11px] font-medium text-slate-600">New Workspace</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-[440px] px-5 sm:px-0 auth-page-enter">
          <div className="auth-form-card p-7 sm:p-9 auth-stagger">

            {/* Header */}
            <div className="space-y-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/60">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-[11px] font-semibold text-indigo-700">14-Day Enterprise Trial</span>
              </div>
              <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Create your workspace
              </h1>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Start your enterprise trial or join an existing organization.
              </p>
            </div>

            {/* Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-[12px] flex items-start gap-3 auth-alert-animate mb-5">
                <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 mt-0.5"><AlertCircle className="h-3.5 w-3.5 text-rose-500" /></div>
                <div className="flex-1 leading-relaxed pt-0.5">{errorMessage}</div>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[12px] flex items-start gap-3 auth-alert-animate mb-5">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /></div>
                <div className="flex-1 leading-relaxed font-medium pt-0.5">{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5" noValidate>
              {/* Two-column: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {renderField("signup-name", "Full Name", <User className="h-[17px] w-[17px]" />, "text",
                  fullName, setFullName, "Sarah Jenkins", "name", "fullName", fieldErrors.fullName)}
                {renderField("signup-email", "Work Email", <Mail className="h-[17px] w-[17px]" />, "email",
                  email, setEmail, "name@company.com", "email", "email", fieldErrors.email)}
              </div>

              {renderField("signup-org", "Organization", <Building2 className="h-[17px] w-[17px]" />, "text",
                organizationName, setOrganizationName, "Acme Global Technologies", "organization", "organizationName", fieldErrors.organizationName)}

              {/* Two-column: Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {renderField("signup-password", "Password", <Lock className="h-[17px] w-[17px]" />, "password",
                  password, setPassword, "Min. 8 chars", "new-password", "password", fieldErrors.password,
                  true, showPassword, () => setShowPassword(!showPassword))}
                {renderField("signup-confirm", "Confirm", <Lock className="h-[17px] w-[17px]" />, "password",
                  confirmPassword, setConfirmPassword, "Re-enter", "new-password", "confirmPassword", fieldErrors.confirmPassword,
                  true, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
              </div>

              {/* Terms */}
              <div className="space-y-1 pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={agreeTerms}
                    onChange={(e) => { setAgreeTerms(e.target.checked); if (fieldErrors.agreeTerms) setFieldErrors({ ...fieldErrors, agreeTerms: undefined }); }}
                    className="auth-checkbox mt-0.5" />
                  <span className="text-[12px] text-slate-600 leading-relaxed">
                    I agree to the{" "}
                    <button type="button" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="font-semibold text-blue-600 hover:text-blue-700">Terms of Service</button>
                    {" "}and{" "}
                    <button type="button" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="font-semibold text-blue-600 hover:text-blue-700">Privacy Policy</button>.
                  </span>
                </label>
                {fieldErrors.agreeTerms && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pl-7"><AlertCircle className="h-3 w-3" />{fieldErrors.agreeTerms}</p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="auth-submit-btn w-full h-[48px] rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Creating Workspace...</>
                ) : (
                  <>Create Account<ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            {/* Features */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 py-4 border-t border-slate-100">
              {["14-day free trial", "No credit card", "Instant setup", "Full features"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[11px] text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span>{f}</span>
                </div>
              ))}
            </div>

            {/* Login Link */}
            <div className="text-center mt-4 text-[13px] text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign In</Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex items-center justify-between text-[11px] text-slate-400 z-20">
          <span className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/60" />Tenant-Isolated
          </span>
          <span className="font-medium">© 2026 Nexus Enterprise</span>
        </div>
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
