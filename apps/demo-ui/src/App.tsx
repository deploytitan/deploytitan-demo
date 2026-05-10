import { useEventStream } from './hooks/useApi'
import { useSpotlight } from './hooks/useAnimations'
import { ChangeGenerator } from './components/ChangeGenerator'
import { DeploymentTimeline } from './components/DeploymentTimeline'
import { TrafficControl } from './components/TrafficControl'
import { CohortTester } from './components/CohortTester'
import { VersionPanel } from './components/VersionPanel'
import { StackGap } from './components/StackGap'
import { Capabilities } from './components/Capabilities'
import { WorkflowAnimation } from './components/WorkflowAnimation'
import { GOLD } from './utils'

export default function App() {
  const spotlightRef = useSpotlight()
  const { events, routing, deployments, connected } = useEventStream()

  return (
    <div className="min-h-screen bg-surface">

      {/* ------------------------------------------------------------------ */}
      {/* Navbar — matches deploytitan.com                                     */}
      {/* ------------------------------------------------------------------ */}
      <nav className="border-b border-line bg-surface/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between h-16">

          {/* Left: Logo + nav links */}
          <div className="flex items-center gap-8">
            <a href="https://deploytitan.com" className="flex items-center shrink-0">
              <span className="font-display text-xl font-medium tracking-[-0.02em]">Deploy</span>
              <span className="font-display text-xl font-medium tracking-[-0.02em] text-primary-dark">Titan</span>
            </a>
            <div className="hidden lg:flex items-center gap-6">
              <a href="https://deploytitan.com/products/titan-foresight" className="text-sm text-ink-secondary hover:text-ink transition-colors">Products</a>
              <a href="https://deploytitan.com/pricing" className="text-sm text-ink-secondary hover:text-ink transition-colors">Pricing</a>
              <a href="https://deploytitan.com/customers" className="text-sm text-ink-secondary hover:text-ink transition-colors">Customers</a>
            </div>
          </div>

          {/* Right: SSE status + CTA */}
          <div className="flex items-center gap-4">
            {/* Live connection indicator */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5"
                style={{
                  borderRadius: '0.5px',
                  backgroundColor: connected ? '#22c55e' : '#ef4444',
                  animation: connected ? 'pulse-anim 2s infinite' : undefined,
                }}
              />
              <span className="text-[10px] font-mono text-ink-tertiary uppercase tracking-[0.1em] hidden sm:block">
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            <a
              href="https://app.deploytitan.com/signin"
              className="hidden lg:block text-sm text-ink-secondary hover:text-ink transition-colors px-4 py-2"
            >
              Sign in
            </a>
            <a
              href="https://deploytitan.com/early-access"
              className="inline-flex items-center gap-2 bg-ink text-surface px-4 py-2 text-sm font-medium transition-all active:scale-[0.97] hover:shadow-[0_0_0_1px_rgba(201,168,76,0.3),0_2px_8px_rgba(0,0,0,0.08)]"
              style={{ borderRadius: '2px' }}
            >
              Get started
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Demo header strip — compact, action-oriented                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-b border-line bg-surface-alt/50 py-4">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <span
              className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider shrink-0"
              style={{ borderRadius: '1px', color: GOLD, backgroundColor: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              Live Demo
            </span>
            <h1 className="font-display font-medium text-base tracking-[-0.01em]">
              Trigger a real deployment from your browser
            </h1>
          </div>
          <p className="text-sm text-ink-tertiary sm:ml-auto hidden lg:block">
            Real GitHub commits · Cloud Run · Cohort routing · No signup
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main demo area — immediately visible                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-8 lg:py-12 border-b border-line relative" ref={spotlightRef as React.RefObject<HTMLDivElement>}>
        <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Column 1 — Write a change */}
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary">
                <span className="w-8 h-px bg-gold/40" />
                Step 1 — Write a change
              </span>
              <ChangeGenerator />
            </div>

            {/* Column 2 — Watch it deploy */}
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary">
                <span className="w-8 h-px bg-gold/40" />
                Step 2 — Watch it deploy
              </span>
              <DeploymentTimeline events={events} connected={connected} />
              <TrafficControl routing={routing} />
            </div>

            {/* Column 3 — Test routing */}
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary">
                <span className="w-8 h-px bg-gold/40" />
                Step 3 — Test cohort routing
              </span>
              <CohortTester deployments={deployments} />
            </div>

            {/* Column 4 — Manage versions */}
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary">
                <span className="w-8 h-px bg-gold/40" />
                Step 4 — Manage versions
              </span>
              <VersionPanel deployments={deployments} />
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Failure Scenarios — simulated walkthroughs                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-10 border-b border-line bg-surface-alt/30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <span className="text-xs font-mono text-ink-tertiary uppercase tracking-widest">Failure Scenarios</span>
            <span
              className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider shrink-0"
              style={{ borderRadius: '1px', color: '#94a3b8', backgroundColor: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.2)' }}
            >
              Simulated
            </span>
            <div className="hidden sm:block h-px flex-1 bg-line/60" />
            <span className="hidden lg:block text-xs text-ink-tertiary">
              Scripted walkthroughs of how DeployTitan detects and recovers from real failure patterns
            </span>
          </div>
        </div>
        <WorkflowAnimation />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How it works — compact architecture summary                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-10 border-b border-line">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <span className="text-xs font-mono text-ink-tertiary uppercase tracking-widest">How it works</span>
            <div className="hidden sm:block h-px flex-1 bg-line/60" />
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line/60 border border-line overflow-hidden"
            style={{ borderRadius: '2px' }}
          >
            {[
              { step: '01', title: 'GitHub Commit', desc: 'Your message is committed via the GitHub Contents API, triggering a CI/CD workflow.', color: '#22c55e' },
              { step: '02', title: 'Cloud Run Deploy', desc: 'GitHub Actions builds a Docker image and deploys a new Cloud Run revision with 0% traffic.', color: '#3b82f6' },
              { step: '03', title: 'Progressive Rollout', desc: 'Traffic shifts: 5% → 25% → 50% → 100%. DeployTitan updates routing config at each step.', color: GOLD },
              { step: '04', title: 'Cohort Routing', desc: 'The controller reads X-Cohort-ID header and routes specific user groups to specific versions.', color: '#8b5cf6' },
            ].map((item) => (
              <div key={item.step} className="bg-surface p-5 lg:p-6 group transition-all duration-300 hover:bg-surface-alt">
                <div className="text-[10px] font-mono uppercase tracking-[0.1em] mb-3" style={{ color: item.color }}>{item.step}</div>
                <h3 className="font-display font-medium text-sm tracking-[-0.01em] mb-1.5">{item.title}</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Stack Gap + Capabilities — always visible                            */}
      {/* ------------------------------------------------------------------ */}
      <StackGap />
      <Capabilities />

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer className="py-6 border-t border-line bg-surface-alt/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <span className="text-xs font-mono text-ink-quaternary">
            DeployTitan — The safest way to deploy software
          </span>
          <a
            href="https://deploytitan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-ink-tertiary hover:text-primary transition-colors"
          >
            deploytitan.com →
          </a>
        </div>
      </footer>

    </div>
  )
}
