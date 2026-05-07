import { supabaseAdmin } from "../lib/supabase.js";
import { getSettings } from "./settings-service.js";
import { getPublishedStatsForSong } from "./published-stats-service.js";

export async function registerPlay({ songId, userId = null, sessionId, secondsListened = 10 }) {
  if (!songId || !sessionId) {
    const error = new Error("song_id e session_id sao obrigatorios.");
    error.status = 400;
    throw error;
  }

  if (!supabaseAdmin) {
    return {
      source: "demo-local",
      accepted: true,
    };
  }

  const settings = await getSettings();
  const minSeconds = settings.min_seconds_to_count || 10;

  if (Number(secondsListened || 0) < minSeconds) {
    const error = new Error(`Play invalido: ouca pelo menos ${minSeconds}s.`);
    error.status = 400;
    throw error;
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const maxPlays = settings.max_plays_per_user_per_hour || settings.max_plays_per_song_per_hour || 10;

  let query = supabaseAdmin
    .from("plays")
    .select("id", { count: "exact", head: true })
    .eq("song_id", songId)
    .gte("played_at", oneHourAgo);

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("session_id", sessionId);
  }

  const { count, error: countError } = await query;
  if (countError) throw countError;

  if (count >= maxPlays) {
    return {
      source: "supabase",
      accepted: false,
      reason: "hourly_cap_reached",
      max_plays_per_user_per_hour: maxPlays,
    };
  }

  const { error } = await supabaseAdmin.from("plays").insert({
    song_id: songId,
    user_id: userId,
    session_id: sessionId,
  });

  if (error) throw error;

  if (userId) {
    await supabaseAdmin.from("play_history").insert({
      song_id: songId,
      user_id: userId,
    });
  }

  return {
    source: "supabase",
    accepted: true,
  };
}

export async function getSongStats(songId) {
  if (!supabaseAdmin) {
    return { source: "demo-local", song_id: songId, plays_display: 0, unique_display: 0 };
  }

  const published = await getPublishedStatsForSong(songId);

  return {
    source: "supabase",
    song_id: songId,
    ...published,
  };
}
