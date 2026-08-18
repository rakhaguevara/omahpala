import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/utils'

// Pill Button — design.md §5
// Primary bg --accent · Dark bg --ink · Light bg putih · Ghost transparan+border
export type ButtonVariant = 'primary' | 'dark' | 'light' | 'ghost'
export type ButtonSize = 'md' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill text-label ' +
  'transition-[transform,background-color,box-shadow] duration-200 [transition-timing-function:var(--ease-brand)] ' +
  'hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-[#74dd50]',
  dark: 'bg-ink text-white hover:bg-[#141414]',
  light: 'bg-white text-ink hover:bg-[#f2f2f2] shadow-[0_1px_2px_rgba(0,0,0,.06)]',
  ghost: 'bg-transparent text-ink border border-line hover:bg-black/[.03]',
}

const sizes: Record<ButtonSize, string> = {
  md: 'px-6 py-3',
  sm: 'px-5 py-2.5',
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'dark',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

type ExternalLinkButtonProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>

export function ExternalLinkButton({
  variant = 'dark',
  size = 'md',
  className,
  children,
  ...props
}: ExternalLinkButtonProps) {
  return (
    <a className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </a>
  )
}

type RouterLinkButtonProps = CommonProps & LinkProps

export function LinkButton({
  variant = 'dark',
  size = 'md',
  className,
  children,
  ...props
}: RouterLinkButtonProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  )
}

/** Tombol ikon-saja berbentuk lingkaran 44px — design.md §5. */
export function IconButton({
  className,
  children,
  variant = 'ghost',
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full transition-[transform,background-color,border-color,color] duration-200 [transition-timing-function:var(--ease-brand)] hover:-translate-y-px active:translate-y-0',
        variant === 'dark' && 'bg-ink text-white',
        variant === 'light' && 'bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,.06)]',
        variant === 'ghost' &&
          'border border-line bg-transparent text-ink hover:border-accent hover:bg-accent-soft hover:text-accent-ink active:bg-accent active:text-accent-ink active:border-accent',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
