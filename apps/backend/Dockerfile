# -- build stage --
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9 --registry=https://registry.npmjs.org --fetch-retries=5

COPY package.json .npmrc ./
RUN pnpm install --force

COPY . .
RUN pnpm run build

# -- production stage --
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache dumb-init && npm install -g pnpm@9 --registry=https://registry.npmjs.org --fetch-retries=5

COPY package.json .npmrc ./
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

EXPOSE 5000

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
