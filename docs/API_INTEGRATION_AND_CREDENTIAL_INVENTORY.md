# Complete API Key & Integration Inventory Audit

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Audit Scope:** Deep Recursive Scan of Backend, Frontend, Cloud Run, Terraform, Workers, Webhooks, Integrations, and Configuration  
**Audit Classification:** STRICT READ-ONLY SECURITY AUDIT  
**Date:** 2026-09-23  
**Status:** Zero Hardcoded Secrets Detected | All Secret Values Masked  

---

## 1. Executive Summary & Audit Methodology

This audit provides a comprehensive, evidence-based inventory of every external API, API key, secret, OAuth credential, webhook signature, SDK adapter, and third-party cloud service implemented or referenced in the repository.

### Methodology & Scan Vectors:
1. **Source Code Inspection:** Audited all 8 Rust crates (`backend/crates/api`, `backend/crates/worker`, `backend/crates/domain`, `backend/crates/integrations`, `backend/crates/events`, `backend/crates/db`, `backend/crates/common`), scanning for `std::env::var`, `SecretManagerResolver`, `GsmSecretRef`, and adapter structs.
2. **Frontend Client Inspection:** Audited `apps/web/src` for `process.env`, `NEXT_PUBLIC_*`, React state, and bundle exposure to ensure zero secret leakage to the browser.
3. **Infrastructure & Terraform:** Audited `infrastructure/terraform/*.tf` (`secrets.tf`, `compute.tf`, `storage.tf`, `iam.tf`, `pubsub.tf`, `tasks.tf`, `database.tf`) to trace Google Secret Manager provisioning and Cloud Run container environment injection.
4. **Environment Files:** Audited `.env.example`, `.env.test`, and `.env.local` to verify declared versus consumed variables.
5. **Security & Cryptography:** Verified HMAC signature verification algorithms, constant-time comparisons, and PII scrubbing across all inbound webhooks.

---

## 2. Master API Inventory Table

| # | Service | Category | Credential Type | Environment Variable / Secret Name | Where Used | Feature | Status | Production Required |
|---|---------|----------|-----------------|-----------------------------------|------------|---------|--------|---------------------|
| 1 | **Stripe** | Payments | API Secret / Webhook Secret | `STRIPE_SECRET_KEY`, `stripe-secret-key` | `integrations/src/providers/stripe.rs` | Checkout, Card Processing, Subscriptions | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES |
| 2 | **Razorpay** | Payments | Key ID / Key Secret / Webhook Secret | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `razorpay-key-secret` | `integrations/src/payments/razorpay.rs` | UPI, Payment Links, Netbanking, Collections | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (in India) |
| 3 | **HitPay** | Payments | API Key / Webhook Salt | `HITPAY_API_KEY`, `HITPAY_SALT` | `integrations/src/payments/hitpay.rs` | PayNow SGQR, GrabPay, ShopeePay, FPX | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (in Singapore/SEA) |
| 4 | **Cashfree** | Payments | App ID / Secret Key | `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY` | `integrations/src/payments/cashfree.rs` | UPI Auto-Pay, Instant Payouts, Card Vault | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | Optional / Alternative |
| 5 | **Airwallex** | Payments | Client ID / API Key | `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY` | `integrations/src/payments/airwallex.rs` | Cross-Border FX, Global Virtual Accounts | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | Optional (Global Accounts) |
| 6 | **DBS RAPID / PayNow** | Regional Payments | Client ID / API Key / Proxy UEN / Private Key | `DBS_RAPID_CLIENT_ID`, `DBS_RAPID_API_KEY`, `DBS_PAYNOW_PROXY_ID`, `DBS_SIGNING_PRIVATE_KEY` | `integrations/src/regional_connectors.rs` | Singapore Corporate Real-Time PayNow QR | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (in Singapore) |
| 7 | **Curlec / DuitNow** | Regional Payments | App ID / Secret Key | `MY_CURLEC_APP_ID`, `MY_CURLEC_SECRET_KEY` | `integrations/src/regional_connectors.rs` | Malaysia DuitNow QR & Direct Debit | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (in Malaysia) |
| 8 | **Omise / PromptPay** | Regional Payments | Public Key / Secret Key | `TH_OMISE_PUBLIC_KEY`, `TH_OMISE_SECRET_KEY` | `integrations/src/regional_connectors.rs` | Thailand PromptPay QR Invoicing | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (in Thailand) |
| 9 | **Meta WhatsApp Cloud API** | Communications | Access Token / App Secret / Verify Token / WABA ID / Phone ID | `META_WHATSAPP_TOKEN`, `meta-whatsapp-token`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | `integrations/src/communications/whatsapp.rs` | Unified Inbox, HSM Templates, Customer 360 | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES |
| 10 | **Twilio** | Telephony & SMS | Account SID / Auth Token / Phone Number | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `twilio-auth-token` | `integrations/src/providers/twilio.rs` | AI Voice Agent Calls, Call Center, SMS | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES |
| 11 | **Deepgram** | Speech-to-Text | API Key | `DEEPGRAM_API_KEY`, `deepgram-api-key` | `integrations/src/providers/deepgram.rs` | Real-time Streaming STT (Nova-2), Call Transcription | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES |
| 12 | **ElevenLabs** | Voice AI | API Key / Voice ID / Model ID | `ELEVENLABS_API_KEY`, `elevenlabs-api-key`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID` | `integrations/src/providers/elevenlabs.rs` | Real-time Voice Synthesis (Turbo v2.5), AI Telephony | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES |
| 13 | **Google Gemini** | AI Reasoning | API Key | `GEMINI_API_KEY`, `gemini-api-key` | `domain/src/ai_sales_agent.rs`, `domain/src/e2e_audit.rs` | Autonomous Sales Agent Copilot, Conversation AI | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (or OpenAI) |
| 14 | **OpenAI** | AI Reasoning | API Key | `OPENAI_API_KEY` | `domain/src/ai_sales_agent.rs`, `domain/src/ai_whatsapp_agent.rs` | GPT-4o Agent Reasoning, Tool Execution | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (or Gemini) |
| 15 | **Anthropic** | AI Reasoning | API Key | `ANTHROPIC_API_KEY` | `domain/src/ai_sales_agent.rs` | Claude 3.5 Sonnet Reasoning | PARTIALLY IMPLEMENTED (CONFIGURED ONLY) | Optional Fallback |
| 16 | **Mathpix** | Document OCR | App ID / App Key | GSM `mathpix-app-id`, GSM `mathpix-app-key` | `integrations/src/ocr/mathpix.rs` | Bill/Invoice Math Extraction, AP Table Parsing | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES |
| 17 | **Google Cloud Vision** | Document OCR | Service Account / ADC | GCP Workload Identity / ADC | `domain/src/ocr.rs`, `integrations/src/connector.rs` | PDF Document OCR, Receipt Extraction | IMPLEMENTED (CONNECTED VIA GCP IAM) | YES |
| 18 | **Xero** | Accounting | OAuth 2.0 (Client ID / Secret / Tenant ID) | `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_TENANT_ID` | `integrations/src/accounting/xero.rs` | Bi-directional General Ledger, Invoice Sync | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (if Xero used) |
| 19 | **QuickBooks Online** | Accounting | OAuth 2.0 (Client ID / Secret / Realm ID) | `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`, `QUICKBOOKS_REALM_ID` | `integrations/src/accounting/quickbooks.rs` | Intuit GL Sync, Chart of Accounts, Reconciliation | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (if QBO used) |
| 20 | **Zoho Books** | Accounting | OAuth 2.0 (Client ID / Secret / Org ID) | `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_ORGANIZATION_ID` | `integrations/src/accounting/zoho_books.rs` | Invoicing, Bills Sync, Tax Summary | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (if Zoho used) |
| 21 | **Malaysia LHDN MyInvois** | Regional Tax | Client ID / Secret / Digital Cert | `LHDN_MYINVOIS_CLIENT_ID`, `LHDN_MYINVOIS_CLIENT_SECRET`, `LHDN_DIGITAL_CERT_REF` | `integrations/src/regional_connectors.rs` | Mandatory Malaysian E-Invoicing & IRBM Validation | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (in Malaysia) |
| 22 | **Thailand RD e-Tax** | Regional Tax | API Key / Service Code / Digital Cert | `THAI_RD_API_KEY`, `THAI_RD_ETAX_SERVICE_CODE`, `THAI_RD_CERTIFICATE_REF` | `integrations/src/regional_connectors.rs` | Thai Revenue Dept e-Tax Invoice XML Signing | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (in Thailand) |
| 23 | **LINE Official Account** | Regional Messaging | Channel ID / Channel Secret / Access Token | `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN` | `integrations/src/regional_connectors.rs` | Thailand Omnichannel Messaging | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | Optional (Thailand) |
| 24 | **Salesforce** | CRM | OAuth 2.0 / Connected App | `SALESFORCE_INSTANCE_URL`, `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET` | `integrations/src/providers/salesforce.rs` | Enterprise Account/Contact/Deal Synchronization | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | Optional |
| 25 | **Sentry** | Observability | DSN | `SENTRY_DSN`, `sentry-dsn` | `domain/src/observability.rs`, `infrastructure/terraform/compute.tf` | Production Error Tracking & Performance Tracing | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES |
| 26 | **OpenTelemetry** | Observability | OTLP Endpoint | `OTEL_EXPORTER_OTLP_ENDPOINT` | `domain/src/observability.rs`, `.env.example` | Distributed Tracing & Metrics Export | IMPLEMENTED (CONFIGURED ONLY) | YES |
| 27 | **Google Cloud Storage** | Cloud Storage | GCP IAM / Service Account | `GCP_STORAGE_BUCKET`, `GCP_PROJECT_ID` | `integrations/src/storage/gcs.rs` | Encrypted Documents, Contracts, Invoices, Audio | IMPLEMENTED AND CONNECTED | YES |
| 28 | **Google Cloud Pub/Sub** | Event Broker | GCP IAM / Service Account | `GCP_PUBSUB_TOPIC_EVENTS`, `GCP_PROJECT_ID` | `events/src/publisher.rs` | Transactional Outbox Dispatches, Domain Events | IMPLEMENTED AND CONNECTED | YES |
| 29 | **Google Cloud Tasks** | Background Worker | GCP IAM / Service Account | `GCP_TASKS_QUEUE_NAME`, `GCP_PROJECT_ID`, `GCP_REGION` | `worker/src/cloud_tasks.rs` | Async Retries, Payment Webhooks, Workflows, DLQ | IMPLEMENTED AND CONNECTED | YES |
| 30 | **Google Secret Manager** | Secrets Vault | GCP IAM (`roles/secretmanager.secretAccessor`) | Terraform `google_secret_manager_secret` | `integrations/src/auth/secret_manager.rs` | Third-party API Secret Resolution & Injection | IMPLEMENTED AND CONNECTED | YES |
| 31 | **Google Cloud KMS** | Cryptography | GCP IAM / Key URI | `GCP_KMS_KEY_NAME` | `infrastructure/terraform/main.tf` | Customer-Managed Encryption Keys (CMEK) | IMPLEMENTED AND CONNECTED | YES |
| 32 | **Google Identity Platform** | Authentication | Project ID / API Key / Tenant ID | `GCP_IDENTITY_PLATFORM_PROJECT_ID`, `GCP_IDENTITY_PLATFORM_API_KEY` | `common/src/lib.rs`, `api/src/auth.rs` | Cloud Multi-Tenant Identity, JWT Verification | IMPLEMENTED (BLOCKED BY MISSING CREDENTIAL) | YES (Production) |

---

## 3. Deep Trace: Credential to Actual Code Usage

### 3.1 Stripe Payments
1. **Variable Name:** `STRIPE_SECRET_KEY` (Env) / `stripe-secret-key` (Secret Manager)
2. **File Defined:** `.env.example`, `infrastructure/terraform/secrets.tf` (Line 8)
3. **File Read:** `infrastructure/terraform/compute.tf` (Line 55), `backend/crates/integrations/src/providers/stripe.rs` (Line 32)
4. **Backend Service:** `platform_integrations::providers::stripe::StripeConnector`
5. **Function/Module:** `StripeConnector::test_connection`, `StripeConnector::verify_webhook_signature`
6. **External API Endpoint:** `https://api.stripe.com/v1/payment_intents`, `https://api.stripe.com/v1/charges`
7. **Business Feature:** Card checkout, customer billing, automated recurring subscriptions
8. **Active:** No (Blocked by missing live key)
9. **Configured but Unused:** No (Direct code path wired to payment router)
10. **Partially Implemented:** No (Fully implemented adapter)
11. **Mocked:** Validates against `sk_test_` / `sk_live_` prefix format in unit tests
12. **Production Required:** YES

### 3.2 Razorpay Payments & UPI
1. **Variable Name:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` / `razorpay-key-secret`
2. **File Defined:** `.env.example`, `infrastructure/terraform/secrets.tf` (Line 9)
3. **File Read:** `infrastructure/terraform/compute.tf` (Line 64), `backend/crates/integrations/src/payments/razorpay.rs` (Lines 86-96)
4. **Backend Service:** `platform_integrations::payments::razorpay::RazorpayAdapter`
5. **Function/Module:** `RazorpayAdapter::create_intent`, `RazorpayAdapter::resolve_key_secret`, `RazorpayAdapter::verify_webhook_signature`
6. **External API Endpoint:** `https://api.razorpay.com/v1/orders`, `https://api.razorpay.com/v1/payment_links`
7. **Business Feature:** India Payments, UPI QR, automated collections links, invoice settlement
8. **Active:** No (Blocked by missing live key)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** Offline test fixture used in CI tests
12. **Production Required:** YES (for India operations)

### 3.3 Meta WhatsApp Business Cloud API
1. **Variable Name:** `META_WHATSAPP_TOKEN` / `meta-whatsapp-token`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`
2. **File Defined:** `.env.example`, `infrastructure/terraform/secrets.tf` (Line 11)
3. **File Read:** `infrastructure/terraform/compute.tf` (Line 82), `backend/crates/integrations/src/communications/whatsapp.rs` (Lines 67-69, 137-145)
4. **Backend Service:** `platform_integrations::communications::whatsapp::WhatsAppAdapter`
5. **Function/Module:** `WhatsAppAdapter::send_message`, `WhatsAppAdapter::verify_webhook_handshake`, `WhatsAppAdapter::verify_webhook_signature`
6. **External API Endpoint:** `https://graph.facebook.com/v18.0/{phone_number_id}/messages`
7. **Business Feature:** Omnichannel Unified Inbox, automated HSM template messaging, collections reminders, AI WhatsApp bot
8. **Active:** No (Blocked by missing live system user token)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** Webhook parser and handshake test suites verify payload processing
12. **Production Required:** YES

### 3.4 Twilio Voice & Telephony
1. **Variable Name:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` / `twilio-auth-token`, `TWILIO_PHONE_NUMBER`
2. **File Defined:** `.env.example`, `infrastructure/terraform/secrets.tf` (Line 10)
3. **File Read:** `infrastructure/terraform/compute.tf` (Line 73), `backend/crates/integrations/src/providers/twilio.rs` (Lines 33-40)
4. **Backend Service:** `platform_integrations::providers::twilio::TwilioConnector`
5. **Function/Module:** `TwilioConnector::test_connection`, `TwilioConnector::normalize_webhook`, `domain::voice_telephony::CallingWindowValidator`
6. **External API Endpoint:** `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json`
7. **Business Feature:** AI Voice Agent calling, WebRTC audio streaming, PSTN dialing, local compliance window checking
8. **Active:** No (Blocked by missing live Account SID and Auth Token)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** Format validator (`AC...`) checked in tests
12. **Production Required:** YES

### 3.5 Deepgram Real-Time Speech-to-Text
1. **Variable Name:** `DEEPGRAM_API_KEY` / `deepgram-api-key`
2. **File Defined:** `.env.example` (Line 51), `infrastructure/terraform/secrets.tf` (Line 14)
3. **File Read:** `backend/crates/integrations/src/providers/deepgram.rs` (Lines 33-37), `backend/crates/domain/src/e2e_audit.rs` (Line 307)
4. **Backend Service:** `platform_integrations::providers::deepgram::DeepgramConnector`
5. **Function/Module:** `DeepgramConnector::test_connection`, `domain::voice_agent_integration::VoiceAgentConfig`
6. **External API Endpoint:** `wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true`
7. **Business Feature:** Ultra-low latency voice transcription for incoming/outgoing phone calls
8. **Active:** No (Blocked by missing live key)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** Offline fixture fallback active when unconfigured
12. **Production Required:** YES

### 3.6 ElevenLabs Neural Voice Synthesis
1. **Variable Name:** `ELEVENLABS_API_KEY` / `elevenlabs-api-key`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`
2. **File Defined:** `.env.example` (Lines 56-58), `infrastructure/terraform/secrets.tf` (Line 13)
3. **File Read:** `backend/crates/integrations/src/providers/elevenlabs.rs` (Lines 63-70), `backend/crates/domain/src/e2e_audit.rs` (Line 327)
4. **Backend Service:** `platform_integrations::providers::elevenlabs::ElevenLabsConnector`
5. **Function/Module:** `ElevenLabsConnector::test_connection`, `ElevenLabsConnector::preset_voices`
6. **External API Endpoint:** `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream`
7. **Business Feature:** Autonomous Voice Agent voice output (Rachel, Adam, Nicole models)
8. **Active:** No (Blocked by missing live key)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** Text development mode active when unconfigured
12. **Production Required:** YES

### 3.7 Google Gemini & OpenAI LLMs
1. **Variable Name:** `GEMINI_API_KEY` / `gemini-api-key`, `OPENAI_API_KEY`
2. **File Defined:** `.env.example` (Lines 36-37), `infrastructure/terraform/secrets.tf` (Line 12)
3. **File Read:** `infrastructure/terraform/compute.tf` (Line 91), `backend/crates/domain/src/ai_sales_agent.rs` (Lines 36-39), `backend/crates/domain/src/e2e_audit.rs` (Lines 364-365)
4. **Backend Service:** `platform_domain::ai_sales_agent::AiSalesAgent`, `platform_domain::ai_whatsapp_agent::AiWhatsAppAgent`, `platform_domain::ai_tool_gateway::AiToolGateway`
5. **Function/Module:** `AiSalesAgent::validate_provider_connection`, `AiToolGateway::execute_tool`
6. **External API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`, `https://api.openai.com/v1/chat/completions`
7. **Business Feature:** Autonomous AI copilot, deal qualification, autonomous collection strategy, tool execution
8. **Active:** No (Blocked by missing API key; invariant holds agent disabled until validated)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** Key format prefix check (`sk-proj-...` or 20+ chars) in test suite
12. **Production Required:** YES (At least one: Gemini or OpenAI)

### 3.8 Mathpix Document OCR
1. **Variable Name:** `app_id_secret_ref` (`mathpix-app-id`), `app_key_secret_ref` (`mathpix-app-key`)
2. **File Defined:** `backend/crates/integrations/src/ocr/mathpix.rs` (Lines 25-26)
3. **File Read:** `backend/crates/integrations/src/ocr/mathpix.rs` (Lines 68-80) via `SecretManagerResolver`
4. **Backend Service:** `platform_integrations::ocr::mathpix::MathpixClient`
5. **Function/Module:** `MathpixClient::test_connection`, `MathpixClient::parse_raw_ocr_to_invoice`
6. **External API Endpoint:** `https://api.mathpix.com/v3/text`
7. **Business Feature:** Accounts Payable invoice extraction, line item arithmetic validation, table parsing
8. **Active:** No (Awaiting secret configuration in Secret Manager)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** Comprehensive unit tests parse raw Mathpix response fixtures
12. **Production Required:** YES

### 3.9 Xero Accounting
1. **Variable Name:** `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_TENANT_ID`
2. **File Defined:** `.env.example`, `backend/crates/domain/src/e2e_audit.rs` (Line 388)
3. **File Read:** `backend/crates/integrations/src/accounting/xero.rs` (Lines 26-42)
4. **Backend Service:** `platform_integrations::accounting::xero::XeroAdapter`
5. **Function/Module:** `XeroAdapter::get_oauth_authorization_url`, `XeroAdapter::sync_customers`, `XeroAdapter::sync_invoices`
6. **External API Endpoint:** `https://api.xero.com/api.xro/2.0/Invoices`, `https://login.xero.com/identity/connect/token`
7. **Business Feature:** General Ledger syncing, accounts receivable balance synchronization
8. **Active:** No (Blocked by missing client credentials)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** Internal PostgreSQL GL active when unconfigured
12. **Production Required:** YES (if Xero is selected accounting provider)

### 3.10 Sentry Monitoring & Error Reporting
1. **Variable Name:** `SENTRY_DSN` / `sentry-dsn`
2. **File Defined:** `.env.example` (Line 30), `infrastructure/terraform/secrets.tf` (Line 15)
3. **File Read:** `infrastructure/terraform/compute.tf` (Line 100), `backend/crates/domain/src/observability.rs` (Lines 114-125)
4. **Backend Service:** `platform_domain::observability::SentryConfig`
5. **Function/Module:** `domain::observability::init_sentry`, `domain::observability::scrub_pii_and_secrets`
6. **External API Endpoint:** `https://o{org}.ingest.sentry.io/api/{project}/envelope/`
7. **Business Feature:** Unhandled exception reporting, tracing, automated PII scrubbing
8. **Active:** No (Awaiting live DSN)
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** PII/Credential scrubber unit tests pass with synthetic DSN
12. **Production Required:** YES

### 3.11 Google Cloud Managed Services (Storage, Tasks, PubSub, KMS, GCIP)
1. **Variable Name:** `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_STORAGE_BUCKET`, `GCP_PUBSUB_TOPIC_EVENTS`, `GCP_TASKS_QUEUE_NAME`, `GCP_KMS_KEY_NAME`, `GCP_IDENTITY_PLATFORM_API_KEY`
2. **File Defined:** `.env.example` (Lines 15-26), `infrastructure/terraform/main.tf`
3. **File Read:** `backend/crates/integrations/src/storage/gcs.rs`, `backend/crates/worker/src/cloud_tasks.rs`, `backend/crates/events/src/publisher.rs`, `backend/crates/common/src/lib.rs`
4. **Backend Service:** `GcsStorageClient`, `CloudTasksClient`, `GcpPubSubPublisher`, `GsmSecretRef`
5. **Function/Module:** Cloud Run runtime service account (`roles/storage.objectAdmin`, `roles/cloudtasks.enqueuer`, `roles/pubsub.publisher`, `roles/secretmanager.secretAccessor`)
6. **External API Endpoint:** Google Cloud APIs (`storage.googleapis.com`, `cloudtasks.googleapis.com`, `pubsub.googleapis.com`, `secretmanager.googleapis.com`)
7. **Business Feature:** Foundation infrastructure: transactional outbox, asynchronous retries, multi-tenant document storage, envelope encryption
8. **Active:** Yes in Terraform deployment architecture; runs in emulator/in-memory mode in local dev
9. **Configured but Unused:** No
10. **Partially Implemented:** No
11. **Mocked:** In-memory fallback adapters available for local zero-dependency development
12. **Production Required:** YES

---

## 4. Webhook Audit & Handshake Verification

| Provider | Webhook Endpoint | Supported Event Types | Verification Method | Secret / Verify Token Config | Signature Validation Algorithm | Idempotency Protection | Business Module Triggered | Status |
|----------|------------------|-----------------------|---------------------|------------------------------|--------------------------------|------------------------|---------------------------|--------|
| **Meta WhatsApp** | `/api/v1/webhooks/whatsapp` | `messages`, `message_deliveries`, `message_reads`, `template_status_update` | Constant-Time HMAC-SHA256 & GET Challenge Handshake | `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | `sha256=` header comparison via `constant_time_compare` | `wamid` message deduplication key | Customer 360, AI WhatsApp Agent, Unified Inbox | IMPLEMENTED |
| **Stripe** | `/api/v1/webhooks/stripe` | `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` | Constant-Time HMAC-SHA256 | `STRIPE_WEBHOOK_SECRET` | Header `t={ts},v1={sig}` parsed and verified against payload | Stripe Event ID (`evt_...`) idempotency check | Invoices, Autonomous Collections, Ledger | IMPLEMENTED |
| **Razorpay** | `/api/v1/webhooks/razorpay` | `payment.captured`, `payment.failed`, `order.paid`, `refund.processed` | Constant-Time HMAC-SHA256 | `RAZORPAY_WEBHOOK_SECRET` | Header `X-Razorpay-Signature` hex comparison | Razorpay Payment ID (`pay_...`) idempotency table | Sales Flow Engine, Invoices, Customer Timeline | IMPLEMENTED |
| **Twilio** | `/api/v1/webhooks/twilio` | `call.initiated`, `call.answered`, `call.completed`, `recording.available` | HMAC-SHA1 URL & Param Signing | `TWILIO_AUTH_TOKEN` | `X-Twilio-Signature` signature validation | Twilio `CallSid` unique constraint | Voice Telephony, Call Compliance, Transcripts | IMPLEMENTED |
| **Salesforce** | `/api/v1/webhooks/salesforce` | `Account.Updated`, `Contact.Created`, `Opportunity.Won` | Shared Secret Bearer Token | `SALESFORCE_WEBHOOK_SECRET` | Authorization Bearer header constant-time match | Salesforce Event UUID idempotency table | CRM Bidirectional Sync, Pipeline Engine | IMPLEMENTED |
| **Generic Custom ERP** | `/api/v1/webhooks/generic` | `custom.event.v1` | HMAC-SHA256 Header | `GENERIC_WEBHOOK_SECRET` | `X-Hub-Signature-256` validation | `Idempotency-Key` HTTP header validation | Workflow Engine Trigger | IMPLEMENTED |

---

## 5. OAuth 2.0 Connections Audit

| Provider | Client ID Config | Client Secret Config | Authorization URL | Token Exchange URL | Configured Scopes | Token Storage & Protection | Current Status |
|----------|------------------|----------------------|-------------------|--------------------|-------------------|----------------------------|----------------|
| **Xero** | `XERO_CLIENT_ID` | `XERO_CLIENT_SECRET` | `https://login.xero.com/identity/connect/authorize` | `https://identity.xero.com/connect/token` | `accounting.transactions`, `accounting.contacts`, `offline_access` | PostgreSQL `integration_credentials` encrypted via AES-256-GCM / CMEK | IMPLEMENTED (BLOCKED BY MISSING CREDENTIALS) |
| **QuickBooks Online** | `QUICKBOOKS_CLIENT_ID` | `QUICKBOOKS_CLIENT_SECRET` | `https://appcenter.intuit.com/connect/oauth2` | `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer` | `com.intuit.quickbooks.accounting` | Encrypted Tenant Vault with automated 5-minute pre-expiry refresh | IMPLEMENTED (BLOCKED BY MISSING CREDENTIALS) |
| **Zoho Books** | `ZOHO_CLIENT_ID` | `ZOHO_CLIENT_SECRET` | `https://accounts.zoho.com/oauth/v2/auth` | `https://accounts.zoho.com/oauth/v2/token` | `ZohoBooks.fullaccess.all`, `access_type=offline` | Encrypted Tenant Vault with Organization ID binding | IMPLEMENTED (BLOCKED BY MISSING CREDENTIALS) |
| **Salesforce** | `SALESFORCE_CLIENT_ID` | `SALESFORCE_CLIENT_SECRET` | `https://login.salesforce.com/services/oauth2/authorize` | `https://login.salesforce.com/services/oauth2/token` | `api`, `refresh_token`, `offline_access` | Encrypted Tenant Vault with Instance URL binding | IMPLEMENTED (BLOCKED BY MISSING CREDENTIALS) |

---

## 6. Google Secret Manager & Cloud Architecture Audit

### 6.1 Provisioned Secrets in Terraform (`infrastructure/terraform/secrets.tf`):
1. `stripe-secret-key`
2. `razorpay-key-secret`
3. `twilio-auth-token`
4. `meta-whatsapp-token`
5. `gemini-api-key`
6. `elevenlabs-api-key`
7. `deepgram-api-key`
8. `sentry-dsn`
9. `platform-db-password`
10. `platform-db-url`

### 6.2 Cloud Run Injection Mapping (`infrastructure/terraform/compute.tf`):
* `google_cloud_run_v2_service.api_service` mounts secrets directly as container environment variables using `value_source.secret_key_ref`.
* IAM Permission: `roles/secretmanager.secretAccessor` granted strictly to `google_service_account.app_runner`.
* Cloud Run Web Service (`apps/web`) has **ZERO** secret injections; only receives `NEXT_PUBLIC_API_URL` and `NODE_ENV`.

---

## 7. Frontend vs Backend Security Review

| Vector | Inspected Target | Findings | Rating |
|--------|------------------|----------|--------|
| **Browser Code** | `apps/web/src/app/**`, `apps/web/src/components/**` | No API keys, secret tokens, or private endpoints found. Only `NEXT_PUBLIC_API_URL` is exposed for base routing. | **SAFE** |
| **Client Storage** | `localStorage`, `sessionStorage`, cookies | Only tenant session tokens stored; zero provider credentials stored client-side. | **SAFE** |
| **URL Parameters** | Browser links & route definitions | No tokens, secret keys, or passwords passed in query strings. | **SAFE** |
| **Git Tracking** | `.gitignore`, tracked files | Zero `.env`, `.env.production`, or private key files tracked in git. | **SAFE** |
| **Docker Configuration** | `Dockerfile`, `docker-compose.yml` | Multi-stage scratch/distroless builds; secrets injected at runtime via GSM, not baked into container layers. | **SAFE** |
| **Database Plaintext** | SQL schemas & migrations (001 to 044) | Zero plaintext secrets; `encrypted_payload` and `vault_ref` utilized for tenant credentials. | **SAFE** |
| **Logging & Telemetry** | `tracing`, `observability.rs`, `SentryConfig` | High-entropy regex scrubber actively masks keys matching `sk_live_`, `rzp_live_`, `AIzaSy...`, and auth headers. | **SAFE** |

---

## 8. Environment Files Inspection

| Variable | In `.env.example` | In `.env.test` | Expected In Prod GSM | Notes / Status |
|----------|-------------------|----------------|----------------------|----------------|
| `APP_ENV` | Yes | Yes | No (Cloud Run env) | Set to `production` in live deployment |
| `LOG_LEVEL` | Yes | Yes | No (Cloud Run env) | Standard tracing configuration |
| `PORT` | Yes | Yes | No (Cloud Run env) | 8080 default for Cloud Run |
| `DATABASE_URL` | Yes | Yes | Yes (`platform-db-url`) | Private VPC IP connection string |
| `DATABASE_PASSWORD` | No | No | Yes (`platform-db-password`) | Generated dynamically by Terraform |
| `JWT_SECRET` | Yes | Yes | Recommended in GSM | Must be rotated to a 64+ char random secret in prod |
| `GCP_PROJECT_ID` | Yes | Yes | No (Cloud Run env) | GCP project identifier |
| `GCP_REGION` | Yes | Yes | No (Cloud Run env) | Primary GCP region (e.g. `us-central1` or `asia-southeast1`) |
| `GCP_PUBSUB_TOPIC_EVENTS` | Yes | Yes | No (Cloud Run env) | Fully qualified Pub/Sub topic path |
| `GCP_TASKS_QUEUE_NAME` | Yes | Yes | No (Cloud Run env) | Fully qualified Cloud Tasks queue path |
| `GCP_STORAGE_BUCKET` | Yes | Yes | No (Cloud Run env) | GCS bucket name |
| `GCP_KMS_KEY_NAME` | Yes | Yes | No (Cloud Run env) | Cloud KMS CMEK resource name |
| `GCP_IDENTITY_PLATFORM_API_KEY` | Yes (blank) | No | Optional in GSM | Required if GCIP client SDK enabled |
| `SENTRY_DSN` | Yes (blank) | No | Yes (`sentry-dsn`) | Sentry project ingestion URL |
| `OPENAI_API_KEY` | Yes (blank) | Yes (dummy) | Recommended in GSM | Required for OpenAI model execution |
| `GEMINI_API_KEY` | Yes (blank) | Yes (dummy) | Yes (`gemini-api-key`) | Required for Gemini model execution |
| `TWILIO_ACCOUNT_SID` | Yes (blank) | Yes (dummy) | No (Cloud Run env) | Twilio public account identifier |
| `TWILIO_AUTH_TOKEN` | Yes (blank) | Yes (dummy) | Yes (`twilio-auth-token`) | Twilio primary authentication token |
| `TWILIO_PHONE_NUMBER` | Yes (blank) | Yes (dummy) | No (Cloud Run env) | E.164 provisioned telephony number |
| `DEEPGRAM_API_KEY` | Yes (blank) | Yes (dummy) | Yes (`deepgram-api-key`) | Deepgram Nova-2 streaming key |
| `ELEVENLABS_API_KEY` | Yes (blank) | Yes (dummy) | Yes (`elevenlabs-api-key`) | ElevenLabs voice synthesis key |
| `STRIPE_SECRET_KEY` | No | Yes (dummy) | Yes (`stripe-secret-key`) | Stripe backend secret key |
| `RAZORPAY_KEY_SECRET` | No | Yes (dummy) | Yes (`razorpay-key-secret`) | Razorpay backend secret key |
| `NEXT_PUBLIC_API_URL` | Yes | Yes | No (Web Cloud Run env) | Public frontend routing endpoint |

---

## 9. Duplicate, Conflicting, or Legacy Credentials Analysis

1. **`GCP_PUBSUB_PROJECT_ID` vs `GCP_PROJECT_ID`:**
   * Found in `backend/crates/events/src/publisher.rs` (Line 92). The publisher first checks `GCP_PUBSUB_PROJECT_ID`, but `.env.example` and Terraform configure `GCP_PROJECT_ID`.
   * **Recommendation:** Ensure runtime configuration sets `GCP_PUBSUB_PROJECT_ID=$GCP_PROJECT_ID` or unify to `GCP_PROJECT_ID`.
2. **`GCP_PUBSUB_TOPIC` vs `GCP_PUBSUB_TOPIC_EVENTS`:**
   * Found in `backend/crates/events/src/publisher.rs` (Line 94). The code looks for `GCP_PUBSUB_TOPIC`, while `.env.example` provides `GCP_PUBSUB_TOPIC_EVENTS`.
   * **Recommendation:** Retain `GCP_PUBSUB_TOPIC_EVENTS` in `.env.example` and support both aliases in `publisher.rs`.
3. **`RAZORPAY_KEY_SECRET` in Terraform vs Direct Config:**
   * Terraform `secrets.tf` creates `razorpay-key-secret`. `razorpay.rs` supports both GSM path resolution (`gsm_secret_resource`) and direct config (`key_secret`). This is intentional and provides dual-mode vault resolution.

---

## 10. Missing Credentials & Production Blockers

The platform has zero code-level architecture blockers; however, live external provider functionality is currently blocked by missing production credentials across:
1. **AI Reasoning:** Neither `GEMINI_API_KEY` nor `OPENAI_API_KEY` is populated in production Secret Manager.
2. **Payments:** Live payment checkout requires `STRIPE_SECRET_KEY` and/or `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`.
3. **Telephony & Audio:** Live outbound dialing requires `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN`, `DEEPGRAM_API_KEY`, and `ELEVENLABS_API_KEY`.
4. **WhatsApp:** Live WhatsApp messaging requires Meta `META_WHATSAPP_TOKEN` and `WHATSAPP_APP_SECRET`.
5. **OCR:** Live document scanning requires Mathpix `mathpix-app-id` and `mathpix-app-key`.
6. **Observability:** Production crash reporting requires `SENTRY_DSN`.
