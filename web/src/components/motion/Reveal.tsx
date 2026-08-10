import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { dur, ease } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** 'up' (default, y 24→0) atau 'none' (opacity saja) */
  direction?: 'up' | 'none'
  as?: 'div' | 'span'
}

/**
 * Appear-on-scroll — design.md §6.
 * whileInView + viewport once:true amount:0.25. Reveal hanya sekali, tidak berulang.
 */
export function Reveal({ children, className, delay = 0, direction = 'up', as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  const MotionTag = as === 'span' ? motion.span : motion.div

  if (reduce) {
    const Tag = as
    return <Tag className={cn(className)}>{children}</Tag>
  }

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y: direction === 'up' ? 24 : 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: dur.base, ease, delay }}
    >
      {children}
    </MotionTag>
  )
}
