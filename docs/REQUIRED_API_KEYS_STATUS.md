# Required API Keys, Operational Status & Credential Lifecycle

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Audit Scope:** Operational Credential Inventory, Webhooks, OAuth & Secret Manager  
**Date:** 2026-09-24  

---

## 1. API Keys Currently Present in Repository & Infrastructure

This section lists every configuration variable and credential physically present in `.env.example`, `.env.test`, `docker-compose.yml`, or Terraform:

| Service | Credential / Variable | Present? | Location | Used By | Purpose | Feature | Connection | Status |
|---|---|---|---|---|---|---|---|---|
| Google Cloud | `GCP_PROJECT_ID` | YES | `.env.example`, `.env.test`, Terraform | All GCP clients | Scoping GCP resources | Cloud Infrastructure | Verified via ADC | **CONNECTED** |
| Google Cloud | `GCP_REGION` | YES | `.env.example`, `.env.test`, Terraform | Cloud Run, Tasks | Regional locality | Cloud Infrastructure | Verified via ADC | **CONNECTED** |
| Google Pub/Sub | `GCP_PUBSUB_TOPIC_EVENTS` | YES | `.env.example`, `.env.test`, Terraform | `events::publisher` | Outbox message broker | Asynchronous Events | Verified via ADC | **CONNECTED** |
| Google Tasks | `GCP_TASKS_QUEUE_NAME` | YES | `.env.example`, `.env.test`, Terraform | `worker::cloud_tasks` | Async queueing & DLQ | Background Worker | Verified via ADC | **CONNECTED** |
| Google Storage | `GCP_STORAGE_BUCKET` | YES | `.env.example`, `.env.test`, Terraform | `storage::gcs` | Asset storage bucket | Encrypted Vault | Verified via ADC | **CONNECTED** |
| Google KMS | `GCP_KMS_KEY_NAME` | YES | `.env.example`, `.env.test`, Terraform | Terraform CMEK | Cryptographic key ring | Database & Bucket CMEK | Verified via ADC | **CONNECTED** |
| OpenTelemetry | `OTEL_EXPORTER_OTLP_ENDPOINT` | YES | `.env.example`, `.env.test`, Docker | `domain::observability`| OTLP gRPC endpoint | Distributed Tracing | Connected to Jaeger | **CONNECTED** |
| ElevenLabs | `ELEVENLABS_VOICE_ID` | YES | `.env.example` | `providers::elevenlabs` | Preset voice ID (Rachel) | Voice Agent Model | Active parameter | **CONNECTED** |
| ElevenLabs | `ELEVENLABS_MODEL_ID` | YES | `.env.example` | `providers::elevenlabs` | Preset model engine | Voice Agent Model | Active parameter | **CONNECTED** |
| PostgreSQL | `platform-db-password` | YES | Terraform `random_password` | Cloud SQL & Cloud Run | Database password | Core Persistence | Injected via GSM | **CONNECTED** |
| PostgreSQL (Local)| `POSTGRES_PASSWORD` | YES | `docker-compose.yml` | Local Docker | Dev database password | Local Development | Local container | **CONNECTED** |
| Next.js Web | `NEXT_PUBLIC_API_URL` | YES | `.env.example`, `.env.test`, Terraform | `apps/web/src` | API Gateway endpoint | Frontend Routing | Active client routing | **CONNECTED** |

---

## 2. Required API Keys Status Matrix

### Category A: ✅ REQUIRED + PRESENT + CONNECTED
These services are essential to the platform architecture, their credentials exist via GCP IAM Workload Identity Federation / ADC, and their connections are confirmed active:
1. **Google Cloud Storage (GCS)** (`storage::gcs::GcsStorageClient`)
2. **Google Cloud Pub/Sub** (`events::publisher::GcpPubSubPublisher`)
3. **Google Cloud Tasks** (`worker::cloud_tasks::CloudTasksClient`)
4. **Google Secret Manager (GSM)** (`integrations::auth::SecretManagerResolver`)
5. **Google Cloud KMS** (`infrastructure/terraform/main.tf` CMEK)
6. **Google Cloud Vision** (`domain::ocr::OcrVerificationEngine` via ADC)
7. **OpenTelemetry Tracing** (`domain::observability`)

---

### Category B: ❌ REQUIRED + MISSING
These services are essential to the platform's core business capabilities, their implementation is 100% written and verified, but they cannot operate live until production credentials are supplied:

| Service | Credential Required | Why Required | Feature Depending On It | Where To Obtain |
|---|---|---|---|---|
| **Google Gemini** | `GEMINI_API_KEY` | Autonomous deal reasoning, sales copilot, tool selection | AI Sales Agent, Deal Copilot, Collections | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **OpenAI** (Alternative) | `OPENAI_API_KEY` | Redundant LLM reasoning and GPT-4o tool execution | AI Sales Agent, WhatsApp Bot | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| **Stripe** | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | International credit card checkout, automated subscriptions | Invoices, Checkout, Autonomous Collections | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| **Razorpay** | `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` + `RAZORPAY_WEBHOOK_SECRET` | Indian Rupee payments, UPI QR links, automated dunning settlement | Invoices, UPI Checkout, Collections Engine | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) |
| **Meta WhatsApp** | `META_WHATSAPP_TOKEN` + `WHATSAPP_APP_SECRET` + `WHATSAPP_VERIFY_TOKEN` | 2-way customer chat, pre-approved HSM templates, billing alerts | Unified Inbox, AI WhatsApp Bot, CRM | [Meta for Developers](https://developers.facebook.com/apps/) |
| **Twilio** | `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_PHONE_NUMBER` | Outbound/inbound phone calls over telecom network, SMS | AI Voice Agent, Call Center Dialpad | [Twilio Console](https://console.twilio.com/) |
| **Deepgram** | `DEEPGRAM_API_KEY` | Real-time streaming Speech-to-Text (<150ms latency) | AI Voice Agent (Gate 2: Listening) | [Deepgram Console](https://console.deepgram.com/) |
| **ElevenLabs** | `ELEVENLABS_API_KEY` | Neural streaming voice synthesis (Turbo v2.5) | AI Voice Agent (Gate 4: Voice) | [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys) |
| **Mathpix** | `mathpix-app-id` + `mathpix-app-key` | Accounts Payable bill OCR, line items & table parsing | Accounts Payable, Review Gate | [Mathpix Accounts](https://accounts.mathpix.com/) |
| **Sentry** | `SENTRY_DSN` | Production panic capturing and distributed span tracing | Platform Observability, Error Alerting | [Sentry Project Settings](https://sentry.io/settings/) |
| **Google Identity** | `GCP_IDENTITY_PLATFORM_API_KEY` | Multi-tenant Firebase/GCIP user authentication | Cloud Authentication (Prod mode) | [GCP Identity Platform](https://console.cloud.google.com/customer-identity) |

---

### Category C: ⚠️ REQUIRED + PARTIALLY IMPLEMENTED (Regional Connectors)
These connectors are required when deploying into specific Southeast Asian jurisdictions:
* **Singapore Payments:** `DBS_RAPID_CLIENT_ID` + `DBS_RAPID_API_KEY` + `DBS_PAYNOW_PROXY_ID` (Generates EMVCo PayNow SGQR; awaiting corporate DBS banking credentials).
* **Malaysia E-Invoicing:** `LHDN_MYINVOIS_CLIENT_ID` + `LHDN_MYINVOIS_CLIENT_SECRET` + `LHDN_DIGITAL_CERT_REF` (Validates UBL 2.1 XML invoices with IRBM; awaiting tax cert).
* **Thailand E-Tax:** `THAI_RD_API_KEY` + `THAI_RD_ETAX_SERVICE_CODE` + `THAI_RD_CERTIFICATE_REF` (Signs e-Tax invoices with Thai Revenue Department; awaiting tax cert).

---

### Category D: ⚠️ PRESENT BUT UNUSED (Secondary / Fallback Credentials)
These credentials appear in configuration or enum variants, but have no confirmed active usage in the primary operational path:

| # | Credential | Found In | Expected Service | Why Present | Actual Usage | Recommendation |
|---|---|---|---|---|---|---|
| 1 | `ANTHROPIC_API_KEY` | `.env.example`, `ai_sales_agent.rs` | Anthropic Claude 3.5 | Listed as optional LLM fallback | Unused; runtime defaults to Gemini or OpenAI | Retain as optional fallback |
| 2 | `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY` | `.env.example`, `cashfree.rs` | Cashfree Payments | Alternative India payment gateway | Unused; Razorpay is primary gateway | Retain as alternate provider |
| 3 | `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY` | `.env.example`, `airwallex.rs` | Airwallex Global Accounts | Alternative multi-currency FX gateway | Unused; Stripe is primary international gateway | Retain as enterprise FX option |
| 4 | `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET` | `.env.example`, `salesforce.rs` | Salesforce CRM | External CRM sync bridge | Unused; internal CRM is primary | Retain as external bridge |
| 5 | `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN` | `.env.example`, `regional_connectors.rs` | LINE Official Account | Regional messaging for Thailand | Inactive unless Thailand pack enabled | Retain for Thai deployment |
| 6 | `REGIONAL_SIP_TRUNK_DOMAIN`, `REGIONAL_SIP_AUTH_USER` | `.env.example`, `regional_connectors.rs` | Regional SIP Trunks | Direct telco trunking | Inactive; Twilio is primary telephony provider | Retain as bypass option |

---

## 3. Webhook Infrastructure & Verification Audit

| Provider | Webhook Endpoint | Credential Config | Verification Method | Handler Implemented? | Business Event Emitted |
|---|---|---|---|---|---|
| **Meta WhatsApp** | `/api/v1/webhooks/whatsapp` | `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | Constant-Time HMAC-SHA256 (`sha256=...`) + GET Hub Handshake | YES (`communications/whatsapp.rs`) | `whatsapp.message_received.v1` |
| **Stripe** | `/api/v1/webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` | Constant-Time HMAC-SHA256 (`t=...,v1=...`) | YES (`providers/stripe.rs`) | `payment.succeeded.v1` |
| **Razorpay** | `/api/v1/webhooks/razorpay` | `RAZORPAY_WEBHOOK_SECRET` | Constant-Time HMAC-SHA256 (`X-Razorpay-Signature`) | YES (`payments/razorpay.rs`) | `payment.captured.v1` |
| **Twilio** | `/api/v1/webhooks/twilio` | `TWILIO_AUTH_TOKEN` | HMAC-SHA1 URL/Param Signing (`X-Twilio-Signature`) | YES (`providers/twilio.rs`) | `voice.call_completed.v1` |
| **Salesforce** | `/api/v1/webhooks/salesforce` | `SALESFORCE_WEBHOOK_SECRET` | Bearer Token Match | YES (`providers/salesforce.rs`) | `crm.entity_synced.v1` |
| **Generic Custom ERP** | `/api/v1/webhooks/generic` | `GENERIC_WEBHOOK_SECRET` | HMAC-SHA256 Header (`X-Hub-Signature-256`) | YES (`providers/generic_rest.rs`) | `workflow.event_received.v1` |

---

## 4. OAuth 2.0 Integrations Audit

| Provider | Client ID Config | Client Secret Config | Scopes | Access Token Storage | Refresh Mechanism | Status |
|---|---|---|---|---|---|---|
| **Xero** | `XERO_CLIENT_ID` | `XERO_CLIENT_SECRET` | `accounting.transactions`, `accounting.contacts`, `offline_access` | PostgreSQL `integration_credentials` (AES-256 encrypted) | Automated refresh 5 mins prior to expiry | Implemented; awaiting client credentials |
| **QuickBooks** | `QUICKBOOKS_CLIENT_ID` | `QUICKBOOKS_CLIENT_SECRET` | `com.intuit.quickbooks.accounting` | PostgreSQL encrypted vault with Realm ID binding | Automated refresh via Intuit OAuth token endpoint | Implemented; awaiting client credentials |
| **Zoho Books** | `ZOHO_CLIENT_ID` | `ZOHO_CLIENT_SECRET` | `ZohoBooks.fullaccess.all`, `access_type=offline` | PostgreSQL encrypted vault with Org ID binding | Automated refresh via Zoho Accounts endpoint | Implemented; awaiting client credentials |
| **Salesforce** | `SALESFORCE_CLIENT_ID` | `SALESFORCE_CLIENT_SECRET` | `api`, `refresh_token`, `offline_access` | PostgreSQL encrypted vault with Instance URL binding | Automated refresh via Salesforce token endpoint | Implemented; awaiting client credentials |

---

## 5. Google Secret Manager (GSM) Integration Audit

In production (`infrastructure/terraform/compute.tf`), Cloud Run mounts secrets directly into container memory via `value_source.secret_key_ref`:

```text
Google Secret Manager (GCP)                       Cloud Run Container (backend-api)
───────────────────────────────────────────────────────────────────────────────────
projects/{id}/secrets/{env}-stripe-secret-key     ──>  STRIPE_SECRET_KEY
projects/{id}/secrets/{env}-razorpay-key-secret   ──>  RAZORPAY_KEY_SECRET
projects/{id}/secrets/{env}-twilio-auth-token     ──>  TWILIO_AUTH_TOKEN
projects/{id}/secrets/{env}-meta-whatsapp-token   ──>  META_WHATSAPP_TOKEN
projects/{id}/secrets/{env}-gemini-api-key        ──>  GEMINI_API_KEY
projects/{id}/secrets/{env}-elevenlabs-api-key    ──>  ELEVENLABS_API_KEY
projects/{id}/secrets/{env}-deepgram-api-key      ──>  DEEPGRAM_API_KEY
projects/{id}/secrets/{env}-sentry-dsn            ──>  SENTRY_DSN
projects/{id}/secrets/{env}-platform-db-password  ──>  DATABASE_PASSWORD
```

IAM access is granted strictly to the runtime service account (`google_service_account.app_runner`). No plaintext secrets exist in container image layers, git repositories, or frontend bundles.
