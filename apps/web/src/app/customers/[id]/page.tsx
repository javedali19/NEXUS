"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Tabs,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DonutProgress,
  SentimentGauge,
  useToast,
} from "@/components/ui";
import { SAMPLE_CUSTOMER_360 } from "@/lib/customer-360-data";

import {
  Users,
  Building2,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  FileText,
  CreditCard,
  MessageCircle,
  MessagesSquare,
  PhoneCall,
  LifeBuoy,
  FolderGit2,
  ShieldCheck,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Play,
  Download,
  AlertTriangle,
  ExternalLink,
  Bot,
  Zap,
} from "lucide-react";

export default function Customer360DetailPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [customer, setCustomer] = useState(SAMPLE_CUSTOMER_360);

  const tabsList = [
    { id: "overview", label: "Overview", icon: <Users className="h-3.5 w-3.5" /> },
    { id: "timeline", label: "Universal Timeline", icon: <Clock className="h-3.5 w-3.5" />, count: customer.timeline.length },
    { id: "sales", label: "Sales & Quotes", icon: <TrendingUp className="h-3.5 w-3.5" />, count: customer.sales.deals.length },
    { id: "financials", label: "Invoices & Payments", icon: <DollarSign className="h-3.5 w-3.5" />, count: customer.financials.invoices.length },
    { id: "conversations", label: "Conversations", icon: <MessagesSquare className="h-3.5 w-3.5" />, count: customer.conversations.length },
    { id: "calls", label: "Voice Calls", icon: <PhoneCall className="h-3.5 w-3.5" />, count: customer.calls.length },
    { id: "support", label: "Support", icon: <LifeBuoy className="h-3.5 w-3.5" />, count: customer.support.length },
    { id: "documents", label: "Documents", icon: <FolderGit2 className="h-3.5 w-3.5" />, count: customer.documents.length },
    { id: "consents", label: "Consents", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { id: "ai_insights", label: "AI Insights", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "audit", label: "Audit History", icon: <ShieldAlert className="h-3.5 w-3.5" />, count: customer.auditHistory.length },
  ];

  const handleTriggerAction = (actionName: string) => {
    showToast({
      title: "Action Initiated",
      message: `${actionName} dispatched for ${customer.fullName}. Event logged to outbox.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation & Breadcrumb Header */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link
          href="/customers"
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          <span>Back to Directory</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">{customer.fullName} (Customer 360)</span>
      </div>

      {/* Customer 360 Header Profile Card */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-xs">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{customer.fullName}</h1>
                <Badge variant="success" size="sm" dot>Active Customer</Badge>
                <Badge variant="rls" size="sm">RLS Isolated</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {customer.title} at{" "}
                <strong className="text-slate-800 font-semibold">{customer.company.name}</strong>{" "}
                ({customer.company.industry})
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {customer.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {customer.phone}</span>
                <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" /> {customer.company.domain}</span>
              </div>
            </div>
          </div>

          {/* Key Executive Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-200">
            <div className="text-right px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Lifetime Value</span>
              <span className="text-base font-bold text-emerald-600 font-mono">
                ${customer.totalLtv.toLocaleString()}
              </span>
            </div>

            <div className="text-right px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">AI Health Score</span>
              <span className="text-base font-bold text-blue-600 font-mono">
                {customer.aiInsights.healthScore}/100
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                onClick={() => handleTriggerAction("AI Telephony Call")}
              >
                Trigger AI Call
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<DollarSign className="h-3.5 w-3.5" />}
                onClick={() => handleTriggerAction("Issue Invoice")}
              >
                Issue Invoice
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs Bar */}
      <div className="overflow-x-auto pb-1">
        <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-500">Total ERP Billed</span>
              <p className="text-2xl font-bold text-slate-900 font-mono">$145,000.00</p>
              <span className="text-[10px] text-emerald-600 font-mono">100% Settled (0 Outstanding)</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-500">Active CRM Pipeline</span>
              <p className="text-2xl font-bold text-slate-900 font-mono">$45,000.00</p>
              <span className="text-[10px] text-slate-500 font-mono">1 Proposal in Flight</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-500">AI Sentiment</span>
              <p className="text-2xl font-bold text-emerald-600 font-mono">+0.88 / 1.0</p>
              <span className="text-[10px] text-emerald-600 font-mono">Highly Satisfied</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-500">Open Support Cases</span>
              <p className="text-2xl font-bold text-slate-900 font-mono">0 Active</p>
              <span className="text-[10px] text-slate-500 font-mono">1 Resolved this month</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick AI Summary */}
            <Card className="lg:col-span-2 space-y-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  AI Executive Relationship Summary
                </CardTitle>
                <CardDescription>Synthesized from telephony, ERP transactions, and support touchpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800 p-4 rounded-md border border-slate-700">
                  {customer.aiInsights.summary}
                </p>
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-white block">Next Best Actions:</span>
                  {customer.aiInsights.nextBestActions.map((action, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-200">
                      <span>• {action}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleTriggerAction(action)}>
                        Execute
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment & Health */}
            <Card className="space-y-4">
              <CardHeader>
                <CardTitle>Relationship Health</CardTitle>
                <CardDescription>Predictive retention index</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <DonutProgress percentage={customer.aiInsights.healthScore} color="#2563eb" label="Health Score" />
                <SentimentGauge score={customer.sentimentScore} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. UNIVERSAL TIMELINE TAB */}
      {activeTab === "timeline" && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Centralized Universal Timeline</CardTitle>
            <CardDescription>Real-time cross-module event stream spanning CRM, ERP, Telephony, Support, and Audit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.timeline.map((item) => (
              <div key={item.id} className="p-4 rounded-xl glass-card border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{item.title}</span>
                    <Badge variant="primary" size="sm">{item.sourceModule.toUpperCase()}</Badge>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                <span className="text-[10px] text-slate-500 font-mono block">Actor: {item.actor}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3. SALES & QUOTES TAB */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-white font-mono">Linked CRM Deals ({customer.sales.deals.length})</h3>
              <Button variant="primary" size="sm">+ Create Deal</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Title</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Close Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.sales.deals.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-semibold text-white">{d.title}</TableCell>
                    <TableCell><Badge variant={d.stage === "Closed-Won" ? "success" : "primary"} size="sm">{d.stage}</Badge></TableCell>
                    <TableCell className="font-mono font-bold text-emerald-400">${d.value.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-slate-400">{d.probability}%</TableCell>
                    <TableCell className="font-mono text-slate-400">{d.closeDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-white font-mono">Price Quotes ({customer.sales.quotes.length})</h3>
              <Button variant="outline" size="sm">+ Generate Quote</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.sales.quotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono font-semibold text-white">{q.quoteNumber}</TableCell>
                    <TableCell className="font-mono font-bold text-emerald-400">${q.totalAmount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="primary" size="sm">{q.status}</Badge></TableCell>
                    <TableCell className="font-mono text-slate-400">{q.expiryDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* 4. FINANCIALS (INVOICES & PAYMENTS) TAB */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-white font-mono">Invoices Ledger</h3>
              <Link href="/invoices">
                <Button variant="primary" size="sm">+ Manage in Invoice Hub</Button>
              </Link>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Settled Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.financials.invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-semibold text-white">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-mono font-bold text-emerald-400">${inv.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="success" size="sm" dot>{inv.status}</Badge></TableCell>
                    <TableCell className="font-mono text-slate-400">{inv.dueDate}</TableCell>
                    <TableCell className="font-mono text-emerald-400">{inv.paidDate || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Link href="/invoices" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                        View in Hub &rarr;
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* 5. CONVERSATIONS & WHATSAPP TAB */}
      {activeTab === "conversations" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-white font-mono">Omnichannel Message Threads</h3>
            <Button variant="primary" size="sm">+ Start WhatsApp / Email Thread</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Last Message</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.conversations.map((conv) => (
                <TableRow key={conv.id}>
                  <TableCell><Badge variant={conv.channel === "whatsapp" ? "success" : "info"} size="sm">{conv.channel}</Badge></TableCell>
                  <TableCell className="font-semibold text-white">{conv.subject || "Direct Message"}</TableCell>
                  <TableCell className="text-slate-300 truncate max-w-md">{conv.lastMessage}</TableCell>
                  <TableCell className="font-mono text-slate-400">{conv.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 6. CALLS & TELEPHONY TAB */}
      {activeTab === "calls" && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Voice Calls & AI Transcriptions</CardTitle>
            <CardDescription>Telephony audio transcripts and sentiment scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.calls.map((call) => (
              <div key={call.id} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary" size="sm">{call.direction.toUpperCase()}</Badge>
                    <span className="text-xs font-mono text-slate-500">Duration: {call.duration}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{call.date}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 font-mono">AI Summary:</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{call.aiSummary}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-emerald-600 font-mono font-semibold">Sentiment: +{call.sentimentScore} (Positive)</span>
                  <Button variant="outline" size="sm" leftIcon={<Play className="h-3 w-3" />}>
                    Listen to Audio
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 7. SUPPORT TICKETS TAB */}
      {activeTab === "support" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-white font-mono">Support Cases</h3>
            <Button variant="primary" size="sm">+ Create Support Ticket</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.support.map((sup) => (
                <TableRow key={sup.id}>
                  <TableCell className="font-mono font-bold text-white">{sup.ticketNumber}</TableCell>
                  <TableCell className="font-semibold text-slate-200">{sup.subject}</TableCell>
                  <TableCell><Badge variant="warning" size="sm">{sup.priority}</Badge></TableCell>
                  <TableCell><Badge variant="success" size="sm" dot>{sup.status}</Badge></TableCell>
                  <TableCell className="text-slate-400">{sup.assignedAgent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 8. DOCUMENTS & OCR TAB */}
      {activeTab === "documents" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-white font-mono">Customer Documents (Cloud Storage)</h3>
            <Button variant="primary" size="sm">+ Upload Document</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-semibold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {doc.fileName}
                  </TableCell>
                  <TableCell className="font-mono text-slate-400">{doc.fileSize}</TableCell>
                  <TableCell className="font-mono text-slate-400">{doc.storageBucket}</TableCell>
                  <TableCell className="font-mono text-slate-400">{doc.uploadedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" rightIcon={<Download className="h-3 w-3" />}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 9. CONSENTS TAB */}
      {activeTab === "consents" && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>GDPR & TCPA Consent Ledger</CardTitle>
            <CardDescription>Verified communication channel permissions and audio recording agreements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.consents.map((cns) => (
              <div key={cns.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{cns.channel}</span>
                    <Badge variant="success" size="sm" dot>Granted</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{cns.purpose}</p>
                  <span className="text-[10px] text-slate-400 font-mono">Recorded IP: {cns.ipAddress} • {cns.grantedAt}</span>
                </div>
                <Button variant="outline" size="sm">
                  Revoke Consent
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 10. AI INSIGHTS TAB */}
      {activeTab === "ai_insights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Predictive Customer Analytics</CardTitle>
              <CardDescription>Churn risk, expansion potential, and sentiment scoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Churn Probability</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">1.2% (Low Risk)</span>
                </div>
                <Badge variant="success" size="sm">High Retention</Badge>
              </div>
              <div className="p-3.5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Expansion Likelihood</span>
                  <span className="text-base font-bold text-blue-400 font-mono">88.5% (High)</span>
                </div>
                <Badge variant="primary" size="sm">Add-On Target</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>AI Next Best Actions</CardTitle>
              <CardDescription>Automated recommendations based on cross-module graph signals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {customer.aiInsights.nextBestActions.map((action, i) => (
                <div key={i} className="p-3 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-between text-xs text-slate-200">
                  <span>{action}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleTriggerAction(action)}>
                    Execute
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 11. AUDIT HISTORY TAB */}
      {activeTab === "audit" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-white font-mono">Immutable Customer Audit Trail</h3>
            <Badge variant="rls" size="sm">RLS Enforced</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.auditHistory.map((aud) => (
                <TableRow key={aud.id}>
                  <TableCell className="font-mono text-slate-400">{aud.timestamp}</TableCell>
                  <TableCell className="font-semibold text-white">{aud.actor}</TableCell>
                  <TableCell className="font-mono text-indigo-400">{aud.action}</TableCell>
                  <TableCell className="font-mono text-slate-300">{aud.resource}</TableCell>
                  <TableCell className="text-slate-300">{aud.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
