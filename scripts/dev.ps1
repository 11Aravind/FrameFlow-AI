# Development launcher script for Windows PowerShell
Write-Host "=== Starting Malayalam Subtitle AI ===" -ForegroundColor Green

# 1. Start FastAPI Processor
Write-Host "Starting FastAPI Processor on port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/processor; .\.venv\Scripts\activate; uvicorn app.main:app --reload --port 8000"

# 2. Start Next.js Web App
Write-Host "Starting Next.js Web App on port 3000..." -ForegroundColor Cyan
pnpm --filter web dev
