import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3" stagger={0.08}>
      {products.map((product) => (
        <StaggerItem key={product.id} className="h-full">
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </Stagger>
  )
}
