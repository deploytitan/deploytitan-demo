import { useState } from 'react'
import { useMessage } from '../hooks/useApi'
import { GOLD } from '../utils'

const PRESET_COHORTS = [
  { id: 'beta-testers', label: 'Beta Testers', color: '#3b82f6' },
  { id: 'internal',     label: 'Internal',     color: '#8b5cf6' },
  { id: 'canary',       label: 'Canary',       color: GOLD },
]

export function CohortTester() {
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const [custom, setCustom] = useState('')
  const { message, loading, error, fetch: fetchMsg } = useMessage()

  const activeCohort = custom.trim() || selected

  function handleTest() {
    fetchMsg(activeCohort)
  }

  return (
    <div className="border border-line bg-white p-5" style={{ borderRadius: '2px' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-ink flex items-center justify-center" style={{ borderRadius: '1px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
            <path d="M13 6h3a2 2 0 012 2v7M11 18H8a2 2 0 01-2-2V9"/>
          </svg>
        </div>
        <span className="font-display font-medium text-sm tracking-[-0.01em]">Test as Cohort</span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.1em] text-ink-quaternary">
          X-Cohort-ID header
        </span>
      </div>

      <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
        Select a cohort to simulate a request with <code className="text-[10px] font-mono px-1 py-0.5 bg-surface-alt" style={{ borderRadius: '1px' }}>X-Cohort-ID</code> header. See which version you're routed to.
      </p>

      {/* Preset cohort chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESET_COHORTS.map((c) => (
          <button
            key={c.id}
            onClick={() => { setSelected(selected === c.id ? undefined : c.id); setCustom('') }}
            className="flex items-center gap-2 px-2.5 py-1.5 border text-[10px] font-mono transition-all"
            style={{
              borderRadius: '2px',
              borderColor: selected === c.id ? c.color : 'var(--color-line)',
              backgroundColor: selected === c.id ? `${c.color}10` : 'transparent',
              color: selected === c.id ? c.color : 'var(--color-ink-secondary)',
            }}
          >
            <span className="w-1.5 h-1.5" style={{ borderRadius: '0.5px', backgroundColor: c.color }} />
            {c.label}
          </button>
        ))}
        <button
          onClick={() => setSelected(undefined)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-line text-[10px] font-mono text-ink-secondary hover:border-line transition-all"
          style={{ borderRadius: '2px' }}
        >
          No cohort
        </button>
      </div>

      {/* Custom cohort input */}
      <input
        type="text"
        value={custom}
        onChange={(e) => { setCustom(e.target.value); setSelected(undefined) }}
        placeholder="Or type a custom cohort ID..."
        className="w-full px-3 py-2 border border-line bg-surface text-xs font-mono text-ink placeholder:text-ink-quaternary focus:outline-none focus:border-gold/40 transition-colors mb-3"
        style={{ borderRadius: '2px' }}
      />

      <button
        onClick={handleTest}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-ink text-surface px-4 py-2.5 text-xs font-mono hover:bg-ink/85 transition-all active:scale-[0.97] disabled:opacity-50"
        style={{ borderRadius: '2px' }}
      >
        {loading ? 'Fetching...' : `Fetch message${activeCohort ? ` as "${activeCohort}"` : ' (no cohort)'}`}
      </button>

      {/* Response */}
      {(message || error) && (
        <div
          className="mt-3 p-3 border border-line bg-surface-alt"
          style={{ borderRadius: '2px' }}
        >
          {error && (
            <p className="text-xs font-mono text-signal-danger">{error}</p>
          )}
          {message && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink">"{message.text}"</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <MetaChip label="version" value={message._meta.version?.slice(0, 8) ?? '?'} />
                {message._meta.cohortId && (
                  <MetaChip label="cohort" value={message._meta.cohortId} color={GOLD} />
                )}
                {message._meta.routingStrategy && (
                  <MetaChip label="strategy" value={message._meta.routingStrategy} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetaChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 border border-line-subtle text-[10px] font-mono"
      style={{ borderRadius: '1px' }}
    >
      <span className="text-ink-quaternary">{label}=</span>
      <span style={{ color: color ?? 'var(--color-ink-secondary)' }}>{value}</span>
    </div>
  )
}
