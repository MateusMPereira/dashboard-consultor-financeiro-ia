#!/bin/sh
set -e

# Start nginx in background (daemon)
nginx || true

# Export Chromium path if installed
if [ -x "/usr/bin/chromium" ]; then
	export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
fi

# Start node server (runs in foreground)
exec node /app/server/index.js
