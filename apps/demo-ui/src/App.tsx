import { useEventStream } from './hooks/useApi'
import { useScrollReveal, useSpotlight } from './hooks/useAnimations'
import { ChangeGenerator } from './components/ChangeGenerator'
import { DeploymentTimeline } from './components/DeploymentTimeline'
import { TrafficControl } from './components/TrafficControl'
import { CohortTester } from './components/CohortTester'
import { VersionPanel } from './components/VersionPanel'
import { GOLD } from './utils'

export default function App() {
  const sectionRef = useScrollReveal()
  const spotlightRef = useSpotlight()
  const { events, routing, connected } = useEventStream()

  return (
    <div className="min-h-screen bg-surface">

      {/* ------------------------------------------------------------------ */}
      {/* Navbar                                                               */}
      {/* ------------------------------------------------------------------ */}
      <nav className="border-b border-line bg-surface/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-ink flex items-center justify-center" style={{ borderRadius: '2px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="font-display font-medium text-sm tracking-[-0.01em]">DeployTitan</span>
            <span
              className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider"
              style={{ borderRadius: '1px', color: GOLD, backgroundColor: 'rgba(201,168,76,0.1)' }}
            >
              Live Demo
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5"
              style={{
                borderRadius: '0.5px',
                backgroundColor: connected ? '#22c55e' : '#ef4444',
                animation: connected ? 'pulse-anim 2s infinite' : undefined,
              }}
            />
            <span className="text-[10px] font-mono text-ink-tertiary uppercase tracking-[0.1em]">
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative py-16 lg:py-24 border-b border-line overflow-hidden" ref={sectionRef as React.RefObject<HTMLElement>}>
        <div className="absolute inset-0 hero-grid opacity-60 pointer-events-none" />

        {/* Gold scan line */}
        <div
          className="absolute top-0 left-0 h-px w-32 pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
            animation: 'scan-line 8s linear infinite',
          }}
        />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary mb-6" data-reveal>
              <span className="w-8 h-px bg-gold/40" />
              Interactive Demo
            </span>

            <h1
              className="font-display font-medium tracking-[-0.022em] leading-[1.08] mb-5"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.5rem)' }}
              data-reveal
              data-reveal-delay="1"
            >
              Trigger a real{' '}
              <span className="text-ink-secondary">production deployment</span>{' '}
              from your browser
            </h1>

            <p className="text-lg text-ink-secondary leading-relaxed mb-8" data-reveal data-reveal-delay="2">
              Write a message. It gets committed to GitHub, triggers CI/CD, deploys to Cloud Run,
              and rolls out progressively — with live cohort-based routing you can control.
            </p>

            <div className="flex flex-wrap gap-3" data-reveal data-reveal-delay="3">
              {[
                { label: 'Real GitHub commits', color: '#22c55e' },
                { label: 'Cloud Run deployments', color: '#3b82f6' },
                { label: 'Cohort-based routing', color: GOLD },
                { label: 'No signup required', color: '#8b5cf6' },
              ].map((tag) => (
                <div
                  key={tag.label}
                  className="flex items-center gap-2 px-2.5 py-1.5 border border-line-subtle text-[10px] font-mono text-ink-secondary"
                  style={{ borderRadius: '2px' }}
                >
                  <span className="w-1.5 h-1.5" style={{ borderRadius: '0.5px', backgroundColor: tag.color }} />
                  {tag.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Main 3-column demo area                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 lg:py-16 border-b border-line relative" ref={spotlightRef as React.RefObject<HTMLDivElement>}>
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
              <CohortTester />
            </div>

            {/* Column 4 — Manage versions */}
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary">
                <span className="w-8 h-px bg-gold/40" />
                Step 4 — Manage versions
              </span>
              <VersionPanel />
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How it works                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 lg:py-24 border-b border-line relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-ink-secondary">
                <span className="w-8 h-px bg-gold/40" />
                Architecture
                <span className="w-8 h-px bg-gold/40" />
              </span>
            </span>
            <h2 className="font-display font-medium text-3xl lg:text-4xl tracking-[-0.022em] leading-[1.08] mb-4">
              How it <span className="text-ink-secondary">works</span>
            </h2>
            <p className="text-base text-ink-secondary max-w-xl mx-auto">
              Each component is a real service. The controller is a separate process — if the demo service crashes, it routes traffic away automatically.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line/60 border border-line overflow-hidden"
            style={{ borderRadius: '2px' }}
          >
            {[
              {
                step: '01',
                title: 'GitHub Commit',
                desc: 'Your message is committed via the GitHub Contents API, triggering a CI/CD workflow.',
                color: '#22c55e',
              },
              {
                step: '02',
                title: 'Cloud Run Deploy',
                desc: 'GitHub Actions builds a Docker image and deploys a new Cloud Run revision with 0% traffic.',
                color: '#3b82f6',
              },
              {
                step: '03',
                title: 'Progressive Rollout',
                desc: 'Traffic shifts: 5% → 25% → 50% → 100%. DeployTitan updates routing config at each step.',
                color: GOLD,
              },
              {
                step: '04',
                title: 'Cohort Routing',
                desc: 'The controller reads X-Cohort-ID header and routes specific user groups to specific versions.',
                color: '#8b5cf6',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-surface p-6 lg:p-8 group transition-all duration-300 hover:bg-surface-alt"
              >
                <div
                  className="text-[10px] font-mono uppercase tracking-[0.1em] mb-4"
                  style={{ color: item.color }}
                >
                  {item.step}
                </div>
                <h3 className="font-display font-medium text-base tracking-[-0.01em] mb-2">{item.title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer className="py-8 border-t border-line">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <span className="text-xs font-mono text-ink-quaternary">
            DeployTitan — The safest way to deploy software
          </span>
          <a
            href="https://deploytitan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-ink-tertiary hover:text-gold transition-colors"
          >
            deploytitan.com →
          </a>
        </div>
      </footer>

    </div>
  )
}
