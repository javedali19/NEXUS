# Development Startup Script (PowerShell)
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Starting Enterprise Platform Development Services" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start Docker Containers if Docker is running
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "[1/3] Starting Local PostgreSQL, Redis & Pub/Sub Emulator..." -ForegroundColor Green
    docker-compose up -d
} else {
    Write-Host "[1/3] Docker not detected; skipping container startup." -ForegroundColor Yellow
}

# 2. Launch Next.js Frontend
Write-Host "[2/3] Launching Next.js Web App on http://localhost:3000..." -ForegroundColor Green
Set-Location "apps\web"
npm run dev
