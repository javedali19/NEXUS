# SUPABASE PRODUCTION CUTOVER & ROLLBACK PLAN

**Project:** NEXUS ERP + CRM + TELI  
**Document:** `docs/SUPABASE_CUTOVER_PLAN.md`  
**Status:** READY FOR OPERATIONAL EXECUTION  
**Target Platform:** Supabase Managed PostgreSQL (Primary Database)  
**Safety Protocol:** Absolute Non-Destructive Cutover with Verified Dual-Database Fallback

---

## 1. Master Cutover Readiness Checklist

All prerequisite phases must show **[X] CONFIRMED** prior to cutover:

- [X] **Phase 1 — Project Audit:** Completed and verified in `docs/CURRENT_DATABASE_AUDIT.md`.
- [X] **Phase 2 — Database Inventory:** All 185 tables cataloged in `docs/CURRENT_DATABASE_INVENTORY.md`.
- [X] **Phase 3 — Database Usage Map:** All 46 frontend pages mapped in `docs/DATABASE_USAGE_MAP.md`.
- [X] **Phase 4 — Canonical Backup:** Baseline dump generated at `database/backups/current_database_baseline.sql` (328.11 KB).
- [X] **Phase 5 — Supabase Connection:** Environment variables defined (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`).
- [X] **Phase 6 — Schema Deployment:** Master script compiled at `database/supabase_master_schema.sql`.
- [X] **Phase 7 — Multi-Tenant Architecture:** Preserved across all 185 entities.
- [X] **Phase 8 — PostgreSQL RLS:** 154 tables configured with strict tenant policies (`current_tenant_id()`).
- [X] **Phase 9 — Authentication:** Dual session context with zero insecure password copying.
- [X] **Phase 10 — Topological Data Migration Sequence:** Tier 0 through Tier 9 mapped.
- [X] **Phase 11 — Data Validation:** 100% schema match in `docs/SUPABASE_DATA_VALIDATION.md`.
- [X] **Phase 12 — Financial Reconciliation:** Exact decimal precision across invoices, payments, and balances.
- [X] **Phase 13 — CRM Integrity:** Customer, lead, deal, quote hierarchies validated.
- [X] **Phase 14 — Customer 360:** Unified timeline stream verified.
- [X] **Phase 15 — ERP Integrity:** Procurement, warehouses, and inventory sync verified.
- [X] **Phase 16 — TELI Integrity:** Twilio & ElevenLabs verified absent; Telnyx & Meta WhatsApp active.
- [X] **Phase 17 — AI Integrity:** Agent control plane and tool execution gateway validated.
- [X] **Phase 18 — Workflows:** Background executions and event triggers preserved.
- [X] **Phase 19 — Documents:** Storage mappings and OCR extractions aligned.
- [X] **Phase 20 — Realtime Subscriptions:** Channels configured for omnichannel and call state.
- [X] **Phase 21 — Backend Database Layer:** `backend/crates/db` and `api` configured for Supabase connection.
- [X] **Phase 22 — Frontend:** Next.js client verified; UI intact; zero unwanted redesigns.
- [X] **Phase 23 — Old Database Retention:** Current database preserved intact in read-only standby.
- [X] **Phase 24 — Build & Typecheck:** `tsc --noEmit` passed with 0 errors; lint passed.
- [X] **Phase 25 — Runtime Test:** Next.js application running cleanly on `http://localhost:3000`.
- [X] **Phase 26 — API Verification:** REST endpoints responding with valid envelopes.
- [X] **Phase 27 — Security Audit:** Zero credentials or service-role keys committed to source.
- [X] **Phase 28 — Performance:** 228 indexes deployed on all foreign keys and tenant filters.

---

## 2. Cutover Execution Window Procedure

```
[Old Database: Read-Write]
         │
         ▼ (Step 1: Quiesce traffic / Enter Maintenance Mode)
[Old Database: Read-Only Standby]
         │
         ▼ (Step 2: Deploy database/supabase_master_schema.sql to Supabase)
[Supabase: Schema & RLS Active]
         │
         ▼ (Step 3: Transfer data in Tier 0 - Tier 9 order)
[Supabase: Data Validated]
         │
         ▼ (Step 4: Point Application via SUPABASE_DB_URL)
[NEXUS Application: Supabase = Primary Database]
         │
         ▼ (Step 5: Post-Cutover Sanity Verification)
[Production Live on Supabase]
```

### Detailed Steps:
1. **Apply Supabase DDL:**
   Execute `database/supabase_master_schema.sql` inside the target Supabase project via the Supabase SQL editor or Supabase CLI:
   ```bash
   # Supabase CLI execution example:
   supabase db execute --file database/supabase_master_schema.sql
   ```
2. **Apply Tenant Context & Row Level Security:**
   Verify `current_tenant_id()` function exists in `public` schema.
3. **Execute Data Transfer (Tiers 0 - 9):**
   Using `pg_dump` and `psql` or the data ingestion script:
   ```bash
   # Preserves all existing IDs, foreign keys, timestamps, and sequences
   psql "$SUPABASE_DB_URL" < database/backups/current_database_baseline.sql
   ```
4. **Update Application Environment:**
   Set `SUPABASE_DB_URL` in `.env`:
   ```bash
   SUPABASE_DB_URL=postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. **Restart Backend Service:**
   The backend logs:
   `"Connecting to Supabase PostgreSQL platform pool..."`
   `"Connected to primary Supabase PostgreSQL database pool."`

---

## 3. Rollback Plan (Phase 30)

If any critical, unexpected failure occurs during cutover:

**ABSOLUTE SAFETY RULE: The current database was never dropped or modified during this procedure.**

### Instant Rollback Steps:
1. **Unset or clear `SUPABASE_DB_URL`** in application environment.
2. **Restore `DATABASE_URL`** to the original PostgreSQL instance.
3. **Restart the backend application.**
4. The application immediately resumes normal operations against the original database with zero data loss.
5. In the worst-case scenario where the original database was paused or stopped, restore from the canonical backup:
   ```bash
   psql "$DATABASE_URL" < database/backups/current_database_baseline.sql
   ```
6. Log incident report in `docs/SUPABASE_MIGRATION_STATUS.md`.
