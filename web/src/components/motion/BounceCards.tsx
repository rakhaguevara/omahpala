import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from 'framer-motion'
import './BounceCards.css'

interface BounceCardsProps {
  className?: string
  images: string[]
  containerWidth?: number
  containerHeight?: number
  animationDelay?: number
  animationStagger?: number
  easeType?: string
  transformStyles?: string[]
  enableHover?: boolean
}

const DEFAULT_TRANSFORMS = [
  'rotate(10deg) translate(-170px)',
  'rotate(5deg) translate(-85px)',
  'rotate(-3deg)',
  'rotate(-10deg) translate(85px)',
  'rotate(2deg) translate(170px)',
]

// React Bits "BounceCards" (JS+CSS variant), diadaptasi ke TS + prefers-reduced-motion —
// design.md §6 mewajibkan semua primitive motion menghormati preferensi itu, GSAP di sini
// tidak terkecuali. Ditambah scaling responsif (ResizeObserver) karena komponen aslinya
// berdimensi piksel tetap dan akan meluber di layar sempit.
export default function BounceCards({
  className = '',
  images = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = DEFAULT_TRANSFORMS,
  enableHover = true,
}: BounceCardsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const update = () => {
      const available = el.getBoundingClientRect().width
      if (available > 0) setScale(Math.min(1, available / containerWidth))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerWidth])

  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.card',
        { scale: 0 },
        { scale: 1, stagger: animationStagger, ease: easeType, delay: animationDelay },
      )
    }, containerRef)
    return () => ctx.revert()
  }, [animationStagger, easeType, animationDelay, reduce])

  const getNoRotationTransform = (transformStr: string) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr)
    if (hasRotate) return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)')
    if (transformStr === 'none') return 'rotate(0deg)'
    return `${transformStr} rotate(0deg)`
  }

  const getPushedTransform = (baseTransform: string, offsetX: number) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/
    const match = baseTransform.match(translateRegex)
    if (match) {
      const currentX = parseFloat(match[1])
      const newX = currentX + offsetX
      return baseTransform.replace(translateRegex, `translate(${newX}px)`)
    }
    return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`
  }

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || reduce || !containerRef.current) return
    const q = gsap.utils.selector(containerRef)

    images.forEach((_, i) => {
      const target = q(`.card-${i}`)
      gsap.killTweensOf(target)
      const baseTransform = transformStyles[i] || 'none'

      if (i === hoveredIdx) {
        gsap.to(target, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto',
        })
      } else {
        const offsetX = i < hoveredIdx ? -160 : 160
        const distance = Math.abs(hoveredIdx - i)
        gsap.to(target, {
          transform: getPushedTransform(baseTransform, offsetX),
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay: distance * 0.05,
          overwrite: 'auto',
        })
      }
    })
  }

  const resetSiblings = () => {
    if (!enableHover || reduce || !containerRef.current) return
    const q = gsap.utils.selector(containerRef)

    images.forEach((_, i) => {
      const target = q(`.card-${i}`)
      gsap.killTweensOf(target)
      gsap.to(target, {
        transform: transformStyles[i] || 'none',
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto',
      })
    })
  }

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: containerHeight * scale }}>
      <div
        className={`bounceCardsContainer ${className}`}
        ref={containerRef}
        style={{
          width: containerWidth,
          height: containerHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {images.map((src, idx) => (
          <div
            key={src}
            className={`card card-${idx}`}
            style={{ transform: transformStyles[idx] ?? 'none' }}
            onMouseEnter={() => pushSiblings(idx)}
            onMouseLeave={resetSiblings}
          >
            <img className="image" src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}
