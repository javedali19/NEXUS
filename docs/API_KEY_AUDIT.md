# API Key & Integration Security Audit

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Audit Type:** Read-Only Full-Project API Credential & Integration Verification  
**Date:** 2026-09-24  
**Classification:** STRICT AUDIT ONLY — ZERO SECRETS MODIFIED / ZERO PLAINTEXT SECRETS EXPOSED  

---

## 1. Executive Summary & Verification Methodology

A full recursive scan was performed across the entire repository to verify which credentials exist, where they are stored, which modules consume them, whether they connect to live working code, and which credentials are missing.

### Scan Scope:
* **Frontend:** `apps/web/src` (Next.js 15, React 19, TypeScript, client components, API routes)
* **Backend:** `backend/crates/*` (`api`, `worker`, `domain`, `integrations`, `events`, `db`, `common`)
* **Infrastructure:** `infrastructure/terraform/*.tf`, `Dockerfile`, `docker-compose.yml`
* **CI/CD:** `.github/workflows/ci.yml`, `.github/workflows/cd.yml`
* **Configuration:** `.env.example`, `.env.test`, `.env.local`

---

## 2. Master Verification Table

This table reflects the actual codebase verification of every external API and cloud service:

| # | API / Service | Required? | Implementation Exists? | Credential Required? | Credential Present? | Credential Location | Actually Used? | Connected Module | Status |
|---|---------------|-----------|------------------------|----------------------|---------------------|---------------------|----------------|------------------|--------|
| 1 | **Stripe** | YES | YES | YES | NO (Mock in test) | GSM / `.env.test` | YES | `integrations::providers::stripe`, `domain::sales_flow` | IMPLEMENTED BUT NOT CONFIGURED |
| 2 | **Razorpay** | YES | YES | YES | NO (Mock in test) | GSM / `.env.test` | YES | `integrations::payments::razorpay`, `domain::autonomous_collections` | IMPLEMENTED BUT NOT CONFIGURED |
| 3 | **HitPay** | YES | YES | YES | NO | `.env.example` | YES | `integrations::payments::hitpay`, `domain::country_pack` | IMPLEMENTED BUT NOT CONFIGURED |
| 4 | **Cashfree** | NO | YES | YES | NO | `.env.example` | YES | `integrations::payments::cashfree` | IMPLEMENTED BUT NOT CONFIGURED |
| 5 | **Airwallex** | NO | YES | YES | NO | `.env.example` | YES | `integrations::payments::airwallex` | IMPLEMENTED BUT NOT CONFIGURED |
| 6 | **DBS RAPID PayNow** | YES | YES | YES | NO | `.env.example` | YES | `integrations::regional_connectors`, `domain::country_pack` | IMPLEMENTED BUT NOT CONFIGURED |
| 7 | **Curlec DuitNow** | YES | YES | YES | NO | `.env.example` | YES | `integrations::regional_connectors`, `domain::country_pack` | IMPLEMENTED BUT NOT CONFIGURED |
| 8 | **Omise PromptPay** | YES | YES | YES | NO | `.env.example` | YES | `integrations::regional_connectors`, `domain::country_pack` | IMPLEMENTED BUT NOT CONFIGURED |
| 9 | **Meta WhatsApp Cloud API** | YES | YES | YES | NO (Mock in test) | GSM / `.env.test` | YES | `integrations::communications::whatsapp`, `domain::ai_whatsapp_agent` | IMPLEMENTED BUT NOT CONFIGURED |
| 10 | **Twilio Telephony** | YES | YES | YES | NO (Mock in test) | GSM / `.env.test` | YES | `integrations::providers::twilio`, `domain::voice_telephony` | IMPLEMENTED BUT NOT CONFIGURED |
| 11 | **Deepgram STT** | YES | YES | YES | NO (Mock in test) | GSM / `.env.test` | YES | `integrations::providers::deepgram`, `domain::voice_agent_integration` | IMPLEMENTED BUT NOT CONFIGURED |
| 12 | **ElevenLabs Voice AI** | YES | YES | YES | NO (Mock in test) | GSM / `.env.test` | YES | `integrations::providers::elevenlabs`, `domain::voice_agent_integration` | IMPLEMENTED BUT NOT CONFIGURED |
| 13 | **Google Gemini** | YES | YES | YES | NO (Mock in test) | GSM / `.env.test` | YES | `domain::ai_sales_agent`, `domain::ai_tool_gateway` | IMPLEMENTED BUT NOT CONFIGURED |
| 14 | **OpenAI** | YES | YES | YES | NO (Mock in test) | `.env.example`, `.env.test` | YES | `domain::ai_sales_agent`, `domain::ai_whatsapp_agent` | IMPLEMENTED BUT NOT CONFIGURED |
| 15 | **Anthropic** | NO | YES | YES | NO | `domain::ai_sales_agent` | NO | Fallback enum variant | CREDENTIAL PRESENT BUT NOT CONNECTED |
| 16 | **Mathpix OCR** | YES | YES | YES | NO (Mock in test) | GSM `mathpix-app-id` | YES | `integrations::ocr::mathpix`, `domain::ocr` | IMPLEMENTED BUT NOT CONFIGURED |
| 17 | **Google Cloud Vision** | YES | YES | NO (IAM) | YES (ADC/IAM) | GCP Service Account | YES | `domain::ocr`, `integrations::connector` | CONNECTED |
| 18 | **Xero Accounting** | YES | YES | YES | NO | `.env.example` | YES | `integrations::accounting::xero`, `domain::accounting` | IMPLEMENTED BUT NOT CONFIGURED |
| 19 | **QuickBooks Online** | YES | YES | YES | NO | `.env.example` | YES | `integrations::accounting::quickbooks`, `domain::accounting` | IMPLEMENTED BUT NOT CONFIGURED |
| 20 | **Zoho Books** | YES | YES | YES | NO | `.env.example` | YES | `integrations::accounting::zoho_books`, `domain::accounting` | IMPLEMENTED BUT NOT CONFIGURED |
| 21 | **Malaysia LHDN MyInvois** | YES | PARTIAL | YES | NO | `.env.example` | PARTIAL | `integrations::regional_connectors` | PARTIALLY IMPLEMENTED |
| 22 | **Thailand RD e-Tax** | YES | PARTIAL | YES | NO | `.env.example` | PARTIAL | `integrations::regional_connectors` | PARTIALLY IMPLEMENTED |
| 23 | **LINE Official Account** | NO | PARTIAL | YES | NO | `.env.example` | PARTIAL | `integrations::regional_connectors` | PARTIALLY IMPLEMENTED |
| 24 | **Salesforce CRM** | NO | YES | YES | NO | `.env.example` | YES | `integrations::providers::salesforce` | IMPLEMENTED BUT NOT CONFIGURED |
| 25 | **Sentry** | YES | YES | YES | NO (Blank in test) | GSM / `.env.example` | YES | `domain::observability` | IMPLEMENTED BUT NOT CONFIGURED |
| 26 | **OpenTelemetry** | YES | YES | NO (Endpoint) | YES | `.env.example`, `docker-compose.yml` | YES | `domain::observability` | CONNECTED |
| 27 | **Google Cloud Storage (GCS)** | YES | YES | NO (IAM) | YES | Terraform / IAM ADC | YES | `integrations::storage::gcs` | CONNECTED |
| 28 | **Google Cloud Pub/Sub** | YES | YES | NO (IAM) | YES | Terraform / IAM ADC | YES | `events::publisher::GcpPubSubPublisher` | CONNECTED |
| 29 | **Google Cloud Tasks** | YES | YES | NO (IAM) | YES | Terraform / IAM ADC | YES | `worker::cloud_tasks::CloudTasksClient` | CONNECTED |
| 30 | **Google Secret Manager (GSM)** | YES | YES | NO (IAM) | YES | Terraform / IAM ADC | YES | `integrations::auth::SecretManagerResolver` | CONNECTED |
| 31 | **Google Cloud KMS** | YES | YES | NO (IAM) | YES | Terraform / IAM ADC | YES | `infrastructure/terraform/main.tf` | CONNECTED |
| 32 | **Google Identity Platform (GCIP)** | YES | YES | YES | NO (Dev session mode) | `.env.example` | YES | `common::lib`, `api::auth` | IMPLEMENTED BUT NOT CONFIGURED |

---

## 3. List of Every API Key / Credential Expected or Configured

| # | Provider | Credential / Variable Name | Type | Exists in Repo? | Location Found | Consumed By | Business Purpose | Connection Status |
|---|----------|----------------------------|------|-----------------|----------------|-------------|------------------|-------------------|
| 1 | Stripe | `STRIPE_SECRET_KEY` | API Secret | Mock in test only | `.env.test`, GSM | `providers::stripe` | Credit card checkout & billing | IMPLEMENTED (AWAITING PROD KEY) |
| 2 | Stripe | `STRIPE_WEBHOOK_SECRET` | Webhook Secret | Expected | GSM / Vault | `providers::stripe` | HMAC payment confirmation | IMPLEMENTED (AWAITING PROD KEY) |
| 3 | Razorpay | `RAZORPAY_KEY_ID` | Public Key | Mock in test only | `.env.test`, `.env.example` | `payments::razorpay` | UPI orders & payment links | IMPLEMENTED (AWAITING PROD KEY) |
| 4 | Razorpay | `RAZORPAY_KEY_SECRET` | API Secret | Mock in test only | `.env.test`, GSM | `payments::razorpay` | Order signing & settlement | IMPLEMENTED (AWAITING PROD KEY) |
| 5 | Razorpay | `RAZORPAY_WEBHOOK_SECRET` | Webhook Secret | Expected | GSM / Vault | `payments::razorpay` | Webhook signature verification | IMPLEMENTED (AWAITING PROD KEY) |
| 6 | Meta WhatsApp | `META_WHATSAPP_TOKEN` | Bearer Token | Mock in test only | `.env.test`, GSM | `communications::whatsapp` | Send WhatsApp messages & HSM | IMPLEMENTED (AWAITING PROD KEY) |
| 7 | Meta WhatsApp | `WHATSAPP_APP_SECRET` | App Secret | Expected | GSM / Vault | `communications::whatsapp` | Webhook HMAC verification | IMPLEMENTED (AWAITING PROD KEY) |
| 8 | Meta WhatsApp | `WHATSAPP_VERIFY_TOKEN` | Token | Expected | GSM / Vault | `communications::whatsapp` | Webhook handshake challenge | IMPLEMENTED (AWAITING PROD KEY) |
| 9 | Twilio | `TWILIO_ACCOUNT_SID` | Account SID | Mock in test only | `.env.test`, `.env.example` | `providers::twilio` | Telephony API authentication | IMPLEMENTED (AWAITING PROD KEY) |
| 10 | Twilio | `TWILIO_AUTH_TOKEN` | Auth Token | Mock in test only | `.env.test`, GSM | `providers::twilio` | Call dispatch & SMS delivery | IMPLEMENTED (AWAITING PROD KEY) |
| 11 | Twilio | `TWILIO_PHONE_NUMBER` | Phone Number | Mock in test only | `.env.test`, `.env.example` | `providers::twilio` | Caller ID provisioning | IMPLEMENTED (AWAITING PROD KEY) |
| 12 | Deepgram | `DEEPGRAM_API_KEY` | API Key | Mock in test only | `.env.test`, GSM | `providers::deepgram` | Nova-2 audio transcription | IMPLEMENTED (AWAITING PROD KEY) |
| 13 | ElevenLabs | `ELEVENLABS_API_KEY` | API Key | Mock in test only | `.env.test`, GSM | `providers::elevenlabs` | Turbo v2.5 voice synthesis | IMPLEMENTED (AWAITING PROD KEY) |
| 14 | ElevenLabs | `ELEVENLABS_VOICE_ID` | Resource ID | Preset configured | `.env.example` | `providers::elevenlabs` | Voice character selection | CONFIGURED & CONNECTED |
| 15 | ElevenLabs | `ELEVENLABS_MODEL_ID` | Model ID | Preset configured | `.env.example` | `providers::elevenlabs` | TTS model engine | CONFIGURED & CONNECTED |
| 16 | Google Gemini | `GEMINI_API_KEY` | API Key | Mock in test only | `.env.test`, GSM | `domain::ai_sales_agent` | Sales agent LLM reasoning | IMPLEMENTED (AWAITING PROD KEY) |
| 17 | OpenAI | `OPENAI_API_KEY` | API Key | Mock in test only | `.env.test`, `.env.example` | `domain::ai_sales_agent` | GPT-4o reasoning fallback | IMPLEMENTED (AWAITING PROD KEY) |
| 18 | Anthropic | `ANTHROPIC_API_KEY` | API Key | Blank in example | `.env.example` | `domain::ai_sales_agent` | Claude 3.5 Sonnet fallback | CONFIGURED BUT UNUSED |
| 19 | Mathpix | `mathpix-app-id` | App ID | Expected in GSM | GSM resource path | `ocr::mathpix` | Accounts Payable OCR parsing | IMPLEMENTED (AWAITING PROD KEY) |
| 20 | Mathpix | `mathpix-app-key` | App Key | Expected in GSM | GSM resource path | `ocr::mathpix` | Mathpix API authentication | IMPLEMENTED (AWAITING PROD KEY) |
| 21 | Sentry | `SENTRY_DSN` | DSN | Blank | `.env.example`, GSM | `domain::observability` | Exception & trace ingestion | IMPLEMENTED (AWAITING PROD KEY) |
| 22 | OpenTelemetry | `OTEL_EXPORTER_OTLP_ENDPOINT` | URL | Present | `.env.example`, `.env.test` | `domain::observability` | Distributed tracing export | CONFIGURED & CONNECTED |
| 23 | Xero | `XERO_CLIENT_ID` | Client ID | Blank | `.env.example` | `accounting::xero` | OAuth 2.0 PKCE handshake | IMPLEMENTED (AWAITING PROD KEY) |
| 24 | Xero | `XERO_CLIENT_SECRET` | Client Secret | Expected | GSM / Vault | `accounting::xero` | OAuth token exchange | IMPLEMENTED (AWAITING PROD KEY) |
| 25 | QuickBooks | `QUICKBOOKS_CLIENT_ID` | Client ID | Blank | `.env.example` | `accounting::quickbooks` | Intuit OAuth 2.0 handshake | IMPLEMENTED (AWAITING PROD KEY) |
| 26 | QuickBooks | `QUICKBOOKS_CLIENT_SECRET` | Client Secret | Expected | GSM / Vault | `accounting::quickbooks` | Intuit token refresh | IMPLEMENTED (AWAITING PROD KEY) |
| 27 | Zoho Books | `ZOHO_CLIENT_ID` | Client ID | Blank | `.env.example` | `accounting::zoho_books` | Zoho Accounts OAuth | IMPLEMENTED (AWAITING PROD KEY) |
| 28 | Zoho Books | `ZOHO_CLIENT_SECRET` | Client Secret | Expected | GSM / Vault | `accounting::zoho_books` | Zoho token refresh | IMPLEMENTED (AWAITING PROD KEY) |
| 29 | Google Cloud | `GCP_PROJECT_ID` | Project ID | Present | `.env.example`, `.env.test` | All GCP clients | Cloud resource scoping | CONFIGURED & CONNECTED |
| 30 | Google Cloud | `GCP_REGION` | Region | Present | `.env.example`, `.env.test` | Cloud Run, Tasks, SQL | Region locality routing | CONFIGURED & CONNECTED |
| 31 | Cloud Pub/Sub | `GCP_PUBSUB_TOPIC_EVENTS` | Topic URI | Present | `.env.example`, `.env.test` | `events::publisher` | Domain event dispatch | CONFIGURED & CONNECTED |
| 32 | Cloud Tasks | `GCP_TASKS_QUEUE_NAME` | Queue URI | Present | `.env.example`, `.env.test` | `worker::cloud_tasks` | Async task queueing | CONFIGURED & CONNECTED |
| 33 | Cloud Storage | `GCP_STORAGE_BUCKET` | Bucket Name | Present | `.env.example`, `.env.test` | `storage::gcs` | Encrypted asset bucket | CONFIGURED & CONNECTED |
| 34 | Cloud KMS | `GCP_KMS_KEY_NAME` | Key URI | Present | `.env.example`, `.env.test` | Terraform CMEK | Database & bucket encryption | CONFIGURED & CONNECTED |
| 35 | Identity Platform | `GCP_IDENTITY_PLATFORM_API_KEY` | Web API Key | Blank | `.env.example` | `common::lib`, `api::auth` | Cloud multi-tenant JWT auth | IMPLEMENTED (AWAITING PROD KEY) |

---

## 4. Environment Variable Consistency Audit

Comparing `.env.example`, `.env.test`, `docker-compose.yml`, `infrastructure/terraform/*.tf`, and Rust code references:

1. **Production Secrets are Completely Omitted from Repo:**
   * No production secrets exist in `.env*` or source code files.
   * `.env.example` provides explicit variable keys with empty string values.
   * `.env.test` uses synthetic mock values (e.g. `test-jwt-secret-key...`, `test-project`).
2. **Variable Discrepancies & Aliases Detected:**
   * `events/src/publisher.rs` (Lines 92-94) inspects `GCP_PUBSUB_PROJECT_ID` and `GCP_PUBSUB_TOPIC`.
   * `.env.example` and Terraform specify `GCP_PROJECT_ID` and `GCP_PUBSUB_TOPIC_EVENTS`.
   * *Resolution:* Runtime fallback in `publisher.rs` defaults smoothly, but standardizing on `GCP_PUBSUB_TOPIC_EVENTS` is recommended.
3. **Database Secrets:**
   * In local development, `docker-compose.yml` provisions PostgreSQL with user `postgres` and password `postgrespassword`.
   * In production Terraform (`infrastructure/terraform/secrets.tf`), `random_password.sql_db_password` generates a 32-character high-entropy secret, stored as `platform-db-password` in Secret Manager and injected securely into Cloud Run.

---

## 5. Frontend Exposure Check

Every variable in `apps/web` was analyzed for frontend exposure vectors (`NEXT_PUBLIC_*`, `VITE_*`, `REACT_APP_*`):

* **Variables Found in Web Bundle:** Exactly **ONE** frontend environment variable exists:
  * `NEXT_PUBLIC_API_URL` (points to `http://localhost:8080/api/v1` in dev or Cloud Run API URI in prod).
* **Zero Secret Exposure:**
  * No `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `TWILIO_AUTH_TOKEN`, or `GEMINI_API_KEY` are prefixed with `NEXT_PUBLIC_`.
  * The frontend Next.js app communicates strictly via server-side API proxy routes or direct requests to Axum API Gateway using tenant JWT session tokens.
* **Rating:** **`SAFE`** (Zero client-side credential exposure).

---

## 6. Google Secret Manager Mapping

In production Google Cloud Run (`infrastructure/terraform/compute.tf`), secrets are mounted into container memory via `value_source.secret_key_ref`:

```text
Google Secret Manager                          Cloud Run Container (backend-api)
─────────────────────────────────────────────────────────────────────────────────
projects/{id}/secrets/{env}-stripe-secret-key    ──>  STRIPE_SECRET_KEY
projects/{id}/secrets/{env}-razorpay-key-secret  ──>  RAZORPAY_KEY_SECRET
projects/{id}/secrets/{env}-twilio-auth-token    ──>  TWILIO_AUTH_TOKEN
projects/{id}/secrets/{env}-meta-whatsapp-token  ──>  META_WHATSAPP_TOKEN
projects/{id}/secrets/{env}-gemini-api-key       ──>  GEMINI_API_KEY
projects/{id}/secrets/{env}-elevenlabs-api-key   ──>  ELEVENLABS_API_KEY
projects/{id}/secrets/{env}-deepgram-api-key     ──>  DEEPGRAM_API_KEY
projects/{id}/secrets/{env}-sentry-dsn           ──>  SENTRY_DSN
projects/{id}/secrets/{env}-platform-db-password ──>  DATABASE_PASSWORD
```

Access is restricted via IAM: `roles/secretmanager.secretAccessor` is granted exclusively to the Cloud Run runtime service account (`app_runner`).

---

## 7. Webhook Credentials & Handshake Verification

| Provider | Webhook Ingestion Route | Verification Credential | Signature Algorithm | Handler Implemented? | Business Event Emitted |
|----------|-------------------------|-------------------------|---------------------|----------------------|------------------------|
| **Meta WhatsApp** | `/api/v1/webhooks/whatsapp` | `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | HMAC-SHA256 (`sha256=...`) + GET Hub Challenge | YES (`communications/whatsapp.rs`) | `whatsapp.message_received.v1` |
| **Stripe** | `/api/v1/webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` | HMAC-SHA256 (`t=...,v1=...`) | YES (`providers/stripe.rs`) | `payment.succeeded.v1` |
| **Razorpay** | `/api/v1/webhooks/razorpay` | `RAZORPAY_WEBHOOK_SECRET` | HMAC-SHA256 (`X-Razorpay-Signature`) | YES (`payments/razorpay.rs`) | `payment.captured.v1` |
| **Twilio** | `/api/v1/webhooks/twilio` | `TWILIO_AUTH_TOKEN` | HMAC-SHA1 URL/Param Signing | YES (`providers/twilio.rs`) | `voice.call_completed.v1` |
| **Salesforce** | `/api/v1/webhooks/salesforce` | `SALESFORCE_WEBHOOK_SECRET` | Bearer Token Validation | YES (`providers/salesforce.rs`) | `crm.entity_synced.v1` |

---

## 8. OAuth 2.0 Credentials Audit

| Provider | Client ID Config | Client Secret Config | Scopes Configured | Token Storage Model | Status |
|----------|------------------|----------------------|-------------------|---------------------|--------|
| **Xero** | `XERO_CLIENT_ID` | `XERO_CLIENT_SECRET` | `accounting.transactions`, `accounting.contacts`, `offline_access` | Encrypted Tenant Vault | Awaiting Client Credentials |
| **QuickBooks** | `QUICKBOOKS_CLIENT_ID` | `QUICKBOOKS_CLIENT_SECRET` | `com.intuit.quickbooks.accounting` | Encrypted Tenant Vault | Awaiting Client Credentials |
| **Zoho Books** | `ZOHO_CLIENT_ID` | `ZOHO_CLIENT_SECRET` | `ZohoBooks.fullaccess.all` | Encrypted Tenant Vault | Awaiting Client Credentials |
| **Salesforce** | `SALESFORCE_CLIENT_ID` | `SALESFORCE_CLIENT_SECRET` | `api`, `refresh_token`, `offline_access` | Encrypted Tenant Vault | Awaiting Client Credentials |
