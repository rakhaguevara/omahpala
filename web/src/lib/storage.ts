// Lapisan data sementara (Tahap 1 PRD.md §11 — "data masih statis").
// Disimpan di localStorage per-browser, bukan database sungguhan.
// Panel admin membaca/menulis lewat helper ini sehingga terasa fungsional untuk demo,
// tapi TIDAK persisten lintas perangkat. Menyambungkan ke backend nyata (mis. Supabase)
// adalah pekerjaan Tahap 3 PRD dan tinggal mengganti isi file ini + auth.ts.

type Listener = () => void

const listeners = new Map<string, Set<Listener>>()

// Cache in-memory per key — WAJIB untuk useSyncExternalStore (lihat useCollection.ts).
// getSnapshot() harus mengembalikan referensi yang SAMA selama data belum berubah,
// kalau tidak React mendeteksi "perubahan" di setiap render dan masuk infinite loop
// (layar jadi blank putih tanpa error yang jelas). JSON.parse ulang di setiap panggilan
// selalu menghasilkan array/object baru — itu bug yang tadinya ada di sini.
const cache = new Map<string, unknown[]>()

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn())
}

function subscribe(key: string, fn: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key)!.add(fn)
  return () => listeners.get(key)?.delete(fn)
}

function loadFromLocalStorage<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed
  const raw = window.localStorage.getItem(key)
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(seed))
    return seed
  }
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return seed
  }
}

function write<T>(key: string, items: T[]) {
  cache.set(key, items)
  window.localStorage.setItem(key, JSON.stringify(items))
  notify(key)
}

export function getCollection<T>(key: string, seed: T[]): T[] {
  if (!cache.has(key)) {
    cache.set(key, loadFromLocalStorage(key, seed))
  }
  return cache.get(key) as T[]
}

export function setCollection<T>(key: string, items: T[]) {
  write(key, items)
}

export function subscribeCollection(key: string, fn: Listener): () => void {
  return subscribe(key, fn)
}

export function resetCollection<T>(key: string, seed: T[]) {
  write(key, seed)
}
