import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

export function useScrollReveal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const elements = container.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const delay = parseInt(el.dataset['revealDelay'] ?? '0', 10) * 80

          animate(el, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            delay,
            ease: 'outExpo',
            onComplete: () => {
              el.style.opacity = ''
              el.style.transform = ''
            },
          })

          observer.unobserve(el)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' },
    )

    elements.forEach((el) => {
      el.style.opacity = '0'
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return ref
}

export function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const cards = el.querySelectorAll<HTMLElement>('.spotlight-card')

    const handlers = Array.from(cards).map((card) => {
      const handler = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        card.style.setProperty('--spotlight-x', `${x}%`)
        card.style.setProperty('--spotlight-y', `${y}%`)
      }
      card.addEventListener('mousemove', handler)
      return { card, handler }
    })

    return () => {
      handlers.forEach(({ card, handler }) => card.removeEventListener('mousemove', handler))
    }
  }, [])

  return ref
}
