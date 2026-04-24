# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps: install only production dependencies
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --omit=dev

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — runner: copy source + pre-installed node_modules
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN mkdir -p uploads/resumes && chown -R appuser:appgroup /app

USER appuser

EXPOSE ${PORT:-5000}

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO- http://localhost:${PORT:-5000}/api/health || exit 1

# CMD ["sh", "-c", "echo 'Starting on port $PORT' && node index.js"]
CMD ["node", "index.js"]