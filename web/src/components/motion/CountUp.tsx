import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  value: number
  suffix?: string
  className?: string
  durationSec?: number
}

/**
 * Band statistik: angka menghitung naik saat masuk viewport, sekali saja — design.md §6, PRD H-07.
 * Nilai ditulis langsung ke textContent (pola resmi Framer Motion untuk counter) agar tidak
 * memicu re-render React di setiap frame.
 */
export function CountUp({ value, suffix = '', className, durationSec = 1.4 }: CountUpProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(spanRef, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const motionValue = useMotionValue(0)

  useEffect(() => {
    const node = spanRef.current
    if (!node) return

    node.textContent = '0'

    if (!inView) return

    if (reduce) {
      node.textContent = value.toLocaleString('id-ID')
      return
    }

    const controls = animate(motionValue, value, {
      duration: durationSec,
      ease: 'easeOut',
      onUpdate(latest) {
        node.textContent = Math.round(latest).toLocaleString('id-ID')
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, durationSec])

  return (
    <span className={className}>
      <span ref={spanRef} className="tabular-nums">
        0
      </span>
      {suffix}
    </span>
  )
}
