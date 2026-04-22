import type { DeployEvent } from '../hooks/useApi'

const EVENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  commit:  { label: 'COMMIT',  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  routing: { label: 'ROUTING', color: '#c9a84c', bg: 'rgba(201,168,76,0.08)' },
  connected: { label: 'CONNECTED', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
}

interface Props {
  events: DeployEvent[]
  connected: boolean
}

export function DeploymentTimeline({ events, connected }: Props) {
  return (
    <div
      className="border border-line bg-white p-4 flex flex-col gap-0"
      style={{ borderRadius: '2px' }}
    >
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-line">
        <span className="font-display font-medium text-sm tracking-[-0.01em]">Event Stream</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5"
            style={{
              borderRadius: '0.5px',
              backgroundColor: connected ? '#22c55e' : '#ef4444',
              animation: connected ? 'pulse-anim 2s infinite' : undefined,
            }}
          />
          <span className="text-[10px] font-mono text-ink-tertiary uppercase tracking-[0.1em]">
            {connected ? 'LIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0 overflow-y-auto" style={{ maxHeight: '280px' }}>
        {events.length === 0 && (
          <div className="py-6 text-center text-sm text-ink-quaternary font-mono">
            Waiting for events...
          </div>
        )}
        {events.map((ev, i) => {
          const meta = EVENT_LABELS[ev.type] ?? EVENT_LABELS['commit']!
          return (
            <div
              key={i}
              className="log-entry flex items-start gap-3 py-2 border-b border-line-subtle last:border-0"
            >
              <span
                className="mt-0.5 shrink-0 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider"
                style={{ borderRadius: '1px', color: meta.color, backgroundColor: meta.bg }}
              >
                {meta.label}
              </span>
              <div className="flex-1 min-w-0">
                {ev.type === 'commit' && (
                  <p className="text-xs font-mono text-ink truncate">
                    "{(ev.data['message'] as string | undefined) ?? ''}"
                    <span className="text-ink-quaternary ml-1">by {(ev.data['author'] as string | undefined) ?? 'anon'}</span>
                  </p>
                )}
                {ev.type === 'routing' && (
                  <p className="text-xs font-mono text-ink">
                    strategy=<span className="text-gold">{(ev.data['strategy'] as string | undefined) ?? '?'}</span>
                  </p>
                )}
                {ev.type === 'connected' && (
                  <p className="text-xs font-mono text-signal-success">Connected to event stream</p>
                )}
              </div>
              <span className="text-[10px] font-mono text-ink-quaternary shrink-0">
                {new Date(ev.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
