# ═══════════════════════════════════════════════════════════════════════════════
# AMORPH v7 - Production Dockerfile
# Astro SSR with Node.js Adapter
# ═══════════════════════════════════════════════════════════════════════════════

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source files
COPY src ./src
COPY public ./public
COPY config-local ./config
COPY data-local ./data
COPY astro.config.mjs ./
COPY tsconfig.json ./

# Build the application
RUN npm run build

# ═══════════════════════════════════════════════════════════════════════════════
# Production stage - minimal image
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copy built application from builder
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Copy config and public directories
COPY --from=builder --chown=astro:nodejs /app/config ./config
COPY --from=builder --chown=astro:nodejs /app/public ./public
COPY --from=builder --chown=astro:nodejs /app/data ./data

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
ENV POCKETBASE_URL=http://pocketbase:8090
ENV DATA_SOURCE=pocketbase
ENV ENABLE_CACHE=true
ENV CACHE_TTL=300

# Switch to non-root user
USER astro

# Expose port
EXPOSE 4321

# Health check via API endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4321/api/health || exit 1

# Start the server
CMD ["node", "dist/server/entry.mjs"]
