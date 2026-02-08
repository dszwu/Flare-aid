# ── Build stage ──────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json* ./

# Copy all packages
COPY packages/common ./packages/common
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/web ./packages/web

# Install dependencies
RUN npm install --workspace=packages/web --workspace=packages/common --ignore-scripts

# Build the Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=packages/web

# ── Production stage ────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (includes node_modules, server.js, .next/server)
COPY --from=builder /app/packages/web/.next/standalone ./

# Copy static assets and public files
COPY --from=builder /app/packages/web/.next/static ./packages/web/.next/static
COPY --from=builder /app/packages/web/public ./packages/web/public

# Copy seed script and DB tools for initialization
COPY --from=builder /app/packages/web/src/db/seed.ts ./seed.ts
COPY --from=builder /app/packages/common ./packages/common

# Create data directory for SQLite persistent volume
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV FLAREAID_DB_PATH=/data/flareaid.db

CMD ["node", "packages/web/server.js"]
