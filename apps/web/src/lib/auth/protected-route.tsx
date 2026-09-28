"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { UserRole, hasPermission } from "@/lib/permissions";
import { LoadingSpinner } from "@/components/ui";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, isLoading, currentRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating Session with Trusted Tenant..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && !hasPermission(requiredRoles, currentRole)) {
    return (
      <div className="p-8 rounded-2xl glass-panel border border-rose-500/30 bg-rose-950/10 text-center space-y-3">
        <h2 className="text-lg font-bold text-white">Access Restricted (RBAC)</h2>
        <p className="text-xs text-slate-300">
          Your current active role (<span className="font-mono text-indigo-400 capitalize">{currentRole}</span>) does not have permission to access this module in organization.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
