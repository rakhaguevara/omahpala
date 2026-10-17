import { EVENT_SLUG } from '../config'
import type {
  BeginChallengeResponse, CompleteChallengeResponse, EventInfo, Progress, ScanResponse, StartedProgress,
} from '../types'
import { rpc } from './rpc'
import { supabase } from './supabase'

export const getProgress = () => rpc<Progress>('fmp_get_progress', { p_event_slug: EVENT_SLUG })

export const startGame = () => rpc<StartedProgress>('fmp_start_game', { p_event_slug: EVENT_SLUG })

export const scanQr = (token: string) =>
  rpc<ScanResponse>('fmp_scan_qr', { p_event_slug: EVENT_SLUG, p_token: token })

export const beginChallenge = (challengeId: string) =>
  rpc<BeginChallengeResponse>('fmp_begin_challenge', { p_challenge_id: challengeId })

export const completeChallenge = (
  challengeId: string,
  evidence: { visibleMs: number; scrollPx: number; scrollEvents: number },
) =>
  rpc<CompleteChallengeResponse>('fmp_complete_challenge', {
    p_challenge_id: challengeId,
    p_visible_ms: Math.round(evidence.visibleMs),
    p_scroll_px: Math.round(evidence.scrollPx),
    p_scroll_events: Math.round(evidence.scrollEvents),
  })

export const createRewardClaim = (rewardType: string) =>
  rpc<StartedProgress>('fmp_create_reward_claim', { p_event_slug: EVENT_SLUG, p_reward_type: rewardType })

/**
 * Info event untuk pengunjung yang belum login. Dibaca langsung dari tabel (RLS hanya membuka
 * event berstatus active/ended); draft terlihat sebagai "tidak ada".
 */
export async function getPublicEvent(): Promise<Pick<EventInfo, 'name' | 'status' | 'starts_at' | 'ends_at'> | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('game_events')
    .select('name,status,starts_at,ends_at')
    .eq('slug', EVENT_SLUG)
    .maybeSingle()
  if (error) return null
  return data
}
