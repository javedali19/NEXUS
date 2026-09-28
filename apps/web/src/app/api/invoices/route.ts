import { NextResponse } from "next/server";
import { INITIAL_INVOICES, Invoice, InvoiceItem, calculateInvoiceTotals } from "@/lib/invoice-data";

// In-memory persistent invoice store for dev runtime
let INVOICES_STORE: Invoice[] = [...INITIAL_INVOICES];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkDuplicate = searchParams.get("checkDuplicate");
  const vendorId = searchParams.get("vendorId");

  if (checkDuplicate) {
    const existing = INVOICES_STORE.find(
      (inv) => inv.invoiceNumber.toLowerCase() === checkDuplicate.toLowerCase()
    );

    return NextResponse.json({
      isDuplicate: !!existing,
      existingInvoice: existing || null,
    });
  }

  return NextResponse.json({
    count: INVOICES_STORE.length,
    invoices: INVOICES_STORE,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      invoiceNumber,
      customerId,
      customerName,
      customerEmail,
      companyName,
      currency = "USD",
      issueDate = new Date().toISOString().split("T")[0],
      dueDate,
      items = [],
      taxRate = 0.18,
      discountType = "fixed",
      discountValue = 0,
      paymentTerms = "Net 30",
      notes,
      sourceExtractionId,
      allowUpdate = false,
    } = body;

    if (!invoiceNumber || !customerName) {
      return NextResponse.json(
        { error: "Missing required fields: invoiceNumber and customerName are mandatory." },
        { status: 400 }
      );
    }

    // Check duplicate
    const existingIndex = INVOICES_STORE.findIndex(
      (inv) => inv.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase()
    );

    if (existingIndex >= 0 && !allowUpdate) {
      return NextResponse.json(
        {
          error: "Duplicate invoice detected",
          isDuplicate: true,
          existingInvoiceId: INVOICES_STORE[existingIndex].id,
          message: `Invoice ${invoiceNumber} already exists in the ERP accounts payable ledger.`,
        },
        { status: 409 }
      );
    }

    // Format invoice items
    const formattedItems: InvoiceItem[] = items.map((item: any, idx: number) => {
      const quantity = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice) || 0;
      const discountPercent = Number(item.discountPercent) || 0;
      const lineTaxRate = Number(item.taxRate) ? Number(item.taxRate) / 100 : taxRate;
      const base = quantity * unitPrice;
      const discounted = base * (1 - discountPercent / 100);
      const lineTotal = Math.round(discounted * (1 + lineTaxRate) * 100) / 100;

      return {
        id: item.id || `item-ocr-${idx + 1}-${Date.now().toString().slice(-4)}`,
        itemCode: item.hsnSacCode || item.itemCode || `HSN-${idx + 1}`,
        description: item.description || `Line Item #${idx + 1}`,
        quantity,
        unitPrice,
        discountPercent,
        taxRate: lineTaxRate,
        lineTotal,
      };
    });

    const totals = calculateInvoiceTotals(formattedItems, taxRate, discountType, discountValue);

    let savedInvoice: Invoice;

    if (existingIndex >= 0 && allowUpdate) {
      // Update existing invoice
      const existing = INVOICES_STORE[existingIndex];
      savedInvoice = {
        ...existing,
        customerName,
        companyName: companyName || existing.companyName,
        currency,
        issueDate,
        dueDate: dueDate || existing.dueDate,
        items: formattedItems,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        balanceDue: totals.totalAmount - existing.amountPaid,
        notes: notes || existing.notes,
        timeline: [
          {
            id: `evt-${Date.now()}`,
            eventType: "edited",
            title: "Invoice Updated via OCR Review Console",
            description: `Updated invoice line items and totals through Mathpix OCR verified extraction (ID: ${sourceExtractionId || "manual"}).`,
            actorName: "Sarah Reviewer (Financial Auditor)",
            occurredAt: new Date().toISOString(),
          },
          ...existing.timeline,
        ],
      };
      INVOICES_STORE[existingIndex] = savedInvoice;
    } else {
      // Create new invoice
      const newInvoiceId = `inv-ocr-${Date.now().toString().slice(-4)}`;
      savedInvoice = {
        id: newInvoiceId,
        invoiceNumber,
        customerId: customerId || "cust-001",
        customerName,
        customerEmail: customerEmail || "billing@enterprise-vendor.com",
        companyName: companyName || customerName,
        status: "issued",
        currency,
        issueDate,
        dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        subtotal: totals.subtotal,
        taxRate,
        taxAmount: totals.taxAmount,
        discountType,
        discountValue,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        amountPaid: 0,
        balanceDue: totals.totalAmount,
        paymentTerms,
        notes: notes || "Created automatically from verified Mathpix OCR extraction.",
        termsConditions: "Standard Master Services Agreement applies. Net 30 days.",
        billingAddress: {
          street: "88 Tower One, Tech Boulevard",
          city: "Austin",
          state: "TX",
          postalCode: "78701",
          country: "USA",
        },
        items: formattedItems,
        payments: [],
        timeline: [
          {
            id: `evt-${Date.now()}`,
            eventType: "created",
            title: "ERP Invoice Created from Approved OCR Extraction",
            description: `Extracted via Mathpix, reviewed with 100% mathematical integrity check, and approved into ERP Ledger (Extraction Ref: ${sourceExtractionId || "N/A"}).`,
            actorName: "Sarah Reviewer (Financial Auditor)",
            occurredAt: new Date().toISOString(),
          },
        ],
        customer360Id: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
        outboxEventsEmitted: 1,
      };
      INVOICES_STORE = [savedInvoice, ...INVOICES_STORE];
    }

    return NextResponse.json(
      {
        success: true,
        message: existingIndex >= 0 ? "Invoice updated successfully" : "Invoice created successfully",
        invoice: savedInvoice,
      },
      { status: existingIndex >= 0 ? 200 : 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process invoice request", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
