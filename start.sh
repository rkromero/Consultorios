#!/bin/sh
echo "=== Running prisma db push ==="
./node_modules/.bin/prisma db push --schema=./packages/db/prisma/schema.prisma --skip-generate --accept-data-loss 2>&1
echo "=== Prisma db push completed with exit code: $? ==="
echo "=== Starting API server ==="
exec node apps/api/dist/index.js
