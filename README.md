# Multi-Tenant Enterprise ERP + CRM + AI Communications Platform

A production-grade, multi-tenant enterprise suite built with Rust, Axum, Next.js, PostgreSQL (Row Level Security), and Google Cloud Platform.

## 🚀 Key Features

- **Unified Core**: Shared customer identity, unified interaction timeline, transactional outbox pattern, shared workflow engine, RBAC + RLS multi-tenant security, and immutable audit logs.
- **Frontend App**: Modern Next.js + TypeScript + Tailwind CSS application featuring dark mode, glassmorphism design, Customer 360 view, ERP module, CRM module, AI Communications hub, Workflow builder, and Audit viewer.
- **Backend Architecture**: Modular Rust Cargo workspace (`common`, `db`, `domain`, `events`, `api`, `worker`) powered by Axum, Tokio, and SQLx.
- **Database & RLS**: PostgreSQL Row-Level Security policies enforcing isolation per tenant.
- **Event Engine**: Transactional outbox table + GCP Pub/Sub asynchronous event dispatching.
- **Infrastructure**: Complete Terraform HCL modules for Google Cloud Run, Cloud SQL, Cloud Pub/Sub, Cloud Tasks, Cloud Scheduler, Cloud Storage, Cloud KMS, Cloud Armor, and Secret Manager.
- **CI/CD**: GitHub Actions workflows using Google Cloud Workload Identity Federation.

---

## 📁 Repository Structure

```
.
├── ARCHITECTURE.md            # Detailed architecture specification & design decisions
├── INTEGRATION.md             # Integration guide, Pub/Sub event schemas & webhook security
├── .env.example               # Environment configuration template
├── .env.test                  # Test environment variables
├── apps/
│   └── web/                   # Next.js Frontend Dashboard App
├── backend/                   # Rust Workspace (Axum API + Outbox/Worker Service)
│   ├── Cargo.toml
│   ├── Dockerfile
│   └── crates/
│       ├── api/
│       ├── common/
│       ├── db/
│       ├── domain/
│       ├── events/
│       └── worker/
├── database/
│   └── migrations/            # SQLx PostgreSQL schema & RLS migrations
├── infrastructure/
│   └── terraform/             # Terraform GCP Infrastructure as Code
└── .github/
    └── workflows/             # CI & CD GitHub Actions workflows
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v18+ (v24.x recommended) & `npm`
- **Rust**: edition 2021 & `cargo` (optional for local Rust building)
- **PostgreSQL**: 14+ with Row Level Security enabled (optional for local DB running)

### Running Frontend Application
```bash
cd apps/web
npm install
npm run dev
```

### Running Backend API (Rust)
```bash
cd backend
cargo run --bin platform-api
```

---

## 🛡 Security & Multi-Tenancy

- **Row Level Security**: Every database query executes `SET LOCAL app.current_tenant_id = '...'`.
- **RBAC**: Fine-grained role permissions (Admin, Manager, Agent, Auditor).
- **Encryption**: KMS key envelope encryption for sensitive payload data at rest.
- **Cloud Armor**: Enterprise edge security rules protecting all exposed endpoints.

# NEXUS
