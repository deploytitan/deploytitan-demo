import { useState } from 'react'
import { useScrollReveal } from '../hooks/useAnimations'
import { cn, GOLD, GOLD_RGBA } from '../utils'

interface StackLayer {
  label: string
  tools: string[]
  description: string
  icon: string
}

const topLayers: StackLayer[] = [
  {
    label: 'Version Control',
    tools: ['GitHub', 'GitLab', 'Bitbucket'],
    description: 'Source of truth for code changes',
    icon: '◇',
  },
  {
    label: 'CI/CD Pipeline',
    tools: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'ArgoCD'],
    description: 'Build, test, and push artifacts',
    icon: '▸',
  },
  {
    label: 'Feature Flags',
    tools: ['LaunchDarkly', 'Statsig', 'Unleash'],
    description: 'Toggle features independently of deploys',
    icon: '⚑',
  },
]

const bottomLayers: StackLayer[] = [
  {
    label: 'Infrastructure',
    tools: ['Kubernetes', 'AWS', 'Terraform'],
    description: 'Compute, networking, storage',
    icon: '▤',
  },
  {
    label: 'Observability',
    tools: ['Datadog', 'Grafana', 'New Relic'],
    description: 'Metrics, logs, traces — after the fact',
    icon: '◎',
  },
]

const titanCapabilities = [
  {
    label: 'Dependency Analysis',
    description: 'Maps every service-to-service relationship in real-time',
    color: '#22c55e',
  },
  {
    label: 'Deploy Ordering',
    description: 'Ensures correct sequence based on dependency graph',
    color: '#3b82f6',
  },
  {
    label: 'Anomaly Detection',
    description: 'Sub-second detection of latency spikes, error rates, cascading failures',
    color: '#f59e0b',
  },
  {
    label: 'Auto-Rollback',
    description: 'Surgical rollback of only affected services — not the whole system',
    color: GOLD,
  },
  {
    label: 'Secret Safety',
    description: 'Catches rotation failures and config drift before they cascade',
    color: '#a68a3e',
  },
]

export function StackGap() {
  const ref = useScrollReveal()
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)

  return (
    <section id="gap" className="py-24 lg:py-32 border-t border-line bg-surface-alt/50 relative" ref={ref}>
      {/* Blueprint grid background */}
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <span data-reveal className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary mb-6 justify-center">
            <span className="w-8 h-px bg-gold/40" />
            The missing layer
            <span className="w-8 h-px bg-gold/40" />
          </span>
          <h2 data-reveal data-reveal-delay="1" className="font-display font-medium text-4xl lg:text-6xl tracking-[-0.022em] leading-[1.08] mb-5 max-w-3xl mx-auto">
            Your DevOps stack has{' '}
            <span className="text-ink-secondary">a blind spot.</span>
          </h2>
          <p data-reveal data-reveal-delay="2" className="text-lg text-ink-secondary leading-relaxed max-w-2xl mx-auto">
            You have great tools for building, testing, and observing. But nothing ensures deployments
            are safe <em>at the system level</em> — before they reach production.
          </p>
        </div>

        {/* Two-column layout: stack diagram left, DeployTitan right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* LEFT: Stack diagram */}
          <div className="space-y-0">
            {/* Top layers — what you have */}
            <div data-reveal data-reveal-delay="2" className="mb-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-quaternary mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-signal-success" style={{ borderRadius: '0.5px' }} />
                What you have
              </p>
            </div>

            <div className="space-y-1.5 mb-3">
              {topLayers.map((layer, i) => (
                <div
                  key={layer.label}
                  data-reveal
                  data-reveal-delay={String(i + 2)}
                  className={cn(
                    'group flex items-center gap-4 p-4 border bg-surface transition-all duration-300 cursor-default',
                    hoveredLayer === layer.label
                      ? 'border-signal-success/40 shadow-[0_1px_4px_rgba(34,197,94,0.06)]'
                      : 'border-line'
                  )}
                  style={{ borderRadius: '2px' }}
                  onMouseEnter={() => setHoveredLayer(layer.label)}
                  onMouseLeave={() => setHoveredLayer(null)}
                >
                  <div className={cn(
                    'w-7 h-7 flex items-center justify-center text-xs transition-colors flex-shrink-0',
                    hoveredLayer === layer.label ? 'bg-signal-success/10 text-signal-success' : 'bg-surface-alt text-ink-tertiary'
                  )} style={{ borderRadius: '2px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-ink">{layer.label}</span>
                      <span className="text-[10px] text-ink-quaternary font-mono hidden sm:inline">{layer.tools.join(' · ')}</span>
                    </div>
                    <p className="text-xs text-ink-tertiary mt-0.5">{layer.description}</p>
                  </div>
                  <span className="text-xs text-ink-quaternary font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">{layer.icon}</span>
                </div>
              ))}
            </div>

            {/* THE GAP */}
            <div data-reveal data-reveal-delay="5" className="relative py-3">
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'repeating-linear-gradient(to bottom, rgba(239,68,68,0.2) 0px, rgba(239,68,68,0.2) 4px, transparent 4px, transparent 8px)' }} />
              <div
                className="relative mx-auto max-w-md flex items-center gap-3 px-5 py-3.5 border-2 border-dashed border-signal-danger/30 bg-signal-danger/[0.03]"
                style={{ borderRadius: '2px' }}
              >
                <div className="w-7 h-7 bg-signal-danger/15 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '2px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-signal-danger">No system-level deployment safety</p>
                  <p className="text-[11px] text-ink-tertiary mt-0.5">
                    Who validates that service B is ready before service A deploys?
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom layers */}
            <div className="space-y-1.5 mt-3">
              {bottomLayers.map((layer, i) => (
                <div
                  key={layer.label}
                  data-reveal
                  data-reveal-delay={String(i + 6)}
                  className={cn(
                    'group flex items-center gap-4 p-4 border bg-surface transition-all duration-300 cursor-default',
                    hoveredLayer === layer.label
                      ? 'border-signal-success/40 shadow-[0_1px_4px_rgba(34,197,94,0.06)]'
                      : 'border-line'
                  )}
                  style={{ borderRadius: '2px' }}
                  onMouseEnter={() => setHoveredLayer(layer.label)}
                  onMouseLeave={() => setHoveredLayer(null)}
                >
                  <div className={cn(
                    'w-7 h-7 flex items-center justify-center text-xs transition-colors flex-shrink-0',
                    hoveredLayer === layer.label ? 'bg-signal-success/10 text-signal-success' : 'bg-surface-alt text-ink-tertiary'
                  )} style={{ borderRadius: '2px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-ink">{layer.label}</span>
                      <span className="text-[10px] text-ink-quaternary font-mono hidden sm:inline">{layer.tools.join(' · ')}</span>
                    </div>
                    <p className="text-xs text-ink-tertiary mt-0.5">{layer.description}</p>
                  </div>
                  <span className="text-xs text-ink-quaternary font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">{layer.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: DeployTitan fills the gap */}
          <div data-reveal data-reveal-delay="4">
            <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-gold/60 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold" style={{ borderRadius: '0.5px' }} />
              What DeployTitan adds
            </p>

            <div
              className="border-2 border-ink bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative corner-accent"
              style={{ borderRadius: '2px' }}
            >
              {/* Header */}
              <div className="p-6 pb-5 border-b border-line">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-ink flex items-center justify-center flex-shrink-0" style={{ borderRadius: '2px' }}>
                    <svg className="h-5 w-5 text-surface" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink font-display tracking-[-0.01em]">Deployment Control Plane</h3>
                    <p className="text-xs text-ink-secondary">Autonomous Deployment Guardrails</p>
                  </div>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Sits between your CI/CD pipeline and production. Validates every deployment against
                  your live dependency graph before it reaches users.
                </p>
              </div>

              {/* Capabilities list */}
              <div className="p-6 pt-5 space-y-3">
                {titanCapabilities.map((cap) => (
                  <div key={cap.label} className="flex items-start gap-3 group/cap">
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className="w-2 h-2 transition-transform duration-200 group-hover/cap:scale-125"
                        style={{ backgroundColor: cap.color, borderRadius: '0.5px', opacity: 0.7 }}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-ink">{cap.label}</span>
                      <p className="text-xs text-ink-tertiary mt-0.5">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom bar */}
              <div className="px-6 py-4 border-t border-line bg-surface-alt/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-signal-success" style={{ borderRadius: '0.5px' }} />
                      <span className="text-[10px] font-mono text-ink-tertiary">Pre-deploy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5" style={{ backgroundColor: GOLD, borderRadius: '0.5px' }} />
                      <span className="text-[10px] font-mono text-ink-tertiary">During deploy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-signal-deploy" style={{ borderRadius: '0.5px' }} />
                      <span className="text-[10px] font-mono text-ink-tertiary">Post-deploy</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono" style={{ color: `${GOLD_RGBA},0.4)` }}>CONTINUOUS</span>
                </div>
              </div>
            </div>

            {/* Connector note */}
            <div className="hidden lg:flex items-center justify-center mt-4 gap-2">
              <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, ${GOLD}30, transparent)` }} />
              <span className="text-[9px] font-mono text-ink-quaternary">Plugs into your existing stack — no migration required</span>
              <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}30)` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
