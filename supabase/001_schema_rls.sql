-- Orbitune / Melon-style fictional music platform
-- Etapa 1: Supabase schema, helper functions, indexes and Row Level Security.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('user', 'artist', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.album_type as enum ('single', 'EP', 'album');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.chart_type as enum ('hourly', 'daily', 'weekly');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  role public.user_role not null default 'user'
);

create table if not exists public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete set null,
  stage_name text not null unique,
  bio text,
  photo_url text,
  instagram text,
  verified boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artist_profiles(id) on delete cascade,
  title text not null,
  cover_url text,
  release_date date not null default current_date,
  type public.album_type not null default 'single',
  created_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.albums(id) on delete set null,
  artist_id uuid not null references public.artist_profiles(id) on delete cascade,
  title text not null,
  duration_seconds integer not null check (duration_seconds > 0),
  audio_url text,
  cover_url text,
  genre text,
  feat text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  played_at timestamptz not null default now(),
  session_id text
);

create table if not exists public.chart_snapshots (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  chart_type public.chart_type not null,
  position integer not null check (position > 0),
  plays_display numeric not null default 0,
  unique_display numeric not null default 0,
  score numeric not null default 0,
  snapshot_at timestamptz not null default now(),
  peak_position integer,
  variation text not null default 'NEW',
  unique (song_id, chart_type, snapshot_at)
);

create table if not exists public.liked_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  liked_at timestamptz not null default now(),
  unique (user_id, song_id)
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  cover_url text,
  public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.playlist_songs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  added_at timestamptz not null default now(),
  order_index integer not null default 0,
  unique (playlist_id, song_id)
);

create table if not exists public.play_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  played_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users(role);
create index if not exists artist_profiles_approved_idx on public.artist_profiles(approved_at) where approved_at is not null;
create index if not exists albums_artist_idx on public.albums(artist_id);
create index if not exists songs_artist_idx on public.songs(artist_id);
create index if not exists songs_album_idx on public.songs(album_id);
create index if not exists songs_active_idx on public.songs(active) where active = true;
create index if not exists plays_song_played_at_idx on public.plays(song_id, played_at desc);
create index if not exists plays_user_played_at_idx on public.plays(user_id, played_at desc);
create index if not exists plays_session_played_at_idx on public.plays(session_id, played_at desc);
create index if not exists chart_snapshots_lookup_idx on public.chart_snapshots(chart_type, snapshot_at desc, position);
create index if not exists liked_songs_user_idx on public.liked_songs(user_id);
create index if not exists playlists_user_idx on public.playlists(user_id);
create index if not exists playlist_songs_playlist_order_idx on public.playlist_songs(playlist_id, order_index);
create index if not exists play_history_user_played_at_idx on public.play_history(user_id, played_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_artist_owner(artist_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.artist_profiles ap
    where ap.id = artist_profile_id
      and ap.user_id = auth.uid()
  );
$$;

create or replace function public.setting_numeric(setting_key text, fallback numeric)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(value #>> '{}', '')::numeric,
    fallback
  )
  from public.settings
  where key = setting_key
  union all
  select fallback
  limit 1;
$$;

create or replace function public.plays_display(plays_raw numeric)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select plays_raw * public.setting_numeric('play_multiplier', 100);
$$;

create or replace function public.unique_display(unique_raw numeric)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select floor(unique_raw / 10) * 10 * public.setting_numeric('unique_multiplier', 1000);
$$;

create or replace function public.chart_score(plays_raw numeric, unique_raw numeric)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select
    (public.plays_display(plays_raw) * public.setting_numeric('chart_play_weight', 0.6))
    + (public.unique_display(unique_raw) * public.setting_numeric('chart_unique_weight', 0.4));
$$;

create or replace function public.touch_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists settings_touch_updated_at on public.settings;
create trigger settings_touch_updated_at
before update on public.settings
for each row execute function public.touch_settings_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, username, role, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, 'user'), '@', 1)),
    case
      when new.raw_user_meta_data ->> 'role' in ('user', 'artist', 'admin')
        then (new.raw_user_meta_data ->> 'role')::public.user_role
      else 'user'::public.user_role
    end,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.albums enable row level security;
alter table public.songs enable row level security;
alter table public.plays enable row level security;
alter table public.chart_snapshots enable row level security;
alter table public.liked_songs enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.play_history enable row level security;
alter table public.settings enable row level security;

drop policy if exists "users can read public profiles" on public.users;
create policy "users can read public profiles"
on public.users for select
using (true);

drop policy if exists "users can update self" on public.users;
create policy "users can update self"
on public.users for update
using (id = auth.uid())
with check (id = auth.uid() and role = (select role from public.users where id = auth.uid()));

drop policy if exists "admins manage users" on public.users;
create policy "admins manage users"
on public.users for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public reads approved artists" on public.artist_profiles;
create policy "public reads approved artists"
on public.artist_profiles for select
using (approved_at is not null or public.is_admin() or user_id = auth.uid());

drop policy if exists "admins manage artists" on public.artist_profiles;
create policy "admins manage artists"
on public.artist_profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "artists update own profile" on public.artist_profiles;
create policy "artists update own profile"
on public.artist_profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "public reads released albums" on public.albums;
create policy "public reads released albums"
on public.albums for select
using (
  public.is_admin()
  or public.is_artist_owner(artist_id)
  or exists (
    select 1
    from public.artist_profiles ap
    where ap.id = albums.artist_id
      and ap.approved_at is not null
  )
);

drop policy if exists "admins manage albums" on public.albums;
create policy "admins manage albums"
on public.albums for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public reads active songs" on public.songs;
create policy "public reads active songs"
on public.songs for select
using (
  public.is_admin()
  or public.is_artist_owner(artist_id)
  or (
    active = true
    and exists (
      select 1
      from public.artist_profiles ap
      where ap.id = songs.artist_id
        and ap.approved_at is not null
    )
  )
);

drop policy if exists "admins manage songs" on public.songs;
create policy "admins manage songs"
on public.songs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users insert own plays" on public.plays;
create policy "users insert own plays"
on public.plays for insert
with check (user_id = auth.uid() or user_id is null);

drop policy if exists "users read own plays" on public.plays;
create policy "users read own plays"
on public.plays for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "public reads chart snapshots" on public.chart_snapshots;
create policy "public reads chart snapshots"
on public.chart_snapshots for select
using (true);

drop policy if exists "admins manage chart snapshots" on public.chart_snapshots;
create policy "admins manage chart snapshots"
on public.chart_snapshots for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users manage own likes" on public.liked_songs;
create policy "users manage own likes"
on public.liked_songs for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "users read allowed playlists" on public.playlists;
create policy "users read allowed playlists"
on public.playlists for select
using (public = true or user_id = auth.uid() or public.is_admin());

drop policy if exists "users manage own playlists" on public.playlists;
create policy "users manage own playlists"
on public.playlists for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "users read playlist songs" on public.playlist_songs;
create policy "users read playlist songs"
on public.playlist_songs for select
using (
  exists (
    select 1
    from public.playlists p
    where p.id = playlist_songs.playlist_id
      and (p.public = true or p.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "users manage own playlist songs" on public.playlist_songs;
create policy "users manage own playlist songs"
on public.playlist_songs for all
using (
  exists (
    select 1
    from public.playlists p
    where p.id = playlist_songs.playlist_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.playlists p
    where p.id = playlist_songs.playlist_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "users manage own history" on public.play_history;
create policy "users manage own history"
on public.play_history for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "public reads safe settings" on public.settings;
create policy "public reads safe settings"
on public.settings for select
using (key in ('play_multiplier', 'unique_multiplier', 'chart_play_weight', 'chart_unique_weight'));

drop policy if exists "admins manage settings" on public.settings;
create policy "admins manage settings"
on public.settings for all
using (public.is_admin())
with check (public.is_admin());

insert into public.settings (key, value, description) values
  ('play_multiplier', '100', 'Public displayed streams added for each real registered play.'),
  ('unique_multiplier', '1000', 'Displayed unique listeners per real unique user inside each block of 10.'),
  ('chart_play_weight', '0.6', 'Chart score weight for inflated plays.'),
  ('chart_unique_weight', '0.4', 'Chart score weight for inflated unique listeners.'),
  ('max_plays_per_song_per_hour', '5', 'Anti-spam cap for one user/session playing the same song in one hour.')
on conflict (key) do update
set value = excluded.value,
    description = excluded.description;
