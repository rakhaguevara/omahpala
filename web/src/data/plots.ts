import type { Plot, PlotCalendarEntry } from '@/types'
import { plotPhoto } from '@/lib/images'

// Data contoh — ganti dengan data lahan sesungguhnya (koordinat GPS presisi dari tim lapangan,
// deskripsi & kalender tanam/panen dari kelompok tani). commodities pakai CommodityId dari
// data/commodities.ts (bukan teks bebas lagi) supaya bisa dikelompokkan per section di halaman
// Kebun. Kalender tanam/panen ('lainnya' sengaja tidak diberi kalender — bukan komoditas spesifik)
// dipakai buyer di halaman detail lahan untuk mengira-ngira kapan stok tersedia.
const palaCalendar: PlotCalendarEntry = { commodityId: 'pala', plantingMonths: [10, 11], harvestMonths: [7, 8, 9] }

export const plotsSeed: Plot[] = [
  {
    id: 'p-01',
    code: 'WNK-A1',
    name: 'Kebun Pala Ngasem',
    areaM2: 4200,
    commodities: ['pala', 'lainnya'],
    status: 'aktif',
    farmerIds: ['f-01'],
    lat: -7.6631,
    lng: 110.4203,
    photo: plotPhoto('p-01'),
    descriptionId:
      'Lahan pala tertua di kelompok tani, berundak di lereng utara Dusun Ngasem. Pohon pala berumur 15–20 tahun, dipanen manual dua kali seminggu selama musim panen.',
    descriptionEn:
      'The farmer group’s oldest nutmeg plot, terraced on the northern slope of Dusun Ngasem. Trees are 15–20 years old, hand-picked twice a week during harvest season.',
    calendar: [palaCalendar],
  },
  {
    id: 'p-02',
    code: 'WNK-A2',
    name: 'Kebun Pala Sendang',
    areaM2: 3100,
    commodities: ['pala'],
    status: 'panen',
    farmerIds: ['f-01'],
    lat: -7.6608,
    lng: 110.4227,
    photo: plotPhoto('p-02'),
    descriptionId:
      'Berdekatan dengan mata air Sendang, lahan ini punya tanah paling lembap di antara kebun pala Wonokerto — cocok untuk pohon pala muda yang baru mulai berbuah.',
    descriptionEn:
      'Sitting next to the Sendang spring, this plot has the moistest soil among Wonokerto’s nutmeg gardens — well suited to young trees that have just started fruiting.',
    calendar: [palaCalendar],
  },
  {
    id: 'p-03',
    code: 'WNK-B1',
    name: 'TOGA Corner Balai Desa',
    areaM2: 850,
    commodities: ['jahe', 'kunyit', 'sereh', 'kencur'],
    status: 'aktif',
    farmerIds: ['f-02'],
    lat: -7.6645,
    lng: 110.4188,
    photo: plotPhoto('p-03'),
    descriptionId:
      'Kebun percontohan TOGA di halaman balai desa — empat rimpang ditanam bergiliran dalam bedengan kecil supaya warga bisa belajar langsung sebelum menerapkannya di pekarangan sendiri.',
    descriptionEn:
      'The village hall’s demonstration herb garden — four rhizome crops rotate through small raised beds so residents can learn the practice before applying it in their own yards.',
    calendar: [
      { commodityId: 'jahe', plantingMonths: [10, 11], harvestMonths: [6, 7, 8] },
      { commodityId: 'kunyit', plantingMonths: [10, 11], harvestMonths: [7, 8] },
      { commodityId: 'sereh', plantingMonths: [9, 10], harvestMonths: [1, 2, 3, 6, 7, 8] },
      { commodityId: 'kencur', plantingMonths: [10], harvestMonths: [6, 7] },
    ],
  },
  {
    id: 'p-04',
    code: 'WNK-A3',
    name: 'Kebun Pala Krajan',
    areaM2: 5600,
    commodities: ['pala'],
    status: 'aktif',
    // Lahan terluas — dirawat bersama oleh dua penanam, dipakai sebagai contoh tampilan
    // multi-penanam di halaman detail lahan.
    farmerIds: ['f-03', 'f-01'],
    lat: -7.6592,
    lng: 110.4251,
    photo: plotPhoto('p-04'),
    descriptionId:
      'Lahan pala terluas di Wonokerto, dirawat bersama oleh dua kelompok tani karena luasnya. Tanah vulkanik di kaki bukit Krajan menghasilkan biji pala dengan kadar minyak atsiri tinggi.',
    descriptionEn:
      'Wonokerto’s largest nutmeg plot, jointly tended by two grower groups given its size. Volcanic soil at the foot of Krajan hill yields nutmeg seed with a high essential-oil content.',
    calendar: [palaCalendar],
  },
  {
    id: 'p-05',
    code: 'WNK-A4',
    name: 'Kebun Pala Gunung',
    areaM2: 2800,
    commodities: ['pala', 'lainnya'],
    status: 'istirahat',
    farmerIds: ['f-04'],
    lat: -7.6669,
    lng: 110.4212,
    photo: plotPhoto('p-05'),
    descriptionId:
      'Lahan tertinggi dari permukaan laut di antara kebun binaan program, sedang diistirahatkan setelah panen besar tahun lalu untuk menjaga kesuburan tanah sebelum siklus tanam berikutnya.',
    descriptionEn:
      'The highest-elevation plot among the program’s gardens, currently resting after last year’s large harvest to preserve soil fertility ahead of the next planting cycle.',
    calendar: [palaCalendar],
  },
]
