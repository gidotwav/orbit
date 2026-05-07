import { supabaseAdmin } from "../lib/supabase.js";
import { getSettings } from "./settings-service.js";

export async function registerPlay({ songId, userId = null, sessionId }) {
  if (!songId || !sessionId) {
    const error = new Error("song_id e session_id sao obrigatorios.");
    error.status = 400;
    throw error;
  }

  if (!supabaseAdmin) {
    return {
      source: "demo-local",
      accepted: true,
      inflated_increment: 100,
    };
  }

  const settings = await getSettings();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

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

  if (count >= settings.max_plays_per_song_per_hour) {
    return {
      source: "supabase",
      accepted: false,
      reason: "hourly_cap_reached",
      max_plays_per_song_per_hour: settings.max_plays_per_song_per_hour,
      inflated_increment: 0,
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
    inflated_increment: settings.play_multiplier,
  };
}

export async function getSongStats(songId) {
  if (!supabaseAdmin) {
    return { source: "demo-local", song_id: songId, plays_raw: 0, unique_raw: 0 };
  }

  const { data, error } = await supabaseAdmin
    .from("plays")
    .select("id, user_id, session_id")
    .eq("song_id", songId);

  if (error) throw error;

  return {
    source: "supabase",
    song_id: songId,
    plays_raw: data.length,
    unique_raw: new Set(data.map((play) => play.user_id || play.session_id).filter(Boolean)).size,
  };
}
