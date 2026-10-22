import { beforeEach, describe, expect, it } from 'vitest'
import {
  SLUG, assignedLabels, asUser, createFixture, createUser, finishChallenge, rpc, rpcError, sql,
  type Fixture,
} from './helpers'

let f: Fixture

beforeEach(async () => {
  f = await createFixture()
})

/** Pemain baru yang sudah start; mengembalikan id + label QR aktif/tidak aktif (dibaca sebagai superuser). */
async function newPlayer() {
  const id = await createUser(f.db)
  await rpc(f.db, id, 'fmp_start_game', SLUG)
  const active = await assignedLabels(f.db, id)
  const inactive = [1, 2, 3, 4, 5].filter((l) => !active.includes(l))
  return { id, active, inactive }
}
const scan = (uid: string, label: number) => rpc(f.db, uid, 'fmp_scan_qr', SLUG, f.tokens[label])

describe('start-game & assignment', () => {
  it('semua pemain mendapat QR stempel yang sama: 1, 2, 3 (tidak diacak); 4 dan 5 bukan stempel', async () => {
    const a = await newPlayer()
    const b = await newPlayer()
    expect(a.active).toEqual([1, 2, 3])
    expect(b.active).toEqual([1, 2, 3])
    expect(a.inactive).toEqual([4, 5])
  })

  it('hanya 5 QR yang aktif; slot 6–10 dinonaktifkan', async () => {
    expect(await sql(f.db, `select label from public.game_qrs where status='active' order by label`))
      .toEqual([1, 2, 3, 4, 5].map((label) => ({ label })))
    expect(await sql(f.db, `select label from public.game_qrs where awards_stamp order by label`))
      .toEqual([1, 2, 3].map((label) => ({ label })))
    expect(Object.keys(f.tokens).map(Number).sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('tidak berubah saat start-game dipanggil ulang (refresh / login ulang / perangkat lain)', async () => {
    const p = await newPlayer()
    for (let i = 0; i < 5; i++) await rpc(f.db, p.id, 'fmp_start_game', SLUG)
    expect(await assignedLabels(f.db, p.id)).toEqual(p.active)
    expect(await sql(f.db, `select count(*)::int n from public.player_games where user_id=$1`, [p.id])).toEqual([{ n: 1 }])
  })

  it('tidak berubah setelah scan dan challenge', async () => {
    const p = await newPlayer()
    const r = await scan(p.id, p.inactive[0])
    await finishChallenge(f.db, p.id, r.progress.pending_challenge.id)
    await scan(p.id, p.active[0])
    expect(await assignedLabels(f.db, p.id)).toEqual(p.active)
  })

  it('menolak: belum login, email belum terverifikasi', async () => {
    expect(await rpcError(f.db, null, 'fmp_start_game', SLUG)).toMatch(/permission denied|authentication_required/)
    const unverified = await createUser(f.db, { verified: false })
    expect(await rpcError(f.db, unverified, 'fmp_start_game', SLUG)).toBe('email_not_verified')
  })

  it('menolak: event draft/ended/belum dimulai/sudah berakhir, dan event tak dikenal', async () => {
    const u = await createUser(f.db)
    expect(await rpcError(f.db, u, 'fmp_start_game', 'tidak-ada')).toBe('event_not_found')

    await sql(f.db, `update public.game_events set starts_at = now() + interval '1 day'`)
    expect(await rpcError(f.db, u, 'fmp_start_game', SLUG)).toBe('event_inactive')
    await sql(f.db, `update public.game_events set starts_at = now() - interval '2 days', ends_at = now() - interval '1 day'`)
    expect(await rpcError(f.db, u, 'fmp_start_game', SLUG)).toBe('event_inactive')
    await sql(f.db, `update public.game_events set starts_at = null, ends_at = null, status = 'draft'`)
    expect(await rpcError(f.db, u, 'fmp_start_game', SLUG)).toBe('event_not_found') // draft tidak terlihat publik
  })

  it('menolak jika QR aktif tidak tepat 5', async () => {
    await rpc(f.db, f.admin, 'fmp_admin_set_qr_status', SLUG, 5, 'disabled')
    const u = await createUser(f.db)
    expect(await rpcError(f.db, u, 'fmp_start_game', SLUG)).toBe('event_not_ready')
  })

  it('sebelum start, progress melaporkan started=false', async () => {
    const u = await createUser(f.db)
    const p = await rpc(f.db, u, 'fmp_get_progress', SLUG)
    expect(p.started).toBe(false)
  })
})

describe('scan-qr', () => {
  it('QR aktif memberi stamp tepat satu kali', async () => {
    const p = await newPlayer()
    const a = await scan(p.id, p.active[0])
    expect(a.result).toBe('stamp_awarded')
    expect(a.progress.stamp_count).toBe(1)
    const b = await scan(p.id, p.active[0])
    expect(b.result).toBe('already_collected')
    expect(b.progress.stamp_count).toBe(1)
    expect(await sql(f.db, `select count(*)::int n from public.player_stamps`)).toEqual([{ n: 1 }])
  })

  it('QR valid tapi tidak aktif: tanpa stamp, mulai challenge ke halaman yang ada', async () => {
    const p = await newPlayer()
    const r = await scan(p.id, p.inactive[0])
    expect(r.result).toBe('inactive_for_player')
    expect(r.progress.stamp_count).toBe(0)
    expect(r.progress.pending_challenge.destination_path).toMatch(/^\/(produk|program)/)
    expect(r.progress.pending_challenge.min_seconds).toBe(4)
  })

  it('selama challenge pending, scan berikutnya (aktif sekalipun) terkunci', async () => {
    const p = await newPlayer()
    await scan(p.id, p.inactive[0])
    const r = await scan(p.id, p.active[0])
    expect(r.result).toBe('challenge_required')
    expect(r.progress.stamp_count).toBe(0)
  })

  it('token invalid, terlalu pendek, panjang berlebihan, dan QR revoked ditolak', async () => {
    const p = await newPlayer()
    expect((await rpc(f.db, p.id, 'fmp_scan_qr', SLUG, 'x'.repeat(30))).result).toBe('invalid_qr')
    expect((await rpc(f.db, p.id, 'fmp_scan_qr', SLUG, '1')).result).toBe('invalid_qr')
    expect((await rpc(f.db, p.id, 'fmp_scan_qr', SLUG, 'a'.repeat(500))).result).toBe('invalid_qr')
    expect((await rpc(f.db, p.id, 'fmp_scan_qr', SLUG, null)).result).toBe('invalid_qr')
    await rpc(f.db, f.admin, 'fmp_admin_set_qr_status', SLUG, p.active[0], 'revoked')
    expect((await scan(p.id, p.active[0])).result).toBe('invalid_qr')
  })

  it('token lama tidak berlaku setelah rotasi', async () => {
    const p = await newPlayer()
    const old = f.tokens[p.active[0]]
    expect(await rpcError(f.db, f.admin, 'fmp_admin_rotate_tokens', SLUG)).toBe('confirmation_required')
    await rpc(f.db, f.admin, 'fmp_admin_rotate_tokens', SLUG, true)
    expect((await rpc(f.db, p.id, 'fmp_scan_qr', SLUG, old)).result).toBe('invalid_qr')
  })

  it('event berakhir / belum mulai menolak scan', async () => {
    const p = await newPlayer()
    await sql(f.db, `update public.game_events set ends_at = now() - interval '1 second', starts_at = now() - interval '1 day'`)
    expect((await scan(p.id, p.active[0])).result).toBe('event_inactive')
    await sql(f.db, `update public.game_events set starts_at = now() + interval '1 day', ends_at = null`)
    expect((await scan(p.id, p.active[0])).result).toBe('event_inactive')
    expect(await sql(f.db, `select count(*)::int n from public.player_stamps`)).toEqual([{ n: 0 }])
  })

  it('pemain yang belum start tidak bisa scan', async () => {
    const u = await createUser(f.db)
    expect(await rpcError(f.db, u, 'fmp_scan_qr', SLUG, f.tokens[1])).toBe('game_not_started')
  })

  it('rate limit per akun', async () => {
    const p = await newPlayer()
    await sql(f.db, `update public.game_events set config = jsonb_set(config, '{scan_rate_limit,max}', '3')`)
    for (let i = 0; i < 3; i++) await rpc(f.db, p.id, 'fmp_scan_qr', SLUG, 'x'.repeat(30))
    const r = await rpc(f.db, p.id, 'fmp_scan_qr', SLUG, 'x'.repeat(30))
    expect(r.result).toBe('rate_limited')
    expect((await scan(p.id, p.active[0])).result).toBe('rate_limited')
    expect(await sql(f.db, `select count(*)::int n from public.scan_attempts where result='rate_limited'`)).toEqual([{ n: 1 }])
  })

  it('QR 4 dan 5 menyertakan nomor QR di respons dan tidak pernah memberi stamp', async () => {
    const p = await newPlayer()
    const r = await scan(p.id, 4)
    expect(r.result).toBe('inactive_for_player')
    expect(r.qr_label).toBe(4)
    await finishChallenge(f.db, p.id, r.progress.pending_challenge.id)
    const r5 = await scan(p.id, 5)
    expect(r5.qr_label).toBe(5)
    expect(r5.progress.stamp_count).toBe(0)
  })

  it('stamp tidak mungkin dibuat untuk QR di luar assignment (constraint DB)', async () => {
    const p = await newPlayer()
    const [pg] = await sql<{ id: string }>(f.db, `select id from public.player_games where user_id=$1`, [p.id])
    const [qr] = await sql<{ id: string }>(f.db, `select id from public.game_qrs where label=$1`, [p.inactive[0]])
    await expect(
      sql(f.db, `insert into public.player_stamps (player_game_id, qr_id) values ($1, $2)`, [pg.id, qr.id]),
    ).rejects.toThrow(/foreign key|violates/)
  })

  it('pemain lama tanpa assignment tetap bisa mendapat stamp (assignment dibuat saat scan)', async () => {
    const p = await newPlayer()
    await sql(f.db, `delete from public.player_qr_assignments`)
    const r = await scan(p.id, 2)
    expect(r.result).toBe('stamp_awarded')
    expect(r.progress.collected).toEqual([2])
  })

  it('stamp lama pada QR yang tidak lagi memberi stempel tidak dihitung', async () => {
    const p = await newPlayer()
    const [pg] = await sql<{ id: string }>(f.db, `select id from public.player_games where user_id=$1`, [p.id])
    const [qr] = await sql<{ id: string }>(f.db, `select id from public.game_qrs where label=7`)
    await sql(f.db, `insert into public.player_qr_assignments (player_game_id, event_id, qr_id) select $1, event_id, id from public.game_qrs where id=$2`, [pg.id, qr.id])
    await sql(f.db, `insert into public.player_stamps (player_game_id, qr_id) values ($1, $2)`, [pg.id, qr.id])
    const progress = await rpc(f.db, p.id, 'fmp_get_progress', SLUG)
    expect(progress.stamp_count).toBe(0)
    expect(progress.collected).toEqual([])
    expect(progress.total_active).toBe(3)
  })

  it('pemain tidak bisa memakai progres pemain lain', async () => {
    const a = await newPlayer()
    const b = await newPlayer()
    await scan(a.id, a.active[0])
    const pb = await rpc(f.db, b.id, 'fmp_get_progress', SLUG)
    expect(pb.stamp_count).toBe(0)
  })
})

describe('scroll challenge', () => {
  async function pending(p: { id: string; inactive: number[] }) {
    const r = await scan(p.id, p.inactive[0])
    return r.progress.pending_challenge.id as string
  }

  it('tidak bisa selesai sebelum dimulai, atau sebelum 4 detik (jam server)', async () => {
    const p = await newPlayer()
    const id = await pending(p)
    expect((await rpc(f.db, p.id, 'fmp_complete_challenge', id, 9000, 900, 20)).reason).toBe('not_started')
    await rpc(f.db, p.id, 'fmp_begin_challenge', id)
    const early = await rpc(f.db, p.id, 'fmp_complete_challenge', id, 9000, 900, 20)
    expect(early.ok).toBe(false)
    expect(early.reason).toBe('too_early')
    expect(early.retry_after_ms).toBeGreaterThan(0)
  })

  it('timer saja tidak cukup: butuh scroll dan waktu terlihat', async () => {
    const p = await newPlayer()
    const id = await pending(p)
    await rpc(f.db, p.id, 'fmp_begin_challenge', id)
    await sql(f.db, `update public.scroll_challenges set last_begin_at = now() - interval '10 seconds'`)
    expect((await rpc(f.db, p.id, 'fmp_complete_challenge', id, 9000, 0, 0)).reason).toBe('insufficient_scroll')
    expect((await rpc(f.db, p.id, 'fmp_complete_challenge', id, 1000, 900, 20)).reason).toBe('insufficient_visible_time')
    expect((await rpc(f.db, p.id, 'fmp_complete_challenge', id, 9000, 900, 1)).reason).toBe('insufficient_scroll')
    expect((await rpc(f.db, p.id, 'fmp_complete_challenge', id, -5, -5, -5)).ok).toBe(false)
  })

  it('selesai membuka scan berikutnya; QR yang sama tetap tidak aktif; assignment tetap', async () => {
    const p = await newPlayer()
    const id = await pending(p)
    const done = await finishChallenge(f.db, p.id, id)
    expect(done.ok).toBe(true)
    expect(done.progress.pending_challenge).toBeNull()
    expect((await scan(p.id, p.inactive[0])).result).toBe('inactive_for_player')
    expect(await assignedLabels(f.db, p.id)).toEqual(p.active)
  })

  it('idempoten, dan tidak bisa dipakai ulang untuk membuka scan lain', async () => {
    const p = await newPlayer()
    const id = await pending(p)
    await finishChallenge(f.db, p.id, id)
    expect((await rpc(f.db, p.id, 'fmp_complete_challenge', id, 9000, 900, 20)).ok).toBe(true)
    // scan inaktif berikutnya membuat challenge BARU; id lama tidak membukanya
    const r2 = await scan(p.id, p.inactive[1])
    expect(r2.progress.pending_challenge.id).not.toBe(id)
    expect((await scan(p.id, p.active[0])).result).toBe('challenge_required')
  })

  it('milik pemain lain tidak bisa diakses', async () => {
    const a = await newPlayer()
    const b = await newPlayer()
    const id = await pending(a)
    expect(await rpcError(f.db, b.id, 'fmp_begin_challenge', id)).toBe('challenge_not_found')
    expect(await rpcError(f.db, b.id, 'fmp_complete_challenge', id, 9000, 900, 20)).toBe('challenge_not_found')
  })

  it('kedaluwarsa: tidak bisa diselesaikan, dan scan baru diizinkan', async () => {
    const p = await newPlayer()
    const id = await pending(p)
    await rpc(f.db, p.id, 'fmp_begin_challenge', id)
    await sql(f.db, `update public.scroll_challenges set expires_at = now() - interval '1 second', last_begin_at = now() - interval '1 hour'`)
    expect((await rpc(f.db, p.id, 'fmp_complete_challenge', id, 9000, 900, 20)).reason).toBe('expired')
    const next = await scan(p.id, p.active[0])
    expect(next.result).toBe('stamp_awarded')
    expect(await sql(f.db, `select status from public.scroll_challenges where id=$1`, [id])).toEqual([{ status: 'expired' }])
  })

  it('refresh/tutup tab tidak otomatis menyelesaikan: tetap pending sampai bukti baru', async () => {
    const p = await newPlayer()
    const id = await pending(p)
    await rpc(f.db, p.id, 'fmp_begin_challenge', id)
    expect((await rpc(f.db, p.id, 'fmp_get_progress', SLUG)).pending_challenge.id).toBe(id)
    await rpc(f.db, p.id, 'fmp_begin_challenge', id) // dimuat ulang → jam dimulai lagi
    expect((await rpc(f.db, p.id, 'fmp_complete_challenge', id, 9000, 900, 20)).reason).toBe('too_early')
  })
})

describe('ambang stamp 2/3 (total 3 stempel)', () => {
  it('menghitung dari database, bukan dari klien', async () => {
    const p = await newPlayer()
    let r = await scan(p.id, p.active[0])
    expect(r.progress).toMatchObject({ stamp_count: 1, sticker_unlocked: false, all_found: false })
    expect(r.progress.rewards.find((x: any) => x.type === 'small_gift').eligible).toBe(false)

    r = await scan(p.id, p.active[1])
    expect(r.progress.rewards.find((x: any) => x.type === 'small_gift').eligible).toBe(true)
    expect(r.progress.rewards.find((x: any) => x.type === 'sticker').eligible).toBe(false)
    expect(r.progress.sticker_unlocked).toBe(false)

    r = await scan(p.id, p.active[2])
    expect(r.progress).toMatchObject({ stamp_count: 3, total_active: 3, sticker_unlocked: true, all_found: true, game_status: 'completed' })
    // Tidak pernah lebih dari 3
    expect((await scan(p.id, p.active[2])).progress.stamp_count).toBe(3)
  })

  it('progres bertahan lintas sesi (dibaca ulang dari DB)', async () => {
    const p = await newPlayer()
    await scan(p.id, p.active[0])
    await scan(p.id, p.active[1])
    const again = await rpc(f.db, p.id, 'fmp_start_game', SLUG)
    expect(again.stamp_count).toBe(2)
    expect(again.collected).toEqual([...[p.active[0], p.active[1]]].sort((x, y) => x - y))
  })
})

describe('klaim & redeem hadiah', () => {
  async function playerWith(n: number) {
    const p = await newPlayer()
    for (let i = 0; i < n; i++) await scan(p.id, p.active[i])
    return p
  }
  const claim = (uid: string, type: string) => rpc(f.db, uid, 'fmp_create_reward_claim', SLUG, type)
  const code = (r: any, type: string) => r.rewards.find((x: any) => x.type === type).claim.code as string

  it('tidak eligible di bawah ambang; eligible di ambang', async () => {
    const p = await playerWith(1)
    expect(await rpcError(f.db, p.id, 'fmp_create_reward_claim', SLUG, 'small_gift')).toBe('not_eligible')
    await scan(p.id, p.active[1])
    const r = await claim(p.id, 'small_gift')
    expect(code(r, 'small_gift')).toMatch(/^[A-Z2-9]{8}$/)
  })

  it('tipe hadiah tak dikenal & klaim tanpa game ditolak', async () => {
    const p = await playerWith(2)
    expect(await rpcError(f.db, p.id, 'fmp_create_reward_claim', SLUG, 'mobil')).toBe('reward_not_available')
    const u = await createUser(f.db)
    expect(await rpcError(f.db, u, 'fmp_create_reward_claim', SLUG, 'small_gift')).toBe('game_not_started')
  })

  it('klaim ganda mengembalikan kode yang sama dan tidak memakai stok dua kali', async () => {
    const p = await playerWith(2)
    const a = await claim(p.id, 'small_gift')
    const b = await claim(p.id, 'small_gift')
    expect(code(b, 'small_gift')).toBe(code(a, 'small_gift'))
    expect(await sql(f.db, `select reserved_quantity r from public.reward_inventory where reward_type='small_gift'`)).toEqual([{ r: 1 }])
  })

  it('kebijakan default: satu hadiah fisik per pemain (rewards_combinable=false)', async () => {
    const p = await playerWith(3)
    expect((await rpc(f.db, p.id, 'fmp_get_progress', SLUG)).rewards_combinable).toBe(false)
    await claim(p.id, 'small_gift')
    expect(await rpcError(f.db, p.id, 'fmp_create_reward_claim', SLUG, 'sticker')).toBe('already_claimed_other_reward')
    await sql(f.db, `update public.game_events set config = jsonb_set(config, '{rewards_combinable}', 'true')`)
    expect(code(await claim(p.id, 'sticker'), 'sticker')).toMatch(/^[A-Z2-9]{8}$/)
  })

  it('stok: tanpa konfigurasi tidak bisa diklaim; stok habis ditolak', async () => {
    await sql(f.db, `delete from public.reward_inventory where reward_type='small_gift'`)
    const p1 = await playerWith(2)
    expect(await rpcError(f.db, p1.id, 'fmp_create_reward_claim', SLUG, 'small_gift')).toBe('reward_not_configured')
    await rpc(f.db, f.admin, 'fmp_admin_set_inventory', SLUG, 'small_gift', 1)
    await claim(p1.id, 'small_gift')
    const p2 = await playerWith(2)
    expect(await rpcError(f.db, p2.id, 'fmp_create_reward_claim', SLUG, 'small_gift')).toBe('out_of_stock')
  })

  it('redeem: hanya panitia, sekali saja, stok bergeser reserved→redeemed', async () => {
    const p = await playerWith(2)
    const c = code(await claim(p.id, 'small_gift'), 'small_gift')

    expect(await rpcError(f.db, p.id, 'fmp_redeem_reward', c)).toBe('forbidden') // pemain biasa
    expect(await rpcError(f.db, null, 'fmp_redeem_reward', c)).toMatch(/permission denied|authentication_required/)

    const preview = await rpc(f.db, f.staff, 'fmp_lookup_claim', c.toLowerCase().replace(/^(.{4})/, '$1-'))
    expect(preview).toMatchObject({ found: true, status: 'claimed', reward_type: 'small_gift' })

    const ok = await rpc(f.db, f.staff, 'fmp_redeem_reward', c)
    expect(ok).toMatchObject({ ok: true, reward_type: 'small_gift' })
    const again = await rpc(f.db, f.staff, 'fmp_redeem_reward', c)
    expect(again).toMatchObject({ ok: false, reason: 'already_redeemed' })
    expect(await rpc(f.db, f.staff, 'fmp_redeem_reward', 'ZZZZZZZZ')).toMatchObject({ ok: false, reason: 'not_found' })

    expect(await sql(f.db, `select reserved_quantity r, redeemed_quantity d from public.reward_inventory where reward_type='small_gift'`))
      .toEqual([{ r: 0, d: 1 }])
    expect(await sql(f.db, `select count(*)::int n from public.game_audit_log where action='reward_redeemed'`)).toEqual([{ n: 1 }])
    // Pemain melihat statusnya, tapi tidak bisa mengubahnya
    expect((await rpc(f.db, p.id, 'fmp_get_progress', SLUG)).rewards[0].claim.status).toBe('redeemed')
  })

  it('cancel (admin) melepas stok dan kode tidak bisa ditukar; staff biasa tidak boleh', async () => {
    const p = await playerWith(2)
    const c = code(await claim(p.id, 'small_gift'), 'small_gift')
    expect(await rpcError(f.db, f.staff, 'fmp_admin_cancel_claim', c)).toBe('forbidden')
    expect((await rpc(f.db, f.admin, 'fmp_admin_cancel_claim', c)).ok).toBe(true)
    expect(await rpc(f.db, f.staff, 'fmp_redeem_reward', c)).toMatchObject({ ok: false, reason: 'cancelled' })
    expect(await sql(f.db, `select reserved_quantity r from public.reward_inventory where reward_type='small_gift'`)).toEqual([{ r: 0 }])
    expect(await rpcError(f.db, p.id, 'fmp_create_reward_claim', SLUG, 'small_gift')).toBe('claim_cancelled')
  })
})

describe('otorisasi admin', () => {
  it('pengguna biasa & staff (non-admin) tidak bisa mengubah QR/event/stok atau memutar token', async () => {
    const u = await createUser(f.db)
    for (const who of [u, f.staff]) {
      expect(await rpcError(f.db, who, 'fmp_admin_set_qr_status', SLUG, 1, 'revoked')).toBe('forbidden')
      expect(await rpcError(f.db, who, 'fmp_admin_set_event_status', SLUG, 'ended')).toBe('forbidden')
      expect(await rpcError(f.db, who, 'fmp_admin_set_inventory', SLUG, 'small_gift', 5)).toBe('forbidden')
      expect(await rpcError(f.db, who, 'fmp_admin_rotate_tokens', SLUG, true)).toBe('forbidden')
      expect(await rpcError(f.db, who, 'fmp_admin_list_qrs', SLUG)).toBe('forbidden')
    }
    expect(await rpcError(f.db, u, 'fmp_admin_stats', SLUG)).toBe('forbidden')
    expect(await rpcError(f.db, u, 'fmp_lookup_claim', 'ABCDEFGH')).toBe('forbidden')
  })

  it('staff boleh melihat statistik; admin bisa mengatur; perubahan tercatat di audit log', async () => {
    const s = await rpc(f.db, f.staff, 'fmp_admin_stats', SLUG)
    expect(s.active_qrs).toBe(5)
    expect(await rpc(f.db, f.staff, 'fmp_staff_role')).toBe('staff')
    expect(await rpc(f.db, f.admin, 'fmp_staff_role')).toBe('admin')
    expect(await rpc(f.db, await createUser(f.db), 'fmp_staff_role')).toBeNull()
    expect(await rpc(f.db, f.admin, 'fmp_admin_set_destination', SLUG, 1, '/program')).toEqual({ ok: true })
    expect(await rpcError(f.db, f.admin, 'fmp_admin_set_destination', SLUG, 1, 'https://evil.example')).toBe('invalid_input')
    expect(await rpcError(f.db, f.admin, 'fmp_admin_set_inventory', SLUG, 'small_gift', -1)).toBe('invalid_input')
    expect(await rpcError(f.db, f.admin, 'fmp_admin_set_inventory', SLUG, 'nonsense', 5)).toBe('invalid_input')
    const log = await sql<{ action: string }>(f.db, `select action from public.game_audit_log order by id`)
    expect(log.map((l) => l.action)).toEqual(expect.arrayContaining(['qr_tokens_rotated', 'inventory_set', 'event_status_changed', 'qr_destination_changed']))
  })

  it('event tidak bisa diaktifkan jika QR belum lengkap', async () => {
    await rpc(f.db, f.admin, 'fmp_admin_set_event_status', SLUG, 'draft')
    await rpc(f.db, f.admin, 'fmp_admin_set_qr_status', SLUG, 3, 'disabled')
    expect(await rpcError(f.db, f.admin, 'fmp_admin_set_event_status', SLUG, 'active')).toBe('event_not_ready')
  })

  it('daftar QR admin tidak memuat token / hash', async () => {
    const list = await rpc(f.db, f.admin, 'fmp_admin_list_qrs', SLUG)
    expect(JSON.stringify(list)).not.toMatch(/token|hash/)
    expect(list).toHaveLength(10)
    expect(list.filter((q: any) => q.awards_stamp).map((q: any) => q.label)).toEqual([1, 2, 3])
    expect(list.filter((q: any) => q.status === 'active')).toHaveLength(5)
  })

  it('rotasi token melewati slot nonaktif (6–10) dan tidak mengaktifkannya kembali', async () => {
    const rotated = await rpc(f.db, f.admin, 'fmp_admin_rotate_tokens', SLUG, true)
    expect(rotated.map((q: any) => q.label)).toEqual([1, 2, 3, 4, 5])
    expect(await sql(f.db, `select count(*)::int n from public.game_qrs where status='active'`)).toEqual([{ n: 5 }])
  })

  it('cek QR (panitia): menunjukkan nomor & jenis tanpa efek samping; pemain biasa ditolak', async () => {
    const u = await createUser(f.db)
    expect(await rpcError(f.db, u, 'fmp_admin_identify_qr', SLUG, f.tokens[1])).toBe('forbidden')
    expect(await rpcError(f.db, null, 'fmp_admin_identify_qr', SLUG, f.tokens[1])).toMatch(/permission denied|authentication_required/)
    for (const who of [f.staff, f.admin]) {
      expect(await rpc(f.db, who, 'fmp_admin_identify_qr', SLUG, f.tokens[2])).toMatchObject({ found: true, label: 2, awards_stamp: true, status: 'active' })
      expect(await rpc(f.db, who, 'fmp_admin_identify_qr', SLUG, f.tokens[5])).toMatchObject({ found: true, label: 5, awards_stamp: false })
    }
    expect(await rpc(f.db, f.staff, 'fmp_admin_identify_qr', SLUG, 'x'.repeat(30))).toEqual({ found: false })
    expect(await rpc(f.db, f.staff, 'fmp_admin_identify_qr', SLUG, 'x')).toEqual({ found: false })
    expect(await sql(f.db, `select count(*)::int n from public.scan_attempts`)).toEqual([{ n: 0 }])
  })
})

describe('RLS & hak akses langsung', () => {
  it('pemain hanya melihat baris miliknya', async () => {
    const a = await newPlayer()
    const b = await newPlayer()
    await scan(a.id, a.active[0])
    await scan(b.id, b.active[0])
    await scan(b.id, b.active[1])
    await rpc(f.db, b.id, 'fmp_create_reward_claim', SLUG, 'small_gift')

    const seen = await asUser(f.db, a.id, async () => ({
      games: (await f.db.query(`select user_id from public.player_games`)).rows,
      stamps: (await f.db.query(`select id from public.player_stamps`)).rows,
      claims: (await f.db.query(`select id from public.reward_claims`)).rows,
    }))
    expect(seen.games).toEqual([{ user_id: a.id }])
    expect(seen.stamps).toHaveLength(1)
    expect(seen.claims).toHaveLength(0)
  })

  it('tabel sensitif tidak bisa dibaca klien sama sekali', async () => {
    const a = await newPlayer()
    for (const t of ['game_qrs', 'player_qr_assignments', 'scan_attempts', 'scroll_challenges', 'reward_inventory', 'game_staff', 'game_audit_log']) {
      await expect(asUser(f.db, a.id, () => f.db.query(`select * from public.${t}`)), t).rejects.toThrow(/permission denied/)
    }
  })

  it('klien tidak bisa menulis langsung: stamp, klaim, status redeem, stok, event', async () => {
    const a = await newPlayer()
    await scan(a.id, a.active[0])
    await scan(a.id, a.active[1])
    await rpc(f.db, a.id, 'fmp_create_reward_claim', SLUG, 'small_gift')
    const attempts = [
      `insert into public.player_stamps (player_game_id, qr_id) select player_game_id, qr_id from public.player_qr_assignments limit 1`,
      `update public.reward_claims set status = 'redeemed'`,
      `delete from public.player_stamps`,
      `update public.player_games set status = 'completed'`,
      `update public.game_events set status = 'ended'`,
      `update public.reward_inventory set total_quantity = 99999`,
      `insert into public.game_staff (user_id, role) values ('${a.id}', 'admin')`,
    ]
    for (const q of attempts) {
      await expect(asUser(f.db, a.id, () => f.db.query(q)), q).rejects.toThrow(/permission denied/)
    }
    expect(await sql(f.db, `select status from public.reward_claims`)).toEqual([{ status: 'claimed' }])
  })

  it('anon tidak bisa memanggil RPC apa pun, dan helper internal tidak terekspos', async () => {
    const calls: [string, unknown[]][] = [
      ['fmp_start_game', [SLUG]],
      ['fmp_get_progress', [SLUG]],
      ['fmp_scan_qr', [SLUG, 'x'.repeat(30)]],
      ['fmp_redeem_reward', ['ABCDEFGH']],
      ['fmp_admin_stats', [SLUG]],
    ]
    for (const [fn, args] of calls) {
      expect(await rpcError(f.db, null, fn, ...args), fn).toMatch(/permission denied/)
    }
    const u = await createUser(f.db)
    for (const fn of ['fmp_build_progress', 'fmp_assert_user', 'fmp_audit', 'fmp_gen_claim_code']) {
      expect(await rpcError(f.db, u, fn)).toMatch(/permission denied|does not exist/)
    }
  })

  it('anon hanya melihat event aktif/selesai (bukan draft), tanpa QR', async () => {
    const rows = await asUser(f.db, null, async () => (await f.db.query(`select slug from public.game_events`)).rows)
    expect(rows).toEqual([{ slug: SLUG }])
    await sql(f.db, `update public.game_events set status='draft'`)
    expect(await asUser(f.db, null, async () => (await f.db.query(`select slug from public.game_events`)).rows)).toEqual([])
  })
})

describe('simulasi 100 akun sintetis (berurutan)', () => {
  it('integritas data: 1 game/akun, 3 assignment berbeda, tanpa stamp ganda, stok tidak terlampaui', async () => {
    await sql(f.db, `delete from public.reward_inventory`)
    await rpc(f.db, f.admin, 'fmp_admin_set_inventory', SLUG, 'small_gift', 30)
    await sql(f.db, `update public.game_events set config = jsonb_set(config, '{scan_rate_limit,max}', '1000')`)

    const players: { id: string; active: number[]; inactive: number[] }[] = []
    for (let i = 0; i < 100; i++) players.push(await newPlayer())

    let granted = 0
    let outOfStock = 0
    for (const p of players) {
      // scan semua 5 QR; QR tidak aktif memicu challenge yang harus diselesaikan dulu
      for (const label of [...p.inactive.slice(0, 2), ...p.active, ...p.active.slice(0, 2)]) {
        const r = await scan(p.id, label)
        if (r.result === 'inactive_for_player') await finishChallenge(f.db, p.id, r.progress.pending_challenge.id)
        expect(['stamp_awarded', 'already_collected', 'inactive_for_player']).toContain(r.result)
      }
      const err = await rpcError(f.db, p.id, 'fmp_create_reward_claim', SLUG, 'small_gift')
      if (err === 'NO_ERROR') granted++
      else if (err === 'out_of_stock') outOfStock++
      else throw new Error(`unexpected: ${err}`)
    }

    expect(await sql(f.db, `select count(*)::int n from public.player_games`)).toEqual([{ n: 100 }])
    expect(await sql(f.db, `select count(*)::int n from (select player_game_id from public.player_qr_assignments group by 1 having count(distinct qr_id) <> 3) x`)).toEqual([{ n: 0 }])
    expect(await sql(f.db, `select count(*)::int n from (select player_game_id, qr_id from public.player_stamps group by 1,2 having count(*) > 1) x`)).toEqual([{ n: 0 }])
    expect(await sql(f.db, `select max(c)::int m from (select count(*) c from public.player_stamps group by player_game_id) x`)).toEqual([{ m: 3 }])
    expect(await sql(f.db, `select count(*)::int n from public.player_games where status='completed'`)).toEqual([{ n: 100 }])
    expect(granted).toBe(30)
    expect(outOfStock).toBe(70)
    expect(await sql(f.db, `select reserved_quantity r, total_quantity t from public.reward_inventory`)).toEqual([{ r: 30, t: 30 }])
    expect(await sql(f.db, `select count(distinct claim_code)::int n from public.reward_claims`)).toEqual([{ n: 30 }])
    // Tak ada challenge pending yang tersisa & tak ada stamp dari QR tidak aktif
    expect(await sql(f.db, `select count(*)::int n from public.scroll_challenges where status='pending'`)).toEqual([{ n: 0 }])
  }, 180_000)
})
