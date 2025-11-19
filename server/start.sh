#!/bin/sh
set -e

# Start nginx (daemonized)
nginx

# Start node server (runs in foreground)
exec node /app/server/index.js
