import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from 'framer-motion'
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

type BackgroundChild = ReactElement<{
  className?: string
  children?: ReactNode
  'data-id': string
}>

interface AnimatedBackgroundProps {
  children: BackgroundChild[] | BackgroundChild
  defaultValue?: string
  onValueChange?: (newActiveId: string | null) => void
  className?: string
  transition?: Transition
  enableHover?: boolean
}

/**
 * Latar yang meluncur mengikuti item aktif/di-hover lewat framer-motion `layoutId` — pola
 * "Motion Primitives" AnimatedBackground, dipasang persis seperti contoh yang diberikan
 * pengguna (termasuk transisi spring-nya, bukan --ease-brand — sengaja, atas permintaan).
 * Nonaktif otomatis (tanpa animasi layout) saat prefers-reduced-motion.
 *
 * Beda dari referensi asli: saat mouse keluar (`enableHover`), latar kembali ke `defaultValue`
 * alih-alih hilang total — supaya halaman aktif tetap tersorot ketika navbar tidak sedang dihover.
 */
export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultValue ?? null)
  const uniqueId = useId()
  const reduce = useReducedMotion()

  function handleSetActiveId(id: string | null) {
    setActiveId(id)
    onValueChange?.(id)
  }

  useEffect(() => {
    if (defaultValue !== undefined) setActiveId(defaultValue)
  }, [defaultValue])

  const items = Children.toArray(children).filter(isValidElement) as BackgroundChild[]

  return (
    <>
      {items.map((child, index) => {
        const id = child.props['data-id']
        const interactionProps = enableHover
          ? {
              onMouseEnter: () => handleSetActiveId(id),
              onMouseLeave: () => handleSetActiveId(defaultValue ?? null),
            }
          : { onClick: () => handleSetActiveId(id) }

        return cloneElement(
          child,
          {
            key: id || index,
            className: cn('relative inline-flex', child.props.className),
            ...interactionProps,
          },
          <>
            <AnimatePresence initial={false}>
              {activeId === id && (
                <motion.div
                  layoutId={`animated-background-${uniqueId}`}
                  className={cn('absolute inset-0', className)}
                  transition={reduce ? { duration: 0 } : transition}
                  initial={{ opacity: defaultValue === id ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
            <span className="relative z-10">{child.props.children}</span>
          </>,
        )
      })}
    </>
  )
}
