import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'paper' | 'surface' | 'ink'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  tone?: Tone
  id?: string
}

const toneClass: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  surface: 'bg-surface text-ink',
  ink: 'bg-ink text-white',
}

/**
 * Irama section — design.md §2 "Irama section".
 * Padding vertikal fluid clamp(80px, 10vw, 140px).
 */
export function Section({ children, tone = 'paper', className, id, ...props }: SectionProps) {
  return (
    <section
      id={id}
      data-tone={tone}
      className={cn(
        'py-[clamp(80px,10vw,140px)]',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}
