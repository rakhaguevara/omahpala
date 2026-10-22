-- Verifikasi email dihapus dari Find My Polo: akun langsung bisa bermain setelah mendaftar.
--
-- fmp_assert_user() tidak lagi mensyaratkan auth.users.email_confirmed_at. Satu email hanya bisa
-- mendaftar sekali — itu ditegakkan Supabase Auth (email unik), bukan fungsi ini.
--
-- PENTING (di luar SQL): matikan "Confirm email" di Supabase Dashboard → Authentication →
-- Providers → Email. Tanpa itu, Supabase tetap menahan sesi sampai email dikonfirmasi.
-- Efek samping yang disadari: siapa pun bisa mendaftar memakai email orang lain (tanpa bukti
-- kepemilikan). Kerugian dibatasi stok hadiah dan kode klaim yang dicek petugas.

create or replace function public.fmp_assert_user() returns uuid
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'authentication_required';
  end if;
  return v_uid;
end $$;
