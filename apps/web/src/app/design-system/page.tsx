"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  Badge,
  StatusIndicator,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  ConfirmationDialog,
  Drawer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  Breadcrumbs,
  Dropdown,
  Tooltip,
  Pagination,
  ToastProvider,
  useToast,
  LoadingSpinner,
  LoadingDots,
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  EmptyState,
  ErrorState,
  CommandInterface,
  Sparkline,
  BarChart,
  DonutProgress,
  SentimentGauge,
} from "@/components/ui";

import {
  Sparkles,
  Zap,
  Bot,
  Mail,
  Search,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Terminal,
} from "lucide-react";

function DesignSystemContent() {
  const { showToast } = useToast();

  // State controls for interactive showcases
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Design System & UI Primitives</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Enterprise SaaS Design Architecture
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A comprehensive, client-presentable, AI-native component library crafted with Next.js, TypeScript, Tailwind CSS, and shadcn/ui aesthetic principles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ai"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            leftIcon={<Terminal className="h-3.5 w-3.5" />}
          >
            Open Command Palette (⌘K)
          </Button>
        </div>
      </div>

      {/* 1. Buttons Showcase */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">1. Action Buttons</h2>
        <Card>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default">Default</Button>
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="glass">Glass Panel</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ai" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
              AI Copilot Action
            </Button>
            <Button variant="primary" isLoading>
              Saving State
            </Button>
          </div>
        </Card>
      </section>

      {/* 2. Inputs & Selects */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">2. Form Controls & Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Search Query"
            placeholder="Search across ERP & CRM..."
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Input
            label="Customer Email"
            placeholder="sarah@acme.com"
            leftIcon={<Mail className="h-4 w-4" />}
            helperText="Single identity across all modules"
          />
          <Select
            label="Lifecycle Stage"
            options={[
              { value: "lead", label: "Lead", badge: "Score 40" },
              { value: "prospect", label: "Prospect", badge: "Score 75" },
              { value: "customer", label: "Active Customer", badge: "VIP" },
            ]}
          />
        </div>
      </section>

      {/* 3. Badges & Status Indicators */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">3. Badges & System Status</h2>
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-2.5 items-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary" dot>Primary</Badge>
            <Badge variant="success" dot>Invoice Paid</Badge>
            <Badge variant="warning">Pending Review</Badge>
            <Badge variant="destructive">Overdue</Badge>
            <Badge variant="info">Pub/Sub Message</Badge>
            <Badge variant="rls">PostgreSQL RLS</Badge>
            <Badge variant="ai" dot>AI Sentiment +0.88</Badge>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-6 items-center">
            <StatusIndicator status="operational" label="Cloud SQL (Operational)" />
            <StatusIndicator status="outbox_syncing" label="Outbox Worker (Syncing)" />
            <StatusIndicator status="protected" label="Cloud Armor (Active)" />
            <StatusIndicator status="degraded" label="Pub/Sub (Degraded)" />
          </div>
        </Card>
      </section>

      {/* 4. Interactive Charts */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">4. SVG Charts & Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Velocity</CardTitle>
              <CardDescription>7-day rolling revenue trend</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-2">
              <div>
                <span className="text-2xl font-extrabold text-white">$145.2k</span>
                <p className="text-[11px] text-emerald-400 font-semibold">+24% vs last week</p>
              </div>
              <Sparkline data={[20, 35, 30, 48, 42, 60, 85]} color="#10b981" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CRM Deal Stage Distribution</CardTitle>
              <CardDescription>Pipeline values by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={[
                  { label: "Qual", value: 18000, color: "bg-sky-500" },
                  { label: "Prop", value: 38000, color: "bg-indigo-500" },
                  { label: "Neg", value: 55000, color: "bg-purple-500" },
                  { label: "Won", value: 145000, color: "bg-emerald-500" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Sentiment & Quota</CardTitle>
              <CardDescription>Customer satisfaction score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-center">
                <DonutProgress percentage={88} color="#a855f7" label="Satisfaction" />
              </div>
              <SentimentGauge score={0.85} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. Enterprise Data Table */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">5. Enterprise Data Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Lifecycle</TableHead>
              <TableHead>Total LTV</TableHead>
              <TableHead>Recent Module Touchpoint</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold text-white">Sarah Jenkins (Acme Global)</TableCell>
              <TableCell><Badge variant="success" size="sm" dot>Customer</Badge></TableCell>
              <TableCell className="font-bold text-emerald-400 font-mono">$145,000.00</TableCell>
              <TableCell className="text-purple-300">AI Call Summary (+0.85)</TableCell>
              <TableCell className="text-right">
                <Dropdown
                  actions={[
                    { label: "View Customer 360", onClick: () => alert("View 360") },
                    { label: "Issue ERP Invoice", onClick: () => alert("Invoice") },
                    { label: "Delete Customer", onClick: () => setIsConfirmOpen(true), variant: "destructive" },
                  ]}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-white">Michael Chen (NexusOps)</TableCell>
              <TableCell><Badge variant="warning" size="sm" dot>Prospect</Badge></TableCell>
              <TableCell className="font-bold text-slate-200 font-mono">$38,000.00</TableCell>
              <TableCell className="text-sky-300">CRM Proposal Sent</TableCell>
              <TableCell className="text-right">
                <Dropdown
                  actions={[
                    { label: "View Customer 360", onClick: () => alert("View 360") },
                    { label: "Advance Deal Stage", onClick: () => alert("Advance") },
                  ]}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Pagination
          currentPage={currentPage}
          totalPages={5}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </section>

      {/* 6. Navigation Tabs & Breadcrumbs */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">6. Navigation & Breadcrumbs</h2>
        <div className="space-y-4">
          <Breadcrumbs
            items={[
              { label: "Customers", href: "/customers" },
              { label: "Acme Global Solutions", href: "/customers" },
              { label: "Financial Invoices" },
            ]}
          />

          <Tabs
            tabs={[
              { id: "all", label: "All Records", count: 42 },
              { id: "erp", label: "ERP Invoices", count: 18 },
              { id: "crm", label: "CRM Deals", count: 14 },
              { id: "ai", label: "AI Transcripts", count: 10 },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </section>

      {/* 7. Modals, Drawers, & Notifications */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">7. Overlays, Drawers & Toasts</h2>
        <Card className="flex flex-wrap gap-4 items-center">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Open Dialog Modal
          </Button>

          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
            Open Side Drawer
          </Button>

          <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
            Open Confirmation Prompt
          </Button>

          <Button
            variant="glass"
            onClick={() =>
              showToast({
                title: "Transactional Outbox Event Dispatched",
                message: "Event published to GCP Pub/Sub topic platform-events-topic",
                type: "success",
              })
            }
          >
            Trigger Success Notification
          </Button>

          <Button
            variant="glass"
            onClick={() =>
              showToast({
                title: "AI Call Analysis Completed",
                message: "Customer sentiment calculated as +0.85",
                type: "ai",
              })
            }
          >
            Trigger AI Notification
          </Button>
        </Card>
      </section>

      {/* 8. Skeletons & Loaders */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">8. Loading & Skeleton Placeholders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" text="Syncing Multi-Tenant RLS Ledger..." />
            <LoadingDots />
          </div>
        </div>
      </section>

      {/* 9. Empty & Error States */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">9. Fallback States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmptyState
            title="No Invoices Issued Yet"
            description="Create your first invoice to automatically post payment events to the shared timeline."
            actionText="Create Invoice"
            onAction={() => alert("Create invoice clicked")}
          />
          <ErrorState
            title="PostgreSQL RLS Connection Timeout"
            message="Database replica did not respond within 5000ms. Retrying with read-write master."
            errorCode="ERR_DB_TIMEOUT_504"
            onRetry={() => alert("Retrying connection...")}
          />
        </div>
      </section>

      {/* Dialogs / Drawers / Palette Mounts */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create New Shared Customer"
        description="Provision a unified customer identity across ERP, CRM, and AI Communications."
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Eleanor Vance" />
          <Input label="Company / Account" placeholder="e.g. Vance Logistics" />
          <Input label="Corporate Email" placeholder="e.g. eleanor@vance.io" />
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(false)}>Save & Propagate</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          alert("Confirmed delete action.");
          setIsConfirmOpen(false);
        }}
        title="Delete Customer Profile?"
        message="This will archive the customer identity across ERP, CRM, and AI Comms timeline records."
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Customer 360 Inspection Drawer"
        description="Deep dive telemetry & transaction history."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60">
            <span className="text-slate-400 block">Tenant Identifier</span>
            <span className="font-mono text-white font-semibold">00000000-0000-0000-0000-000000000001</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60">
            <span className="text-slate-400 block">PostgreSQL RLS Context</span>
            <span className="font-mono text-emerald-400 font-semibold">SET LOCAL app.current_tenant_id</span>
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setIsDrawerOpen(false)}>
            Close Inspection
          </Button>
        </div>
      </Drawer>

      <CommandInterface
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <ToastProvider>
      <DesignSystemContent />
    </ToastProvider>
  );
}
