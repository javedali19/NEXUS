-- Migration: 0014_razorpay_production_adapter.sql
-- Description: Production-ready Razorpay schema (Orders, Payments, Webhook Ledger, GSM Vault Reference, RLS)

CREATE TABLE IF NOT EXISTS razorpay_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    key_id VARCHAR(64) NOT NULL, -- e.g. rzp_live_... (Masked in responses)
    gsm_secret_resource VARCHAR(255) NOT NULL, -- Google Secret Manager path e.g. projects/corp-prod/secrets/rzp_key_secret
    gsm_webhook_secret_resource VARCHAR(255),  -- Google Secret Manager path for webhook secret
    is_live_mode BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    webhook_endpoint_url VARCHAR(512),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_razorpay_creds_org UNIQUE (organization_id)
);

CREATE TABLE IF NOT EXISTS razorpay_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    razorpay_order_id VARCHAR(64) NOT NULL UNIQUE, -- order_...
    receipt VARCHAR(64) NOT NULL,
    amount_in_subunits BIGINT NOT NULL, -- amount in paise (e.g. 500000 = Rs 5,000.00)
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL DEFAULT 'created' CHECK (
        status IN ('created', 'attempted', 'paid', 'expired', 'cancelled')
    ),
    
    attempts_count INT NOT NULL DEFAULT 0,
    notes JSONB NOT NULL DEFAULT '{}'::jsonb,
    idempotency_key VARCHAR(128) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS razorpay_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES razorpay_orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    
    razorpay_payment_id VARCHAR(64) NOT NULL UNIQUE, -- pay_...
    razorpay_order_id VARCHAR(64) NOT NULL,
    amount_in_subunits BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL CHECK (
        status IN ('authorized', 'captured', 'refunded', 'failed')
    ),
    
    method VARCHAR(32) NOT NULL, -- 'upi', 'card', 'netbanking', 'wallet', 'emi'
    vpa VARCHAR(128),
    bank VARCHAR(64),
    card_id VARCHAR(64),
    card_network VARCHAR(32),
    card_last4 VARCHAR(4),
    
    fee_in_subunits BIGINT NOT NULL DEFAULT 0,
    tax_in_subunits BIGINT NOT NULL DEFAULT 0,
    error_code VARCHAR(64),
    error_description TEXT,
    error_source VARCHAR(64),
    error_step VARCHAR(64),
    error_reason VARCHAR(64),
    
    captured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS razorpay_webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id VARCHAR(128) NOT NULL UNIQUE,
    event_type VARCHAR(64) NOT NULL, -- 'payment.captured', 'payment.failed', 'order.paid', 'payment_link.paid'
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    signature_hash VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    processed_status VARCHAR(32) NOT NULL DEFAULT 'processed' CHECK (
        status IN ('processed', 'ignored_duplicate', 'failed', 'invalid_signature')
    ),
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_rzp_orders_org ON razorpay_orders(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_rzp_payments_org ON razorpay_payments(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_rzp_webhooks_event ON razorpay_webhook_deliveries(event_id);

-- Enable RLS
ALTER TABLE razorpay_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE razorpay_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE razorpay_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE razorpay_webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Multi-Tenant Isolation Policies
CREATE POLICY tenant_isolation_rzp_creds ON razorpay_credentials
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_rzp_orders ON razorpay_orders
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_rzp_payments ON razorpay_payments
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_rzp_webhooks ON razorpay_webhook_deliveries
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
