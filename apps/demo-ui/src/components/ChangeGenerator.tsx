import { useState } from 'react'
import { useCommit } from '../hooks/useApi'

export function ChangeGenerator() {
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [success, setSuccess] = useState(false)
  const { commit, loading, error } = useCommit()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await commit(text.trim(), author.trim() || 'anonymous')
      setSuccess(true)
      setText('')
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      // error shown via hook
    }
  }

  return (
    <div
      className="border border-line bg-white p-6 spotlight-card group transition-all duration-300 hover:border-gold/30 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(201,168,76,0.08)]"
      style={{ borderRadius: '2px' }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/0 group-hover:border-gold/30 transition-all duration-300" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold/0 group-hover:border-gold/30 transition-all duration-300" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-ink flex items-center justify-center" style={{ borderRadius: '1px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <span className="font-display font-medium text-sm tracking-[-0.01em]">Trigger a Deployment</span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.1em] text-ink-quaternary">
          via GitHub API
        </span>
      </div>

      <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
        Write a message. We'll commit it to GitHub — triggering a real CI/CD pipeline, a live Cloud Run deployment, and a progressive rollout.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={140}
            placeholder="What should the service say?"
            className="w-full px-4 py-3 border border-line bg-surface text-sm text-ink placeholder:text-ink-quaternary focus:outline-none focus:border-gold/40 transition-colors"
            style={{ borderRadius: '2px' }}
            disabled={loading}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-mono text-ink-quaternary">max 140 chars</span>
            <span className={`text-[10px] font-mono ${text.length > 120 ? 'text-signal-warning' : 'text-ink-quaternary'}`}>
              {text.length}/140
            </span>
          </div>
        </div>

        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={50}
          placeholder="Your name (optional)"
          className="w-full px-4 py-3 border border-line bg-surface text-sm text-ink placeholder:text-ink-quaternary focus:outline-none focus:border-gold/40 transition-colors"
          style={{ borderRadius: '2px' }}
          disabled={loading}
        />

        {error && (
          <p className="text-sm text-signal-danger font-mono">{error}</p>
        )}

        {success && (
          <div
            className="px-4 py-3 text-sm font-mono text-signal-success border border-signal-success/30"
            style={{ borderRadius: '2px', backgroundColor: 'rgba(34,197,94,0.06)' }}
          >
            ✓ Committed! Deployment starting...
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="inline-flex items-center justify-center gap-2.5 bg-ink text-surface px-6 py-3 text-sm font-medium hover:bg-ink/85 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: '2px' }}
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border border-surface/40 border-t-surface animate-spin" style={{ borderRadius: '50%' }} />
              Committing...
            </>
          ) : (
            <>
              Deploy to Production
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
