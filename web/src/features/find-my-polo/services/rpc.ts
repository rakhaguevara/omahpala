import { GameError, KNOWN_ERROR_CODES, requireClient, type GameErrorCode } from './supabase'

const KNOWN = new Set<string>(KNOWN_ERROR_CODES)

/**
 * Panggil fungsi fmp_* di Postgres. Pesan error dari server hanya dikenali bila persis salah satu
 * kode yang kita raise; apa pun selain itu (SQL error, permission denied, dst.) menjadi 'unknown'
 * supaya detail internal tidak pernah sampai ke pengguna.
 */
export async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const client = requireClient()
  let result
  try {
    result = await client.rpc(fn, args)
  } catch {
    throw new GameError('network')
  }
  if (result.error) {
    const msg = result.error.message
    if (KNOWN.has(msg)) throw new GameError(msg as GameErrorCode)
    // fetch gagal → supabase-js mengembalikan error generik tanpa kode HTTP
    if (!result.status || result.status === 0) throw new GameError('network')
    throw new GameError('unknown')
  }
  return result.data as T
}
