import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: ReactNode
}

/** Chip tab — design.md §5. Aktif: latar --ink, teks putih. */
export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-pill border px-5 py-2.5 text-label transition-colors duration-200 [transition-timing-function:var(--ease-brand)]',
        active
          ? 'border-ink bg-ink text-white'
          : 'border-line bg-transparent text-ink hover:border-ink/40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
