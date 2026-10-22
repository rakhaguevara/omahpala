-- Sistem baru: 5 QR dipakai, 3 di antaranya memberi stempel — TETAP untuk semua pemain (QR 1, 2, 3).
-- QR 4 dan 5 bukan stempel: dipindai → membuka halaman produk + tantangan scroll seperti sebelumnya.
-- QR 6–10 dinonaktifkan (tidak dipakai).
--
-- Token QR yang sudah dicetak TIDAK diubah: QR 1–5 yang ada tetap berlaku (migration ini tidak
-- memutar token). Stamp lama pada QR yang tidak lagi memberi stempel dibiarkan di tabel, tetapi
-- tidak dihitung lagi (lihat fmp_stamp_count).
--
-- Perubahan perilaku:
--   * fmp_start_game  : tidak lagi mengacak 4 dari 10; assignment = QR yang awards_stamp.
--   * fmp_scan_qr     : stamp diberikan bila QR awards_stamp (bukan lagi berdasarkan assignment acak).
--                       Respons 'inactive_for_player' kini menyertakan qr_label.
--   * hitungan stamp  : hanya QR awards_stamp (fmp_stamp_count).
--   * fmp_admin_rotate_tokens: QR berstatus 'disabled' dilewati.
--   * fmp_admin_identify_qr  : BARU, khusus panitia — cek nomor QR lewat kamera tanpa efek samping.

alter table public.game_qrs add column awards_stamp boolean not null default false;

update public.game_qrs q
   set awards_stamp = (q.label between 1 and 3),
       status = case when q.label > 5 and q.status = 'active' then 'disabled' else q.status end
  from public.game_events e
 where e.id = q.event_id and e.slug = 'find-my-polo';

update public.game_events
   set config = (config - 'active_per_player') || '{"qr_total": 5}'::jsonb
 where slug = 'find-my-polo';

-- Jumlah stamp pemain yang masih berlaku (hanya dari QR yang memberi stempel).
create function public.fmp_stamp_count(p_pg uuid) returns integer
language sql stable security definer set search_path = public, extensions as $$
  select count(*)::integer
    from public.player_stamps s
    join public.game_qrs q on q.id = s.qr_id
   where s.player_game_id = p_pg and q.awards_stamp
$$;

create or replace function public.fmp_build_progress(p_pg uuid) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_pg public.player_games;
  v_ev public.game_events;
  v_stamps integer;
  v_active integer;
  v_collected jsonb;
  v_rewards jsonb;
  v_challenge jsonb;
  v_unlock integer;
begin
  select * into v_pg from public.player_games where id = p_pg;
  select * into v_ev from public.game_events where id = v_pg.event_id;

  v_stamps := public.fmp_stamp_count(p_pg);
  select count(*) into v_active from public.game_qrs
    where event_id = v_pg.event_id and awards_stamp and status = 'active';
  select coalesce(jsonb_agg(q.label order by q.label), '[]'::jsonb) into v_collected
    from public.player_stamps s join public.game_qrs q on q.id = s.qr_id
    where s.player_game_id = p_pg and q.awards_stamp;
  v_unlock := public.fmp_cfg_int(v_ev.config, '{sticker_unlock_at}', 3);

  select coalesce(jsonb_agg(jsonb_build_object(
      'type', r.key,
      'min_stamps', (r.value ->> 'min_stamps')::integer,
      'eligible', v_stamps >= (r.value ->> 'min_stamps')::integer,
      'stock_configured', inv.event_id is not null,
      'available', coalesce(inv.total_quantity - inv.reserved_quantity - inv.redeemed_quantity > 0, false),
      'claim', case when c.id is null then null else jsonb_build_object(
          'status', c.status,
          'code', case when c.status = 'cancelled' then null else c.claim_code end
        ) end
    ) order by (r.value ->> 'min_stamps')::integer, r.key), '[]'::jsonb)
    into v_rewards
    from jsonb_each(coalesce(v_ev.config -> 'rewards', '{}'::jsonb)) r
    left join public.reward_inventory inv on inv.event_id = v_ev.id and inv.reward_type = r.key
    left join public.reward_claims c on c.player_game_id = p_pg and c.reward_type = r.key;

  select jsonb_build_object(
      'id', ch.id,
      'destination_path', ch.destination_path,
      'expires_at', ch.expires_at,
      'min_seconds', public.fmp_cfg_int(v_ev.config, '{challenge,min_seconds}', 4),
      'min_scroll_px', public.fmp_cfg_int(v_ev.config, '{challenge,min_scroll_px}', 200),
      'min_scroll_events', public.fmp_cfg_int(v_ev.config, '{challenge,min_scroll_events}', 3)
    ) into v_challenge
    from public.scroll_challenges ch
    where ch.player_game_id = p_pg and ch.status = 'pending' and ch.expires_at > now();

  return jsonb_build_object(
    'started', true,
    'event', jsonb_build_object(
      'slug', v_ev.slug, 'name', v_ev.name, 'status', v_ev.status,
      'is_open', public.fmp_event_is_open(v_ev), 'starts_at', v_ev.starts_at, 'ends_at', v_ev.ends_at
    ),
    'game_status', v_pg.status,
    'stamp_count', v_stamps,
    'total_active', v_active,
    'collected', v_collected,
    'all_found', v_active > 0 and v_stamps >= v_active,
    'sticker_unlock_at', v_unlock,
    'rewards_combinable', coalesce((v_ev.config ->> 'rewards_combinable')::boolean, false),
    'sticker_unlocked', v_stamps >= v_unlock,
    'rewards', v_rewards,
    'pending_challenge', v_challenge
  );
end $$;
create or replace function public.fmp_start_game(p_event_slug text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_user();
  v_ev public.game_events;
  v_pg public.player_games;
  v_ready integer;
begin
  select * into v_ev from public.game_events where slug = p_event_slug and status in ('active', 'ended');
  if not found then
    raise exception 'event_not_found';
  end if;

  select * into v_pg from public.player_games where event_id = v_ev.id and user_id = v_uid;
  if found then
    return public.fmp_build_progress(v_pg.id);
  end if;

  if not public.fmp_event_is_open(v_ev) then
    raise exception 'event_inactive';
  end if;

  select count(*) into v_ready from public.game_qrs where event_id = v_ev.id and status = 'active';
  if v_ready <> public.fmp_cfg_int(v_ev.config, '{qr_total}', 5) then
    raise exception 'event_not_ready';
  end if;

  insert into public.player_games (event_id, user_id) values (v_ev.id, v_uid)
    on conflict (event_id, user_id) do nothing
    returning * into v_pg;

  -- Kalah balapan: request lain sudah membuat game (dan assignment-nya) — pakai milik pemenang.
  if v_pg.id is null then
    select * into v_pg from public.player_games where event_id = v_ev.id and user_id = v_uid;
    return public.fmp_build_progress(v_pg.id);
  end if;

  -- Semua pemain mendapat QR stempel yang sama (tetap, tidak diacak). Baris assignment tetap dibuat
  -- karena FK player_stamps → player_qr_assignments menjadi jaring pengaman di database.
  insert into public.player_qr_assignments (player_game_id, event_id, qr_id)
    select v_pg.id, v_ev.id, q.id
    from public.game_qrs q
    where q.event_id = v_ev.id and q.awards_stamp and q.status = 'active';

  return public.fmp_build_progress(v_pg.id);
end $$;
create or replace function public.fmp_scan_qr(p_event_slug text, p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_user();
  v_ev public.game_events;
  v_pg public.player_games;
  v_qr public.game_qrs;
  v_attempt uuid := gen_random_uuid();
  v_stamp uuid;
  v_ch public.scroll_challenges;
  v_recent integer;
  v_max integer;
  v_window integer;
  v_result text;
  v_stamps integer;
  v_active integer;
  v_token text := trim(coalesce(p_token, ''));
begin
  select * into v_ev from public.game_events where slug = p_event_slug and status in ('active', 'ended');
  if not found then
    raise exception 'event_not_found';
  end if;

  -- Kunci baris pemain: semua scan satu pemain diserialkan, jadi dua scan paralel tidak bisa
  -- membuat dua challenge atau dua stamp.
  select * into v_pg from public.player_games where event_id = v_ev.id and user_id = v_uid for update;
  if not found then
    raise exception 'game_not_started';
  end if;

  if not public.fmp_event_is_open(v_ev) then
    insert into public.scan_attempts (id, event_id, user_id, player_game_id, result)
      values (v_attempt, v_ev.id, v_uid, v_pg.id, 'event_inactive');
    return jsonb_build_object('result', 'event_inactive', 'progress', public.fmp_build_progress(v_pg.id));
  end if;

  -- Rate limit per akun (bukan per IP: pengunjung booth berbagi jaringan).
  v_max := public.fmp_cfg_int(v_ev.config, '{scan_rate_limit,max}', 20);
  v_window := public.fmp_cfg_int(v_ev.config, '{scan_rate_limit,window_seconds}', 60);
  select count(*) into v_recent from public.scan_attempts
    where user_id = v_uid and event_id = v_ev.id
      and created_at > now() - make_interval(secs => v_window)
      and result <> 'rate_limited';
  if v_recent >= v_max then
    -- Satu catatan per jendela supaya spam tidak membengkakkan tabel.
    if not exists (select 1 from public.scan_attempts
                   where user_id = v_uid and event_id = v_ev.id and result = 'rate_limited'
                     and created_at > now() - make_interval(secs => v_window)) then
      insert into public.scan_attempts (id, event_id, user_id, player_game_id, result)
        values (v_attempt, v_ev.id, v_uid, v_pg.id, 'rate_limited');
    end if;
    return jsonb_build_object('result', 'rate_limited', 'progress', public.fmp_build_progress(v_pg.id));
  end if;

  -- Challenge yang masih berjalan mengunci scan berikutnya.
  update public.scroll_challenges set status = 'expired'
    where player_game_id = v_pg.id and status = 'pending' and expires_at <= now();
  select * into v_ch from public.scroll_challenges where player_game_id = v_pg.id and status = 'pending';
  if found then
    insert into public.scan_attempts (id, event_id, user_id, player_game_id, result)
      values (v_attempt, v_ev.id, v_uid, v_pg.id, 'challenge_required');
    return jsonb_build_object('result', 'challenge_required', 'progress', public.fmp_build_progress(v_pg.id));
  end if;

  if length(v_token) < 16 or length(v_token) > 128 then
    v_qr := null;
  else
    select * into v_qr from public.game_qrs
      where event_id = v_ev.id and token_hash = encode(extensions.digest(v_token, 'sha256'), 'hex');
  end if;

  if v_qr.id is null or v_qr.status <> 'active' then
    insert into public.scan_attempts (id, event_id, user_id, player_game_id, result)
      values (v_attempt, v_ev.id, v_uid, v_pg.id, 'invalid_qr');
    return jsonb_build_object('result', 'invalid_qr', 'progress', public.fmp_build_progress(v_pg.id));
  end if;

  if v_qr.awards_stamp then
    -- Pemain lama (mulai sebelum sistem ini) belum punya baris assignment untuk QR ini.
    insert into public.player_qr_assignments (player_game_id, event_id, qr_id)
      values (v_pg.id, v_ev.id, v_qr.id)
      on conflict (player_game_id, qr_id) do nothing;

    insert into public.scan_attempts (id, event_id, user_id, player_game_id, qr_id, result)
      values (v_attempt, v_ev.id, v_uid, v_pg.id, v_qr.id, 'stamp_awarded');

    insert into public.player_stamps (player_game_id, qr_id, scan_attempt_id)
      values (v_pg.id, v_qr.id, v_attempt)
      on conflict (player_game_id, qr_id) do nothing
      returning id into v_stamp;

    if v_stamp is null then
      v_result := 'already_collected';
      update public.scan_attempts set result = v_result where id = v_attempt;
    else
      v_result := 'stamp_awarded';
      v_stamps := public.fmp_stamp_count(v_pg.id);
      select count(*) into v_active from public.game_qrs
        where event_id = v_ev.id and awards_stamp and status = 'active';
      if v_stamps >= v_active then
        update public.player_games set status = 'completed', completed_at = now() where id = v_pg.id;
      end if;
    end if;

    return jsonb_build_object(
      'result', v_result,
      'qr_label', v_qr.label,
      'progress', public.fmp_build_progress(v_pg.id)
    );
  end if;

  -- QR valid tetapi bukan QR stempel (4/5): tanpa stamp, mulai challenge.
  insert into public.scan_attempts (id, event_id, user_id, player_game_id, qr_id, result)
    values (v_attempt, v_ev.id, v_uid, v_pg.id, v_qr.id, 'inactive_for_player');
  insert into public.scroll_challenges (player_game_id, scan_attempt_id, qr_id, destination_path, expires_at)
    values (v_pg.id, v_attempt, v_qr.id, v_qr.destination_path,
            now() + make_interval(secs => public.fmp_cfg_int(v_ev.config, '{challenge,ttl_seconds}', 900)));

  return jsonb_build_object('result', 'inactive_for_player', 'qr_label', v_qr.label,
                            'progress', public.fmp_build_progress(v_pg.id));
end $$;
create or replace function public.fmp_create_reward_claim(p_event_slug text, p_reward_type text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_user();
  v_ev public.game_events;
  v_pg public.player_games;
  v_min integer;
  v_stamps integer;
  v_existing public.reward_claims;
  v_inv public.reward_inventory;
  v_code text;
  v_tries integer := 0;
begin
  select * into v_ev from public.game_events where slug = p_event_slug and status in ('active', 'ended');
  if not found then
    raise exception 'event_not_found';
  end if;
  select * into v_pg from public.player_games where event_id = v_ev.id and user_id = v_uid for update;
  if not found then
    raise exception 'game_not_started';
  end if;

  v_min := (v_ev.config #>> array['rewards', coalesce(p_reward_type, ''), 'min_stamps'])::integer;
  if v_min is null then
    raise exception 'reward_not_available';
  end if;

  -- Klaim yang sudah ada dikembalikan apa adanya (idempoten) — termasuk setelah event berakhir.
  select * into v_existing from public.reward_claims
    where player_game_id = v_pg.id and reward_type = p_reward_type;
  if found then
    if v_existing.status = 'cancelled' then
      raise exception 'claim_cancelled';
    end if;
    return public.fmp_build_progress(v_pg.id);
  end if;

  if not public.fmp_event_is_open(v_ev) then
    raise exception 'event_inactive';
  end if;

  v_stamps := public.fmp_stamp_count(v_pg.id);
  if v_stamps < v_min then
    raise exception 'not_eligible';
  end if;

  if not coalesce((v_ev.config ->> 'rewards_combinable')::boolean, false)
     and exists (select 1 from public.reward_claims
                 where player_game_id = v_pg.id and status <> 'cancelled') then
    raise exception 'already_claimed_other_reward';
  end if;

  select * into v_inv from public.reward_inventory
    where event_id = v_ev.id and reward_type = p_reward_type for update;
  if not found then
    raise exception 'reward_not_configured';
  end if;
  if v_inv.total_quantity - v_inv.reserved_quantity - v_inv.redeemed_quantity <= 0 then
    raise exception 'out_of_stock';
  end if;

  update public.reward_inventory set reserved_quantity = reserved_quantity + 1
    where event_id = v_ev.id and reward_type = p_reward_type;

  loop
    v_code := public.fmp_gen_claim_code();
    begin
      insert into public.reward_claims (player_game_id, reward_type, claim_code)
        values (v_pg.id, p_reward_type, v_code);
      exit;
    exception when unique_violation then
      v_tries := v_tries + 1;
      if v_tries > 10 then
        raise exception 'internal_error';
      end if;
    end;
  end loop;

  return public.fmp_build_progress(v_pg.id);
end $$;
create or replace function public.fmp_admin_stats(p_event_slug text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_ev public.game_events;
  v_result jsonb;
begin
  perform public.fmp_assert_staff();
  select * into v_ev from public.game_events where slug = p_event_slug;
  if not found then
    raise exception 'event_not_found';
  end if;

  select jsonb_build_object(
    'event', jsonb_build_object('slug', v_ev.slug, 'name', v_ev.name, 'status', v_ev.status,
                                'starts_at', v_ev.starts_at, 'ends_at', v_ev.ends_at),
    'players_started', (select count(*) from public.player_games where event_id = v_ev.id),
    'players_completed', (select count(*) from public.player_games where event_id = v_ev.id and status = 'completed'),
    'total_stamps', (select count(*) from public.player_stamps s
                     join public.game_qrs q on q.id = s.qr_id and q.awards_stamp
                     join public.player_games g on g.id = s.player_game_id where g.event_id = v_ev.id),
    'by_stamp_count', (
      select coalesce(jsonb_object_agg(n::text, c), '{}'::jsonb) from (
        select coalesce(sc.n, 0) as n, count(*) as c
        from public.player_games g
        left join (select s2.player_game_id, count(*) as n from public.player_stamps s2
                   join public.game_qrs q2 on q2.id = s2.qr_id and q2.awards_stamp group by 1) sc
          on sc.player_game_id = g.id
        where g.event_id = v_ev.id group by 1
      ) x),
    'claims', (
      select coalesce(jsonb_object_agg(status, c), '{}'::jsonb) from (
        select rc.status, count(*) as c from public.reward_claims rc
        join public.player_games g on g.id = rc.player_game_id
        where g.event_id = v_ev.id group by 1) y),
    'inventory', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'type', reward_type, 'total', total_quantity,
        'reserved', reserved_quantity, 'redeemed', redeemed_quantity) order by reward_type), '[]'::jsonb)
      from public.reward_inventory where event_id = v_ev.id),
    -- Sinyal operasional/anti-abuse 24 jam terakhir (jumlah saja, tanpa data pribadi).
    'scans_24h', (
      select coalesce(jsonb_object_agg(result, c), '{}'::jsonb) from (
        select result, count(*) as c from public.scan_attempts
        where event_id = v_ev.id and created_at > now() - interval '24 hours' group by 1) z),
    'active_qrs', (select count(*) from public.game_qrs where event_id = v_ev.id and status = 'active')
  ) into v_result;
  return v_result;
end $$;
create or replace function public.fmp_admin_set_event_status(p_event_slug text, p_status text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_ev public.game_events;
  v_ready integer;
begin
  perform public.fmp_assert_staff(true);
  if p_status not in ('draft', 'active', 'ended', 'archived') then
    raise exception 'invalid_input';
  end if;
  select * into v_ev from public.game_events where slug = p_event_slug for update;
  if not found then
    raise exception 'event_not_found';
  end if;
  if p_status = 'active' then
    select count(*) into v_ready from public.game_qrs where event_id = v_ev.id and status = 'active';
    if v_ready <> public.fmp_cfg_int(v_ev.config, '{qr_total}', 5) then
      raise exception 'event_not_ready';
    end if;
  end if;
  update public.game_events set status = p_status where id = v_ev.id;
  perform public.fmp_audit('event_status_changed', 'game_event', v_ev.id::text,
                           jsonb_build_object('from', v_ev.status, 'to', p_status));
  return jsonb_build_object('ok', true, 'status', p_status);
end $$;
create or replace function public.fmp_admin_rotate_tokens(p_event_slug text, p_confirm_active boolean default false) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_ev public.game_events;
  v_row record;
  v_token text;
  v_out jsonb := '[]'::jsonb;
begin
  perform public.fmp_assert_staff(true);
  select * into v_ev from public.game_events where slug = p_event_slug for update;
  if not found then
    raise exception 'event_not_found';
  end if;
  if v_ev.status = 'active' and not coalesce(p_confirm_active, false) then
    raise exception 'confirmation_required';
  end if;
  for v_row in select id, label, destination_path from public.game_qrs where event_id = v_ev.id and status <> 'disabled' order by label loop
    v_token := translate(rtrim(encode(extensions.gen_random_bytes(18), 'base64'), '='), '+/', '-_');
    update public.game_qrs
      set token_hash = encode(extensions.digest(v_token, 'sha256'), 'hex'), status = 'active'
      where id = v_row.id;
    v_out := v_out || jsonb_build_object('label', v_row.label, 'token', v_token,
                                         'destination_path', v_row.destination_path);
  end loop;
  perform public.fmp_audit('qr_tokens_rotated', 'game_event', v_ev.id::text, null);
  return v_out;
end $$;
create or replace function public.fmp_admin_list_qrs(p_event_slug text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_ev public.game_events;
begin
  perform public.fmp_assert_staff(true);
  select * into v_ev from public.game_events where slug = p_event_slug;
  if not found then
    raise exception 'event_not_found';
  end if;
  return (select coalesce(jsonb_agg(jsonb_build_object(
    'label', label, 'status', status, 'destination_path', destination_path, 'awards_stamp', awards_stamp) order by label), '[]'::jsonb)
    from public.game_qrs where event_id = v_ev.id);
end $$;
-- Cek nomor QR (khusus panitia, tanpa efek samping): dipakai kamera di panel admin untuk menandai
-- QR yang sudah dicetak. Tidak menulis scan_attempts, tidak membuat stamp/challenge.
create function public.fmp_admin_identify_qr(p_event_slug text, p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_ev public.game_events;
  v_qr public.game_qrs;
  v_token text := trim(coalesce(p_token, ''));
begin
  perform public.fmp_assert_staff();
  select * into v_ev from public.game_events where slug = p_event_slug;
  if not found then
    raise exception 'event_not_found';
  end if;
  if length(v_token) < 16 or length(v_token) > 128 then
    return jsonb_build_object('found', false);
  end if;
  select * into v_qr from public.game_qrs
    where event_id = v_ev.id and token_hash = encode(extensions.digest(v_token, 'sha256'), 'hex');
  if not found then
    return jsonb_build_object('found', false);
  end if;
  return jsonb_build_object('found', true, 'label', v_qr.label, 'status', v_qr.status,
                            'awards_stamp', v_qr.awards_stamp, 'destination_path', v_qr.destination_path);
end $$;

revoke all on function public.fmp_stamp_count(uuid), public.fmp_admin_identify_qr(text, text)
  from public, anon, authenticated;
grant execute on function public.fmp_admin_identify_qr(text, text) to authenticated;
