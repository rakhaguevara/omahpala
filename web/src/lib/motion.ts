// Motion tokens — sumber: design.md §6
// Satu easing untuk semuanya. Jangan tambah easing/durasi lain.

import type { Variants } from 'framer-motion'

export const ease = [0.44, 0, 0.56, 1] as const

export const dur = {
  fast: 0.2, // hover, perubahan warna
  base: 0.4, // standar — transisi, tab, reveal
  slow: 0.8, // masuk hero, elemen besar
} as const

/** opacity 0→1, y 24→0 — dipakai lewat komponen <Reveal> */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.base, ease },
  },
}

export const reduceMotionVariants: Variants = {
  hidden: {},
  visible: {},
}

export const staggerContainer = (stagger = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger },
  },
})

export const heroEnter: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.slow, ease },
  },
}
