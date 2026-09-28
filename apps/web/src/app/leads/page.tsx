"use client";

import React from "react";
import { PageHeader } from "@/components/shell";
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from "@/components/ui";
import { UserPlus, Plus, Sparkles, ArrowRight } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Leads"
        description="Prospective business opportunities scored by AI models and ready for qualification."
        icon={<UserPlus className="h-5 w-5 text-sky-400" />}
        breadcrumbs={[{ label: "Leads" }]}
        badgeText="AI Scored"
        badgeVariant="ai"
        actions={
          <Button variant="ai" size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
            AI Lead Ingestion
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Estimated Value</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold text-white">David Miller</TableCell>
              <TableCell className="text-slate-300">Apex Robotics</TableCell>
              <TableCell><Badge variant="ai" size="sm" dot>Score 94</Badge></TableCell>
              <TableCell className="text-slate-400">Website AI Chatbot</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">$75,000</TableCell>
              <TableCell className="text-right">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                  Convert to Deal
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-semibold text-white">Elena Rostova</TableCell>
              <TableCell className="text-slate-300">Starlight Bio</TableCell>
              <TableCell><Badge variant="ai" size="sm" dot>Score 86</Badge></TableCell>
              <TableCell className="text-slate-400">OCR Business Card</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">$120,000</TableCell>
              <TableCell className="text-right">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                  Convert to Deal
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
