-- ============================================================================
-- Migration 0005: Organizations, Business Units, Memberships & Auth Sessions
-- ============================================================================

-- 1. Organizations (Primary Multi-Tenant Isolation Unit)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255),
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'enterprise',
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, provisioning
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Business Units (Organizational Subdivisions e.g., North America, EMEA)
CREATE TABLE IF NOT EXISTS business_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL DEFAULT 'Global',
    is_default BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_units FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_business_units ON business_units
    FOR ALL USING (organization_id = current_tenant_id()) WITH CHECK (organization_id = current_tenant_id());

-- 3. User Identity Profiles (Can belong to multiple Organizations)
CREATE TABLE IF NOT EXISTS user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    identity_provider VARCHAR(50) NOT NULL DEFAULT 'google_identity_platform', -- google_identity_platform, saml, local_dev
    provider_subject_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Organization Memberships (Trusted Server-Side RBAC & Context Mapping)
CREATE TABLE IF NOT EXISTS organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_identities(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'sales_agent', -- admin, manager, sales_agent, finance_officer, auditor
    default_business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, invited, suspended
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_memberships_user ON organization_memberships (user_id, status);
CREATE INDEX idx_memberships_org ON organization_memberships (organization_id, status);

-- 5. User Active Sessions & Context State
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_identities(id) ON DELETE CASCADE,
    active_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    active_business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON user_sessions (session_token_hash, expires_at);

-- 6. Server-Side Trusted Membership Verification Function
CREATE OR REPLACE FUNCTION verify_user_organization_membership(
    p_user_id UUID,
    p_organization_id UUID
) RETURNS TABLE (
    is_valid BOOLEAN,
    user_role VARCHAR,
    default_unit_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (m.status = 'active') AS is_valid,
        m.role AS user_role,
        m.default_business_unit_id AS default_unit_id
    FROM organization_memberships m
    WHERE m.user_id = p_user_id
      AND m.organization_id = p_organization_id
      AND m.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
