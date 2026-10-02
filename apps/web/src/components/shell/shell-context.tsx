"use client";

import React, { createContext, useContext, useState } from "react";
import { UserRole } from "@/lib/permissions";
import { useAuth, Organization, BusinessUnit } from "@/lib/auth/auth-context";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  module: "erp" | "crm" | "ai" | "system";
  isRead: boolean;
}

interface ShellContextType {
  // Theme (Dark / Light)
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;

  // Tenant / Org (Delegated to trusted server AuthContext)
  organizations: Organization[];
  currentOrg: Organization;
  setCurrentOrg: (org: Organization) => void;

  // Business Unit
  businessUnits: BusinessUnit[];
  currentUnit: BusinessUnit | null;
  setCurrentUnit: (unit: BusinessUnit) => void;

  // Role & Permissions
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Sidebar & Modals
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "ERP Invoice #INV-2026-089 Settled",
    description: "$45,000.00 posted via Wire Transfer. Outbox event synced.",
    timestamp: "2 mins ago",
    module: "erp",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "AI Call Sentiment Alert (+0.88)",
    description: "Sarah Jenkins (Acme Global) completed positive expansion discussion.",
    timestamp: "12 mins ago",
    module: "ai",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "New Lead Ingested via OCR Vision",
    description: "Business card scanned & contact merged into unified identity.",
    timestamp: "1 hour ago",
    module: "crm",
    isRead: true,
  },
];

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const ShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [theme, setThemeState] = useState<"dark" | "light">("light");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Initialize theme from localStorage or document
  React.useEffect(() => {
    const saved = localStorage.getItem("nexus-theme") as "dark" | "light" | null;
    const active = saved || "light";
    setThemeState(active);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(active);
  }, []);

  const setTheme = (newTheme: "dark" | "light") => {
    setThemeState(newTheme);
    localStorage.setItem("nexus-theme", newTheme);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <ShellContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        organizations: auth.availableOrgs,
        currentOrg: auth.activeOrg,
        setCurrentOrg: (org: Organization) => auth.switchOrganization(org.id),
        businessUnits: auth.availableBusinessUnits,
        currentUnit: auth.activeBusinessUnit,
        setCurrentUnit: (unit: BusinessUnit) => auth.switchBusinessUnit(unit.id),
        currentRole: auth.currentRole,
        setCurrentRole: auth.setCurrentRole,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationsCount,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
};

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return context;
}
