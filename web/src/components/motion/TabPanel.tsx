import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface TabPanelProps {
  tabKey: string
  children: ReactNode
  className?: string
}

/**
 * Panel tab dengan AnimatePresence mode="wait" — design.md §6.
 * Keluar opacity→0 200ms, masuk y 12→0 400ms.
 */
export function TabPanel({ tabKey, children, className }: TabPanelProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        className={className}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.44, 0, 0.56, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
