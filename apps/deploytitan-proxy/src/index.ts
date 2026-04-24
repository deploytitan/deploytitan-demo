/**
 * DeployTitan Demo API
 *
 * Thin Express server that the demo UI talks to. Never exposed to the demo
 * service directly — it sits alongside the UI backend.
 *
 * POST /api/commit        — visitor writes a message → GitHub commit → CI deploy
 * GET  /api/events        — SSE stream of DeployTitan deployment events
 * GET  /api/message       — proxy to controller with visitor cohort header
 * GET  /api/routing       — current routing config (for the UI traffic panel)
 * GET  /health            — healthcheck
 *
 * SSE events emitted on /api/events:
 *   connected   — sent once on connect (initial snapshot of routing + deployments follows)
 *   routing     — raw routing config (RoutingConfig shape)
 *   deployments — enriched versions list ({ strategy, versions[] })
 *   commit      — GitHub commit broadcast after POST /api/commit
 */

import cors from 'cors'
import express, { Request, Response } from 'express'
import { createServer } from 'node:http'
import {
  CONTROLLER_URL,
  CORE_SERVICE_NAME,
  CORS_ORIGIN,
  DEPLOYTITAN_API_KEY,
  DEPLOYTITAN_API_URL,
  ENVIRONMENT,
  GITHUB_BRANCH,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_TOKEN,
  PORT,
} from './env.js'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Simple in-process rate limiter: max 1 commit per IP per 60s
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW_MS = 10_000

function isRateLimited(ip: string): boolean {
  const last = rateLimitMap.get(ip) ?? 0
  if (Date.now() - last < RATE_LIMIT_WINDOW_MS) return true
  rateLimitMap.set(ip, Date.now())
  return false
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, ts] of rateLimitMap.entries()) {
    if (now - ts > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(ip)
  }
}, 60_000)

// ---------------------------------------------------------------------------
// Profanity filter (minimal word list — extend as needed)
// ---------------------------------------------------------------------------

const BLOCKED = ['fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'nigger', 'faggot']

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKED.some((w) => lower.includes(w))
}

// ---------------------------------------------------------------------------
// GitHub helper — commit message.json via Contents API
// ---------------------------------------------------------------------------

interface GitHubFileResponse {
  sha: string
}

interface GitHubCommitResponse {
  commit: { sha: string }
}

async function commitMessage(text: string, author: string, email?: string): Promise<string> {
  const path = 'apps/demo-service/message.json'
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`

  // Get current file SHA (required for update)
  const getRes = await fetch(`${apiBase}/contents/${path}?ref=${GITHUB_BRANCH}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal: AbortSignal.timeout(10_000),
  })

  if (!getRes.ok) {
    throw new Error(`GitHub GET file failed: ${getRes.status}`)
  }

  const fileData = (await getRes.json()) as GitHubFileResponse

  const newContent = JSON.stringify(
    {
      text,
      author,
      version: '1.0.0', // CI will overwrite with commit SHA
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  )

  const encoded = Buffer.from(newContent).toString('base64')

  // Use visitor's name + email in git author metadata if provided
  const authorObj = {
    name: author,
    email: email ?? `${author.toLowerCase().replace(/\s+/g, '.')}@demo.deploytitan.com`,
    date: new Date().toISOString(),
  }

  const putRes = await fetch(`${apiBase}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message: `demo: "${text.slice(0, 50)}" by ${author}`,
      content: encoded,
      sha: fileData.sha,
      branch: GITHUB_BRANCH,
      author: authorObj,
      committer: authorObj,
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!putRes.ok) {
    const body = await putRes.text()
    throw new Error(`GitHub PUT file failed: ${putRes.status} ${body}`)
  }

  const result = (await putRes.json()) as GitHubCommitResponse
  return result.commit.sha
}

// ---------------------------------------------------------------------------
// Deployments helper — build enriched versions list from routing config
// ---------------------------------------------------------------------------

type RawRoutingConfig = {
  strategy: string
  percentageRouting?: {
    versions: Array<{
      deploymentId: string
      version: string
      targetIdentifier: string
      percentage: number
      healthy: boolean
    }>
  }
  cohortRouting?: {
    cohorts: Array<{
      cohortId: string
      deploymentId: string
      version: string
      targetIdentifier: string
      priority: number
      healthy: boolean
    }>
    defaultVersion: { deploymentId: string; version: string; targetIdentifier: string }
  }
}

function buildDeploymentsPayload(routing: RawRoutingConfig) {
  const versionMap = new Map<string, {
    deploymentId: string
    version: string
    targetIdentifier: string
    healthy: boolean
    percentage?: number
    cohortId?: string
    isDefault?: boolean
  }>()

  for (const v of routing.percentageRouting?.versions ?? []) {
    versionMap.set(v.deploymentId, {
      deploymentId: v.deploymentId,
      version: v.version,
      targetIdentifier: v.targetIdentifier,
      healthy: v.healthy,
      percentage: v.percentage,
    })
  }
  for (const c of routing.cohortRouting?.cohorts ?? []) {
    const existing = versionMap.get(c.deploymentId)
    if (existing) {
      existing.cohortId = c.cohortId
    } else {
      versionMap.set(c.deploymentId, {
        deploymentId: c.deploymentId,
        version: c.version,
        targetIdentifier: c.targetIdentifier,
        healthy: c.healthy,
        cohortId: c.cohortId,
      })
    }
  }
  if (routing.cohortRouting?.defaultVersion) {
    const def = routing.cohortRouting.defaultVersion
    const existing = versionMap.get(def.deploymentId)
    if (existing) {
      existing.isDefault = true
    } else {
      versionMap.set(def.deploymentId, {
        deploymentId: def.deploymentId,
        version: def.version,
        targetIdentifier: def.targetIdentifier,
        healthy: true,
        isDefault: true,
      })
    }
  }

  const versions = Array.from(versionMap.values()).map((v) => ({
    ...v,
    githubUrl: GITHUB_OWNER
      ? `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/commit/${v.version}`
      : null,
  }))

  return { strategy: routing.strategy, versions }
}

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

const sseClients = new Set<Response>()

function broadcastSSE(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const client of sseClients) {
    client.write(payload)
  }
}

// Fetch routing config from DeployTitan, broadcast routing + deployments SSE events.
// Also returns the raw config so the caller can send an initial snapshot to a single client.
async function fetchAndBroadcastDeployments(singleClient?: Response): Promise<void> {
  if (!DEPLOYTITAN_API_URL || !DEPLOYTITAN_API_KEY) return

  try {
    const res = await fetch(
      `${DEPLOYTITAN_API_URL}/routing-config/${encodeURIComponent(CORE_SERVICE_NAME)}/${encodeURIComponent(ENVIRONMENT)}`,
      {
        headers: {
          Authorization: `Bearer ${DEPLOYTITAN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      },
    )

    if (!res.ok) return

    const config = (await res.json()) as RawRoutingConfig
    const deploymentsPayload = buildDeploymentsPayload(config)

    if (singleClient) {
      // Initial snapshot for a newly connected client only
      singleClient.write(`event: routing\ndata: ${JSON.stringify(config)}\n\n`)
      singleClient.write(`event: deployments\ndata: ${JSON.stringify(deploymentsPayload)}\n\n`)
    } else {
      broadcastSSE('routing', config)
      broadcastSSE('deployments', deploymentsPayload)
    }
  } catch {
    // Silently ignore poll errors — SSE clients stay connected
  }
}

// Poll every 3 seconds; skip if no clients are connected
function pollDeploymentEvents(): void {
  if (sseClients.size === 0) return
  void fetchAndBroadcastDeployments()
}

setInterval(pollDeploymentEvents, 3000)

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express()

app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  }),
)

app.use(express.json({ limit: '10kb' }))

/**
 * GET /health
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-traffic-controller' })
})

/**
 * POST /api/commit
 * Body: { text: string, author?: string, email?: string }
 */
app.post('/api/commit', (req: Request, res: Response) => {
  void (async () => {
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ?? req.ip ?? 'unknown'

    if (isRateLimited(ip)) {
      res.status(429).json({
        error: 'Too many requests. Please wait a moment before submitting again.',
      })
      return
    }

    const { text, author = 'anonymous', email } = (req.body ?? {}) as {
      text?: unknown
      author?: unknown
      email?: unknown
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'text is required' })
      return
    }

    if (text.length > 140) {
      res.status(400).json({ error: 'text must be 140 characters or fewer' })
      return
    }

    if (containsProfanity(text)) {
      res.status(400).json({ error: 'Message contains inappropriate content' })
      return
    }

    if (typeof author !== 'string' || author.length > 50) {
      res.status(400).json({ error: 'author must be 50 characters or fewer' })
      return
    }

    // Validate email if provided
    const emailStr = typeof email === 'string' && email.trim().length > 0 ? email.trim() : undefined
    if (emailStr && (emailStr.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr))) {
      res.status(400).json({ error: 'invalid email address' })
      return
    }

    const missingGitHubConfig: string[] = []
    if (!GITHUB_TOKEN) missingGitHubConfig.push('GITHUB_TOKEN')
    if (!GITHUB_OWNER) missingGitHubConfig.push('GITHUB_OWNER')

    if (missingGitHubConfig.length > 0) {
      res.status(503).json({
        error: 'GitHub integration not configured',
        missing: missingGitHubConfig,
      })
      return
    }

    try {
      const authorStr = (author as string).trim()
      const commitSha = await commitMessage(text.trim(), authorStr, emailStr)

      broadcastSSE('commit', {
        sha: commitSha,
        message: text.trim(),
        author: authorStr,
        timestamp: new Date().toISOString(),
      })

      res.json({ success: true, commitSha })
    } catch (err) {
      console.error('[commit] error:', err)
      res.status(500).json({ error: 'Failed to commit message' })
    }
  })()
})

/**
 * GET /api/events
 * Server-Sent Events stream — deployment updates, routing changes, commits.
 */
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // disable nginx buffering
  res.flushHeaders()

  // Send connected event immediately
  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`)

  sseClients.add(res)

  // Send initial routing + deployments snapshot so the UI doesn't wait up to 3s
  void fetchAndBroadcastDeployments(res)

  // Heartbeat every 20s to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n')
  }, 20_000)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseClients.delete(res)
  })
})

/**
 * GET /api/message?cohort=<cohort-id>
 * Proxies to the controller, injecting the cohort header.
 */
app.get('/api/message', (req: Request, res: Response) => {
  void (async () => {
    const cohortId = req.query['cohort']?.toString()

    if (!CONTROLLER_URL) {
      res.status(503).json({ error: 'Controller not configured' })
      return
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (cohortId) headers['x-cohort-id'] = cohortId

      const upstream = await fetch(`${CONTROLLER_URL}/message`, {
        headers,
        signal: AbortSignal.timeout(10_000),
      })

      const body = await upstream.json()
      res.status(upstream.status).json(body)
    } catch (err) {
      console.error('[proxy] error:', (err as Error)?.message)
      res.status(502).json({ error: 'Failed to reach controller' })
    }
  })()
})

/**
 * GET /api/deployments
 * Returns versions known to DeployTitan for this service, enriched with
 * GitHub commit URLs and current cohort/traffic assignments.
 * Prefer consuming the `deployments` SSE event from /api/events instead.
 */
app.get('/api/deployments', (_req: Request, res: Response) => {
  void (async () => {
    if (!DEPLOYTITAN_API_URL || !DEPLOYTITAN_API_KEY) {
      res.status(503).json({ error: 'DeployTitan not configured' })
      return
    }
    try {
      const routingRes = await fetch(
        `${DEPLOYTITAN_API_URL}/routing-config/${encodeURIComponent(CORE_SERVICE_NAME)}/${encodeURIComponent(ENVIRONMENT)}`,
        { headers: { Authorization: `Bearer ${DEPLOYTITAN_API_KEY}` }, signal: AbortSignal.timeout(5000) },
      )
      if (!routingRes.ok) { res.status(routingRes.status).json(await routingRes.json()); return }

      const routing = (await routingRes.json()) as RawRoutingConfig
      res.json(buildDeploymentsPayload(routing))
    } catch (err) {
      console.error('[deployments] error:', (err as Error)?.message)
      res.status(502).json({ error: 'Failed to fetch deployments' })
    }
  })()
})

/**
 * POST /api/cohort
 * Body: { cohorts: Array<{ cohortId: string; deploymentId: string; priority?: number }>, defaultDeploymentId: string }
 * Switches routing to cohort strategy.
 */
app.post('/api/cohort', (req: Request, res: Response) => {
  void (async () => {
    if (!DEPLOYTITAN_API_URL || !DEPLOYTITAN_API_KEY) {
      res.status(503).json({ error: 'DeployTitan not configured' }); return
    }
    const body = req.body as { cohorts?: Array<{ cohortId: string; deploymentId: string; priority?: number }>; defaultDeploymentId?: string }
    if (!body.defaultDeploymentId) { res.status(400).json({ error: 'defaultDeploymentId is required' }); return }
    if (!Array.isArray(body.cohorts)) { res.status(400).json({ error: 'cohorts must be an array' }); return }
    try {
      const upstream = await fetch(`${DEPLOYTITAN_API_URL}/cohort-routing`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${DEPLOYTITAN_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: CORE_SERVICE_NAME, environment: ENVIRONMENT, strategy: 'cohort',
          cohorts: body.cohorts.map((c, i) => ({ cohortId: c.cohortId, deploymentId: c.deploymentId, priority: c.priority ?? (body.cohorts!.length - i) })),
          defaultDeploymentId: body.defaultDeploymentId,
        }),
        signal: AbortSignal.timeout(10_000),
      })
      res.status(upstream.status).json(await upstream.json())
    } catch (err) {
      console.error('[cohort] error:', (err as Error)?.message)
      res.status(502).json({ error: 'Failed to update cohort routing' })
    }
  })()
})

/**
 * POST /api/traffic
 * Body: { splits: Array<{ deploymentId: string; percentage: number }> }
 * Switches back to percentage routing.
 */
app.post('/api/traffic', (req: Request, res: Response) => {
  void (async () => {
    if (!DEPLOYTITAN_API_URL || !DEPLOYTITAN_API_KEY) {
      res.status(503).json({ error: 'DeployTitan not configured' }); return
    }
    const body = req.body as { splits?: Array<{ deploymentId: string; percentage: number }> }
    if (!Array.isArray(body.splits) || body.splits.length === 0) { res.status(400).json({ error: 'splits array is required' }); return }
    try {
      const upstream = await fetch(`${DEPLOYTITAN_API_URL}/traffic-split`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${DEPLOYTITAN_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName: CORE_SERVICE_NAME, environment: ENVIRONMENT, strategy: 'percentage', splits: body.splits }),
        signal: AbortSignal.timeout(10_000),
      })
      res.status(upstream.status).json(await upstream.json())
    } catch (err) {
      console.error('[traffic] error:', (err as Error)?.message)
      res.status(502).json({ error: 'Failed to update traffic split' })
    }
  })()
})

/**
 * GET /api/routing
 * Returns current routing config from DeployTitan.
 */
app.get('/api/routing', (_req: Request, res: Response) => {
  void (async () => {
    if (!DEPLOYTITAN_API_URL || !DEPLOYTITAN_API_KEY) {
      res.status(503).json({ error: 'DeployTitan not configured' })
      return
    }

    try {
      const upstream = await fetch(
        `${DEPLOYTITAN_API_URL}/routing-config/${encodeURIComponent(CORE_SERVICE_NAME)}/${encodeURIComponent(ENVIRONMENT)}`,
        {
          headers: {
            Authorization: `Bearer ${DEPLOYTITAN_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        },
      )

      const body = await upstream.json()
      res.status(upstream.status).json(body)
    } catch (err) {
      console.error('[routing] error:', (err as Error)?.message)
      res.status(502).json({ error: 'Failed to reach DeployTitan' })
    }
  })()
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const server = createServer(app)

server.listen(PORT, () => {
  console.log(`[api-traffic-controller] listening on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('[api-traffic-controller] SIGTERM received, shutting down...')
  for (const client of sseClients) {
    client.end()
  }
  server.close(() => process.exit(0))
})
