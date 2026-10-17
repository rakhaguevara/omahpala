// Harness tes: menjalankan migration ASLI di PGlite (Postgres WASM) dengan stub minimal skema `auth`
// dan peran anon/authenticated milik Supabase, supaya RLS dan GRANT ikut teruji.
//
// Batasan: PGlite satu koneksi, jadi tes di sini berurutan. Perilaku konkurensi (ON CONFLICT,
// FOR UPDATE, unique index) tidak diuji dengan eksekusi paralel sungguhan — lihat supabase/README.md.

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '../../prisma/migrations')

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  create schema auth;
  grant usage on schema auth to anon, authenticated;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    email_confirmed_at timestamptz
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant execute on function auth.uid() to anon, authenticated;
`

export type Json = Record<string, any>

export async function createDb(): Promise<PGlite> {
  const db = await PGlite.create({ extensions: { pgcrypto } })
  await db.exec(SUPABASE_STUB)
  const dirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
  for (const d of dirs) {
    await db.exec(readFileSync(path.join(MIGRATIONS_DIR, d, 'migration.sql'), 'utf8'))
  }
  return db
}

export async function createUser(db: PGlite, opts: { verified?: boolean } = {}): Promise<string> {
  const r = await db.query<{ id: string }>(
    `insert into auth.users (email, email_confirmed_at) values ($1, $2) returning id`,
    [`u${Math.random().toString(36).slice(2)}@test.local`, opts.verified === false ? null : new Date().toISOString()],
  )
  return r.rows[0].id
}

/** Jalankan fn sebagai peran `authenticated` dengan JWT sub=userId (atau `anon` bila null). */
export async function asUser<T>(db: PGlite, userId: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(userId ? 'set role authenticated' : 'set role anon')
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? ''])
  try {
    return await fn()
  } finally {
    await db.exec('reset role')
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`)
  }
}

/** Panggil RPC publik sebagai pengguna; kembalikan jsonb atau lempar Error dengan kode pesan Postgres. */
export function rpc(db: PGlite, userId: string | null, fn: string, ...args: unknown[]): Promise<Json> {
  const placeholders = args.map((_, i) => `$${i + 1}`).join(', ')
  return asUser(db, userId, async () => {
    const r = await db.query<{ r: Json }>(`select public.${fn}(${placeholders}) as r`, args)
    return r.rows[0].r
  })
}

export async function rpcError(db: PGlite, userId: string | null, fn: string, ...args: unknown[]): Promise<string> {
  try {
    await rpc(db, userId, fn, ...args)
  } catch (e) {
    return (e as Error).message
  }
  return 'NO_ERROR'
}

export async function sql<T extends Json = Json>(db: PGlite, text: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query<T>(text, params)).rows
}

export const SLUG = 'find-my-polo'

export interface Fixture {
  db: PGlite
  admin: string
  staff: string
  /** label QR (1..10) -> token plaintext (hanya ada di test; di produksi tampil sekali) */
  tokens: Record<number, string>
}

/** Event aktif, 10 QR bertoken, stok hadiah, plus satu admin & satu staff. */
export async function createFixture(opts: { stock?: { small_gift?: number; sticker?: number } } = {}): Promise<Fixture> {
  const db = await createDb()
  const admin = await createUser(db)
  const staff = await createUser(db)
  await sql(db, `insert into public.game_staff (user_id, role) values ($1, 'admin'), ($2, 'staff')`, [admin, staff])

  const rotated = (await rpc(db, admin, 'fmp_admin_rotate_tokens', SLUG)) as unknown as { label: number; token: string }[]
  const tokens: Record<number, string> = {}
  for (const t of rotated) tokens[t.label] = t.token

  const stock = { small_gift: 1000, sticker: 1000, ...opts.stock }
  await rpc(db, admin, 'fmp_admin_set_inventory', SLUG, 'small_gift', stock.small_gift)
  await rpc(db, admin, 'fmp_admin_set_inventory', SLUG, 'sticker', stock.sticker)
  await rpc(db, admin, 'fmp_admin_set_event_status', SLUG, 'active')
  return { db, admin, staff, tokens }
}

/** Label QR yang aktif untuk pemain (dibaca sebagai superuser — klien tidak bisa melihat ini). */
export async function assignedLabels(db: PGlite, userId: string): Promise<number[]> {
  const rows = await sql<{ label: number }>(
    db,
    `select q.label from public.player_qr_assignments a
       join public.player_games g on g.id = a.player_game_id
       join public.game_qrs q on q.id = a.qr_id
      where g.user_id = $1 order by q.label`,
    [userId],
  )
  return rows.map((r) => r.label)
}

/** Selesaikan challenge pending pemain seolah 5 detik sudah lewat (jam server dimundurkan di data). */
export async function finishChallenge(db: PGlite, userId: string, challengeId: string): Promise<Json> {
  await rpc(db, userId, 'fmp_begin_challenge', challengeId)
  await sql(db, `update public.scroll_challenges set last_begin_at = now() - interval '5 seconds' where id = $1`, [challengeId])
  return rpc(db, userId, 'fmp_complete_challenge', challengeId, 4500, 600, 12)
}
