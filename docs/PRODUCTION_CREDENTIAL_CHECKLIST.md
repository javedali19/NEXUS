# Production Credential Checklist & Operational Collection Guide

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Purpose:** Actionable, Step-by-Step Operator Checklist for Production Deployment  
**Date:** 2026-09-23  

---

## 1. Master Production Credential Checklist

| # | Service | Credential Needed | Credential Name | Required For | Current Status | Where To Obtain |
|---|---------|-------------------|-----------------|--------------|----------------|-----------------|
| 1 | **Google Gemini** | API Key | `GEMINI_API_KEY` | AI Sales Agent, Deal Copilot, Autonomous Collections | AWAITING CONFIGURATION | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| 2 | **OpenAI** | API Key | `OPENAI_API_KEY` | GPT-4o Agent Reasoning, Tool Execution Fallback | AWAITING CONFIGURATION | [OpenAI Developer Platform](https://platform.openai.com/api-keys) |
| 3 | **Stripe** | Live Secret Key & Webhook Secret | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Card Payments, Customer Checkout, Recurring Subscriptions | AWAITING CONFIGURATION | [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys) |
| 4 | **Razorpay** | Key ID & Key Secret | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | India UPI QR, Netbanking, Instant Payment Links | AWAITING CONFIGURATION | [Razorpay Dashboard → Settings → API Keys](https://dashboard.razorpay.com/app/keys) |
| 5 | **Meta WhatsApp** | Permanent System User Token & App Secret | `META_WHATSAPP_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | WhatsApp Unified Inbox, HSM Inbound/Outbound Messages | AWAITING CONFIGURATION | [Meta for Developers → WhatsApp Platform](https://developers.facebook.com/apps/) |
| 6 | **Twilio** | Account SID, Auth Token & Provisioned Phone Number | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | AI Voice Agent PSTN Calling, WebRTC SIP Media, SMS | AWAITING CONFIGURATION | [Twilio Console → Account Info](https://console.twilio.com/) |
| 7 | **Deepgram** | API Key | `DEEPGRAM_API_KEY` | Real-time Streaming STT (Nova-2) for Audio Transcription | AWAITING CONFIGURATION | [Deepgram Console → API Keys](https://console.deepgram.com/) |
| 8 | **ElevenLabs** | API Key & Voice IDs | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | Real-time Neural Voice Synthesis (Turbo v2.5) | AWAITING CONFIGURATION | [ElevenLabs Developer Settings](https://elevenlabs.io/app/settings/api-keys) |
| 9 | **Mathpix** | App ID & App Key | `mathpix-app-id`, `mathpix-app-key` | Accounts Payable OCR & Line Item Mathematical Parsing | AWAITING CONFIGURATION | [Mathpix Account Dashboard](https://accounts.mathpix.com/) |
| 10 | **Sentry** | Production DSN | `SENTRY_DSN` | Production Exception Capture & Performance Tracing | AWAITING CONFIGURATION | [Sentry Project Settings → Client Keys (DSN)](https://sentry.io/settings/) |
| 11 | **Xero** | OAuth 2.0 Client ID, Client Secret & Tenant ID | `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_TENANT_ID` | General Ledger & Chart of Accounts Synchronization | AWAITING CONFIGURATION | [Xero Developer Portal](https://developer.xero.com/myapps/) |
| 12 | **QuickBooks Online** | Intuit OAuth 2.0 Client ID, Secret & Realm ID | `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`, `QUICKBOOKS_REALM_ID` | Invoices & Journal Entries Sync with Intuit Ecosystem | AWAITING CONFIGURATION | [Intuit Developer Portal](https://developer.intuit.com/) |
| 13 | **Google Cloud Platform** | GCP Project ID, Region, PubSub Topic, Tasks Queue | `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_STORAGE_BUCKET`, `GCP_TASKS_QUEUE_NAME` | Cloud Run, Cloud SQL, Storage, Outbox Events, Tasks | PROVISIONED VIA TERRAFORM | [Google Cloud Console](https://console.cloud.google.com/) |
| 14 | **Google Identity Platform** | Project ID & Identity Platform Web API Key | `GCP_IDENTITY_PLATFORM_PROJECT_ID`, `GCP_IDENTITY_PLATFORM_API_KEY` | Production Multi-Tenant Cloud User Authentication | AWAITING CONFIGURATION | [Google Cloud Console → Identity Platform](https://console.cloud.google.com/customer-identity) |

---

## 2. Operational "What I Need to Collect" Guide

### 2.1 AI Reasoning Providers
* **Service:** Google Gemini
  * **Credential:** API Key (e.g. `AIzaSy...`)
  * **Purpose:** Powers autonomous deal reasoning, sales agent copilot, and natural language tool routing.
  * **Required for:** Core autonomous AI agent operations.
  * **Where to obtain:** Google AI Studio → API Keys.
  * **Env / Secret Manager Name:** `GEMINI_API_KEY` (Secret Manager: `gemini-api-key`).
  * **Status:** Blocked by missing key.

* **Service:** OpenAI
  * **Credential:** API Key (starts with `sk-proj-`)
  * **Purpose:** Secondary/fallback AI reasoning model (GPT-4o).
  * **Required for:** Multi-model redundancy and tool validation.
  * **Where to obtain:** OpenAI Developer Platform → API keys.
  * **Env / Secret Manager Name:** `OPENAI_API_KEY`.
  * **Status:** Blocked by missing key.

---

### 2.2 Payment Gateways
* **Service:** Stripe
  * **Credential:** Secret Key (`sk_live_...`) & Webhook Signing Secret (`whsec_...`)
  * **Purpose:** International credit card processing, hosted customer checkout, automated subscriptions.
  * **Required for:** Global customer invoicing and card settlements.
  * **Where to obtain:** Stripe Dashboard → Developers → API keys & Webhooks.
  * **Env / Secret Manager Name:** `STRIPE_SECRET_KEY` (Secret Manager: `stripe-secret-key`), `STRIPE_WEBHOOK_SECRET`.
  * **Status:** Blocked by missing key.

* **Service:** Razorpay
  * **Credential:** Key ID (`rzp_live_...`) & Key Secret
  * **Purpose:** Indian Rupee collections, UPI Dynamic QR, Netbanking, instant collections links.
  * **Required for:** India market sales flows and automated dunning.
  * **Where to obtain:** Razorpay Dashboard → Settings → API Keys & Webhooks.
  * **Env / Secret Manager Name:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (Secret Manager: `razorpay-key-secret`).
  * **Status:** Blocked by missing key.

* **Service:** HitPay (Singapore / SEA)
  * **Credential:** API Key & Webhook Salt
  * **Purpose:** Singapore PayNow QR, GrabPay, ShopeePay collections.
  * **Required for:** Singapore Country Pack payments.
  * **Where to obtain:** HitPay Dashboard → Settings → Payment Gateway → API Keys.
  * **Env / Secret Manager Name:** `HITPAY_API_KEY`, `HITPAY_SALT`.
  * **Status:** Blocked by missing key.

---

### 2.3 Omnichannel Communications & Telephony
* **Service:** Meta WhatsApp Business Platform
  * **Credential:** System User Access Token, WhatsApp Business Account ID (WABA ID), Phone Number ID, App Secret, Webhook Verify Token.
  * **Purpose:** Live customer chat, interactive HSM templates, automated invoice dispatch.
  * **Required for:** Unified Inbox, AI WhatsApp agent, omnichannel collections.
  * **Where to obtain:** Meta for Developers → App Dashboard → WhatsApp → API Setup.
  * **Env / Secret Manager Name:** `META_WHATSAPP_TOKEN` (Secret Manager: `meta-whatsapp-token`), `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`.
  * **Status:** Blocked by missing key.

* **Service:** Twilio
  * **Credential:** Account SID (`AC...`), Auth Token, and Provisioned E.164 Phone Number.
  * **Purpose:** Inbound/outbound voice calls, PSTN dialing, WebRTC media gateway, SMS.
  * **Required for:** Autonomous AI Voice Agent and Call Center operations.
  * **Where to obtain:** Twilio Console → Project Dashboard.
  * **Env / Secret Manager Name:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` (Secret Manager: `twilio-auth-token`), `TWILIO_PHONE_NUMBER`.
  * **Status:** Blocked by missing key.

---

### 2.4 Voice AI & Audio Processing
* **Service:** Deepgram
  * **Credential:** API Key
  * **Purpose:** Ultra-low latency streaming Speech-to-Text (`nova-2`) for live voice sessions.
  * **Required for:** Live phone call transcription and voice agent listening.
  * **Where to obtain:** Deepgram Console → API Keys.
  * **Env / Secret Manager Name:** `DEEPGRAM_API_KEY` (Secret Manager: `deepgram-api-key`).
  * **Status:** Blocked by missing key.

* **Service:** ElevenLabs
  * **Credential:** API Key, Voice Model ID (`eleven_turbo_v2_5`), Preferred Voice ID (`21m00Tcm4TlvDq8ikWAM`).
  * **Purpose:** Real-time conversational voice synthesis for AI voice agent responses.
  * **Required for:** Autonomous voice calling and spoken audio responses.
  * **Where to obtain:** ElevenLabs Website → Profile → API Keys.
  * **Env / Secret Manager Name:** `ELEVENLABS_API_KEY` (Secret Manager: `elevenlabs-api-key`).
  * **Status:** Blocked by missing key.

---

### 2.5 Document OCR & Computer Vision
* **Service:** Mathpix
  * **Credential:** App ID & App Key
  * **Purpose:** Accounts Payable vendor bill OCR, multi-column table extraction, and arithmetic validation.
  * **Required for:** AP invoice ingestion and Review Console human-in-the-loop workflows.
  * **Where to obtain:** Mathpix Developer Dashboard.
  * **Env / Secret Manager Name:** Secret Manager: `mathpix-app-id`, `mathpix-app-key`.
  * **Status:** Blocked by missing key.

---

### 2.6 Accounting & ERP Synchronization
* **Service:** Xero
  * **Credential:** OAuth 2.0 Client ID, Client Secret, and Authorized Tenant ID.
  * **Purpose:** Syncing customer contacts, invoices, payments, and general ledger journal entries.
  * **Required for:** Automated financial reconciliation with Xero.
  * **Where to obtain:** Xero Developer Portal → My Apps.
  * **Env / Secret Manager Name:** `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_TENANT_ID`.
  * **Status:** Blocked by missing key.

* **Service:** QuickBooks Online
  * **Credential:** Intuit OAuth 2.0 Client ID, Client Secret, and Realm ID (Company ID).
  * **Purpose:** Bi-directional sync of sales transactions with QuickBooks.
  * **Required for:** Intuit accounting integration.
  * **Where to obtain:** Intuit Developer Portal → Dashboard → Keys & OAuth.
  * **Env / Secret Manager Name:** `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`, `QUICKBOOKS_REALM_ID`.
  * **Status:** Blocked by missing key.

---

### 2.7 Production Observability & Error Tracking
* **Service:** Sentry
  * **Credential:** Sentry DSN URL
  * **Purpose:** Capture unhandled server panics, Next.js client exceptions, and distributed trace spans.
  * **Required for:** Production reliability, SLA tracking, and error alerting.
  * **Where to obtain:** Sentry.io → Project Settings → Client Keys (DSN).
  * **Env / Secret Manager Name:** `SENTRY_DSN` (Secret Manager: `sentry-dsn`).
  * **Status:** Blocked by missing key.

---

### 2.8 Google Cloud Platform (GCP)
* **Service:** Google Cloud Platform Services
  * **Credential:** Workload Identity Federation / Cloud Run Service Account (`app_runner`).
  * **Purpose:** Access Cloud SQL, GCS, Pub/Sub, Cloud Tasks, and Secret Manager without long-lived JSON keys.
  * **Required for:** Core infrastructure execution and security compliance.
  * **Where to obtain:** Provisioned automatically via `infrastructure/terraform`.
  * **Status:** Fully configured and production-ready in Terraform.
