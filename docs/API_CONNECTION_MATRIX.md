# API Connection Matrix, Feature Mapping & Final Readiness

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Audit Scope:** Final Master Table, Feature-to-API Mapping & API-to-Feature Mapping  
**Date:** 2026-09-24  

---

## 1. Final Master Verification Table (Prompt Section 21)

This table gives the complete, definitive picture of every external service and credential in the project:

| # | API | Credential | Present? | Required? | Connected? | Used By | What It Enables | What Happens When Used | What Breaks If Missing | Status |
|---|-----|------------|:--------:|:---------:|:----------:|---------|-----------------|------------------------|------------------------|--------|
| 1 | **Stripe** | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | NO (Mock in test) | YES | NO | `providers::stripe`, `domain::sales_flow` | Customer card checkout, invoice payment links, recurring billing | Creates PaymentIntent, charges card, verifies webhook, marks invoice PAID | Online card payments cannot be charged; invoice checkout links fail | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 2 | **Razorpay** | `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` + `RAZORPAY_WEBHOOK_SECRET` | NO (Mock in test) | YES | NO | `payments::razorpay`, `domain::autonomous_collections` | India UPI dynamic QR, Netbanking, automated collections links | Generates UPI payment links, verifies webhook, triggers automated invoice settlement | Indian UPI and Netbanking payment links cannot be created | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 3 | **Meta WhatsApp** | `META_WHATSAPP_TOKEN` + `WHATSAPP_APP_SECRET` + `WHATSAPP_VERIFY_TOKEN` | NO (Mock in test) | YES | NO | `communications::whatsapp`, `domain::ai_whatsapp_agent` | 2-way live chat, HSM billing alerts, AI WhatsApp sales bot | Sends/receives messages, renders HSM pre-approved templates, dispatches billing alerts | WhatsApp messaging fails; incoming webhooks rejected with 401 | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 4 | **Twilio** | `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_PHONE_NUMBER` | NO (Mock in test) | YES | NO | `providers::twilio`, `domain::voice_telephony` | Autonomous AI voice calls, PSTN dialing, WebRTC streams, SMS | Dials phone numbers, sets up bidirectional media websocket streams, sends SMS | Inbound/outbound voice calls cannot be placed or received | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 5 | **Deepgram** | `DEEPGRAM_API_KEY` | NO (Mock in test) | YES | NO | `providers::deepgram`, `domain::voice_agent_integration` | Real-time speech transcription (Nova-2 engine) | Streams caller audio chunks over WebSocket; transcribes speech in <150ms | Live voice transcription fails; AI agent cannot hear caller | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 6 | **ElevenLabs** | `ELEVENLABS_API_KEY` | NO (Mock in test) | YES | NO | `providers::elevenlabs`, `domain::voice_agent_integration` | Neural voice synthesis (Turbo v2.5 model) | Generates natural human voice audio (Rachel, Adam, Nicole) from text responses | AI voice synthesis drops; agent cannot speak back to caller | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 7 | **Google Gemini** | `GEMINI_API_KEY` | NO (Mock in test) | YES | NO | `domain::ai_sales_agent`, `domain::ai_tool_gateway` | Autonomous sales agent, deal reasoning, quote copilot | Analyzes customer messages, qualifies leads, reasons on pricing, executes tools | Autonomous sales agent disabled; deal copilot falls back to human mode | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 8 | **OpenAI** | `OPENAI_API_KEY` | NO (Mock in test) | YES | NO | `domain::ai_sales_agent`, `domain::ai_whatsapp_agent` | GPT-4o reasoning fallback & multi-model redundancy | Analyzes customer intent and selects structured tool calls | Multi-model fallback unavailable if Gemini experiences latency | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 9 | **Mathpix** | `mathpix-app-id` + `mathpix-app-key` | NO (Mock in test) | YES | NO | `ocr::mathpix`, `domain::ocr` | Accounts Payable invoice parsing & table OCR | Parses scanned vendor bills, extracts line items, validates arithmetic consistency | Automated AP bill scanning halts; bills must be manually keyed in | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 10 | **Google Cloud Vision** | GCP Service Account (ADC) | YES | YES | YES | `domain::ocr`, `integrations::connector` | General PDF & document image extraction | Extracts plain text from document images stored in Google Cloud Storage | General receipt scanning drops back to local parsing | **CONNECTED** |
| 11 | **Xero** | `XERO_CLIENT_ID` + `XERO_CLIENT_SECRET` | NO | YES | NO | `accounting::xero`, `domain::accounting` | General Ledger & Chart of Accounts synchronization | Syncs approved invoices, payments, and contacts to Xero Chart of Accounts | Invoices and payments must be manually exported to Xero | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 12 | **QuickBooks Online**| `QUICKBOOKS_CLIENT_ID` + `QUICKBOOKS_CLIENT_SECRET` | NO | YES | NO | `accounting::quickbooks`, `domain::accounting` | Intuit accounting synchronization | Pushes customers, sales invoices, and journal entries to QuickBooks Online | Synchronization with Intuit QuickBooks ecosystem disabled | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 13 | **Zoho Books** | `ZOHO_CLIENT_ID` + `ZOHO_CLIENT_SECRET` | NO | YES | NO | `accounting::zoho_books`, `domain::accounting` | Zoho Finance synchronization | Synchronizes contacts, vendor bills, and settlements to Zoho Books | Automatic synchronization to Zoho Books disabled | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 14 | **HitPay** | `HITPAY_API_KEY` + `HITPAY_SALT` | NO | YES | NO | `payments::hitpay`, `domain::country_pack` | Singapore PayNow SGQR & GrabPay payments | Generates EMVCo-compliant PayNow SGQR payment links and verifies settlement | Singapore PayNow online collection gateway cannot process transactions | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 15 | **DBS RAPID** | `DBS_RAPID_CLIENT_ID` + `DBS_RAPID_API_KEY` | NO | YES | NO | `regional_connectors`, `domain::country_pack` | Singapore Corporate Real-Time PayNow QR | Generates corporate DBS PayNow SGQR strings with UEN validation | Direct corporate PayNow QR generation unavailable | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 16 | **Curlec** | `MY_CURLEC_APP_ID` + `MY_CURLEC_SECRET_KEY` | NO | YES | NO | `regional_connectors`, `domain::country_pack` | Malaysia DuitNow QR & Direct Debit | Generates Malaysian DuitNow dynamic QR codes | Direct Malaysian banking rail integration unavailable | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 17 | **Omise** | `TH_OMISE_PUBLIC_KEY` + `TH_OMISE_SECRET_KEY` | NO | YES | NO | `regional_connectors`, `domain::country_pack` | Thailand PromptPay QR Invoicing | Generates Thai PromptPay QR payloads for mobile banking | Direct Thai PromptPay payment generation unavailable | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 18 | **Sentry** | `SENTRY_DSN` | NO (Blank in example) | YES | NO | `domain::observability` | Production crash alerting & span tracing | Ingests unhandled panics and slow request spans with automated PII scrubbing | Server errors and panics not captured in centralized Sentry dashboard | **IMPLEMENTED BUT CREDENTIAL MISSING** |
| 19 | **Google Storage** | GCP Service Account (ADC) | YES | YES | YES | `storage::gcs` | Multi-Tenant Encrypted Document Vault | Stores contracts, bills, audio recordings, and invoices with CMEK encryption | Document upload and retrieval fails; file operations fall back to local disk | **CONNECTED** |
| 20 | **Google Pub/Sub** | GCP Service Account (ADC) | YES | YES | YES | `events::publisher` | Asynchronous Outbox Event Streaming | Publishes CloudEvent 1.0 JSON messages for outbox relay without blocking requests | Asynchronous domain events cannot be dispatched across background workers | **CONNECTED** |
| 21 | **Google Tasks** | GCP Service Account (ADC) | YES | YES | YES | `worker::cloud_tasks` | Background Job Execution & Retries | Schedules delayed dunning steps, webhook retries, and dead-letter queue (DLQ) | Asynchronous retry logic and scheduled workflow actions cannot execute | **CONNECTED** |
| 22 | **Google Secret Mgr**| GCP Service Account (`roles/secretmanager.secretAccessor`) | YES | YES | YES | `integrations::auth::SecretManagerResolver` | Dynamic Runtime Secret Resolution | Resolves third-party API keys into container memory without baking secrets in images | Cloud Run containers cannot access third-party API keys at runtime | **CONNECTED** |
| 23 | **Google Cloud KMS**| GCP Service Account (ADC) | YES | YES | YES | `infrastructure/terraform/main.tf` | Cryptographic Envelope Encryption (CMEK) | Encrypts database columns and storage buckets with customer-managed keys | Database CMEK encryption fails; falls back to Google-managed encryption | **CONNECTED** |
| 24 | **OpenTelemetry** | `OTEL_EXPORTER_OTLP_ENDPOINT` | YES | YES | YES | `domain::observability` | Distributed Tracing & Span Export | Exports spans to local Jaeger container or production OpenTelemetry collector | Distributed tracing spans not collected | **CONNECTED** |

---

## 2. Feature-to-API Mapping (Prompt Section 17)

| Feature | External API | Required Credential | Purpose | Data Sent | Data Received | Result | Status |
|---|---|---|---|---|---|---|---|
| **Online Card Checkout** | Stripe | `STRIPE_SECRET_KEY` | Process customer debit/credit cards | Invoice amount, currency, customer email | PaymentIntent ID, payment status | Invoice marked PAID, receipt issued | Implemented; awaiting key |
| **India UPI Payments** | Razorpay | `RAZORPAY_KEY_ID` + `SECRET` | Generate dynamic UPI QR & payment links | Invoice amount, receipt number, phone | Short URL, order ID, payment ID | Instant UPI settlement, auto-dunning halt | Implemented; awaiting key |
| **WhatsApp Chat & Bot** | Meta WhatsApp | `META_WHATSAPP_TOKEN` | 2-way messaging & autonomous bot | Phone number, HSM template, document link | Message ID (wamid), delivery status | Live messaging in Unified Inbox | Implemented; awaiting key |
| **Voice AI Phone Calls** | Twilio + Deepgram + ElevenLabs | Twilio SID/Token, Deepgram Key, ElevenLabs Key | Inbound/outbound PSTN calling with AI voice | Destination phone, audio stream packets | Audio streams, transcripts, call SID | Autonomous voice conversation conducted | Implemented; awaiting keys |
| **Sales Copilot & Quotes**| Google Gemini | `GEMINI_API_KEY` | Autonomous deal qualification & tool calling | Deal details, conversation context, tool schemas | Text reply, tool call arguments | Quote created, inventory reserved | Implemented; awaiting key |
| **AP Bill Extraction** | Mathpix | `mathpix-app-id` + `key` | Extract multi-column tables from bills | Scanned PDF/image bytes | Line items, subtotal, tax, grand total | Draft AP bill created with math check | Implemented; awaiting key |
| **Accounting Sync** | Xero / QuickBooks | OAuth Client ID + Secret | Sync invoices/payments to General Ledger | Customer name, line items, account code | External invoice ID, sync status | General Ledger kept in sync | Implemented; awaiting OAuth |
| **Encrypted File Vault** | Google Cloud Storage | GCP Service Account (ADC) | Store sensitive customer contracts & bills | Binary file stream, tenant metadata | GCS object URI, signed download URL | Multi-tenant encrypted storage active | **CONNECTED & ACTIVE** |
| **Event Outbox Relay** | Google Cloud Pub/Sub | GCP Service Account (ADC) | Asynchronous domain event streaming | CloudEvent 1.0 JSON payload | Pub/Sub message ID, publish timestamp | Guaranteed at-least-once event delivery | **CONNECTED & ACTIVE** |
| **Background Retries** | Google Cloud Tasks | GCP Service Account (ADC) | Scheduled dunning & worker retry queue | Task payload, target URL, schedule time | Task name, enqueue timestamp | Resilient async background execution | **CONNECTED & ACTIVE** |
| **Crash Monitoring** | Sentry | `SENTRY_DSN` | Capture unhandled panics & slow spans | Sanitized error message, stack trace | Sentry event ID | Real-time crash alerting for engineering | Implemented; awaiting DSN |

---

## 3. API-to-Feature Mapping (Prompt Section 18)

* **Stripe** (`STRIPE_SECRET_KEY`)  
  &rarr; **Features Using It:** Sales Flow Engine, Online Invoice Checkout, Recurring Subscriptions, Autonomous Collections.  
  &rarr; **Backend Services:** `platform_integrations::providers::stripe`, `platform_domain::sales_flow`.  
  &rarr; **Database / Events:** `invoices`, `payments`, `outbox_events` (`payment.received.v1`).

* **Razorpay** (`RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`)  
  &rarr; **Features Using It:** India Invoicing, UPI Dynamic QR, Automated Dunning Links, Instant Settlement.  
  &rarr; **Backend Services:** `platform_integrations::payments::razorpay`, `platform_domain::autonomous_collections`.  
  &rarr; **Database / Events:** `collections_runs`, `payment_links`, `invoices`, `outbox_events` (`sales_flow.payment_settled`).

* **Meta WhatsApp** (`META_WHATSAPP_TOKEN`)  
  &rarr; **Features Using It:** Unified Messaging Inbox, Customer Support 360, AI WhatsApp Bot, Automated Billing Dispatches.  
  &rarr; **Backend Services:** `platform_integrations::communications::whatsapp`, `platform_domain::ai_whatsapp_agent`.  
  &rarr; **Database / Events:** `conversations`, `messages`, `customer_timeline`, `outbox_events` (`whatsapp.message_received.v1`).

* **Twilio** (`TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN`)  
  &rarr; **Features Using It:** Autonomous AI Voice Agent, Call Center Dialpad, Telephony Calling Window Compliance.  
  &rarr; **Backend Services:** `platform_integrations::providers::twilio`, `platform_domain::voice_telephony`.  
  &rarr; **Database / Events:** `calls`, `call_transcripts`, `customer_timeline`, `outbox_events` (`voice.call_completed.v1`).

* **Google Gemini** (`GEMINI_API_KEY`)  
  &rarr; **Features Using It:** AI Sales Agent Copilot, WhatsApp Bot Reasoning, Voice Agent Reasoning Gate, Global Universal Search.  
  &rarr; **Backend Services:** `platform_domain::ai_sales_agent`, `platform_domain::ai_tool_gateway`.  
  &rarr; **Database / Events:** `deals`, `quotes`, `invoices`, `audit_logs`, `outbox_events` (`sales_flow.deal_created`).

* **Mathpix** (`mathpix-app-id` + `mathpix-app-key`)  
  &rarr; **Features Using It:** Accounts Payable Bill Ingestion, Line-Item Arithmetic Anomaly Gate, Review Console.  
  &rarr; **Backend Services:** `platform_integrations::ocr::mathpix`, `platform_domain::ocr`.  
  &rarr; **Database / Events:** `documents`, `ocr_jobs`, `extracted_invoices`, `outbox_events` (`ocr.completed.v1`).

* **Google Cloud Storage** (GCP IAM ADC)  
  &rarr; **Features Using It:** Multi-Tenant Encrypted Document Vault, Contract Storage, AP Bill Storage, Call Recording Storage.  
  &rarr; **Backend Services:** `platform_integrations::storage::gcs::GcsStorageClient`, `platform_domain::documents`.  
  &rarr; **Database / Events:** `documents` (records `storage_uri="gs://..."`), signed download URLs.

* **Google Cloud Pub/Sub & Tasks** (GCP IAM ADC)  
  &rarr; **Features Using It:** Transactional Outbox Relay, Asynchronous Workflow Execution, Scheduled Dunning, Dead-Letter Queue (DLQ).  
  &rarr; **Backend Services:** `platform_events::publisher::GcpPubSubPublisher`, `platform_worker::cloud_tasks::CloudTasksClient`.  
  &rarr; **Database / Events:** `outbox_events`, `dead_letter_records`, background job execution logs.
