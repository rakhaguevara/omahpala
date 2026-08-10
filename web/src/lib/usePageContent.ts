import { useCollection } from './useCollection'
import { useLocale } from './useLocale'
import { pageContentSeed } from '@/data/pageContent'
import type { PageContentEntry } from '@/types'

// PageContentEntry pakai `key` sebagai id unik untuk useCollection.
type Entry = PageContentEntry & { id: string }
const seedWithId: Entry[] = pageContentSeed.map((e) => ({ ...e, id: e.key }))

/** Baca satu entri konten yang bisa diubah admin (PRD A-07), sesuai bahasa aktif. */
export function usePageContent(key: string): string {
  const { items } = useCollection<Entry>('omahpala_page_content', seedWithId)
  const { locale } = useLocale()
  const entry = items.find((e) => e.key === key)
  if (!entry) return ''
  return locale === 'id' ? entry.valueId : entry.valueEn
}

/** Akses seluruh koleksi (dipakai panel admin untuk mengedit). */
export function usePageContentCollection() {
  return useCollection<Entry>('omahpala_page_content', seedWithId)
}
