"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shell";
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, useToast } from "@/components/ui";
import { FileCheck, Plus, Download, Package, Boxes, ExternalLink, CheckCircle2 } from "lucide-react";

interface QuoteItem {
  id: string;
  quoteNumber: string;
  customerName: string;
  sku: string;
  skuName: string;
  quantityRequested: number;
  warehouseCode: string;
  stockAvailable: number;
  totalAmount: number;
  status: "accepted_invoiced" | "pending_signature" | "draft";
  stockReserved: boolean;
  expiryDate: string;
}

const INITIAL_QUOTES: QuoteItem[] = [
  {
    id: "qt-104",
    quoteNumber: "QT-2026-104",
    customerName: "Acme Global Solutions",
    sku: "NX-SVR-EDGE",
    skuName: "Nexus Edge Telephony Appliance v4",
    quantityRequested: 10,
    warehouseCode: "WH-SG-01",
    stockAvailable: 24,
    totalAmount: 16500.0,
    status: "accepted_invoiced",
    stockReserved: true,
    expiryDate: "2026-11-01",
  },
  {
    id: "qt-105",
    quoteNumber: "QT-2026-105",
    customerName: "SingaTel Enterprises Pte Ltd",
    sku: "NX-SIP-GW16",
    skuName: "16-Port High-Density SIP Gateway",
    quantityRequested: 8,
    warehouseCode: "WH-SG-01",
    stockAvailable: 6,
    totalAmount: 7120.0,
    status: "pending_signature",
    stockReserved: false,
    expiryDate: "2026-10-15",
  },
  {
    id: "qt-106",
    quoteNumber: "QT-2026-106",
    customerName: "Petronas Digital Malaysia",
    sku: "NX-HEADSET-PRO",
    skuName: "OmniVoice ANC Headset",
    quantityRequested: 25,
    warehouseCode: "WH-MY-01",
    stockAvailable: 27,
    totalAmount: 3725.0,
    status: "pending_signature",
    stockReserved: true,
    expiryDate: "2026-10-20",
  },
];

export default function QuotesPage() {
  const { showToast } = useToast();
  const [quotes, setQuotes] = useState<QuoteItem[]>(INITIAL_QUOTES);

  const handleReserveStock = (id: string, sku: string, qty: number, wh: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, stockReserved: true } : q))
    );
    showToast(`Reserved ${qty} units of ${sku} in ${wh} for quote`, "success");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Price Quotes & CRM Proposals"
        description="Formal pricing quotes linked to CRM deals, live ERP warehouse inventory checks, and auto-conversion into invoices."
        icon={<FileCheck className="h-5 w-5 text-indigo-400" />}
        breadcrumbs={[{ label: "Quotes" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/inventory">
              <Button variant="outline" size="sm" leftIcon={<Boxes className="h-4 w-4" />}>
                View Warehouse Inventory
              </Button>
            </Link>
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Generate Quote
            </Button>
          </div>
        }
      />

      <Card className="p-0 overflow-hidden border border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Quoted SKU & Item</TableHead>
              <TableHead>ERP Stock Check</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-mono font-bold text-white">#{q.quoteNumber}</TableCell>
                <TableCell className="text-slate-300 font-medium">{q.customerName}</TableCell>
                <TableCell>
                  <div className="font-mono text-xs text-sky-400 font-semibold">{q.sku}</div>
                  <div className="text-xs text-slate-400">{q.skuName} (Qty: {q.quantityRequested})</div>
                </TableCell>
                <TableCell>
                  {q.stockAvailable >= q.quantityRequested ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> In Stock ({q.stockAvailable} avail)
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{q.warehouseCode}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                        Shortage ({q.stockAvailable} avail / {q.quantityRequested} req)
                      </span>
                      <Link href="/inventory" className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5">
                        Trigger Reorder PO <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-emerald-400 font-bold">
                  ${q.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  {q.status === "accepted_invoiced" ? (
                    <Badge variant="success" size="sm">Accepted & Invoiced</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Pending Signature</Badge>
                  )}
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-xs">{q.expiryDate}</TableCell>
                <TableCell className="text-right">
                  {!q.stockReserved && q.status !== "accepted_invoiced" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReserveStock(q.id, q.sku, q.quantityRequested, q.warehouseCode)}
                    >
                      Reserve Stock
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" rightIcon={<Download className="h-3 w-3" />}>
                      PDF
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
