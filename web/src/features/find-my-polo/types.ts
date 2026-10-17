// Bentuk respons RPC (lihat supabase/migrations/*_find_my_polo.sql). Semua nilai berasal dari server.

export interface EventInfo {
  slug: string
  name: string
  status: 'draft' | 'active' | 'ended' | 'archived'
  is_open: boolean
  starts_at: string | null
  ends_at: string | null
}

export interface RewardClaim {
  status: 'claimed' | 'redeemed' | 'cancelled'
  /** null bila klaim dibatalkan */
  code: string | null
}

export interface RewardState {
  type: string
  min_stamps: number
  eligible: boolean
  stock_configured: boolean
  available: boolean
  claim: RewardClaim | null
}

export interface PendingChallenge {
  id: string
  destination_path: string
  expires_at: string
  min_seconds: number
  min_scroll_px: number
  min_scroll_events: number
}

export interface NotStartedProgress {
  started: false
  event: EventInfo
}

export interface StartedProgress {
  started: true
  event: EventInfo
  game_status: 'active' | 'completed' | 'suspended'
  stamp_count: number
  total_active: number
  /** Nomor QR (1..10) yang sudah dikumpulkan. Assignment lengkap TIDAK dikirim ke klien. */
  collected: number[]
  all_found: boolean
  sticker_unlock_at: number
  /** false = satu akun hanya boleh mengklaim satu hadiah fisik (keputusan event, bukan klien). */
  rewards_combinable: boolean
  sticker_unlocked: boolean
  rewards: RewardState[]
  pending_challenge: PendingChallenge | null
}

export type Progress = NotStartedProgress | StartedProgress

export type ScanResultCode =
  | 'stamp_awarded'
  | 'already_collected'
  | 'inactive_for_player'
  | 'invalid_qr'
  | 'event_inactive'
  | 'rate_limited'
  | 'challenge_required'

export interface ScanResponse {
  result: ScanResultCode
  qr_label?: number
  progress: StartedProgress
}

export type BeginChallengeResponse = { ok: boolean; status: 'pending' | 'completed' | 'expired' }

export type CompleteChallengeResponse =
  | { ok: true; progress: StartedProgress }
  | {
      ok: false
      reason: 'expired' | 'not_started' | 'too_early' | 'insufficient_visible_time' | 'insufficient_scroll'
      retry_after_ms?: number
    }

export type ClaimLookup =
  | { found: false }
  | { found: true; status: RewardClaim['status']; reward_type: string; event_name: string; created_at: string; redeemed_at: string | null }

export type RedeemResponse =
  | { ok: true; reward_type: string }
  | { ok: false; reason: 'not_found' | 'already_redeemed' | 'cancelled'; redeemed_at?: string | null }

export interface AdminStats {
  event: { slug: string; name: string; status: EventInfo['status']; starts_at: string | null; ends_at: string | null }
  players_started: number
  players_completed: number
  total_stamps: number
  by_stamp_count: Record<string, number>
  claims: Partial<Record<RewardClaim['status'], number>>
  inventory: { type: string; total: number; reserved: number; redeemed: number }[]
  scans_24h: Partial<Record<ScanResultCode, number>>
  active_qrs: number
}

export interface AdminQr {
  label: number
  status: 'active' | 'disabled' | 'revoked'
  destination_path: string
}

export interface RotatedToken {
  label: number
  token: string
  destination_path: string
}

export type StaffRole = 'admin' | 'staff'
