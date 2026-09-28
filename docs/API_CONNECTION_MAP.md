# Platform API Connection & Architecture Map

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Scope:** Architectural Data Flows, Integration Adapters, Event Streams, and End-to-End Traces  
**Date:** 2026-09-23  

---

## 1. High-Level Integration Topology

```text
                                  ┌─── Google Gemini / OpenAI (LLM Reasoning)
                                  ├─── Deepgram (Nova-2 Speech-to-Text)
                                  ├─── ElevenLabs (Turbo v2.5 Voice Synthesis)
                                  │
                                  ├─── Twilio (Voice Telephony & SIP)
                                  ├─── Meta WhatsApp Business Cloud API
                                  ├─── LINE Messaging API (Thailand)
                                  │
Customer 360 & CRM Core ──────────┼─── Stripe / Razorpay (Payments & Collections)
                                  ├─── HitPay / PayNow SGQR (Singapore)
                                  ├─── Curlec / DuitNow (Malaysia)
                                  ├─── Omise / PromptPay (Thailand)
                                  │
                                  ├─── Xero / QuickBooks / Zoho (General Ledger)
                                  ├─── LHDN MyInvois / Thai RD e-Tax (E-Invoicing)
                                  │
                                  ├─── Mathpix & Cloud Vision (Document OCR)
                                  ├─── Google Cloud Storage (CMEK Encrypted Files)
                                  │
                                  └─── Google Cloud Pub/Sub & Cloud Tasks (Async Engine)
```

---

## 2. Granular Service Connection Traces

### 2.1 Payments & Autonomous Collections (Stripe & Razorpay)

```text
External Service:
Stripe / Razorpay Payment Gateway
       ↓
Credential:
STRIPE_SECRET_KEY / RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (Resolved via GSM)
       ↓
Integration Adapter:
platform_integrations::providers::stripe::StripeConnector
platform_integrations::payments::razorpay::RazorpayAdapter
       ↓
Backend Service:
platform_domain::sales_flow::SalesFlowEngine
platform_domain::autonomous_collections::AutonomousCollectionsEngine
       ↓
ERP/CRM Module:
Invoices, Payments, Customer Timeline, Accounts Receivable
       ↓
Database / Event:
payments, invoices, outbox_events ("payment.received.v1", "sales_flow.payment_settled")
       ↓
User Feature:
One-Click Customer Checkout, Automated Dunning Resolution, Real-time Revenue Analytics
```

---

### 2.2 Omnichannel Customer Communications (Meta WhatsApp)

```text
External Service:
Meta WhatsApp Business Platform (Cloud API Graph v18.0)
       ↓
Credential:
META_WHATSAPP_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN
       ↓
Integration Adapter:
platform_integrations::communications::whatsapp::WhatsAppAdapter
       ↓
Backend Service:
platform_domain::omnichannel::OmnichannelRouter
platform_domain::ai_whatsapp_agent::AiWhatsAppAgent
       ↓
ERP/CRM Module:
Unified Inbox, Customer Support 360, Leads & Opportunity Management
       ↓
Database / Event:
conversations, messages, customer_timeline ("whatsapp.message_received.v1")
       ↓
User Feature:
Real-time Two-Way Chat, HSM Template Dispatches, Autonomous Inbound Support Bot
```

---

### 2.3 Autonomous Voice Agent (Quad-Gate Architecture)

```text
   Gate 1: Telephony               Gate 2: STT                  Gate 3: Reasoning               Gate 4: Voice
  ┌──────────────────┐         ┌─────────────────┐           ┌────────────────────┐          ┌───────────────────┐
  │  Twilio Carrier  │ ──────> │ Deepgram Nova-2 │ ────────> │ Gemini 1.5 / GPT-4o│ ───────> │ ElevenLabs Turbo  │
  │  PSTN / WebRTC   │         │ WebSocket Audio │           │ Function Calling   │          │ Neural Streaming  │
  └──────────────────┘         └─────────────────┘           └────────────────────┘          └───────────────────┘
           │                            │                              │                               │
    TWILIO_AUTH_TOKEN           DEEPGRAM_API_KEY              GEMINI_API_KEY /               ELEVENLABS_API_KEY
    TWILIO_ACCOUNT_SID                                        OPENAI_API_KEY
           │                            │                              │                               │
           └────────────────────────────┼──────────────────────────────┴───────────────────────────────┘
                                        ↓
                       VoiceAgentConfig & CallingWindowValidator
                                        ↓
                       Call Session & Real-Time Audio Engine
                                        ↓
                       calls, call_transcripts, customer_timeline
                                        ↓
                       Automated Lead Qualification, Voice Collections, Executive Briefing
```

---

### 2.4 Document Processing & Accounts Payable (Mathpix & GCS)

```text
External Service:
Google Cloud Storage (GCS) + Mathpix OCR API
       ↓
Credential:
GCP IAM Service Account (ADC) + GSM mathpix-app-id & mathpix-app-key
       ↓
Integration Adapter:
platform_integrations::storage::gcs::GcsStorageClient
platform_integrations::ocr::mathpix::MathpixClient
       ↓
Backend Service:
platform_domain::ocr::OcrVerificationEngine
platform_domain::documents::DocumentManager
       ↓
ERP/CRM Module:
Accounts Payable, Vendor Bills, OCR Review & Human-in-the-Loop Console
       ↓
Database / Event:
documents, ocr_jobs, extracted_invoices ("document.uploaded.v1", "ocr.anomaly_detected")
       ↓
User Feature:
Drag-and-Drop AP Bill Ingestion, Automated Line Item Arithmetic Verification, 3-Way Matching
```

---

### 2.5 Cloud Accounting & General Ledger (Xero, QuickBooks, Zoho)

```text
External Service:
Xero / Intuit QuickBooks / Zoho Books Cloud APIs
       ↓
Credential:
OAuth 2.0 PKCE (Client ID, Client Secret, Refresh Token, Tenant/Realm ID)
       ↓
Integration Adapter:
platform_integrations::accounting::xero::XeroAdapter
platform_integrations::accounting::quickbooks::QuickBooksAdapter
platform_integrations::accounting::zoho_books::ZohoBooksAdapter
       ↓
Backend Service:
platform_integrations::accounting::orchestrator::AccountingOrchestrator
platform_domain::accounting::GeneralLedgerEngine
       ↓
ERP/CRM Module:
General Ledger, Chart of Accounts, Bank Feeds, Tax Reconciliation
       ↓
Database / Event:
gl_accounts, journal_entries, reconciliation_records ("accounting.invoice_synced.v1")
       ↓
User Feature:
Continuous Multi-Entity Ledger Sync, Automated Bank Reconciliation, Financial Statements
```

---

### 2.6 Southeast Asia Regional Country Packs

```text
                               Country Pack Router
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ↓                            ↓                            ↓
       Singapore                     Malaysia                     Thailand
  ┌─────────────────┐          ┌──────────────────┐         ┌──────────────────┐
  │ DBS RAPID PayNow│          │ Curlec / DuitNow │         │ Omise PromptPay  │
  │ SGQR Generator  │          │ LHDN MyInvois    │         │ Thai RD e-Tax    │
  │ IMDA SMS Route  │          │ MCMC SMS Route   │         │ LINE Official OA │
  └─────────────────┘          └──────────────────┘         └──────────────────┘
           │                            │                            │
    DBS_RAPID_API_KEY            MY_CURLEC_APP_ID             TH_OMISE_SECRET_KEY
    DBS_PAYNOW_PROXY_ID          LHDN_MYINVOIS_CLIENT_ID      THAI_RD_API_KEY
                                                              LINE_CHANNEL_SECRET
```

---

### 2.7 Asynchronous Outbox, Pub/Sub & Cloud Tasks Architecture

```text
   PostgreSQL Transaction
┌──────────────────────────┐
│  Domain Entity (Write)   │
│            +             │
│  outbox_events (Append)  │
└──────────────────────────┘
             │
             ↓ (Worker Poller / CDC)
┌──────────────────────────┐
│ Google Cloud Pub/Sub     │
│ Topic: platform-events   │
└──────────────────────────┘
             │
             ↓ (CloudEvent Subscription Push)
┌──────────────────────────┐
│ Google Cloud Tasks       │
│ Priority & Default Queue │
└──────────────────────────┘
             │
             ↓ (Idempotent Worker Invocation)
┌────────────────────────────────────────────────────────┐
│ platform_worker:                                       │
│ • Vendor Webhook Dispatch                              │
│ • Autonomous Dunning Step                              │
│ • WhatsApp Message Delivery                            │
│ • Dead Letter Queue (DLQ) Logging                      │
└────────────────────────────────────────────────────────┘
```
