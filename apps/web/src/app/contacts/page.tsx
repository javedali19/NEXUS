"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shell";
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from "@/components/ui";
import { Contact, Plus, Mail, Phone } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Contacts"
        description="Individual contact points bound directly to shared Customer 360 identities."
        icon={<Contact className="h-5 w-5 text-indigo-400" />}
        breadcrumbs={[{ label: "Contacts" }]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            New Contact
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Lifecycle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold text-slate-900">
                <Link href="/customers/c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Sarah Jenkins
                </Link>
              </TableCell>
              <TableCell className="text-slate-700 font-medium">Acme Global Solutions</TableCell>
              <TableCell className="text-slate-500 flex items-center gap-1.5"><Mail className="h-3 w-3" /> sarah.j@acmeglobal.com</TableCell>
              <TableCell className="text-slate-500 font-mono"><Phone className="h-3 w-3 inline mr-1" /> +1 (555) 234-5678</TableCell>
              <TableCell><Badge variant="success" size="sm">Customer</Badge></TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-semibold text-slate-900">Michael Chen</TableCell>
              <TableCell className="text-slate-700 font-medium">NexusOps</TableCell>
              <TableCell className="text-slate-500 flex items-center gap-1.5"><Mail className="h-3 w-3" /> mchen@nexusops.io</TableCell>
              <TableCell className="text-slate-500 font-mono"><Phone className="h-3 w-3 inline mr-1" /> +1 (555) 876-5432</TableCell>
              <TableCell><Badge variant="warning" size="sm">Prospect</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
