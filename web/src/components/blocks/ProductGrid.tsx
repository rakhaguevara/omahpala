import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { IconButton } from '@/components/ui/Button'
import { IconChevronLeft, IconChevronRight } from '@/components/ui/Icons'

interface ProductGridProps {
  products: Product[]
  /** Carousel horizontal (maks. 4 kartu terlihat di layar lebar, sisanya digeser dengan tombol
   * panah) alih-alih grid statis yang membungkus ke baris baru — dipakai di section katalog per
   * komoditas yang bisa berisi puluhan produk. Beranda & "produk terkait" tetap grid statis. */
  carousel?: boolean
}

export function ProductGrid({ products, carousel = false }: ProductGridProps) {
  const { t } = useTranslation()
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  if (!carousel) {
    return (
      <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" stagger={0.08}>
        {products.map((product) => (
          <StaggerItem key={product.id} className="h-full">
            <ProductCard product={product} compact />
          </StaggerItem>
        ))}
      </Stagger>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={scrollerRef}
        className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] lg:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {/* Lebar kartu pakai calc() supaya PAS berapa pun kolomnya (bukan cuma dekat pas) — persentase
            genap saja (mis. 25%) akan meleset karena gap flex dihitung terpisah dari lebar kolom.
            w-full di mobile sengaja TIDAK diberi "peek" kartu berikutnya — tampilan awal harus utuh,
            bukan kartu yang kepotong setengah; tombol panah sudah cukup jadi penanda bisa digeser.
            w-full WAJIB di Stagger ini sendiri — tanpa itu dia flex item shrink-to-fit tanpa lebar
            pasti, jadi persentase/calc() pada StaggerItem di dalamnya salah hitung (itu sebabnya
            kartu ke-4 kepotong meski breakpoint sudah lg/xl). */}
        <Stagger className="flex w-full gap-4 lg:gap-5" stagger={0.08}>
          {products.map((product) => (
            <StaggerItem
              key={product.id}
              className="w-full shrink-0 snap-start sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(25%-15px)]"
            >
              <ProductCard product={product} compact={false} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {products.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <IconButton type="button" aria-label={t('catalog.carouselPrev')} onClick={() => scroll(-1)}>
            <IconChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton type="button" aria-label={t('catalog.carouselNext')} onClick={() => scroll(1)}>
            <IconChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
