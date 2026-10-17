import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { dur, ease } from '@/lib/motion'
import { Button } from '@/components/ui/Button'

interface RevealDialogProps {
  image: string
  imageAlt: string
  title: string
  /** Teks besar di bawah judul (mis. "1/4"). Dibacakan screen reader lewat aria-live. */
  highlight?: string
  children?: ReactNode
  closeLabel: string
  onClose: () => void
}

/** Dialog pop-up hadiah visual (stamp baru, stiker digital). Esc menutup; fokus pindah ke tombol tutup. */
export function RevealDialog({ image, imageAlt, title, highlight, children, closeLabel, onClose }: RevealDialogProps) {
  const reduce = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.querySelector('button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="polo-reveal-title"
        initial={reduce ? false : { opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: dur.slow, ease }}
        className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg bg-white p-8 text-center shadow-[0_16px_50px_rgba(0,0,0,.18)]"
      >
        <motion.img
          src={image}
          alt={imageAlt}
          className="h-44 w-44"
          initial={reduce ? false : { rotate: -12, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: dur.slow, ease }}
        />
        <h2 id="polo-reveal-title" className="text-display-m">
          {title}
        </h2>
        {highlight && (
          <p className="text-display-l tabular-nums" aria-live="polite">
            {highlight}
          </p>
        )}
        {children}
        <Button variant="dark" onClick={onClose} className="mt-2">
          {closeLabel}
        </Button>
      </motion.div>
    </div>
  )
}
