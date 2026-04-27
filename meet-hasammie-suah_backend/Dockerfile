# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

COPY src ./src

RUN npm run db:generate
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY --from=builder /app/dist    ./dist
COPY --from=builder /app/prisma  ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN mkdir -p /app/uploads && chmod 755 /app/uploads

EXPOSE 4000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/index.js"]