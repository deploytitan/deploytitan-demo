import { useState } from 'react'
import { useDeployments, useCohortUpdate, type DeploymentVersion } from '../hooks/useApi'
import { GOLD } from '../utils'

const PRESET_COHORTS = [
  { id: 'beta-testers', label: 'Beta', color: '#3b82f6' },
  { id: 'internal',     label: 'Internal', color: '#8b5cf6' },
  { id: 'canary',       label: 'Canary', color: GOLD },
]

export function VersionPanel() {
  const { deployments, loading, refresh } = useDeployments()
  const { assignCohort, resetToPercentage, saving, error } = useCohortUpdate()

  // Per-version cohort assignment UI state: deploymentId -> selected cohortId
  const [pendingCohort, setPendingCohort] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function handleAssign(version: DeploymentVersion) {
    const cohortId = pendingCohort[version.deploymentId]
    if (!cohortId) return
    const defaultId = deployments?.versions.find((v) => v.isDefault || v.percentage === 100)?.deploymentId ?? version.deploymentId
    await assignCohort(cohortId, version.deploymentId, defaultId)
    setSuccessMsg(`Cohort "${cohortId}" → ${version.version.slice(0, 8)}`)
    setTimeout(() => setSuccessMsg(null), 3000)
    await refresh()
  }

  async function handleReset() {
    if (!deployments) return
    // Send 100% to the most stable/default version
    const stable = deployments.versions.find((v) => v.isDefault) ?? deployments.versions[0]
    if (!stable) return
    await resetToPercentage([{ deploymentId: stable.deploymentId, percentage: 100 }])
    setSuccessMsg('Reset to 100% percentage routing')
    setTimeout(() => setSuccessMsg(null), 3000)
    await refresh()
  }

  return (
    <div className="border border-line bg-white p-5 flex flex-col gap-4" style={{ borderRadius: '2px' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-ink flex items-center justify-center" style={{ borderRadius: '1px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <span className="font-display font-medium text-sm tracking-[-0.01em]">Deployed Versions</span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.1em] text-ink-quaternary">
          {deployments?.strategy ?? '—'}
        </span>
      </div>

      {/* Strategy badge + reset button */}
      {deployments && (
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider"
            style={{
              borderRadius: '1px',
              color: deployments.strategy === 'cohort' ? GOLD : '#22c55e',
              backgroundColor: deployments.strategy === 'cohort' ? 'rgba(201,168,76,0.1)' : 'rgba(34,197,94,0.1)',
            }}
          >
            {deployments.strategy}
          </span>
          {deployments.strategy !== 'percentage' && (
            <button
              onClick={() => { void handleReset() }}
              disabled={saving}
              className="ml-auto text-[10px] font-mono text-ink-tertiary hover:text-signal-danger transition-colors disabled:opacity-40"
            >
              Reset to 100% →
            </button>
          )}
        </div>
      )}

      {/* Version list */}
      {loading && !deployments && (
        <p className="text-xs font-mono text-ink-quaternary animate-pulse">Loading versions...</p>
      )}

      {deployments?.versions.length === 0 && (
        <p className="text-xs font-mono text-ink-quaternary">No versions deployed yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {deployments?.versions.map((v) => (
          <div
            key={v.deploymentId}
            className="border border-line-subtle p-3 flex flex-col gap-2 bg-surface-alt"
            style={{ borderRadius: '2px' }}
          >
            {/* Version row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono bg-ink text-surface px-1.5 py-0.5" style={{ borderRadius: '1px' }}>
                {v.version.slice(0, 8)}
              </span>
              {v.githubUrl && (
                <a
                  href={v.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-ink-tertiary hover:text-gold transition-colors"
                >
                  ↗ commit
                </a>
              )}
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                {v.percentage !== undefined && (
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-mono"
                    style={{ borderRadius: '1px', color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)' }}
                  >
                    {v.percentage}% traffic
                  </span>
                )}
                {v.cohortId && (
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-mono"
                    style={{ borderRadius: '1px', color: GOLD, backgroundColor: 'rgba(201,168,76,0.1)' }}
                  >
                    cohort: {v.cohortId}
                  </span>
                )}
                {v.isDefault && (
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-mono text-ink-quaternary border border-line-subtle"
                    style={{ borderRadius: '1px' }}
                  >
                    default
                  </span>
                )}
                <span
                  className="w-1.5 h-1.5"
                  style={{ borderRadius: '0.5px', backgroundColor: v.healthy ? '#22c55e' : '#ef4444' }}
                  title={v.healthy ? 'healthy' : 'unhealthy'}
                />
              </div>
            </div>

            {/* Cohort assignment */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-ink-quaternary">assign cohort:</span>
              {PRESET_COHORTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    setPendingCohort((prev) => ({
                      ...prev,
                      [v.deploymentId]: prev[v.deploymentId] === c.id ? '' : c.id,
                    }))
                  }
                  className="px-2 py-0.5 border text-[9px] font-mono transition-all"
                  style={{
                    borderRadius: '1px',
                    borderColor: pendingCohort[v.deploymentId] === c.id ? c.color : 'var(--color-line)',
                    backgroundColor: pendingCohort[v.deploymentId] === c.id ? `${c.color}15` : 'transparent',
                    color: pendingCohort[v.deploymentId] === c.id ? c.color : 'var(--color-ink-quaternary)',
                  }}
                >
                  {c.label}
                </button>
              ))}
              <button
                onClick={() => { void handleAssign(v) }}
                disabled={saving || !pendingCohort[v.deploymentId]}
                className="ml-auto px-2.5 py-0.5 bg-ink text-surface text-[9px] font-mono hover:bg-ink/85 transition-all disabled:opacity-30"
                style={{ borderRadius: '1px' }}
              >
                {saving ? '...' : 'Apply'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {successMsg && (
        <p className="text-[10px] font-mono text-signal-success">{successMsg}</p>
      )}
      {error && (
        <p className="text-[10px] font-mono text-signal-danger">{error}</p>
      )}
    </div>
  )
}
