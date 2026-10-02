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
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-center">Lifecycle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-center font-mono text-xs text-slate-400 font-medium">1</TableCell>
              <TableCell className="font-semibold text-slate-900 dark:text-white">
                <Link href="/customers/c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline">
                  Sarah Jenkins
                </Link>
              </TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300 font-medium">Acme Global Solutions</TableCell>
              <TableCell className="text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /> sarah.j@acmeglobal.com</span></TableCell>
              <TableCell className="text-slate-500 dark:text-slate-400 font-mono text-xs"><Phone className="h-3 w-3 inline mr-1 text-slate-400" /> +1 (555) 234-5678</TableCell>
              <TableCell className="text-center"><Badge variant="success" size="sm">Customer</Badge></TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="text-center font-mono text-xs text-slate-400 font-medium">2</TableCell>
              <TableCell className="font-semibold text-slate-900 dark:text-white">Michael Chen</TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300 font-medium">NexusOps</TableCell>
              <TableCell className="text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /> mchen@nexusops.io</span></TableCell>
              <TableCell className="text-slate-500 dark:text-slate-400 font-mono text-xs"><Phone className="h-3 w-3 inline mr-1 text-slate-400" /> +1 (555) 876-5432</TableCell>
              <TableCell className="text-center"><Badge variant="warning" size="sm">Prospect</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
