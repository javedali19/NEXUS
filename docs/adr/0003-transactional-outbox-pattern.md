# ADR 0003: Transactional Outbox Pattern for Distributed Events

## Status
Accepted

## Context
When business actions occur (such as paying an ERP invoice or converting a CRM lead), other platform modules and external systems must be notified asynchronously. Directly publishing to message brokers within the HTTP request lifecycle introduces dual-write inconsistencies if the database commits but the message broker publish fails (or vice versa).

## Decision
We implement the Transactional Outbox Pattern:
1. Every domain mutation writes both the entity change and an `outbox_events` record inside the same PostgreSQL transaction.
2. A dedicated asynchronous Rust worker service polls unprocessed outbox records, publishes them to Google Cloud Pub/Sub, and marks them as published.
3. Event consumers process messages idempotently based on unique `event_id`.

## Consequences
- **Positive**: Guaranteed at-least-once event delivery with zero dual-write data loss.
- **Positive**: Decouples API latency from external message broker network round-trips.
- **Negative**: Adds eventual consistency latency (typically < 100ms) for background event consumers.
