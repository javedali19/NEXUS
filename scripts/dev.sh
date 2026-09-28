#!/usr/bin/env bash
set -e

echo "================================================="
echo "Starting Enterprise Platform Development Services"
echo "================================================="

if command -v docker &> /dev/null; then
    echo "[1/3] Starting Local PostgreSQL, Redis & Pub/Sub Emulator..."
    docker-compose up -d
else
    echo "[1/3] Docker not detected; skipping container startup."
fi

echo "[2/3] Launching Next.js Web App on http://localhost:3000..."
cd apps/web && npm run dev
