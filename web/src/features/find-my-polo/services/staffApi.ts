import { EVENT_SLUG } from '../config'
import type { AdminQr, AdminStats, ClaimLookup, EventInfo, QrIdentity, RedeemResponse, RotatedToken, StaffRole } from '../types'
import { rpc } from './rpc'

// Semua otorisasi diputuskan di database (game_staff). UI hanya menyembunyikan tombol.
export const getStaffRole = () => rpc<StaffRole | null>('fmp_staff_role')
export const lookupClaim = (code: string) => rpc<ClaimLookup>('fmp_lookup_claim', { p_code: code })
export const redeemReward = (code: string) => rpc<RedeemResponse>('fmp_redeem_reward', { p_code: code })
export const cancelClaim = (code: string) => rpc<{ ok: boolean }>('fmp_admin_cancel_claim', { p_code: code })
export const getStats = () => rpc<AdminStats>('fmp_admin_stats', { p_event_slug: EVENT_SLUG })
export const listQrs = () => rpc<AdminQr[]>('fmp_admin_list_qrs', { p_event_slug: EVENT_SLUG })
export const setEventStatus = (status: EventInfo['status']) =>
  rpc<{ ok: boolean }>('fmp_admin_set_event_status', { p_event_slug: EVENT_SLUG, p_status: status })
export const setQrStatus = (label: number, status: AdminQr['status']) =>
  rpc<{ ok: boolean }>('fmp_admin_set_qr_status', { p_event_slug: EVENT_SLUG, p_label: label, p_status: status })
export const setInventory = (rewardType: string, total: number) =>
  rpc<{ ok: boolean }>('fmp_admin_set_inventory', { p_event_slug: EVENT_SLUG, p_reward_type: rewardType, p_total: total })
export const rotateTokens = (confirmActive: boolean) =>
  rpc<RotatedToken[]>('fmp_admin_rotate_tokens', { p_event_slug: EVENT_SLUG, p_confirm_active: confirmActive })
export const identifyQr = (token: string) =>
  rpc<QrIdentity>('fmp_admin_identify_qr', { p_event_slug: EVENT_SLUG, p_token: token })
