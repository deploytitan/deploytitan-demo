FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace root and this package's manifest
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY apps/demo-api/package.json ./apps/demo-api/

RUN pnpm install --frozen-lockfile --filter @deploytitan-demo/deploytitan-proxy...

COPY apps/demo-api/src/ ./apps/demo-api/src/

# Bundle to a single CJS file — no node_modules at runtime
RUN pnpm --filter @deploytitan-demo/deploytitan-proxy exec \
  esbuild src/index.ts \
  --bundle \
  --platform=node \
  --target=node22 \
  --format=cjs \
  --outfile=dist/main.cjs \
  --minify-syntax \
  --minify-whitespace \
  --keep-names

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/demo-api/dist/main.cjs ./dist/main.cjs

EXPOSE 3001
CMD ["node", "dist/main.cjs"]
