import { useCallback, useSyncExternalStore } from 'react'
import { getCollection, setCollection, subscribeCollection } from './storage'

interface WithId {
  id: string
}

/**
 * Hook reaktif di atas lapisan localStorage (lib/storage.ts).
 * Dipakai oleh halaman publik (baca saja) dan panel admin (CRUD penuh).
 */
export function useCollection<T extends WithId>(key: string, seed: T[]) {
  const items = useSyncExternalStore(
    (cb) => subscribeCollection(key, cb),
    () => getCollection(key, seed),
    () => seed,
  )

  const add = useCallback(
    (item: T) => {
      setCollection(key, [item, ...getCollection<T>(key, seed)])
    },
    [key, seed],
  )

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      const next = getCollection<T>(key, seed).map((it) =>
        it.id === id ? { ...it, ...patch } : it,
      )
      setCollection(key, next)
    },
    [key, seed],
  )

  const remove = useCallback(
    (id: string) => {
      const next = getCollection<T>(key, seed).filter((it) => it.id !== id)
      setCollection(key, next)
    },
    [key, seed],
  )

  return { items, add, update, remove }
}
