-- Find My Polo — skema, RLS, dan fungsi server (RPC).
--
-- Prinsip (PROMPT_FIND_MY_POLO_OMAHPALA.md §4.2, §8):
--   * Frontend TIDAK dipercaya. Semua keputusan (assignment, stamp, challenge, hadiah) diambil di
--     fungsi SECURITY DEFINER di bawah, bukan di browser.
--   * Tabel game tidak bisa ditulis langsung oleh klien (tanpa policy INSERT/UPDATE/DELETE). Klien
--     hanya memanggil fungsi fmp_* lewat supabase.rpc().
--   * Tidak ada stok hadiah "tak terbatas" diam-diam: tanpa baris reward_inventory, hadiah itu
--     tidak bisa diklaim.
--
-- Semantik status klaim hadiah (satu definisi, dipakai di seluruh sistem):
--   (eligible)  = TURUNAN, bukan baris: jumlah stamp >= min_stamps pada config event dan belum ada klaim.
--   claimed     = pemain meminta klaim; kode dikeluarkan; 1 unit stok DICADANGKAN (reserved).
--   redeemed    = panitia sudah menyerahkan hadiah; stok pindah reserved -> redeemed. Final.
--   cancelled   = dibatalkan admin; stok cadangan dilepas. Final, tidak dikeluarkan ulang.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- ————————————————————————————————————————————————
-- Tabel
-- ————————————————————————————————————————————————

create table public.game_events (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  name        text not null,
  status      text not null default 'draft' check (status in ('draft', 'active', 'ended', 'archived')),
  starts_at   timestamptz,
  ends_at     timestamptz,
  -- Semua angka aturan ada di sini supaya bisa diubah tanpa deploy ulang.
  -- rewards_combinable DIAMBIL KONSERVATIF (false) sampai pemilik event memutuskan (prompt §15).
  config      jsonb not null default '{
    "qr_total": 10,
    "active_per_player": 4,
    "sticker_unlock_at": 3,
    "rewards_combinable": false,
    "challenge": {"min_seconds": 4, "min_scroll_px": 200, "min_scroll_events": 3, "ttl_seconds": 900},
    "scan_rate_limit": {"max": 20, "window_seconds": 60},
    "rewards": {
      "small_gift": {"min_stamps": 2},
      "sticker":    {"min_stamps": 3}
    }
  }'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.game_qrs (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references public.game_events (id) on delete cascade,
  label            smallint not null check (label between 1 and 99),
  -- Hanya hash SHA-256 token yang disimpan; token asli hanya muncul sekali saat dibuat (fmp_admin_rotate_tokens).
  token_hash       text not null unique,
  status           text not null default 'active' check (status in ('active', 'disabled', 'revoked')),
  -- Halaman OmahPala yang SUDAH ADA, dibuka saat QR ini tidak aktif untuk pemain.
  destination_path text not null check (destination_path ~ '^/(produk|program)(/[a-z0-9-]+)?$'),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (event_id, label),
  unique (id, event_id)
);

create table public.player_games (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.game_events (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  status        text not null default 'active' check (status in ('active', 'completed', 'suspended')),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (event_id, user_id),
  unique (id, event_id)
);

-- Empat QR aktif per pemain (desain ternormalisasi, prompt §5.3 opsi 1). FK komposit memastikan
-- QR dan player_game berada di event yang sama.
create table public.player_qr_assignments (
  player_game_id uuid not null,
  event_id       uuid not null,
  qr_id          uuid not null,
  created_at     timestamptz not null default now(),
  primary key (player_game_id, qr_id),
  foreign key (player_game_id, event_id) references public.player_games (id, event_id) on delete cascade,
  foreign key (qr_id, event_id) references public.game_qrs (id, event_id) on delete cascade
);

create table public.scan_attempts (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.game_events (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  player_game_id uuid references public.player_games (id) on delete cascade,
  qr_id          uuid references public.game_qrs (id) on delete set null,
  result         text not null check (result in (
    'stamp_awarded', 'already_collected', 'inactive_for_player', 'invalid_qr',
    'event_inactive', 'rate_limited', 'challenge_required'
  )),
  created_at     timestamptz not null default now()
);
create index scan_attempts_user_time_idx on public.scan_attempts (user_id, created_at desc);
create index scan_attempts_event_result_idx on public.scan_attempts (event_id, result, created_at desc);

-- FK komposit ke assignment: DATABASE sendiri menolak stamp untuk QR yang bukan target pemain.
create table public.player_stamps (
  id              uuid primary key default gen_random_uuid(),
  player_game_id  uuid not null,
  qr_id           uuid not null,
  scan_attempt_id uuid references public.scan_attempts (id) on delete set null,
  collected_at    timestamptz not null default now(),
  unique (player_game_id, qr_id),
  foreign key (player_game_id, qr_id) references public.player_qr_assignments (player_game_id, qr_id) on delete cascade
);

create table public.scroll_challenges (
  id               uuid primary key default gen_random_uuid(),
  player_game_id   uuid not null references public.player_games (id) on delete cascade,
  scan_attempt_id  uuid references public.scan_attempts (id) on delete set null,
  qr_id            uuid references public.game_qrs (id) on delete set null,
  destination_path text not null,
  status           text not null default 'pending' check (status in ('pending', 'completed', 'expired', 'cancelled')),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null,
  first_begin_at   timestamptz,
  last_begin_at    timestamptz,
  completed_at     timestamptz,
  evidence         jsonb
);
-- Paling banyak SATU challenge pending per pemain: scan berikutnya terkunci sampai selesai/kedaluwarsa.
create unique index scroll_challenges_one_pending_idx on public.scroll_challenges (player_game_id) where status = 'pending';

create table public.reward_inventory (
  event_id          uuid not null references public.game_events (id) on delete cascade,
  reward_type       text not null check (reward_type ~ '^[a-z_]{2,40}$'),
  total_quantity    integer not null check (total_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  redeemed_quantity integer not null default 0 check (redeemed_quantity >= 0),
  updated_at        timestamptz not null default now(),
  primary key (event_id, reward_type),
  check (reserved_quantity + redeemed_quantity <= total_quantity)
);

create table public.reward_claims (
  id             uuid primary key default gen_random_uuid(),
  player_game_id uuid not null references public.player_games (id) on delete cascade,
  reward_type    text not null check (reward_type ~ '^[a-z_]{2,40}$'),
  -- Disimpan apa adanya (bukan hash) karena pemain harus bisa melihat kodenya lagi setelah refresh.
  -- Aman karena: RLS membatasi pemain hanya ke kodenya sendiri, dan kode tidak berguna tanpa
  -- panita yang login (fmp_redeem_reward). Kode 8 karakter dari alfabet 31 huruf/angka (~40 bit).
  claim_code     text not null unique check (claim_code ~ '^[A-Z2-9]{8}$'),
  status         text not null default 'claimed' check (status in ('claimed', 'redeemed', 'cancelled')),
  created_at     timestamptz not null default now(),
  redeemed_at    timestamptz,
  redeemed_by    uuid references auth.users (id) on delete set null,
  cancelled_at   timestamptz,
  unique (player_game_id, reward_type)
);

-- Peran panitia. Sistem admin lama (src/lib/auth.ts) hanya mock di localStorage dan TIDAK bisa
-- dipakai server untuk otorisasi, jadi peran game disimpan di sini dan diberikan manual (lihat docs).
create table public.game_staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create table public.game_audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  action     text not null,
  entity     text not null,
  entity_id  text,
  details    jsonb,
  created_at timestamptz not null default now()
);

create function public.fmp_touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger game_events_touch before update on public.game_events
  for each row execute function public.fmp_touch_updated_at();
create trigger game_qrs_touch before update on public.game_qrs
  for each row execute function public.fmp_touch_updated_at();
create trigger player_games_touch before update on public.player_games
  for each row execute function public.fmp_touch_updated_at();
create trigger reward_inventory_touch before update on public.reward_inventory
  for each row execute function public.fmp_touch_updated_at();

-- ————————————————————————————————————————————————
-- RLS: klien hanya boleh MEMBACA data miliknya; tidak ada policy tulis sama sekali.
-- ————————————————————————————————————————————————

alter table public.game_events            enable row level security;
alter table public.game_qrs               enable row level security;
alter table public.player_games           enable row level security;
alter table public.player_qr_assignments  enable row level security;
alter table public.scan_attempts          enable row level security;
alter table public.player_stamps          enable row level security;
alter table public.scroll_challenges      enable row level security;
alter table public.reward_inventory       enable row level security;
alter table public.reward_claims          enable row level security;
alter table public.game_staff             enable row level security;
alter table public.game_audit_log         enable row level security;

revoke all on public.game_events, public.game_qrs, public.player_games, public.player_qr_assignments,
  public.scan_attempts, public.player_stamps, public.scroll_challenges, public.reward_inventory,
  public.reward_claims, public.game_staff, public.game_audit_log
  from anon, authenticated;

-- Event: info publik dasar (nama, status, jadwal, aturan) boleh dibaca siapa saja.
grant select on public.game_events to anon, authenticated;
create policy game_events_read on public.game_events
  for select to anon, authenticated using (status in ('active', 'ended'));

-- Hanya milik sendiri. game_qrs, player_qr_assignments, scan_attempts, scroll_challenges,
-- reward_inventory, game_staff, game_audit_log SENGAJA tanpa grant/policy: hanya lewat fungsi.
grant select on public.player_games, public.player_stamps, public.reward_claims to authenticated;

create policy player_games_own on public.player_games
  for select to authenticated using (user_id = auth.uid());

create policy player_stamps_own on public.player_stamps
  for select to authenticated using (
    exists (select 1 from public.player_games g where g.id = player_stamps.player_game_id and g.user_id = auth.uid())
  );

create policy reward_claims_own on public.reward_claims
  for select to authenticated using (
    exists (select 1 from public.player_games g where g.id = reward_claims.player_game_id and g.user_id = auth.uid())
  );

-- ————————————————————————————————————————————————
-- Helper internal (tidak di-grant ke klien)
-- ————————————————————————————————————————————————

create function public.fmp_cfg_int(p_config jsonb, p_path text[], p_default integer) returns integer
language sql immutable set search_path = public as $$
  select coalesce((p_config #>> p_path)::integer, p_default)
$$;

-- Pengguna terautentikasi DAN email terverifikasi (diperiksa ulang di server, bukan hanya di UI).
create function public.fmp_assert_user() returns uuid
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_uid uuid := auth.uid();
  v_confirmed timestamptz;
begin
  if v_uid is null then
    raise exception 'authentication_required';
  end if;
  select email_confirmed_at into v_confirmed from auth.users where id = v_uid;
  if v_confirmed is null then
    raise exception 'email_not_verified';
  end if;
  return v_uid;
end $$;

create function public.fmp_assert_staff(p_need_admin boolean default false) returns uuid
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_user();
  v_role text;
begin
  select role into v_role from public.game_staff where user_id = v_uid;
  if v_role is null or (p_need_admin and v_role <> 'admin') then
    raise exception 'forbidden';
  end if;
  return v_uid;
end $$;

create function public.fmp_event_is_open(p_ev public.game_events) returns boolean
language sql stable set search_path = public as $$
  select p_ev.status = 'active'
     and (p_ev.starts_at is null or now() >= p_ev.starts_at)
     and (p_ev.ends_at is null or now() < p_ev.ends_at)
$$;

create function public.fmp_audit(p_action text, p_entity text, p_entity_id text, p_details jsonb default null) returns void
language sql security definer set search_path = public as $$
  insert into public.game_audit_log (actor_id, action, entity, entity_id, details)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_details)
$$;

-- Ringkasan progres satu pemain. Hanya angka/label yang dibutuhkan UI; assignment TIDAK dibocorkan.
create function public.fmp_build_progress(p_pg uuid) returns jsonb
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

  select count(*) into v_stamps from public.player_stamps where player_game_id = p_pg;
  select count(*) into v_active from public.player_qr_assignments where player_game_id = p_pg;
  select coalesce(jsonb_agg(q.label order by q.label), '[]'::jsonb) into v_collected
    from public.player_stamps s join public.game_qrs q on q.id = s.qr_id
    where s.player_game_id = p_pg;
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

-- ————————————————————————————————————————————————
-- RPC pemain
-- ————————————————————————————————————————————————

-- Progres + info event. Aman dipanggil berulang; tidak membuat game.
create function public.fmp_get_progress(p_event_slug text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_user();
  v_ev public.game_events;
  v_pg public.player_games;
begin
  select * into v_ev from public.game_events where slug = p_event_slug and status in ('active', 'ended');
  if not found then
    raise exception 'event_not_found';
  end if;
  select * into v_pg from public.player_games where event_id = v_ev.id and user_id = v_uid;
  if not found then
    return jsonb_build_object(
      'started', false,
      'event', jsonb_build_object(
        'slug', v_ev.slug, 'name', v_ev.name, 'status', v_ev.status,
        'is_open', public.fmp_event_is_open(v_ev), 'starts_at', v_ev.starts_at, 'ends_at', v_ev.ends_at
      )
    );
  end if;
  return public.fmp_build_progress(v_pg.id);
end $$;

-- Idempoten: panggilan kedua (atau paralel) mengembalikan game yang sama, TIDAK mengacak ulang.
create function public.fmp_start_game(p_event_slug text) returns jsonb
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
  if v_ready <> public.fmp_cfg_int(v_ev.config, '{qr_total}', 10) then
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

  -- gen_random_uuid() bersumber dari CSPRNG, jadi pengurutan acak ini tidak bisa ditebak klien.
  insert into public.player_qr_assignments (player_game_id, event_id, qr_id)
    select v_pg.id, v_ev.id, q.id
    from public.game_qrs q
    where q.event_id = v_ev.id and q.status = 'active'
    order by gen_random_uuid()
    limit public.fmp_cfg_int(v_ev.config, '{active_per_player}', 4);

  return public.fmp_build_progress(v_pg.id);
end $$;

create function public.fmp_scan_qr(p_event_slug text, p_token text) returns jsonb
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

  if exists (select 1 from public.player_qr_assignments where player_game_id = v_pg.id and qr_id = v_qr.id) then
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
      select count(*) into v_stamps from public.player_stamps where player_game_id = v_pg.id;
      select count(*) into v_active from public.player_qr_assignments where player_game_id = v_pg.id;
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

  -- QR valid tetapi bukan target pemain: tanpa stamp, mulai challenge, assignment TIDAK berubah.
  insert into public.scan_attempts (id, event_id, user_id, player_game_id, qr_id, result)
    values (v_attempt, v_ev.id, v_uid, v_pg.id, v_qr.id, 'inactive_for_player');
  insert into public.scroll_challenges (player_game_id, scan_attempt_id, qr_id, destination_path, expires_at)
    values (v_pg.id, v_attempt, v_qr.id, v_qr.destination_path,
            now() + make_interval(secs => public.fmp_cfg_int(v_ev.config, '{challenge,ttl_seconds}', 900)));

  return jsonb_build_object('result', 'inactive_for_player', 'progress', public.fmp_build_progress(v_pg.id));
end $$;

-- Dipanggil saat halaman tujuan tampil. Idempoten; menyetel jam server untuk durasi minimum.
create function public.fmp_begin_challenge(p_challenge_id uuid) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_user();
  v_ch public.scroll_challenges;
begin
  select ch.* into v_ch
    from public.scroll_challenges ch join public.player_games g on g.id = ch.player_game_id
    where ch.id = p_challenge_id and g.user_id = v_uid
    for update of ch;
  if not found then
    raise exception 'challenge_not_found';
  end if;
  if v_ch.status = 'completed' then
    return jsonb_build_object('ok', true, 'status', 'completed');
  end if;
  if v_ch.status <> 'pending' or v_ch.expires_at <= now() then
    return jsonb_build_object('ok', false, 'status', 'expired');
  end if;
  update public.scroll_challenges
    set first_begin_at = coalesce(first_begin_at, now()), last_begin_at = now()
    where id = v_ch.id;
  return jsonb_build_object('ok', true, 'status', 'pending');
end $$;

-- Verifikasi sejauh yang bisa dilakukan server. Catatan jujur: p_visible_ms/p_scroll_* dilaporkan
-- browser dan BISA dipalsukan. Yang dipaksakan server secara andal hanyalah jam (>= min_seconds
-- sejak halaman tampil), kepemilikan, kedaluwarsa, dan sekali-pakai. Ini mekanisme engagement,
-- bukan bukti membaca.
create function public.fmp_complete_challenge(
  p_challenge_id uuid, p_visible_ms integer, p_scroll_px integer, p_scroll_events integer
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_user();
  v_ch public.scroll_challenges;
  v_ev public.game_events;
  v_min_s integer;
  v_min_px integer;
  v_min_ev integer;
  v_visible integer := least(greatest(coalesce(p_visible_ms, 0), 0), 3600000);
  v_px integer := least(greatest(coalesce(p_scroll_px, 0), 0), 10000000);
  v_events integer := least(greatest(coalesce(p_scroll_events, 0), 0), 100000);
  v_elapsed_ms numeric;
begin
  select ch.* into v_ch
    from public.scroll_challenges ch join public.player_games g on g.id = ch.player_game_id
    where ch.id = p_challenge_id and g.user_id = v_uid
    for update of ch;
  if not found then
    raise exception 'challenge_not_found';
  end if;

  select e.* into v_ev from public.game_events e
    join public.player_games g on g.event_id = e.id where g.id = v_ch.player_game_id;

  if v_ch.status = 'completed' then
    return jsonb_build_object('ok', true, 'progress', public.fmp_build_progress(v_ch.player_game_id));
  end if;
  if v_ch.status <> 'pending' or v_ch.expires_at <= now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;
  if v_ch.last_begin_at is null then
    return jsonb_build_object('ok', false, 'reason', 'not_started');
  end if;

  v_min_s := public.fmp_cfg_int(v_ev.config, '{challenge,min_seconds}', 4);
  v_min_px := public.fmp_cfg_int(v_ev.config, '{challenge,min_scroll_px}', 200);
  v_min_ev := public.fmp_cfg_int(v_ev.config, '{challenge,min_scroll_events}', 3);

  v_elapsed_ms := extract(epoch from (now() - v_ch.last_begin_at)) * 1000;
  if v_elapsed_ms < v_min_s * 1000 then
    return jsonb_build_object('ok', false, 'reason', 'too_early',
                              'retry_after_ms', ceil(v_min_s * 1000 - v_elapsed_ms)::integer);
  end if;
  if v_visible < v_min_s * 1000 then
    return jsonb_build_object('ok', false, 'reason', 'insufficient_visible_time');
  end if;
  if v_px < v_min_px or v_events < v_min_ev then
    return jsonb_build_object('ok', false, 'reason', 'insufficient_scroll');
  end if;

  update public.scroll_challenges
    set status = 'completed', completed_at = now(),
        evidence = jsonb_build_object('visible_ms', v_visible, 'scroll_px', v_px, 'scroll_events', v_events)
    where id = v_ch.id;

  return jsonb_build_object('ok', true, 'progress', public.fmp_build_progress(v_ch.player_game_id));
end $$;

-- Letakkan di bawah: dipakai pemain dan panitia.

create function public.fmp_gen_claim_code() returns text
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  c_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea := extensions.gen_random_bytes(8);
  v_code text := '';
  i integer;
begin
  for i in 0..7 loop
    v_code := v_code || substr(c_alphabet, (get_byte(v_bytes, i) % length(c_alphabet)) + 1, 1);
  end loop;
  return v_code;
end $$;

create function public.fmp_create_reward_claim(p_event_slug text, p_reward_type text) returns jsonb
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

  select count(*) into v_stamps from public.player_stamps where player_game_id = v_pg.id;
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

-- ————————————————————————————————————————————————
-- RPC panitia (staff) dan admin
-- ————————————————————————————————————————————————

create function public.fmp_staff_role() returns text
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_user();
  v_role text;
begin
  select role into v_role from public.game_staff where user_id = v_uid;
  return v_role;
end $$;

create function public.fmp_normalize_code(p_code text) returns text
language sql immutable set search_path = public as $$
  select upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'))
$$;

-- Pratinjau tanpa efek samping: panitia melihat apa yang akan ditukar sebelum menekan "Tukar".
create function public.fmp_lookup_claim(p_code text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_c public.reward_claims;
  v_ev_name text;
begin
  perform public.fmp_assert_staff();
  select * into v_c from public.reward_claims where claim_code = public.fmp_normalize_code(p_code);
  if not found then
    return jsonb_build_object('found', false);
  end if;
  select e.name into v_ev_name from public.game_events e
    join public.player_games g on g.event_id = e.id where g.id = v_c.player_game_id;
  return jsonb_build_object(
    'found', true, 'status', v_c.status, 'reward_type', v_c.reward_type, 'event_name', v_ev_name,
    'created_at', v_c.created_at, 'redeemed_at', v_c.redeemed_at
  );
end $$;

-- Atomik: satu UPDATE bersyarat memastikan kode hanya bisa ditukar sekali, bahkan jika dua petugas
-- menekan tombol bersamaan.
create function public.fmp_redeem_reward(p_code text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_staff();
  v_code text := public.fmp_normalize_code(p_code);
  v_c public.reward_claims;
  v_event uuid;
begin
  update public.reward_claims
    set status = 'redeemed', redeemed_at = now(), redeemed_by = v_uid
    where claim_code = v_code and status = 'claimed'
    returning * into v_c;

  if v_c.id is null then
    select * into v_c from public.reward_claims where claim_code = v_code;
    if not found then
      return jsonb_build_object('ok', false, 'reason', 'not_found');
    end if;
    return jsonb_build_object('ok', false, 'reason',
      case v_c.status when 'redeemed' then 'already_redeemed' else 'cancelled' end,
      'redeemed_at', v_c.redeemed_at);
  end if;

  select event_id into v_event from public.player_games where id = v_c.player_game_id;
  update public.reward_inventory
    set reserved_quantity = reserved_quantity - 1, redeemed_quantity = redeemed_quantity + 1
    where event_id = v_event and reward_type = v_c.reward_type;

  perform public.fmp_audit('reward_redeemed', 'reward_claim', v_c.id::text,
                           jsonb_build_object('reward_type', v_c.reward_type));
  return jsonb_build_object('ok', true, 'reward_type', v_c.reward_type);
end $$;

create function public.fmp_admin_cancel_claim(p_code text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := public.fmp_assert_staff(true);
  v_c public.reward_claims;
  v_event uuid;
begin
  update public.reward_claims
    set status = 'cancelled', cancelled_at = now()
    where claim_code = public.fmp_normalize_code(p_code) and status = 'claimed'
    returning * into v_c;
  if v_c.id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_cancellable');
  end if;
  select event_id into v_event from public.player_games where id = v_c.player_game_id;
  update public.reward_inventory set reserved_quantity = reserved_quantity - 1
    where event_id = v_event and reward_type = v_c.reward_type;
  perform public.fmp_audit('claim_cancelled', 'reward_claim', v_c.id::text, null);
  return jsonb_build_object('ok', true);
end $$;

create function public.fmp_admin_stats(p_event_slug text) returns jsonb
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
                     join public.player_games g on g.id = s.player_game_id where g.event_id = v_ev.id),
    'by_stamp_count', (
      select coalesce(jsonb_object_agg(n::text, c), '{}'::jsonb) from (
        select coalesce(sc.n, 0) as n, count(*) as c
        from public.player_games g
        left join (select player_game_id, count(*) as n from public.player_stamps group by 1) sc
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

create function public.fmp_admin_list_qrs(p_event_slug text) returns jsonb
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
    'label', label, 'status', status, 'destination_path', destination_path) order by label), '[]'::jsonb)
    from public.game_qrs where event_id = v_ev.id);
end $$;

create function public.fmp_admin_set_event_status(p_event_slug text, p_status text) returns jsonb
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
    if v_ready <> public.fmp_cfg_int(v_ev.config, '{qr_total}', 10) then
      raise exception 'event_not_ready';
    end if;
  end if;
  update public.game_events set status = p_status where id = v_ev.id;
  perform public.fmp_audit('event_status_changed', 'game_event', v_ev.id::text,
                           jsonb_build_object('from', v_ev.status, 'to', p_status));
  return jsonb_build_object('ok', true, 'status', p_status);
end $$;

create function public.fmp_admin_set_qr_status(p_event_slug text, p_label integer, p_status text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_ev public.game_events;
  v_id uuid;
begin
  perform public.fmp_assert_staff(true);
  if p_status not in ('active', 'disabled', 'revoked') then
    raise exception 'invalid_input';
  end if;
  select * into v_ev from public.game_events where slug = p_event_slug;
  if not found then
    raise exception 'event_not_found';
  end if;
  update public.game_qrs set status = p_status
    where event_id = v_ev.id and label = p_label returning id into v_id;
  if v_id is null then
    raise exception 'qr_not_found';
  end if;
  perform public.fmp_audit('qr_status_changed', 'game_qr', v_id::text,
                           jsonb_build_object('label', p_label, 'to', p_status));
  return jsonb_build_object('ok', true);
end $$;

create function public.fmp_admin_set_destination(p_event_slug text, p_label integer, p_path text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_ev public.game_events;
  v_id uuid;
begin
  perform public.fmp_assert_staff(true);
  select * into v_ev from public.game_events where slug = p_event_slug;
  if not found then
    raise exception 'event_not_found';
  end if;
  begin
    update public.game_qrs set destination_path = p_path
      where event_id = v_ev.id and label = p_label returning id into v_id;
  exception when check_violation then
    raise exception 'invalid_input';
  end;
  if v_id is null then
    raise exception 'qr_not_found';
  end if;
  perform public.fmp_audit('qr_destination_changed', 'game_qr', v_id::text,
                           jsonb_build_object('label', p_label, 'path', p_path));
  return jsonb_build_object('ok', true);
end $$;

create function public.fmp_admin_set_inventory(p_event_slug text, p_reward_type text, p_total integer) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_ev public.game_events;
  v_inv public.reward_inventory;
begin
  perform public.fmp_assert_staff(true);
  select * into v_ev from public.game_events where slug = p_event_slug;
  if not found then
    raise exception 'event_not_found';
  end if;
  if p_total is null or p_total < 0 or (v_ev.config #> array['rewards', coalesce(p_reward_type, '')]) is null then
    raise exception 'invalid_input';
  end if;
  select * into v_inv from public.reward_inventory
    where event_id = v_ev.id and reward_type = p_reward_type for update;
  if found and p_total < v_inv.reserved_quantity + v_inv.redeemed_quantity then
    raise exception 'invalid_input';
  end if;
  insert into public.reward_inventory (event_id, reward_type, total_quantity)
    values (v_ev.id, p_reward_type, p_total)
    on conflict (event_id, reward_type) do update set total_quantity = excluded.total_quantity;
  perform public.fmp_audit('inventory_set', 'reward_inventory', v_ev.id::text || ':' || p_reward_type,
                           jsonb_build_object('total', p_total));
  return jsonb_build_object('ok', true);
end $$;

-- Membuat token baru untuk 10 QR dan MENGEMBALIKANNYA SEKALI. Token lama tidak berlaku lagi.
-- Hanya admin; saat event sudah aktif wajib p_confirm_active (QR yang sudah dicetak jadi tidak valid).
create function public.fmp_admin_rotate_tokens(p_event_slug text, p_confirm_active boolean default false) returns jsonb
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
  for v_row in select id, label, destination_path from public.game_qrs where event_id = v_ev.id order by label loop
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

-- ————————————————————————————————————————————————
-- Hak eksekusi: default-nya PUBLIC boleh memanggil semua fungsi. Cabut semuanya, lalu beri
-- hanya RPC yang memang dipanggil klien (itupun hanya 'authenticated').
-- ————————————————————————————————————————————————

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'fmp\_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', r.sig);
  end loop;
end $$;

grant execute on function
  public.fmp_get_progress(text),
  public.fmp_start_game(text),
  public.fmp_scan_qr(text, text),
  public.fmp_begin_challenge(uuid),
  public.fmp_complete_challenge(uuid, integer, integer, integer),
  public.fmp_create_reward_claim(text, text),
  public.fmp_staff_role(),
  public.fmp_lookup_claim(text),
  public.fmp_redeem_reward(text),
  public.fmp_admin_cancel_claim(text),
  public.fmp_admin_stats(text),
  public.fmp_admin_list_qrs(text),
  public.fmp_admin_set_event_status(text, text),
  public.fmp_admin_set_qr_status(text, integer, text),
  public.fmp_admin_set_destination(text, integer, text),
  public.fmp_admin_set_inventory(text, text, integer),
  public.fmp_admin_rotate_tokens(text, boolean)
  to authenticated;
