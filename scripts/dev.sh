#!/usr/bin/env bash
set -e

echo "=== Starting Malayalam Subtitle AI ==="

# Check prerequisites
if ! command -v ffmpeg &> /dev/null; then
    echo "Warning: ffmpeg could not be found in PATH."
fi

# Run processor in background
echo "Starting FastAPI Processor on http://127.0.0.1:8000..."
(
    cd services/processor
    source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate 2>/dev/null || true
    uvicorn app.main:app --reload --port 8000
) &
PROCESSOR_PID=$!

# Trap cleanup
trap "kill $PROCESSOR_PID" EXIT

# Start Next.js Web App
echo "Starting Next.js Web App..."
pnpm --filter web dev
