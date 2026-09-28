-- Migration: 0012_payment_domain.sql
-- Description: Multi-tenant Payment Domain (Transactions, Allocations, Payment Links, Attempts, Reconciliation, RLS)

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    
    -- Transaction Identification
    transaction_number VARCHAR(64) NOT NULL,
    provider VARCHAR(32) NOT NULL CHECK (
        provider IN ('razorpay', 'stripe', 'hitpay', 'airwallex', 'cashfree', 'manual_wire', 'ach')
    ),
    provider_transaction_id VARCHAR(128),
    provider_order_id VARCHAR(128),
    
    -- Financial Details
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    fee_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    
    -- Status & Method
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'authorized', 'succeeded', 'failed', 'partially_refunded', 'refunded', 'disputed', 'cancelled')
    ),
    payment_method VARCHAR(64) NOT NULL, -- 'card', 'upi_collect', 'upi_intent', 'paynow_qr', 'bank_transfer', 'ach', 'wallet'
    payment_method_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Allocation Summary
    allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    unallocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    
    -- Timing
    authorized_at TIMESTAMPTZ,
    settled_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    -- Metadata & Audit
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    recorded_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_payment_org_number UNIQUE (organization_id, transaction_number)
);

CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT,
    allocated_amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    allocation_type VARCHAR(32) NOT NULL DEFAULT 'invoice' CHECK (
        allocation_type IN ('invoice', 'deposit', 'credit_memo', 'unallocated_reserve')
    ),
    notes TEXT,
    allocated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    link_token VARCHAR(64) NOT NULL UNIQUE,
    slug VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'completed', 'expired', 'cancelled')
    ),
    allowed_providers TEXT[] NOT NULL DEFAULT ARRAY['stripe', 'razorpay']::TEXT[],
    qr_payload TEXT,
    hosted_url VARCHAR(512) NOT NULL,
    
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    completed_payment_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    
    dispatched_via VARCHAR(32), -- 'email', 'whatsapp', 'sms', 'manual'
    dispatched_to VARCHAR(255),
    views_count INT NOT NULL DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    provider VARCHAR(32) NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    
    status VARCHAR(32) NOT NULL CHECK (
        status IN ('succeeded', 'failed', 'declined', 'timeout', 'blocked_fraud')
    ),
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    gateway_response_code VARCHAR(64),
    decline_code VARCHAR(64),
    decline_reason TEXT,
    error_category VARCHAR(64), -- 'insufficient_funds', 'card_expired', 'do_not_honor', 'network_timeout', 'fraud_suspected'
    
    latency_ms INT NOT NULL DEFAULT 0,
    raw_request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    retry_scheduled_at TIMESTAMPTZ,
    next_fallback_provider VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL,
    payout_batch_id VARCHAR(128),
    bank_statement_reference VARCHAR(128),
    
    status VARCHAR(32) NOT NULL DEFAULT 'unreconciled' CHECK (
        status IN ('unreconciled', 'auto_matched', 'manual_matched', 'disputed', 'chargeback', 'refunded', 'settled_to_ledger')
    ),
    expected_amount NUMERIC(15, 2) NOT NULL,
    cleared_amount NUMERIC(15, 2) NOT NULL,
    difference_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    matched_at TIMESTAMPTZ,
    matched_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_payments_org_status ON payment_transactions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payment_transactions(provider, provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_alloc_payment ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_alloc_invoice ON payment_allocations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_token ON payment_links(link_token);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_recon_status ON payment_reconciliations(organization_id, status);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reconciliations ENABLE ROW LEVEL SECURITY;

-- Multi-Tenant Isolation Policies
CREATE POLICY tenant_isolation_payment_tx ON payment_transactions
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_payment_alloc ON payment_allocations
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_payment_links ON payment_links
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_payment_attempts ON payment_attempts
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_payment_recon ON payment_reconciliations
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
