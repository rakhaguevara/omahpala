-- Prisma membuat public._prisma_migrations sebelum migration pertama. Di Supabase, tabel baru di
-- skema public otomatis bisa dibaca anon/authenticated lewat API. Kunci: RLS aktif tanpa policy +
-- cabut hak. Prisma tetap bisa memakainya karena terhubung sebagai pemilik tabel (bypass RLS).
-- `if exists` supaya aman di lingkungan tanpa Prisma (mis. tes PGlite).
do $$
begin
  if to_regclass('public._prisma_migrations') is not null then
    execute 'alter table public._prisma_migrations enable row level security';
    execute 'revoke all on public._prisma_migrations from anon, authenticated';
  end if;
end $$;
