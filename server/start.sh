#!/bin/sh
set -e

# Export Chromium path if installed
if [ -x "/usr/bin/chromium" ]; then
	export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
fi

# Start node server in background so nginx can remain PID 1
node /app/server/index.js &

# Start nginx in foreground (PID 1)
nginx -g 'daemon off;'
