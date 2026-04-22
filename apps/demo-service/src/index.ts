/**
 * DeployTitan Demo Service
 *
 * A minimal Express app that:
 *  - Serves a message from message.json (edited by demo visitors)
 *  - Reports its own version + cohort in every response
 *  - Sends OTLP spans to DeployTitan for live metrics
 *  - Exposes /health for Cloud Run readiness probes
 *
 * VERSION and COHORT_ID are injected via env vars at deploy time.
 */

import express, { Request, Response } from 'express'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env['PORT'] ?? '8080', 10)
const VERSION = process.env['VERSION'] ?? 'unknown'
const SERVICE_NAME = process.env['SERVICE_NAME'] ?? 'demo-service'
const OTLP_ENDPOINT = process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? 'http://localhost:4318'
const OTLP_FLUSH_MS = parseInt(process.env['OTEL_FLUSH_INTERVAL_MS'] ?? '5000', 10)

// ---------------------------------------------------------------------------
// OTLP telemetry (batched, fire-and-forget)
// ---------------------------------------------------------------------------

interface SpanRecord {
  traceId: string
  spanId: string
  name: string
  startMs: number
  durationMs: number
  statusCode: number
  cohortId?: string
}

const spanBatch: SpanRecord[] = []

function randomHex(bytes: number): string {
  return Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
  ).join('')
}

function recordSpan(
  name: string,
  startMs: number,
  durationMs: number,
  statusCode: number,
  cohortId?: string,
): void {
  spanBatch.push({
    traceId: randomHex(16),
    spanId: randomHex(8),
    name,
    startMs,
    durationMs,
    statusCode,
    cohortId,
  })
}

async function flushSpans(): Promise<void> {
  if (spanBatch.length === 0) return
  const toSend = spanBatch.splice(0, spanBatch.length)

  const payload = {
    resourceSpans: [
      {
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: SERVICE_NAME } },
            { key: 'service.version', value: { stringValue: VERSION } },
          ],
        },
        scopeSpans: [
          {
            scope: { name: SERVICE_NAME, version: VERSION },
            spans: toSend.map((s) => ({
              traceId: s.traceId,
              spanId: s.spanId,
              name: s.name,
              kind: 2, // SERVER
              startTimeUnixNano: String(s.startMs * 1_000_000),
              endTimeUnixNano: String((s.startMs + s.durationMs) * 1_000_000),
              status: { code: s.statusCode >= 500 ? 2 : 1 },
              attributes: [
                { key: 'http.status_code', value: { intValue: s.statusCode } },
                { key: 'service.version', value: { stringValue: VERSION } },
                ...(s.cohortId
                  ? [{ key: 'cohort.id', value: { stringValue: s.cohortId } }]
                  : []),
              ],
            })),
          },
        ],
      },
    ],
  }

  try {
    await fetch(`${OTLP_ENDPOINT}/v1/traces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    // Non-fatal — telemetry must never crash the service
    console.error('[otlp] flush failed:', (err as Error)?.message)
  }
}

setInterval(flushSpans, OTLP_FLUSH_MS)

// ---------------------------------------------------------------------------
// Message loader — reads from disk on each request so the file can be updated
// at build time and reflected without restart
// ---------------------------------------------------------------------------

interface MessageJson {
  text: string
  author: string
  version?: string
  updatedAt?: string
}

function loadMessage(): MessageJson {
  try {
    const raw = readFileSync(join(__dirname, '..', 'message.json'), 'utf8')
    return JSON.parse(raw) as MessageJson
  } catch {
    return { text: '(message unavailable)', author: 'system', version: VERSION }
  }
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express()

app.use((req, res, next) => {
  // Propagate cohort from controller header so telemetry has the dimension
  res.locals['cohortId'] = req.headers['x-cohort-id'] ?? undefined
  next()
})

/**
 * GET /health
 * Used by Cloud Run readiness + liveness probes.
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', version: VERSION, service: SERVICE_NAME })
})

/**
 * GET /message
 * Returns the current message along with routing metadata.
 * This is the endpoint the demo UI fetches through the controller.
 */
app.get('/message', (req: Request, res: Response) => {
  const startMs = Date.now()
  const cohortId = res.locals['cohortId'] as string | undefined

  const message = loadMessage()

  const body = {
    ...message,
    // Always echo the version + cohort so the UI can show "you're on v2, cohort=beta"
    _meta: {
      version: VERSION,
      service: SERVICE_NAME,
      cohortId: cohortId ?? null,
      routedBy: req.headers['x-routed-by'] ?? null,
      routingStrategy: req.headers['x-routing-strategy'] ?? null,
      timestamp: new Date().toISOString(),
    },
  }

  const statusCode = 200
  res.status(statusCode).json(body)

  recordSpan('GET /message', startMs, Date.now() - startMs, statusCode, cohortId)
})

/**
 * GET /
 * Simple root check.
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({ service: SERVICE_NAME, version: VERSION, status: 'ok' })
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const server = createServer(app)

server.listen(PORT, () => {
  console.log(`[demo-service] v${VERSION} listening on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('[demo-service] SIGTERM received, shutting down...')
  flushSpans().finally(() => {
    server.close(() => process.exit(0))
  })
})
