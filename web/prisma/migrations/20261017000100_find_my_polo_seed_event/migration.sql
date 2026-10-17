-- Event "find-my-polo" + 10 slot QR. Idempoten.
--
-- Event dibuat dalam status 'draft' tanpa tanggal: tanggal mulai/selesai dan stok hadiah adalah
-- keputusan pemilik event (prompt §15), jadi TIDAK diisi di sini. Atur lewat /admin/find-my-polo
-- atau SQL (lihat supabase/README.md).
--
-- token_hash diisi acak sehingga tidak ada QR yang bisa dipindai sebelum admin menjalankan
-- "Buat token QR" (fmp_admin_rotate_tokens), yang menghasilkan token cetak sekali pakai.
--
-- destination_path hanya menunjuk halaman yang SUDAH ADA (slug dari src/data/products.ts).

insert into public.game_events (slug, name, status)
values ('find-my-polo', 'Find My Polo', 'draft')
on conflict (slug) do nothing;

insert into public.game_qrs (event_id, label, token_hash, destination_path)
select e.id, d.label,
       encode(extensions.digest(extensions.gen_random_bytes(32), 'sha256'), 'hex'),
       d.path
from public.game_events e
cross join (values
  (1,  '/produk/teh-buah-pala'),
  (2,  '/produk/teh-rosella'),
  (3,  '/produk/wedang-bugar'),
  (4,  '/produk/wedang-jahe'),
  (5,  '/produk/wedang-telang'),
  (6,  '/produk/wedang-uwuh'),
  (7,  '/program'),
  (8,  '/produk'),
  (9,  '/program'),
  (10, '/produk')
) as d(label, path)
where e.slug = 'find-my-polo'
on conflict (event_id, label) do nothing;
