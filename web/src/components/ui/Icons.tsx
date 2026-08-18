// Satu set ikon garis tipis, stroke-width 1.5 — design.md "Yang harus dihindari".
// Semua ikon 24×24 viewBox, currentColor.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function IconWhatsapp(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17l-2 4 4.2-1.9A8 8 0 1 0 5 12a7.9 7.9 0 0 0 1.2 4.2L7 17z" />
      <path d="M9 10c0 3 2.5 5.5 5.5 5.5.6 0 1-.5.8-1l-.5-1.2a.9.9 0 0 0-1-.5l-.9.2a4.6 4.6 0 0 1-2.4-2.4l.2-.9a.9.9 0 0 0-.5-1L9.2 8.2c-.5-.2-1 .2-1 .8V10z" />
    </svg>
  )
}

export function IconInstagram(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconMail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7l7.5 6 7.5-6" />
    </svg>
  )
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4h3l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v3a2 2 0 0 1-2 2C10.8 20 4 13.2 4 6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

export function IconLeaf(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14z" />
      <path d="M5 19c2-4 5-7 9-9" />
    </svg>
  )
}

export function IconHeartPulse(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-.6 1-1.3 2-2.2 3" />
      <path d="M4 13h3l1.5-3L11 15l1.5-4H15" />
    </svg>
  )
}

export function IconSeedling(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4-3-6-7-6 0 4 3 6 7 6z" />
      <path d="M12 11c0-3.5 2.5-5.5 6-5.5 0 3.5-2.5 5.5-6 5.5z" />
    </svg>
  )
}

export function IconFlask(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 3h5M10 3v6l-5 9a1.6 1.6 0 0 0 1.4 2.4h11.2A1.6 1.6 0 0 0 19 18l-5-9V3" />
      <path d="M8 15h8" />
    </svg>
  )
}

export function IconStorefront(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9l1-5h14l1 5" />
      <path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
      <path d="M5 9v10h14V9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconSparkle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M12 2.5l2.1 6.4 6.4 2.1-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-2.1L12 2.5z" />
    </svg>
  )
}

export function IconGauge(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 14a8 8 0 1 1 16 0" />
      <path d="M12 14l4-5" />
      <path d="M12 17.5v.01" />
    </svg>
  )
}

export function IconFilter(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <circle cx="15" cy="7" r="2" />
      <path d="M4 12h16" />
      <circle cx="9" cy="12" r="2" />
      <path d="M4 17h16" />
      <circle cx="13" cy="17" r="2" />
    </svg>
  )
}
