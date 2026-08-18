import type { ProgramMilestone, ProgramPillar, StatItem } from '@/types'

// Lima pilar — PRD §7.3 PR-01
export const programPillars: ProgramPillar[] = [
  {
    id: 'screening',
    icon: 'screening',
    titleId: 'Skrining & Edukasi',
    titleEn: 'Screening & Education',
    descriptionId:
      'Pemeriksaan kesehatan berkala dan edukasi pencegahan penyakit tidak menular bagi warga Desa Wonokerto, sebagai pintu masuk program.',
    descriptionEn:
      'Regular health screening and non-communicable disease prevention education for Wonokerto residents — the program’s entry point.',
    pointsId: [
      'Skrining tekanan darah & gula darah rutin',
      'Edukasi pola makan berbasis TOGA',
      'Pelatihan kader kesehatan desa',
    ],
    pointsEn: [
      'Routine blood pressure & glucose screening',
      'TOGA-based nutrition education',
      'Village health cadre training',
    ],
    image: 'https://picsum.photos/seed/toga-screening/1000/1250',
  },
  {
    id: 'cultivation',
    icon: 'cultivation',
    titleId: 'Budidaya & Standardisasi',
    titleEn: 'Cultivation & Standardization',
    descriptionId:
      'Pendampingan budidaya pala dan tanaman obat keluarga dengan standar mutu yang konsisten, dari bibit hingga panen.',
    descriptionEn:
      'Cultivation support for nutmeg and family medicinal plants with consistent quality standards, from seedling to harvest.',
    pointsId: [
      'Pemetaan lahan & pencatatan komoditas per petak',
      'SOP budidaya disusun bersama SPI dan KWT',
      'Pengeringan dengan alat pendeteksi kematangan (TTG) agar mutu konsisten antar panen',
    ],
    pointsEn: [
      'Plot mapping & per-plot commodity records',
      'Cultivation SOPs drafted with SPI and KWT (farmer groups)',
      'Drying with a ripeness-detection tool (TTG) for consistent quality across harvests',
    ],
    image: 'https://picsum.photos/seed/toga-cultivation/1000/1250',
  },
  {
    id: 'production',
    icon: 'production',
    titleId: 'Produksi Herbal',
    titleEn: 'Herbal Production',
    descriptionId:
      'Pengolahan hasil kebun menjadi produk bernilai tambah — gummy, teh, sirup, hingga minyak atsiri — dengan proses higienis.',
    descriptionEn:
      'Processing harvest into value-added products — gummies, tea, syrup, essential oil — through a hygienic production process.',
    pointsId: [
      'Dapur produksi bersertifikat PIRT',
      'Pengembangan resep & uji rasa berkala',
      'Pelatihan kemasan siap jual',
    ],
    pointsEn: [
      'PIRT-certified production kitchen',
      'Recipe development & regular taste testing',
      'Market-ready packaging training',
    ],
    image: 'https://picsum.photos/seed/toga-production/1000/1250',
  },
  {
    id: 'economy',
    icon: 'economy',
    titleId: 'TOGA Corner & Ekonomi',
    titleEn: 'TOGA Corner & Local Economy',
    descriptionId:
      'Etalase TOGA Corner di balai desa sebagai titik jual sekaligus edukasi, memperkuat ekonomi warga penanam dan pengolah.',
    descriptionEn:
      'A TOGA Corner storefront at the village hall serving as both a sales point and education hub, strengthening growers’ and processors’ income.',
    pointsId: [
      'Titik jual produk olahan warga',
      'Pencatatan penjualan sederhana',
      'Pelatihan pemasaran dasar',
    ],
    pointsEn: [
      'Retail point for residents’ processed goods',
      'Simple sales bookkeeping',
      'Basic marketing training',
    ],
    image: 'https://picsum.photos/seed/toga-economy/1000/1250',
  },
  {
    id: 'monitoring',
    icon: 'monitoring',
    titleId: 'Monitoring & Keberlanjutan',
    titleEn: 'Monitoring & Sustainability',
    descriptionId:
      'Pemantauan capaian program secara berkala dan penyusunan rencana keberlanjutan setelah masa pendampingan PPK Ormawa berakhir.',
    descriptionEn:
      'Regular monitoring of program outcomes and a sustainability plan for after the PPK Ormawa mentorship period ends.',
    pointsId: [
      'Evaluasi capaian tiap triwulan',
      'Serah terima pengelolaan ke kelompok tani',
      'Dokumentasi kegiatan sebagai bukti dampak',
    ],
    pointsEn: [
      'Quarterly outcome evaluation',
      'Management handover to the farmer group',
      'Activity documentation as impact evidence',
    ],
    image: 'https://picsum.photos/seed/toga-monitoring/1000/1250',
  },
]

// Linimasa — PRD §7.3 PR-04.
// TOGA BERDAYA berjalan 5 bulan, Juni–Oktober 2026 (UX-WRITING.md §2 prinsip 5: tulis target
// sebagai target selama belum terverifikasi). "done" ditentukan relatif terhadap durasi itu,
// bukan tanggal karangan multi-tahun seperti versi sebelumnya.
export const programMilestones: ProgramMilestone[] = [
  {
    id: 'm-1',
    date: '2026-06',
    titleId: 'Pemetaan lahan & skrining kesehatan',
    titleEn: 'Plot mapping & health screening',
    descriptionId: 'Survei petak lahan pala dan skrining kesehatan tahap pertama bersama Puskesmas Turi.',
    descriptionEn: 'Nutmeg plot survey and first-phase health screening with Puskesmas Turi.',
    done: true,
  },
  {
    id: 'm-2',
    date: '2026-07',
    titleId: 'SOP tersusun, dapur produksi siap',
    titleEn: 'SOPs finalized, production kitchen ready',
    descriptionId: 'SOP budidaya dan pengolahan disusun bersama SPI dan KWT; dapur produksi mulai beroperasi.',
    descriptionEn: 'Cultivation and processing SOPs drafted with SPI and KWT; production kitchen becomes operational.',
    done: true,
  },
  {
    id: 'm-3',
    date: '2026-08',
    titleId: 'Produk pertama diproduksi',
    titleEn: 'First products produced',
    descriptionId: 'Teh, sirup, dan gummy daging buah pala diproduksi untuk pertama kali di TOGA Corner.',
    descriptionEn: 'Nutmeg fruit tea, syrup, and gummy produced for the first time at TOGA Corner.',
    done: false,
  },
  {
    id: 'm-4',
    date: '2026-09',
    titleId: 'TOGA Corner mulai berjualan',
    titleEn: 'TOGA Corner opens for sales',
    descriptionId: 'Etalase penjualan di balai desa dibuka untuk warga dan pembeli luar desa.',
    descriptionEn: 'The village-hall storefront opens to residents and outside buyers.',
    done: false,
  },
  {
    id: 'm-5',
    date: '2026-10',
    titleId: 'Evaluasi & serah terima keberlanjutan',
    titleEn: 'Evaluation & sustainability handover',
    descriptionId: 'Post-test capaian kesehatan dievaluasi; pengelolaan diserahkan ke kelompok tani dan TOGA Corner.',
    descriptionEn: 'Health outcome post-test evaluated; management handed over to the farmer group and TOGA Corner.',
    done: false,
  },
]

// Target program 2026 — PRD §7.1 H-07 & §7.3 PR-03.
// Angka ini TARGET dari proposal PPK Ormawa HIMFA 2026, bukan capaian terukur — jangan
// tampilkan tanpa label "Target Program 2026" (UX-WRITING.md §4.4).
export const programStats: StatItem[] = [
  { id: 's-1', value: 70, prefix: '40–', suffix: '', labelId: 'KK menanam TOGA di pekarangan', labelEn: 'households growing TOGA at home' },
  { id: 's-2', value: 2, suffix: '', labelId: 'SOP budidaya tersusun', labelEn: 'cultivation SOPs drafted' },
  { id: 's-3', value: 3, suffix: '', labelId: 'produk olahan daging buah pala', labelEn: 'nutmeg-fruit processed products' },
  { id: 's-4', value: 5, suffix: '', labelId: 'bulan pelaksanaan program', labelEn: 'months of program implementation' },
]

// Sorotan skrining kesehatan untuk kartu hero — angka INI PUNYA SUMBER (bukan target program
// sendiri), jadi dipisah dari programStats. Boleh dipakai di halaman Program/Beranda; JANGAN
// dipakai di halaman Produk (UX-WRITING.md §4.1 — produk tidak boleh bicara kesehatan).
export const healthScreeningHighlight = {
  stat1: { value: 2117, labelId: 'kasus PTM usia 41–60 tahun', labelEn: 'NCD cases, ages 41–60' },
  stat2: { value: 1662, labelId: 'kasus hipertensi terdata', labelEn: 'recorded hypertension cases' },
  sourceId: 'Data Puskesmas Turi, warga Desa Wonokerto',
  sourceEn: 'Puskesmas Turi data, Desa Wonokerto residents',
}
