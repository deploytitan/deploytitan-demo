FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace root and this package's manifest
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY apps/demo-service/package.json ./apps/demo-service/

RUN pnpm install --frozen-lockfile --filter @deploytitan-demo/core-service...

COPY apps/demo-service/src/ ./apps/demo-service/src/
COPY apps/demo-service/message.json ./apps/demo-service/message.json

# Bundle to a single CJS file — no node_modules at runtime
RUN pnpm --filter @deploytitan-demo/core-service exec \
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

COPY --from=builder /app/apps/demo-service/dist/main.cjs ./dist/main.cjs
COPY --from=builder /app/apps/demo-service/message.json ./message.json

EXPOSE 8080
CMD ["node", "dist/main.cjs"]
