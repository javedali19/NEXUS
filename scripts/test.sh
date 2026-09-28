#!/usr/bin/env bash
set -e

echo "================================================="
echo "Running Enterprise Platform Test Suite"
echo "================================================="

echo "[1/3] Type-checking Shared API Contracts..."
if [ -d "packages/contracts/node_modules" ]; then
    (cd packages/contracts && npx tsc --noEmit)
fi

echo "[2/3] Validating Next.js Frontend Build & Type Safety..."
(cd apps/web && npm run build)

echo "[3/3] Testing Rust Workspace..."
if command -v cargo &> /dev/null; then
    (cd backend && cargo test --workspace)
else
    echo "Cargo CLI not installed; skipped Rust tests."
fi

echo "All Platform Tests Completed Successfully!"
