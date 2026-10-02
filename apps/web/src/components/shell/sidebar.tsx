"use client";

import React from "react";
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

  const getCustomBadge = (label: string, itemBadge?: string) => {
    if (label === "Command Center") {
      return (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-200/60 font-sans">
          Live
        </span>
      );
    }
    if (label === "Leads") {
      return (
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          12
        </span>
      );
    }
    if (label === "Deals") {
      return (
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          8
        </span>
      );
    }
    if (label === "WhatsApp") {
      return (
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          5
        </span>
      );
    }
    if (label === "Conversations" || label === "Unified Inbox") {
      return (
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          8
        </span>
      );
    }
    if (label === "Voice Calls") {
      return (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 font-sans">
          Live
        </span>
      );
    }
    if (itemBadge) {
      return (
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs text-white">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                  NEXUS
                </h1>
                <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
                  ERP + CRM
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Navigation Groups */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
            {NAVIGATION_GROUPS.map((group) => {
              // Skip governance group here because it is shown in the footer row matching the screenshot
              if (group.id === "governance") return null;

              const allowedItems = group.items.filter((item) =>
                hasPermission(item.requiredRoles, currentRole)
              );

              if (allowedItems.length === 0) return null;

              return (
                <div key={group.id} className="space-y-0.5">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {group.id === "core" ? "CUSTOMERS" : group.title.toUpperCase()}
                  </div>

                  {allowedItems.map((item) => {
                    const isActive = pathname === item.href || (item.id === "customers" && (pathname.startsWith("/customers") || pathname === "/timeline"));
                    const customBadge = getCustomBadge(item.label, item.badge);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all duration-150 select-none",
                          isActive
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                        )}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className={cn("shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
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

          {/* System Footer Row & User Sign Out */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
            <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              SYSTEM
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-600 font-medium">
              <Link href="/integrations" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Cpu className="h-3.5 w-3.5 text-slate-400" />
                <span>Integrations</span>
              </Link>
              <Link href="/audit" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
                <span>Audit</span>
              </Link>
              <Link href="/settings" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span>Settings</span>
              </Link>
            </div>

            {/* User Session Bar & Sign Out */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between px-1">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
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
                  <p className="text-[11px] font-semibold text-slate-800 truncate leading-tight">
                    {user?.fullName || "Alex Morgan"}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono capitalize">
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
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
