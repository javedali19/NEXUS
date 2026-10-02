"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/permissions";
import { Badge } from "@/components/ui";
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
  UserCheck,
  Fingerprint,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [showDevAccounts, setShowDevAccounts] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const testAccounts = [
    {
      role: "admin" as UserRole,
      label: "Alex Morgan",
      title: "Super Admin",
      email: "alex.morgan@enterprise.internal",
      password: "EnterpriseAdmin2026!",
      badge: "Full Access",
      badgeVariant: "primary" as const,
      gradient: "from-blue-500 to-indigo-600",
      initials: "AM",
    },
    {
      role: "manager" as UserRole,
      label: "Sarah Jenkins",
      title: "VP Operations",
      email: "sarah.j@acmeglobal.com",
      password: "AcmeOperations2026!",
      badge: "Ops",
      badgeVariant: "success" as const,
      gradient: "from-emerald-500 to-teal-600",
      initials: "SJ",
    },
    {
      role: "finance_officer" as UserRole,
      label: "Michael Chen",
      title: "Finance Director",
      email: "mchen@nexusops.io",
      password: "FinanceLedger2026!",
      badge: "Finance",
      badgeVariant: "warning" as const,
      gradient: "from-amber-500 to-orange-600",
      initials: "MC",
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
    if (!email.trim()) errors.email = "Work email is required.";
    else if (!email.includes("@") || !email.includes(".")) errors.email = "Please enter a valid email.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
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
      const matched = testAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      const role: UserRole = matched ? matched.role : "admin";
      const name = matched ? matched.label : email.split("@")[0].replace(".", " ");
      await login(role, email, name);
      setSuccessMessage("Authenticated. Initializing session...");
      setTimeout(() => router.push("/"), 500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSsoLogin = async (provider: "Google" | "Microsoft") => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login("admin", "alex.morgan@enterprise.internal", "Alex Morgan");
      setSuccessMessage(`Authenticated via ${provider}. Redirecting...`);
      setTimeout(() => router.push("/"), 500);
    } catch (err: any) {
      setErrorMessage(`${provider} SSO failed. Try email/password instead.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc]">
      <AuthBrandingPanel />

      {/* Right Authentication Panel */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto auth-form-panel relative">
        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-5 sm:p-7 z-20">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-[13px] tracking-tight text-slate-900 block leading-tight">NEXUS</span>
              <span className="text-[9px] text-blue-600 font-mono tracking-widest">ENTERPRISE</span>
            </div>
          </div>
          {/* Status Pill */}
          <div className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-slate-600">Secure Connection</span>
          </div>
        </div>

        {/* Centered Form Card */}
        <div className="w-full max-w-[440px] px-5 sm:px-0 auth-page-enter">
          <div className="auth-form-card p-8 sm:p-10 auth-stagger">

            {/* Header */}
            <div className="space-y-3 mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60">
                <Fingerprint className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[11px] font-semibold text-blue-700">Secure Authentication</span>
              </div>
              <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Welcome back
              </h1>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Sign in with your enterprise credentials to continue.
              </p>
            </div>

            {/* Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-[12px] flex items-start gap-3 auth-alert-animate mb-5">
                <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                </div>
                <div className="flex-1 leading-relaxed pt-0.5">{errorMessage}</div>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[12px] flex items-start gap-3 auth-alert-animate mb-5">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div className="flex-1 leading-relaxed font-medium pt-0.5">{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none transition-colors duration-200 ${emailFocused ? 'text-blue-500' : 'text-slate-400'}`}>
                    <Mail className="h-[17px] w-[17px]" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined }); }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className={`auth-input w-full pl-11 pr-4 py-3 rounded-xl text-[13px] text-slate-900 ${
                      fieldErrors.email ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" : ""
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pl-0.5"><AlertCircle className="h-3 w-3" />{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none transition-colors duration-200 ${passwordFocused ? 'text-blue-500' : 'text-slate-400'}`}>
                    <Lock className="h-[17px] w-[17px]" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined }); }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className={`auth-input w-full pl-11 pr-12 py-3 rounded-xl text-[13px] text-slate-900 ${
                      fieldErrors.password ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100/80 transition-all"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pl-0.5"><AlertCircle className="h-3 w-3" />{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-600">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="auth-checkbox" />
                  <span className="text-[12px] font-medium">Remember me</span>
                </label>
                <button type="button" onClick={() => setIsForgotOpen(true)} className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                className="auth-submit-btn w-full h-[48px] rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting || isAuthLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Authenticating...</>
                ) : (
                  <>Sign In<ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider my-6">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest whitespace-nowrap">Or continue with</span>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleSsoLogin("Google")} disabled={isSubmitting}
                className="auth-sso-btn flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-slate-700">Google</span>
              </button>
              <button type="button" onClick={() => handleSsoLogin("Microsoft")} disabled={isSubmitting}
                className="auth-sso-btn flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span className="text-slate-700">Microsoft</span>
              </button>
            </div>

            {/* Quick Access Test Accounts */}
            <div className="auth-test-accounts-card p-3.5 rounded-2xl mt-6 space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="font-semibold text-slate-700 flex items-center gap-2 text-[11px]">
                  <div className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center">
                    <UserCheck className="h-3 w-3 text-blue-600" />
                  </div>
                  Quick Access
                </span>
                <button type="button" onClick={() => setShowDevAccounts(!showDevAccounts)}
                  className="text-[10px] text-blue-600 font-semibold hover:text-blue-700">
                  {showDevAccounts ? "Hide" : "Show"}
                </button>
              </div>
              {showDevAccounts && (
                <div className="flex gap-2">
                  {testAccounts.map((acc) => (
                    <button key={acc.email} type="button" onClick={() => handleSelectTestAccount(acc)}
                      className="auth-test-account-btn flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl text-center group">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${acc.gradient} text-white font-bold text-[11px] flex items-center justify-center shadow-sm`}>
                        {acc.initials}
                      </div>
                      <span className="font-semibold text-slate-800 text-[11px] group-hover:text-blue-700 transition-colors leading-tight">
                        {acc.label.split(" ")[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{acc.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6 text-[13px] text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Create account
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex items-center justify-between text-[11px] text-slate-400 z-20">
          <span className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/60" />End-to-End Encrypted
          </span>
          <span className="font-medium">© 2026 Nexus Enterprise</span>
        </div>
      </div>

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} defaultEmail={email} />
    </div>
  );
}
