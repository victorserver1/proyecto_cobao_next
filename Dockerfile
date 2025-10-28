# 1) deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2) build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3) runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# copia .next standalone
COPY --from=builder /app/.next/standalone ./
# copia assets públicos y .next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# puerto de Next
EXPOSE 3000
CMD ["node", "server.js"]