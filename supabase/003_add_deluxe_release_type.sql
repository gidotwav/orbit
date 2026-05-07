-- Run this after 001_schema_rls.sql if you want "deluxe" as a real album type.
-- Supabase/PostgreSQL enums are strict, so this migration adds the new value.

alter type public.album_type add value if not exists 'deluxe';
