import { useEffect, useRef, useState, useCallback } from 'react'

export type RoutingConfig = {
  serviceName: string
  environment: string
  strategy: 'percentage' | 'cohort' | 'hybrid'
  percentageRouting?: {
    versions: { deploymentId: string; version: string; percentage: number; healthy: boolean }[]
  }
  cohortRouting?: {
    cohorts: { cohortId: string; version: string; priority: number; healthy: boolean }[]
    defaultVersion: { deploymentId: string; version: string }
  }
  rollbackActive: boolean
  lastUpdated: string
}

export type DeployEvent = {
  type: 'commit' | 'routing' | 'connected'
  data: Record<string, unknown>
  timestamp: string
}

export type MessageResponse = {
  text: string
  author: string
  version: string
  updatedAt?: string
  _meta: {
    version: string
    service: string
    cohortId: string | null
    routedBy: string | null
    routingStrategy: string | null
    timestamp: string
  }
}

const API_BASE = import.meta.env.VITE_API_URL ?? ''

// ---------------------------------------------------------------------------
// useEventStream — connects to SSE, emits events
// ---------------------------------------------------------------------------

export function useEventStream() {
  const [events, setEvents] = useState<DeployEvent[]>([])
  const [routing, setRouting] = useState<RoutingConfig | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource(`${API_BASE}/api/events`)

    es.addEventListener('connected', () => setConnected(true))

    es.addEventListener('routing', (e) => {
      const data = JSON.parse(e.data) as RoutingConfig
      setRouting(data)
      setEvents((prev) =>
        [{ type: 'routing' as const, data: data as Record<string, unknown>, timestamp: new Date().toISOString() }, ...prev].slice(0, 50),
      )
    })

    es.addEventListener('commit', (e) => {
      const data = JSON.parse(e.data) as Record<string, unknown>
      setEvents((prev) =>
        [{ type: 'commit' as const, data, timestamp: new Date().toISOString() }, ...prev].slice(0, 50),
      )
    })

    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [])

  return { events, routing, connected }
}

// ---------------------------------------------------------------------------
// useMessage — fetch /api/message with a given cohort
// ---------------------------------------------------------------------------

export function useMessage() {
  const [message, setMessage] = useState<MessageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async (cohort?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = cohort
        ? `${API_BASE}/api/message?cohort=${encodeURIComponent(cohort)}`
        : `${API_BASE}/api/message`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status}`)
      setMessage(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'fetch failed')
    } finally {
      setLoading(false)
    }
  }, [])

  return { message, loading, error, fetch: fetch_ }
}

// ---------------------------------------------------------------------------
// useCommit — POST /api/commit
// ---------------------------------------------------------------------------

export function useCommit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commitSha, setCommitSha] = useState<string | null>(null)

  const commit = useCallback(async (text: string, author: string) => {
    setLoading(true)
    setError(null)
    setCommitSha(null)
    try {
      const res = await fetch(`${API_BASE}/api/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? `${res.status}`)
      setCommitSha(body.commitSha)
      return body.commitSha as string
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'commit failed'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { commit, loading, error, commitSha }
}

// ---------------------------------------------------------------------------
// useRouting — fetch /api/routing
// ---------------------------------------------------------------------------

export function useRouting() {
  const [routing, setRouting] = useState<RoutingConfig | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/routing`)
      if (res.ok) setRouting(await res.json())
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    refresh()
    timerRef.current = setInterval(refresh, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [refresh])

  return { routing, refresh }
}
