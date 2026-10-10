# NEXUS ERP + CRM + TELI — MASTER PLATFORM ARCHITECTURE

**Project:** NEXUS Enterprise Platform  
**Document:** `docs/ERP_CRM_TELEPHONY_ARCHITECTURE.md`  
**Status:** VALIDATED & ARCHITECTURALLY SEALED  
**Date:** 2026-10-08  
**Scope:** Architectural specification of NEXUS ERP + CRM + TELI powered by Supabase as the primary database platform.

---

## 1. High-Level Architecture Diagram

```
                       NEXUS ERP + CRM + TELI
                                  │
                                  ▼
                              SUPABASE
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
      Postgres                  Auth                    Storage
         │
         ▼
        RLS (Row Level Security: current_tenant_id())
         │
         ▼
      Realtime / Functions / pgvector
         │
         ▼
      External Enterprise Providers
      ├── Telephony (Telnyx / Provider-Neutral Multi-Carrier SIP)
      ├── WhatsApp (Meta Cloud API Business Platform)
      ├── Speech-to-Text (Deepgram Nova-2 Streaming STT)
      ├── AI (OpenAI GPT-4o / Google Gemini 1.5 / Groq LLaMA 3)
      ├── Payments (Razorpay / Stripe / DBS RAPID / HitPay)
      ├── Accounting (QuickBooks Online / Xero / LHDN MyInvois)
      └── OCR (Mathpix Invoice Parser / Google Cloud Vision)
```

---

## 2. Platform Core Pillars

### 2.1 The Supabase Foundation
- **PostgreSQL 15+ Relational Core:** 185 tables, 228 indexes, foreign key enforcement, cascading deletes where appropriate.
- **Tenant Isolation (RLS):** 154 tables enforce strict multi-tenant Row Level Security via `public.current_tenant_id()`. Cross-tenant data leakage is cryptographically and procedurally prevented at the database engine level.
- **Supabase Auth:** Decoupled identity provider supporting JWT token verification, RBAC permissions (`admin`, `billing_specialist`, `call_operator`, `sales_rep`), and multi-organization session switching.
- **Supabase Storage:** Encrypted blob buckets for high-resolution invoice PDFs, call recordings, and contract attachments, keeping PostgreSQL database payloads lean.
- **Supabase Realtime:** Change Data Capture (CDC) replication for live call events, omnichannel inbox messages, and executive dashboard alerts.
- **pgvector:** Embedded vector store for AI agent semantic memory, tool selection, and customer 360 knowledge search.

### 2.2 ERP Subsystem
- **Invoicing & Billing:** Multi-currency (`USD`, `SGD`, `MYR`, `THB`, `INR`), decimal-exact line item calculations, regional tax rules, and PDF generation.
- **Settlement & Payments:** Reconciliation with Razorpay, Stripe, DBS RAPID PayNow, and Curlec DuitNow.
- **Procurement & Inventory:** Multi-warehouse inventory tracking, supplier PO lifecycle, and automated stock reorder triggers.
- **Autonomous Collections:** AI-driven dunning workflows, promises-to-pay tracking, and automated escalation.

### 2.3 CRM & Customer 360 Subsystem
- **Customer Directory:** Accounts, contacts, leads, deals, quotes, and opportunity pipelines.
- **Omnichannel Timeline:** Unified time-series stream aggregating ERP billing, telephony call records, WhatsApp conversations, support tickets, and AI agent actions.
- **Sales Flow Engine:** Deterministic stage transitions from lead qualification to contract closing.

### 2.4 TELI (Telephony & Communications) Subsystem
- **Provider-Neutral Foundation:** Twilio and ElevenLabs are completely removed.
- **Active Providers:** Telnyx SIP trunks, WebRTC call center softphone, and Meta WhatsApp Business API.
- **Speech-to-Text (STT):** Deepgram Nova-2 ultra-low-latency real-time audio transcription.
- **Call Center Console:** Agent status tracking, call recordings, AI automated call summaries, and compliance consent recording.

### 2.5 AI Subsystem
- **Agent Control Plane:** Declarative agents with versioning, capability flags, and policy guardrails.
- **Tool Invocation Gateway:** Idempotent, audited execution of system functions (creating quotes, issuing invoices, scheduling calls) with zero raw SQL injection risk.
- **Multi-Model LLM Gateway:** OpenAI GPT-4o, Google Gemini, and Groq ultra-fast inference.

---

## 3. Strict Prohibitions & Operational Constraints

1. **Twilio:** Strictly prohibited from the codebase.
2. **ElevenLabs:** Strictly prohibited from the codebase.
3. **Database Credentials:** Strictly barred from frontend code, commit history, or public logs.
4. **Data Integrity:** Historical CRM, ERP, and communication logs are permanently preserved.
