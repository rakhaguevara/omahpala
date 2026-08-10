import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MarqueeProps {
  children: ReactNode
  className?: string
  durationSec?: number
}

/**
 * Ticker/marquee — design.md §6. Isi diduplikasi persis dua kali agar loop mulus.
 * `prefers-reduced-motion`: berhenti bergerak, tampil sebagai baris statis.
 */
export function Marquee({ children, className, durationSec = 28 }: MarqueeProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={cn('flex flex-wrap items-center gap-15', className)}>{children}</div>
  }

  return (
    <div className="overflow-hidden">
      <motion.div
        className={cn('flex w-max items-center gap-15', className)}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: durationSec, ease: 'linear', repeat: Infinity }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}
