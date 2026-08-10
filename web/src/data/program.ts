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
      'Standar operasional penanaman dan panen',
      'Pelatihan penanganan pascapanen',
    ],
    pointsEn: [
      'Plot mapping & per-plot commodity records',
      'Standard operating procedures for planting and harvest',
      'Post-harvest handling training',
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
      'Pemantauan capaian program secara berkala dan penyusunan rencana keberlanjutan setelah masa pendampingan PPKO berakhir.',
    descriptionEn:
      'Regular monitoring of program outcomes and a sustainability plan for after the PPKO mentorship period ends.',
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

// Linimasa — PRD §7.3 PR-04
export const programMilestones: ProgramMilestone[] = [
  {
    id: 'm-1',
    date: '2024-01',
    titleId: 'Pemetaan awal & skrining kesehatan',
    titleEn: 'Initial mapping & health screening',
    descriptionId: 'Survei lahan pala dan skrining kesehatan tahap pertama di 4 dusun.',
    descriptionEn: 'Nutmeg plot survey and first-phase health screening across 4 hamlets.',
    done: true,
  },
  {
    id: 'm-2',
    date: '2024-04',
    titleId: 'Dapur produksi & PIRT',
    titleEn: 'Production kitchen & PIRT',
    descriptionId: 'Dapur produksi herbal beroperasi, sertifikat PIRT untuk 4 produk pertama.',
    descriptionEn: 'Herbal production kitchen operational, PIRT certification for first 4 products.',
    done: true,
  },
  {
    id: 'm-3',
    date: '2024-09',
    titleId: 'TOGA Corner dibuka',
    titleEn: 'TOGA Corner opens',
    descriptionId: 'Etalase penjualan di balai desa resmi dibuka untuk warga dan pengunjung.',
    descriptionEn: 'Village hall retail storefront officially opened to residents and visitors.',
    done: true,
  },
  {
    id: 'm-4',
    date: '2025-06',
    titleId: 'Persiapan ekspor',
    titleEn: 'Export readiness',
    descriptionId: 'Penyusunan dokumen ekspor, uji kapasitas produksi, dan pencarian buyer awal.',
    descriptionEn: 'Export documentation, production capacity testing, and initial buyer outreach.',
    done: false,
  },
  {
    id: 'm-5',
    date: '2025-12',
    titleId: 'Serah terima keberlanjutan',
    titleEn: 'Sustainability handover',
    descriptionId: 'Pengelolaan penuh diserahkan ke kelompok tani & TOGA Corner Desa Wonokerto.',
    descriptionEn: 'Full management handed over to the Wonokerto farmer group & TOGA Corner.',
    done: false,
  },
]

// Statistik capaian — PRD §7.1 H-07 & §7.3 PR-03
export const programStats: StatItem[] = [
  { id: 's-1', value: 128, suffix: '', labelId: 'Warga terskrining', labelEn: 'Residents screened' },
  { id: 's-2', value: 5, suffix: '', labelId: 'Petak lahan terdaftar', labelEn: 'Registered plots' },
  { id: 's-3', value: 6, suffix: '', labelId: 'Produk olahan aktif', labelEn: 'Active processed products' },
  { id: 's-4', value: 24, suffix: '%', labelId: 'Kenaikan pendapatan penanam', labelEn: 'Grower income increase' },
]
