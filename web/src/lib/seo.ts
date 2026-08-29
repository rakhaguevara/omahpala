export const SITE_URL = 'https://omahpala.site'

/** BreadcrumbList schema.org — dipakai di halaman detail (produk/artikel/lahan) supaya Google
 * berpeluang menampilkan breadcrumb (bukan URL mentah) di hasil pencarian. `path` relatif
 * (mis. "/produk/slug"), digabung dengan SITE_URL di sini. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
