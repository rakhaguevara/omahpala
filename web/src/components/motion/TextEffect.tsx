import { motion, useReducedMotion, type Transition, type Variants } from 'framer-motion'
import { ease } from '@/lib/motion'

export type TextEffectPer = 'word' | 'char' | 'line'
export type TextEffectPreset = 'blur' | 'fade'

interface TextEffectProps {
  children: string
  per?: TextEffectPer
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  preset?: TextEffectPreset
  className?: string
  delay?: number
}

const staggerByPer: Record<TextEffectPer, number> = {
  char: 0.02,
  word: 0.05,
  line: 0.1,
}

const presetItemVariants: Record<TextEffectPreset, Variants> = {
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
}

function splitText(text: string, per: TextEffectPer): string[] {
  return per === 'line' ? text.split('\n') : text.split(/(\s+)/)
}

/**
 * Reveal teks bertahap per kata/karakter/baris — pola "Motion Primitives" TextEffect.
 * Easing dipakai dari lib/motion.ts (bukan default bawaan framer-motion) supaya tetap satu
 * kurva easing sesuai design.md §6. Render statis (tanpa animasi) saat prefers-reduced-motion.
 */
export function TextEffect({ children, per = 'word', as = 'p', preset = 'fade', className, delay = 0 }: TextEffectProps) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as]

  if (reduce) {
    return <MotionTag className={className}>{children}</MotionTag>
  }

  const segments = splitText(children, per)
  const itemVariant = presetItemVariants[preset]
  const transition: Transition = { duration: 0.4, ease }

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: staggerByPer[per], delayChildren: delay } },
  }
  const itemVariants: Variants = {
    hidden: itemVariant.hidden,
    visible: { ...itemVariant.visible, transition },
  }

  return (
    <MotionTag initial="hidden" animate="visible" variants={containerVariants} className={className}>
      <span className="sr-only">{children}</span>
      {segments.map((segment, index) => {
        if (per === 'line') {
          return (
            <motion.span key={`${segment}-${index}`} aria-hidden variants={itemVariants} className="block">
              {segment}
            </motion.span>
          )
        }
        if (per === 'word') {
          return (
            <motion.span key={`${segment}-${index}`} aria-hidden variants={itemVariants} className="inline-block whitespace-pre">
              {segment}
            </motion.span>
          )
        }
        return (
          <span key={`${segment}-${index}`} aria-hidden className="inline-block whitespace-pre">
            {segment.split('').map((char, charIndex) => (
              <motion.span key={charIndex} variants={itemVariants} className="inline-block whitespace-pre">
                {char}
              </motion.span>
            ))}
          </span>
        )
      })}
    </MotionTag>
  )
}
