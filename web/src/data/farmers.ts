import type { Farmer } from '@/types'
import { farmerPhoto } from '@/lib/images'

// Data contoh — ganti dengan data penanam sesungguhnya dari tim PPK Ormawa/TOGA BERDAYA.
export const farmersSeed: Farmer[] = [
  {
    id: 'f-01',
    name: 'Pak Sutrisno',
    role: 'Ketua Kelompok Tani Pala Makmur',
    photo: farmerPhoto('f-01'),
    joinedAt: '2022-03-01',
    plotIds: ['p-01', 'p-02', 'p-04'],
  },
  {
    id: 'f-02',
    name: 'Bu Sriyati',
    role: 'Penanggung jawab TOGA Corner',
    photo: farmerPhoto('f-02'),
    joinedAt: '2022-06-15',
    plotIds: ['p-03'],
  },
  {
    id: 'f-03',
    name: 'Pak Wahono',
    role: 'Penanam & pengolah produksi herbal',
    photo: farmerPhoto('f-03'),
    joinedAt: '2023-01-20',
    plotIds: ['p-04'],
  },
  {
    id: 'f-04',
    name: 'Bu Marni',
    role: 'Penanam pala & kader posyandu',
    photo: farmerPhoto('f-04'),
    joinedAt: '2023-04-10',
    plotIds: ['p-05'],
  },
]
