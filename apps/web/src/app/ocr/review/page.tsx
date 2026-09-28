"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ScanLine,
  Sparkles,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Building2,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Key,
  Database,
  Lock,
  Search,
  Filter,
  Check,
  Eye,
  FileText,
  AlertOctagon,
  Copy,
  Receipt,
  Server,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  History,
  Plus,
  Trash2,
  Undo2,
  CheckSquare,
  XSquare,
  ArrowLeft,
  Save,
  Clock,
  HelpCircle,
} from "lucide-react";

export interface ReviewLineItem {
  id: string;
  itemIndex: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  hsnSacCode?: string;
  taxRate: number; // e.g. 18 for 18%
  taxAmount: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface ReviewAuditEntry {
  id: string;
  eventType: "document_ingested" | "supplier_matched" | "field_corrected" | "line_item_modified" | "approved" | "rejected" | "retried";
  title: string;
  description: string;
  fieldName?: string;
  originalValue?: string;
  correctedValue?: string;
  actorName: string;
  occurredAt: string;
}

export interface ReviewDocument {
  id: string;
  invoiceNumber: string;
  documentTitle: string;
  fileSize: string;
  sha256Hash: string;
  gcsUri: string;
  reviewStatus: "pending_review" | "under_review" | "approved" | "rejected" | "retried";
  overallConfidence: number;
  
  // Header fields with per-field confidence
  fields: {
    invoiceNumber: { value: string; confidence: number };
    invoiceDate: { value: string; confidence: number };
    dueDate: { value: string; confidence: number };
    currency: { value: string; confidence: number };
    poNumber: { value: string; confidence: number };
    supplierTaxId: { value: string; confidence: number };
  };

  // Supplier Matching
  supplierMatch: {
    vendorId: string;
    extractedName: string;
    matchedName: string;
    taxId: string;
    confidence: number;
    matchType: "exact_tax_id" | "fuzzy_name" | "manual_override" | "unmatched";
    paymentTerms: string;
  };

  customerName: string;
  customerTaxId: string;
  
  // Line items
  lineItems: ReviewLineItem[];
  discountAmount: number;
  notes: string;
  
  // Audit Trail
  auditHistory: ReviewAuditEntry[];
  
  // Duplicate Flag
  isDuplicateKnown: boolean;
  duplicateInvoiceNumber?: string;
}

const MASTER_VENDORS = [
  { id: "vnd-101", name: "Apex Cloud Systems Inc.", taxId: "US-EIN-9921049", terms: "Net 30" },
  { id: "vnd-102", name: "Titan Hardware Solutions LLC", taxId: "US-EIN-4410291", terms: "Net 15" },
  { id: "vnd-103", name: "Starlight Air Charter Freight", taxId: "EU-VAT-8839102", terms: "Net 30" },
  { id: "vnd-104", name: "Acme Global Solutions", taxId: "US-EIN-1299482", terms: "Net 45" },
  { id: "vnd-105", name: "Quantum Server Networks GmbH", taxId: "DE-VAT-9021884", terms: "Net 30" },
];

const INITIAL_REVIEW_DOCUMENTS: ReviewDocument[] = [
  {
    id: "doc-rev-889",
    invoiceNumber: "INV-2026-MATHPIX-889",
    documentTitle: "Apex_Cloud_Invoice_Sep2026.pdf",
    fileSize: "1.4 MB",
    sha256Hash: "7a9f8b0129cd8a1928471e827364510293847561029384756102938475610293",
    gcsUri: "gs://nexus-enterprise-tenant-assets/tenants/org_01/invoices/2026/doc-rev-889/v1/Apex_Cloud_Invoice_Sep2026.pdf",
    reviewStatus: "pending_review",
    overallConfidence: 98.4,
    fields: {
      invoiceNumber: { value: "INV-2026-MATHPIX-889", confidence: 99.8 },
      invoiceDate: { value: "2026-09-22", confidence: 99.1 },
      dueDate: { value: "2026-10-22", confidence: 97.4 },
      currency: { value: "USD", confidence: 99.9 },
      poNumber: { value: "PO-2026-091", confidence: 92.5 },
      supplierTaxId: { value: "US-EIN-9921049", confidence: 98.8 },
    },
    supplierMatch: {
      vendorId: "vnd-101",
      extractedName: "Apex Cloud Systems Inc.",
      matchedName: "Apex Cloud Systems Inc.",
      taxId: "US-EIN-9921049",
      confidence: 99.5,
      matchType: "exact_tax_id",
      paymentTerms: "Net 30",
    },
    customerName: "Nexus Global Enterprise Ltd",
    customerTaxId: "GSTIN29AAACN0192A1Z5",
    discountAmount: 50.0,
    notes: "Verified Mathpix extraction. Line items mapped to cloud infrastructure expense accounts.",
    lineItems: [
      {
        id: "item-rev-1",
        itemIndex: 1,
        description: "High-Throughput Kubernetes Cluster Node",
        quantity: 2,
        unitPrice: 500.0,
        amount: 1000.0,
        hsnSacCode: "998313",
        taxRate: 18.0,
        taxAmount: 180.0,
        boundingBox: { x: 10, y: 45, width: 80, height: 8 },
      },
      {
        id: "item-rev-2",
        itemIndex: 2,
        description: "Dedicated Secure VPN Gateway",
        quantity: 1,
        unitPrice: 500.0,
        amount: 500.0,
        hsnSacCode: "998314",
        taxRate: 18.0,
        taxAmount: 90.0,
        boundingBox: { x: 10, y: 55, width: 80, height: 8 },
      },
    ],
    auditHistory: [
      {
        id: "aud-01",
        eventType: "document_ingested",
        title: "Ingested via Mathpix v3 Pipeline",
        description: "Raw PDF extracted with 98.4% overall confidence. 2 line items identified.",
        actorName: "Mathpix Neural Engine",
        occurredAt: "Today, 08:30 AM",
      },
      {
        id: "aud-02",
        eventType: "supplier_matched",
        title: "Supplier Auto-Matched to Master Vendor",
        description: "Matched to 'Apex Cloud Systems Inc.' (VND-101) with 99.5% confidence via Tax ID.",
        actorName: "ERP Entity Resolver",
        occurredAt: "Today, 08:31 AM",
      },
    ],
    isDuplicateKnown: false,
  },
  {
    id: "doc-rev-042",
    invoiceNumber: "INV-2026-ERR-042",
    documentTitle: "Hardware_Corp_Shipment_Invoice.pdf",
    fileSize: "2.1 MB",
    sha256Hash: "882b4c1029384756102938475610293847561029384756102938475610293847",
    gcsUri: "gs://nexus-enterprise-tenant-assets/tenants/org_01/invoices/2026/doc-rev-042/v1/Hardware_Corp_Shipment_Invoice.pdf",
    reviewStatus: "under_review",
    overallConfidence: 88.2,
    fields: {
      invoiceNumber: { value: "INV-2026-ERR-042", confidence: 96.2 },
      invoiceDate: { value: "2026-09-21", confidence: 94.0 },
      dueDate: { value: "2026-10-05", confidence: 86.5 },
      currency: { value: "USD", confidence: 99.0 },
      poNumber: { value: "PO-7740", confidence: 81.0 },
      supplierTaxId: { value: "US-EIN-4410291", confidence: 92.0 },
    },
    supplierMatch: {
      vendorId: "vnd-102",
      extractedName: "Titan Hardware Solutions LLC",
      matchedName: "Titan Hardware Solutions LLC",
      taxId: "US-EIN-4410291",
      confidence: 96.0,
      matchType: "exact_tax_id",
      paymentTerms: "Net 15",
    },
    customerName: "Nexus Global Enterprise Ltd",
    customerTaxId: "GSTIN29AAACN0192A1Z5",
    discountAmount: 0.0,
    notes: "Requires arithmetic correction: extracted amount was $2500 but qty 2 x unit price $1000 = $2000.",
    lineItems: [
      {
        id: "item-rev-101",
        itemIndex: 1,
        description: "Rack-Mount High Memory Server Blade",
        quantity: 2,
        unitPrice: 1000.0,
        amount: 2500.0, // Arithmetic error from OCR
        hsnSacCode: "847150",
        taxRate: 18.0,
        taxAmount: 450.0,
        boundingBox: { x: 10, y: 50, width: 80, height: 10 },
      },
    ],
    auditHistory: [
      {
        id: "aud-101",
        eventType: "document_ingested",
        title: "Ingested via Mathpix OCR",
        description: "Raw OCR returned arithmetic disparity on line item #1.",
        actorName: "Mathpix Neural Engine",
        occurredAt: "Yesterday, 16:42 PM",
      },
    ],
    isDuplicateKnown: false,
  },
  {
    id: "doc-rev-099",
    invoiceNumber: "INV-2026-0001", // Duplicate of standard initial invoice
    documentTitle: "Acme_Duplicate_Claim_Scan.pdf",
    fileSize: "890 KB",
    sha256Hash: "1928374650192837465019283746501928374650192837465019283746501928",
    gcsUri: "gs://nexus-enterprise-tenant-assets/tenants/org_01/invoices/2026/doc-rev-099/v1/Acme_Duplicate_Claim_Scan.pdf",
    reviewStatus: "pending_review",
    overallConfidence: 94.6,
    fields: {
      invoiceNumber: { value: "INV-2026-0001", confidence: 99.2 },
      invoiceDate: { value: "2026-09-20", confidence: 95.1 },
      dueDate: { value: "2026-09-30", confidence: 91.0 },
      currency: { value: "USD", confidence: 99.5 },
      poNumber: { value: "PO-ACME-01", confidence: 89.0 },
      supplierTaxId: { value: "US-EIN-1299482", confidence: 97.0 },
    },
    supplierMatch: {
      vendorId: "vnd-104",
      extractedName: "Acme Global Solutions",
      matchedName: "Acme Global Solutions",
      taxId: "US-EIN-1299482",
      confidence: 98.0,
      matchType: "fuzzy_name",
      paymentTerms: "Net 45",
    },
    customerName: "Nexus Global Enterprise Ltd",
    customerTaxId: "GSTIN29AAACN0192A1Z5",
    discountAmount: 0.0,
    notes: "Duplicate warning triggered: INV-2026-0001 is already present in ERP Ledger.",
    lineItems: [
      {
        id: "item-rev-201",
        itemIndex: 1,
        description: "Enterprise SaaS Platform License - Annual",
        quantity: 1,
        unitPrice: 12500.0,
        amount: 12500.0,
        hsnSacCode: "998313",
        taxRate: 8.0,
        taxAmount: 1000.0,
        boundingBox: { x: 10, y: 48, width: 80, height: 12 },
      },
    ],
    auditHistory: [
      {
        id: "aud-201",
        eventType: "document_ingested",
        title: "Ingested via Mathpix OCR",
        description: "Extracted invoice number INV-2026-0001 matches existing ERP invoice record.",
        actorName: "Mathpix Neural Engine",
        occurredAt: "Sep 20, 11:15 AM",
      },
    ],
    isDuplicateKnown: true,
    duplicateInvoiceNumber: "INV-2026-0001",
  },
];

export default function OcrReviewConsolePage() {
  const [documents, setDocuments] = useState<ReviewDocument[]>(INITIAL_REVIEW_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-rev-889");
  
  // Document Viewer Zoom & Transform States
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [activeHighlightField, setActiveHighlightField] = useState<string | null>(null);

  // Rejection Dialog State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("unreadable_scan");
  const [rejectionNotes, setRejectionNotes] = useState<string>("");

  // Retry State
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Approval In-Progress
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [createdInvoiceResult, setCreatedInvoiceResult] = useState<{ id: string; invoiceNumber: string } | null>(null);

  // Active Tab in Workbench
  const [workbenchTab, setWorkbenchTab] = useState<"fields" | "items" | "totals" | "audit">("fields");

  // Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: "success" | "warning" | "info" } | null>(null);

  const showToast = (title: string, desc: string, type: "success" | "warning" | "info" = "info") => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || documents[0];
  }, [documents, selectedDocId]);

  // Derived Totals and Invariants
  const mathCalculations = useMemo(() => {
    const subtotal = activeDoc.lineItems.reduce((acc, item) => acc + item.amount, 0);
    const taxAmount = activeDoc.lineItems.reduce((acc, item) => acc + item.taxAmount, 0);
    const calculatedTotal = subtotal + taxAmount - activeDoc.discountAmount;

    // Check if each line item has qty * price == amount
    const lineMultiplicationsValid = activeDoc.lineItems.every((item) => {
      const expected = Math.round(item.quantity * item.unitPrice * 100) / 100;
      return Math.abs(expected - item.amount) < 0.05;
    });

    return {
      subtotal,
      taxAmount,
      discountAmount: activeDoc.discountAmount,
      totalAmount: calculatedTotal,
      lineMultiplicationsValid,
      isBalanced: lineMultiplicationsValid,
    };
  }, [activeDoc]);

  // Update Field Value and record audit log
  const handleUpdateField = (
    fieldKey: keyof ReviewDocument["fields"],
    newValue: string
  ) => {
    const originalValue = activeDoc.fields[fieldKey].value;
    if (originalValue === newValue) return;

    const newAudit: ReviewAuditEntry = {
      id: `aud-${Date.now()}`,
      eventType: "field_corrected",
      title: `Field '${fieldKey}' Edited`,
      description: `Reviewer corrected '${originalValue}' to '${newValue}'.`,
      fieldName: fieldKey,
      originalValue,
      correctedValue: newValue,
      actorName: "Sarah Reviewer (Financial Auditor)",
      occurredAt: "Just now",
    };

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDoc.id) {
          return {
            ...doc,
            fields: {
              ...doc.fields,
              [fieldKey]: { ...doc.fields[fieldKey], value: newValue },
            },
            invoiceNumber: fieldKey === "invoiceNumber" ? newValue : doc.invoiceNumber,
            auditHistory: [newAudit, ...doc.auditHistory],
          };
        }
        return doc;
      })
    );

    showToast("Field Corrected", `Updated ${fieldKey} to '${newValue}'. Recorded in audit trail.`, "info");
  };

  // Update Line Item
  const handleUpdateLineItem = (
    itemId: string,
    key: keyof ReviewLineItem,
    newValue: any
  ) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDoc.id) {
          const updatedItems = doc.lineItems.map((item) => {
            if (item.id === itemId) {
              const updated = { ...item, [key]: newValue };
              // Auto-recalculate taxAmount if taxRate or amount changes
              if (key === "amount" || key === "taxRate") {
                const amt = key === "amount" ? Number(newValue) : item.amount;
                const rate = key === "taxRate" ? Number(newValue) : item.taxRate;
                updated.taxAmount = Math.round(((amt * rate) / 100) * 100) / 100;
              }
              return updated;
            }
            return item;
          });

          const newAudit: ReviewAuditEntry = {
            id: `aud-${Date.now()}`,
            eventType: "line_item_modified",
            title: `Line Item Modified`,
            description: `Reviewer modified ${key} on line item.`,
            actorName: "Sarah Reviewer (Financial Auditor)",
            occurredAt: "Just now",
          };

          return {
            ...doc,
            lineItems: updatedItems,
            auditHistory: [newAudit, ...doc.auditHistory],
          };
        }
        return doc;
      })
    );
  };

  // Auto-Fix Line Item Arithmetic
  const handleFixLineItemMath = (itemId: string) => {
    const item = activeDoc.lineItems.find((i) => i.id === itemId);
    if (!item) return;
    const correctAmount = Math.round(item.quantity * item.unitPrice * 100) / 100;
    handleUpdateLineItem(itemId, "amount", correctAmount);
    showToast("Arithmetic Corrected", `Line item amount fixed to ${item.quantity} × $${item.unitPrice.toFixed(2)} = $${correctAmount.toFixed(2)}.`, "success");
  };

  // Add Line Item
  const handleAddLineItem = () => {
    const newItem: ReviewLineItem = {
      id: `item-new-${Date.now().toString().slice(-4)}`,
      itemIndex: activeDoc.lineItems.length + 1,
      description: "Additional Invoice Service / Surcharge",
      quantity: 1,
      unitPrice: 100.0,
      amount: 100.0,
      hsnSacCode: "998319",
      taxRate: 18.0,
      taxAmount: 18.0,
    };

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDoc.id) {
          return {
            ...doc,
            lineItems: [...doc.lineItems, newItem],
          };
        }
        return doc;
      })
    );
    showToast("Line Item Added", "New line item added to table.", "info");
  };

  // Delete Line Item
  const handleDeleteLineItem = (itemId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDoc.id) {
          return {
            ...doc,
            lineItems: doc.lineItems.filter((i) => i.id !== itemId),
          };
        }
        return doc;
      })
    );
    showToast("Line Item Deleted", "Line item removed from invoice.", "info");
  };

  // Switch Matched Supplier
  const handleSwitchSupplier = (vendorId: string) => {
    const vendor = MASTER_VENDORS.find((v) => v.id === vendorId);
    if (!vendor) return;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDoc.id) {
          const newAudit: ReviewAuditEntry = {
            id: `aud-${Date.now()}`,
            eventType: "supplier_matched",
            title: `Supplier Switched Manually`,
            description: `Reviewer selected '${vendor.name}' (Tax ID: ${vendor.taxId}).`,
            actorName: "Sarah Reviewer (Financial Auditor)",
            occurredAt: "Just now",
          };

          return {
            ...doc,
            supplierMatch: {
              ...doc.supplierMatch,
              vendorId: vendor.id,
              matchedName: vendor.name,
              taxId: vendor.taxId,
              confidence: 100.0,
              matchType: "manual_override",
              paymentTerms: vendor.terms,
            },
            auditHistory: [newAudit, ...doc.auditHistory],
          };
        }
        return doc;
      })
    );
    showToast("Supplier Match Updated", `Associated invoice with master vendor '${vendor.name}'.`, "success");
  };

  // Decision Action 1: Approve & Post to ERP
  const handleApproveInvoice = async () => {
    setIsApproving(true);
    try {
      // Normal API Call to POST /api/invoices
      const payload = {
        invoiceNumber: activeDoc.fields.invoiceNumber.value,
        customerId: activeDoc.supplierMatch.vendorId,
        customerName: activeDoc.supplierMatch.matchedName,
        currency: activeDoc.fields.currency.value,
        issueDate: activeDoc.fields.invoiceDate.value,
        dueDate: activeDoc.fields.dueDate.value,
        paymentTerms: activeDoc.supplierMatch.paymentTerms,
        items: activeDoc.lineItems.map((item) => ({
          itemCode: item.hsnSacCode || `HSN-${item.itemIndex}`,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
        notes: activeDoc.notes,
        sourceExtractionId: activeDoc.id,
        allowUpdate: activeDoc.isDuplicateKnown,
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to post invoice to ERP API.");
      }

      // Record approval in document state
      const approveAudit: ReviewAuditEntry = {
        id: `aud-${Date.now()}`,
        eventType: "approved",
        title: "Approved & Posted to ERP Ledger",
        description: `Successfully posted to ERP Billing API (Invoice ID: ${data.invoice.id}). Invariants validated.`,
        actorName: "Sarah Reviewer (Financial Auditor)",
        occurredAt: "Just now",
      };

      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === activeDoc.id) {
            return {
              ...doc,
              reviewStatus: "approved",
              auditHistory: [approveAudit, ...doc.auditHistory],
            };
          }
          return doc;
        })
      );

      setCreatedInvoiceResult({
        id: data.invoice.id,
        invoiceNumber: data.invoice.invoiceNumber,
      });

      showToast(
        "Invoice Approved & Created in ERP",
        `Created invoice ${data.invoice.invoiceNumber} in ERP Accounts Payable ledger.`,
        "success"
      );
    } catch (err: any) {
      showToast("Approval Failed", err?.message || "Failed to approve invoice", "warning");
    } finally {
      setIsApproving(false);
    }
  };

  // Decision Action 2: Reject
  const handleConfirmReject = () => {
    const rejectAudit: ReviewAuditEntry = {
      id: `aud-${Date.now()}`,
      eventType: "rejected",
      title: "Extraction Rejected by Reviewer",
      description: `Reason: ${rejectionReason.toUpperCase()}. Notes: ${rejectionNotes || "None"}`,
      actorName: "Sarah Reviewer (Financial Auditor)",
      occurredAt: "Just now",
    };

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDoc.id) {
          return {
            ...doc,
            reviewStatus: "rejected",
            auditHistory: [rejectAudit, ...doc.auditHistory],
          };
        }
        return doc;
      })
    );

    setIsRejectModalOpen(false);
    showToast("Extraction Rejected", `Marked document as rejected. Reason: ${rejectionReason}.`, "warning");
  };

  // Decision Action 3: Retry Mathpix OCR
  const handleRetryMathpix = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      const retryAudit: ReviewAuditEntry = {
        id: `aud-${Date.now()}`,
        eventType: "retried",
        title: "Mathpix OCR Retried with Contrast Boost",
        description: "Re-processed through Mathpix neural engine. Confidence re-calculated to 99.2%.",
        actorName: "Mathpix Neural Engine",
        occurredAt: "Just now",
      };

      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === activeDoc.id) {
            return {
              ...doc,
              reviewStatus: "under_review",
              overallConfidence: 99.2,
              auditHistory: [retryAudit, ...doc.auditHistory],
            };
          }
          return doc;
        })
      );

      showToast("OCR Retried Successfully", "Re-parsed document with high-contrast table enhancement.", "success");
    }, 1500);
  };

  // Confidence color helper
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          {confidence.toFixed(1)}%
        </span>
      );
    }
    if (confidence >= 85) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          {confidence.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
        {confidence.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-14">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border border-primary/20 bg-card shadow-2xl flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
          ) : toastMessage.type === "warning" ? (
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-xs text-foreground">{toastMessage.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Top Console Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/ocr"
            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                OCR Review & Exception Console
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-primary/10 text-primary border border-primary/20 uppercase font-semibold">
                  Human-in-the-Loop
                </span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Review original invoice scans, correct OCR misreads, match vendors, and approve directly to ERP Billing.
            </p>
          </div>
        </div>

        {/* Document Queue Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono hidden md:inline">Queue ({documents.length}):</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {documents.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              const isApproved = doc.reviewStatus === "approved";
              const isRejected = doc.reviewStatus === "rejected";

              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  ) : isRejected ? (
                    <XCircle className="h-3 w-3 text-rose-400" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {doc.invoiceNumber}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Duplicate Invoice Warning Banner */}
      {activeDoc.isDuplicateKnown && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 flex items-start justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                Duplicate Warning: Invoice Number Already Registered in ERP
              </h4>
              <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">
                Invoice <strong>{activeDoc.duplicateInvoiceNumber}</strong> from vendor &apos;{activeDoc.supplierMatch.matchedName}&apos; already exists in the Accounts Payable ledger. Approving this document will update the existing invoice records rather than creating a duplicate AP obligation.
              </p>
            </div>
          </div>
          <Link
            href="/invoices"
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors shrink-0 shadow-sm flex items-center gap-1"
          >
            Inspect Existing in ERP <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Main Split Screen: Left = Document Viewer, Right = Review Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: ORIGINAL DOCUMENT VIEWER (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
            {/* Viewer Header & Controls */}
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground truncate max-w-[180px]">
                  {activeDoc.documentTitle}
                </span>
              </div>

              {/* Zoom & Rotation Toolbar */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
                  title="Zoom Out"
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-foreground px-1">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
                  title="Zoom In"
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setRotationAngle((r) => (r + 90) % 360)}
                  title="Rotate 90° Clockwise"
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(100);
                    setRotationAngle(0);
                  }}
                  title="Reset View"
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Document Interactive Canvas Preview */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-slate-100 dark:bg-slate-900/60 p-4 min-h-[480px] flex items-center justify-center shadow-inner">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="w-full max-w-[420px] bg-white text-slate-900 p-6 rounded-lg shadow-xl border border-slate-200 font-mono text-[11px] relative select-none"
              >
                {/* Visual Bounding Box Overlays */}
                {/* 1. Header Bounding Box */}
                <div
                  className={`absolute top-5 left-5 right-5 p-1 rounded transition-all cursor-pointer ${
                    activeHighlightField === "invoice_number"
                      ? "ring-2 ring-primary bg-primary/10"
                      : "hover:bg-primary/5"
                  }`}
                  onClick={() => setActiveHighlightField("invoice_number")}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{activeDoc.supplierMatch.extractedName}</div>
                      <div className="text-[10px] text-slate-500">Tax ID: {activeDoc.supplierMatch.taxId}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1 py-0.5 rounded border border-slate-200">
                        TAX INVOICE
                      </span>
                      <div className="font-bold text-xs mt-1 text-slate-900">{activeDoc.fields.invoiceNumber.value}</div>
                      <div className="text-[10px] text-slate-500">Date: {activeDoc.fields.invoiceDate.value}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Customer Bounding Box */}
                <div
                  className={`mt-16 p-2 rounded transition-all cursor-pointer ${
                    activeHighlightField === "customer"
                      ? "ring-2 ring-primary bg-primary/10"
                      : "hover:bg-primary/5"
                  }`}
                  onClick={() => setActiveHighlightField("customer")}
                >
                  <div className="text-[9px] uppercase font-bold text-slate-400">BILL TO:</div>
                  <div className="font-bold text-slate-900">{activeDoc.customerName}</div>
                  <div className="text-[10px] text-slate-500">GSTIN: {activeDoc.customerTaxId}</div>
                </div>

                {/* 3. Line Items Bounding Box */}
                <div className="mt-4 border-t border-b border-slate-200 py-2 space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                    <span>Item</span>
                    <span>Amt</span>
                  </div>
                  {activeDoc.lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveHighlightField(`item_${item.id}`)}
                      className={`flex justify-between items-center py-1 px-1 rounded transition-all cursor-pointer ${
                        activeHighlightField === `item_${item.id}`
                          ? "ring-2 ring-primary bg-primary/15 font-bold"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="truncate max-w-[200px]">
                        {item.quantity}x {item.description}
                      </div>
                      <div className="font-mono">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4. Totals Bounding Box */}
                <div
                  onClick={() => setActiveHighlightField("totals")}
                  className={`mt-3 pt-1 space-y-1 text-[10px] rounded p-1 transition-all cursor-pointer ${
                    activeHighlightField === "totals"
                      ? "ring-2 ring-primary bg-primary/10"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>${mathCalculations.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Tax:</span>
                    <span>${mathCalculations.taxAmount.toFixed(2)}</span>
                  </div>
                  {activeDoc.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>-${activeDoc.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200 text-slate-900">
                    <span>Invoice Total:</span>
                    <span>${mathCalculations.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Simulated Watermark */}
                <div className="mt-6 text-center text-[9px] text-slate-400 font-mono">
                  GCS Storage Verified • SHA256: {activeDoc.sha256Hash.slice(0, 16)}...
                </div>
              </div>
            </div>

            {/* Document Telemetry Footer */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>Overall OCR Confidence:</span>
              <span className="font-bold text-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                {activeDoc.overallConfidence}%
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVIEW WORKBENCH & EDITABLE CORRECTIONS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Status & Quick Action Bar */}
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground font-mono">{activeDoc.invoiceNumber}</h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono border ${
                    activeDoc.reviewStatus === "approved"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : activeDoc.reviewStatus === "rejected"
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  }`}
                >
                  {activeDoc.reviewStatus.replace(/_/g, " ")}
                </span>
                {getConfidenceBadge(activeDoc.overallConfidence)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vendor: <strong>{activeDoc.supplierMatch.matchedName}</strong> • Matched via {activeDoc.supplierMatch.matchType.replace(/_/g, " ")}
              </p>
            </div>

            {/* Decision Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRetryMathpix}
                disabled={isRetrying}
                title="Re-run Mathpix OCR with Enhanced Contrast"
                className="px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin text-primary" : ""}`} />
                Retry
              </button>

              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={activeDoc.reviewStatus === "rejected"}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <XSquare className="h-3.5 w-3.5" />
                Reject
              </button>

              <button
                onClick={handleApproveInvoice}
                disabled={isApproving || activeDoc.reviewStatus === "approved" || !mathCalculations.isBalanced}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Posting to ERP...
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3.5 w-3.5" />
                    {activeDoc.reviewStatus === "approved" ? "Approved in ERP" : "Approve & Post to ERP"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Workbench Tabs */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setWorkbenchTab("fields")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                workbenchTab === "fields"
                  ? "bg-card text-foreground font-semibold shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCheck className="h-3.5 w-3.5 text-primary" />
              Header Fields
            </button>
            <button
              onClick={() => setWorkbenchTab("items")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                workbenchTab === "items"
                  ? "bg-card text-foreground font-semibold shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-primary" />
              Line Items ({activeDoc.lineItems.length})
            </button>
            <button
              onClick={() => setWorkbenchTab("totals")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                workbenchTab === "totals"
                  ? "bg-card text-foreground font-semibold shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              Totals & Invariants
            </button>
            <button
              onClick={() => setWorkbenchTab("audit")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                workbenchTab === "audit"
                  ? "bg-card text-foreground font-semibold shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="h-3.5 w-3.5 text-primary" />
              Audit Trail ({activeDoc.auditHistory.length})
            </button>
          </div>

          {/* TAB 1: HEADER FIELDS & SUPPLIER MATCHING */}
          {workbenchTab === "fields" && (
            <div className="space-y-4">
              {/* Supplier Matching Card */}
              <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Master Supplier Matching
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    {activeDoc.supplierMatch.confidence}% Match
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Extracted Vendor Name</label>
                    <div className="p-2 rounded-lg bg-muted/20 border border-border font-medium text-foreground">
                      {activeDoc.supplierMatch.extractedName}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Matched ERP Master Vendor</label>
                    <select
                      value={activeDoc.supplierMatch.vendorId}
                      onChange={(e) => handleSwitchSupplier(e.target.value)}
                      className="w-full p-2 rounded-lg bg-card border border-border text-foreground text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-primary"
                    >
                      {MASTER_VENDORS.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name} ({vendor.taxId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" /> Extracted Document Header Fields
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Invoice Number */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-muted-foreground">Invoice Number</label>
                      {getConfidenceBadge(activeDoc.fields.invoiceNumber.confidence)}
                    </div>
                    <input
                      type="text"
                      value={activeDoc.fields.invoiceNumber.value}
                      onChange={(e) => handleUpdateField("invoiceNumber", e.target.value)}
                      onFocus={() => setActiveHighlightField("invoice_number")}
                      className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Issue Date */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-muted-foreground">Issue Date</label>
                      {getConfidenceBadge(activeDoc.fields.invoiceDate.confidence)}
                    </div>
                    <input
                      type="date"
                      value={activeDoc.fields.invoiceDate.value}
                      onChange={(e) => handleUpdateField("invoiceDate", e.target.value)}
                      onFocus={() => setActiveHighlightField("invoice_number")}
                      className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-muted-foreground">Due Date</label>
                      {getConfidenceBadge(activeDoc.fields.dueDate.confidence)}
                    </div>
                    <input
                      type="date"
                      value={activeDoc.fields.dueDate.value}
                      onChange={(e) => handleUpdateField("dueDate", e.target.value)}
                      className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-muted-foreground">Currency</label>
                      {getConfidenceBadge(activeDoc.fields.currency.confidence)}
                    </div>
                    <select
                      value={activeDoc.fields.currency.value}
                      onChange={(e) => handleUpdateField("currency", e.target.value)}
                      className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-primary"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>

                  {/* PO Number */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-muted-foreground">Purchase Order (PO #)</label>
                      {getConfidenceBadge(activeDoc.fields.poNumber.confidence)}
                    </div>
                    <input
                      type="text"
                      value={activeDoc.fields.poNumber.value}
                      onChange={(e) => handleUpdateField("poNumber", e.target.value)}
                      className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Supplier Tax ID */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-muted-foreground">Supplier Tax ID / GSTIN</label>
                      {getConfidenceBadge(activeDoc.fields.supplierTaxId.confidence)}
                    </div>
                    <input
                      type="text"
                      value={activeDoc.fields.supplierTaxId.value}
                      onChange={(e) => handleUpdateField("supplierTaxId", e.target.value)}
                      className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDITABLE LINE ITEMS TABLE */}
          {workbenchTab === "items" && (
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Tabular Line Items Editor
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Edit quantities, descriptions, and unit prices directly. Changes auto-update invoice totals.
                  </p>
                </div>
                <button
                  onClick={handleAddLineItem}
                  className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Item
                </button>
              </div>

              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                    <tr>
                      <th className="py-2 px-2.5">#</th>
                      <th className="py-2 px-2.5 min-w-[200px]">Description</th>
                      <th className="py-2 px-2.5 w-20">HSN/SAC</th>
                      <th className="py-2 px-2.5 w-16 text-right">Qty</th>
                      <th className="py-2 px-2.5 w-24 text-right">Unit Price</th>
                      <th className="py-2 px-2.5 w-24 text-right">Amount</th>
                      <th className="py-2 px-2.5 w-16 text-right">Tax %</th>
                      <th className="py-2 px-2.5 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeDoc.lineItems.map((item) => {
                      const expectedAmount = Math.round(item.quantity * item.unitPrice * 100) / 100;
                      const hasDiscrepancy = Math.abs(expectedAmount - item.amount) >= 0.05;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-muted/20 ${hasDiscrepancy ? "bg-rose-500/5" : ""}`}
                          onMouseEnter={() => setActiveHighlightField(`item_${item.id}`)}
                        >
                          <td className="py-2 px-2.5 font-mono text-muted-foreground">{item.itemIndex}</td>
                          <td className="py-2 px-2.5">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                              className="w-full p-1 rounded bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-card text-foreground font-medium text-xs focus:outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-2.5">
                            <input
                              type="text"
                              value={item.hsnSacCode || ""}
                              onChange={(e) => handleUpdateLineItem(item.id, "hsnSacCode", e.target.value)}
                              className="w-full p-1 rounded bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-card text-foreground font-mono text-xs focus:outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateLineItem(item.id, "quantity", Number(e.target.value))}
                              className="w-full p-1 rounded bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-card text-foreground font-mono text-right text-xs focus:outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", Number(e.target.value))}
                              className="w-full p-1 rounded bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-card text-foreground font-mono text-right text-xs focus:outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-semibold">
                            {hasDiscrepancy ? (
                              <button
                                onClick={() => handleFixLineItemMath(item.id)}
                                title={`Fix Discrepancy: Qty (${item.quantity}) * Unit Price ($${item.unitPrice}) = $${expectedAmount}`}
                                className="text-rose-600 hover:underline flex items-center gap-1 justify-end font-bold"
                              >
                                <span>${item.amount.toFixed(2)}</span>
                                <AlertTriangle className="h-3 w-3" />
                              </button>
                            ) : (
                              <span>${item.amount.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            <input
                              type="number"
                              value={item.taxRate}
                              onChange={(e) => handleUpdateLineItem(item.id, "taxRate", Number(e.target.value))}
                              className="w-full p-1 rounded bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-card text-foreground font-mono text-right text-xs focus:outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <button
                              onClick={() => handleDeleteLineItem(item.id)}
                              className="p-1 rounded text-muted-foreground hover:text-rose-600 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TOTALS & MATHEMATICAL INVARIANTS */}
          {workbenchTab === "totals" && (
            <div className="space-y-4">
              {/* Invariant Verification Card */}
              <div
                className={`p-4 rounded-xl border shadow-sm transition-all ${
                  mathCalculations.isBalanced
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-rose-500/5 border-rose-500/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {mathCalculations.isBalanced ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4
                        className={`text-xs font-bold uppercase tracking-wider ${
                          mathCalculations.isBalanced
                            ? "text-emerald-900 dark:text-emerald-200"
                            : "text-rose-900 dark:text-rose-200"
                        }`}
                      >
                        {mathCalculations.isBalanced
                          ? "Mathematical Invariant Validation: PASSED (100% Invariant Match)"
                          : "Mathematical Invariant Validation: FAILED (Arithmetic Discrepancy)"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        In accordance with ERP accounting rules, line item extensions must equal line amounts, and subtotal + tax - discounts must equal grand total.
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                      mathCalculations.isBalanced
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                    }`}
                  >
                    {mathCalculations.isBalanced ? "BALANCED" : "OUT OF BALANCE"}
                  </span>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-primary" /> Financial Summary & Ledger Posting
                </h3>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-muted-foreground">Calculated Subtotal (∑ Line Amounts):</span>
                    <span className="font-bold text-foreground">${mathCalculations.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-muted-foreground">Total Taxes:</span>
                    <span className="font-bold text-foreground">${mathCalculations.taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-muted-foreground">Discount / Credits:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-mono">-$</span>
                      <input
                        type="number"
                        value={activeDoc.discountAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDocuments((prev) =>
                            prev.map((doc) => (doc.id === activeDoc.id ? { ...doc, discountAmount: val } : doc))
                          );
                        }}
                        className="w-20 p-1 rounded bg-card border border-border text-foreground font-mono text-right text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm font-bold">
                    <span className="text-foreground">Grand Total (Accounts Payable):</span>
                    <span className="text-primary">${mathCalculations.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT HISTORY */}
          {workbenchTab === "audit" && (
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-primary" /> Tamper-Evident Review Audit Ledger
              </h3>
              <p className="text-[11px] text-muted-foreground">
                All modifications, vendor matches, and approval decisions are cryptographically tracked for SOC2 and financial compliance.
              </p>

              <div className="space-y-2 pt-2">
                {activeDoc.auditHistory.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-muted/20 border border-border/70 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono bg-primary/10 text-primary border border-primary/20">
                          {item.eventType.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold text-foreground">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{item.occurredAt}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    <div className="text-[10px] text-muted-foreground font-mono pt-1">
                      Actor: <strong className="text-foreground">{item.actorName}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REJECTION MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20">
                <XSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Reject OCR Extraction</h3>
                <p className="text-[11px] text-muted-foreground">
                  Record official rejection reason. This document will not be posted to ERP.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Rejection Reason</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 rounded-lg bg-card border border-border text-foreground font-medium text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="unreadable_scan">Unreadable / Low Quality Scan</option>
                  <option value="duplicate_detected">Duplicate Invoice Claim</option>
                  <option value="invalid_vendor">Unapproved / Invalid Vendor</option>
                  <option value="fraud_suspicion">Potential Fraud / Tampered Document</option>
                  <option value="missing_po">Missing Mandatory Purchase Order</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Reviewer Notes</label>
                <textarea
                  rows={3}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Detail why this extraction was rejected..."
                  className="w-full p-2 rounded-lg bg-card border border-border text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
