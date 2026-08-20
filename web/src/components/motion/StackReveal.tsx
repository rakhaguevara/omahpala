import { useEffect, useRef } from 'react'

interface StackRevealProps {
  images: string[]
  className?: string
  /** Extra scroll distance (px) spent revealing each card after the first. */
  stepPx?: number
  /** Resting vertical offset (px) between successively stacked cards once fully settled. */
  peekPx?: number
  /** How much (px) of each covered card already peeks out before any scrolling happens. */
  initialPeekPx?: number
}

/** Cards slide up from below and settle into a peeking stack as the page scrolls past — driven by
 * the page's own scroll (no nested scroll container). Each covered card already peeks out a bit
 * before scrolling starts, so it reads as "still there, about to merge up" rather than hidden. */
export function StackReveal({
  images,
  className = '',
  stepPx = 90,
  peekPx = 32,
  initialPeekPx = 110,
}: StackRevealProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const measureRef = useRef({ outerTop: 0, holderHeight: 0, scrollRange: 1 })
  const rafRef = useRef<number | null>(null)
  const tickingRef = useRef(false)

  useEffect(() => {
    const outer = outerRef.current
    const holder = holderRef.current
    if (!outer || !holder) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const n = cardsRef.current.length
    const extraPerCard = reduceMotion ? 0 : stepPx

    const measure = () => {
      const holderHeight = holder.getBoundingClientRect().height
      outer.style.height = `${holderHeight + (n - 1) * extraPerCard}px`
      measureRef.current = {
        outerTop: outer.offsetTop,
        holderHeight,
        scrollRange: Math.max((n - 1) * extraPerCard, 1),
      }
      update()
    }

    const update = () => {
      const { outerTop, holderHeight, scrollRange } = measureRef.current
      const progress = reduceMotion
        ? 1
        : Math.min(Math.max((window.scrollY - outerTop) / scrollRange, 0), 1)

      cardsRef.current.forEach((card, i) => {
        if (i === 0) return
        const local = Math.min(Math.max(progress * (n - 1) - (i - 1), 0), 1)
        // Each covered card starts already peeking out from under the one(s) above it (staggered
        // per index so they don't all peek from the exact same spot), then rises to its resting peek.
        const start = Math.max(holderHeight - initialPeekPx + (i - 1) * 24, i * peekPx)
        const end = i * peekPx
        const translateY = start + (end - start) * local
        card.style.transform = `translate3d(0, ${Math.round(translateY)}px, 0)`
      })
    }

    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      rafRef.current = requestAnimationFrame(() => {
        update()
        tickingRef.current = false
      })
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [images.length, stepPx, peekPx, initialPeekPx])

  return (
    <div ref={outerRef} className={`relative ${className}`.trim()}>
      <div
        ref={holderRef}
        className="sticky top-24 aspect-[4/5] w-full overflow-hidden rounded-md"
      >
        {images.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              if (el) cardsRef.current[i] = el
            }}
            className="absolute inset-0 rounded-md shadow-lg"
            style={{ zIndex: i + 1 }}
          >
            <img src={src} alt="" loading="lazy" className="h-full w-full rounded-md object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}
