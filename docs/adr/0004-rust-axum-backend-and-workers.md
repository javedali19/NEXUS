# ADR 0004: Rust + Axum + Tokio for Backend Services & Workers

## Status
Accepted

## Context
The platform requires high throughput, minimal memory footprint, zero data races, and predictable sub-millisecond execution times for handling real-time AI comms telemetry, ERP transactions, and background task processing.

## Decision
We adopt a modular Rust Cargo workspace:
- **Axum**: Modular, type-safe web framework integrated with Tokio and Tower middleware.
- **Tokio**: Production-grade async runtime.
- **SQLx**: Async SQL toolkit with compile-time query verification and native PostgreSQL support.
- **Crates separation**: `common`, `db`, `domain`, `events`, `api`, and `worker`.

## Consequences
- **Positive**: Exceptional performance and safety; low resource footprint on Google Cloud Run serverless containers.
- **Positive**: Strict type safety guarantees across domain boundaries.
- **Negative**: Longer compilation times compared to interpreted runtime environments.
