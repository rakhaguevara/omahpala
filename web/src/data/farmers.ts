import type { Farmer } from '@/types'

// Data contoh — ganti dengan data penanam sesungguhnya dari tim PPK Ormawa/TOGA BERDAYA.
export const farmersSeed: Farmer[] = [
  {
    id: 'f-01',
    name: 'Pak Sutrisno',
    role: 'Ketua Kelompok Tani Pala Makmur',
    photo: 'https://picsum.photos/seed/wonokerto-farmer-1/600/750',
    joinedAt: '2022-03-01',
    plotIds: ['p-01', 'p-02', 'p-04'],
  },
  {
    id: 'f-02',
    name: 'Bu Sriyati',
    role: 'Penanggung jawab TOGA Corner',
    photo: 'https://picsum.photos/seed/wonokerto-farmer-2/600/750',
    joinedAt: '2022-06-15',
    plotIds: ['p-03'],
  },
  {
    id: 'f-03',
    name: 'Pak Wahono',
    role: 'Penanam & pengolah produksi herbal',
    photo: 'https://picsum.photos/seed/wonokerto-farmer-3/600/750',
    joinedAt: '2023-01-20',
    plotIds: ['p-04'],
  },
  {
    id: 'f-04',
    name: 'Bu Marni',
    role: 'Penanam pala & kader posyandu',
    photo: 'https://picsum.photos/seed/wonokerto-farmer-4/600/750',
    joinedAt: '2023-04-10',
    plotIds: ['p-05'],
  },
]
