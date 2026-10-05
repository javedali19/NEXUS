"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useShell } from "./shell-context";
import { useAuth } from "@/lib/auth/auth-context";
import { NAVIGATION_GROUPS, hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  Users,
  Building2,
  Contact,
  UserPlus,
  TrendingUp,
  FileCheck,
  DollarSign,
  CreditCard,
  Landmark,
  FolderGit2,
  ScanLine,
  MessageCircle,
  MessagesSquare,
  PhoneCall,
  Bot,
  GitBranch,
  BarChart3,
  PiggyBank,
  Cpu,
  ShieldAlert,
  Settings,
  Sparkles,
  Building,
  ChevronDown,
  X,
  History,
  AlertTriangle,
  Volume2,
  Headphones,
  LifeBuoy,
  Globe,
  Activity,
  Rocket,
  Cloud,
  ShieldCheck,
  Workflow,
  Search,
  LayoutGrid,
  ChevronsLeft,
  Sliders,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Users: <Cloud className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  Contact: <Contact className="h-4 w-4" />,
  UserPlus: <UserPlus className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  FileCheck: <FileCheck className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  Landmark: <Landmark className="h-4 w-4" />,
  FolderGit2: <FolderGit2 className="h-4 w-4" />,
  ScanLine: <ScanLine className="h-4 w-4" />,
  MessageCircle: <MessageCircle className="h-4 w-4" />,
  MessagesSquare: <MessagesSquare className="h-4 w-4" />,
  PhoneCall: <PhoneCall className="h-4 w-4" />,
  Headphones: <Headphones className="h-4 w-4" />,
  Volume2: <Volume2 className="h-4 w-4" />,
  LifeBuoy: <LifeBuoy className="h-4 w-4" />,
  Bot: <Bot className="h-4 w-4" />,
  GitBranch: <GitBranch className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  PiggyBank: <PiggyBank className="h-4 w-4" />,
  Cpu: <Cpu className="h-4 w-4" />,
  ShieldAlert: <ShieldAlert className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  History: <History className="h-4 w-4" />,
  AlertTriangle: <AlertTriangle className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
  Rocket: <Rocket className="h-4 w-4" />,
  Cloud: <Cloud className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
  Workflow: <Workflow className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentRole, isMobileSidebarOpen, setIsMobileSidebarOpen, currentOrg } = useShell();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const getCustomBadge = (label: string, itemBadge?: string) => {
    if (label === "Command Center" || label === "Voice Calls") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </span>
      );
    }
    if (label === "Leads") {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
          12
        </span>
      );
    }
    if (label === "Deals") {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          8
        </span>
      );
    }
    if (label === "WhatsApp") {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          5
        </span>
      );
    }
    if (label === "Conversations" || label === "Unified Inbox") {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          8
        </span>
      );
    }
    if (itemBadge) {
      return (
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
          {itemBadge}
        </span>
      );
    }
    return null;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-[260px] nexus-sidebar flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Premium Brand Header */}
          <div className="p-4 border-b border-slate-100/80 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="nexus-sidebar-brand h-9 w-9 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200">
                <LayoutGrid className="h-[18px] w-[18px]" />
              </div>
              <div>
                <h1 className="font-extrabold text-[14px] tracking-tight text-slate-900 leading-tight">
                  NEXUS
                </h1>
                <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-slate-400 block font-medium">
                  Enterprise OS
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors lg:opacity-0 lg:pointer-events-none"
              title="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Search Trigger */}
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                window.dispatchEvent(event);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-slate-400 bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/50 transition-all"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">Quick search...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Scrollable Navigation Groups */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
            {NAVIGATION_GROUPS.map((group) => {
              if (group.id === "governance") return null;

              const allowedItems = group.items.filter((item) =>
                hasPermission(item.requiredRoles, currentRole)
              );

              if (allowedItems.length === 0) return null;

              const isGroupCollapsed = collapsedGroups[group.id] || false;
              const groupLabel = group.id === "core" ? "CUSTOMERS" : group.title.toUpperCase();

              return (
                <div key={group.id} className="space-y-0.5">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono hover:text-slate-500 transition-colors rounded-lg group"
                  >
                    <span>{groupLabel}</span>
                    <ChevronRight className={cn(
                      "h-3 w-3 text-slate-300 transition-transform duration-200",
                      !isGroupCollapsed && "rotate-90"
                    )} />
                  </button>

                  {!isGroupCollapsed && allowedItems.map((item) => {
                    const isActive = pathname === item.href || (item.id === "customers" && (pathname.startsWith("/customers") || pathname === "/timeline"));
                    const customBadge = getCustomBadge(item.label, item.badge);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={cn(
                          "nexus-sidebar-item flex items-center justify-between px-3 py-[7px] text-[12.5px] select-none",
                          isActive
                            ? "active"
                            : "text-slate-600 hover:text-slate-900 font-medium"
                        )}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className={cn("shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400")}>
                            {ICON_MAP[item.iconName] || <LayoutDashboard className="h-4 w-4" />}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {customBadge}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Premium System Footer */}
          <div className="p-3 border-t border-slate-100/80 bg-gradient-to-t from-slate-50/80 to-transparent space-y-2">
            {/* System Links */}
            <div className="flex items-center gap-1 px-1">
              <Link href="/integrations" className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium">
                <Cpu className="h-3.5 w-3.5" />
                <span>Integrations</span>
              </Link>
              <Link href="/audit" className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Audit</span>
              </Link>
              <Link href="/settings" className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium">
                <Settings className="h-3.5 w-3.5" />
                <span>Settings</span>
              </Link>
            </div>

            {/* User Session — Premium Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "AM"}
                  </div>
                  <div className="truncate text-left">
                    <p className="text-[12px] font-semibold text-slate-800 truncate leading-tight">
                      {user?.fullName || "Alex Morgan"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono capitalize leading-tight mt-0.5">
                      {currentRole.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
