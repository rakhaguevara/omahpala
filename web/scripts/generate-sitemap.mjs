// Generate public/sitemap.xml dari data asli (products/plots/articles) sebelum tiap build,
// supaya sitemap selalu sinkron dengan produk & konten yang benar-benar ada — sebelumnya file
// ini ditulis tangan dan cuma memuat 3 dari 24 produk (dan tidak pernah memuat halaman detail
// lahan /kebun/:code sama sekali). Dijalankan lewat "prebuild" di package.json.
import { createServer } from 'vite'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SITE_URL = 'https://omahpala.com'

async function loadData() {
  const server = await createServer({
    configFile: false,
    root,
    resolve: { alias: { '@': path.resolve(root, 'src') } },
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const { productsSeed } = await server.ssrLoadModule('/src/data/products.ts')
    const { plotsSeed } = await server.ssrLoadModule('/src/data/plots.ts')
    const { articles } = await server.ssrLoadModule('/src/data/articles.ts')
    return { productsSeed, plotsSeed, articles }
  } finally {
    await server.close()
  }
}

function url(loc, { priority, lastmod } = {}) {
  const lines = [`  <url>`, `    <loc>${SITE_URL}${loc}</loc>`]
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`)
  if (priority !== undefined) lines.push(`    <priority>${priority.toFixed(1)}</priority>`)
  lines.push(`  </url>`)
  return lines.join('\n')
}

const { productsSeed, plotsSeed, articles } = await loadData()

const urls = [
  url('/', { priority: 1.0 }),
  url('/produk', { priority: 0.9 }),
  ...productsSeed
    .filter((p) => p.isActive)
    .map((p) => url(`/produk/${p.slug}`, { priority: 0.7, lastmod: p.createdAt })),
  url('/program', { priority: 0.8 }),
  url('/kebun', { priority: 0.6 }),
  ...plotsSeed.map((plot) => url(`/kebun/${plot.code.toLowerCase()}`, { priority: 0.5 })),
  url('/artikel', { priority: 0.6 }),
  ...articles.map((a) => url(`/artikel/${a.slug}`, { priority: 0.5, lastmod: a.publishedAt })),
  url('/kontak', { priority: 0.8 }),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Dibuat otomatis oleh scripts/generate-sitemap.mjs (jalan lewat "prebuild") dari data asli
     di src/data/*.ts — jangan edit manual, perubahan akan tertimpa build berikutnya. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

writeFileSync(path.join(root, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml: ${urls.length} URL ditulis ke public/sitemap.xml`)
