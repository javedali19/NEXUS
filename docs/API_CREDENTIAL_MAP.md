# Full API Credential & Integration Code Map

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Audit Type:** End-to-End Credential Connection Traces  
**Date:** 2026-09-24  

---

## 1. Overview of Complete Connection Chains

This document verifies the complete, unbroken chain of execution for every external API integration:
```text
Credential
    ↓
Configuration
    ↓
SDK / HTTP Client
    ↓
Integration Adapter
    ↓
Backend Service
    ↓
Business Module
    ↓
Database / Event
    ↓
Frontend Feature
```

---

## 2. Service-by-Service Verified Connection Chains

### 2.1 Stripe Payments (International Card Processing & Checkout)

```text
Credential:
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET (Resolved via GSM: stripe-secret-key)
    ↓
Configuration:
infrastructure/terraform/compute.tf (Line 55) & SecretManagerResolver
    ↓
SDK / HTTP Client:
reqwest::Client (REST API v1) with Bearer token authentication
    ↓
Integration Adapter:
platform_integrations::providers::stripe::StripeConnector
    ↓
Backend Service:
platform_domain::sales_flow::SalesFlowEngine
    ↓
Business Module:
Invoices & Online Checkout (/api/v1/invoices/:id/payment-intent)
    ↓
Database / Event:
invoices table (status="PAID"), payments table, outbox_events ("payment.received.v1")
    ↓
Frontend Feature:
Customer Hosted Checkout Page, Invoice Details View (/invoices), Revenue Analytics
```
* **Chain Status:** **COMPLETE & VERIFIED IN CODE** (Awaiting live Secret Key).

---

### 2.2 Razorpay (India Payments, UPI QR & Collections Links)

```text
Credential:
RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (Resolved via GSM: razorpay-key-secret)
    ↓
Configuration:
infrastructure/terraform/compute.tf (Line 64) & SecretManagerResolver
    ↓
SDK / HTTP Client:
reqwest::Client with HTTP Basic Auth (key_id:key_secret)
    ↓
Integration Adapter:
platform_integrations::payments::razorpay::RazorpayAdapter
    ↓
Backend Service:
platform_domain::autonomous_collections::AutonomousCollectionsEngine
    ↓
Business Module:
UPI Payment Links & Automated Dunning Sequences
    ↓
Database / Event:
collections_runs, payment_links, outbox_events ("sales_flow.payment_settled")
    ↓
Frontend Feature:
One-Click UPI Payment Modal, Collections Dashboard (/collections), Customer 360 Timeline
```
* **Chain Status:** **COMPLETE & VERIFIED IN CODE** (Awaiting live Key Secret).

---

### 2.3 Meta WhatsApp Business Cloud API (Omnichannel Messaging)

```text
Credential:
META_WHATSAPP_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN
    ↓
Configuration:
infrastructure/terraform/compute.tf (Line 82) & WhatsAppConfig
    ↓
SDK / HTTP Client:
reqwest::Client targeting https://graph.facebook.com/v18.0/{phone_number_id}/messages
    ↓
Integration Adapter:
platform_integrations::communications::whatsapp::WhatsAppAdapter
    ↓
Backend Service:
platform_domain::omnichannel::OmnichannelRouter & platform_domain::ai_whatsapp_agent::AiWhatsAppAgent
    ↓
Business Module:
Unified Messaging Inbox, WhatsApp Bot, Automated HSM Billing Alerts
    ↓
Database / Event:
conversations, messages, customer_timeline, outbox_events ("whatsapp.message_received.v1")
    ↓
Frontend Feature:
Live WhatsApp Chat Console (/communications/inbox), Message History, Quick Replies
```
* **Chain Status:** **COMPLETE & VERIFIED IN CODE** (Awaiting live System User Token).

---

### 2.4 Twilio (Voice Telephony) — [REMOVED]

```text
Status:
REMOVED / NO LONGER USED

Architecture Note:
Twilio has been completely removed from NEXUS ERP + CRM + TELI.
Telephony operations (softphone dialpad, call ledger, call transcripts, customer timeline)
now function through a provider-neutral telephony gateway layer:
    ↓
Provider-Neutral Architecture:
TelephonyVoiceEngine & CallingWindowValidator
    ↓
Session Descriptor:
Standard session descriptors & WebRTC audio streaming
    ↓
PostgreSQL Tables:
calls, call_transcripts, customer_timeline preserved
    ↓
Frontend Features:
Voice Call Dialpad, Softphone UI, Call Ledger remain fully operational.
```
* **Chain Status:** **REMOVED** (Replaced by provider-neutral telephony layer; zero Twilio dependency).

---

### 2.5 Deepgram (Real-Time Audio Transcription STT)

```text
Credential:
DEEPGRAM_API_KEY (Resolved via GSM: deepgram-api-key)
    ↓
Configuration:
infrastructure/terraform/compute.tf & VoiceAgentConfig
    ↓
SDK / HTTP Client:
Async WebSocket stream (wss://api.deepgram.com/v1/listen?model=nova-2)
    ↓
Integration Adapter:
platform_integrations::providers::deepgram::DeepgramConnector
    ↓
Backend Service:
platform_domain::voice_agent_integration::VoiceAgentCoordinator
    ↓
Business Module:
Real-Time Speech Recognition for AI Call Session
    ↓
Database / Event:
call_transcripts, live sentiment stream
    ↓
Frontend Feature:
Live Telephony Audio Waveform & Real-Time Transcript Display
```
* **Chain Status:** **COMPLETE & VERIFIED IN CODE** (Awaiting live API Key).

---

### 2.6 ElevenLabs (Neural Voice Synthesis TTS) — [REMOVED]

```text
Status:
REMOVED / NO LONGER USED (Intentionally removed from platform)
    ↓
Impact:
ElevenLabs-specific TTS/voice generation removed. Voice pipeline gracefully operates in text/telephony fallback.
    ↓
Remaining Active Architecture:
Provider-neutral SIP Telephony + Deepgram Streaming STT + OpenAI/Gemini/Groq Decision Engine
```
* **Chain Status:** **REMOVED** (Zero active dependencies).

---

### 2.7 Google Gemini & OpenAI (Autonomous Reasoning & Tool Execution)

```text
Credential:
GEMINI_API_KEY (Resolved via GSM: gemini-api-key) / OPENAI_API_KEY
    ↓
Configuration:
infrastructure/terraform/compute.tf (Line 91) & AiSalesAgent configuration
    ↓
SDK / HTTP Client:
reqwest::Client targeting Google Gemini 1.5 Pro or OpenAI GPT-4o REST endpoints
    ↓
Integration Adapter:
platform_domain::ai_sales_agent::AiSalesAgent & platform_domain::ai_tool_gateway::AiToolGateway
    ↓
Backend Service:
platform_domain::sales_flow::SalesFlowEngine
    ↓
Business Module:
Autonomous Lead Qualification, Deal Closing, Quote Negotiation, Tool Dispatch
    ↓
Database / Event:
deals, quotes, invoices, outbox_events ("sales_flow.deal_created", "sales_flow.quote_issued")
    ↓
Frontend Feature:
AI Sales Agent Copilot Console (/ai-sales), Autonomous Execution Feed, Deal Pipeline
```
* **Chain Status:** **COMPLETE & VERIFIED IN CODE** (Awaiting live API Key).

---

### 2.8 Mathpix Document OCR (Accounts Payable Bill Parsing)

```text
Credential:
mathpix-app-id + mathpix-app-key (Resolved via GSM: SecretManagerResolver)
    ↓
Configuration:
backend/crates/integrations/src/ocr/mathpix.rs (Lines 25-26)
    ↓
SDK / HTTP Client:
reqwest::Client with app_id and app_key headers targeting https://api.mathpix.com/v3/text
    ↓
Integration Adapter:
platform_integrations::ocr::mathpix::MathpixClient
    ↓
Backend Service:
platform_domain::ocr::OcrVerificationEngine
    ↓
Business Module:
Vendor Bill Parsing, Line Item Arithmetic Anomaly Check, 3-Way Invoice Matching
    ↓
Database / Event:
documents, ocr_jobs, extracted_invoices ("ocr.completed.v1", "ocr.anomaly_detected")
    ↓
Frontend Feature:
AP Document Upload Dropzone, Human-in-the-Loop OCR Review Console (/documents/ocr-review)
```
* **Chain Status:** **COMPLETE & VERIFIED IN CODE** (Awaiting live Mathpix Credentials).

---

### 2.9 Google Cloud Storage (Multi-Tenant CMEK Document Storage)

```text
Credential:
Google Cloud Service Account (ADC) / Workload Identity Federation
    ↓
Configuration:
GCP_STORAGE_BUCKET, GCP_PROJECT_ID (.env.example & Terraform)
    ↓
SDK / HTTP Client:
reqwest::Client / Google Cloud Storage API Client
    ↓
Integration Adapter:
platform_integrations::storage::gcs::GcsStorageClient
    ↓
Backend Service:
platform_domain::documents::DocumentManager
    ↓
Business Module:
Secure Multi-Tenant Asset Vault (Contracts, Invoices, Receipts, Call Recordings)
    ↓
Database / Event:
documents table (storage_uri="gs://..."), signed download URLs
    ↓
Frontend Feature:
Document Viewer, Download Links, Attachment Uploader (/documents)
```
* **Chain Status:** **ACTIVE & OPERATIONAL** (Connected via Google Cloud IAM).

---

### 2.10 Google Cloud Pub/Sub & Cloud Tasks (Event Broker & Asynchronous Workers)

```text
Credential:
Google Cloud Service Account (ADC) / Workload Identity Federation
    ↓
Configuration:
GCP_PUBSUB_TOPIC_EVENTS, GCP_TASKS_QUEUE_NAME (.env.example & Terraform)
    ↓
SDK / HTTP Client:
Google Cloud Pub/Sub & Cloud Tasks REST/gRPC client
    ↓
Integration Adapter:
platform_events::publisher::GcpPubSubPublisher & platform_worker::cloud_tasks::CloudTasksClient
    ↓
Backend Service:
platform_worker::worker_service::WorkerService
    ↓
Business Module:
Transactional Outbox Relay, Dead-Letter Queue (DLQ), Background Workflow Engine
    ↓
Database / Event:
outbox_events table, dead_letter_records table
    ↓
Frontend Feature:
Workflow Execution History (/workflows), Background Job Health Status Monitor
```
* **Chain Status:** **ACTIVE & OPERATIONAL** (Connected via Google Cloud IAM).

---

### 2.11 Sentry (Production Error Tracking & Tracing)

```text
Credential:
SENTRY_DSN (Resolved via GSM: sentry-dsn)
    ↓
Configuration:
infrastructure/terraform/compute.tf (Line 100) & SentryConfig
    ↓
SDK / HTTP Client:
Sentry envelope HTTP client with automated PII & Secret Scrubber
    ↓
Integration Adapter:
platform_domain::observability::SentryConfig
    ↓
Backend Service:
axum middleware catch-panic & error handler
    ↓
Business Module:
Crash Reporting, Unhandled Panics, Distributed Span Tracing
    ↓
Database / Event:
sentry_event_id attached to API error responses
    ↓
Frontend Feature:
System Health Dashboard (/observability), Real-Time Subsystem Latency Charts
```
* **Chain Status:** **COMPLETE & VERIFIED IN CODE** (Awaiting live Sentry DSN).
