"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Upload,
  FileText,
  Download,
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Clock,
  AlertTriangle,
  History,
  Tag,
  Building2,
  ExternalLink,
  Plus,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  Copy,
  Receipt,
  RotateCcw,
  FileSpreadsheet,
  FileCheck,
  ShieldAlert,
  Sliders,
  Calendar,
} from "lucide-react";

interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: string;
  mimeType: string;
  sha256Hash: string;
  scanStatus: "clean" | "pending" | "quarantined";
  uploadedBy: string;
  uploadedAt: string;
  changeSummary: string;
  gcsObjectKey: string;
}

interface DocumentItem {
  id: string;
  title: string;
  category: "invoice" | "contract" | "quote" | "tax_document" | "general";
  accessLevel: "internal_only" | "signed_url_public" | "confidential_restricted";
  customerName: string;
  companyName: string;
  invoiceNumber?: string;
  retentionPolicy: "7_years_tax" | "3_years_contract" | "permanent" | "custom";
  retentionUntilText: string;
  isLegalHold: boolean;
  status: "ready" | "processing" | "ocr_extracted" | "archived";
  tags: string[];
  currentVersion: DocumentVersion;
  versionHistory: DocumentVersion[];
}

interface AuditRecord {
  id: string;
  documentTitle: string;
  actorName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-101",
    title: "Acme_Master_Services_Agreement_2026.pdf",
    category: "contract",
    accessLevel: "confidential_restricted",
    customerName: "Sarah Jenkins",
    companyName: "Acme Industrial Corp",
    retentionPolicy: "3_years_contract",
    retentionUntilText: "Sep 20, 2029 (Active)",
    isLegalHold: true,
    status: "ready",
    tags: ["MSA", "Enterprise", "Legal-Hold"],
    currentVersion: {
      id: "ver-101-2",
      versionNumber: 2,
      fileName: "Acme_Master_Services_Agreement_2026_v2_signed.pdf",
      fileSize: "2.4 MB",
      mimeType: "application/pdf",
      sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      scanStatus: "clean",
      uploadedBy: "Alex Chen (Lead TAM)",
      uploadedAt: "2026-09-20 14:20",
      changeSummary: "Executed version signed by customer CFO & Nexus Legal.",
      gcsObjectKey: "tenants/org_01/contracts/2026/doc-101/v2/Acme_MSA_signed.pdf",
    },
    versionHistory: [
      {
        id: "ver-101-2",
        versionNumber: 2,
        fileName: "Acme_Master_Services_Agreement_2026_v2_signed.pdf",
        fileSize: "2.4 MB",
        mimeType: "application/pdf",
        sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        scanStatus: "clean",
        uploadedBy: "Alex Chen (Lead TAM)",
        uploadedAt: "2026-09-20 14:20",
        changeSummary: "Executed version signed by customer CFO & Nexus Legal.",
        gcsObjectKey: "tenants/org_01/contracts/2026/doc-101/v2/Acme_MSA_signed.pdf",
      },
      {
        id: "ver-101-1",
        versionNumber: 1,
        fileName: "Acme_Master_Services_Agreement_2026_v1_draft.pdf",
        fileSize: "2.1 MB",
        mimeType: "application/pdf",
        sha256Hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        scanStatus: "clean",
        uploadedBy: "Legal Counsel Bot",
        uploadedAt: "2026-09-15 09:10",
        changeSummary: "Initial contract template draft generation.",
        gcsObjectKey: "tenants/org_01/contracts/2026/doc-101/v1/Acme_MSA_draft.pdf",
      },
    ],
  },
  {
    id: "doc-102",
    title: "Invoice_INV-2026-0041_AcmeCorp.pdf",
    category: "invoice",
    accessLevel: "signed_url_public",
    customerName: "Sarah Jenkins",
    companyName: "Acme Industrial Corp",
    invoiceNumber: "INV-2026-0041",
    retentionPolicy: "7_years_tax",
    retentionUntilText: "Sep 22, 2033 (Active)",
    isLegalHold: false,
    status: "ready",
    tags: ["Invoice", "ERP-Generated", "Automated-Billing"],
    currentVersion: {
      id: "ver-102-1",
      versionNumber: 1,
      fileName: "INV-2026-0041_AcmeCorp.pdf",
      fileSize: "420 KB",
      mimeType: "application/pdf",
      sha256Hash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
      scanStatus: "clean",
      uploadedBy: "Nexus Billing Engine",
      uploadedAt: "2026-09-22 10:15",
      changeSummary: "System generated canonical invoice with dynamic Razorpay link.",
      gcsObjectKey: "tenants/org_01/invoices/2026/doc-102/v1/INV-2026-0041.pdf",
    },
    versionHistory: [
      {
        id: "ver-102-1",
        versionNumber: 1,
        fileName: "INV-2026-0041_AcmeCorp.pdf",
        fileSize: "420 KB",
        mimeType: "application/pdf",
        sha256Hash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        scanStatus: "clean",
        uploadedBy: "Nexus Billing Engine",
        uploadedAt: "2026-09-22 10:15",
        changeSummary: "System generated canonical invoice with dynamic Razorpay link.",
        gcsObjectKey: "tenants/org_01/invoices/2026/doc-102/v1/INV-2026-0041.pdf",
      },
    ],
  },
  {
    id: "doc-103",
    title: "GST_Tax_Invoice_ZenithRetail_INR.pdf",
    category: "tax_document",
    accessLevel: "internal_only",
    customerName: "Rajesh Sharma",
    companyName: "Zenith Retail India Pvt Ltd",
    invoiceNumber: "INV-2026-0042",
    retentionPolicy: "7_years_tax",
    retentionUntilText: "Sep 22, 2033 (Active)",
    isLegalHold: false,
    status: "ocr_extracted",
    tags: ["GST-Compliance", "India-Tax", "OCR-Validated"],
    currentVersion: {
      id: "ver-103-1",
      versionNumber: 1,
      fileName: "GST_Tax_Invoice_ZenithRetail.pdf",
      fileSize: "680 KB",
      mimeType: "application/pdf",
      sha256Hash: "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969",
      scanStatus: "clean",
      uploadedBy: "Document Intelligence OCR",
      uploadedAt: "2026-09-22 11:00",
      changeSummary: "OCR verified GSTIN breakdown and e-way bill number.",
      gcsObjectKey: "tenants/org_01/tax/2026/doc-103/v1/GST_ZenithRetail.pdf",
    },
    versionHistory: [
      {
        id: "ver-103-1",
        versionNumber: 1,
        fileName: "GST_Tax_Invoice_ZenithRetail.pdf",
        fileSize: "680 KB",
        mimeType: "application/pdf",
        sha256Hash: "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969",
        scanStatus: "clean",
        uploadedBy: "Document Intelligence OCR",
        uploadedAt: "2026-09-22 11:00",
        changeSummary: "OCR verified GSTIN breakdown and e-way bill number.",
        gcsObjectKey: "tenants/org_01/tax/2026/doc-103/v1/GST_ZenithRetail.pdf",
      },
    ],
  },
  {
    id: "doc-104",
    title: "Enterprise_Proposal_Q-2026-0089.pdf",
    category: "quote",
    accessLevel: "signed_url_public",
    customerName: "Sarah Jenkins",
    companyName: "Acme Industrial Corp",
    retentionPolicy: "3_years_contract",
    retentionUntilText: "Sep 21, 2029 (Active)",
    isLegalHold: false,
    status: "ready",
    tags: ["Proposal", "Quote", "Sales-Deck"],
    currentVersion: {
      id: "ver-104-1",
      versionNumber: 1,
      fileName: "Proposal-Q-2026-0089.pdf",
      fileSize: "1.4 MB",
      mimeType: "application/pdf",
      sha256Hash: "36bbe50ed303b823831ed3e1435b51d24d4224b370e056ac1111902d5e189730",
      scanStatus: "clean",
      uploadedBy: "Alex Chen",
      uploadedAt: "2026-09-21 16:15",
      changeSummary: "Proposal PDF reflecting volume discount tier.",
      gcsObjectKey: "tenants/org_01/quotes/2026/doc-104/v1/Proposal_Q89.pdf",
    },
    versionHistory: [
      {
        id: "ver-104-1",
        versionNumber: 1,
        fileName: "Proposal-Q-2026-0089.pdf",
        fileSize: "1.4 MB",
        mimeType: "application/pdf",
        sha256Hash: "36bbe50ed303b823831ed3e1435b51d24d4224b370e056ac1111902d5e189730",
        scanStatus: "clean",
        uploadedBy: "Alex Chen",
        uploadedAt: "2026-09-21 16:15",
        changeSummary: "Proposal PDF reflecting volume discount tier.",
        gcsObjectKey: "tenants/org_01/quotes/2026/doc-104/v1/Proposal_Q89.pdf",
      },
    ],
  },
];

const INITIAL_AUDITS: AuditRecord[] = [
  {
    id: "aud-01",
    documentTitle: "Acme_Master_Services_Agreement_2026.pdf",
    actorName: "Sarah Jenkins (Customer)",
    action: "downloaded",
    timestamp: "Today, 10:45 AM",
    ipAddress: "198.51.100.44",
    details: "Downloaded via 15-min V4 signed URL (X-Goog-Signature verified)",
  },
  {
    id: "aud-02",
    documentTitle: "Acme_Master_Services_Agreement_2026.pdf",
    actorName: "Legal Counsel Bot",
    action: "legal_hold_toggled",
    timestamp: "Today, 09:00 AM",
    ipAddress: "10.128.0.4",
    details: "Legal hold flag enabled. Automatic document deletion blocked.",
  },
  {
    id: "aud-03",
    documentTitle: "Invoice_INV-2026-0041_AcmeCorp.pdf",
    actorName: "Nexus Automated Billing",
    action: "signed_url_generated",
    timestamp: "Today, 10:15 AM",
    ipAddress: "10.128.0.2",
    details: "Generated signed URL for WhatsApp HSM attachment.",
  },
];

export default function DocumentsStudioPage() {
  const [activeTab, setActiveTab] = useState<"explorer" | "detail" | "audits" | "storage_config">("explorer");
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-101");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Upload Form States
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<"invoice" | "contract" | "quote" | "tax_document" | "general">("contract");
  const [uploadAccess, setUploadAccess] = useState<"internal_only" | "signed_url_public" | "confidential_restricted">("internal_only");
  const [uploadCustomer, setUploadCustomer] = useState<string>("Sarah Jenkins (Acme Industrial Corp)");
  const [uploadInvoice, setUploadInvoice] = useState<string>("");
  const [uploadRetention, setUploadRetention] = useState<"7_years_tax" | "3_years_contract" | "permanent" | "custom">("3_years_contract");

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || documents[0];
  }, [documents, selectedDocId]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchCat = categoryFilter === "all" || doc.category === categoryFilter;
      const matchSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.invoiceNumber && doc.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [documents, categoryFilter, searchTerm]);

  const handleToggleLegalHold = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          const newStatus = !d.isLegalHold;
          showToast(
            newStatus ? "Legal Hold Enabled" : "Legal Hold Released",
            newStatus
              ? `Document '${d.title}' is now locked under legal hold. Deletion and purge blocked.`
              : `Legal hold removed from '${d.title}'. Retention policy standard rule restored.`
          );
          return { ...d, isLegalHold: newStatus };
        }
        return d;
      })
    );
  };

  const handleGenerateSignedUrl = (doc: DocumentItem) => {
    const signedUrl = `https://storage.googleapis.com/nexus-enterprise-tenant-assets/${doc.currentVersion.gcsObjectKey}?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Expires=900&X-Goog-Date=20260923T090000Z&X-Goog-Signature=984a8b...`;
    showToast("V4 Signed URL Generated", "Time-limited 15-minute secure download URL copied to clipboard.");
  };

  const handleUploadDocument = () => {
    if (!uploadTitle.trim()) return;

    const newDocId = `doc-${Date.now().toString().slice(-4)}`;
    const newDoc: DocumentItem = {
      id: newDocId,
      title: uploadTitle.endsWith(".pdf") ? uploadTitle : `${uploadTitle}.pdf`,
      category: uploadCategory,
      accessLevel: uploadAccess,
      customerName: uploadCustomer.split("(")[0].trim(),
      companyName: uploadCustomer.includes("(") ? uploadCustomer.split("(")[1].replace(")", "") : "Enterprise Client",
      invoiceNumber: uploadInvoice || undefined,
      retentionPolicy: uploadRetention,
      retentionUntilText: uploadRetention === "7_years_tax" ? "Sep 23, 2033" : "Sep 23, 2029",
      isLegalHold: false,
      status: "ready",
      tags: [uploadCategory.toUpperCase(), "Uploaded"],
      currentVersion: {
        id: `ver-${newDocId}-1`,
        versionNumber: 1,
        fileName: uploadTitle.endsWith(".pdf") ? uploadTitle : `${uploadTitle}.pdf`,
        fileSize: "1.8 MB",
        mimeType: "application/pdf",
        sha256Hash: "d5a89b882901a9f029384e209848109a8bc4781029348e02938481a02938481a",
        scanStatus: "clean",
        uploadedBy: "Alex Chen (You)",
        uploadedAt: "Just now",
        changeSummary: "Initial version uploaded to Google Cloud Storage.",
        gcsObjectKey: `tenants/org_01/${uploadCategory}/2026/${newDocId}/v1/${uploadTitle}`,
      },
      versionHistory: [],
    };
    newDoc.versionHistory = [newDoc.currentVersion];

    setDocuments((prev) => [newDoc, ...prev]);
    setIsUploadModalOpen(false);
    setUploadTitle("");
    showToast("Document Stored Securely", `Stored to gs://nexus-enterprise-tenant-assets with KMS encryption.`);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border border-primary/20 bg-card shadow-xl flex items-start gap-3 max-w-md">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-bold text-xs text-foreground">{toastMessage.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Secure Document Storage & Retention
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                  Google Cloud Storage (GCS)
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Multi-tenant document repository: immutable version trees, customer & invoice linkages, KMS envelope encryption, and legal hold retention.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Upload Document
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Stored Assets</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{documents.length} Files</div>
          <p className="text-[11px] text-muted-foreground mt-1">Multi-tenant GCS Bucket (4.8 MB Total)</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Legal Holds</span>
            <Lock className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {documents.filter((d) => d.isLegalHold).length} Protected
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Deletion locked under legal compliance</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Malware Scan</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">100% Clean</div>
          <p className="text-[11px] text-muted-foreground mt-1">Automated SHA-256 integrity verification</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Access Security</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">V4 Signed URLs</div>
          <p className="text-[11px] text-muted-foreground mt-1">15-minute time-limited IAM download URLs</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border space-x-1 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab("explorer")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "explorer"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderGit2 className="h-4 w-4" /> Document Explorer ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab("detail")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "detail"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-4 w-4" /> Version Inspector & Metadata
        </button>

        <button
          onClick={() => setActiveTab("audits")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "audits"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Access & Download Audits ({INITIAL_AUDITS.length})
        </button>

        <button
          onClick={() => setActiveTab("storage_config")}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "storage_config"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="h-4 w-4" /> GCS Bucket & KMS Encryption
        </button>
      </div>

      {/* TAB 1: DOCUMENT EXPLORER */}
      {activeTab === "explorer" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => setCategoryFilter("contract")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === "contract"
                    ? "bg-indigo-600 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Contracts & MSAs
              </button>
              <button
                onClick={() => setCategoryFilter("invoice")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === "invoice"
                    ? "bg-emerald-600 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Invoices & Billing
              </button>
              <button
                onClick={() => setCategoryFilter("tax_document")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === "tax_document"
                    ? "bg-amber-600 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Tax & Compliance
              </button>
              <button
                onClick={() => setCategoryFilter("quote")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === "quote"
                    ? "bg-sky-600 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Quotes & Proposals
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Document Title</th>
                  <th className="py-2.5 px-4">Category & Access</th>
                  <th className="py-2.5 px-4">Linked Entity</th>
                  <th className="py-2.5 px-4">Version & Size</th>
                  <th className="py-2.5 px-4">Retention & Hold</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="font-bold text-foreground block">{doc.title}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{doc.currentVersion.gcsObjectKey}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground uppercase">
                          {doc.category.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {doc.accessLevel.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{doc.customerName}</div>
                      <div className="text-[11px] text-muted-foreground">{doc.companyName}</div>
                      {doc.invoiceNumber && (
                        <span className="text-[10px] font-mono text-primary font-bold">{doc.invoiceNumber}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-[10px]">
                          v{doc.currentVersion.versionNumber}.0
                        </span>
                        <span className="text-muted-foreground font-mono text-[11px]">{doc.currentVersion.fileSize}</span>
                      </div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase block mt-0.5">
                        Scan: {doc.currentVersion.scanStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-muted-foreground">{doc.retentionUntilText}</div>
                      {doc.isLegalHold ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mt-0.5">
                          <Lock className="h-2.5 w-2.5" /> LEGAL HOLD
                        </span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground">Standard Policy</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDocId(doc.id);
                            setActiveTab("detail");
                          }}
                          className="px-2 py-1 rounded bg-muted hover:bg-accent text-foreground text-[11px] font-semibold border border-border transition-colors"
                          title="View Version Tree"
                        >
                          Inspect
                        </button>

                        <button
                          onClick={() => handleGenerateSignedUrl(doc)}
                          className="px-2 py-1 rounded bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1"
                          title="Generate 15-Minute Signed URL"
                        >
                          <Download className="h-3 w-3" /> Signed URL
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VERSION INSPECTOR & METADATA */}
      {activeTab === "detail" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Metadata & Actions */}
          <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-primary uppercase font-bold">Document Metadata</span>
                {selectedDoc.isLegalHold && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Legal Hold Active
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-foreground mt-1">{selectedDoc.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Multi-tenant Google Cloud Storage path: <code className="font-mono text-[10px]">{selectedDoc.currentVersion.gcsObjectKey}</code>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Customer Association</span>
                  <span className="font-bold text-foreground">{selectedDoc.customerName}</span>
                  <div className="text-[10px] text-muted-foreground">{selectedDoc.companyName}</div>
                </div>

                <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Invoice Linkage</span>
                  <span className="font-bold font-mono text-primary">{selectedDoc.invoiceNumber || "None (Contract Only)"}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground uppercase">{selectedDoc.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access Classification:</span>
                  <span className="font-semibold text-foreground">{selectedDoc.accessLevel.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retention Policy:</span>
                  <span className="font-semibold text-foreground">{selectedDoc.retentionPolicy.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retention Expiration:</span>
                  <span className="font-mono text-foreground">{selectedDoc.retentionUntilText}</span>
                </div>
              </div>

              {/* Legal Hold Controls */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" /> Legal Hold Protection Flag
                    </span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      When enabled, document purge and deletion are strictly blocked.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleLegalHold(selectedDoc.id)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      selectedDoc.isLegalHold
                        ? "bg-rose-600 text-white hover:bg-rose-500 shadow-sm"
                        : "bg-muted hover:bg-accent text-foreground border border-border"
                    }`}
                  >
                    {selectedDoc.isLegalHold ? "Release Hold" : "Enable Legal Hold"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleGenerateSignedUrl(selectedDoc)}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Generate 15-Minute V4 Signed Download URL
              </button>
            </div>
          </div>

          {/* Right Column: Version History Tree */}
          <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Immutable Version History Tree ({selectedDoc.versionHistory.length} Versions)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cryptographically hashed object versions stored immutably in Google Cloud Storage.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedDoc.versionHistory.map((ver) => (
                <div
                  key={ver.id}
                  className="p-4 bg-muted/30 border border-border rounded-xl space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-mono font-bold text-xs">
                        v{ver.versionNumber}.0
                      </span>
                      <span className="font-bold text-foreground text-xs">{ver.fileName}</span>
                    </div>

                    <span className="text-[10px] text-muted-foreground">{ver.uploadedAt}</span>
                  </div>

                  <p className="text-muted-foreground text-[11px] italic">
                    Change Summary: {ver.changeSummary}
                  </p>

                  <div className="p-2 bg-background border border-border rounded font-mono text-[10px] text-muted-foreground break-all space-y-1">
                    <div>SHA-256 Hash: <strong className="text-foreground">{ver.sha256Hash}</strong></div>
                    <div>GCS Object: <span>{ver.gcsObjectKey}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                    <span>Uploaded By: <strong>{ver.uploadedBy}</strong> ({ver.fileSize})</span>
                    <button
                      onClick={() => handleGenerateSignedUrl(selectedDoc)}
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" /> Download Version
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCESS & AUDIT LEDGER */}
      {activeTab === "audits" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Immutable Document Access & Download Audit Ledger
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tamper-evident access log recording signed URL generation, downloads, and legal hold state modifications.
              </p>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Document</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {INITIAL_AUDITS.map((aud) => (
                <tr key={aud.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground">{aud.documentTitle}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground uppercase">
                      {aud.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">{aud.actorName}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">{aud.ipAddress}</td>
                  <td className="py-3 px-4 text-muted-foreground text-[11px]">{aud.details}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground text-[10px]">{aud.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: GCS STORAGE CONFIG & KMS */}
      {activeTab === "storage_config" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Google Cloud Storage (GCS) Infrastructure & KMS Envelope Encryption
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Terraform managed multi-tenant bucket with automated lifecycle tiering and Customer-Managed KMS Keyring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-2">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">GCS Multi-Tenant Bucket</span>
                <div className="font-mono font-bold text-foreground">gs://nexus-enterprise-tenant-assets</div>
                <div className="text-[11px] text-muted-foreground">Uniform Bucket-Level Access: <strong>Enforced</strong></div>
                <div className="text-[11px] text-muted-foreground">Versioning: <strong>Enabled (Immutable History)</strong></div>
              </div>

              <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-2">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">KMS Envelope Encryption</span>
                <div className="font-mono font-bold text-foreground">projects/nexus-prod/locations/us-central1/keyRings/platform-keyring/cryptoKeys/platform-data-key</div>
                <div className="text-[11px] text-muted-foreground">Algorithm: <strong>AES-256-GCM / 90-Day Rotation</strong></div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-2 text-xs">
              <span className="font-bold text-foreground">Automated Lifecycle Rules:</span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                <li><strong>90 Days:</strong> Objects automatically transition to <code>NEARLINE</code> storage class for cost optimization.</li>
                <li><strong>365 Days:</strong> Objects transition to <code>COLDLINE</code> archival tier.</li>
                <li><strong>Tax & Contract Compliance:</strong> Noncurrent object versions retained for 7 years per regulatory mandates.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Document to Google Cloud Storage
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Document Title / File Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme_Quarterly_Statement_Q4.pdf"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                  >
                    <option value="contract">Contracts & MSAs</option>
                    <option value="invoice">Invoices & Billing</option>
                    <option value="quote">Quotes & Proposals</option>
                    <option value="tax_document">Tax & Compliance</option>
                    <option value="general">General Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Access Classification
                  </label>
                  <select
                    value={uploadAccess}
                    onChange={(e) => setUploadAccess(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                  >
                    <option value="signed_url_public">Signed URL (Customer Download)</option>
                    <option value="internal_only">Internal Team Only</option>
                    <option value="confidential_restricted">Confidential Restricted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Customer Linkage
                  </label>
                  <input
                    type="text"
                    value={uploadCustomer}
                    onChange={(e) => setUploadCustomer(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Invoice Association (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-0041"
                    value={uploadInvoice}
                    onChange={(e) => setUploadInvoice(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                  Compliance Retention Policy
                </label>
                <select
                  value={uploadRetention}
                  onChange={(e) => setUploadRetention(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded text-foreground text-xs"
                >
                  <option value="7_years_tax">7-Year Regulatory Retention (Tax/Financial)</option>
                  <option value="3_years_contract">3-Year Contract Retention</option>
                  <option value="permanent">Permanent Archival</option>
                </select>
              </div>

              <div className="p-3 bg-muted/40 border border-dashed border-border rounded-lg text-center cursor-pointer hover:bg-muted/60 transition-colors">
                <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <span className="text-xs font-semibold text-foreground block">Drag & Drop PDF or Browse</span>
                <span className="text-[10px] text-muted-foreground">KMS Encrypted & SHA-256 Verified on Upload</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadDocument}
                disabled={!uploadTitle.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" /> Upload & Store to GCS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
