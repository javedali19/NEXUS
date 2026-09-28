import "./globals.css";
import React from "react";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ShellProvider, AppShell } from "@/components/shell";
import { ToastProvider } from "@/components/ui";

export const metadata = {
  title: "Nexus Enterprise | Multi-Tenant ERP + CRM + AI Communications",
  description: "Unified Enterprise Multi-Tenant ERP, CRM, and AI Communications Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <ShellProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </ShellProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
