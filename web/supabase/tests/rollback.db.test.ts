import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, it } from 'vitest'
import { createDb, sql } from './helpers'

it('skrip rollback menghapus semua objek Find My Polo, dan migration bisa diterapkan lagi', async () => {
  const db = await createDb()
  const down = readFileSync(path.resolve(import.meta.dirname, '../rollback/find_my_polo_down.sql'), 'utf8')
  await db.exec(down)

  const fns = await sql(db, `select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname like 'fmp\\_%'`)
  expect(fns).toEqual([])
  const tables = await sql(db, `select tablename from pg_tables where schemaname='public'`)
  expect(tables).toEqual([])
})
