import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { dur, ease } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface StaggerProps {
  children: ReactNode
  className?: string
  /** Maksimal 6 anak — lebih dari itu terasa lambat (design.md §6). */
  stagger?: number
}

export function Stagger({ children, className, stagger = 0.08 }: StaggerProps) {
  const reduce = useReducedMotion()

  if (reduce) return <div className={cn(className)}>{children}</div>

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={cn(className)}>{children}</div>

  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: dur.base, ease } },
      }}
    >
      {children}
    </motion.div>
  )
}
