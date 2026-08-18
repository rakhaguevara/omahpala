import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'accent' | 'neutral' | 'pending' | 'featured'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  children: ReactNode
}

const toneClass: Record<BadgeTone, string> = {
  accent: 'bg-accent-soft text-accent-ink',
  neutral: 'bg-surface text-muted border border-line',
  pending: 'bg-[#FFF6E0] text-[#7A5A00]',
  // Solid, bukan transparan — teks putih di atas --accent-ink (bukan --accent) supaya kontras
  // tetap aman, sesuai peringatan design.md: teks putih tidak boleh di atas warna aksen terang.
  featured: 'bg-accent-ink text-white',
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-meta font-medium',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

interface EyebrowProps {
  children: ReactNode
  className?: string
  /** Warna teks — beri eksplisit tiap pemakaian supaya tidak tabrakan cascade. */
  tone?: 'muted' | 'white'
}

export function Eyebrow({ children, className, tone = 'muted' }: EyebrowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-eyebrow',
        tone === 'muted' ? 'text-muted' : 'text-white/80',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      {children}
    </div>
  )
}
