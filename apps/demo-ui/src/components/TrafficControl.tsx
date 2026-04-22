import type { RoutingConfig } from '../hooks/useApi'

const GOLD = '#c9a84c'

interface Props {
  routing: RoutingConfig | null
}

export function TrafficControl({ routing }: Props) {
  if (!routing) {
    return (
      <div
        className="border border-line bg-white p-6 flex items-center justify-center"
        style={{ borderRadius: '2px', minHeight: '160px' }}
      >
        <span className="text-sm font-mono text-ink-quaternary">Loading routing config...</span>
      </div>
    )
  }

  const { strategy, percentageRouting, cohortRouting, rollbackActive, lastUpdated } = routing

  return (
    <div className="border border-line bg-white" style={{ borderRadius: '2px' }}>
      <div className="flex items-center gap-3 px-5 py-3 border-b border-line">
        <span className="font-display font-medium text-sm tracking-[-0.01em]">Traffic Split</span>

        {/* Strategy badge */}
        <span
          className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider"
          style={{
            borderRadius: '1px',
            color: strategy === 'cohort' ? GOLD : '#3b82f6',
            backgroundColor: strategy === 'cohort' ? 'rgba(201,168,76,0.1)' : 'rgba(59,130,246,0.1)',
          }}
        >
          {strategy}
        </span>

        {rollbackActive && (
          <span
            className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider"
            style={{ borderRadius: '1px', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }}
          >
            ROLLBACK ACTIVE
          </span>
        )}

        <span className="ml-auto text-[10px] font-mono text-ink-quaternary">
          {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      <div className="p-5">
        {(strategy === 'percentage' || strategy === 'hybrid') && percentageRouting && (
          <div className="flex flex-col gap-3">
            {percentageRouting.versions.length === 0 && (
              <p className="text-sm text-ink-tertiary font-mono">No splits configured</p>
            )}
            {percentageRouting.versions.map((v) => (
              <div key={v.deploymentId}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5"
                      style={{
                        borderRadius: '0.5px',
                        backgroundColor: v.healthy ? '#22c55e' : '#ef4444',
                      }}
                    />
                    <span className="text-xs font-mono text-ink">{v.version.slice(0, 8)}</span>
                  </div>
                  <span className="text-xs font-mono font-medium" style={{ color: GOLD }}>
                    {v.percentage}%
                  </span>
                </div>
                <div className="h-1.5 bg-surface-alt border border-line overflow-hidden" style={{ borderRadius: '1px' }}>
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${v.percentage}%`, backgroundColor: GOLD, borderRadius: '1px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {(strategy === 'cohort' || strategy === 'hybrid') && cohortRouting && (
          <div className="flex flex-col gap-2">
            {cohortRouting.cohorts.map((c) => (
              <div
                key={c.cohortId}
                className="flex items-center justify-between px-3 py-2 border border-line-subtle"
                style={{ borderRadius: '2px' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-ink-quaternary">cohort</span>
                  <span className="text-xs font-mono text-ink">{c.cohortId}</span>
                </div>
                <span className="text-[10px] font-mono text-ink-secondary">→ {c.version.slice(0, 8)}</span>
              </div>
            ))}
            <div
              className="flex items-center justify-between px-3 py-2 border border-line-subtle"
              style={{ borderRadius: '2px', backgroundColor: 'rgba(201,168,76,0.04)' }}
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-ink-quaternary">default</span>
              <span className="text-[10px] font-mono text-ink-secondary">→ {cohortRouting.defaultVersion.version.slice(0, 8)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
