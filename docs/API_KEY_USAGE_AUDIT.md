# API Key Usage, Purpose & Connection Audit

**Platform:** Enterprise ERP + CRM + AI Autonomous Platform  
**Audit Type:** Read-Only Complete API Credential, Data Flow & Purpose Audit  
**Date:** 2026-09-24  
**Classification:** STRICT AUDIT ONLY — ZERO SECRETS MODIFIED / ZERO PLAINTEXT VALUES EXPOSED  

---

## 1. Master API Key Explanation Table

| # | API / Service | Key / Credential | What It Does | Feature Enabled | What Happens When Used | What Breaks Without It |
|---|---------------|------------------|--------------|-----------------|------------------------|------------------------|
| 1 | **Stripe** | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | Authenticates backend requests to Stripe & verifies webhook signatures | Global Card Payments & Subscriptions | Customer checkout creates PaymentIntent, charges card, verifies webhook, marks invoice PAID | Card checkout fails; payments cannot be charged; automated subscription billing halts |
| 2 | **Razorpay** | `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` | Authenticates India payments, UPI links & order creation | India Payments & Autonomous Collections | Generates UPI dynamic QR / checkout links, verifies webhook, triggers invoice settlement | UPI & Netbanking payment links cannot be created; collections workflow cannot auto-settle |
| 3 | **Meta WhatsApp** | `META_WHATSAPP_TOKEN` + `WHATSAPP_APP_SECRET` | Authenticates Graph API v18.0 & verifies incoming webhook HMAC | Unified Inbox & AI WhatsApp Agent | Sends/receives messages, renders HSM pre-approved templates, dispatches billing alerts | WhatsApp messaging fails; inbound chats cannot be received; automated WhatsApp bot goes offline |
| 4 | **Twilio** | `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` | Authenticates REST calls & controls PSTN/WebRTC audio streams | Autonomous Voice Agent & Call Center | Dials phone numbers, sets up bidirectional media websocket streams, sends SMS | Outbound and inbound voice calling fails; telephone compliance validator blocks dialing |
| 5 | **Deepgram** | `DEEPGRAM_API_KEY` | Authenticates streaming WebSocket to Nova-2 STT engine | Real-Time Voice Transcription | Transcribes caller audio chunks to text with <150ms latency | Voice agent cannot listen to caller; voice call fallback text simulation active |
| 6 | **ElevenLabs** | `ELEVENLABS_API_KEY` | Authenticates neural TTS streaming endpoint | Ultra-Low Latency Voice Synthesis | Generates natural human voice audio (Rachel, Adam, Nicole) from text responses | Voice agent cannot speak back to caller; calls drop or fallback to text mode |
| 7 | **Google Gemini** | `GEMINI_API_KEY` | Authenticates Google AI Studio / Gemini 1.5 Pro REST API | AI Sales Agent & Deal Copilot | Analyzes customer messages, qualifies leads, reasons on pricing, executes tools | Autonomous sales agent disabled; deal copilot and tool execution fallback to human routing |
| 8 | **OpenAI** | `OPENAI_API_KEY` | Authenticates OpenAI API for GPT-4o function calling | Secondary AI Reasoning & Bot Fallback | Provides redundant multi-model reasoning and natural language tool selection | Redundant AI fallback unavailable if Gemini experiences latency or rate limits |
| 9 | **Mathpix** | `mathpix-app-id` + `mathpix-app-key` | Authenticates Mathpix v3 text & table extraction API | Accounts Payable Document OCR | Parses scanned vendor bills, extracts line items, validates arithmetic consistency | Automated AP bill scanning halts; bills must be manually keyed in by human accountants |
| 10 | **Google Cloud Vision** | GCP Service Account (ADC) | Authenticates Cloud Vision API via GCP IAM | General Document & Receipt Vision | Extracts text from PDF invoices and receipts stored in Google Cloud Storage | General receipt scanning drops back to local parsing |
| 11 | **Xero** | `XERO_CLIENT_ID` + `XERO_CLIENT_SECRET` | Authenticates OAuth 2.0 PKCE with Xero Identity | General Ledger & Invoicing Sync | Syncs approved invoices, payments, and contacts to Xero Chart of Accounts | Invoices and payments must be exported manually via CSV to Xero |
| 12 | **QuickBooks Online** | `QUICKBOOKS_CLIENT_ID` + `QUICKBOOKS_CLIENT_SECRET` | Authenticates Intuit OAuth 2.0 and token refresh | Intuit Accounting Sync | Pushes customers, sales invoices, and journal entries to QuickBooks Online | Synchronization with Intuit QuickBooks ecosystem disabled |
| 13 | **Zoho Books** | `ZOHO_CLIENT_ID` + `ZOHO_CLIENT_SECRET` | Authenticates Zoho Accounts OAuth 2.0 | Zoho Finance Sync | Synchronizes contacts, vendor bills, and settlements to Zoho Books | Automatic synchronization to Zoho Books disabled |
| 14 | **HitPay** | `HITPAY_API_KEY` + `HITPAY_SALT` | Authenticates Singapore HitPay API & validates webhooks | Singapore PayNow SGQR & GrabPay | Generates EMVCo-compliant PayNow SGQR payment links and verifies settlement | Singapore PayNow online collection gateway cannot process transactions |
| 15 | **Sentry** | `SENTRY_DSN` | Authenticates error & trace ingestion to Sentry | Production Crash & Performance Monitoring | Ingests unhandled panics and slow request spans with automated PII scrubbing | Server errors and panics not captured in centralized Sentry dashboard |
| 16 | **Google Cloud Storage** | GCP Service Account (ADC) | Authenticates object upload/download to Google Cloud | Multi-Tenant Encrypted Document Vault | Stores contracts, bills, audio recordings, and invoices with CMEK encryption | Document upload and retrieval fails; file operations fall back to local disk |
| 17 | **Google Cloud Pub/Sub** | GCP Service Account (ADC) | Authenticates publishing to `platform-events` topic | Asynchronous Outbox Event Streaming | Publishes CloudEvent 1.0 JSON messages for outbox relay without blocking requests | Asynchronous domain events cannot be dispatched across background workers |
| 18 | **Google Cloud Tasks** | GCP Service Account (ADC) | Authenticates Cloud Tasks enqueuing via IAM | Background Job Execution & Retries | Schedules delayed dunning steps, webhook retries, and dead-letter queue (DLQ) | Asynchronous retry logic and scheduled workflow actions cannot execute |
| 19 | **Google Secret Manager** | GCP Service Account (`roles/secretmanager.secretAccessor`) | Authenticates retrieval of third-party API keys | Dynamic Runtime Secret Resolution | Resolves third-party API keys into container memory without baking secrets in images | Cloud Run containers cannot access third-party API keys at runtime |

---

## 2. Detailed Per-Credential Purpose, Usage & Flow

---

### 2.1 Stripe Payments (`STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`)

```text
==================================================
API / SERVICE: Stripe Payments
==================================================

Credential:
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET

Credential Type:
API Secret / Webhook Signing Secret

Credential Present:
NO in live environment (Synthetically mocked in .env.test)

Credential Location:
Google Secret Manager (projects/{id}/secrets/{env}-stripe-secret-key)
Injected into Cloud Run via value_source.secret_key_ref

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates backend server requests to Stripe's REST API and validates
incoming webhook payloads using cryptographic HMAC-SHA256 signatures.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables customer card checkout, one-click payment links for invoices, automated
recurring subscription billing, and verified automated payment capture.

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Sales Flow Engine (Checkout & Settlement), Invoices Module, Autonomous Collections.

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/integrations/src/providers/stripe.rs
platform_integrations::providers::stripe::StripeConnector::test_connection
platform_integrations::providers::stripe::StripeConnector::verify_webhook_signature
backend/crates/domain/src/sales_flow.rs
platform_domain::sales_flow::SalesFlowEngine::advance_to_payment

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. Customer views invoice on frontend (/invoices/:id).
2. Customer clicks "Pay via Card".
3. Backend calls Stripe API /v1/payment_intents with amount, currency, and invoice ID.
4. Stripe returns client_secret for hosted payment element.
5. Customer enters card details; Stripe charges card.
6. Stripe sends webhook to /api/v1/webhooks/stripe with header Stripe-Signature.
7. Backend validates signature using STRIPE_WEBHOOK_SECRET via constant_time_compare.
8. Backend updates invoice status to "PAID", creates payment record.
9. Outbox event "payment.received.v1" emitted.
10. Customer 360 timeline and revenue analytics updated in real-time.

==================================================
WHAT DATA IS SENT?
==================================================
- invoice_id (UUID)
- customer_name
- customer_email
- amount (subunits / cents)
- currency (e.g. USD, EUR, SGD)
- idempotency_key

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- payment_intent_id (pi_...)
- payment_status ("succeeded")
- charge_id (ch_...)
- payment_method_details (card brand, last 4 digits)

==================================================
WHERE DOES THE RESULT GO?
==================================================
Stripe API
    ↓
StripeConnector
    ↓
SalesFlowEngine
    ↓
PostgreSQL (invoices & payments tables)
    ↓
Outbox Event ("payment.received.v1")
    ↓
Customer 360 Timeline & Executive Revenue Dashboard

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Online card payments fail. Invoices cannot be settled via card.
Autonomous collections workflow cannot collect payments via Stripe.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.2 Razorpay Payments & UPI (`RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`)

```text
==================================================
API / SERVICE: Razorpay Payments & UPI
==================================================

Credential:
RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET

Credential Type:
Public Key ID / API Secret / Webhook Secret

Credential Present:
NO in live environment (Synthetically mocked in .env.test)

Credential Location:
Google Secret Manager (projects/{id}/secrets/{env}-razorpay-key-secret)
Injected into Cloud Run via value_source.secret_key_ref

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates HTTP Basic Auth requests to Razorpay API for creating payment
orders, generating UPI dynamic QR codes, and verifying webhook signatures.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables Indian Rupee (INR) payments, UPI instant QR codes, Netbanking,
and automated collections payment links sent via WhatsApp/SMS.

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Payments Module, Autonomous Collections Engine, Sales Flow Engine.

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/integrations/src/payments/razorpay.rs
platform_integrations::payments::razorpay::RazorpayAdapter::create_intent
platform_integrations::payments::razorpay::RazorpayAdapter::create_payment_link
backend/crates/domain/src/autonomous_collections.rs
platform_domain::autonomous_collections::AutonomousCollectionsEngine

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. Autonomous collections engine determines an invoice is 3 days overdue.
2. Backend calls Razorpay API /v1/payment_links with invoice amount and phone number.
3. Razorpay creates short URL (e.g. https://rzp.io/i/abc123) and UPI QR payload.
4. Backend dispatches this link to customer via WhatsApp.
5. Customer clicks link and pays via Google Pay / PhonePe / Paytm UPI.
6. Razorpay fires webhook "payment.captured" to /api/v1/webhooks/razorpay.
7. Backend verifies X-Razorpay-Signature using constant-time comparison.
8. Circuit breaker triggers: halts scheduled reminder calls/messages immediately.
9. Invoice marked PAID; payment recorded in general ledger.

==================================================
WHAT DATA IS SENT?
==================================================
- amount (in paise, integer)
- currency ("INR")
- receipt (invoice number)
- customer contact (phone and email)
- notes (organization_id, invoice_id)

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- razorpay_order_id (order_...)
- razorpay_payment_id (pay_...)
- payment_link_id (plink_...)
- short_url
- payment status ("captured")

==================================================
WHERE DOES THE RESULT GO?
==================================================
Razorpay API
    ↓
RazorpayAdapter
    ↓
AutonomousCollectionsEngine
    ↓
PostgreSQL (invoices, payments, collections_runs)
    ↓
Outbox Event ("sales_flow.payment_settled")
    ↓
Collections Dashboard (/collections) & Real-time Timeline

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Razorpay order creation fails with 401 Unauthorized.
UPI dynamic QR codes cannot be rendered.
Automated collections links cannot be generated.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.3 Meta WhatsApp Business Cloud API (`META_WHATSAPP_TOKEN` & `WHATSAPP_APP_SECRET`)

```text
==================================================
API / SERVICE: Meta WhatsApp Business Platform
==================================================

Credential:
META_WHATSAPP_TOKEN / WHATSAPP_APP_SECRET / WHATSAPP_VERIFY_TOKEN

Credential Type:
Bearer Access Token / App Secret / Handshake Token

Credential Present:
NO in live environment (Synthetically mocked in .env.test)

Credential Location:
Google Secret Manager (projects/{id}/secrets/{env}-meta-whatsapp-token)
Injected into Cloud Run via value_source.secret_key_ref

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates requests to Meta Graph API v18.0 to send outbound WhatsApp messages,
renders pre-approved HSM templates, and verifies inbound webhooks from Meta.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables the 2-way Unified Messaging Inbox, automated payment reminder dispatches,
inbound customer support chat, and the autonomous AI WhatsApp sales bot.

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Omnichannel Unified Inbox, AI WhatsApp Agent, Customer Support 360.

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/integrations/src/communications/whatsapp.rs
platform_integrations::communications::whatsapp::WhatsAppAdapter::send_message
platform_integrations::communications::whatsapp::WhatsAppAdapter::verify_webhook_handshake
platform_integrations::communications::whatsapp::WhatsAppAdapter::parse_webhook_payload
backend/crates/domain/src/ai_whatsapp_agent.rs
platform_domain::ai_whatsapp_agent::AiWhatsAppAgent::process_inbound_message

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. Customer messages business on WhatsApp.
2. Meta webhook delivers payload to /api/v1/webhooks/whatsapp.
3. WhatsAppAdapter verifies signature header "X-Hub-Signature-256: sha256=...".
4. Adapter parses sender number, message text, and timestamp.
5. Inbound message saved to messages table; conversation created or updated.
6. AI WhatsApp Agent analyzes message intent via tool gateway.
7. Agent drafts response or calls tool (e.g. get_invoice_balance).
8. Backend sends reply via Meta Graph API /v18.0/{phone_number_id}/messages.
9. Message status updates (Sent → Delivered → Read) tracked in real-time.

==================================================
WHAT DATA IS SENT?
==================================================
- recipient phone number (E.164 format e.g. +1234567890)
- message content type (text, template, document)
- template parameters (customer name, balance, due date)
- document attachment URL (GCS signed URL for invoice PDF)

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- meta_message_id (wamid.HBgM...)
- delivery_status ("delivered", "read")
- inbound customer text, media attachments, and button clicks

==================================================
WHERE DOES THE RESULT GO?
==================================================
Meta Graph API
    ↓
WhatsAppAdapter
    ↓
OmnichannelRouter & AiWhatsAppAgent
    ↓
PostgreSQL (conversations & messages tables)
    ↓
WebSocket Push to Browser
    ↓
Unified Inbox UI (/communications/inbox)

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Outbound WhatsApp messages cannot be sent (401 Unauthorized).
Webhook deliveries from Meta are rejected.
WhatsApp live chat and automated billing dispatches halt completely.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.4 Twilio Telephony (`TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN`)

```text
==================================================
API / SERVICE: Twilio Voice & Telephony
==================================================

Credential:
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER

Credential Type:
Account Identifier / Primary Auth Secret / Caller ID

Credential Present:
NO in live environment (Synthetically mocked in .env.test)

Credential Location:
Google Secret Manager (projects/{id}/secrets/{env}-twilio-auth-token)
Injected into Cloud Run via value_source.secret_key_ref

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates Twilio REST API requests to initiate voice phone calls, establish
bidirectional WebRTC media streams, and enforce calling window compliance.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables the Autonomous Voice Agent to make and receive real telephone calls over
the global PSTN network, perform DNC compliance checks, and record call audio.

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Autonomous AI Voice Agent, Call Center Dialpad, Telephony Compliance Engine.

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/integrations/src/providers/twilio.rs
platform_integrations::providers::twilio::TwilioConnector::test_connection
platform_integrations::providers::twilio::TwilioConnector::normalize_webhook
backend/crates/domain/src/voice_telephony.rs
platform_domain::voice_telephony::CallingWindowValidator
backend/crates/domain/src/voice_agent_integration.rs
platform_domain::voice_agent_integration::VoiceAgentCoordinator

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. Operator or AI initiates call to customer.
2. CallingWindowValidator checks destination country (e.g. US 8am-9pm, SG 8am-8pm).
3. If compliant, backend calls Twilio /2010-04-01/Accounts/{SID}/Calls.json.
4. Twilio places PSTN call to customer's phone.
5. Customer answers; Twilio establishes bidirectional WebSocket audio stream.
6. Twilio streams caller audio chunks to backend media gateway.
7. Backend pipes audio to Deepgram (STT) and returns ElevenLabs synthesized voice.
8. Call ends; Twilio dispatches "call.completed" webhook with duration.
9. Call record, duration, and transcript saved to Customer 360 timeline.

==================================================
WHAT DATA IS SENT?
==================================================
- To (customer phone number)
- From (provisioned Twilio phone number)
- TwiML instruction URL (WebSocket stream endpoint)
- recording_channels & status_callback URLs

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- CallSid (CA...)
- call_status ("queued", "ringing", "in-progress", "completed")
- call_duration_seconds
- audio stream packets

==================================================
WHERE DOES THE RESULT GO?
==================================================
Twilio API
    ↓
TwilioConnector
    ↓
VoiceTelephonyEngine
    ↓
PostgreSQL (calls & call_transcripts tables)
    ↓
Customer 360 Timeline & Call Center Console (/telephony)

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Voice calls cannot be placed or received.
Telephony connection test fails with "Account SID or Auth Token missing".
AI Voice Agent runs only in local text simulation mode.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.5 Deepgram Speech-to-Text (`DEEPGRAM_API_KEY`)

```text
==================================================
API / SERVICE: Deepgram Speech-to-Text
==================================================

Credential:
DEEPGRAM_API_KEY

Credential Type:
API Key

Credential Present:
NO in live environment (Synthetically mocked in .env.test)

Credential Location:
Google Secret Manager (projects/{id}/secrets/{env}-deepgram-api-key)
Injected into Cloud Run via value_source.secret_key_ref

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates WebSocket connection to Deepgram's streaming transcription engine.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables real-time, low-latency (<150ms) speech recognition using the Nova-2 model,
allowing the Autonomous Voice Agent to understand what the caller is saying live.

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Autonomous Voice Agent (Quad-Gate Gate 2: Listening & Transcription).

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/integrations/src/providers/deepgram.rs
platform_integrations::providers::deepgram::DeepgramConnector::test_connection
backend/crates/domain/src/voice_agent_integration.rs
platform_domain::voice_agent_integration::VoiceAgentConfig

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. Customer speaks during a live phone call.
2. Raw PCM audio chunks stream from Twilio into the backend.
3. Backend forwards audio stream over WebSocket to wss://api.deepgram.com/v1/listen.
4. Deepgram returns streaming JSON transcripts with word-level timestamps & punctuation.
5. Once a sentence or pause is detected, transcript is passed to Gemini/GPT-4o.
6. Full transcript saved to database at end of call for CRM search.

==================================================
WHAT DATA IS SENT?
==================================================
- Raw audio stream (linear16 / opus audio packets)
- encoding format and sample rate (8000Hz or 16000Hz)

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- transcript text strings
- confidence score (0.0 to 1.0)
- is_final boolean flag
- speech_final event indicator

==================================================
WHERE DOES THE RESULT GO?
==================================================
Deepgram WebSocket
    ↓
DeepgramConnector
    ↓
VoiceAgentCoordinator
    ↓
AI Reasoning Engine (Gemini / GPT-4o) & call_transcripts table
    ↓
Live Agent Telephony Waveform & Transcript Display

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Live speech transcription fails.
Voice agent cannot hear or understand caller audio.
Fallback to offline fixture or development text-input mode.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.6 ElevenLabs Voice Synthesis (`ELEVENLABS_API_KEY`)

```text
==================================================
API / SERVICE: ElevenLabs Neural Voice Synthesis
==================================================

Credential:
ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID / ELEVENLABS_MODEL_ID

Credential Type:
API Key / Resource IDs

Credential Present:
API Key: NO in live (mocked in .env.test)
Voice ID & Model ID: YES (Configured in .env.example)

Credential Location:
Google Secret Manager (projects/{id}/secrets/{env}-elevenlabs-api-key)
Injected into Cloud Run via value_source.secret_key_ref

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates HTTP requests to ElevenLabs streaming text-to-speech API.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables high-fidelity neural voice synthesis (Turbo v2.5 model) with preset enterprise
voice personas (Rachel: calm customer service; Adam: collections; Nicole: sales).

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Autonomous Voice Agent (Quad-Gate Gate 4: Voice Synthesis).

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/integrations/src/providers/elevenlabs.rs
platform_integrations::providers::elevenlabs::ElevenLabsConnector::test_connection
platform_integrations::providers::elevenlabs::ElevenLabsConnector::preset_voices
backend/crates/domain/src/voice_agent_integration.rs
platform_domain::voice_agent_integration::VoiceAgentConfig

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. AI Reasoning engine generates text reply for caller.
2. Backend calls https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream.
3. ElevenLabs returns ultra-low-latency chunked MP3/PCM audio stream.
4. Backend streams audio chunks directly back into Twilio WebSocket.
5. Customer hears realistic, natural-sounding human speech on their phone.

==================================================
WHAT DATA IS SENT?
==================================================
- text to speak
- model_id ("eleven_turbo_v2_5")
- voice_settings (stability: 0.75, similarity_boost: 0.85)

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- streaming audio byte chunks (audio/mpeg)
- latency metrics (~110ms first-chunk latency)

==================================================
WHERE DOES THE RESULT GO?
==================================================
ElevenLabs API
    ↓
ElevenLabsConnector
    ↓
Twilio WebSocket Audio Stream
    ↓
Customer's Telephone Earpiece

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Voice generation fails with 401 Unauthorized.
Voice agent cannot speak. Inbound/outbound calling drops voice response.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.7 Google Gemini & OpenAI (`GEMINI_API_KEY` & `OPENAI_API_KEY`)

```text
==================================================
API / SERVICE: Google Gemini 1.5 Pro & OpenAI GPT-4o
==================================================

Credential:
GEMINI_API_KEY / OPENAI_API_KEY

Credential Type:
API Keys

Credential Present:
NO in live environment (Synthetically mocked in .env.test)

Credential Location:
Google Secret Manager (projects/{id}/secrets/{env}-gemini-api-key)
Injected into Cloud Run via value_source.secret_key_ref

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates requests to Google Generative Language API or OpenAI Chat API for
large language model reasoning, intent analysis, and structured tool calling.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables the autonomous sales agent to analyze leads, summarize deals, draft quote
proposals, execute CRM tools, and autonomously conduct WhatsApp conversations.

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
AI Sales Agent Copilot, AI WhatsApp Agent, Voice Agent Reasoning Gate, Global Search.

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/domain/src/ai_sales_agent.rs
platform_domain::ai_sales_agent::AiSalesAgent::validate_provider_connection
platform_domain::ai_sales_agent::AiSalesAgent::execute_sales_turn
backend/crates/domain/src/ai_tool_gateway.rs
platform_domain::ai_tool_gateway::AiToolGateway::execute_tool

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. User asks AI Sales Agent to qualify a deal or customer sends inquiry.
2. Backend packages conversation history, CRM context, and available tool schemas.
3. Sends request to Gemini 1.5 Pro or OpenAI GPT-4o REST endpoint.
4. Model analyzes input and selects a tool call (e.g. check_inventory or generate_quote).
5. AiToolGateway verifies security permissions (e.g. "quote:create").
6. Backend executes tool locally against PostgreSQL database.
7. Result fed back to model; model returns final conversational answer.
8. Complete turn recorded in audit trail.

==================================================
WHAT DATA IS SENT?
==================================================
- conversation messages (prompt and history)
- tool schemas (function names, parameters, descriptions)
- masked customer and deal context

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- text response content
- tool_calls array (function name and JSON arguments)
- token usage statistics

==================================================
WHERE DOES THE RESULT GO?
==================================================
Gemini / OpenAI API
    ↓
AiSalesAgent & AiToolGateway
    ↓
Business Action Execution (PostgreSQL write)
    ↓
Audit Log & Outbox Events
    ↓
AI Sales Copilot UI (/ai-sales) & Customer Timeline

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Architectural invariant holds: The AI Agent remains DISABLED.
Calls to AI agent return "AI Provider is unconfigured or failed".
Application falls back gracefully to manual human operator control.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.8 Mathpix Document OCR (`mathpix-app-id` & `mathpix-app-key`)

```text
==================================================
API / SERVICE: Mathpix Document OCR
==================================================

Credential:
mathpix-app-id / mathpix-app-key

Credential Type:
App ID / App Secret Key

Credential Present:
NO in live environment (Mocked in test suites)

Credential Location:
Google Secret Manager (projects/{id}/secrets/mathpix-app-id & mathpix-app-key)
Resolved dynamically via SecretManagerResolver

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates requests to Mathpix v3 text/table extraction API.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables automated Accounts Payable bill scanning, extracting multi-column tables,
line items, taxes, and running automated line-item arithmetic verification.

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Document Management, Accounts Payable Ingestion, Human-in-the-Loop OCR Review Console.

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/integrations/src/ocr/mathpix.rs
platform_integrations::ocr::mathpix::MathpixClient::test_connection
platform_integrations::ocr::mathpix::MathpixClient::parse_raw_ocr_to_invoice
backend/crates/domain/src/ocr.rs
platform_domain::ocr::OcrVerificationEngine

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. User uploads vendor invoice PDF to /documents.
2. File saved in Google Cloud Storage.
3. Backend calls Mathpix API /v3/text with image/PDF payload.
4. Mathpix returns extracted text, layout geometry, tables, and confidence scores.
5. Backend parses output into canonical ExtractedInvoice struct.
6. OcrVerificationEngine runs arithmetic check:
   - Sum(line_items) == Subtotal?
   - Subtotal + Tax - Discount == Grand Total?
7. If confidence > 0.90 and math matches: automatically creates AP bill.
8. If anomaly detected (confidence < 0.90 or math mismatch): routes to Review Console.

==================================================
WHAT DATA IS SENT?
==================================================
- raw image or PDF bytes (base64 or GCS signed URL)
- OCR extraction options (formats: ["text", "data", "tables"])

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- extracted invoice number, date, vendor name
- tabular line items (description, quantity, unit price, total)
- detected subtotal, tax amount, and grand total
- confidence ratings per field

==================================================
WHERE DOES THE RESULT GO?
==================================================
Mathpix API
    ↓
MathpixClient
    ↓
OcrVerificationEngine
    ↓
PostgreSQL (documents, ocr_jobs, extracted_invoices)
    ↓
Human Review Gate (/documents/ocr-review) or Approved Invoices

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Live Mathpix OCR probe returns Unconfigured.
Uploaded documents cannot be automatically parsed into structured bills.
Users must manually type in line items and invoice amounts.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.9 Sentry Observability (`SENTRY_DSN`)

```text
==================================================
API / SERVICE: Sentry Crash & Performance Monitoring
==================================================

Credential:
SENTRY_DSN

Credential Type:
Data Source Name (DSN URL containing project identifier and auth token)

Credential Present:
NO in live environment (Blank in .env.example)

Credential Location:
Google Secret Manager (projects/{id}/secrets/{env}-sentry-dsn)
Injected into Cloud Run via value_source.secret_key_ref

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates the backend panic handler and tracing layer with Sentry's ingest servers.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables real-time production alerting on unhandled server crashes, panics, and
distributed trace latency bottlenecks, with automated PII and secret scrubbing.

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Platform Observability, System Health Dashboard.

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/domain/src/observability.rs
platform_domain::observability::SentryConfig
platform_domain::observability::scrub_pii_and_secrets

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. An unhandled exception or 500 error occurs in an Axum route.
2. Catch-panic middleware intercepts the error.
3. Error payload runs through scrub_pii_and_secrets:
   - credit card patterns masked
   - authorization bearer tokens stripped
   - secret patterns (sk_live_, rzp_live_) scrubbed
4. Formatted error event dispatched asynchronously to Sentry ingest server.
5. Unique Sentry event ID returned and attached to API response for user reference.

==================================================
WHAT DATA IS SENT?
==================================================
- error message and stack trace
- sanitized request path, HTTP method, and correlation ID
- server environment (e.g. "production", "staging")
- release version (git commit hash)
- (All PII and secrets are strictly scrubbed prior to dispatch)

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- HTTP 200 OK from Sentry ingest
- sentry_event_id string

==================================================
WHERE DOES THE RESULT GO?
==================================================
Sentry Ingest Server
    ↓
Centralized Sentry Web Dashboard (alerts, stack traces, latency curves)
    ↓
Correlated in Application Logs via correlation_id

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
Application continues running normally.
Errors are logged locally to stdout/structured JSON but not forwarded to Sentry.
Centralized external alert notifications are disabled.

==================================================
CURRENT STATUS:
==================================================
IMPLEMENTED BUT CREDENTIAL MISSING
```

---

### 2.10 Google Cloud Platform Managed Services (GCS, Pub/Sub, Tasks, Secret Manager, KMS)

```text
==================================================
API / SERVICE: Google Cloud Infrastructure
==================================================

Credential:
Google Cloud Service Account (ADC) / Workload Identity Federation (WIF)

Credential Type:
IAM Service Account / OIDC Federation Token

Credential Present:
YES (Provisioned via infrastructure/terraform & active via IAM)

Credential Location:
Google Cloud IAM & Cloud Run Runtime Identity (app_runner service account)
Zero static JSON keys stored in repo; authenticates via short-lived OIDC tokens.

==================================================
WHAT IS THIS KEY FOR?
==================================================
Authenticates the backend services to Google Cloud APIs: Cloud Storage (GCS),
Cloud Pub/Sub, Cloud Tasks, Secret Manager, Cloud KMS, and Cloud SQL.

==================================================
WHAT DOES THIS KEY ENABLE?
==================================================
Enables the entire core runtime backbone:
- Encrypted file storage (CMEK)
- Transactional outbox asynchronous domain event publishing
- Reliable 3-tier background task execution and retry queues (DLQ)
- Dynamic runtime secret retrieval
- Customer-managed encryption keys for database columns

==================================================
WHICH PROJECT FEATURE USES IT?
==================================================
Document Storage, Event-Driven Architecture, Asynchronous Workers, Secret Vault.

==================================================
WHICH CODE USES IT?
==================================================
backend/crates/integrations/src/storage/gcs.rs (GcsStorageClient)
backend/crates/events/src/publisher.rs (GcpPubSubPublisher)
backend/crates/worker/src/cloud_tasks.rs (CloudTasksClient)
backend/crates/integrations/src/auth/secret_manager.rs (SecretManagerResolver)
infrastructure/terraform/*.tf

==================================================
WHAT HAPPENS WHEN IT IS USED?
==================================================
1. Service starts in Cloud Run.
2. Google SDK automatically discovers metadata server token (ADC).
3. SecretManagerResolver resolves required keys.
4. When a file is uploaded, GcsStorageClient writes encrypted blob to GCS bucket.
5. When a database transaction commits, outbox events published to Pub/Sub topic.
6. Pub/Sub pushes events to Cloud Tasks priority or default queue.
7. Worker services consume tasks idempotently with exponential backoff retries.

==================================================
WHAT DATA IS SENT?
==================================================
- CloudEvent 1.0 JSON payloads
- binary file streams
- secret resource paths

==================================================
WHAT DOES THE PROJECT RECEIVE?
==================================================
- message IDs, task names, storage generation IDs
- resolved secret strings into memory

==================================================
WHERE DOES THE RESULT GO?
==================================================
Google Cloud APIs
    ↓
GCS, Pub/Sub, Cloud Tasks, Secret Manager
    ↓
PostgreSQL & Background Workers
    ↓
End-User Features across Web Application

==================================================
WHAT HAPPENS IF THE KEY IS MISSING?
==================================================
In local development: System seamlessly falls back to local Docker containers
(PostgreSQL, Redis, Pub/Sub emulator, local disk storage).
In production: Cloud Run would fail to boot without IAM roles.

==================================================
CURRENT STATUS:
==================================================
CONNECTED & PRODUCTION READY
```

---

## 3. Real-World Effect: "If I add this API key tomorrow, what can my application actually do?"

### 1. Stripe Secret Key (`STRIPE_SECRET_KEY`)
* **With the key:** Customers anywhere in the world can open an invoice link and pay immediately via Credit/Debit card. The system automatically marks the invoice `PAID`, cancels automated reminder messages, and updates revenue metrics.
* **Without the key:** Card checkout buttons will throw authentication errors. Only offline manual payments (cash/cheque) can be recorded.

### 2. Razorpay Key ID + Secret (`RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`)
* **With the keys:** Indian customers can pay invoices instantly using UPI QR codes (GPay, PhonePe, Paytm) or Netbanking. Automated collections workflows can send dynamic payment links directly to WhatsApp.
* **Without the keys:** Indian UPI and payment link generation fails.

### 3. Meta WhatsApp Access Token (`META_WHATSAPP_TOKEN`)
* **With the key:** The business phone number goes live on WhatsApp. The Unified Inbox receives real customer messages in real-time, human agents can chat back, pre-approved HSM payment alerts can be sent automatically, and the AI WhatsApp bot can handle inquiries 24/7.
* **Without the key:** The WhatsApp inbox is completely disconnected from Meta.

### 4. Twilio Telephony Credentials (`TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN`)
* **With the keys:** The platform can dial real phone numbers over the PSTN network. The Autonomous AI Voice Agent can conduct outbound collections calls or qualify incoming sales leads over the phone.
* **Without the keys:** The phone dialpad cannot connect to the telecom network.

### 5. Deepgram + ElevenLabs (`DEEPGRAM_API_KEY` + `ELEVENLABS_API_KEY`)
* **With the keys:** When used alongside Twilio, the AI voice agent gains ears and a voice: it understands spoken customer speech in 150ms and replies with an ultra-realistic human voice.
* **Without the keys:** Even if Twilio connects a call, the AI cannot transcribe the caller's voice or speak back.

### 6. Google Gemini / OpenAI (`GEMINI_API_KEY` / `OPENAI_API_KEY`)
* **With the key:** The Autonomous Sales Agent unlocks: it reads incoming chats, qualifies deals, checks inventory, drafts quotes, and reasons on sales objections autonomously.
* **Without the key:** The agent remains disabled; the ERP functions strictly as a manual software tool.

### 7. Mathpix App ID + Key (`mathpix-app-id` + `mathpix-app-key`)
* **With the keys:** Accounts Payable bills are parsed automatically. Dragging and dropping an invoice PDF extracts line items, validates the arithmetic, and creates a draft bill in seconds.
* **Without the keys:** Uploaded PDFs remain unparsed; accountants must manually type every line item.

---

## 4. Multi-API Dependency Chains

Several platform capabilities require multiple external services working together in lockstep:

```text
1. Autonomous AI Voice Calling Feature:
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │    Twilio    │ ──> │   Deepgram   │ ──> │ Gemini/GPT-4o│ ──> │  ElevenLabs  │ ──> Audio to
   │ (Phone Line) │     │ (Listen/STT) │     │(Reason/Brain)│     │ (Voice/TTS)  │     Caller
   └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
   * If Twilio is missing: No call can be placed.
   * If Deepgram is missing: AI cannot hear caller.
   * If Gemini is missing: AI cannot decide what to say.
   * If ElevenLabs is missing: AI cannot speak.

2. Omnichannel WhatsApp Automated Collections:
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ Gemini/Rules │ ──> │   Razorpay   │ ──> │Meta WhatsApp │ ──> │    Stripe/   │ ──> Ledger
   │ (Collections)│     │(Payment Link)│     │ (Dispatch)   │     │   Razorpay   │     Sync
   └──────────────┘     └──────────────┘     └──────────────┘     │   (Webhook)  │
                                                                  └──────────────┘
   * If Razorpay is missing: Payment link cannot be generated.
   * If Meta WhatsApp is missing: Link cannot be delivered to customer.
   * If Webhook Secret is missing: Payment cannot be auto-confirmed.

3. Automated Accounts Payable Ingestion:
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ Google Cloud │ ──> │   Mathpix    │ ──> │     OCR      │ ──> │ Xero / QBO   │
   │ Storage(GCS) │     │  (Table OCR) │     │ Verification │     │ (Accounting) │
   └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
   * If GCS is missing: Uploaded PDF cannot be stored.
   * If Mathpix is missing: Tables cannot be extracted into line items.
   * If Xero is missing: Approved bill remains internal and does not sync to GL.
```

---

## 5. What Happens When Keys Are Added vs Removed

| Service | When Key Is Added | When Key Is Removed / Expires | Existing Stored Data Impact | Failure Scope |
|---------|-------------------|-------------------------------|-----------------------------|---------------|
| **Stripe** | Live card checkout & automated billing activates | Card charges fail; customer sees "Payment processor unavailable" | Stored customer & invoice records remain safe in PostgreSQL | **Isolated** (Only card payments affected; manual payments still work) |
| **Razorpay** | Instant UPI links and QR codes activate | UPI generation fails; collections links fail | Historical payments & invoices remain untouched | **Isolated** (Only India payments affected) |
| **Meta WhatsApp** | Unified Inbox and WhatsApp bot go live | Messages fail to send; incoming webhooks rejected with 401 | Past conversations and messages remain intact in database | **Isolated** (Only WhatsApp chat affected; web app unaffected) |
| **Twilio** | Voice calls dial out over telecom network | Dialpad throws "Provider unconfigured"; calls fail to ring | Call logs, recordings, and past transcripts remain safe | **Isolated** (Only telephony affected) |
| **Deepgram** | Live speech transcribes into real-time text | Transcripts fail; voice agent cannot hear caller | Past transcripts remain searchable in CRM | **Isolated** (Only live voice sessions affected) |
| **ElevenLabs** | Voice agent speaks with natural human voice | Audio streaming drops; agent goes silent | Saved voice configurations remain in database | **Isolated** (Only live voice synthesis affected) |
| **Gemini / OpenAI** | Autonomous agents activate and execute tools | Agents automatically disable themselves (safety invariant) | All deals, leads, quotes, and CRM records remain safe | **Isolated** (System falls back to human manual mode) |
| **Mathpix** | Drag-and-drop AP bill extraction activates | Automated OCR parsing halts | All uploaded PDFs remain stored safely in GCS | **Isolated** (Only automated extraction halts; manual entry works) |
| **Xero / QuickBooks** | Invoices & payments auto-sync to external GL | Sync queue pauses; events marked "Pending Sync" | Local general ledger continues tracking all entries | **Isolated** (External sync pauses; internal ERP unaffected) |
| **Sentry** | Live panic alerts & distributed spans ingested | Errors logged only to local stdout/structured JSON | Application remains fully operational | **Zero Impact** on business operations |
| **Google Cloud (GCS/Tasks)** | Full cloud scalability, outbox streaming, CMEK | Cloud Run cannot start; database access fails | High risk if IAM misconfigured in production | **Critical Infrastructure** (Protected by Terraform WIF) |
