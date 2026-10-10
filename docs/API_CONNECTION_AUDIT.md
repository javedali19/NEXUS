# API CONNECTION AUDIT — EXTERNAL SERVICES & DATABASE CONNECTIVITY

**Project:** NEXUS ERP + CRM + TELI  
**Document:** `docs/API_CONNECTION_AUDIT.md`  
**Status:** COMPLETE & VERIFIED  
**Date:** 2026-10-08  
**Scope:** Comprehensive connectivity audit across Database Platform, Telephony, Messaging, AI Providers, Payments, and Accounting.

---

## 1. Primary Platform Database Connectivity

| Provider / Service | Protocol / Client | Target Specification | Environment Variables | Connectivity Status |
|---|---|---|---|:---:|
| **Supabase PostgreSQL** | PostgreSQL Wire Protocol / `sqlx` (Rust) | Managed PostgreSQL 15+ with pgvector & RLS | `SUPABASE_DB_URL`<br>`SUPABASE_URL`<br>`SUPABASE_ANON_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY` | **PRIMARY & CONNECTED** |
| **Current PostgreSQL (Standby)** | PostgreSQL Wire Protocol / `sqlx` (Rust) | Docker `postgres:15-alpine` / GCP Cloud SQL | `DATABASE_URL` | **STANDBY / ROLLBACK AVAILABLE** |

---

## 2. Telephony & Communications Connectors

| Provider | Purpose | Status | Notes |
|---|---|:---:|---|
| **Twilio** | Telephony / SMS | ❌ **PURGED & REMOVED** | Zero code or credentials remain. Strict prohibition upheld. |
| **ElevenLabs** | Voice Synthesis | ❌ **PURGED & REMOVED** | Zero code or credentials remain. Strict prohibition upheld. |
| **Telnyx** | Voice Carrier & SIP Trunks | ✅ **SUPPORTED** | Provider-neutral telephony architecture active. |
| **Meta Cloud API** | WhatsApp Business Messaging | ✅ **SUPPORTED** | 2-way messaging and automated notifications. |
| **Deepgram** | Real-time Streaming STT | ✅ **SUPPORTED** | Nova-2 model integration preserved. |

---

## 3. AI Providers & Model Gateway

| Provider | Purpose | Models Supported | Status |
|---|---|---|:---:|
| **OpenAI** | Conversational reasoning & fallback | `gpt-4o`, `gpt-4o-mini` | CONNECTED |
| **Google Gemini** | Sales SDR reasoning & OCR assistance | `gemini-1.5-pro`, `gemini-1.5-flash` | CONNECTED |
| **Groq** | Low-latency inference | `llama-3-70b`, `mixtral-8x7b` | CONNECTED |

---

## 4. Payment Gateways & Accounting Rails

| Provider | Purpose | Currency Scope | Status |
|---|---|---|:---:|
| **Razorpay** | UPI & Cards | INR | CONNECTED |
| **Stripe** | Global Card Checkout | USD, EUR, Multi-currency | CONFIGURED |
| **DBS RAPID** | Singapore PayNow SGQR | SGD | READY |
| **Curlec** | Malaysia DuitNow | MYR | READY |
| **QuickBooks / Xero**| General Ledger Sync | Multi-currency | READY |
| **Mathpix** | Accounts Payable OCR | All invoice formats | READY |
