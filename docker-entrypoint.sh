#!/bin/sh
set -e

# Start the Next.js production server
exec node packages/web/server.js
