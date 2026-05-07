-- Orbitune seed data for local/demo Supabase projects.
-- This file is safe to run before real Supabase Auth accounts exist.
-- Artist accounts are linked later by the admin after users are created via Auth.

insert into public.artist_profiles (id, user_id, stage_name, bio, photo_url, instagram, verified, approved_at) values
  (
    '20000000-0000-4000-8000-000000000001',
    null,
    'LUNA.EXE',
    'Pop digital, synth drama e debuts feitos para dominar a madrugada.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    'luna.exe',
    true,
    now() - interval '20 days'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    null,
    'Mika Vale',
    'R&B futurista com refroes grandes e campanhas de chart barulhentas.',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
    'mikavale',
    true,
    now() - interval '12 days'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    null,
    'SORA9',
    'Projeto visual de dance-pop, radio edits e lore espacial.',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91',
    'sora9.world',
    true,
    now() - interval '8 days'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    null,
    'Nova Dusk',
    'Solicitacao pendente para entrar no catalogo oficial.',
    null,
    'novadusk',
    false,
    null
  )
on conflict (id) do update
set stage_name = excluded.stage_name,
    bio = excluded.bio,
    instagram = excluded.instagram,
    verified = excluded.verified,
    approved_at = excluded.approved_at;

insert into public.albums (id, artist_id, title, cover_url, release_date, type) values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Velvet Orbit',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    current_date - 1,
    'single'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'Pink Index',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
    current_date - 3,
    'EP'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000003',
    'Zero Gravity',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    current_date - 6,
    'single'
  )
on conflict (id) do update
set title = excluded.title,
    cover_url = excluded.cover_url,
    release_date = excluded.release_date,
    type = excluded.type;

insert into public.songs (id, album_id, artist_id, title, duration_seconds, audio_url, cover_url, genre, feat, active, created_at) values
  (
    '40000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Velvet Orbit',
    196,
    'https://example.com/audio/velvet-orbit.mp3',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    'Synth Pop',
    null,
    true,
    now() - interval '26 hours'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'Drama Signal',
    181,
    'https://example.com/audio/drama-signal.mp3',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
    'R&B Pop',
    'LUNA.EXE',
    true,
    now() - interval '3 days'
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000003',
    'Zero Gravity',
    204,
    'https://example.com/audio/zero-gravity.mp3',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    'Dance Pop',
    null,
    true,
    now() - interval '6 days'
  )
on conflict (id) do update
set title = excluded.title,
    active = excluded.active,
    genre = excluded.genre,
    feat = excluded.feat;

insert into public.plays (song_id, user_id, played_at, session_id)
select
  song_id,
  null,
  now() - (random() * interval '23 hours') as played_at,
  'seed-session-' || user_slot::text
from (
  select
    '40000000-0000-4000-8000-000000000001'::uuid as song_id,
    generate_series(1, 44) as user_slot
  union all
  select
    '40000000-0000-4000-8000-000000000002'::uuid,
    generate_series(1, 36)
  union all
  select
    '40000000-0000-4000-8000-000000000003'::uuid,
    generate_series(1, 28)
) seed_plays
where not exists (
  select 1
  from public.plays p
  where p.song_id = seed_plays.song_id
    and p.session_id like 'seed-session-%'
);

insert into public.chart_snapshots (
  song_id,
  chart_type,
  position,
  plays_display,
  unique_display,
  score,
  snapshot_at,
  peak_position,
  variation
)
select
  ranked.song_id,
  'hourly'::public.chart_type,
  ranked.position,
  ranked.plays_display,
  ranked.unique_display,
  ranked.score,
  date_trunc('hour', now()),
  ranked.position,
  'NEW'
from (
  select
    stats.song_id,
    row_number() over (order by public.chart_score(stats.plays_raw, stats.unique_raw) desc) as position,
    public.plays_display(stats.plays_raw) as plays_display,
    public.unique_display(stats.unique_raw) as unique_display,
    public.chart_score(stats.plays_raw, stats.unique_raw) as score
  from (
    select
      s.id as song_id,
      count(p.id)::numeric as plays_raw,
      count(distinct coalesce(p.user_id::text, p.session_id))::numeric as unique_raw
    from public.songs s
    left join public.plays p
      on p.song_id = s.id
      and p.played_at >= now() - interval '1 hour'
    where s.active = true
    group by s.id
  ) stats
) ranked
on conflict (song_id, chart_type, snapshot_at) do update
set position = excluded.position,
    plays_display = excluded.plays_display,
    unique_display = excluded.unique_display,
    score = excluded.score,
    peak_position = excluded.peak_position,
    variation = excluded.variation;
