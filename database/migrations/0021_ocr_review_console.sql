-- ============================================================================
-- Migration 0021: OCR Review Console & Human-in-the-Loop Audit Trails
-- Review lifecycle, supplier matching linkage, field correction audits,
-- approval/rejection decision ledger, and ERP invoice synchronization
-- ============================================================================

-- 1. Extend ocr_extractions with review workflow states
ALTER TABLE IF EXISTS ocr_extractions
ADD COLUMN IF NOT EXISTS review_status VARCHAR(32) NOT NULL DEFAULT 'pending_review'
    CHECK (review_status IN ('pending_review', 'under_review', 'approved', 'rejected', 'retried')),
ADD COLUMN IF NOT EXISTS matched_vendor_id UUID,
ADD COLUMN IF NOT EXISTS supplier_match_confidence NUMERIC(5, 4) DEFAULT 0.9850,
ADD COLUMN IF NOT EXISTS supplier_match_type VARCHAR(32) DEFAULT 'exact_tax_id'
    CHECK (supplier_match_type IN ('exact_tax_id', 'fuzzy_name', 'manual_override', 'unmatched')),
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(64),
ADD COLUMN IF NOT EXISTS rejection_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 2. OCR Review Audit Trail (Tamper-evident change ledger)
CREATE TABLE IF NOT EXISTS ocr_review_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    extraction_id UUID NOT NULL REFERENCES ocr_extractions(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL, -- document_ingested, supplier_matched, field_corrected, line_item_added, line_item_modified, line_item_deleted, approved, rejected, retried
    field_name VARCHAR(128),
    original_value TEXT,
    corrected_value TEXT,
    actor_id UUID,
    actor_name VARCHAR(255) NOT NULL DEFAULT 'Enterprise Reviewer',
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for review workflows and audit queries
CREATE INDEX IF NOT EXISTS idx_ocr_extractions_review_status ON ocr_extractions(organization_id, review_status);
CREATE INDEX IF NOT EXISTS idx_ocr_extractions_vendor ON ocr_extractions(organization_id, matched_vendor_id);
CREATE INDEX IF NOT EXISTS idx_ocr_audit_logs_extraction ON ocr_review_audit_logs(organization_id, extraction_id, created_at DESC);

-- 4. Row Level Security Policies
ALTER TABLE ocr_review_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ocr_review_audit_logs' AND policyname = 'ocr_review_audit_tenant_isolation'
    ) THEN
        CREATE POLICY ocr_review_audit_tenant_isolation ON ocr_review_audit_logs
            FOR ALL
            USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
    END IF;
END $$;
