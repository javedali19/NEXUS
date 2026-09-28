# Missing API Keys & Production Prerequisites

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Audit Type:** Missing Credentials & Operational Acquisition Guide  
**Date:** 2026-09-24  

---

## 1. Feature-by-Feature Credential Requirement Check

For every implemented business feature, here is the breakdown of external credentials required versus what is present in production:

### Feature: Autonomous AI Sales Agent & Copilot
* **Required Credentials:** `GEMINI_API_KEY` or `OPENAI_API_KEY`
* **Found in Prod GSM:** Neither
* **Result:** ❌ Feature is **NOT operational in production** (Agent remains disabled by design until validated).

### Feature: Omnichannel Meta WhatsApp Unified Inbox
* **Required Credentials:** `META_WHATSAPP_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`
* **Found in Prod GSM:** `meta-whatsapp-token` provisioned in Terraform but awaiting secret value injection.
* **Result:** ❌ Feature is **NOT operational in production** (Awaiting Meta system user token).

### Feature: Autonomous Voice Agent (Inbound/Outbound PSTN Calls)
* **Required Credentials:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `DEEPGRAM_API_KEY`, `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`
* **Found in Prod GSM:** Secret placeholders exist in Terraform; awaiting secret value population.
* **Result:** ❌ Feature is **NOT operational in production** (Runs in development text simulation mode).

### Feature: Online Payments & Autonomous Dunning Collections
* **Required Credentials:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (Global) and/or `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (India)
* **Found in Prod GSM:** Secret placeholders exist in Terraform; awaiting secret value population.
* **Result:** ❌ Live credit card and UPI charges are **NOT operational in production**.

### Feature: Accounts Payable Bill OCR Verification
* **Required Credentials:** `mathpix-app-id`, `mathpix-app-key`
* **Found in Prod GSM:** Secret references exist; awaiting secret value population.
* **Result:** ❌ Mathpix live OCR is **NOT operational in production** (Google Cloud Vision handles general OCR via ADC).

### Feature: Multi-Entity Cloud Accounting Sync
* **Required Credentials:** `XERO_CLIENT_ID` + `XERO_CLIENT_SECRET`, or `QUICKBOOKS_CLIENT_ID` + `QUICKBOOKS_CLIENT_SECRET`
* **Found in Prod GSM:** Not yet populated.
* **Result:** ❌ External GL sync is **NOT operational** (Internal PostgreSQL general ledger operates independently).

### Feature: Production Crash & Latency Observability
* **Required Credentials:** `SENTRY_DSN`
* **Found in Prod GSM:** `sentry-dsn` provisioned in Terraform; awaiting DSN string.
* **Result:** ❌ Sentry telemetry is **NOT active** (Local tracing logs via OpenTelemetry/Jaeger).

---

## 2. Required API Keys — Missing Report

This table includes **only credentials genuinely required by implemented features** to go live:

| # | Service | Required Credential | Why Required | Used By | Current Status | Where To Obtain |
|---|---------|---------------------|--------------|---------|----------------|-----------------|
| 1 | **Google Gemini** | `GEMINI_API_KEY` | Powers sales agent reasoning, deal qualification, autonomous collections | `domain::ai_sales_agent` | Awaiting Secret Value | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| 2 | **OpenAI** (Alternative) | `OPENAI_API_KEY` | Fallback model provider (GPT-4o) | `domain::ai_sales_agent` | Awaiting Secret Value | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| 3 | **Stripe** | `STRIPE_SECRET_KEY` | Customer card checkout, invoice payment links, subscription billing | `integrations::providers::stripe` | Awaiting Secret Value | [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys) |
| 4 | **Stripe** | `STRIPE_WEBHOOK_SECRET` | Cryptographic HMAC-SHA256 signature verification for payment events | `integrations::providers::stripe` | Awaiting Secret Value | [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) |
| 5 | **Razorpay** | `RAZORPAY_KEY_ID` | India UPI QR, Netbanking, instant payment links | `integrations::payments::razorpay` | Awaiting Secret Value | [Razorpay Dashboard → API Keys](https://dashboard.razorpay.com/app/keys) |
| 6 | **Razorpay** | `RAZORPAY_KEY_SECRET` | Backend payment capture, refund processing, order signing | `integrations::payments::razorpay` | Awaiting Secret Value | [Razorpay Dashboard → API Keys](https://dashboard.razorpay.com/app/keys) |
| 7 | **Meta WhatsApp** | `META_WHATSAPP_TOKEN` | Dispatches outbound WhatsApp messages and pre-approved HSM templates | `integrations::communications::whatsapp` | Awaiting Secret Value | [Meta for Developers → WhatsApp](https://developers.facebook.com/apps/) |
| 8 | **Meta WhatsApp** | `WHATSAPP_APP_SECRET` | Webhook payload integrity validation (HMAC-SHA256) | `integrations::communications::whatsapp` | Awaiting Secret Value | [Meta App Dashboard → Settings → Basic](https://developers.facebook.com/apps/) |
| 9 | **Meta WhatsApp** | `WHATSAPP_VERIFY_TOKEN` | Validates initial GET challenge handshake from Meta Graph webhook | `integrations::communications::whatsapp` | Awaiting Secret Value | Defined by operator in Meta Webhook config |
| 10 | **Twilio** | `TWILIO_ACCOUNT_SID` | Core authentication for Twilio REST API and Voice SDK | `integrations::providers::twilio` | Awaiting Secret Value | [Twilio Console](https://console.twilio.com/) |
| 11 | **Twilio** | `TWILIO_AUTH_TOKEN` | Outbound call authorization and webhook signature validation | `integrations::providers::twilio` | Awaiting Secret Value | [Twilio Console](https://console.twilio.com/) |
| 12 | **Twilio** | `TWILIO_PHONE_NUMBER` | E.164 Caller ID for PSTN voice calls and SMS | `integrations::providers::twilio` | Awaiting Secret Value | [Twilio Phone Numbers](https://console.twilio.com/develop/phone-numbers/manage/incoming) |
| 13 | **Deepgram** | `DEEPGRAM_API_KEY` | Ultra-low latency streaming Speech-to-Text (`nova-2`) | `integrations::providers::deepgram` | Awaiting Secret Value | [Deepgram Console](https://console.deepgram.com/) |
| 14 | **ElevenLabs** | `ELEVENLABS_API_KEY` | Neural streaming text-to-speech voice synthesis (`turbo_v2_5`) | `integrations::providers::elevenlabs` | Awaiting Secret Value | [ElevenLabs API Keys](https://elevenlabs.io/app/settings/api-keys) |
| 15 | **Mathpix** | `mathpix-app-id` | Accounts Payable invoice parsing and line-item table OCR | `integrations::ocr::mathpix` | Awaiting Secret Value | [Mathpix Accounts](https://accounts.mathpix.com/) |
| 16 | **Mathpix** | `mathpix-app-key` | Mathpix OCR API key authentication | `integrations::ocr::mathpix` | Awaiting Secret Value | [Mathpix Accounts](https://accounts.mathpix.com/) |
| 17 | **Sentry** | `SENTRY_DSN` | Server-side panic capture and client frontend crash reporting | `domain::observability` | Awaiting Secret Value | [Sentry Project Settings](https://sentry.io/settings/) |
| 18 | **Google Identity Platform** | `GCP_IDENTITY_PLATFORM_API_KEY` | Web API Key for multi-tenant Firebase/GCIP cloud authentication | `common::lib`, `api::auth` | Awaiting Secret Value | [GCP Identity Platform](https://console.cloud.google.com/customer-identity) |

---

## 3. Present But Unused / Secondary Fallback Credentials

These credentials are referenced in the codebase or environment files, but are not actively connected to a primary operational feature:

| # | Service | Credential | Found At | Expected Usage | Actually Used? | Relevant Code |
|---|---------|------------|----------|----------------|----------------|---------------|
| 1 | **Anthropic** | `ANTHROPIC_API_KEY` | `.env.example`, `domain::ai_sales_agent` | Alternative LLM fallback (`claude-3-5-sonnet`) | NO | `AiProvider::Anthropic` exists as enum variant, but default model resolution routes to Gemini or OpenAI. |
| 2 | **Cashfree** | `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY` | `.env.example`, `integrations::payments::cashfree` | India UPI Auto-Pay alternative | NO | Razorpay is the primary active payment gateway for India; Cashfree adapter is implemented as an alternate provider. |
| 3 | **Airwallex** | `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY` | `.env.example`, `integrations::payments::airwallex` | Global cross-border FX virtual accounts | NO | Stripe handles primary international card processing; Airwallex is available for enterprise FX accounts. |
| 4 | **Salesforce** | `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET` | `.env.example`, `integrations::providers::salesforce` | External CRM pipeline synchronization | NO | The platform has its own internal CRM; Salesforce adapter is available as an optional external sync bridge. |
| 5 | **LINE** | `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN` | `.env.example`, `integrations::regional_connectors` | Thailand messaging channel | NO | Optional regional connector for Thailand; inactive unless specifically enabled in Country Pack. |
| 6 | **Regional Carriers** | `REGIONAL_SIP_TRUNK_DOMAIN`, `REGIONAL_SIP_AUTH_USER` | `.env.example`, `integrations::regional_connectors` | Regional SIP Trunks (Singtel, Maxis, AIS) | NO | Direct carrier trunking fallback when Twilio is not used in Southeast Asia. |
