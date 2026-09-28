# Multi-stage Dockerfile for Rust Backend Services (API Gateway & Worker)
FROM rust:1.80-slim as builder

WORKDIR /usr/src/platform

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml ./
COPY crates ./crates

RUN cargo build --release

# Runtime Stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/src/platform/target/release/platform-api /app/platform-api
COPY --from=builder /usr/src/platform/target/release/platform-worker /app/platform-worker

ENV PORT=8080
EXPOSE 8080

CMD ["/app/platform-api"]
