# MASTER IMPLEMENTATION PROMPT — FIND MY POLO | OMAHPALA

> **Tujuan dokumen:** Instruksi utama untuk coding agent (Antigravity, Cursor, Claude Code, atau agent sejenis) untuk menambahkan game **Find My Polo** ke website OmahPala yang sudah ada.
>
> **Aturan tertinggi:** Pertahankan desain, identitas visual, struktur navigasi, fitur, halaman, alur kerja, role, konten, dan perilaku website OmahPala yang sudah ada. Game ini adalah penambahan fitur, bukan redesign atau penggantian website.

---

## 0. INSTRUKSI UTAMA UNTUK CODING AGENT

Bertindak sebagai senior full-stack engineer, UI/UX engineer, database engineer, dan application security engineer. Implementasikan fitur Find My Polo secara menyeluruh, aman, dapat diuji, dan sesuai arsitektur proyek yang ditemukan.

### 0.1 Source of truth

1. **PRD OmahPala yang sudah ada adalah sumber kebenaran utama** untuk seluruh fitur, halaman, role, proses bisnis, navigasi, dan perilaku website yang telah disepakati.
2. Repository dan implementasi aktual adalah sumber kebenaran untuk stack, struktur folder, komponen, design tokens, routing, pola coding, dan deployment.
3. Dokumen ini hanya menambahkan spesifikasi game Find My Polo. Dokumen ini **tidak memberi izin** untuk menghapus, mengganti, atau mengubah fitur OmahPala yang telah ada.
4. Jika ada perbedaan antara dokumen ini dengan PRD untuk fitur lama, ikuti PRD. Jika ada konflik teknis yang nyata, dokumentasikan dan laporkan; jangan mengambil keputusan yang mengubah produk secara sepihak.
5. Jangan mengarang halaman, fitur, data bisnis, nama produk, program, hadiah, atau konten OmahPala yang belum tersedia. Gunakan data yang ada atau dummy yang diberi label jelas.

### 0.2 Larangan mutlak

- Jangan redesign website.
- Jangan mengganti palet warna, tipografi, logo, ilustrasi, spacing, ukuran komponen, gaya tombol, bentuk card, header, footer, navigasi, atau responsive behavior yang sudah ada.
- Jangan mengganti stack teknologi hanya karena preferensi pribadi.
- Jangan menghapus atau menyederhanakan fitur lama.
- Jangan mengubah routing atau URL lama tanpa alasan teknis yang terbukti dan tanpa menjaga kompatibilitas.
- Jangan menimpa file konfigurasi, environment, migration, atau komponen yang ada tanpa memeriksa dampaknya terlebih dahulu.
- Jangan menaruh secret, service-role key, private key, atau kredensial database di frontend.
- Jangan menandai fitur selesai jika belum diuji.
- Jangan memindahkan atau menghapus file hanya karena tampak tidak terpakai. Audit referensi dan dependensinya terlebih dahulu.

### 0.3 Cara kerja wajib

Kerjakan secara bertahap:

1. Audit repository, PRD, struktur folder, dependencies, environment variables, routing, autentikasi, database, dan deployment.
2. Buat ringkasan singkat kondisi saat ini dan rencana perubahan sebelum mengedit kode.
3. Identifikasi file yang akan dibuat, file yang perlu diubah, migration yang diperlukan, serta risiko regresi.
4. Implementasikan fitur baru dengan perubahan sekecil mungkin dan mengikuti pola proyek yang sudah ada.
5. Tambahkan migration yang aman, kebijakan RLS, validasi backend, error handling, test, dan dokumentasi.
6. Jalankan pemeriksaan lint, typecheck, test, build, dan test integrasi yang tersedia.
7. Periksa ulang bahwa fitur lama masih berfungsi dan desain tidak berubah.
8. Laporkan apa yang benar-benar selesai, apa yang belum, hasil test, perubahan file, migration, konfigurasi yang diperlukan, dan langkah deployment.

**Jangan berhenti setelah membuat UI dummy.** Implementasikan alur penuh sesuai stack yang ada. Jika akses ke Supabase, kredensial, PRD, atau data asli belum tersedia, buat bagian yang dapat dikerjakan dengan aman dan tandai dengan jelas apa yang memerlukan konfigurasi pemilik proyek. Jangan berpura-pura integrasi telah berhasil.

---

## 1. RINGKASAN PRODUK

**Nama fitur:** Find My Polo  
**Website:** OmahPala  
**Jenis:** Game scavenger hunt berbasis QR untuk booth/event  
**Tujuan:** Membuat pengalaman interaktif bagi pengunjung, memperkenalkan produk/program OmahPala, mengumpulkan stamp digital, dan memfasilitasi klaim hadiah.

Website OmahPala saat ini berfungsi untuk memperkenalkan produk dan program. Find My Polo harus menjadi modul baru yang terintegrasi secara visual dan teknis tanpa mengganggu halaman yang sudah ada.

### 1.1 Aturan inti game

- Pengunjung mendaftar dengan email dan password, kemudian memverifikasi email sesuai konfigurasi autentikasi.
- Sepuluh QR fisik ditempatkan di booth.
- Setiap akun mendapat **tepat empat QR aktif dari sepuluh QR** untuk satu event.
- Enam QR sisanya tidak aktif untuk akun tersebut.
- Kombinasi ditentukan oleh server saat akun memulai permainan untuk pertama kalinya dan disimpan untuk event itu.
- Kombinasi tidak diacak ulang setiap detik, setiap scan, saat refresh, logout/login, atau saat pengguna membuka perangkat lain.
- Kombinasi empat QR aktif antar akun dapat sama secara kebetulan. Sistem tidak wajib menjamin setiap akun memiliki kombinasi unik, kecuali kebutuhan bisnis kemudian menetapkannya.
- QR aktif yang belum pernah dikumpulkan akun tersebut memberi satu stamp.
- QR aktif yang sudah pernah dikumpulkan tidak memberikan stamp tambahan.
- QR yang tidak aktif untuk akun tersebut tidak memberi stamp. Pengguna diarahkan ke halaman produk atau program OmahPala, lalu harus menyelesaikan tantangan scrolling selama minimal empat detik sebelum dapat scan lagi.
- Tantangan scrolling adalah mekanisme engagement, bukan bukti keamanan yang sempurna. Backend tetap menjadi sumber kebenaran untuk stamp dan hadiah.
- Dua stamp membuat pengguna memenuhi syarat hadiah kecil.
- Tiga stamp membuka stiker digital.
- Empat stamp berarti semua QR aktif milik akun sudah ditemukan.
- Progres tersimpan di database dan tetap ada setelah refresh, logout/login, atau pindah perangkat.
- Klaim hadiah fisik harus dicatat terpisah dari koleksi stamp dan hanya dapat ditukarkan satu kali.

### 1.2 Definisi istilah

- **QR fisik:** QR yang ditempel di booth, jumlahnya sepuluh untuk event ini.
- **QR aktif untuk akun:** Salah satu dari empat QR yang ditetapkan server sebagai target akun.
- **QR tidak aktif untuk akun:** QR valid yang bukan salah satu dari empat target akun itu.
- **Stamp:** Koleksi digital yang diberikan server saat QR aktif berhasil diklaim untuk pertama kalinya.
- **Scroll challenge:** Tantangan di halaman produk/program setelah scan QR yang tidak aktif.
- **Digital sticker:** Aset digital yang dibuka ketika akun mencapai tiga stamp.
- **Reward claim:** Hak untuk menukarkan hadiah fisik, terpisah dari status stamp/stiker.
- **Event:** Satu periode permainan yang memiliki sepuluh QR, konfigurasi hadiah, dan tanggal mulai/selesai.

---

## 2. PENGALAMAN PENGGUNA DAN ALUR LENGKAP

### 2.1 Entry point

- Tambahkan akses ke Find My Polo di lokasi navigasi yang paling sesuai dengan struktur website yang sudah ada.
- Jangan mengubah navigasi yang sudah ada lebih dari yang diperlukan untuk menambahkan akses ke fitur baru.
- Gunakan pola tombol, card, tipografi, warna, dan responsive layout dari design system website saat ini.
- Jangan membuat branding atau design system baru untuk game.

### 2.2 Registrasi dan login

1. Pengguna membuka Find My Polo.
2. Jika belum login, tampilkan alur registrasi/login menggunakan mekanisme autentikasi yang sesuai dengan stack yang sudah ada.
3. Gunakan email dan password. Verifikasi email diwajibkan sebelum permainan dimulai.
4. Tampilkan error autentikasi dengan pesan yang jelas dan tidak membocorkan informasi sensitif.
5. Setelah login, periksa apakah pengguna memiliki progres untuk event aktif.
6. Jika sudah ada progres, lanjutkan progres yang sama. Jangan membuat kombinasi baru.
7. Jangan menyimpan password atau token sensitif di tabel aplikasi buatan sendiri.

### 2.3 Mulai permainan dan penetapan kombinasi

Saat pengguna menekan `Start Hunting`:

1. Backend memverifikasi sesi autentikasi, status verifikasi email, dan status event.
2. Backend memeriksa apakah `player_game` sudah ada untuk pasangan user dan event.
3. Jika sudah ada, kembalikan assignment dan progres yang sama.
4. Jika belum ada, pilih empat QR berbeda dari sepuluh QR valid menggunakan randomness server-side yang layak.
5. Simpan assignment secara transaksional.
6. Pastikan request bersamaan tidak dapat membuat dua assignment berbeda untuk user/event yang sama.
7. Jangan mengirim seluruh detail assignment jika tidak diperlukan UI. Backend tetap harus memvalidasi hasil scan secara mandiri.

### 2.4 Scan QR

- Sediakan scanner kamera mobile yang kompatibel dengan browser yang ditargetkan.
- Jika pola website mendukung deep link, QR dapat membuka URL game dengan token QR yang opaque dan sulit ditebak.
- Jangan menjadikan nomor QR yang mudah ditebak sebagai satu-satunya mekanisme keamanan.
- Validasi token di backend.
- Validasi bahwa event aktif dan QR valid.
- Validasi bahwa akun memiliki assignment untuk event tersebut.
- Periksa apakah QR aktif untuk akun itu.
- Cegah pemberian stamp ganda dengan constraint database dan operasi transaksional.
- Jangan percaya `qrActive`, `stampCount`, `rewardEligible`, atau status sejenis yang dikirim frontend.
- Jika kamera tidak tersedia atau izin ditolak, tampilkan pesan dan opsi pemulihan yang jelas. Jangan membuat scan dianggap berhasil jika token tidak divalidasi.

### 2.5 Jika QR aktif

1. Backend mencatat scan yang valid.
2. Jika QR belum pernah menghasilkan stamp untuk user/event, backend menyimpan stamp dalam transaksi.
3. Jika QR sudah dikumpulkan, jangan menambahkan stamp; tampilkan status sudah ditemukan.
4. UI memperbarui koleksi berdasarkan respons server.
5. Mainkan animasi singkat saat stamp baru berhasil diperoleh.
6. Mainkan efek suara pendek jika browser mengizinkan audio dan pengguna tidak mematikannya.
7. Berikan kontrol mute/sound-off yang mudah ditemukan.
8. Hormati `prefers-reduced-motion`; animasi tidak boleh menghalangi fungsi utama.
9. Jangan mengungkap atau mengubah assignment akun saat menampilkan hasil.

### 2.6 Jika QR tidak aktif untuk akun

1. Backend mengembalikan hasil `inactive_for_player` tanpa memberikan stamp.
2. Frontend membuka halaman produk atau program OmahPala yang memang sudah ada.
3. Jika URL tujuan tidak tersedia, gunakan halaman fallback yang memakai komponen dan design tokens yang sudah ada; jangan mengarang detail produk/program.
4. Mulai tantangan scrolling.
5. Pengguna harus berada pada halaman yang terlihat dan melakukan gerakan scroll yang memenuhi jarak minimum yang ditentukan, dengan durasi valid minimal empat detik.
6. Gunakan empat detik sebagai durasi minimum, bukan random timer.
7. Jangan menganggap timer saja cukup jika pengguna tidak melakukan scrolling.
8. Setelah tantangan selesai, backend menandai tantangan selesai atau menerbitkan izin lanjutan yang aman dan terbatas untuk sesi itu.
9. Buka kembali kemampuan scan berikutnya.
10. QR yang sama tetap tidak aktif untuk akun tersebut. Assignment tidak berubah karena challenge.
11. Jika pengguna refresh, kembali, menutup tab, atau kehilangan koneksi, status tantangan harus ditangani konsisten; jangan otomatis menganggap challenge selesai.
12. Berikan feedback progres yang jelas: misalnya indikator waktu, indikator scroll, dan status tombol scan.

**Batas keamanan:** Event scrolling dapat dipalsukan oleh pengguna yang mengendalikan browser. Jangan mengklaim bahwa mekanisme ini membuktikan pengunjung benar-benar membaca halaman. Fungsinya adalah mendorong product discovery. Keputusan pemberian stamp dan hadiah tetap berada di backend.

### 2.7 Koleksi stamp dan reward

- Tampilkan progres `0/4`, `1/4`, `2/4`, `3/4`, atau `4/4` berdasarkan data server.
- Gunakan dummy sticker image sementara, tetapi letakkan aset di lokasi yang mudah diganti.
- Jangan menggunakan gambar dummy sebagai aset final atau mengklaimnya sebagai aset resmi OmahPala.
- Pada stamp ketiga, jalankan animasi pembukaan stiker dan suara pendek.
- Simpan status unlock di backend atau turunkan secara konsisten dari stamp yang sudah disimpan; jangan hanya menyimpannya di local state.
- Pada dua stamp, tampilkan kelayakan hadiah kecil.
- Pada tiga stamp, tampilkan kelayakan stiker digital dan hadiah fisik terkait jika event memang menyediakan hadiah tersebut.
- Pada empat stamp, tampilkan bahwa semua target akun telah ditemukan.
- Jangan menjanjikan stok hadiah yang belum dikonfigurasi.
- Jika stok hadiah terbatas, server harus mengontrol alokasi stok secara atomik.

### 2.8 Klaim hadiah fisik

- Gunakan kode klaim unik yang dibuat oleh backend.
- Status klaim minimal: `eligible`, `claimed` atau `redeemed`, dan bila diperlukan `cancelled`.
- Tentukan satu definisi status yang konsisten di seluruh implementasi; jangan memakai status yang tumpang tindih tanpa dokumentasi.
- Panitia harus dapat memvalidasi kode lewat tampilan admin yang dilindungi autentikasi/otorisasi, atau mekanisme tepercaya yang sesuai dengan sistem yang sudah ada.
- Setelah hadiah diberikan, status menjadi `redeemed` secara atomik.
- Kode yang sudah ditukarkan tidak dapat dipakai kembali.
- Jangan menjadikan screenshot halaman reward sebagai bukti klaim yang valid.
- Jangan mengizinkan pengguna mengubah status redeem melalui frontend atau direct database access.

---

## 3. DESAIN DAN UX — WAJIB MEMPERTAHANKAN WEBSITE SAAT INI

### 3.1 Prinsip visual

- Pertahankan seluruh desain website yang ada.
- Audit dahulu design tokens, font, warna, radius, shadow, spacing, breakpoints, button variants, card styles, navbar, footer, dan pola layout yang sudah digunakan.
- Gunakan ulang komponen yang tersedia sebelum membuat komponen baru.
- Komponen baru harus mengikuti sistem desain lama, bukan menggantikannya.
- Jangan menambahkan warna, font, gaya ilustrasi, atau animasi yang bertabrakan dengan brand.
- Jika game memerlukan tampilan lebih playful, capai melalui isi koleksi, feedback, dan micro-interaction kecil yang tetap konsisten dengan visual website.
- Jangan mengubah layout halaman produk/program yang sudah ada hanya untuk mengakomodasi tantangan.

### 3.2 Responsive dan accessibility

- Prioritaskan penggunaan mobile karena QR akan dipindai di booth.
- Pastikan tombol utama mudah disentuh, konten tidak overflow, scanner memiliki fallback, dan layout berfungsi di desktop.
- Semua kontrol interaktif harus dapat diakses dengan keyboard bila relevan.
- Gunakan label dan pesan error yang dapat dipahami screen reader.
- Sediakan kontrol suara dan hormati pengaturan reduced motion.
- Jangan mengandalkan warna saja untuk membedakan status aktif, tidak aktif, sukses, atau error.

### 3.3 Dummy assets

- Gunakan dummy image/sticker sementara jika aset resmi belum tersedia.
- Beri nama file yang deskriptif dan simpan dalam folder aset fitur yang sesuai dengan struktur repository.
- Jangan menyimpan gambar base64 besar langsung di komponen.
- Buat satu mapping/config untuk mengganti dummy artwork dengan aset resmi nanti.
- Jangan mengubah gambar atau logo asli yang sudah ada.

---

## 4. ARSITEKTUR DAN STACK

### 4.1 Audit stack sebelum implementasi

Jangan langsung mengasumsikan stack. Audit `package.json`, lockfile, struktur source, konfigurasi build, routing, environment, migration, dan dokumentasi proyek.

Jika proyek sesuai dengan rencana teknis yang sudah ada, stack yang diutamakan adalah:

- Frontend: React + TypeScript + Vite.
- Styling: Tailwind CSS dan komponen/design system yang sudah ada, termasuk shadcn/ui bila memang telah dipakai.
- Routing: gunakan router yang sudah terpasang.
- Backend/database/auth: Supabase Auth + PostgreSQL + RLS + server-side functions/RPC yang aman.
- Hosting frontend: gunakan hosting/deployment yang sudah ada (misalnya Vercel) tanpa mengubah proses yang sudah berjalan.
- Testing: gunakan test runner yang sudah ada; Vitest/React Testing Library dan Playwright dapat dipakai jika sesuai dengan dependency dan workflow proyek.

**Jika repository menggunakan stack berbeda, ikuti stack yang ada.** Jangan melakukan migrasi teknologi besar untuk fitur ini.

### 4.2 Batas kepercayaan

Frontend tidak dipercaya. Backend/database adalah sumber kebenaran untuk:

- Identitas pengguna dan status verifikasi.
- Event yang aktif.
- Validitas QR.
- Assignment empat QR per akun.
- Stamp yang terkumpul.
- Penyelesaian tantangan yang dibutuhkan untuk membuka scan berikutnya.
- Eligibility, stok, dan status klaim hadiah.

Jangan menggunakan localStorage sebagai sumber kebenaran untuk assignment, stamp, eligibility, atau status hadiah. Local storage boleh dipakai untuk preferensi non-sensitif seperti pilihan suara, bila sesuai dengan praktik proyek.

---

## 5. MODEL DATA YANG DIREKOMENDASIKAN

Sesuaikan nama tabel dan pola schema dengan database yang sudah ada. Jangan membuat tabel duplikat jika fungsi serupa sudah tersedia.

### 5.1 `game_events`

Field yang direkomendasikan:

- `id` UUID primary key.
- `slug` unique, misalnya `find-my-polo`.
- `name`.
- `status` (`draft`, `active`, `ended`, `archived`).
- `starts_at`, `ends_at` bila event memakai jadwal.
- `config` atau field konfigurasi terstruktur untuk threshold stamp dan pengaturan hadiah.
- `created_at`, `updated_at`.

### 5.2 `game_qrs`

- `id` UUID primary key.
- `event_id` foreign key.
- `label` atau nomor internal 1–10.
- `token_hash` atau bentuk penyimpanan token yang aman; hindari menyimpan token plaintext jika tidak diperlukan.
- `status` (`active`, `disabled`, `revoked`).
- `destination_type` atau referensi tujuan jika diperlukan.
- `created_at`, `updated_at`.
- Unique constraint yang memastikan tidak ada label QR ganda dalam event.

QR token harus sulit ditebak, dapat dicabut, dan divalidasi oleh server. Jangan menganggap token tersembunyi sebagai satu-satunya perlindungan.

### 5.3 `player_games`

- `id` UUID primary key.
- `event_id` foreign key.
- `user_id` mengacu pada ID pengguna dari auth provider.
- `status` (`active`, `completed`, `suspended`) sesuai kebutuhan.
- `assignment` yang menyimpan empat QR ID, atau tabel assignment terpisah yang lebih ternormalisasi.
- `started_at`, `completed_at`, `created_at`, `updated_at`.
- Unique constraint pada `(event_id, user_id)`.

Pilihan implementasi:

1. Untuk desain ternormalisasi, buat tabel `player_qr_assignments` dengan `player_game_id`, `qr_id`, `created_at`, dan unique constraints. Ini lebih mudah untuk query dan constraint.
2. Jika menyimpan array assignment, tetap validasi empat ID berbeda dan semua QR berada di event yang sama melalui trusted server/database logic.

Utamakan desain ternormalisasi bila sesuai dengan pola database proyek.

### 5.4 `player_stamps`

- `id` UUID primary key.
- `player_game_id` foreign key.
- `qr_id` foreign key.
- `collected_at`.
- `scan_attempt_id` atau referensi audit bila diperlukan.
- Unique constraint pada `(player_game_id, qr_id)`.

Stamp hanya dapat dibuat setelah server memastikan QR aktif untuk player game itu.

### 5.5 `scan_attempts`

- `id` UUID primary key.
- `player_game_id`.
- `qr_id` bila token dapat dipetakan ke QR.
- `result` seperti `stamp_awarded`, `already_collected`, `inactive_for_player`, `invalid_token`, `event_inactive`, `rate_limited`.
- `created_at`.
- Metadata minimal untuk diagnosis/anti-abuse, dengan prinsip minimisasi data.

Jangan menyimpan data sensitif yang tidak diperlukan. Jangan mencatat password atau token autentikasi.

### 5.6 `scroll_challenges`

- `id` UUID primary key.
- `player_game_id`.
- `scan_attempt_id` atau QR yang memicu challenge.
- `destination_path` yang mengacu pada halaman produk/program yang valid.
- `status` (`pending`, `completed`, `expired`, `cancelled`).
- `started_at`, `completed_at`, `expires_at`.
- `server_nonce`/token challenge jika diperlukan.

Challenge harus terikat ke user, player game, dan scan attempt tertentu. Jangan izinkan satu challenge dipakai untuk membuka banyak scan jika aturan mengharuskan satu challenge per QR tidak aktif.

### 5.7 `reward_claims`

- `id` UUID primary key.
- `player_game_id`.
- `reward_type` (`small_gift`, `sticker` atau jenis yang dikonfigurasi).
- `claim_code_hash` atau mekanisme penyimpanan kode yang aman.
- `status` (`eligible`, `claimed`, `redeemed`, `cancelled`) dengan semantik terdokumentasi.
- `created_at`, `redeemed_at`, `redeemed_by` jika panitia login.
- Unique constraint untuk mencegah klaim duplikat sesuai kebijakan hadiah.

### 5.8 `reward_inventory` (jika stok terbatas)

- `id`, `event_id`, `reward_type`, `total_quantity`, `reserved_quantity`, `redeemed_quantity`, `updated_at`.
- Gunakan transaksi/locking atau operasi atomik agar klaim bersamaan tidak melebihi stok.
- Jangan membuat stok unlimited secara diam-diam jika jumlah hadiah belum diketahui. Sediakan konfigurasi yang harus ditentukan pemilik event.

### 5.9 Admin dan audit

Jika website sudah memiliki role admin, gunakan sistem role tersebut. Jangan membuat sistem role kedua tanpa kebutuhan.

Operasi admin harus diautentikasi dan diotorisasi di server/database. Audit log untuk tindakan sensitif seperti mengubah status QR, konfigurasi event, stok, atau redeem hadiah.

---

## 6. BACKEND API / SERVER FUNCTIONS

Gunakan mekanisme server-side yang sesuai dengan stack saat ini. Nama endpoint di bawah adalah kontrak konseptual, bukan kewajiban membuat REST API jika proyek lebih sesuai menggunakan Supabase RPC atau server functions.

### 6.1 `start-game`

**Input:** event slug/ID yang valid.  
**Validasi:** user authenticated, email verified, event aktif.  
**Efek:** buat player game dan empat assignment jika belum ada; selain itu kembalikan yang sudah ada.  
**Output:** player game ID, status, progres, dan data UI yang aman.

### 6.2 `scan-qr`

**Input:** token QR dan referensi event/game yang dibutuhkan.  
**Validasi:** user, event, token, assignment, rate limit, scan history.  
**Hasil yang mungkin:**

- `stamp_awarded`
- `already_collected`
- `inactive_for_player`
- `invalid_qr`
- `event_inactive`
- `rate_limited`
- `authentication_required`

**Efek:** hanya hasil `stamp_awarded` yang menambahkan stamp. Hasil `inactive_for_player` memulai/mengembalikan scroll challenge yang sesuai, tanpa menambah stamp.

### 6.3 `complete-scroll-challenge`

**Input:** challenge ID dan bukti/status challenge yang diperlukan.  
**Validasi:** challenge milik user, status masih pending, belum expired, terikat pada scan attempt yang benar, dan aturan challenge dipenuhi sejauh yang bisa diverifikasi.  
**Efek:** tandai selesai secara idempotent dan buka scan berikutnya.  
**Catatan:** frontend event scroll tidak dapat dijadikan bukti anti-cheat sempurna. Jangan membuat klaim keamanan berlebihan.

### 6.4 `get-game-progress`

Kembalikan jumlah stamp, QR yang telah dikumpulkan, status unlock stiker, status challenge, dan reward eligibility milik pengguna. Jangan membocorkan data privat pemain lain.

### 6.5 `create-reward-claim`

- Periksa threshold stamp dari data database.
- Cegah klaim ganda sesuai aturan hadiah.
- Jika stok terbatas, alokasikan dalam transaksi.
- Hasilkan kode klaim unik yang tidak mudah ditebak.
- Jangan menerima jumlah stamp atau eligibility dari client sebagai kebenaran.

### 6.6 `redeem-reward`

- Hanya role panitia/admin yang diizinkan.
- Validasi kode dan event.
- Ubah status menjadi redeemed secara atomik.
- Tolak kode yang invalid, dibatalkan, atau sudah ditukarkan.
- Catat admin/petugas dan waktu redeem jika identitas petugas tersedia.

### 6.7 Error handling

- Gunakan response/error code yang konsisten.
- Jangan mengirim SQL error, stack trace, secret, atau detail internal ke client.
- Sediakan pesan pengguna yang jelas dan log teknis yang aman.
- Semua operasi yang dapat dipanggil berulang harus idempotent jika memungkinkan.

---

## 7. ALGORITMA PENTING

### 7.1 Assignment empat QR

1. Ambil sepuluh QR yang valid untuk event aktif.
2. Pastikan jumlahnya tepat sepuluh sebelum game dibuka, kecuali konfigurasi event secara eksplisit mendukung jumlah lain.
3. Pilih empat QR berbeda secara acak di server.
4. Simpan assignment dalam transaksi.
5. Pastikan unique constraint `(event_id, user_id)` pada player game.
6. Jika request bersamaan terjadi, hanya satu assignment yang boleh menang; request lain mengambil hasil tersimpan.
7. Jangan mengacak ulang assignment ketika QR dipindai, challenge diselesaikan, halaman refresh, atau pengguna login kembali.
8. Jangan menuntut semua kombinasi unik antar akun kecuali kebijakan event secara eksplisit meminta itu.

### 7.2 Pemberian stamp

Dalam satu transaksi:

1. Validasi user dan player game.
2. Validasi event aktif.
3. Validasi token QR dan status QR.
4. Periksa assignment QR untuk player game.
5. Jika tidak termasuk empat QR aktif, jangan membuat stamp; buat/ambil challenge sesuai kebijakan.
6. Jika termasuk assignment, coba buat stamp.
7. Constraint unik mencegah stamp ganda.
8. Hitung progres dari database dan kembalikan hasil.

### 7.3 Threshold hadiah

- `stamp_count >= 2`: eligible untuk hadiah kecil, jika hadiah itu dikonfigurasi untuk event.
- `stamp_count >= 3`: stiker digital terbuka.
- `stamp_count >= 4`: semua target QR akun ditemukan.
- Stamp count dihitung dari data stamp valid di database, bukan counter client.
- Tetapkan dengan jelas apakah hadiah kecil dan stiker fisik dapat diklaim keduanya. Implementasikan kebijakan sebagai konfigurasi/aturan eksplisit, jangan mengasumsikannya diam-diam.

---

## 8. KEAMANAN DAN ANTI-CHEAT

### 8.1 Wajib

- Verifikasi autentikasi dan email sesuai kebijakan.
- Validasi semua input di server.
- RLS untuk tabel yang terekspos.
- Constraint database untuk duplikasi.
- Transaksi untuk assignment, stamp, klaim, dan redeem.
- Rate limit pada auth-sensitive actions dan scan.
- Token QR yang opaque, random, dapat dicabut, dan tidak berurutan secara mudah ditebak.
- Jangan mengirim service-role key atau secret ke browser.
- Jangan mempercayai localStorage, hidden fields, disabled buttons, atau client-side state sebagai kontrol keamanan.
- Jangan memberikan stamp berdasarkan parameter `isActive` yang dikirim client.
- Catat percobaan yang diperlukan untuk audit tanpa mengumpulkan data pribadi berlebihan.
- Pastikan satu user hanya dapat mengakses progres miliknya sendiri.
- Proteksi admin/redeem berdasarkan role yang diverifikasi di server.

### 8.2 QR statis dan pembagian foto

QR statis dapat difoto dan dibagikan. Personalized assignment membuat QR yang sama bisa aktif untuk satu akun tetapi tidak untuk akun lain, namun tidak sepenuhnya mencegah berbagi QR. Jangan mengklaim GPS, timer scrolling, atau token QR statis sebagai bukti bahwa pengguna secara fisik berada di booth.

Jika pemilik event nanti meminta pembuktian kehadiran lebih kuat, ajukan opsi tambahan seperti kode singkat dari panitia, QR dinamis di layar booth, atau validasi petugas. Jangan mengaktifkan mekanisme tambahan yang mengubah gameplay tanpa persetujuan.

### 8.3 Privasi

- Kumpulkan hanya data yang diperlukan untuk akun, progres, dan pengelolaan hadiah.
- Jangan mengekspos daftar email peserta ke peserta lain.
- Jangan menyimpan lokasi presisi atau fingerprint perangkat kecuali benar-benar diperlukan dan disetujui pemilik proyek.
- Jangan menggunakan IP sebagai identitas unik; peserta dapat berbagi jaringan.
- Sediakan penanganan error dan penghapusan data sesuai kebijakan privasi yang sudah berlaku pada website.

---

## 9. ADMIN / PENGELOLA EVENT

Audit dahulu apakah website memiliki dashboard admin. Jika sudah ada, integrasikan ke sana dan gunakan komponen/role yang ada. Jangan membuat dashboard admin terpisah jika tidak diperlukan.

Kebutuhan minimum untuk pengelola:

- Melihat jumlah akun yang memulai permainan.
- Melihat jumlah stamp yang terkumpul secara agregat.
- Melihat status klaim hadiah dan redeem.
- Mengaktifkan/menonaktifkan event atau QR dengan izin yang benar.
- Mengatur jumlah hadiah jika stok terbatas.
- Memvalidasi kode klaim.
- Melihat aktivitas mencurigakan dan error operasional.
- Mengekspor data event hanya jika kebutuhan dan izin data mendukungnya.

Perubahan konfigurasi harus tercatat di audit log. Jangan menampilkan token QR rahasia kepada semua admin jika tidak diperlukan.

---

## 10. ORGANISASI FILE DAN BACKUP

### 10.1 Pertahankan struktur yang sudah ada

Jangan memaksakan struktur baru jika repository sudah mempunyai pola yang konsisten. Gunakan struktur feature-based yang ada dan tambahkan `find-my-polo` di tempat yang sesuai.

Jika struktur proyek memang sesuai dengan rencana feature-based, pola yang dapat dipakai adalah:

```text
src/
├── app/
├── components/
├── features/
│   └── find-my-polo/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── utils/
├── lib/
├── hooks/
├── types/
├── utils/
└── styles/

supabase/
├── migrations/
├── seed.sql
└── tests/

tests/
.env.example
```

Ini contoh yang harus disesuaikan dengan struktur aktual, bukan perintah untuk memindahkan seluruh file.

### 10.2 Kerapian dan cleanup

- Seluruh kode baru harus terorganisasi dan konsisten dengan lint/format proyek.
- Jangan meninggalkan komponen duplikat, dependency yang tidak digunakan, file eksperimen, debug logs, atau kode mati akibat implementasi.
- Sebelum memindahkan/menghapus file lama, cari semua referensi dan periksa apakah file digunakan oleh build, deployment, migration, atau script.
- Jangan menghapus file lama hanya karena tampak tidak dipakai.
- Jangan membuat folder baru di luar kebutuhan proyek.

### 10.3 Backup

- Jangan pernah menyimpan kredensial atau data pribadi produksi di backup repository.
- Pastikan migration database tersimpan dalam version control.
- Dokumentasikan prosedur backup database dan restore sesuai layanan yang digunakan.
- Jika proyek memang menggunakan direktori backup, letakkan hanya artefak yang memang diperlukan di dalamnya dan jangan membuat duplikasi kode yang membingungkan.
- Folder `bin/` hanya digunakan untuk script/tooling yang benar-benar diperlukan dan sesuai pola repository; jangan memindahkan file secara massal ke `bin/` hanya agar root terlihat bersih.
- Pastikan `.env`, dump produksi, token, dan secret dikecualikan dari Git. Perbarui `.env.example` dengan nama variabel dan placeholder saja.

---

## 11. TESTING WAJIB

### 11.1 Unit tests

- Assignment selalu menghasilkan empat QR berbeda.
- Assignment tidak berubah saat `start-game` dipanggil berulang.
- Scan QR aktif memberi stamp satu kali.
- Scan QR aktif yang sudah terkumpul tidak menambah stamp.
- QR valid tetapi tidak aktif untuk akun tidak memberi stamp dan memicu challenge.
- Token invalid/revoked ditolak.
- Event yang belum mulai atau sudah berakhir menolak scan.
- Threshold 2, 3, dan 4 stamp dihitung dengan benar.
- Klaim hadiah duplikat ditolak.
- Redeem kode yang sudah dipakai ditolak.

### 11.2 Integration tests

- Registrasi, verifikasi email, login, dan mulai game.
- Dua request start-game bersamaan tetap menghasilkan satu assignment.
- Dua request scan untuk QR yang sama bersamaan hanya menghasilkan satu stamp.
- Challenge hanya bisa diselesaikan oleh pemiliknya dan tidak bisa digunakan ulang secara tidak sah.
- Dua klaim hadiah bersamaan tidak melebihi stok.
- RLS mencegah user membaca/mengubah progres user lain.
- Admin tanpa role yang sesuai tidak bisa redeem hadiah atau mengubah QR.

### 11.3 UI/E2E tests

- Alur mobile dari landing page sampai koleksi stamp.
- Izin kamera diberikan/ditolak.
- QR aktif dan QR tidak aktif.
- Navigasi ke halaman produk/program dan tantangan scrolling empat detik.
- Refresh dan login ulang tidak menghilangkan progres.
- Animasi, suara, mute, dan reduced motion.
- Tampilan responsif dan konsistensi visual dengan website asli.
- Error network, token invalid, event berakhir, dan stok habis.

### 11.4 Simulasi skala

Uji setidaknya 100 akun uji dan scan bersamaan. Verifikasi:

- Semua akun mempunyai satu player game per event.
- Setiap akun memiliki empat assignment berbeda.
- Tidak ada stamp duplikat.
- Stamp count tidak melebihi empat.
- Klaim tidak melebihi stok.
- Tidak ada kebocoran progres antar akun.
- Error rate dan waktu respons masih dapat diterima untuk event.

Jangan membuat 100 akun produksi palsu untuk test. Gunakan environment test/staging dan data sintetis.

### 11.5 Regression tests

- Semua route lama masih tersedia.
- Semua halaman lama masih dirender.
- Tidak ada fitur PRD lama yang hilang atau berubah perilakunya.
- Form, navigasi, CTA, auth, dan integrasi lama tetap bekerja.
- Screenshot atau visual comparison pada halaman penting tidak menunjukkan perubahan desain yang tidak diminta.

---

## 12. ACCEPTANCE CRITERIA — DEFINISI SELESAI

Fitur hanya boleh dinyatakan selesai apabila seluruh kriteria yang relevan berikut terpenuhi:

- [ ] PRD lama dan repository telah diaudit sebelum perubahan.
- [ ] Desain dan fitur website lama dipertahankan.
- [ ] Entry point Find My Polo terintegrasi dengan navigasi yang sesuai.
- [ ] Email/password auth berjalan sesuai sistem yang ada.
- [ ] Verifikasi email diwajibkan sebelum mulai bermain.
- [ ] Sepuluh QR event terkonfigurasi dengan benar.
- [ ] Setiap akun mendapatkan empat QR aktif yang disimpan sekali per event.
- [ ] Assignment tidak berubah karena scan, refresh, logout/login, atau pindah perangkat.
- [ ] QR aktif menghasilkan maksimal satu stamp per akun.
- [ ] QR tidak aktif tidak memberi stamp dan mengarahkan pengguna ke halaman produk/program.
- [ ] Scroll challenge membutuhkan minimal empat detik dan gerakan scroll yang memenuhi aturan.
- [ ] Penyelesaian challenge membuka scan berikutnya tanpa mengacak ulang assignment.
- [ ] Progres tersimpan dan berasal dari database.
- [ ] Animasi dan suara stamp/stiker bekerja dengan kontrol mute dan reduced-motion support.
- [ ] Ambang 2/3/4 stamp diterapkan dengan benar.
- [ ] Klaim hadiah terpisah dari stamp dan tidak bisa diredeem dua kali.
- [ ] RLS, server validation, unique constraints, dan transaksi sudah diterapkan.
- [ ] Secret tidak masuk frontend atau Git.
- [ ] Unit/integration/E2E tests yang relevan lulus.
- [ ] Build production lulus.
- [ ] Pengujian 100 akun sintetis lulus untuk integritas data.
- [ ] Tidak ada regression pada halaman/fitur lama.
- [ ] Dokumentasi konfigurasi, migration, deployment, dan rollback tersedia.
- [ ] Seluruh hal yang belum selesai dinyatakan secara jujur.

---

## 13. DEPLOYMENT DAN ROLLBACK

- Ikuti proses deployment yang sudah digunakan website OmahPala.
- Gunakan environment terpisah untuk development/staging dan production.
- Jalankan migration yang sudah direview; jangan melakukan perubahan schema produksi secara manual tanpa dokumentasi.
- Periksa variabel environment sebelum deploy. Jangan pernah mencetak nilai secret ke log.
- Verifikasi auth redirect URLs dan URL callback untuk domain yang benar.
- Pastikan halaman game tidak aktif sebelum event dibuka jika event belum siap.
- Siapkan rollback plan untuk frontend dan migration. Hindari migration destruktif; gunakan pola expand/contract jika perubahan schema berisiko.
- Setelah deploy, lakukan smoke test untuk login, start game, scan, scroll challenge, stamp, dan reward claim.

---

## 14. OUTPUT YANG WAJIB DIBERIKAN CODING AGENT

Setelah implementasi, berikan laporan dengan format:

1. **Audit awal:** stack, struktur, PRD, fitur yang terdampak.
2. **Ringkasan implementasi:** fitur Find My Polo yang benar-benar dibuat.
3. **Daftar file:** file baru, file diubah, file yang sengaja tidak diubah.
4. **Database:** migration, tabel/constraint/index, RLS policies, server functions/RPC.
5. **Security:** validasi, anti-duplikasi, rate limit, proteksi hadiah, dan keterbatasan QR statis.
6. **Testing:** perintah yang dijalankan dan hasil aktualnya. Jangan mengklaim test lulus jika tidak dijalankan.
7. **Environment/deployment:** nama variabel yang dibutuhkan, langkah konfigurasi, migration, deploy, dan rollback. Jangan menampilkan nilai secret.
8. **Manual QA:** langkah untuk menguji QR aktif, QR tidak aktif, scrolling empat detik, tiga stamp, dan redeem.
9. **Known limitations:** integrasi yang belum dikonfigurasi, akses yang belum tersedia, dan keputusan bisnis yang masih perlu diisi.
10. **Regression check:** konfirmasi berdasarkan test bahwa desain dan fitur lama tidak diubah.

---

## 15. KEPUTUSAN YANG HARUS DIBUAT CONFIGURABLE, BUKAN DIASUMSIKAN

Jika informasi berikut belum tersedia di PRD atau repository, buat konfigurasi yang aman dan laporkan kebutuhan keputusan kepada pemilik proyek:

- ID/slug event dan tanggal mulai/selesai.
- URL halaman produk/program yang digunakan untuk challenge.
- Apakah hadiah kecil dan stiker fisik dapat diklaim bersamaan.
- Jumlah stok masing-masing hadiah.
- Apakah klaim membutuhkan login panitia dan halaman admin khusus.
- Desain final dan aset stiker resmi OmahPala.
- Durasi/ketentuan event dan aturan jika event berakhir saat pengguna sedang bermain.
- Kebijakan privasi, retensi scan log, dan retensi data peserta.

Jangan menghentikan seluruh implementasi karena aset stiker belum tersedia; gunakan dummy asset yang jelas dan mudah diganti. Namun, jangan mengarang stok atau kebijakan hadiah yang belum diputuskan.

---

## 16. INSTRUKSI PENUTUP

Mulai dengan **audit repository dan PRD**, bukan langsung menulis ulang aplikasi. Setelah memahami pola yang sudah ada, implementasikan Find My Polo sebagai penambahan fitur yang terisolasi dan terintegrasi.

Prioritas utama, secara berurutan:

1. Tidak merusak desain atau fitur OmahPala yang sudah ada.
2. Menjaga aturan permainan konsisten: sepuluh QR fisik, empat QR aktif per akun, assignment tetap, dan enam QR lainnya memicu product discovery dengan scroll minimal empat detik.
3. Menjaga keamanan dan integritas database: stamp, challenge, dan klaim hadiah diputuskan di backend.
4. Menyediakan pengalaman mobile yang halus dan aksesibel.
5. Memastikan test, dokumentasi, deployment, dan rollback dapat dipertanggungjawabkan.

**Jangan melakukan redesign, refactor besar, migrasi stack, atau penghapusan fitur lama sebagai bagian dari tugas ini. Jika suatu perubahan di luar cakupan benar-benar diperlukan, jelaskan alasannya dan minta persetujuan sebelum melakukannya.**
