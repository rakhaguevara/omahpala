-- ROLLBACK Find My Polo — DESTRUKTIF: menghapus SEMUA data permainan (pemain, stamp, klaim, stok, audit).
-- Jalankan manual (SQL Editor) hanya setelah backup. Sengaja TIDAK ada di folder migrations/ agar
-- tidak ikut terjalankan otomatis oleh `supabase db push`.
--
-- Rollback ringan tanpa kehilangan data: set event ke 'ended' atau 'draft' (admin → QR & stok), atau
-- hapus tautan "Find My Polo" dari navigasi. Rollback frontend cukup redeploy commit sebelumnya.

begin;

drop function if exists
  public.fmp_admin_rotate_tokens(text, boolean),
  public.fmp_admin_set_inventory(text, text, integer),
  public.fmp_admin_set_destination(text, integer, text),
  public.fmp_admin_set_qr_status(text, integer, text),
  public.fmp_admin_set_event_status(text, text),
  public.fmp_admin_list_qrs(text),
  public.fmp_admin_stats(text),
  public.fmp_admin_cancel_claim(text),
  public.fmp_redeem_reward(text),
  public.fmp_lookup_claim(text),
  public.fmp_normalize_code(text),
  public.fmp_staff_role(),
  public.fmp_create_reward_claim(text, text),
  public.fmp_gen_claim_code(),
  public.fmp_complete_challenge(uuid, integer, integer, integer),
  public.fmp_begin_challenge(uuid),
  public.fmp_scan_qr(text, text),
  public.fmp_start_game(text),
  public.fmp_get_progress(text),
  public.fmp_build_progress(uuid),
  public.fmp_audit(text, text, text, jsonb),
  public.fmp_event_is_open(public.game_events),
  public.fmp_assert_staff(boolean),
  public.fmp_assert_user(),
  public.fmp_cfg_int(jsonb, text[], integer);

drop table if exists
  public.game_audit_log,
  public.game_staff,
  public.reward_claims,
  public.reward_inventory,
  public.scroll_challenges,
  public.player_stamps,
  public.scan_attempts,
  public.player_qr_assignments,
  public.player_games,
  public.game_qrs,
  public.game_events;

-- Dihapus terakhir: masih dipakai trigger pada tabel di atas sampai tabelnya hilang.
drop function if exists public.fmp_touch_updated_at();

commit;
