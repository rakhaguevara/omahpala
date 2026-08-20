import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'

import Home from '@/pages/public/Home'
import Catalog from '@/pages/public/Catalog'
import ProductDetail from '@/pages/public/ProductDetail'
import Articles from '@/pages/public/Articles'
import ArticleDetail from '@/pages/public/ArticleDetail'
import Program from '@/pages/public/Program'
import Kebun from '@/pages/public/Kebun'
import KebunDetail from '@/pages/public/KebunDetail'
import Contact from '@/pages/public/Contact'
import NotFound from '@/pages/public/NotFound'

// Panel admin di-lazy-load: pengunjung situs publik (mayoritas trafik) tidak perlu
// mengunduh kode admin sama sekali — membantu target LCP < 2,5 detik (PRD §9).
const AdminLayout = lazy(() =>
  import('@/components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminLogin = lazy(() => import('@/pages/admin/Login'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const ProductsAdmin = lazy(() => import('@/pages/admin/ProductsAdmin'))
const OrdersAdmin = lazy(() => import('@/pages/admin/OrdersAdmin'))
const KebunAdmin = lazy(() => import('@/pages/admin/KebunAdmin'))
const ContentAdmin = lazy(() => import('@/pages/admin/ContentAdmin'))

// Peta situs — PRD §6
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="produk" element={<Catalog />} />
        <Route path="produk/:slug" element={<ProductDetail />} />
        <Route path="artikel" element={<Articles />} />
        <Route path="artikel/:slug" element={<ArticleDetail />} />
        <Route path="program" element={<Program />} />
        <Route path="kebun" element={<Kebun />} />
        <Route path="kebun/:code" element={<KebunDetail />} />
        <Route path="kontak" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="admin/login"
        element={
          <Suspense fallback={null}>
            <AdminLogin />
          </Suspense>
        }
      />
      <Route
        path="admin"
        element={
          <Suspense fallback={null}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="produk" element={<ProductsAdmin />} />
        <Route path="pesanan" element={<OrdersAdmin />} />
        <Route path="kebun" element={<KebunAdmin />} />
        <Route path="konten" element={<ContentAdmin />} />
      </Route>
    </Routes>
  )
}
