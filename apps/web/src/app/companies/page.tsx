"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shell";
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from "@/components/ui";
import { Building2, Plus, ExternalLink } from "lucide-react";

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Companies"
        description="Unified corporate accounts shared across CRM sales pipelines and ERP billing entities."
        icon={<Building2 className="h-5 w-5 text-indigo-400" />}
        breadcrumbs={[{ label: "Companies" }]}
        badgeText="PostgreSQL RLS"
        badgeVariant="rls"
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Add Company
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Annual Revenue</TableHead>
              <TableHead>Linked CRM Deals</TableHead>
              <TableHead>ERP Ledger Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold text-slate-900">Acme Global Solutions</TableCell>
              <TableCell className="text-slate-500">Enterprise SaaS / Cloud</TableCell>
              <TableCell className="font-mono text-emerald-600 font-bold">$24.5M</TableCell>
              <TableCell><Badge variant="primary" size="sm">2 Active Deals</Badge></TableCell>
              <TableCell><Badge variant="success" size="sm" dot>In Good Standing</Badge></TableCell>
              <TableCell className="text-right">
                <Link href="/customers/c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c">
                  <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="h-3 w-3" />}>
                    Customer 360
                  </Button>
                </Link>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-bold text-slate-900">Nexus Industrial Corp</TableCell>
              <TableCell className="text-slate-500">Smart Manufacturing</TableCell>
              <TableCell className="font-mono text-emerald-600 font-bold">$82.0M</TableCell>
              <TableCell><Badge variant="primary" size="sm">1 Deal ($38k)</Badge></TableCell>
              <TableCell><Badge variant="warning" size="sm" dot>Invoice Pending</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="h-3 w-3" />}>
                  View Account
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
