"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { useShell } from "./shell-context";
import { useAuth } from "@/lib/auth/auth-context";
import { CommandInterface } from "@/components/ui";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useShell();
  const { isAuthenticated, isLoading } = useAuth();

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Auth pages (Login & Sign Up) render in standalone enterprise layout without dashboard shell
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // Redirect to /login if user is not authenticated and attempting to view protected pages
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, isAuthPage, router]);

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 antialiased">
        {children}
      </main>
    );
  }

  // Show clean spinner while session is being verified
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-xs font-mono text-slate-500">Initializing Nexus session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null while redirecting to /login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* 1. Responsive Sidebar */}
      <Sidebar />

      {/* 2. Top Nav + Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc] scrollbar-thin scrollbar-thumb-slate-200">
          {children}
        </main>
      </div>

      {/* 3. Global AI Command Palette */}
      <CommandInterface
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
