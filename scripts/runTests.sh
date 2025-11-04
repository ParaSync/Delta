#!/usr/bin/env bash
set -euo pipefail

if [[ "$API_SERVER_PATH" = '' ]]; then
  echo "Set API_SERVER_PATH"
  exit 1
fi

PREVIEW_PID=""
API_PID=""

cleanup() {
  echo "Stopping servers..."
  [[ -n "$PREVIEW_PID" ]] && kill "$PREVIEW_PID" 2>/dev/null || true
  [[ -n "$API_PID" ]] && kill "$API_PID" 2>/dev/null || true
  wait || true
}
trap cleanup EXIT INT TERM

echo "Running Bun unit tests..."
if ! bun test --pass-with-no-tests; then
  echo "Unit tests failed."
  exit 1
fi

echo "Starting servers for Playwright tests..."

# Start frontend preview
bun run dev &
PREVIEW_PID=$!
echo "Preview server started (PID: $PREVIEW_PID)"

# Install API dependencies
(
  cd "$API_SERVER_PATH"
  bun install
)

# Start API dev server
(
  cd "$API_SERVER_PATH"
  bun run dev
) &
API_PID=$!
echo "API server started (PID: $API_PID)"

# Function to check if a process is alive
is_alive() {
  kill -0 "$1" 2>/dev/null
}

# Watch both background processes; exit if either dies
(
  while true; do
    if ! is_alive "$PREVIEW_PID"; then
      echo "Preview server exited unexpectedly."
      exit 1
    fi
    if ! is_alive "$API_PID"; then
      echo "API server exited unexpectedly."
      exit 1
    fi
    sleep 1
  done
) & WATCH_PID=$!

# Give servers some time to start up
sleep 5

echo "Running Playwright tests..."
export PW_TEST_HTML_REPORT_OPEN='never'
if ! bunx playwright test; then
  echo "Playwright tests failed."
  kill "$WATCH_PID" 2>/dev/null || true
  exit 1
fi

kill "$WATCH_PID" 2>/dev/null || true
echo "All tests passed."

