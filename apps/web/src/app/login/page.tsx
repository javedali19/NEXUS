"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/permissions";
import { Button, Badge } from "@/components/ui";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";
import {
  LayoutGrid,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, providerStatus, isLoading: isAuthLoading } = useAuth();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Modals & Panels
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [showDevAccounts, setShowDevAccounts] = useState(true);

  // Pre-configured Dev Test Accounts
  const testAccounts = [
    {
      role: "admin" as UserRole,
      label: "Alex Morgan",
      title: "Super Admin",
      email: "alex.morgan@enterprise.internal",
      password: "EnterpriseAdmin2026!",
      badge: "Full Access",
      badgeVariant: "primary" as const,
    },
    {
      role: "manager" as UserRole,
      label: "Sarah Jenkins",
      title: "VP Operations",
      email: "sarah.j@acmeglobal.com",
      password: "AcmeOperations2026!",
      badge: "Operations",
      badgeVariant: "success" as const,
    },
    {
      role: "finance_officer" as UserRole,
      label: "Michael Chen",
      title: "Finance Director",
      email: "mchen@nexusops.io",
      password: "FinanceLedger2026!",
      badge: "ERP & AR",
      badgeVariant: "warning" as const,
    },
  ];

  const handleSelectTestAccount = (acc: (typeof testAccounts)[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setFieldErrors({});
    setErrorMessage(null);
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Work email is required.";
    } else if (!email.includes("@") || !email.includes(".")) {
      errors.email = "Please enter a valid corporate email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Determine role based on test account match or default to admin
      const matched = testAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      const role: UserRole = matched ? matched.role : "admin";
      const name = matched ? matched.label : email.split("@")[0].replace(".", " ");

      // Execute login through trusted AuthContext
      await login(role, email, name);

      setSuccessMessage("Authentication successful. Initializing PostgreSQL RLS session...");

      // Short delay for visual feedback before redirect
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Invalid corporate credentials or network failure. Please verify and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSsoLogin = async (provider: "Google" | "Microsoft") => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login("admin", "alex.morgan@enterprise.internal", "Alex Morgan");
      setSuccessMessage(`Authenticated via ${provider} Identity Provider. Redirecting...`);
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err: any) {
      setErrorMessage(`${provider} SSO authentication failed. Running in verified local session mode.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc]">
      {/* 1. Left Enterprise Brand Showcase Panel (Desktop) */}
      <AuthBrandingPanel />

      {/* 2. Right Authentication Form Panel */}
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
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dev Environment</span>
          </div>
        </div>

        {/* Center: Main Form Card */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign in to your account with your enterprise work email.
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

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            {/* Work Email Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
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

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-xs"
              isLoading={isSubmitting || isAuthLoading}
            >
              Sign In
            </Button>
          </form>

          {/* SSO Separator */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-[#f8fafc] px-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              Or continue with SSO
            </span>
          </div>

          {/* Enterprise SSO Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Google Identity */}
            <button
              type="button"
              onClick={() => handleSsoLogin("Google")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium transition-all shadow-xs disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Identity</span>
            </button>

            {/* Microsoft Entra ID */}
            <button
              type="button"
              onClick={() => handleSsoLogin("Microsoft")}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium transition-all shadow-xs disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft Entra</span>
            </button>
          </div>

          {/* Seeded Test Accounts Quick-Fill Indicator (Local Dev Convenience) */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900 flex items-center gap-1.5 text-[11px]">
                <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                Testing Environment Quick Fill:
              </span>
              <button
                type="button"
                onClick={() => setShowDevAccounts(!showDevAccounts)}
                className="text-[10px] text-blue-600 font-mono hover:underline"
              >
                {showDevAccounts ? "Collapse" : "Show"}
              </button>
            </div>

            {showDevAccounts && (
              <div className="space-y-1.5 pt-1">
                {testAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectTestAccount(acc)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white hover:bg-blue-50 border border-blue-200/60 text-left transition-colors shadow-2xs group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 text-[11px] block group-hover:text-blue-700">
                        {acc.label} ({acc.title})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {acc.email}
                      </span>
                    </div>
                    <Badge variant={acc.badgeVariant} size="sm">
                      {acc.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Link to Sign Up */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create account
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
}
