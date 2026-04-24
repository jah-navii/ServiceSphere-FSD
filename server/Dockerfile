# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps: install only production dependencies
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifests first so Docker layer-caches the install step
COPY package.json package-lock.json* ./

RUN npm install --omit=dev

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — runner: copy source + pre-installed node_modules
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Bring in production deps from the previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (respects .dockerignore)
COPY . .

# uploads/ must be writable for resume uploads
RUN mkdir -p uploads/resumes && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Healthcheck so docker compose knows when the API is ready
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "index.js"]
