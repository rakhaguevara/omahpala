import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Lebar konten maksimal 1280px, padding horizontal fluid — design.md §4. */
export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1280px] px-[clamp(20px,5vw,80px)]', className)}
      {...props}
    >
      {children}
    </div>
  )
}
