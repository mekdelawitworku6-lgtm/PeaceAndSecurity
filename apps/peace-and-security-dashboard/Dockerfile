# -- dependencies --
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@9 --registry=https://registry.npmjs.org --fetch-retries=5
COPY package.json pnpm-lock.yaml* .npmrc ./
RUN --mount=type=cache,target=/pnpm-store pnpm install --no-frozen-lockfile --force --store-dir=/pnpm-store

# -- build --
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9 --registry=https://registry.npmjs.org --fetch-retries=5
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
ARG NEXT_PUBLIC_DEMO_MODE=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# -- production --
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY package.json pnpm-lock.yaml* .npmrc ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next/cache

USER nextjs

EXPOSE 4000
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "node node_modules/next/dist/bin/next start -p ${PORT:-4000}"]