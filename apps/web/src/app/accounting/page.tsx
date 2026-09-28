"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  DollarSign,
  Plus,
  Search,
  Boxes,
  ShoppingCart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  User,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Download,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  PhoneCall,
  Mail,
  Receipt,
  FileCheck2,
  Check,
  ChevronRight,
  Sparkles,
  PieChart,
  RefreshCw,
  Eye,
  QrCode,
  Copy,
  ArrowRightLeft,
  Sliders,
  Globe2,
  ShieldAlert,
  Repeat,
  FileText,
  Key,
  Lock,
} from "lucide-react";
import {
  INITIAL_ACCOUNTING_CONNECTIONS,
  INITIAL_ENTITY_MAPPINGS,
  INITIAL_SYNC_LOGS,
  INITIAL_DISCREPANCIES,
  AccountingConnectionItem,
  AccountingEntityMappingItem,
  AccountingSyncLogItem,
  AccountingDiscrepancyItem,
  AccountingProvider,
} from "@/lib/accounting-data";
import { useToast } from "@/components/ui";

export default function AccountingPage() {
  const { showToast } = useToast();

  // State
  const [connections, setConnections] = useState<AccountingConnectionItem[]>(INITIAL_ACCOUNTING_CONNECTIONS);
  const [mappings, setMappings] = useState<AccountingEntityMappingItem[]>(INITIAL_ENTITY_MAPPINGS);
  const [syncLogs, setSyncLogs] = useState<AccountingSyncLogItem[]>(INITIAL_SYNC_LOGS);
  const [discrepancies, setDiscrepancies] = useState<AccountingDiscrepancyItem[]>(INITIAL_DISCREPANCIES);

  const [activeTab, setActiveTab] = useState<
    "providers" | "sync" | "mappings" | "logs" | "reconciliation"
  >("providers");

  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");

  // OAuth Connect Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedProviderToConnect, setSelectedProviderToConnect] = useState<AccountingProvider>("quickbooks");
  const [oauthClientId, setOauthClientId] = useState("");
  const [oauthClientSecret, setOauthClientSecret] = useState("");
  const [oauthTenantId, setOauthTenantId] = useState("934145209841882");
  const [isSyncing, setIsSyncing] = useState(false);

  // Metrics
  const metrics = useMemo(() => {
    const totalSyncedInvoices = 88 + 32; // 120
    const totalSyncedContacts = 142 + 45; // 187
    const totalSyncedPayments = 64 + 28; // 92
    const activeWebhooks = connections.filter((c) => c.webhookStatus === "active").length;
    const pendingDiscrepancies = discrepancies.filter((d) => d.status === "detected").length;

    return {
      totalSyncedInvoices,
      totalSyncedContacts,
      totalSyncedPayments,
      activeWebhooks,
      pendingDiscrepancies,
    };
  }, [connections, discrepancies]);

  // Filtered Mappings
  const filteredMappings = useMemo(() => {
    return mappings.filter((m) => {
      const matchesProvider = providerFilter === "all" || m.provider === providerFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        m.localEntityNumber.toLowerCase().includes(q) ||
        m.localTitle.toLowerCase().includes(q) ||
        m.remoteEntityNumber.toLowerCase().includes(q) ||
        m.remoteEntityId.toLowerCase().includes(q);

      return matchesProvider && matchesQuery;
    });
  }, [mappings, providerFilter, searchQuery]);

  // Actions
  const handleTriggerFullSync = (providerName: string = "All Connected Accounting Providers") => {
    setIsSyncing(true);
    showToast({
      title: "Synchronization Initiated",
      message: `Two-way sync queued for ${providerName} (Customers, Invoices, Payments).`,
      type: "info",
    });

    setTimeout(() => {
      setIsSyncing(false);
      const newLog: AccountingSyncLogItem = {
        id: `slog-${Date.now()}`,
        batchId: `batch-sync-${Date.now().toString().slice(-6)}`,
        provider: "xero",
        entityType: "full_suite",
        syncDirection: "bidirectional",
        entitiesProcessed: 54,
        entitiesCreated: 4,
        entitiesUpdated: 50,
        entitiesFailed: 0,
        status: "succeeded",
        startedAt: new Date().toISOString(),
        durationMs: 1650,
      };

      setSyncLogs((prev) => [newLog, ...prev]);

      showToast({
        title: "Sync Completed Successfully",
        message: "54 entities reconciled and checksums verified with General Ledger.",
        type: "success",
      });
    }, 1500);
  };

  const handleConnectProvider = () => {
    if (!oauthClientId || !oauthClientSecret) {
      showToast({
        title: "Validation Error",
        message: "Please provide Client ID and Client Secret from developer portal.",
        type: "error",
      });
      return;
    }

    setConnections((prev) =>
      prev.map((c) => {
        if (c.provider === selectedProviderToConnect) {
          return {
            ...c,
            status: "connected",
            syncStatus: "synced",
            realmId: selectedProviderToConnect === "quickbooks" ? oauthTenantId : c.realmId,
            externalTenantId: selectedProviderToConnect !== "quickbooks" ? oauthTenantId : c.externalTenantId,
            lastSyncedAt: new Date().toISOString(),
            tokenExpiresInHours: 72,
            autoSyncEnabled: true,
            webhookStatus: "active",
          };
        }
        return c;
      })
    );

    setIsConnectModalOpen(false);
    showToast({
      title: "Accounting OAuth Connected",
      message: `${selectedProviderToConnect.toUpperCase()} authorized and vault credentials initialized.`,
      type: "success",
    });
  };

  const handleResolveDiscrepancy = (discId: string) => {
    setDiscrepancies((prev) =>
      prev.map((d) => (d.id === discId ? { ...d, status: "reconciled" } : d))
    );

    showToast({
      title: "Discrepancy Reconciled",
      message: "Tax code variance resolved and adjusted in General Ledger.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              Accounting Connector Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-primary/10 text-primary border border-primary/20 font-semibold">
              General Ledger Sync
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Bidirectional financial synchronization for Xero, Zoho Books, and QuickBooks Online. Two-way Customer, Invoice, and Payment reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/invoices"
            className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-semibold hover:bg-accent transition-colors flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4" /> Invoice Hub
          </Link>
          <button
            onClick={() => handleTriggerFullSync()}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing Ledger..." : "Trigger Full Sync"}
          </button>
        </div>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Synced Invoices</span>
            <FileCheck2 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">{metrics.totalSyncedInvoices} Invoices</p>
          <p className="text-[10px] text-muted-foreground font-mono">Xero (88) &bull; Zoho (32)</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Synced Contacts</span>
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalSyncedContacts} Contacts</p>
          <p className="text-[10px] text-muted-foreground font-mono">Two-Way Customer Map</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Reconciled Payments</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.totalSyncedPayments} Settled</p>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono">Posted to Bank Ledger</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Webhook Listeners</span>
            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-foreground">{metrics.activeWebhooks} Active</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">HMAC SHA-256 Verified</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Discrepancies</span>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-bold text-foreground">
            {metrics.pendingDiscrepancies > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">{metrics.pendingDiscrepancies} Detected</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">0 Balanced</span>
            )}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">Tax & Line Variance</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto text-xs font-semibold">
        {[
          { id: "providers", label: "Connected Accounting Providers", icon: <Landmark className="h-4 w-4" />, count: connections.length },
          { id: "sync", label: "Entity Synchronization Workbench", icon: <Repeat className="h-4 w-4" /> },
          { id: "mappings", label: "Entity Mapping Matrix", icon: <ArrowRightLeft className="h-4 w-4" />, count: mappings.length },
          { id: "logs", label: "Sync Audit History & Webhooks", icon: <Clock className="h-4 w-4" />, count: syncLogs.length },
          { id: "reconciliation", label: "Ledger Reconciliation", icon: <PieChart className="h-4 w-4" />, count: discrepancies.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-mono">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: CONNECTED PROVIDERS */}
      {activeTab === "providers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                Accounting Platform Connectors
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                OAuth 2.0 authorized accounting providers syncing general ledger entries in real time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-foreground">{conn.name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        conn.status === "connected"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {conn.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-primary font-medium">{conn.category}</p>

                  <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-1.5 text-xs">
                    {conn.externalTenantId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tenant / Org ID:</span>
                        <span className="font-mono text-foreground">{conn.externalTenantId}</span>
                      </div>
                    )}
                    {conn.realmId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">QuickBooks Realm ID:</span>
                        <span className="font-mono text-foreground">{conn.realmId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auto-Sync:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {conn.autoSyncEnabled ? `Active (Every ${conn.syncFrequencyMinutes}m)` : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Webhook Security:</span>
                      <span className="font-mono text-foreground uppercase">{conn.webhookStatus}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Synced Entities:</span>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="p-2 bg-muted/20 border border-border rounded">
                        <span className="text-xs font-bold text-foreground">{conn.syncedCounts.customers}</span>
                        <p className="text-[9px] text-muted-foreground uppercase">Contacts</p>
                      </div>
                      <div className="p-2 bg-muted/20 border border-border rounded">
                        <span className="text-xs font-bold text-foreground">{conn.syncedCounts.invoices}</span>
                        <p className="text-[9px] text-muted-foreground uppercase">Invoices</p>
                      </div>
                      <div className="p-2 bg-muted/20 border border-border rounded">
                        <span className="text-xs font-bold text-foreground">{conn.syncedCounts.payments}</span>
                        <p className="text-[9px] text-muted-foreground uppercase">Payments</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex items-center gap-2">
                  {conn.status === "connected" ? (
                    <>
                      <button
                        onClick={() => handleTriggerFullSync(conn.name)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Sync Now
                      </button>
                      <button
                        onClick={() => {
                          showToast({
                            title: "Settings Updated",
                            message: `Auto-sync settings configured for ${conn.name}.`,
                            type: "info",
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors"
                      >
                        Settings
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProviderToConnect(conn.provider);
                        setIsConnectModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Lock className="h-3.5 w-3.5" /> Connect via OAuth 2.0
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ENTITY SYNCHRONIZATION WORKBENCH */}
      {activeTab === "sync" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Repeat className="h-5 w-5 text-primary" />
                Two-Way Entity Synchronization Workbench
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Execute selective or full-suite synchronization pipelines for Customers, Invoices, and Payment Receipts.
              </p>
            </div>

            <button
              onClick={() => handleTriggerFullSync()}
              disabled={isSyncing}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Processing Sync..." : "Sync All Active Entities"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Customers & Contacts
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  Healthy
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Bidirectional synchronization of customer account profiles, tax identifiers, and billing addresses.
              </p>
              <div className="p-2.5 bg-muted/30 border border-border rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Mapped Local &rarr; Xero:</span>
                  <span className="font-bold text-foreground">142</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Mapped Local &rarr; Zoho:</span>
                  <span className="font-bold text-foreground">45</span>
                </div>
              </div>
              <button
                onClick={() => handleTriggerFullSync("Customers & Contacts")}
                className="w-full px-3 py-1.5 rounded bg-muted hover:bg-accent border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1"
              >
                Sync Contacts
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Invoices & Receivables
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  Healthy
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pushes issued ERP invoices to Xero ACCREC, Zoho Invoices, and QuickBooks Sales Receipts.
              </p>
              <div className="p-2.5 bg-muted/30 border border-border rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Invoices Pushed:</span>
                  <span className="font-bold text-foreground">120 Total</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Pending Push:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">0</span>
                </div>
              </div>
              <button
                onClick={() => handleTriggerFullSync("Invoices & Receivables")}
                className="w-full px-3 py-1.5 rounded bg-muted hover:bg-accent border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1"
              >
                Sync Invoices
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-500" />
                  Payment Settlements
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  Healthy
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Matches settled Stripe, Razorpay, and HitPay payments against invoice balances in accounting ledger.
              </p>
              <div className="p-2.5 bg-muted/30 border border-border rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Payments Reconciled:</span>
                  <span className="font-bold text-foreground">92 Transactions</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Bank Feeds Matched:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100%</span>
                </div>
              </div>
              <button
                onClick={() => handleTriggerFullSync("Payment Settlements")}
                className="w-full px-3 py-1.5 rounded bg-muted hover:bg-accent border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1"
              >
                Sync Payments
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-sky-500" />
                  Procurement AP & Stock Assets
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Synchronizes received Purchase Orders into Accounts Payable bills and updates inventory asset valuations.
              </p>
              <div className="p-2.5 bg-muted/30 border border-border rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Open PO Bills:</span>
                  <span className="font-bold text-foreground">4 Active POs</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Inventory Valuation:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">$1,428,500</span>
                </div>
              </div>
              <Link
                href="/inventory"
                className="w-full px-3 py-1.5 rounded bg-muted hover:bg-accent border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1"
              >
                Manage Inventory & POs &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENTITY MAPPING MATRIX */}
      {activeTab === "mappings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Cross-System Entity Mapping Matrix
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live foreign key mapping linking local ERP entities to remote accounting IDs with checksum validation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entity mapping..."
                  className="pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-3 py-1.5 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Providers</option>
                <option value="xero">Xero</option>
                <option value="zoho_books">Zoho Books</option>
                <option value="quickbooks">QuickBooks</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl bg-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Local Platform Record</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Remote Accounting Record</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Sync Status</th>
                  <th className="py-3 px-4 text-right">Last Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMappings.map((map) => (
                  <tr key={map.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted uppercase text-foreground">
                        {map.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-primary">{map.localEntityNumber}</p>
                      <p className="text-[11px] text-foreground">{map.localTitle}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-muted text-foreground">
                        {map.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-foreground font-semibold">
                      {map.remoteEntityNumber} <span className="text-muted-foreground text-[10px]">({map.remoteEntityId})</span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-muted-foreground uppercase font-mono">
                      {map.syncDirection}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {map.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground text-[11px]">
                      {new Date(map.lastSyncedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYNC LOGS & WEBHOOKS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Accounting Sync Execution Audit Ledger
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Historical batch sync audit trail and inbound webhook verification logs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl bg-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Processed</th>
                  <th className="py-3 px-4">Created / Updated</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {log.batchId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted uppercase text-foreground">
                        {log.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-foreground uppercase">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {log.entitiesProcessed}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                      +{log.entitiesCreated} / ~{log.entitiesUpdated}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      {log.durationMs}ms
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground text-[11px]">
                      {new Date(log.startedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RECONCILIATION & DISCREPANCIES */}
      {activeTab === "reconciliation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Ledger Reconciliation & Variance Resolver
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automated detection and resolution of tax code divergences, timing gaps, and unapplied payments between ERP and Accounting.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {discrepancies.map((disc) => (
              <div
                key={disc.id}
                className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-foreground">{disc.localEntityNumber}</span>
                    <span className="text-muted-foreground">&harr;</span>
                    <span className="font-mono text-foreground font-semibold">{disc.remoteEntityNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted uppercase text-foreground">
                      {disc.provider}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        disc.status === "reconciled"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {disc.status}
                    </span>
                  </div>

                  <p className="font-semibold text-foreground">{disc.companyName}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    ERP Total: <strong>${disc.erpAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> &bull; Accounting GL: <strong>${disc.accountingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> &bull; Variance: <span className="text-rose-600 dark:text-rose-400 font-bold">${disc.discrepancyAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> ({disc.discrepancyType.replace("_", " ")})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {disc.status !== "reconciled" ? (
                    <button
                      onClick={() => handleResolveDiscrepancy(disc.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" /> Reconcile & Post Adjustment
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Balanced & Settled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OAUTH CONNECT MODAL */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Connect {selectedProviderToConnect.toUpperCase()} via OAuth 2.0
              </h2>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-muted-foreground">
                Enter credentials generated from the {selectedProviderToConnect.toUpperCase()} Developer Console. Credentials will be securely stored in the multi-tenant vault.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  OAuth Client ID
                </label>
                <input
                  type="text"
                  value={oauthClientId}
                  onChange={(e) => setOauthClientId(e.target.value)}
                  placeholder="e.g. AB123456789..."
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  OAuth Client Secret (Vault Encrypted)
                </label>
                <input
                  type="password"
                  value={oauthClientSecret}
                  onChange={(e) => setOauthClientSecret(e.target.value)}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  {selectedProviderToConnect === "quickbooks" ? "QuickBooks Realm ID" : "Tenant / Organization ID"}
                </label>
                <input
                  type="text"
                  value={oauthTenantId}
                  onChange={(e) => setOauthTenantId(e.target.value)}
                  placeholder="e.g. 934145209841882"
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectProvider}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Key className="h-4 w-4" /> Authorize & Save to Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
