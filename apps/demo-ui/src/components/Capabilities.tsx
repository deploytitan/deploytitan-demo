import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useScrollReveal, useSpotlight } from '../hooks/useAnimations'
import { GOLD, GOLD_RGBA } from '../utils'

/* ========== Capability Data ========== */

interface Capability {
  id: string
  title: string
  description: string
  icon: ReactNode
  detail: string
  microVisual: ReactNode
  modalContent: {
    longDescription: string
    useCases: string[]
    technicalDetails: string[]
  }
}

/* Micro-visuals */

function MicroDepGraph() {
  const nodes = [
    { x: 40, y: 14, r: 4, label: 'GW' },
    { x: 20, y: 38, r: 3.5, label: 'Auth' },
    { x: 40, y: 38, r: 3.5, label: 'API' },
    { x: 60, y: 38, r: 3.5, label: 'Cart' },
    { x: 30, y: 60, r: 3, label: 'DB' },
    { x: 50, y: 60, r: 3, label: 'Pay' },
  ]
  const edges = [
    [0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [3, 5],
  ]

  return (
    <svg viewBox="0 0 80 76" className="w-full h-full">
      <defs>
        <pattern id="mg" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0V10H0" fill="none" stroke={`${GOLD_RGBA},0.06)`} strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="80" height="76" fill="url(#mg)" />
      {edges.map(([fi, ti], i) => (
        <line key={i} x1={nodes[fi].x} y1={nodes[fi].y} x2={nodes[ti].x} y2={nodes[ti].y}
          stroke={`${GOLD_RGBA},0.25)`} strokeWidth="0.5" strokeDasharray="1.5 1" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x - n.r} y={n.y - n.r} width={n.r * 2} height={n.r * 2}
            fill="white" stroke={`${GOLD_RGBA},0.3)`} strokeWidth="0.4" rx="0.5" />
          <circle cx={n.x} cy={n.y - n.r + 1} r="0.8" fill={GOLD} opacity="0.5" />
          <text x={n.x} y={n.y + 1} fontSize="2.8" fontFamily="var(--font-mono)" fill="rgba(8,5,3,0.5)" textAnchor="middle">{n.label}</text>
        </g>
      ))}
      <circle cx="40" cy="38" r="18" fill="none" stroke={`${GOLD_RGBA},0.08)`} strokeWidth="0.3" strokeDasharray="2 1.5">
        <animateTransform attributeName="transform" type="rotate" values="0 40 38;360 40 38" dur="12s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function MicroManifest() {
  const lines = [
    { text: 'deploy:', color: GOLD, indent: 0 },
    { text: 'order-svc: v2.14', color: 'rgba(8,5,3,0.5)', indent: 1 },
    { text: 'requires:', color: 'rgba(8,5,3,0.4)', indent: 2 },
    { text: '- pay-svc@^4.0', color: '#3b82f6', indent: 3 },
    { text: '- inv-db@migrated', color: '#3b82f6', indent: 3 },
    { text: 'rollout: canary', color: '#22c55e', indent: 2 },
    { text: 'threshold: 99.5%', color: '#22c55e', indent: 2 },
  ]
  return (
    <div className="font-mono text-[9px] leading-[1.8] p-3 bg-[#fafaf9] border border-line/40 h-full overflow-hidden" style={{ borderRadius: '2px' }}>
      {lines.map((l, i) => (
        <div key={i} style={{ paddingLeft: `${l.indent * 10}px`, color: l.color }}>{l.text}</div>
      ))}
    </div>
  )
}

function MicroLock() {
  return (
    <svg viewBox="0 0 80 76" className="w-full h-full">
      <defs>
        <pattern id="ml" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0V10H0" fill="none" stroke={`${GOLD_RGBA},0.06)`} strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="80" height="76" fill="url(#ml)" />
      <rect x="25" y="34" width="30" height="24" fill="white" stroke={`${GOLD_RGBA},0.3)`} strokeWidth="0.6" rx="0.5" />
      <path d="M32 34V26a8 8 0 0 1 16 0v8" fill="none" stroke={`${GOLD_RGBA},0.4)`} strokeWidth="0.8" />
      <circle cx="40" cy="44" r="2.5" fill={`${GOLD_RGBA},0.2)`} stroke={GOLD} strokeWidth="0.4" />
      <line x1="40" y1="46" x2="40" y2="51" stroke={GOLD} strokeWidth="0.5" />
      <text x="40" y="66" fontSize="3" fontFamily="var(--font-mono)" fill="rgba(8,5,3,0.3)" textAnchor="middle">AES-256 · YOUR INFRA</text>
      <circle cx="40" cy="44" r="12" fill="none" stroke={`${GOLD_RGBA},0.1)`} strokeWidth="0.3">
        <animate attributeName="r" values="10;16;10" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function MicroGauge() {
  const cx = 40, cy = 50, r = 22
  const needleAngle = 150
  const angleRad = Math.PI - (needleAngle * Math.PI) / 180
  const nx = cx + r * 0.72 * Math.cos(angleRad)
  const ny = cy - r * 0.72 * Math.sin(angleRad)
  const endX = cx + r * Math.cos(angleRad)
  const endY = cy - r * Math.sin(angleRad)

  return (
    <svg viewBox="0 0 80 76" className="w-full h-full">
      <defs>
        <pattern id="mgg" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0V10H0" fill="none" stroke={`${GOLD_RGBA},0.06)`} strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="80" height="76" fill="url(#mgg)" />
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(8,5,3,0.06)" strokeWidth="3" strokeLinecap="round" />
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx.toFixed(1)} y2={ny.toFixed(1)} stroke={GOLD} strokeWidth="0.7" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="2" fill="white" stroke={`${GOLD_RGBA},0.3)`} strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r="0.8" fill={GOLD} opacity="0.6" />
      <line x1={cx - r} y1={cy} x2={cx - r} y2={cy - 4} stroke="rgba(8,5,3,0.15)" strokeWidth="0.4" />
      <line x1={cx + r} y1={cy} x2={cx + r} y2={cy - 4} stroke="rgba(8,5,3,0.15)" strokeWidth="0.4" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy - r + 4} stroke="rgba(8,5,3,0.15)" strokeWidth="0.4" />
      <text x="40" y="20" fontSize="3.5" fontFamily="var(--font-mono)" fill={GOLD} textAnchor="middle" fontWeight="500">85% → 100%</text>
      <text x="40" y="66" fontSize="2.8" fontFamily="var(--font-mono)" fill="rgba(8,5,3,0.3)" textAnchor="middle">CANARY HEALTH</text>
    </svg>
  )
}

function MicroDrift() {
  const rows = [
    { key: 'DB_POOL', prod: '25', staging: '25', ok: true },
    { key: 'CACHE_TTL', prod: '3600', staging: '300', ok: false },
    { key: 'API_KEY', prod: '••••ok', staging: '••••exp', ok: false },
  ]
  return (
    <div className="font-mono text-[8px] p-2 bg-[#fafaf9] border border-line/40 h-full" style={{ borderRadius: '2px' }}>
      <div className="flex gap-1 text-ink-quaternary mb-1 pb-1 border-b border-line/30">
        <span className="w-[40%]">KEY</span>
        <span className="w-[25%]">PROD</span>
        <span className="w-[25%]">STAGE</span>
        <span className="w-[10%]"></span>
      </div>
      {rows.map((r) => (
        <div key={r.key} className="flex gap-1 py-0.5 items-center" style={{ color: r.ok ? 'rgba(8,5,3,0.4)' : '#ef4444' }}>
          <span className="w-[40%] truncate">{r.key}</span>
          <span className="w-[25%]">{r.prod}</span>
          <span className="w-[25%]">{r.staging}</span>
          <span className="w-[10%]">{r.ok ? '✓' : '!'}</span>
        </div>
      ))}
    </div>
  )
}

function MicroRollback() {
  return (
    <svg viewBox="0 0 80 76" className="w-full h-full">
      <defs>
        <pattern id="mr" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0V10H0" fill="none" stroke={`${GOLD_RGBA},0.06)`} strokeWidth="0.3" />
        </pattern>
        <marker id="arr" markerWidth="4" markerHeight="3" refX="3" refY="1.5" orient="auto">
          <polygon points="0 0, 4 1.5, 0 3" fill={GOLD} />
        </marker>
      </defs>
      <rect width="80" height="76" fill="url(#mr)" />
      <line x1="12" y1="38" x2="68" y2="38" stroke="rgba(8,5,3,0.06)" strokeWidth="0.8" />
      <rect x="10" y="32" width="16" height="12" fill="white" stroke="#22c55e" strokeWidth="0.4" rx="0.5" />
      <text x="18" y="40" fontSize="2.8" fontFamily="var(--font-mono)" fill="#22c55e" textAnchor="middle">v4.0</text>
      <rect x="32" y="32" width="16" height="12" fill="rgba(239,68,68,0.05)" stroke="#ef4444" strokeWidth="0.4" rx="0.5" />
      <text x="40" y="40" fontSize="2.8" fontFamily="var(--font-mono)" fill="#ef4444" textAnchor="middle">v4.1</text>
      <text x="40" y="28" fontSize="2.5" fontFamily="var(--font-mono)" fill="#ef4444" textAnchor="middle">FAIL</text>
      <rect x="54" y="32" width="16" height="12" fill={`${GOLD_RGBA},0.05)`} stroke={GOLD} strokeWidth="0.4" rx="0.5" />
      <text x="62" y="40" fontSize="2.8" fontFamily="var(--font-mono)" fill={GOLD} textAnchor="middle">v4.0</text>
      <path d="M46 50 Q50 58 62 50" fill="none" stroke={GOLD} strokeWidth="0.5" markerEnd="url(#arr)" />
      <text x="54" y="62" fontSize="2.5" fontFamily="var(--font-mono)" fill={GOLD} textAnchor="middle">AUTO-ROLLBACK</text>
      <text x="62" y="28" fontSize="2.5" fontFamily="var(--font-mono)" fill="#22c55e" textAnchor="middle">HEALTHY ✓</text>
    </svg>
  )
}

function MicroRecovery() {
  return (
    <svg viewBox="0 0 80 76" className="w-full h-full">
      <defs>
        <pattern id="mrc" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0V10H0" fill="none" stroke={`${GOLD_RGBA},0.06)`} strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="80" height="76" fill="url(#mrc)" />
      <path d="M40 12 L58 22 V42 C58 54 40 64 40 64 C40 64 22 54 22 42 V22 Z" fill="white" stroke={`${GOLD_RGBA},0.25)`} strokeWidth="0.6" />
      <path d="M40 18 L52 26 V40 C52 49 40 57 40 57 C40 57 28 49 28 40 V26 Z" fill={`${GOLD_RGBA},0.04)`} stroke="none" />
      <path d="M33 38 L38 43 L48 33" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="40" y="72" fontSize="2.8" fontFamily="var(--font-mono)" fill="rgba(8,5,3,0.3)" textAnchor="middle">FULL SYSTEM RESTORE</text>
    </svg>
  )
}

function MicroAutoPark() {
  return (
    <svg viewBox="0 0 80 76" className="w-full h-full">
      <defs>
        <pattern id="map" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0V10H0" fill="none" stroke={`${GOLD_RGBA},0.06)`} strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="80" height="76" fill="url(#map)" />
      <line x1="8" y1="38" x2="72" y2="38" stroke="rgba(8,5,3,0.06)" strokeWidth="0.8" />
      <rect x="10" y="30" width="18" height="16" fill="white" stroke="#3b82f6" strokeWidth="0.5" rx="0.5" />
      <text x="19" y="37" fontSize="3" fontFamily="var(--font-mono)" fill="#3b82f6" textAnchor="middle">v2.3</text>
      <text x="19" y="42" fontSize="2.2" fontFamily="var(--font-mono)" fill="rgba(8,5,3,0.3)" textAnchor="middle">DEPLOY</text>
      <path d="M30 38 L38 38" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="1.5 1">
        <animate attributeName="stroke-dashoffset" values="0;-5" dur="1.5s" repeatCount="indefinite" />
      </path>
      <rect x="40" y="24" width="2" height="28" fill={GOLD} opacity="0.7" rx="0.3" />
      <rect x="38" y="22" width="6" height="4" fill={GOLD} opacity="0.3" rx="0.3" />
      <text x="41" y="20" fontSize="2.5" fontFamily="var(--font-mono)" fill={GOLD} textAnchor="middle" fontWeight="500">PARKED</text>
      <rect x="48" y="26" width="26" height="24" fill="white" stroke={`${GOLD_RGBA},0.25)`} strokeWidth="0.4" rx="0.5" />
      <text x="61" y="32" fontSize="2.5" fontFamily="var(--font-mono)" fill="rgba(8,5,3,0.4)" textAnchor="middle">WAITING ON</text>
      <circle cx="52" cy="37" r="1.2" fill="none" stroke="#ef4444" strokeWidth="0.4" />
      <text x="56" y="38" fontSize="2.3" fontFamily="var(--font-mono)" fill="#ef4444" textAnchor="start">pay-svc@4.0</text>
      <circle cx="52" cy="43" r="1.2" fill="none" stroke="#22c55e" strokeWidth="0.4" />
      <path d="M51 43 L52 44 L53.5 42" fill="none" stroke="#22c55e" strokeWidth="0.3" />
      <text x="56" y="44" fontSize="2.3" fontFamily="var(--font-mono)" fill="#22c55e" textAnchor="start">db-migrate</text>
      <rect x="39" y="28" width="4" height="20" fill={`${GOLD_RGBA},0.08)`} rx="0.5">
        <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x="40" y="60" fontSize="2.5" fontFamily="var(--font-mono)" fill="rgba(8,5,3,0.3)" textAnchor="middle">MANUAL OVERRIDE AVAILABLE</text>
    </svg>
  )
}

/* ========== Capabilities Data ========== */

const capabilities: Capability[] = [
  {
    id: '01',
    title: 'Automatic Dependency Mapping',
    description: 'Live dependency graph built from telemetry. Discovers service-to-service APIs, databases, queues, and event streams.',
    detail: 'No manual config — continuously updated from real traffic patterns.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
        <circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
        <path d="M12 6v5"/><path d="M12 13v5"/><path d="M6 12h5"/><path d="M13 12h5"/>
      </svg>
    ),
    microVisual: <MicroDepGraph />,
    modalContent: {
      longDescription: 'DeployTitan passively observes real traffic between your services — API calls, database queries, queue messages, and event streams — to build a continuously updated dependency graph. No manual configuration, no stale documentation. The graph reflects what your system actually does, not what someone wrote in a wiki months ago.',
      useCases: [
        'Instantly see which services are affected before deploying a change',
        'Identify hidden dependencies that weren\'t in your architecture docs',
        'Track how dependencies evolve over time with version-aware edges',
        'Detect orphaned services and unused connections for cleanup',
      ],
      technicalDetails: [
        'Integrates with OpenTelemetry, Istio, Linkerd, and AWS X-Ray',
        'Sub-second graph updates from live traffic analysis',
        'Supports HTTP/gRPC, Kafka, RabbitMQ, Redis, PostgreSQL, and DynamoDB',
        'Graph diffs available via API for CI/CD pipeline integration',
      ],
    },
  },
  {
    id: '02',
    title: 'Deterministic Deploy Manifests',
    description: 'Define rollout requirements across services. Deployments occur only when dependencies are ready.',
    detail: 'Correct order and compatibility, guaranteed — every deploy.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/>
      </svg>
    ),
    microVisual: <MicroManifest />,
    modalContent: {
      longDescription: 'Deploy manifests declare exactly what each service needs to roll out safely — version constraints, migration status, and health check requirements. DeployTitan evaluates these constraints against the live dependency graph and blocks deployments that would violate them.',
      useCases: [
        'Enforce database migration completion before API service deploys',
        'Require downstream services to be compatible before breaking changes',
        'Automatically sequence multi-service rollouts in dependency order',
        'Manifest diffs shown in PR comments for review',
      ],
      technicalDetails: [
        'YAML-based manifest format with schema validation',
        'Constraint solver evaluates dependency compatibility in <200ms',
        'Integrates with Helm, Kustomize, ArgoCD, and Flux',
        'Manifest diffs shown in PR comments for review',
      ],
    },
  },
  {
    id: '03',
    title: 'Encrypted Secret Management',
    description: 'Detects secret rotation failures before they cascade. Encrypted backups to your self-hosted container.',
    detail: 'Your crypto key never leaves your infrastructure.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1"/>
      </svg>
    ),
    microVisual: <MicroLock />,
    modalContent: {
      longDescription: 'Secret rotations are one of the most common causes of silent outages. DeployTitan monitors secret propagation across all services and detects when a rotation leaves a service with stale credentials. Encrypted backups are stored in a container you host — using a crypto key that never leaves your infrastructure.',
      useCases: [
        'Detect when Vault rotation leaves services with expired credentials',
        'Automatically alert and create tickets when secret propagation fails',
        'One-click restore of previous secrets from encrypted backup',
        'Audit trail of all secret changes and which services consumed them',
      ],
      technicalDetails: [
        'AES-256 encryption with customer-managed keys',
        'Supports HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager',
        'Backup container runs in your VPC/cluster — zero trust architecture',
        'Secret health checks run every 30 seconds per service',
      ],
    },
  },
  {
    id: '04',
    title: 'Intelligent Rollout Control',
    description: 'Canary deployments, cohort rollouts, and progressive traffic shifting with adaptive health checks.',
    detail: 'Decisions adapt automatically based on runtime health signals.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>
      </svg>
    ),
    microVisual: <MicroGauge />,
    modalContent: {
      longDescription: 'DeployTitan manages canary rollouts, blue-green deployments, and progressive traffic shifting — but unlike static tools, it adapts in real time. Health check thresholds tighten or relax based on service criticality, time of day, and historical reliability.',
      useCases: [
        'Start at 1% canary and auto-promote to 100% if health holds',
        'Run cohort-based rollouts (internal users → beta → all) with gates',
        'Adaptive thresholds that account for traffic patterns and baselines',
        'Automatic pause and rollback if error rate exceeds SLO budget',
      ],
      technicalDetails: [
        'Supports Kubernetes native, Istio, Linkerd, and AWS App Mesh',
        'Health signals from Prometheus, Datadog, New Relic, and CloudWatch',
        'Configurable rollout strategies per service and environment',
        'Real-time dashboard with traffic split visualization',
      ],
    },
  },
  {
    id: '05',
    title: 'Config Drift Detection',
    description: 'Monitors env vars, feature flags, and config across all services. Alerts on mismatches instantly.',
    detail: 'Catches drift between staging and production before deploy.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    microVisual: <MicroDrift />,
    modalContent: {
      longDescription: 'Configuration drift is the silent killer of deployments. A database URL that works in staging but points to the wrong host in production. DeployTitan continuously compares configuration state across environments and services, surfacing mismatches before they cause incidents.',
      useCases: [
        'Pre-deploy check that flags env var differences between staging and prod',
        'Detect when feature flags reference services that aren\'t deployed yet',
        'Monitor for accidental config overwrites from CI/CD pipelines',
        'Track configuration changes over time with full audit history',
      ],
      technicalDetails: [
        'Compares across Kubernetes ConfigMaps, env vars, and external stores',
        'Integrates with LaunchDarkly, Split, Flagsmith, and ConfigCat',
        'Customizable ignore rules for intentional differences (e.g., LOG_LEVEL)',
        'Drift reports available in Slack, PagerDuty, and Linear',
      ],
    },
  },
  {
    id: '06',
    title: 'Dependency-Aware Rollback',
    description: 'Identifies exactly which services are affected and rolls back only the impacted components.',
    detail: 'Surgical rollback — not a full system revert.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
      </svg>
    ),
    microVisual: <MicroRollback />,
    modalContent: {
      longDescription: 'When a deployment goes wrong, most tools either do nothing or revert everything. DeployTitan uses the live dependency graph to identify exactly which services are impacted and rolls back only what\'s necessary.',
      useCases: [
        'Roll back a single service without affecting unrelated deployments',
        'Automatically identify blast radius from the dependency graph',
        'Cascade rollback through dependent services in correct order',
        'Preserve healthy deployments that happened in the same release window',
      ],
      technicalDetails: [
        'Blast radius calculated from live dependency graph in <500ms',
        'Rollback strategies: immediate, canary-reverse, and graceful drain',
        'Supports rollback of Kubernetes deployments, Helm releases, and Terraform',
        'Post-rollback health verification with configurable success criteria',
      ],
    },
  },
  {
    id: '07',
    title: 'System-Wide Recovery',
    description: 'Revert the entire system to the last known stable state — service versions, config, and dependencies.',
    detail: 'One-click full system restore for major incidents.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      </svg>
    ),
    microVisual: <MicroRecovery />,
    modalContent: {
      longDescription: 'For major incidents where multiple services are compromised, DeployTitan can restore your entire system to the last known stable snapshot. One click to get back to "everything was working 15 minutes ago."',
      useCases: [
        'Major incident response: restore entire system in under 60 seconds',
        'Recovery from cascading failures that affect multiple services',
        'Disaster recovery with full state restoration across environments',
        'Post-mortem: compare current state vs. last stable snapshot',
      ],
      technicalDetails: [
        'Stable snapshots captured automatically after successful deploy windows',
        'Snapshot includes: service versions, configs, secrets metadata, flag states',
        'Parallel rollback across services with dependency-ordered sequencing',
        'Recovery verification runs automated health checks post-restore',
      ],
    },
  },
  {
    id: '08',
    title: 'Auto-Park Deployments',
    description: 'Holds rollouts automatically when upstream or downstream dependencies aren\'t ready.',
    detail: 'Even force-merged PRs get parked until dependencies are satisfied.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="2"/>
        <path d="M12 18h.01"/>
        <path d="M2 8h2"/><path d="M2 12h2"/><path d="M2 16h2"/>
        <path d="M20 8h2"/><path d="M20 12h2"/><path d="M20 16h2"/>
      </svg>
    ),
    microVisual: <MicroAutoPark />,
    modalContent: {
      longDescription: 'Auto-Park is DeployTitan\'s pre-rollout safety net. When a deployment is triggered, DeployTitan checks the live dependency graph for breaking changes, missing upstream services, and unfinished migrations. If any dependency isn\'t satisfied, the rollout is automatically parked.',
      useCases: [
        'Prevent a breaking API change from rolling out before consumers are updated',
        'Hold a service deploy until its required database migration has completed',
        'Park rollouts triggered by force-merged PRs until dependency checks pass',
        'Allow teams to manually override and release parked deploys when justified',
      ],
      technicalDetails: [
        'Evaluates dependency constraints against live graph before any pods start',
        'Parked deployments are visible in the control panel with blocking reasons',
        'Auto-releases when all blocking dependencies are resolved',
        'Manual override requires explicit acknowledgment of unresolved dependencies',
      ],
    },
  },
]

/* ========== Modal ========== */

function CapabilityModal({
  cap,
  onClose,
}: {
  cap: Capability
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true))
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setTimeout(onClose, 250)
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  return (
    <div
      className={`cap-modal-backdrop ${open ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="cap-modal-panel">
        {/* Header */}
        <div className="border-b border-line px-8 py-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 flex items-center justify-center border border-gold/20 bg-gold-muted text-gold shrink-0" style={{ borderRadius: '2px' }}>
              {cap.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-gold/50">{cap.id}</span>
              </div>
              <h3 className="font-display font-medium text-2xl tracking-[-0.022em]">{cap.title}</h3>
              <p className="text-sm text-ink-secondary mt-1">{cap.detail}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center text-ink-tertiary hover:text-ink border border-line hover:border-gold/30 transition-colors bg-surface cursor-pointer"
            style={{ borderRadius: '2px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="grid lg:grid-cols-2 gap-0">
          <div className="border-b lg:border-b-0 lg:border-r border-line p-8 flex items-center justify-center bg-surface-alt/30">
            <div className="w-full max-w-[320px] aspect-square">
              {cap.microVisual}
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <p className="text-sm text-ink-secondary leading-relaxed">{cap.modalContent.longDescription}</p>
            </div>

            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-gold/60 mb-3">Use Cases</h4>
              <ul className="space-y-2">
                {cap.modalContent.useCases.map((uc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary leading-relaxed">
                    <span className="w-1 h-1 mt-2 shrink-0 bg-gold/40" style={{ borderRadius: '0.5px' }} />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-gold/60 mb-3">Technical Details</h4>
              <div className="space-y-1.5">
                {cap.modalContent.technicalDetails.map((td, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-ink-tertiary font-mono leading-relaxed">
                    <span className="text-gold/30 shrink-0">&#x25B8;</span>
                    {td}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========== Component ========== */

export function Capabilities() {
  const ref = useScrollReveal()
  const spotlightRef = useSpotlight()
  const [selectedCap, setSelectedCap] = useState<Capability | null>(null)

  return (
    <section id="capabilities" className="py-24 lg:py-32 border-t border-line relative" ref={ref}>
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative" ref={spotlightRef}>
        <span data-reveal className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary mb-6">
          <span className="w-8 h-px bg-gold/40" />
          Capabilities
        </span>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 lg:mb-20 gap-4">
          <h2 data-reveal data-reveal-delay="1" className="font-display font-medium text-4xl lg:text-6xl tracking-[-0.022em] leading-[1.08] max-w-2xl">
            Everything you need.<br />
            <span className="text-ink-secondary">Nothing you don't.</span>
          </h2>
          <p data-reveal data-reveal-delay="2" className="text-base text-ink-secondary max-w-md leading-relaxed lg:text-right">
            Eight capabilities that work together to give you complete deployment confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, ci) => (
            <div
              key={cap.id}
              data-reveal
              data-reveal-delay={String(ci + 2)}
              className="group relative border border-line bg-surface transition-all duration-300 hover:border-gold/30 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(201,168,76,0.08)] overflow-hidden cursor-pointer spotlight-card"
              style={{ borderRadius: '2px' }}
              onClick={() => setSelectedCap(cap)}
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/0 group-hover:border-gold/30 transition-all duration-300" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold/0 group-hover:border-gold/30 transition-all duration-300" />

              <div className="h-[140px] w-full bg-surface-alt/50 border-b border-line/50 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full p-3">
                  {cap.microVisual}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-[10px] font-mono text-gold/50 mt-0.5">{cap.id}</span>
                  <div className="text-ink-tertiary group-hover:text-gold transition-colors duration-300">
                    {cap.icon}
                  </div>
                </div>
                <h3 className="font-display font-medium text-base tracking-[-0.01em] mb-2">{cap.title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed mb-2">{cap.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-ink-tertiary font-mono">{cap.detail}</p>
                  <span className="text-[10px] font-mono text-gold/0 group-hover:text-gold/50 transition-colors duration-300 shrink-0 ml-2">
                    DETAILS &#x2192;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div data-reveal data-reveal-delay="10" className="mt-8 text-center">
          <p className="text-sm text-ink-tertiary">
            All capabilities work across <span className="font-mono text-xs">Kubernetes</span>, <span className="font-mono text-xs">serverless</span>, and <span className="font-mono text-xs">hybrid</span> architectures.
          </p>
        </div>

        <div className="gold-line mt-12 max-w-xs mx-auto" />
      </div>

      {selectedCap && (
        <CapabilityModal cap={selectedCap} onClose={() => setSelectedCap(null)} />
      )}
    </section>
  )
}
