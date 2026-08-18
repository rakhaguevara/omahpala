import type { Article } from '@/types'

// Data contoh — artikel/kabar TOGA BERDAYA untuk beranda dan halaman detail artikel.
// Konten & foto di sini adalah placeholder yang perlu diverifikasi tim sebelum rilis nyata.
export const articles: Article[] = [
  {
    id: 'a-1',
    slug: 'panen-perdana-pala-wonokerto',
    titleId: 'Panen perdana pala di lahan binaan Wonokerto',
    titleEn: 'First harvest from the Wonokerto pilot plots',
    excerptId:
      'Kelompok tani mulai memanen pala dari petak binaan pertama, hasil pendampingan SOP budidaya bersama SPI dan KWT.',
    excerptEn:
      'The farmer group harvested nutmeg from the first pilot plots, the result of cultivation SOP mentoring with SPI and KWT.',
    contentId: [
      'Kelompok Tani Pala Makmur memulai panen perdana dari petak-petak binaan pertama program TOGA BERDAYA. Panen ini menjadi penanda bahwa SOP budidaya yang disusun bersama SPI dan KWT sejak awal program mulai diterapkan secara konsisten di lahan.',
      'Sebelum panen, tim pendamping melakukan pengecekan kematangan buah menggunakan alat pendeteksi (TTG) agar mutu bahan baku konsisten antar petak. Hasil panen ini akan diteruskan ke dapur produksi TOGA Corner untuk diolah menjadi produk olahan daging buah pala.',
      'Kelompok tani menargetkan siklus panen berikutnya melibatkan lebih banyak petak binaan seiring pendampingan SOP yang terus berjalan di Desa Wonokerto.',
    ],
    contentEn: [
      'Kelompok Tani Pala Makmur began its first harvest from the program’s pilot plots. The harvest marks the point where the cultivation SOP drafted with SPI and KWT started being applied consistently in the field.',
      'Before harvesting, the mentoring team checked fruit ripeness using a detection tool (TTG) to keep raw material quality consistent across plots. This harvest will move on to the TOGA Corner production kitchen to be processed into nutmeg fruit products.',
      'The farmer group is aiming for more pilot plots to be included in the next harvest cycle as SOP mentoring continues in Desa Wonokerto.',
    ],
    image: 'https://picsum.photos/seed/omahpala-article-harvest/900/650',
    categoryId: 'Budidaya',
    categoryEn: 'Cultivation',
    publishedAt: '2026-07-14',
  },
  {
    id: 'a-2',
    slug: 'dapur-produksi-pirt',
    titleId: 'Dapur produksi bersertifikat PIRT resmi beroperasi',
    titleEn: 'PIRT-certified production kitchen now operating',
    excerptId:
      'Dapur produksi TOGA Corner mengantongi sertifikat PIRT dan mulai mengolah daging buah pala menjadi teh dan sirup.',
    excerptEn:
      'The TOGA Corner production kitchen has secured its PIRT certificate and started turning nutmeg fruit flesh into tea and syrup.',
    contentId: [
      'Dapur produksi TOGA Corner resmi mengantongi sertifikat PIRT, menandai dimulainya produksi rutin olahan daging buah pala di Desa Wonokerto. Sertifikat ini menjadi syarat dasar sebelum produk bisa dijual lebih luas di luar desa.',
      'Dengan sertifikat ini, dapur produksi mulai mengolah daging buah pala menjadi teh dan sirup mengikuti SOP produksi yang disusun bersama tim TOGA BERDAYA. Setiap tahap produksi dicatat agar mutu tetap konsisten antar batch.',
      'Sertifikasi untuk produk gummy daging buah pala masih dalam proses dan akan diinformasikan setelah terbit.',
    ],
    contentEn: [
      'The TOGA Corner production kitchen has officially secured its PIRT certificate, marking the start of routine production of nutmeg fruit products in Desa Wonokerto. The certificate is a basic requirement before products can be sold more widely outside the village.',
      'With the certificate in hand, the kitchen has started processing nutmeg fruit flesh into tea and syrup, following the production SOP drafted with the TOGA BERDAYA team. Every production stage is logged to keep quality consistent across batches.',
      'Certification for the nutmeg fruit gummy is still in process and will be announced once issued.',
    ],
    image: 'https://picsum.photos/seed/omahpala-article-kitchen/900/650',
    categoryId: 'Produksi',
    categoryEn: 'Production',
    publishedAt: '2026-08-02',
  },
  {
    id: 'a-3',
    slug: 'skrining-kesehatan-tahap-dua',
    titleId: 'Skrining kesehatan tahap dua jangkau 200 warga',
    titleEn: 'Second-round health screening reaches 200 residents',
    excerptId:
      'Bersama Puskesmas Turi, tim TOGA BERDAYA melanjutkan skrining tekanan darah dan gula darah untuk warga usia produktif.',
    excerptEn:
      'Together with Puskesmas Turi, the TOGA BERDAYA team continued blood pressure and glucose screening for working-age residents.',
    contentId: [
      'Bersama Puskesmas Turi, tim TOGA BERDAYA melanjutkan skrining tahap kedua untuk memantau tekanan darah dan gula darah warga usia produktif Desa Wonokerto. Skrining ini menjadi bagian dari pemantauan berkala program, bukan diagnosis atau pengobatan.',
      'Warga yang mengikuti skrining tahap pertama diprioritaskan agar hasilnya bisa dibandingkan dari waktu ke waktu. Data hasil skrining dicatat oleh Puskesmas Turi dan digunakan untuk evaluasi capaian program pada tahap berikutnya.',
      'Skrining tahap berikutnya akan dijadwalkan menjelang evaluasi akhir program.',
    ],
    contentEn: [
      'Together with Puskesmas Turi, the TOGA BERDAYA team carried out its second round of screening to monitor blood pressure and blood glucose among working-age residents of Desa Wonokerto. This screening is part of the program’s regular monitoring, not diagnosis or treatment.',
      'Residents who took part in the first round were prioritized so results could be compared over time. Screening data is recorded by Puskesmas Turi and used to evaluate the program’s progress in later stages.',
      'The next round of screening will be scheduled ahead of the program’s final evaluation.',
    ],
    image: 'https://picsum.photos/seed/omahpala-article-screening/900/650',
    categoryId: 'Kesehatan',
    categoryEn: 'Health',
    publishedAt: '2026-08-10',
  },
]
