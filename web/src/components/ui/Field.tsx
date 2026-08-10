import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'

// Border solid --line saat diam, jadi dashed --ink saat fokus — meniru detail
// framer-input-focused-border-style:dashed dari referensi Framer asli.
const fieldBase =
  'w-full rounded-sm border border-line bg-white px-4 py-3 text-body text-ink placeholder:text-muted-2 ' +
  'transition-[border-color,border-style] duration-200 [transition-timing-function:var(--ease-brand)] ' +
  'focus:border-ink focus:border-dashed focus:outline-none'

interface FieldWrapperProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>
}

export function FieldWrapper({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
  labelProps,
}: FieldWrapperProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-label text-ink" {...labelProps}>
        {label}
        {required && <span className="text-accent-ink"> *</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-meta text-[#B23A3A]">
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'min-h-32 resize-y', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, 'appearance-none bg-white', className)} {...props}>
      {children}
    </select>
  )
}
