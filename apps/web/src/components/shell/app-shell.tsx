"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { useShell } from "./shell-context";
import { CommandInterface } from "@/components/ui";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useShell();

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
  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 antialiased">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* 1. Responsive Sidebar */}
      <Sidebar />

      {/* 2. Top Nav + Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc] dark:bg-[#090d16] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
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
