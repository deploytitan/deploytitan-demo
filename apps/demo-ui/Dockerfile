FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY apps/demo-ui/package.json ./apps/demo-ui/

RUN pnpm install --frozen-lockfile

COPY apps/demo-ui/ ./apps/demo-ui/

# Vite bakes VITE_* vars at build time — passed as --build-arg from CI
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter @deploytitan-demo/demo-ui build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/demo-ui/dist /usr/share/nginx/html

# SPA fallback — all routes → index.html
RUN printf 'server {\n  listen 8080;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' \
  > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
