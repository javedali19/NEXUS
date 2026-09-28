"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Lock,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Copy,
  Check,
  Eye,
  FileCode,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Hash,
} from "lucide-react";
import { Badge, Button, StatusIndicator, Card } from "@/components/ui";
import { useShell } from "@/components/shell";

interface AuditEntry {
  id: string;
  organizationId: string;
  organizationName: string;
  userEmail: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  source: "web_ui" | "rest_api" | "gcp_pubsub" | "workflow_engine" | "copilot_agent" | "system_cron";
  correlationId: string;
  causationId?: string;
  outcome: "SUCCESS" | "DENIED" | "FAILED" | "ABORTED";
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
}

const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "aud-001",
    organizationId: "00000000-0000-0000-0000-000000000001",
    organizationName: "Enterprise Global Corp",
    userEmail: "alex.morgan@enterprise.internal",
    userId: "u-9910",
    action: "ERP_INVOICE_PAID",
    entityType: "invoices",
    entityId: "inv-2026-089",
    source: "web_ui",
    correlationId: "c1f83a2e-4b91-4e78-bc5a-10f8a9e01234",
    outcome: "SUCCESS",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: "2026-09-22 14:15:02 UTC",
    beforeState: { status: "issued", balance_due: 45000.0, paid_amount: 0.0 },
    afterState: { status: "paid", balance_due: 0.0, paid_amount: 45000.0, payment_method: "wire_transfer" },
  },
  {
    id: "aud-002",
    organizationId: "00000000-0000-0000-0000-000000000001",
    organizationName: "Enterprise Global Corp",
    userEmail: "system-worker@gcp.internal",
    userId: "u-worker-01",
    action: "AI_SENTIMENT_ANALYZED",
    entityType: "calls",
    entityId: "call-9941",
    source: "gcp_pubsub",
    correlationId: "c1f83a2e-4b91-4e78-bc5a-10f8a9e01234",
    causationId: "call-evt-4412",
    outcome: "SUCCESS",
    ipAddress: "10.128.0.24",
    userAgent: "Nexus-AI-Worker/2.4.0",
    timestamp: "2026-09-22 14:12:44 UTC",
    beforeState: { transcript_status: "pending", sentiment_score: null },
    afterState: { transcript_status: "completed", sentiment_score: 0.88, sentiment_label: "positive", topics: ["expansion", "licensing"] },
  },
  {
    id: "aud-003",
    organizationId: "00000000-0000-0000-0000-000000000001",
    organizationName: "Enterprise Global Corp",
    userEmail: "sarah.jenkins@external.corp",
    userId: "u-ext-441",
    action: "PERMISSION_ACCESS_DENIED",
    entityType: "financial_ledger",
    entityId: "ledger-2026-q3",
    source: "rest_api",
    correlationId: "8b7a421e-1289-4ef3-99b1-00aa44ee8812",
    outcome: "DENIED",
    ipAddress: "203.0.113.195",
    userAgent: "PostmanRuntime/7.32.3",
    timestamp: "2026-09-22 14:05:10 UTC",
    beforeState: null,
    afterState: { error: "InsufficientPrivileges", required_role: "finance_officer", attempted_role: "sales_agent" },
  },
  {
    id: "aud-004",
    organizationId: "00000000-0000-0000-0000-000000000001",
    organizationName: "Enterprise Global Corp",
    userEmail: "copilot-agent@nexus.internal",
    userId: "u-bot-02",
    action: "CRM_DEAL_STAGE_UPDATED",
    entityType: "deals",
    entityId: "deal-7712",
    source: "copilot_agent",
    correlationId: "e9f01832-6a77-4c12-984e-f2a991004115",
    outcome: "SUCCESS",
    ipAddress: "10.128.0.88",
    userAgent: "Nexus-Copilot-Runner/1.1",
    timestamp: "2026-09-22 13:58:30 UTC",
    beforeState: { stage: "discovery", probability: 0.2 },
    afterState: { stage: "proposal", probability: 0.6, ai_generated_notes: "Accepted $120k pricing sheet" },
  },
  {
    id: "aud-005",
    organizationId: "00000000-0000-0000-0000-000000000001",
    organizationName: "Enterprise Global Corp",
    userEmail: "alex.morgan@enterprise.internal",
    userId: "u-9910",
    action: "GDPR_CONSENT_RECORDED",
    entityType: "consents",
    entityId: "cns-4410",
    source: "web_ui",
    correlationId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    outcome: "SUCCESS",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: "2026-09-22 13:45:18 UTC",
    beforeState: { channels: [] },
    afterState: { channels: ["email", "voice_ai_recording", "whatsapp"], ip_recorded: "192.168.1.45" },
  },
  {
    id: "aud-006",
    organizationId: "00000000-0000-0000-0000-000000000001",
    organizationName: "Enterprise Global Corp",
    userEmail: "cron-engine@enterprise.internal",
    userId: "u-cron-99",
    action: "OCR_EXTRACTION_COMPLETED",
    entityType: "documents",
    entityId: "doc-9082",
    source: "system_cron",
    correlationId: "33ee44ff-55aa-66bb-77cc-88dd99ee0011",
    outcome: "SUCCESS",
    ipAddress: "10.128.0.12",
    userAgent: "Nexus-OCR-Engine/3.0",
    timestamp: "2026-09-22 13:30:00 UTC",
    beforeState: { status: "uploaded", parsed_fields: null },
    afterState: { status: "processed", invoice_number: "INV-US-8871", total_amount: 14250.0, confidence: 0.96 },
  },
];

export default function AuditPage() {
  const { currentOrg } = useShell();
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [selectedAudit, setSelectedAudit] = useState<AuditEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = useMemo(() => {
    return INITIAL_AUDIT_LOGS.filter((log) => {
      const matchesSearch =
        log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.correlationId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOutcome = outcomeFilter === "ALL" || log.outcome === outcomeFilter;
      const matchesSource = sourceFilter === "ALL" || log.source === sourceFilter;
      const matchesEntity = entityFilter === "ALL" || log.entityType === entityFilter;

      return matchesSearch && matchesOutcome && matchesSource && matchesEntity;
    });
  }, [searchQuery, outcomeFilter, sourceFilter, entityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            Immutable Platform Audit Trail & Compliance Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-proof, append-only security ledger capturing user actions, permissions, entity mutations, and correlation lineage.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Append-Only Immutability Active</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `audit-compliance-report-${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Compliance JSON
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Total Recorded Events</span>
            <Lock className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">1,492,804</p>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3" /> 100% Append-Only Verified
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">99.82%</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Last 24 Hours Across All Nodes
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Permission Denials</span>
            <AlertOctagon className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1">14</p>
          <span className="text-[10px] text-amber-400 font-mono mt-1 block">
            Blocked by RBAC / ABAC Policies
          </span>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase font-mono">Ledger Cryptographic Hash</span>
            <Hash className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-xs font-mono text-slate-300 mt-2 truncate">
            sha256:8f4c71...9a0e2
          </p>
          <span className="text-[10px] text-purple-400 font-mono mt-1 block">
            PostgreSQL Trigger Enforced
          </span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search actor, action, correlation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="SUCCESS">Outcome: SUCCESS</option>
              <option value="DENIED">Outcome: DENIED</option>
              <option value="FAILED">Outcome: FAILED</option>
              <option value="ABORTED">Outcome: ABORTED</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Sources</option>
              <option value="web_ui">Source: Web UI</option>
              <option value="rest_api">Source: REST API</option>
              <option value="gcp_pubsub">Source: GCP Pub/Sub</option>
              <option value="workflow_engine">Source: Workflow Engine</option>
              <option value="copilot_agent">Source: Copilot Agent</option>
              <option value="system_cron">Source: System Cron</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="invoices">invoices</option>
              <option value="deals">deals</option>
              <option value="calls">calls</option>
              <option value="documents">documents</option>
              <option value="consents">consents</option>
              <option value="financial_ledger">financial_ledger</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Audit Table */}
      <Card className="bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Organization & User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Correlation ID</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No audit records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white truncate max-w-[180px]">
                        {log.userEmail}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        IP: {log.ipAddress}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-blue-400 text-[11px] bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-300 font-semibold">{log.entityType}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                        {log.entityId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {log.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400 text-[11px]">
                          {log.correlationId.substring(0, 8)}...
                        </span>
                        <button
                          onClick={() => handleCopy(log.correlationId, log.id)}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="Copy Full Correlation ID"
                        >
                          {copiedId === log.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {log.outcome === "SUCCESS" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> SUCCESS
                        </span>
                      )}
                      {log.outcome === "DENIED" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                          <AlertOctagon className="h-3 w-3 mr-1" /> DENIED
                        </span>
                      )}
                      {log.outcome === "FAILED" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950 text-rose-400 border border-rose-800">
                          <XCircle className="h-3 w-3 mr-1" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAudit(log)}
                        className="text-xs"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Diff
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Side Modal / Drawer for Before-After State Inspection */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedAudit.action}</h3>
                  <span className="text-[11px] text-slate-400">
                    Audit Record ID: {selectedAudit.id} | Outcome: {selectedAudit.outcome}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Actor</span>
                  <span className="font-semibold text-white truncate block">{selectedAudit.userEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Source</span>
                  <span className="font-semibold text-white font-mono">{selectedAudit.source}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Entity</span>
                  <span className="font-semibold text-white font-mono">{selectedAudit.entityType}:{selectedAudit.entityId}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">IP & Agent</span>
                  <span className="font-semibold text-white truncate block font-mono">{selectedAudit.ipAddress}</span>
                </div>
              </div>

              {/* Correlation & Lineage */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Distributed Trace Lineage</span>
                <p className="font-mono text-slate-200">
                  <strong className="text-blue-400">Correlation ID:</strong> {selectedAudit.correlationId}
                </p>
                {selectedAudit.causationId && (
                  <p className="font-mono text-slate-200">
                    <strong className="text-indigo-400">Causation ID:</strong> {selectedAudit.causationId}
                  </p>
                )}
              </div>

              {/* State Diffs (Before vs. After) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-white uppercase font-mono">
                  State Mutation Snapshot (Before vs. After)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Before */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                      Before State Snapshot
                    </span>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded">
                      {selectedAudit.beforeState
                        ? JSON.stringify(selectedAudit.beforeState, null, 2)
                        : "null (Creation or Access Check)"}
                    </pre>
                  </div>

                  {/* After */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                      After State Snapshot
                    </span>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded">
                      {selectedAudit.afterState
                        ? JSON.stringify(selectedAudit.afterState, null, 2)
                        : "null (Read or Unchanged)"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedAudit(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
