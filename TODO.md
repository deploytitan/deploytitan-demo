# DeployTitan Demo - Implementation TODO

## Overview
This document tracks the implementation of the DeployTitan demo project. The demo showcases:
- Real deployments triggered by visitors
- Cohort-based routing (killer feature)
- Percentage-based progressive rollouts
- Live traffic visualization

**Timeline:** 1-2 days (MVP)
**Target:** Hacker News & Product Hunt launch

---

## Phase 1: Backend API Extensions ✅

### 1.1 Database Schema
- [x] Add table: `cohort_routing_rules`
- [x] Add table: `default_routing`
- [x] Add table: `traffic_splits`
- [x] Add column: `routing_strategy` to `services` table
- [x] Add column: `cohort_id` to `spans` table
- [x] Add column: `cohort_id` to `endpoint_metrics` table
- [x] Switch from migrations to `drizzle-kit push --force`

### 1.2 Routing Config Endpoint
- [x] `GET /routing-config/:serviceName/:environment`
- [x] Query percentage splits + cohort rules
- [x] Return combined config

### 1.3 Traffic Split Endpoint
- [x] `POST /traffic-split`
- [x] Validate percentages sum to 100
- [x] Update `traffic_splits` table

### 1.4 Cohort Routing Endpoint
- [x] `POST /cohort-routing`
- [x] Update `cohort_routing_rules` + `default_routing` tables

### 1.5 Telemetry Ingestion
- [x] Extract `cohort_id` from span attributes
- [x] Store in `spans` + `endpoint_metrics` tables

---

## Phase 2: Controller ✅

### 2.1 Core implementation
- [x] `src/types.ts` — RoutingConfig + ControllerConfig interfaces
- [x] `src/config.ts` — env var loader
- [x] `src/config-manager.ts` — polls DeployTitan API every 5s
- [x] `src/router.ts` — cohort > rollback > percentage routing logic
- [x] `src/telemetry.ts` — OTLP span batcher (flushes every 10s)
- [x] `src/proxy.ts` — Node http.Server reverse proxy
- [x] `src/main.ts` — wires everything + graceful shutdown

### 2.2 Build pipeline
- [x] `build.mjs` — esbuild: bundle + minify + mangle identifiers
- [x] Single output file `dist/main.js` (~5.7 kB, no node_modules at runtime)
- [x] `legalComments: 'none'` — strips all comment banners
- [x] `minifyIdentifiers: true` — obfuscates local names
- [x] Dockerfile updated: runner stage copies only `dist/main.js`

### 2.3 Infra
- [x] `Dockerfile`
- [x] `.env.example`
- [x] Zero TypeScript errors

---

## Phase 3: Demo Service ✅

- [x] `apps/demo-service/src/index.ts` — Express, `/message` + `/health`
- [x] OTLP telemetry with cohort dimension
- [x] `message.json` — initial message
- [x] `Dockerfile`, `.dockerignore`, `.env.example`
- [x] Converted from JS → TypeScript (tsx runtime)

---

## Phase 4: Demo API ✅

- [x] `apps/demo-api/src/index.ts` — BFF Express server
- [x] `POST /api/commit` — visitor message → GitHub commit
- [x] `GET /api/events` — SSE stream (deployment + routing events)
- [x] `GET /api/message` — proxy to controller with cohort header
- [x] `GET /api/routing` — current routing config
- [x] In-process rate limiter (1 commit/IP/60s)
- [x] Profanity filter
- [x] `Dockerfile`, `.env.example`
- [x] Converted from JS → TypeScript (tsx runtime)

---

## Phase 5: Demo UI ✅

- [x] React + Vite + Tailwind v4 + animejs
- [x] Full design system (gold `#c9a84c`, warm minimalism, blueprint grid)
- [x] `ChangeGenerator.tsx` — message form → GitHub commit
- [x] `DeploymentTimeline.tsx` — live SSE event log
- [x] `TrafficControl.tsx` — percentage/cohort split viewer
- [x] `CohortTester.tsx` — test X-Cohort-ID routing
- [x] `hooks/useApi.ts` — SSE, message fetch, commit, routing hooks
- [x] `hooks/useAnimations.ts` — scroll reveal + spotlight
- [x] Production build passes (76 kB gzip)

---

## Phase 5.5: Monorepo Setup ✅

- [x] `pnpm-workspace.yaml` — `apps/*` + `packages/*`
- [x] Root `package.json` with turbo scripts
- [x] `turbo.json` — build/dev/start/typecheck pipeline
- [x] `packages/tsconfig/base.json` — shared TS config for Node apps
- [x] All packages renamed to `@deploytitan-demo/*`
- [x] `pnpm install` — clean install, all deps resolved

---

## Phase 6: GCP Setup & Deployment 🔲

### 6.1 GCP Project
- [ ] Create GCP project: `deploytitan-demo`
- [ ] Enable Cloud Run API + Cloud Build API + Artifact Registry
- [ ] Create service account with Cloud Run deployer role
- [ ] Download service account key → GitHub secret `GCP_SA_KEY`

### 6.2 Deploy Controller
- [ ] Build & push Docker image to Artifact Registry
- [ ] Deploy to Cloud Run (min-instances=1, internal + Cloud Run ingress)
- [ ] Set env vars: `DEPLOYTITAN_API_URL`, `DEPLOYTITAN_API_KEY`, `SERVICE_NAME`, `ENVIRONMENT`
- [ ] Verify `/health` responds

### 6.3 Deploy Demo Service
- [ ] Build & push Docker image
- [ ] Deploy to Cloud Run (internal only, no direct public access)
- [ ] Set env vars: `VERSION`, `SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`
- [ ] Verify `/message` + `/health`

### 6.4 Deploy Demo API
- [ ] Build & push Docker image
- [ ] Deploy to Cloud Run (public)
- [ ] Set env vars: `GITHUB_TOKEN`, `GITHUB_OWNER`, `CONTROLLER_URL`, `DEPLOYTITAN_API_URL`, `DEPLOYTITAN_API_KEY`
- [ ] Verify all endpoints

### 6.5 Deploy Demo UI
- [ ] Build production bundle (`pnpm build`)
- [ ] Deploy to Cloud Run (or Firebase Hosting)
- [ ] Point `VITE_API_URL` at demo-api
- [ ] Verify UI loads and connects to SSE

### 6.6 GitHub Actions
- [ ] Add secrets: `GCP_SA_KEY`, `DEPLOYTITAN_API_KEY`, `GITHUB_TOKEN`
- [ ] Verify `.github/workflows/deploy.yml` progressive rollout works end-to-end

### 6.7 End-to-End Testing
- [ ] Submit message → triggers deployment
- [ ] Watch deployment timeline in UI
- [ ] Adjust percentage split → controller re-routes within 5s
- [ ] Send request as beta-testers cohort → gets pinned revision
- [ ] Metrics show cohort dimension in DeployTitan dashboard

---

## Phase 7: Viral Optimization 🔲

### 7.1 Hacker News
- [ ] Title: "Show HN: Trigger a real production deployment from your browser"
- [ ] First comment draft
- [ ] Demo GIF/video

### 7.2 Product Hunt
- [ ] Listing, tagline, screenshots, first comment

### 7.3 Final Polish
- [ ] "How it works" section in UI
- [ ] Helpful tooltips
- [ ] Mobile responsive check
- [ ] Error boundaries + loading states
- [ ] Social sharing meta tags + analytics

---

## Success Criteria

- [ ] Visitors trigger deployments without signup
- [ ] Cohort routing works flawlessly
- [ ] Percentage routing works flawlessly
- [ ] Live visualization updates in real-time
- [ ] Metrics show cohort dimension
- [ ] Handles 100+ concurrent users
- [ ] UI loads < 2s
- [ ] Mobile responsive

---

Last Updated: 2026-04-23
