"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "./shell-context";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/permissions";
import { Badge, StatusIndicator } from "@/components/ui";
import { cn } from "@/lib/utils";

import {
  Menu,
  Search,
  Bell,
  Building2,
  Layers,
  ChevronDown,
  User,
  ShieldCheck,
  Check,
  Sparkles,
  Command,
  LogOut,
  Settings,
  ExternalLink,
  Sun,
  Moon,
  HelpCircle,
} from "lucide-react";

export const TopNav: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    theme,
    toggleTheme,
    organizations,
    currentOrg,
    setCurrentOrg,
    businessUnits,
    currentUnit,
    setCurrentUnit,
    currentRole,
    setCurrentRole,
    setIsMobileSidebarOpen,
    setIsCommandPaletteOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationsCount,
  } = useShell();

  // Dropdown states
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const orgRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) setIsOrgOpen(false);
      if (unitRef.current && !unitRef.current.contains(e.target as Node)) setIsUnitOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setIsUserOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rolesList: { id: UserRole; label: string; desc: string }[] = [
    { id: "admin", label: "Super Admin", desc: "Full access across all ERP, CRM, AI, & Settings" },
    { id: "manager", label: "Operations Manager", desc: "Access to business modules & workflows" },
    { id: "sales_agent", label: "Sales Agent", desc: "CRM, Deals, Leads, AI Comms & Customer 360" },
    { id: "finance_officer", label: "Finance Officer", desc: "ERP, Invoices, Payments, Ledger & Collections" },
    { id: "auditor", label: "Compliance Auditor", desc: "Immutable Audit Log, Read-Only Financials" },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Left side: Mobile Toggle + Selectors */}
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* 1. Organization / Tenant Selector */}
        <div className="relative" ref={orgRef}>
          <button
            onClick={() => setIsOrgOpen(!isOrgOpen)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 transition-colors shadow-2xs"
          >
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[150px]">{currentOrg.name}</p>
              <span className="text-[10px] text-slate-400 font-mono block">Enterprise</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {isOrgOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in duration-100">
              <div className="px-2.5 py-1 text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                Select Enterprise Tenant
              </div>
              <div className="space-y-1 mt-1">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setCurrentOrg(org);
                      setIsOrgOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors",
                      currentOrg.id === org.id
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <div>
                      <p className="truncate font-medium">{org.name}</p>
                      <span className="text-[10px] text-slate-400 block font-mono">{org.planTier || "Enterprise"}</span>
                    </div>
                    {currentOrg.id === org.id && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search & Command Bar Shortcut */}
      <div className="flex-1 max-w-xl mx-6 hidden md:block">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl px-3.5 py-1.5 text-xs text-slate-500 transition-all shadow-2xs"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <span className="truncate text-slate-400 text-xs">Search customers, invoices, deals, calls, documents...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-slate-500 border border-slate-200 shadow-2xs">
            ⌘ K
          </kbd>
        </button>
      </div>

      {/* Right side: Notifications, Dark mode, Help & User Profile */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] text-blue-600 hover:underline font-mono"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-1.5 mt-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={cn(
                      "p-2.5 rounded-lg text-xs cursor-pointer border transition-colors",
                      n.isRead
                        ? "bg-slate-50/60 border-slate-100 text-slate-500"
                        : "bg-blue-50/40 border-blue-100/80 text-slate-800 hover:bg-blue-50/60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Dark/Light Mode"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Help Circle Button */}
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center"
          title="Help & Documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* User & Role Switcher Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setIsUserOpen(!isUserOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "AM"}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.fullName || "Alex Morgan"}
              </p>
              <span className="text-[10px] text-slate-400 font-mono capitalize">
                {currentRole.replace("_", " ")}
              </span>
            </div>
          </button>

          {isUserOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in duration-100 space-y-3">
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-slate-900">{user?.fullName || "Alex Morgan"}</p>
                <p className="text-[11px] text-slate-500">{user?.email || "alex.morgan@enterprise.internal"}</p>
                <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3 mr-1" /> PostgreSQL RLS Context
                </span>
              </div>

              {/* Interactive Role Switcher to demonstrate permission-aware navigation */}
              <div className="pt-2 border-t border-slate-100">
                <div className="px-2 pb-1 text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider flex items-center justify-between">
                  <span>Switch Role (RBAC)</span>
                  <span className="text-indigo-600 text-[9px]">Live Filter</span>
                </div>
                <div className="space-y-1 mt-1">
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentRole(r.id);
                        setIsUserOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors",
                        currentRole === r.id
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span className="capitalize">{r.label}</span>
                      {currentRole === r.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links & Sign Out */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <a
                  href="/settings"
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Platform Settings</span>
                </a>
                <button
                  onClick={() => {
                    setIsUserOpen(false);
                    logout();
                    router.push("/login");
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
