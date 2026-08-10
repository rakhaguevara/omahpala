import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </Stagger>
  )
}
