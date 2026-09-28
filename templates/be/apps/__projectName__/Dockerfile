# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 · deps — cài toàn bộ dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    HUSKY=0 pnpm install --frozen-lockfile --shamefully-hoist

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 · builder — generate Prisma client + compile TypeScript + prune deps
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable pnpm

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma:generate && pnpm build

# Prune devDependencies sau khi build xong — giữ nguyên generated .prisma/
RUN pnpm prune --prod --ignore-scripts

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 · runner — minimal production image
# Prisma CLI included so migrate deploy can run at container startup via entrypoint
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001 -G nodejs

COPY --from=builder --chown=nestjs:nodejs /app/node_modules             ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist                     ./dist
# Prisma CLI (devDep — explicitly copied so migrate deploy works at runtime)
COPY --from=deps    --chown=nestjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=deps    --chown=nestjs:nodejs /app/node_modules/prisma      ./node_modules/prisma
# Migrations + config needed by prisma migrate deploy
COPY --from=builder --chown=nestjs:nodejs /app/prisma                   ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts         ./prisma.config.ts

COPY --chown=nestjs:nodejs apps/protrack-backend-api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["./docker-entrypoint.sh"]
