# Platform API Dependency & Connection Architecture Map

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Audit Scope:** Multi-API Dependencies, Orchestration Chains & System Topology  
**Date:** 2026-09-24  

---

## 1. Visual Platform Integration Topology

```text
                                     ┌─── Stripe (Global Cards & Subscriptions)
                                     ├─── Razorpay (India UPI & Payment Links)
                       ┌─ Payments ──┼─── HitPay / PayNow SGQR (Singapore)
                       │             ├─── Curlec / DuitNow (Malaysia)
                       │             └─── Omise / PromptPay (Thailand)
                       │
                       │             ┌─── Meta WhatsApp Business Cloud API
                       ├─ Comms ─────┼─── Twilio (Voice Telephony & PSTN)
                       │             └─── LINE Official Account (Thailand)
                       │
                       │             ┌─── Google Gemini 1.5 Pro (Primary LLM)
Customer 360 Core ─────┼─ AI Engine ─┼─── OpenAI GPT-4o (Fallback Reasoning)
                       │             ├─── Deepgram Nova-2 (Streaming STT)
                       │             └─── ElevenLabs Turbo v2.5 (Neural TTS)
                       │
                       │             ┌─── Mathpix (Table & Invoice OCR)
                       ├─ Vision ────┼─── Google Cloud Vision (Document AI)
                       │             └─── Google Cloud Storage (CMEK Encrypted Vault)
                       │
                       │             ┌─── Xero Cloud Accounting (OAuth 2.0 PKCE)
                       ├─ Financials ┼─── QuickBooks Online (Intuit OAuth 2.0)
                       │             ├─── Zoho Books (Zoho Accounts OAuth)
                       │             └─── Malaysia LHDN MyInvois / Thai RD e-Tax
                       │
                       └─ Backbone ──┼─── Google Cloud Pub/Sub (Transactional Outbox)
                                     ├─── Google Cloud Tasks (Async Job Queue & DLQ)
                                     ├─── Google Secret Manager (Runtime Secret Vault)
                                     └─── Sentry & OpenTelemetry (Observability)
```

---

## 2. Multi-API Dependency Chains

### Chain 1: The Autonomous AI Voice Agent ("The Quad-Gate")

The Voice Agent is an integrated real-time pipeline requiring four external services operating concurrently:

```text
               Caller Speaks into Telephone
                           │
                           ▼
                  ┌──────────────────┐
                  │      Twilio      │  (Gate 1: Telephony Carrier)
                  │  PSTN / WebRTC   │  • Connects phone call
                  └────────┬─────────┘  • Streams raw audio chunks over WebSocket
                           │
                           ▼
                  ┌──────────────────┐
                  │  Deepgram Nova-2 │  (Gate 2: Speech-to-Text)
                  │ WebSocket Stream │  • Transcribes caller audio in <150ms
                  └────────┬─────────┘  • Emits final sentence transcripts
                           │
                           ▼
                  ┌──────────────────┐
                  │ Gemini 1.5 / 4o  │  (Gate 3: AI Reasoning & Tool Gateway)
                  │ Function Calling │  • Analyzes caller intent
                  └────────┬─────────┘  • Queries CRM / triggers business actions
                           │
                           ▼
                  ┌──────────────────┐
                  │ ElevenLabs Turbo │  (Gate 4: Voice Synthesis)
                  │  v2.5 Streaming  │  • Generates ultra-realistic human speech
                  └────────┬─────────┘  • Returns audio chunks in ~110ms
                           │
                           ▼
                  Caller Hears Audio in Ear
```

#### Dependency Matrix for Voice:
* If **Twilio** is missing: No call can be placed or received.
* If **Deepgram** is missing: Twilio connects, but the AI cannot hear or transcribe the caller.
* If **Gemini/OpenAI** is missing: The audio transcribes, but the AI cannot formulate a reply.
* If **ElevenLabs** is missing: The AI formulates a text answer, but cannot speak it back to the caller.

---

### Chain 2: WhatsApp Automated Collections & Dunning

Combines AI intent reasoning, payment gateway link generation, and omnichannel messaging:

```text
 1. Invoice Becomes Overdue
             │
             ▼
 ┌──────────────────────┐
 │  Collections Engine  │ ──> Evaluates customer risk score & past payment timeline
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────┐
 │  Razorpay / Stripe   │ ──> Generates dynamic payment link with unique receipt ID
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────┐
 │ Meta WhatsApp Cloud  │ ──> Dispatches pre-approved HSM template with payment link
 └──────────┬───────────┘
            │
            ▼
 Customer Clicks & Pays on Mobile
            │
            ▼
 ┌──────────────────────┐
 │ Stripe/Razorpay Hook │ ──> Verified HMAC webhook arrives at /api/v1/webhooks/...
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────┐
 │   Circuit Breaker    │ ──> Immediately cancels subsequent reminder calls/messages
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────┐
 │ Accounting Sync Gate │ ──> Journal entry synced to Xero / QuickBooks General Ledger
 └──────────────────────┘
```

---

### Chain 3: Accounts Payable Document Ingestion & Verification

Combines Cloud Storage, Mathpix OCR, mathematical validation, and accounting export:

```text
 Vendor Sends PDF Invoice / Receipt
                 │
                 ▼
     ┌───────────────────────┐
     │  Google Cloud Storage │  • Saves document to CMEK encrypted bucket
     │       (GCS)           │  • Generates secure temporary read URL
     └───────────┬───────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │   Mathpix OCR Engine  │  • Extracts text, key-value pairs, and line-item tables
     └───────────┬───────────┘  • Returns confidence scores per field
                 │
                 ▼
     ┌───────────────────────┐
     │  OcrVerificationEngine│  • Line item check: Sum(qty × price) == subtotal
     │  (Domain Validation)  │  • Tax check: subtotal + tax - discount == grand total
     └───────────┬───────────┘
                 │
         ┌───────┴───────┐
         ▼               ▼
   [Score ≥ 0.90   [Score < 0.90
   & Math Valid]   or Math Anomaly]
         │               │
         │               ▼
         │       ┌───────────────────────┐
         │       │ Human Review Gate     │  • Flags anomaly in Review Console
         │       │ (/documents/ocr-review│  • Human accountant reviews and approves
         │       └───────┬───────────────┘
         │               │
         └───────┬───────┘
                 ▼
     ┌───────────────────────┐
     │ Invoices (AP Bill)    │  • Creates approved vendor bill in platform_db
     └───────────┬───────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Xero / QuickBooks Sync│  • Pushes bill to external Accounting General Ledger
     └───────────────────────┘
```

---

### Chain 4: Asynchronous Transactional Outbox & Background Workers

Ensures zero data loss and guaranteed message delivery between Postgres and Google Cloud:

```text
   PostgreSQL ACID Transaction
┌─────────────────────────────────┐
│ 1. Mutate business entity       │  (e.g. UPDATE invoices SET status = 'PAID')
│ 2. Append to outbox_events table│  (event_type: "payment.received.v1")
└────────────────┬────────────────┘
                 │
                 ▼ (Worker Poller / CDC Engine)
┌─────────────────────────────────┐
│ Google Cloud Pub/Sub            │  • Standardized CloudEvent 1.0 JSON format
│ Topic: platform-events          │  • Multi-tenant routing attributes
└────────────────┬────────────────┘
                 │
                 ▼ (Cloud Pub/Sub Push Subscription)
┌─────────────────────────────────┐
│ Google Cloud Tasks              │  • Priority Queue (immediate notifications)
│ Rate-limited & Retried          │  • Default Queue (batch tasks)
└────────────────┬────────────────┘  • Dead-Letter Queue (DLQ after max attempts)
                 │
                 ▼
┌─────────────────────────────────┐
│ platform_worker Handlers        │  • Dispatches WhatsApp notification
│ Idempotent Execution            │  • Updates Customer 360 timeline
└─────────────────────────────────┘  • Pushes to external accounting webhook
```

---

## 3. Reverse Dependency View: What Depends on Each API?

| External Service | Direct Code Dependents | Business Features Blocked If Service Is Down |
|---|---|---|
| **Google Cloud IAM (ADC)** | GCS, Pub/Sub, Cloud Tasks, Secret Manager, Cloud KMS | **Entire Platform Infrastructure** (storage, events, workers, secrets) |
| **Twilio** | `VoiceTelephonyEngine`, `CallingWindowValidator` | Autonomous Voice Agent, Call Center Dialpad, SMS dispatch |
| **Deepgram** | `VoiceAgentCoordinator` | Live call transcription, speech understanding |
| **ElevenLabs** | `VoiceAgentCoordinator` | Live conversational speech generation |
| **Gemini / OpenAI** | `AiSalesAgent`, `AiWhatsAppAgent`, `AiToolGateway` | Autonomous sales qualification, WhatsApp bot, deal copilot |
| **Stripe** | `SalesFlowEngine`, `PaymentRouter` | International credit card checkout, hosted payment links |
| **Razorpay** | `AutonomousCollectionsEngine`, `RazorpayAdapter` | Indian UPI dynamic QR, netbanking, collections payment links |
| **Meta WhatsApp** | `OmnichannelRouter`, `WhatsAppAdapter` | 2-way live chat, billing alerts, template dispatches |
| **Mathpix** | `OcrVerificationEngine`, `MathpixClient` | Automated Accounts Payable invoice parsing |
| **Xero / QuickBooks** | `AccountingOrchestrator`, `GeneralLedgerEngine` | Automatic general ledger synchronization |
