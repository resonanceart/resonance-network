#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

PORT=3000
SCREENSHOTS_DIR="tests/screenshots"
DEV_PID=""

cleanup() {
  if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    echo "Stopping dev server (PID: $DEV_PID)..."
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

mkdir -p "$SCREENSHOTS_DIR"

# Check if dev server is already running
if curl -s -o /dev/null -w '' "http://localhost:$PORT" 2>/dev/null; then
  echo "Dev server already running on port $PORT"
else
  echo "Starting Next.js dev server..."
  npm run dev &
  DEV_PID=$!

  echo "Waiting for dev server to be ready..."
  RETRIES=30
  until curl -s -o /dev/null -w '' "http://localhost:$PORT" 2>/dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -le 0 ]; then
      echo "Dev server failed to start after 30 seconds"
      exit 1
    fi
    sleep 1
  done
  echo "Dev server is ready."
fi

echo ""
echo "Running Playwright smoke tests..."
npx playwright test tests/smoke.spec.ts --reporter=list

echo ""
echo "Screenshots saved to $SCREENSHOTS_DIR/"
ls -la "$SCREENSHOTS_DIR/"

echo ""
echo "Done."
