-- Professional play/chart metrics for Orbitune.
-- Run this after 001_schema_rls.sql and 002_seed.sql.

alter table public.chart_snapshots
  add column if not exists previous_position integer,
  add column if not exists variation_value integer,
  add column if not exists is_new boolean not null default false,
  add column if not exists plays_raw numeric not null default 0,
  add column if not exists unique_raw numeric not null default 0,
  add column if not exists period_start timestamptz,
  add column if not exists period_end timestamptz;

alter table public.songs
  add column if not exists release_date date;

update public.songs
set release_date = created_at::date
where release_date is null;

insert into public.settings (key, value, description) values
  ('unique_listener_divisor', '10', 'Real unique listeners required for one displayed listener block.'),
  ('unique_listener_block', '10000', 'Displayed unique listeners per divisor block.'),
  ('max_plays_per_user_per_hour', '10', 'Anti-spam cap per user/session per song per hour.'),
  ('min_seconds_to_count', '10', 'Minimum listened seconds required before registering one play.')
on conflict (key) do update
set value = excluded.value,
    description = excluded.description;
