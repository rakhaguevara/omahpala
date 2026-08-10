# design.md — PalaBerdaya

Sistem desain untuk website PalaBerdaya, hasil pembedahan export Framer `palaberdaya.framer.website` dan diterjemahkan ke Next.js + Tailwind + Motion.

Dokumen ini adalah sumber kebenaran. Kalau kode dan dokumen ini berbeda, dokumen ini yang menang.

---

## 1. Arah desain

Situs ini punya dua penonton yang menuntut hal berbeda. Buyer internasional butuh terlihat profesional dan kredibel. Penilai program butuh terlihat berdampak dan membumi. Arahnya: **studio-grade minimal dengan bukti lapangan.**

Artinya: kanvas putih dan abu netral yang tenang, satu hijau terang sebagai penanda aksi, dan foto lapangan asli yang dibiarkan besar dan penuh. Grafis dan ilustrasi tidak boleh mengambil panggung dari foto. Kalau ragu antara menambah ornamen atau memperbesar foto, perbesar fotonya.

**Elemen tanda tangan:** sistem *pill* — navbar melayang, semua tombol, semua chip filter, dan caption di atas foto semuanya berbentuk kapsul penuh (`radius: 100px`). Satu bentuk yang diulang konsisten di seluruh situs, jadi antarmukanya langsung dikenali. Tidak ada bentuk lain yang boleh meniru radius ini.

---

## 2. Warna

```css
:root {
  /* Inti — dari brief */
  --ink:            #212121;   /* teks utama, latar section gelap */
  --accent:         #7EEA57;   /* aksi, sorotan, penanda aktif */
  --paper:          #FFFFFF;   /* latar utama */

  /* Turunan — hasil ekstraksi dari file Framer */
  --ink-2:          #282828;   /* kartu di atas latar gelap */
  --muted:          #636363;   /* teks sekunder & paragraf */
  --muted-2:        #7B7B7B;   /* caption, label meta */
  --surface:        #F5F5F5;   /* latar section terang alternatif */
  --surface-2:      #F9F9F9;   /* kartu di atas latar putih */
  --line:           #EBEBEB;   /* garis pembatas di terang */
  --line-dark:      rgba(255,255,255,.12);  /* garis pembatas di gelap */

  /* Aksen turunan */
  --accent-ink:     #163B0A;   /* teks di atas --accent, kontras 8.9:1 */
  --accent-soft:    rgba(126,234,87,.14);   /* latar badge */
}
```

### Aturan pemakaian aksen

`--accent` adalah warna paling terang di halaman. Kalau dipakai di mana-mana, tidak ada yang menonjol. Batasnya:

- **Boleh:** tombol utama, chip tab yang aktif, satu kata yang disorot dalam judul, ikon centang pada daftar, garis indikator progres.
- **Tidak boleh:** latar section penuh, warna teks paragraf, hover pada seluruh kartu, border kartu.
- Maksimal **satu tombol aksen per viewport**. Aksi sekunder pakai pill `--ink` (di terang) atau putih (di gelap).

> **Peringatan kontras.** `#7EEA57` di atas putih hanya 1,6:1. Jangan pernah dipakai sebagai warna teks di atas putih. Teks di atas aksen harus `--accent-ink` atau `--ink`, tidak pernah putih.

### Irama section

Halaman berselang-seling untuk memberi ritme, bukan acak:

```
Hero        gelap (foto + overlay)
Pengantar   putih
Pilar       --surface
Layanan     --ink                    ← blok gelap besar, satu kali saja
Mengapa     putih
Statistik   putih, dipisah garis --line
CTA         gelap (foto + overlay)
Produk      --surface
Footer      gelap (foto + overlay) dengan kartu putih di atasnya
```

Overlay di atas foto: `linear-gradient(180deg, rgba(33,33,33,.55) 0%, rgba(33,33,33,.75) 100%)`. Konsisten, jangan diatur per gambar.

---

## 3. Tipografi

Tiga peran, dua typeface. Keduanya tersedia di Google Fonts dan `next/font`.

| Peran | Typeface | Kenapa |
|---|---|---|
| Display — judul H1–H3 | **Geist** | Grotesque geometris dengan aperture tertutup; tegas tanpa terasa korporat. Sama dengan file Framer aslinya. |
| Body & UI — paragraf, tombol, label | **Instrument Sans** | Lebih hangat dan sedikit sempit; enak dibaca pada 15–16px dan tidak bertabrakan dengan Geist. |
| Angka & meta | **Geist**, `font-variant-numeric: tabular-nums` | Angka statistik harus rata saat menghitung naik. |

```ts
import { Geist, Instrument_Sans } from "next/font/google";

export const geist = Geist({
  subsets: ["latin"], variable: "--font-display", display: "swap",
});
export const instrument = Instrument_Sans({
  subsets: ["latin"], variable: "--font-body", display: "swap",
});
```

### Skala

Diambil dari ukuran yang benar-benar dipakai di file Framer, dirapikan jadi skala yang bisa dipertahankan. Semua fluid dengan `clamp()`.

| Token | Ukuran | Weight | Tracking | Leading | Dipakai untuk |
|---|---|---|---|---|---|
| `display-xl` | `clamp(2.5rem, 6vw, 3.8rem)` | 600 | `-0.03em` | 1.02 | H1 hero |
| `display-l` | `clamp(2rem, 4.5vw, 3rem)` | 600 | `-0.02em` | 1.08 | Judul section |
| `display-m` | `clamp(1.5rem, 3vw, 2.25rem)` | 600 | `-0.02em` | 1.15 | Sub-judul, angka statistik |
| `title` | `1.375rem` | 500 | `-0.01em` | 1.25 | Judul kartu |
| `body-l` | `1.0625rem` | 400 | `0` | 1.6 | Paragraf pengantar |
| `body` | `0.9375rem` | 400 | `0` | 1.65 | Paragraf umum |
| `label` | `0.875rem` | 500 | `0` | 1.4 | Tombol, chip, nav |
| `eyebrow` | `0.75rem` | 500 | `0.12em` | 1.3 | Label di atas judul, UPPERCASE |
| `meta` | `0.8125rem` | 400 | `0` | 1.5 | Caption, footnote |

### Aturan tipografi

- Judul memakai `text-balance`, paragraf memakai `text-pretty`.
- Lebar baris paragraf maksimal 68 karakter (`max-w-[62ch]`).
- Sorotan dalam judul dilakukan dengan **warna** (`--accent`), bukan dengan bold atau italic. Maksimal satu frasa per judul.
- Eyebrow selalu didahului titik kecil berwarna aksen (6px, radius penuh) dengan jarak 8px.
- Jangan pernah menaruh teks langsung di atas foto tanpa overlay.

---

## 4. Ruang & bentuk

### Radius — dari file Framer

```css
--r-pill:  100px;  /* tombol, chip, navbar, badge — bentuk tanda tangan */
--r-lg:    40px;   /* kartu besar, blok section, panel gambar */
--r-md:    20px;   /* kartu produk, kartu layanan */
--r-sm:    10px;   /* thumbnail, input, tag kecil */
--r-none:  0px;    /* gambar full-bleed */
```

Empat nilai ini saja. Tidak ada `24px`, `12px`, atau `rounded-xl` bawaan Tailwind.

### Spacing

Skala kelipatan 10 sesuai file asli, dipetakan ke Tailwind:

```
10px → space-2.5   20px → space-5    30px → space-7.5
40px → space-10    60px → space-15   80px → space-20
```

- Padding vertikal section: `clamp(80px, 10vw, 140px)`
- Padding horizontal halaman: `clamp(20px, 5vw, 80px)`
- Lebar konten maksimal: `1280px`
- Jarak antar kartu dalam grid: `20px`
- Jarak dalam kartu: `30px`

### Grid

12 kolom di desktop, 6 di tablet, 4 di mobile. Gutter tetap `20px`.

Titik henti: `sm 640` · `md 768` · `lg 1024` · `xl 1280`

---

## 5. Komponen

### Pill Button

```
Primary    bg --accent    · teks --accent-ink · padding 12px 24px · radius pill
Dark       bg --ink       · teks putih        · sama
Light      bg putih       · teks --ink        · sama
Ghost      transparan     · border 1px --line · teks --ink
```

Semua ukuran teks `label`. Hover: gelapkan latar 6% dan naikkan `translateY(-1px)`. Tombol ikon-saja berbentuk lingkaran 44px.

### Floating Navbar

Pill putih melayang `top: 20px`, `max-width: 1120px`, di tengah, `backdrop-filter: blur(12px)`, `background: rgba(255,255,255,.86)`, bayangan `0 4px 24px rgba(0,0,0,.08)`. Isi: logo kiri, menu tengah, tombol aksen "Hubungi Kami" kanan.

Saat scroll melewati 80px: padding vertikal menyusut dari 14px ke 10px, bayangan menguat. Di mobile jadi tombol hamburger yang membuka panel penuh.

### Kartu produk

Latar `--surface-2`, radius `--r-md`, padding 30px. Foto produk di kanan dengan latar transparan, teks di kiri. Baris statistik memakai angka besar + label kecil. Tombol "Pesan Sekarang" varian Dark di kiri bawah.

Hover: bayangan naik ke `0 8px 32px rgba(0,0,0,.08)`, foto membesar 3%. Tidak ada perubahan warna border.

### Kartu di section gelap

Latar `--ink-2`, border `1px solid --line-dark`, radius `--r-md`. Ikon aksen di atas, judul, deskripsi `--muted-2`, tombol Ghost putih, ilustrasi garis di dasar kartu dengan opacity 0.5.

### Chip tab

Pill dengan border `--line`, latar transparan. Saat aktif: latar `--ink`, teks putih, ikon menjadi `--accent`. Deretan chip bisa digulir horizontal di mobile tanpa scrollbar terlihat.

### Band statistik

Empat kolom dipisah garis vertikal `--line`. Tiap kolom: ikon garis tipis, angka `display-m`, label `meta` dengan warna `--muted`. Di mobile jadi 2×2.

---

## 6. Motion

File Framer memakai **satu easing untuk semuanya**: `cubic-bezier(.44,0,.56,1)` dengan durasi `400ms`. Pertahankan — itu yang membuat situsnya terasa satu tangan.

```ts
export const ease = [0.44, 0, 0.56, 1] as const;

export const dur = {
  fast: 0.2,    // hover, perubahan warna
  base: 0.4,    // standar — transisi, tab, reveal
  slow: 0.8,    // masuk hero, elemen besar
};
```

### Pola yang perlu ditiru dari Framer

| Pola Framer | Padanan Motion | Catatan |
|---|---|---|
| Appear on scroll | `whileInView` + `viewport={{ once: true, amount: 0.25 }}` | `opacity 0→1`, `y 24→0`, `duration: base` |
| Stagger children | `staggerChildren: 0.08` pada parent | Maksimal 6 anak; lebih dari itu terasa lambat |
| Ticker / marquee | `animate={{ x: ['0%','-50%'] }}` linear, `repeat: Infinity` | Duplikat isi persis dua kali agar mulus |
| Counter angka | `useMotionValue` + `animate` + `useTransform` | Jalankan saat masuk viewport, sekali saja |
| Tab panel | `AnimatePresence mode="wait"` | Keluar `opacity→0` 200ms, masuk `y 12→0` 400ms |
| Carousel | `drag="x"` + `dragConstraints` | Tombol panah di kanan atas section |
| Hero parallax | `useScroll` + `useTransform` pada `y` gambar | Maksimal 12% pergeseran — lebih dari itu bikin pusing |

### Batasan

- Satu momen animasi besar per halaman: urutan masuk hero. Sisanya reveal yang tenang.
- Reveal hanya sekali (`once: true`). Elemen yang beranimasi ulang setiap kali di-scroll terasa murah.
- Jangan animasikan `width`, `height`, `top`, atau `left`. Hanya `transform` dan `opacity`.
- Hormati `prefers-reduced-motion`: matikan semua reveal dan parallax, sisakan transisi warna.

```ts
const reduce = useReducedMotion();
const reveal = reduce
  ? { initial: {}, whileInView: {} }
  : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 } };
```

---

## 7. Foto

Tulang punggung visual situs ini. Aturannya:

- **Rasio:** hero `21:9`, kartu produk `1:1`, kegiatan `4:5` (potret, memberi ruang untuk orang), band gambar `16:9`.
- **Perlakuan:** tanpa filter, tanpa duotone, tanpa gradasi hijau. Foto asli apa adanya. Yang menyatukan tampilan adalah radius dan overlay, bukan filter.
- **Isi:** utamakan foto yang ada orangnya — petani, warga, tim, proses produksi. Foto produk boleh bersih di latar polos, foto lapangan jangan.
- **Teknis:** `next/image` dengan `sizes` eksplisit, `placeholder="blur"`, dan `priority` hanya pada gambar hero.

---

## 8. Yang harus dihindari

Checklist saat review desain:

- [ ] Aksen hijau dipakai lebih dari satu tombol dalam satu layar
- [ ] Teks hijau di atas latar putih
- [ ] Radius di luar empat nilai yang ditentukan
- [ ] Easing atau durasi selain yang ada di bagian 6
- [ ] Reveal yang berulang setiap scroll
- [ ] Gradient sebagai latar section (foto atau warna solid saja)
- [ ] Ikon dengan gaya bercampur — pilih satu set garis tipis, `stroke-width: 1.5`
- [ ] Teks placeholder Lorem ipsum atau sisa teks template bahasa Inggris yang tidak relevan
- [ ] Bayangan berwarna
- [ ] Lebih dari satu blok section gelap besar dalam satu halaman

---

## 9. Peta Tailwind

```css
@theme {
  --color-ink: #212121;
  --color-ink-2: #282828;
  --color-accent: #7EEA57;
  --color-accent-ink: #163B0A;
  --color-muted: #636363;
  --color-muted-2: #7B7B7B;
  --color-surface: #F5F5F5;
  --color-surface-2: #F9F9F9;
  --color-line: #EBEBEB;

  --radius-pill: 100px;
  --radius-lg: 40px;
  --radius-md: 20px;
  --radius-sm: 10px;

  --font-display: var(--font-display);
  --font-body: var(--font-body);

  --ease-brand: cubic-bezier(0.44, 0, 0.56, 1);
}
```

---

## 10. Struktur komponen

```
components/
  ui/           Button, Pill, Chip, Badge, Input, Textarea, Select
  layout/       Navbar, Footer, Section, Container
  motion/       Reveal, Stagger, Marquee, CountUp, TabPanel
  blocks/       Hero, IntroBlock, PillarTabs, ServiceGrid, StatBand,
                ProductCard, ProductGrid, EcosystemDiagram, CtaBand
  admin/        DataTable, FormField, ImageUploader, StatusBadge
```

Aturan: komponen di `blocks/` boleh tahu tentang konten. Komponen di `ui/` dan `motion/` tidak boleh — mereka hanya menerima props.
