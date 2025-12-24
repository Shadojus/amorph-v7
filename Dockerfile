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
COPY . .

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

# Copy data and config directories (needed at runtime)
COPY --from=builder --chown=astro:nodejs /app/config ./config
COPY --from=builder --chown=astro:nodejs /app/data ./data
COPY --from=builder --chown=astro:nodejs /app/public ./public

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4323

# Switch to non-root user
USER astro

# Expose port
EXPOSE 4323

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4323/ || exit 1

# Start the server
CMD ["node", "dist/server/entry.mjs"]
