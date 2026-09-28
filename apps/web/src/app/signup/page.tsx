"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Badge } from "@/components/ui";
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
  Check,
  Sparkles,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    organizationName?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

  // Modals
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Dynamic Password Strength Calculator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      errors.email = "Corporate work email is required.";
    } else if (!email.includes("@") || !email.includes(".")) {
      errors.email = "Please enter a valid corporate work email address.";
    }

    if (!organizationName.trim()) {
      errors.organizationName = "Organization or company name is required.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      errors.agreeTerms = "You must agree to the Terms of Service and Privacy Policy.";
    }

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
      // Simulate enterprise tenant provisioning
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Log in with new user and organization context
      await login("admin", email, fullName);

      setSuccessMessage(
        `Account initialized for ${fullName} at ${organizationName}. Provisioning tenant schema...`
      );

      setTimeout(() => {
        router.push("/");
      }, 700);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to initialize enterprise workspace. Please contact support."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc]">
      {/* 1. Left Enterprise Brand Showcase Panel (Desktop) */}
      <AuthBrandingPanel />

      {/* 2. Right Registration Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Top Bar: Mobile Brand + Dev Badge */}
        <div className="flex items-center justify-between pb-6">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              NEXUS <span className="text-[10px] text-blue-600 font-mono">ERP+CRM</span>
            </span>
          </div>

          {/* Dev Mode Testing Indicator Pill */}
          <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Workspace Provisioning</span>
          </div>
        </div>

        {/* Center: Main Registration Card */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Create your NEXUS account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Start your 14-day enterprise trial or join an existing organization.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignUpSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: undefined });
                  }}
                  placeholder="e.g. Sarah Jenkins"
                  autoComplete="name"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${
                    fieldErrors.fullName
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Work Email */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-700">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${
                    fieldErrors.email
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Organization Name */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="signup-org" className="block text-xs font-semibold text-slate-700">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="signup-org"
                  type="text"
                  value={organizationName}
                  onChange={(e) => {
                    setOrganizationName(e.target.value);
                    if (fieldErrors.organizationName)
                      setFieldErrors({ ...fieldErrors, organizationName: undefined });
                  }}
                  placeholder="e.g. Acme Global Technologies"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${
                    fieldErrors.organizationName
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
              </div>
              {fieldErrors.organizationName && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {fieldErrors.organizationName}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {password && (
                  <span className="text-[10px] font-mono text-slate-500">
                    Strength: <strong className="text-slate-800">{passwordStrength.label}</strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${
                    fieldErrors.password
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Progress Bar */}
              {password && (
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= step ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              )}

              {fieldErrors.password && (
                <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-semibold text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                  }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${
                    fieldErrors.confirmPassword
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Privacy Policy Agreement */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none text-left">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (fieldErrors.agreeTerms)
                      setFieldErrors({ ...fieldErrors, agreeTerms: undefined });
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsOpen(true);
                    }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsOpen(true);
                    }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
              {fieldErrors.agreeTerms && (
                <p className="text-[11px] text-rose-500 font-medium pl-6">
                  {fieldErrors.agreeTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-xs"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </form>

          {/* Development Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 block">
              Development Environment Notice:
            </span>
            <p>
              Self-serve tenant creation is enabled for testing. Account will be initialized with PostgreSQL Row-Level Security tenant isolation.
            </p>
          </div>

          {/* Link to Login */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            PostgreSQL RLS Active
          </span>
          <span>© 2026 Nexus Enterprise Platform</span>
        </div>
      </div>

      {/* Terms & Privacy Modal */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
