// Membuat 5 QR fisik Find My Polo (QR 1–3 stempel, QR 4–5 bukan): token acak, gambar PNG, lembar cetak, dan SQL berisi HASH token.
//
//   node scripts/generate-qr-codes.mjs [--base https://omahpala.com] [--force]
//
// Keluaran di web/qr-codes/ (di-gitignore — gambar QR memuat token asli, perlakukan seperti kunci):
//   qr-01.png … qr-05.png        gambar untuk dicetak
//   sheet.html                   lembar cetak 5 QR berlabel
//   apply-token-hashes.sql       hanya hash SHA-256; jalankan SEKALI setelah migration:
//                                npm run db:sql -- qr-codes/apply-token-hashes.sql
//
// Token = 18 byte acak (base64url, 24 karakter), cara yang sama dengan fmp_admin_rotate_tokens.
// Menjalankan ulang MENGGANTI semua token → QR yang sudah dicetak tak berlaku; karena itu perlu --force.

import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import QRCode from 'qrcode'

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback)

const BASE = value('--base', 'https://omahpala.com').replace(/\/+$/, '')
const EVENT_SLUG = 'find-my-polo'
const COUNT = 5
const OUT = path.resolve(import.meta.dirname, '../qr-codes')

if (existsSync(path.join(OUT, 'apply-token-hashes.sql')) && !flag('--force')) {
  console.error('qr-codes/ sudah ada. Menjalankan ulang mengganti SEMUA token (QR cetakan lama tak berlaku). Pakai --force bila memang itu tujuannya.')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const pad = (n) => String(n).padStart(2, '0')
const rows = []
for (let label = 1; label <= COUNT; label++) {
  const token = randomBytes(18).toString('base64url')
  const url = `${BASE}/find-my-polo/q/${token}`
  const file = `qr-${pad(label)}.png`
  await QRCode.toFile(path.join(OUT, file), url, { width: 1024, margin: 4, errorCorrectionLevel: 'Q' })
  rows.push({ label, file, hash: createHash('sha256').update(token, 'utf8').digest('hex') })
}

const sql = [
  '-- Hanya hash SHA-256 token (token asli ada di gambar QR). Jalankan sekali setelah migration.',
  'begin;',
  ...rows.map(
    (r) =>
      `update public.game_qrs q set token_hash = '${r.hash}', status = 'active' from public.game_events e ` +
      `where q.event_id = e.id and e.slug = '${EVENT_SLUG}' and q.label = ${r.label};`,
  ),
  `do $$ begin if (select count(*) from public.game_qrs q join public.game_events e on e.id = q.event_id where e.slug = '${EVENT_SLUG}' and q.token_hash in (${rows.map((r) => `'${r.hash}'`).join(', ')})) <> ${COUNT} then raise exception 'token_hash tidak terpasang ke ${COUNT} QR — migration/seed sudah dijalankan?'; end if; end $$;`,
  'commit;',
  '',
].join('\n')
writeFileSync(path.join(OUT, 'apply-token-hashes.sql'), sql)

const sheet = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><title>Find My Polo — 5 QR</title>
<style>
  body{font-family:system-ui,sans-serif;margin:24px;color:#212121}
  h1{font-size:18px;margin:0 0 4px} p{margin:0 0 16px;font-size:13px;color:#636363}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  figure{margin:0;text-align:center;break-inside:avoid} img{width:100%;height:auto}
  figcaption{font-size:14px;font-weight:600;margin-top:4px}
  @media print{p.warn{display:none} body{margin:8mm}}
</style></head><body>
<h1>Find My Polo — 5 QR booth</h1>
<p class="warn">Gambar QR memuat token asli. Jangan dibagikan di luar panitia; cetak lalu simpan file ini dengan aman.</p>
<div class="grid">
${rows.map((r) => `<figure><img src="${r.file}" alt="QR ${r.label}"><figcaption>QR ${r.label}${r.label <= 3 ? ' · stempel' : ''}</figcaption></figure>`).join('\n')}
</div></body></html>
`
writeFileSync(path.join(OUT, 'sheet.html'), sheet)

console.log(`5 QR dibuat di ${OUT}\nIsi QR: ${BASE}/find-my-polo/q/<token>\nBerikutnya: npm run db:deploy, lalu npm run db:sql -- qr-codes/apply-token-hashes.sql`)
