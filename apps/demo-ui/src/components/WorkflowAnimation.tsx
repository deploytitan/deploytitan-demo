import type {ReactNode} from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {cn, GOLD, GOLD_RGBA, sleep} from '../utils'
import {useScrollReveal} from '../hooks/useAnimations'

/* ========== Constants ========== */

/* ========== Types & Data ========== */

type Stage = 'merge' | 'deploy' | 'detect' | 'analyze' | 'heal' | 'complete'

interface StageConfig {
  id: Stage
  label: string
}

const defaultStages: StageConfig[] = [
  { id: 'merge', label: 'Merged' },
  { id: 'deploy', label: 'Deploying' },
  { id: 'detect', label: 'Issue Found' },
  { id: 'analyze', label: 'AI Analyzing' },
  { id: 'heal', label: 'Rolling Back' },
  { id: 'complete', label: 'Stable' },
]

const stageIcons: Record<Stage, ReactNode> = {
  merge: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>,
  deploy: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>,
  detect: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  analyze: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>,
  heal: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>,
  complete: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>,
}

type SvcStatus = 'idle' | 'deploying' | 'warning' | 'cascade' | 'rollback' | 'healthy'

interface ServiceState {
  name: string
  shortName: string
  status: SvcStatus
  version: string
  newVersion?: string
}

interface LogMessage {
  stage: Stage
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
}

interface Scenario {
  title: string
  description: string
  category: string
  stageLabels?: Partial<Record<Stage, string>>
  services: ServiceState[]
  affectedServices: string[]
  cascadeServices: string[]
  rollbackServices: string[]
  logMessages: LogMessage[]
}

const scenarios: Scenario[] = [
  {
    title: 'Schema Breaking Change',
    description: 'Payment API v2.1.0 removes legacy_id field — DeployTitan blocks it at the PR before merge',
    category: 'Code Deploy',
    stageLabels: { merge: 'PR Opened', deploy: 'Scanning', detect: 'Break Found', analyze: 'AI Analysis', heal: 'PR Blocked', complete: 'Guarded' },
    services: [
      { name: 'api-reference-gateway', shortName: 'GW', status: 'idle', version: 'v1.4.2' },
      { name: 'auth-service', shortName: 'AUTH', status: 'idle', version: 'v3.2.1' },
      { name: 'payment-api-reference', shortName: 'PAY', status: 'idle', version: 'v2.0.5', newVersion: 'v2.1.0' },
      { name: 'order-service', shortName: 'ORD', status: 'idle', version: 'v1.8.3' },
      { name: 'notification-svc', shortName: 'NTF', status: 'idle', version: 'v1.2.0' },
      { name: 'analytics', shortName: 'ANL', status: 'idle', version: 'v2.5.1' },
    ],
    affectedServices: ['payment-api-reference'],
    cascadeServices: ['order-service', 'notification-svc', 'analytics'],
    rollbackServices: ['payment-api-reference'],
    logMessages: [
      { stage: 'merge', type: 'info', message: 'PR #1842 opened: payment-api-reference schema migration v2.1.0 — removes legacy_id column' },
      { stage: 'deploy', type: 'info', message: 'DeployTitan scanning PR diff against live dependency graph...' },
      { stage: 'detect', type: 'error', message: 'BREAKING: order-service, notification-svc, analytics depend on PaymentResponse.legacy_id (removed in this PR)' },
      { stage: 'analyze', type: 'warning', message: 'AI analysis: 3 downstream consumers reference legacy_id. Blast radius: 67% of transaction flow. PR comment posted.' },
      { stage: 'heal', type: 'info', message: 'PR flagged as blocked. Deployment parked — will not proceed even if merged until dependents are updated.' },
      { stage: 'complete', type: 'success', message: 'Schema break caught pre-merge. Zero production impact. Migration guide posted to PR.' },
    ],
  },
  {
    title: 'Secret Rotation Failure',
    description: 'Vault secret rotation breaks payment-api-reference & auth-svc — no code changes involved',
    category: 'Secrets',
    stageLabels: { merge: 'Rotation', deploy: 'Propagating', detect: 'Anomaly', analyze: 'AI Tracing', heal: 'Restoring', complete: 'Secured' },
    services: [
      { name: 'vault-svc', shortName: 'VLT', status: 'idle', version: 'v1.8.0' },
      { name: 'payment-api-reference', shortName: 'PAY', status: 'idle', version: 'v2.0.5' },
      { name: 'auth-service', shortName: 'AUTH', status: 'idle', version: 'v3.2.1' },
      { name: 'stripe-int', shortName: 'STRP', status: 'idle', version: 'v1.3.0' },
      { name: 'order-service', shortName: 'ORD', status: 'idle', version: 'v1.8.3' },
      { name: 'audit-log', shortName: 'AUD', status: 'idle', version: 'v1.0.8' },
    ],
    affectedServices: ['vault-svc'],
    cascadeServices: ['payment-api-reference', 'auth-service', 'stripe-int'],
    rollbackServices: ['vault-svc'],
    logMessages: [
      { stage: 'merge', type: 'info', message: 'Secret rotation triggered: STRIPE_API_KEY, DB_PASSWORD rotated in vault-svc' },
      { stage: 'deploy', type: 'info', message: 'New secrets propagating to payment-api-reference, auth-service, stripe-int — no code changes detected' },
      { stage: 'detect', type: 'error', message: 'ANOMALY: payment-api-reference 401 errors +2400%. auth-service JWT validation failing. No recent deploys.' },
      { stage: 'analyze', type: 'warning', message: 'AI traced root cause → vault-svc secret rotation 3m ago. Slack alert sent. Linear ticket LIN-4521 created: "Approve secret rollback"' },
      { stage: 'heal', type: 'info', message: 'Approval received. Encrypted backup sent to customer DeployTitan container → decrypted with customer crypto key → previous secrets restored.' },
      { stage: 'complete', type: 'success', message: 'Secrets rolled back. End-to-end encrypted — crypto key never left customer infrastructure. New secrets backed up.' },
    ],
  },
  {
    title: 'Env Variable Mismatch',
    description: 'Config push contains staging DATABASE_URL — DeployTitan blocks it before propagation',
    category: 'Config',
    stageLabels: { merge: 'Config Push', deploy: 'Validating', detect: 'Env Mismatch', analyze: 'AI Tracing', heal: 'Push Blocked', complete: 'Guarded' },
    services: [
      { name: 'config-svc', shortName: 'CFG', status: 'idle', version: 'v2.1.0' },
      { name: 'order-service', shortName: 'ORD', status: 'idle', version: 'v1.8.3' },
      { name: 'catalog-svc', shortName: 'CAT', status: 'idle', version: 'v4.1.2' },
      { name: 'inventory-svc', shortName: 'INV', status: 'idle', version: 'v2.3.1' },
      { name: 'cache-layer', shortName: 'CCH', status: 'idle', version: 'v1.2.0' },
      { name: 'analytics', shortName: 'ANL', status: 'idle', version: 'v2.5.1' },
    ],
    affectedServices: ['config-svc'],
    cascadeServices: ['order-service', 'catalog-svc', 'inventory-svc'],
    rollbackServices: ['config-svc'],
    logMessages: [
      { stage: 'merge', type: 'info', message: 'Config push initiated: DATABASE_URL, REDIS_HOST, FEATURE_FLAGS via config-svc' },
      { stage: 'deploy', type: 'info', message: 'DeployTitan validating config diff against environment registry before propagation...' },
      { stage: 'detect', type: 'error', message: 'BLOCKED: DATABASE_URL contains staging credentials (host: db-staging.internal). REDIS_HOST points to staging cluster.' },
      { stage: 'analyze', type: 'warning', message: 'AI analysis: Cross-environment contamination — 2 variables reference staging infrastructure. Would affect 3 production services.' },
      { stage: 'heal', type: 'info', message: 'Config push rejected. No variables propagated. Operator notified with diff showing staging vs production values.' },
      { stage: 'complete', type: 'success', message: 'Config mismatch caught pre-propagation. Zero service disruption. Environment validation guard active.' },
    ],
  },
  {
    title: 'Deployment Artifact Corruption',
    description: 'Corrupted Docker image caught by pre-deploy checksum validation — before any pods start',
    category: 'Artifacts',
    stageLabels: { merge: 'Image Push', deploy: 'Verifying', detect: 'Checksum Fail', analyze: 'AI Tracing', heal: 'Deploy Blocked', complete: 'Guarded' },
    services: [
      { name: 'shipping-svc', shortName: 'SHIP', status: 'idle', version: 'v1.4.5', newVersion: 'v1.5.0' },
      { name: 'order-service', shortName: 'ORD', status: 'idle', version: 'v1.8.3' },
      { name: 'notification-svc', shortName: 'NTF', status: 'idle', version: 'v1.2.0' },
      { name: 'sendgrid', shortName: 'SG', status: 'idle', version: 'v1.0.2' },
      { name: 'api-reference-gateway', shortName: 'GW', status: 'idle', version: 'v1.4.2' },
      { name: 'audit-log', shortName: 'AUD', status: 'idle', version: 'v1.0.8' },
    ],
    affectedServices: ['shipping-svc'],
    cascadeServices: ['order-service', 'notification-svc', 'sendgrid'],
    rollbackServices: ['shipping-svc'],
    logMessages: [
      { stage: 'merge', type: 'info', message: 'Docker image pushed: shipping-svc:v1.5.0 (sha256:a3f8c2…) — 142MB, build #3847' },
      { stage: 'deploy', type: 'info', message: 'DeployTitan verifying artifact integrity before rollout — comparing image layers against build manifest...' },
      { stage: 'detect', type: 'error', message: 'BLOCKED: Image layer sha256:7b2e… checksum mismatch. Registry artifact differs from CI build output.' },
      { stage: 'analyze', type: 'warning', message: 'AI analysis: Layer corruption detected during registry upload. Build environment healthy — issue is in transit.' },
      { stage: 'heal', type: 'info', message: 'Deployment blocked pre-rollout. Zero pods started. CI pipeline triggered for rebuild with verified upload.' },
      { stage: 'complete', type: 'success', message: 'Corrupted image quarantined. shipping-svc remains on v1.4.5. Rebuild in progress with checksum verification.' },
    ],
  },
  {
    title: 'Certificate Expiry Cascade',
    description: 'TLS certificate renewal deploys invalid cert, breaking inter-service mTLS',
    category: 'Security',
    stageLabels: { merge: 'Cert Renewal', deploy: 'Propagating', detect: 'TLS Failure', analyze: 'AI Tracing', heal: 'Cert Rollback', complete: 'Secured' },
    services: [
      { name: 'cert-manager', shortName: 'CERT', status: 'idle', version: 'v2.0.1' },
      { name: 'api-reference-gateway', shortName: 'GW', status: 'idle', version: 'v1.4.2' },
      { name: 'auth-service', shortName: 'AUTH', status: 'idle', version: 'v3.2.1' },
      { name: 'payment-api-reference', shortName: 'PAY', status: 'idle', version: 'v2.0.5' },
      { name: 'order-service', shortName: 'ORD', status: 'idle', version: 'v1.8.3' },
      { name: 'shipping-svc', shortName: 'SHIP', status: 'idle', version: 'v1.4.5' },
    ],
    affectedServices: ['cert-manager'],
    cascadeServices: ['api-reference-gateway', 'auth-service', 'payment-api-reference'],
    rollbackServices: ['cert-manager'],
    logMessages: [
      { stage: 'merge', type: 'info', message: 'Automated cert renewal: wildcard *.deploytitan.io renewed via cert-manager' },
      { stage: 'deploy', type: 'info', message: 'New TLS certificate propagating to api-reference-gateway, auth-service, payment-api-reference mTLS endpoints' },
      { stage: 'detect', type: 'error', message: 'ALERT: mTLS handshake failures across 3 services. Certificate chain validation error: intermediate CA missing.' },
      { stage: 'analyze', type: 'warning', message: 'AI analysis: cert-manager issued cert without intermediate CA bundle. 100% inter-service calls failing.' },
      { stage: 'heal', type: 'info', message: 'Restoring previous certificate bundle with valid chain. Services re-establishing mTLS connections.' },
      { stage: 'complete', type: 'success', message: 'mTLS restored. All services communicating. cert-manager config flagged for CA bundle inclusion.' },
    ],
  },
  {
    title: 'Feature Flag Misconfiguration',
    description: 'Flag change requires payment-api-reference v2.1.0 — DeployTitan blocks it before propagation',
    category: 'Config',
    stageLabels: { merge: 'Flag Update', deploy: 'Validating', detect: 'Dep Conflict', analyze: 'AI Tracing', heal: 'Flag Blocked', complete: 'Guarded' },
    services: [
      { name: 'config-svc', shortName: 'CFG', status: 'idle', version: 'v2.1.0' },
      { name: 'payment-api-reference', shortName: 'PAY', status: 'idle', version: 'v2.0.5' },
      { name: 'order-service', shortName: 'ORD', status: 'idle', version: 'v1.8.3' },
      { name: 'checkout-ui', shortName: 'CHK', status: 'idle', version: 'v3.4.0' },
      { name: 'stripe-int', shortName: 'STRP', status: 'idle', version: 'v1.3.0' },
      { name: 'analytics', shortName: 'ANL', status: 'idle', version: 'v2.5.1' },
    ],
    affectedServices: ['config-svc'],
    cascadeServices: ['payment-api-reference', 'order-service', 'checkout-ui'],
    rollbackServices: ['config-svc'],
    logMessages: [
      { stage: 'merge', type: 'info', message: 'Feature flag change requested: NEW_CHECKOUT_FLOW → 100% (was 5% canary)' },
      { stage: 'deploy', type: 'info', message: 'DeployTitan validating flag dependencies against live service versions...' },
      { stage: 'detect', type: 'error', message: 'BLOCKED: NEW_CHECKOUT_FLOW requires payment-api-reference >= v2.1.0. Current version: v2.0.5. Flag change rejected.' },
      { stage: 'analyze', type: 'warning', message: 'AI analysis: Enabling this flag would break checkout for 100% of users. payment-api-reference v2.1.0 is not yet deployed.' },
      { stage: 'heal', type: 'info', message: 'Flag remains at 5% canary. Operator notified: deploy payment-api-reference v2.1.0 first, then re-enable flag.' },
      { stage: 'complete', type: 'success', message: 'Premature flag activation prevented. Zero revenue impact. Dependency guard enforced.' },
    ],
  },
  {
    title: 'Resource Contention',
    description: 'Catalog service update causes database connection pool exhaustion',
    category: 'Code Deploy',
    services: [
      { name: 'catalog-svc', shortName: 'CAT', status: 'idle', version: 'v4.1.2', newVersion: 'v4.2.0' },
      { name: 'inventory-svc', shortName: 'INV', status: 'idle', version: 'v2.3.1' },
      { name: 'pricing-engine', shortName: 'PRC', status: 'idle', version: 'v3.0.5' },
      { name: 'search-api-reference', shortName: 'SRC', status: 'idle', version: 'v1.9.0' },
      { name: 'recommendation', shortName: 'REC', status: 'idle', version: 'v2.1.3' },
      { name: 'cache-layer', shortName: 'CCH', status: 'idle', version: 'v1.2.0' },
    ],
    affectedServices: ['catalog-svc'],
    cascadeServices: ['inventory-svc', 'search-api-reference', 'pricing-engine'],
    rollbackServices: ['catalog-svc'],
    logMessages: [
      { stage: 'merge', type: 'info', message: 'PR #987 merged: catalog-svc performance optimization v4.2.0' },
      { stage: 'deploy', type: 'info', message: 'Canary deployment: catalog-svc v4.2.0 (10% traffic)' },
      { stage: 'detect', type: 'error', message: 'ALERT: DB connection pool at 95%. New query pattern causing connection leak.' },
      { stage: 'analyze', type: 'warning', message: 'AI analysis: Resource saturation — inventory-svc, search-api-reference degraded. P95 latency +340%' },
      { stage: 'heal', type: 'info', message: 'Emergency rollback: catalog-svc → v4.1.2, releasing connections' },
      { stage: 'complete', type: 'success', message: 'Pool recovered. Latency normalized. Flagged for connection pooling review.' },
    ],
  },
]

/* ========== Service node grid ========== */

function getServiceStatus(
  service: ServiceState,
  stage: Stage,
  scenario: Scenario
): SvcStatus {
  const stageOrder: Stage[] = ['merge', 'deploy', 'detect', 'analyze', 'heal', 'complete']
  const stageIdx = stageOrder.indexOf(stage)

  if (stageIdx < 1) return 'idle'

  const isAffected = scenario.affectedServices.includes(service.name)
  const isCascade = scenario.cascadeServices.includes(service.name)
  const isRollback = scenario.rollbackServices.includes(service.name)

  if (stageIdx === 1) {
    if (isAffected) return 'deploying'
  }
  if (stageIdx === 2) {
    if (isAffected) return 'warning'
    if (isCascade) return 'warning'
  }
  if (stageIdx === 3) {
    if (isAffected) return 'warning'
    if (isCascade) return 'cascade'
  }
  if (stageIdx === 4) {
    if (isRollback) return 'rollback'
    if (isCascade) return 'cascade'
  }
  if (stageIdx === 5) {
    return 'healthy'
  }
  return 'idle'
}

const statusColors: Record<SvcStatus, { bg: string; border: string; dot: string; text: string }> = {
  idle: { bg: 'rgba(255,255,255,0.8)', border: 'var(--color-line)', dot: 'var(--color-ink-quaternary)', text: 'var(--color-ink-tertiary)' },
  deploying: { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.3)', dot: '#3b82f6', text: '#3b82f6' },
  warning: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.3)', dot: '#ef4444', text: '#ef4444' },
  cascade: { bg: 'rgba(239,68,68,0.04)', border: 'rgba(239,68,68,0.2)', dot: 'rgba(239,68,68,0.6)', text: 'rgba(239,68,68,0.7)' },
  rollback: { bg: `${GOLD_RGBA},0.06)`, border: `${GOLD_RGBA},0.3)`, dot: GOLD, text: GOLD },
  healthy: { bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.25)', dot: '#22c55e', text: '#22c55e' },
}

/* ========== ScenarioPlayer ========== */

interface ScenarioPlayerProps {
  scenario: Scenario
  isActive: boolean
}

function ScenarioPlayer({ scenario, isActive }: ScenarioPlayerProps) {
  const stageOrder: Stage[] = ['merge', 'deploy', 'detect', 'analyze', 'heal', 'complete']
  const [currentStage, setCurrentStage] = useState<Stage>('merge')
  const [visibleLogs, setVisibleLogs] = useState<LogMessage[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [completed, setCompleted] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const playRef = useRef(false)

  const stages: StageConfig[] = defaultStages.map((s) => ({
    id: s.id,
    label: scenario.stageLabels?.[s.id] ?? s.label,
  }))

  const resetPlayer = useCallback(() => {
    setCurrentStage('merge')
    setVisibleLogs([])
    setIsPlaying(false)
    setCompleted(false)
    playRef.current = false
  }, [])

  const runScenario = useCallback(async () => {
    if (playRef.current) return
    playRef.current = true
    setIsPlaying(true)
    setCompleted(false)
    setVisibleLogs([])
    setCurrentStage('merge')

    for (const stage of stageOrder) {
      if (!playRef.current) break
      setCurrentStage(stage)
      const logsForStage = scenario.logMessages.filter((l) => l.stage === stage)
      for (const log of logsForStage) {
        if (!playRef.current) break
        await sleep(400)
        setVisibleLogs((prev) => [...prev, log])
      }
      await sleep(stage === 'complete' ? 400 : 900)
    }

    if (playRef.current) {
      setIsPlaying(false)
      setCompleted(true)
    }
    playRef.current = false
  }, [scenario])

  useEffect(() => {
    if (!isActive) {
      resetPlayer()
    }
  }, [isActive, resetPlayer])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleLogs])

  const currentStageIdx = stageOrder.indexOf(currentStage)

  const logColors: Record<LogMessage['type'], string> = {
    info: 'var(--color-ink-secondary)',
    warning: '#f59e0b',
    error: '#ef4444',
    success: '#22c55e',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Left: service grid + stage progress */}
      <div className="space-y-4">
        {/* Stage progress */}
        <div className="border border-line bg-surface p-4" style={{ borderRadius: '2px' }}>
          <div className="flex items-center gap-1 flex-wrap">
            {stages.map((s, i) => {
              const idx = stageOrder.indexOf(s.id)
              const isCurrent = s.id === currentStage
              const isDone = idx < currentStageIdx
              return (
                <div key={s.id} className="flex items-center gap-1">
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 transition-all duration-300"
                    style={{
                      borderRadius: '2px',
                      background: isCurrent ? `${GOLD_RGBA},0.1)` : isDone ? 'rgba(34,197,94,0.06)' : 'transparent',
                      border: `1px solid ${isCurrent ? `${GOLD_RGBA},0.3)` : isDone ? 'rgba(34,197,94,0.2)' : 'transparent'}`,
                    }}
                  >
                    <span style={{
                      color: isCurrent ? GOLD : isDone ? '#22c55e' : 'var(--color-ink-quaternary)',
                      transition: 'color 0.3s',
                    }}>
                      {isDone
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                        : stageIcons[s.id]
                      }
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-wide" style={{
                      color: isCurrent ? GOLD : isDone ? '#22c55e' : 'var(--color-ink-quaternary)',
                    }}>{s.label}</span>
                  </div>
                  {i < stages.length - 1 && (
                    <div className="w-2 h-px" style={{ background: isDone ? 'rgba(34,197,94,0.3)' : 'var(--color-line)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Service nodes */}
        <div className="border border-line bg-surface p-4" style={{ borderRadius: '2px' }}>
          <p className="text-[9px] font-mono uppercase tracking-[0.1em] text-ink-quaternary mb-3">Service Graph</p>
          <div className="grid grid-cols-3 gap-2">
            {scenario.services.map((svc) => {
              const status = getServiceStatus(svc, currentStage, scenario)
              const colors = statusColors[status]
              return (
                <div
                  key={svc.name}
                  className="flex flex-col items-center gap-1.5 p-2 transition-all duration-500"
                  style={{ borderRadius: '2px', background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 transition-all duration-300" style={{ borderRadius: '0.5px', background: colors.dot }} />
                    <span className="text-[9px] font-mono font-semibold" style={{ color: colors.text }}>{svc.shortName}</span>
                  </div>
                  <span className="text-[8px] font-mono text-ink-quaternary">
                    {status === 'deploying' && svc.newVersion ? svc.newVersion : svc.version}
                  </span>
                  {status !== 'idle' && (
                    <span className="text-[7px] font-mono uppercase" style={{ color: colors.dot }}>
                      {status === 'deploying' ? 'DEPLOYING'
                        : status === 'warning' ? 'ALERT'
                        : status === 'cascade' ? 'IMPACT'
                        : status === 'rollback' ? 'ROLLBACK'
                        : status === 'healthy' ? 'HEALTHY'
                        : ''}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Play controls */}
        <div className="flex items-center gap-2">
          {!isPlaying && !completed && (
            <button
              onClick={runScenario}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink text-surface text-xs font-mono transition-all hover:bg-ink/90 cursor-pointer"
              style={{ borderRadius: '2px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run scenario
            </button>
          )}
          {isPlaying && (
            <button
              onClick={resetPlayer}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-line text-ink-secondary text-xs font-mono transition-all hover:border-gold/30 cursor-pointer bg-surface"
              style={{ borderRadius: '2px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
              Reset
            </button>
          )}
          {completed && (
            <button
              onClick={resetPlayer}
              className="inline-flex items-center gap-2 px-4 py-2.5 border text-xs font-mono transition-all cursor-pointer"
              style={{ borderRadius: '2px', borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.05)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              Run again
            </button>
          )}
          {isPlaying && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-signal-success" style={{ borderRadius: '0.5px', animation: 'pulse-anim 1s infinite' }} />
              <span className="text-[9px] font-mono text-ink-tertiary">Running…</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: log output */}
      <div className="border border-line bg-[#080503] overflow-hidden flex flex-col" style={{ borderRadius: '2px', minHeight: '300px' }}>
        <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-1.5 h-1.5" style={{ borderRadius: '0.5px', background: isPlaying ? '#22c55e' : completed ? '#22c55e' : 'rgba(255,255,255,0.2)', animation: isPlaying ? 'pulse-anim 1s infinite' : undefined }} />
          <span className="text-[9px] font-mono uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.3)' }}>DeployTitan Log</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-2" style={{ maxHeight: '320px' }}>
          {visibleLogs.length === 0 && (
            <p className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {isPlaying ? 'Initializing...' : '▸ Press "Run scenario" to start'}
            </p>
          )}
          {visibleLogs.map((log, i) => (
            <div key={i} className="log-entry flex gap-2">
              <span className="text-[9px] font-mono shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                T+{String(i * 2).padStart(2, '0')}s
              </span>
              <span className="text-[10px] font-mono leading-relaxed" style={{ color: logColors[log.type] }}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  )
}

/* ========== Main Component ========== */

export function WorkflowAnimation() {
  const ref = useScrollReveal()
  const [activeScenario, setActiveScenario] = useState(0)

  const categoryColors: Record<string, string> = {
    'Code Deploy': '#3b82f6',
    'Secrets': GOLD,
    'Config': '#8b5cf6',
    'Artifacts': '#f59e0b',
    'Security': '#ef4444',
  }

  return (
    <section id="scenarios" className="py-24 lg:py-32 border-t border-line relative" ref={ref}>
      <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
        <span data-reveal className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary mb-6">
          <span className="w-8 h-px bg-gold/40" />
          Live scenarios
        </span>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 gap-4">
          <h2 data-reveal data-reveal-delay="1" className="font-display font-medium text-4xl lg:text-5xl tracking-[-0.022em] leading-[1.08] max-w-2xl">
            Watch DeployTitan{' '}
            <span className="text-ink-secondary">respond in real time.</span>
          </h2>
          <p data-reveal data-reveal-delay="2" className="text-base text-ink-secondary max-w-sm leading-relaxed lg:text-right">
            Seven real failure scenarios. Click any to see the detection and recovery sequence.
          </p>
        </div>

        {/* Scenario tabs */}
        <div data-reveal data-reveal-delay="3" className="flex flex-wrap gap-2 mb-8">
          {scenarios.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveScenario(i)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-mono transition-all duration-200 cursor-pointer border',
                activeScenario === i
                  ? 'bg-ink text-surface border-ink'
                  : 'bg-surface text-ink-secondary border-line hover:border-gold/30'
              )}
              style={{ borderRadius: '2px' }}
            >
              <span
                className="w-1.5 h-1.5 shrink-0"
                style={{ borderRadius: '0.5px', background: categoryColors[s.category] ?? GOLD }}
              />
              {s.title}
            </button>
          ))}
        </div>

        {/* Active scenario */}
        <div data-reveal data-reveal-delay="4" className="border border-line bg-surface p-6 lg:p-8" style={{ borderRadius: '2px' }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider"
                  style={{
                    borderRadius: '2px',
                    background: `${categoryColors[scenarios[activeScenario].category] ?? GOLD}18`,
                    color: categoryColors[scenarios[activeScenario].category] ?? GOLD,
                  }}
                >
                  {scenarios[activeScenario].category}
                </span>
              </div>
              <h3 className="font-display font-medium text-xl tracking-[-0.01em]">{scenarios[activeScenario].title}</h3>
              <p className="text-sm text-ink-secondary mt-1">{scenarios[activeScenario].description}</p>
            </div>
          </div>

          <ScenarioPlayer
            scenario={scenarios[activeScenario]}
            isActive={true}
            key={activeScenario}
          />
        </div>
      </div>
    </section>
  )
}
