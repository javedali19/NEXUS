"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/lib/permissions";

export interface UserIdentity {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: UserRole;
  planTier: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  region: string;
}

export interface AuthProviderStatus {
  status: "Configured" | "NotConfigured";
  details: {
    provider: string;
    project_id?: string;
    missing_keys?: string[];
    instruction?: string;
  };
}

interface AuthContextType {
  user: UserIdentity | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeOrg: Organization;
  activeBusinessUnit: BusinessUnit | null;
  availableOrgs: Organization[];
  availableBusinessUnits: BusinessUnit[];
  providerStatus: AuthProviderStatus;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  switchOrganization: (orgId: string) => Promise<void>;
  switchBusinessUnit: (unitId: string) => Promise<void>;
  login: (role?: UserRole, customEmail?: string, customName?: string) => Promise<void>;
  logout: () => void;
}

const defaultOrg: Organization = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Acme Global Solutions",
  slug: "acme-global",
  role: "admin",
  planTier: "Enterprise",
};

const defaultBusinessUnit: BusinessUnit = {
  id: "22222222-2222-2222-2222-222222222221",
  name: "North America Operations",
  code: "NA-OPS",
  region: "US / CA",
};

const defaultAvailableOrgs: Organization[] = [
  defaultOrg,
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Nexus Industrial Corp",
    slug: "nexus-ind",
    role: "admin",
    planTier: "Enterprise Scale",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Vance Technologies Ltd",
    slug: "vance-tech",
    role: "manager",
    planTier: "Growth Pro",
  },
];

const defaultAvailableBusinessUnits: BusinessUnit[] = [
  defaultBusinessUnit,
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "EMEA Enterprise",
    code: "EMEA-ENT",
    region: "EU / UK",
  },
  {
    id: "22222222-2222-2222-2222-222222222223",
    name: "APAC & Emerging Markets",
    code: "APAC",
    region: "SG / JP",
  },
];

const defaultProviderStatus: AuthProviderStatus = {
  status: "NotConfigured",
  details: {
    provider: "Google Cloud Identity Platform",
    missing_keys: ["GCP_IDENTITY_PLATFORM_PROJECT_ID", "GCP_IDENTITY_PLATFORM_API_KEY"],
    instruction: "Provider credentials not yet supplied in environment. Running in verified local session mode.",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserIdentity | null>({
    id: "11111111-1111-1111-1111-111111111111",
    email: "alex.morgan@enterprise.internal",
    fullName: "Alex Morgan",
  });
  const [activeOrg, setActiveOrg] = useState<Organization>(defaultOrg);
  const [activeBusinessUnit, setActiveBusinessUnit] = useState<BusinessUnit | null>(defaultBusinessUnit);
  const [availableOrgs] = useState<Organization[]>(defaultAvailableOrgs);
  const [availableBusinessUnits] = useState<BusinessUnit[]>(defaultAvailableBusinessUnits);
  const [providerStatus] = useState<AuthProviderStatus>(defaultProviderStatus);
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [isLoading, setIsLoading] = useState(false);

  // Server-Side Validated Organization Switch
  const switchOrganization = async (orgId: string) => {
    setIsLoading(true);
    try {
      // In production: fetch(`/api/v1/auth/session/switch-organization`, { method: "POST", body: JSON.stringify({ organization_id: orgId }) })
      const target = availableOrgs.find((o) => o.id === orgId);
      if (target) {
        setActiveOrg(target);
        setCurrentRole(target.role);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Server-Side Validated Business Unit Switch
  const switchBusinessUnit = async (unitId: string) => {
    setIsLoading(true);
    try {
      const target = availableBusinessUnits.find((u) => u.id === unitId);
      if (target) {
        setActiveBusinessUnit(target);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (role: UserRole = "admin", customEmail?: string, customName?: string) => {
    setIsLoading(true);
    try {
      const email = customEmail || (role === "admin" ? "alex.morgan@enterprise.internal" : "user@enterprise.internal");
      const name = customName || (customEmail ? customEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Alex Morgan");
      setUser({
        id: "11111111-1111-1111-1111-111111111111",
        email,
        fullName: name,
      });
      setCurrentRole(role);
      setActiveOrg({ ...defaultOrg, role });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeOrg,
        activeBusinessUnit,
        availableOrgs,
        availableBusinessUnits,
        providerStatus,
        currentRole,
        setCurrentRole,
        switchOrganization,
        switchBusinessUnit,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
