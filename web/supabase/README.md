# Find My Polo — backend Supabase

Game berburu QR di booth Omah Pala. **Ini satu-satunya bagian situs yang punya backend sungguhan.**
Sisa situs (produk, kebun, admin demo) tetap client-side + localStorage seperti sebelumnya.

Migration ada di `prisma/migrations/` (dijalankan Prisma). Kode frontend: `src/features/find-my-polo/`. Panel panitia: `/admin/find-my-polo`.
Spesifikasi sumber: `PROMPT_FIND_MY_POLO_OMAHPALA.md` di root repo.

## Prinsip

Browser tidak dipercaya. Semua keputusan diambil oleh fungsi `SECURITY DEFINER` di Postgres:

- 4 QR aktif per akun dipilih server sekali (`fmp_start_game`) dan tidak pernah diacak ulang.
- Stamp hanya lahir dari `fmp_scan_qr`. Foreign key komposit membuat database **menolak** stamp untuk QR di luar assignment.
- Tantangan scroll: server memegang jam, kepemilikan, kedaluwarsa, dan sekali-pakai.
- Klaim & penukaran hadiah atomik (stok dikunci `FOR UPDATE`; penukaran satu `UPDATE ... WHERE status='claimed'`).
- Klien tidak punya hak tulis ke tabel mana pun (RLS tanpa policy tulis + `REVOKE`). Hanya RPC.

## Setup (urut)

1. **Buat project Supabase.** Catat Project URL dan `anon` key (Project Settings → API).
2. **Auth → Providers → Email:** aktifkan *Confirm email*. **Wajib.** Jika dimatikan, Supabase menandai email
   terverifikasi saat daftar dan syarat verifikasi hilang. (Server juga memeriksa `email_confirmed_at`, tapi
   itu tidak berarti apa-apa bila Supabase sendiri yang mengisinya.)
3. **Auth → URL Configuration:** Site URL = domain produksi. Redirect URLs tambahkan
   `https://DOMAIN/find-my-polo` dan `https://DOMAIN/admin/find-my-polo` (plus varian `http://localhost:5173/...` untuk dev).
4. **Terapkan migration lewat Prisma** (hanya sebagai penjalan migration; app tidak memakai Prisma Client):
   1. Dashboard → Connect → *Direct connection* (port 5432). Salin ke `web/.env.server` sebagai `DIRECT_URL` (contoh di `.env.example`).
   2. Dari `web/`: `npm run db:deploy` (menerapkan `prisma/migrations/*` berurutan), cek dengan `npm run db:status`.
   3. Jangan jalankan `prisma migrate dev` / `db push` (schema sengaja tanpa model; perintah itu bisa menghapus tabel).
   Alternatif tanpa Prisma: tempel isi tiap `migration.sql` berurutan di SQL Editor.
   Prisma 6 dipakai karena Prisma 7 mensyaratkan Node ≥ 20.19 / 22.12 / 24.
5. **Env frontend** (lokal: `web/.env.local`; Vercel: Settings → Environment Variables), lihat `web/.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` — isi dengan *publishable key* (`sb_publishable_…`) atau anon key lama.

   Situs ini Vite, jadi awalan `NEXT_PUBLIC_` tidak dibaca. Jangan taruh secret/service-role key di variabel berawalan `VITE_`;
   nilainya ikut terkirim ke browser. Secret key tidak dibutuhkan fitur ini sama sekali.
6. **Beri peran panitia.** Buat akunnya di Dashboard → Authentication → Users → *Add user* (centang *Auto Confirm User*;
   pendaftaran publik di `/find-my-polo` baru muncul setelah event aktif), lalu di SQL Editor:
   ```sql
   insert into public.game_staff (user_id, role)
   select id, 'admin' from auth.users where email = 'admin@contoh.id';   -- 'admin' atau 'staff'
   ```
   `admin`: semua. `staff`: hanya tukar hadiah & lihat statistik. Login admin demo di `/admin/login`
   hanya sesi mock di localStorage dan **tidak dipakai** server untuk otorisasi, jadi panel ini punya login Supabase sendiri.
7. **Jadwal event** (opsional; kosong = tanpa batas waktu). Keputusan pemilik event:
   ```sql
   update public.game_events
   set starts_at = '2026-11-01 09:00+07', ends_at = '2026-11-01 17:00+07'
   where slug = 'find-my-polo';
   ```
8. Buka `/admin/login` (login demo situs), menu **Find My Polo**, lalu masuk dengan akun panitia Supabase (peran `admin`) → tab **QR & stok**:
   1. Isi **stok hadiah** (tanpa stok, hadiah tidak bisa diklaim; sengaja tidak ada "tak terbatas" diam-diam).
   2. **QR fisik:** dua cara. (a) Skrip `npm run qr:generate` (default `--base https://omahpala.com`) membuat 10 PNG + `sheet.html` di `web/qr-codes/`
      (di-gitignore) dan `apply-token-hashes.sql`; pasang hash dengan `npm run db:sql -- qr-codes/apply-token-hashes.sql`.
      (b) Panel admin → *Buat token & tampilkan QR* (tampil sekali, tidak disimpan di browser). Keduanya mengganti token lama.
   3. Periksa halaman tujuan tiap QR (default: halaman produk/program yang ada). Mengubahnya lewat SQL Editor:
      `update public.game_qrs set destination_path = '/program' where label = 7 and event_id = (select id from public.game_events where slug = 'find-my-polo');`
      (hanya path `/produk`, `/produk/<slug>`, `/program`, `/program/<slug>` yang diterima database).
   4. Ubah status event ke **Aktif** (server menolak bila QR aktif ≠ 10).

## Keputusan yang masih terbuka

Semuanya ada di `game_events.config` (JSON) sehingga bisa diubah tanpa deploy. Nilai default bersifat konservatif:

| Keputusan | Default sekarang | Cara mengubah |
|---|---|---|
| Hadiah kecil dan stiker fisik boleh diklaim bersamaan? | **Tidak** (`rewards_combinable: false`) | `update game_events set config = jsonb_set(config,'{rewards_combinable}','true')` |
| Stok tiap hadiah | **Belum ada** (hadiah tak bisa diklaim) | Panel admin → Stok hadiah |
| Tanggal mulai/selesai | Kosong | SQL langkah 7 |
| Ambang stamp (2 / 3 / 4) | 2 hadiah kecil, 3 stiker (`rewards.*.min_stamps`, `sticker_unlock_at`) | `config` |
| Tantangan scroll | 4 dtk, 200 px, 3 gerakan, kedaluwarsa 15 mnt | `config.challenge` |
| Batas scan | 20 per 60 dtk per akun | `config.scan_rate_limit` |
| Artwork stiker/stamp | **Dummy** (`public/find-my-polo/*.svg`) | Ganti file atau path di `src/features/find-my-polo/config.ts` |
| Kebijakan privasi, retensi `scan_attempts` & data peserta | Belum ditetapkan | Pemilik proyek |

## Definisi status klaim hadiah

`eligible` = turunan (stamp ≥ ambang, belum ada klaim; tidak disimpan) → `claimed` (kode keluar, stok dicadangkan)
→ `redeemed` (diserahkan panitia; final) atau `cancelled` (dibatalkan admin, stok kembali; final, tidak diterbitkan ulang).

## Tes

```bash
npm test          # dari web/: vitest — 100% lokal, tanpa Supabase
```

- `src/**/*.test.ts` — logika murni frontend (parser token QR, pelacak scroll).
- `supabase/tests/*.db.test.ts` — **migration asli** dijalankan di PGlite (Postgres WASM) dengan stub skema `auth`
  dan peran `anon`/`authenticated`, jadi GRANT dan RLS ikut teruji: assignment, stamp, challenge, ambang 2/3/4,
  klaim/stok/redeem, otorisasi, RLS, rollback, dan simulasi 100 akun sintetis.

**Batas tes ini (jujur):** PGlite hanya satu koneksi, jadi tes **berurutan**. Perilaku saat request benar-benar
paralel (dua `start_game`, dua scan QR yang sama, dua klaim stok terakhir, dua petugas menukar kode yang sama)
dijamin oleh `ON CONFLICT`, `FOR UPDATE`, dan unique index, tetapi **belum diuji dengan paralelisme sungguhan**.
Uji di staging Supabase dengan skrip beban sebelum event. Tes ini juga bukan pengganti uji di Supabase asli:
integrasi Auth (email verifikasi, redirect URL), PostgREST, dan hak akses role asli hanya bisa dipastikan di sana.

## QA manual (staging)

1. Daftar dengan email asli → buka tautan verifikasi → kembali ke `/find-my-polo`. Sebelum verifikasi, tombol Start Hunting tidak muncul.
2. Start Hunting → "0 dari 4". Refresh, logout/login, buka di perangkat lain: progres sama.
3. Ambil 4 QR hasil cetak. Pindai satu per satu (kamera atau kamera bawaan ponsel → tautan terbuka). Dua dari empat tidak akan memberi stamp.
   Untuk melihat QR mana yang aktif bagi akun uji: SQL Editor → `select q.label from player_qr_assignments a join player_games g on g.id=a.player_game_id join game_qrs q on q.id=a.qr_id join auth.users u on u.id=g.user_id where u.email='...';`
4. **QR aktif:** stamp bertambah + animasi + suara (tombol "Suara aktif" mematikan). Pindai lagi: "Sudah ditemukan", jumlah tetap.
5. **QR tidak aktif:** langsung pindah ke halaman produk/program; bar di bawah menunjukkan Waktu & Gulir. Diam 5 detik tanpa gulir: tidak selesai.
   Gulir ≥ 200 px sambil halaman terlihat ≥ 4 dtk: "Tantangan selesai". Refresh di tengah: bar pulih dan hitungan mulai ulang.
6. Stamp ke-2: kartu "Hadiah kecil" bisa diklaim → kode `XXXX-XXXX`. Stamp ke-3: dialog stiker digital + suara.
7. Panitia (peran staff/admin) di `/admin/find-my-polo` → Tukar hadiah: masukkan kode → "Cek kode" → "Tukar sekarang". Ulangi kode yang sama: "sudah ditukar".
8. Matikan emulasi gerak (OS: Reduce motion): animasi stamp/stiker tidak berjalan, fungsi tetap.

## Keamanan dan keterbatasan

- **QR statis bisa difoto dan dibagikan.** Assignment per akun membuat satu QR aktif untuk A tetapi tidak untuk B,
  namun tidak mencegah berbagi foto QR. Tidak ada bukti kehadiran fisik (GPS/timer bukan bukti). Opsi bila perlu:
  kode singkat dari panitia, QR dinamis di layar booth, atau validasi petugas — mengubah gameplay, butuh persetujuan.
- **Tantangan scroll bukan anti-cheat.** Bukti scroll/waktu-terlihat dikirim browser dan bisa dipalsukan oleh yang
  mengendalikan browser. Yang andal dipaksa server hanyalah jam (≥ 4 dtk sejak halaman tampil), kepemilikan, kedaluwarsa,
  dan sekali-pakai. Fungsinya mendorong orang melihat produk, bukan membuktikan membaca.
- **Satu orang bisa membuat banyak akun email** (identitas hanya email). Kerugian dibatasi stok hadiah. Pertimbangkan
  CAPTCHA (Auth → Attack Protection) dan petugas yang memeriksa kode.
- Kode klaim disimpan apa adanya (bukan hash) karena pemain harus bisa melihatnya lagi setelah refresh. Pemain hanya
  bisa membaca kodenya sendiri (RLS); kode tak berguna tanpa petugas yang login.
- Rate limit scan per akun ada di database. Rate limit login/daftar memakai bawaan Supabase Auth.
- Tanpa SSR: halaman game hanya untuk pengguna aktif; tidak ada konsekuensi SEO.
- Belum ada ekspor data peserta (opsional di spesifikasi; butuh keputusan izin data).

## Backup & rollback

- **Backup:** Supabase Dashboard → Database → Backups (otomatis harian pada paket berbayar). Sebelum event, ambil
  dump manual (`supabase db dump`) dan simpan **di luar** repo. Jangan pernah commit dump berisi email peserta.
- **Rollback ringan (tanpa kehilangan data):** ubah status event ke `ended` atau `draft` (panel admin), atau redeploy
  frontend commit sebelumnya.
- **Rollback penuh (menghapus semua data game):** `rollback/find_my_polo_down.sql` (jalankan manual setelah backup;
  sengaja bukan bagian dari `migrations/`).
- Migration bersifat aditif: hanya membuat objek baru, tidak mengubah tabel lain.

## Peta berkas

```
supabase/
  rollback/find_my_polo_down.sql            hapus semua (destruktif)
  tests/                                    tes PGlite
prisma/migrations/
  …_find_my_polo/migration.sql              skema, RLS, fungsi
  …_find_my_polo_seed_event/                event + 10 slot QR (draft)
  …_lock_prisma_table/                      kunci tabel _prisma_migrations dari API publik
scripts/generate-qr-codes.mjs               pembuat 10 QR + SQL hash
src/features/find-my-polo/
  services/   klien Supabase + pembungkus RPC     utils/   parser QR, pelacak scroll, store challenge
  hooks/      auth, status game, suara            components/  StampBoard, RewardPanel, scanner, bar challenge…
  pages/      FindMyPolo, ScanPage, QrLink        config.ts    rute + pemetaan aset dummy
src/pages/admin/PoloAdmin.tsx                     panel panitia
```
