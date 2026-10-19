import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Hanya URL proyek dan anon key (publik by design). JANGAN pernah menaruh service-role key di sini
// atau di variabel VITE_* — semua yang berawalan VITE_ ikut terkirim ke browser.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** false bila env belum diisi: UI menampilkan "belum tersedia" alih-alih error. */
export const isGameConfigured = Boolean(url && anonKey)

/**
 * Hasil tautan verifikasi email yang baru dibuka. WAJIB dibaca sebelum createClient: supabase-js
 * langsung memproses lalu menghapus token dari URL. null = halaman dibuka biasa.
 */
export type AuthRedirectResult = 'verified' | 'expired' | null
function readAuthRedirect(): AuthRedirectResult {
  if (typeof window === 'undefined') return null
  const raw = `${window.location.hash}&${window.location.search}`
  if (/error_code=otp_expired|error=access_denied|error_description=/.test(raw)) return 'expired'
  if (/(^|[#&?])(type=(signup|email|magiclink)|access_token=|code=)/.test(raw)) return 'verified'
  return null
}
export const initialAuthRedirect: AuthRedirectResult = readAuthRedirect()

export const supabase: SupabaseClient | null = isGameConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export function requireClient(): SupabaseClient {
  if (!supabase) throw new GameError('not_configured')
  return supabase
}

// Dideklarasikan di sini (bukan errors.ts) agar requireClient tidak membuat impor melingkar.
export const KNOWN_ERROR_CODES = [
  'not_configured',
  'network',
  'authentication_required',
  'email_not_verified',
  'event_not_found',
  'event_inactive',
  'event_not_ready',
  'game_not_started',
  'challenge_not_found',
  'reward_not_available',
  'not_eligible',
  'already_claimed_other_reward',
  'reward_not_configured',
  'out_of_stock',
  'claim_cancelled',
  'forbidden',
  'invalid_input',
  'confirmation_required',
  'qr_not_found',
  'unknown',
] as const

export type GameErrorCode = (typeof KNOWN_ERROR_CODES)[number]

export class GameError extends Error {
  readonly code: GameErrorCode
  constructor(code: GameErrorCode) {
    super(code)
    this.name = 'GameError'
    this.code = code
  }
}
