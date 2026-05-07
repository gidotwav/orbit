import { supabaseAdmin } from "../lib/supabase.js";

const fallbackSettings = {
  play_multiplier: 100,
  unique_multiplier: 1000,
  chart_play_weight: 0.6,
  chart_unique_weight: 0.4,
  max_plays_per_song_per_hour: 5,
};

export async function getSettings() {
  if (!supabaseAdmin) return fallbackSettings;

  const { data, error } = await supabaseAdmin.from("settings").select("key, value");
  if (error) throw error;

  return data.reduce((acc, row) => {
    acc[row.key] = Number(row.value);
    return acc;
  }, { ...fallbackSettings });
}

export async function updateSettings(patch) {
  if (!supabaseAdmin) return { ...fallbackSettings, ...patch };

  const rows = Object.entries(patch).map(([key, value]) => ({
    key,
    value,
  }));

  const { error } = await supabaseAdmin.from("settings").upsert(rows, { onConflict: "key" });
  if (error) throw error;
  return getSettings();
}

export function inflateStats({ playsRaw, uniqueRaw, settings }) {
  const playsDisplay = playsRaw * settings.play_multiplier;
  const uniqueDisplay =
    Math.floor(uniqueRaw / 10) * 10 * settings.unique_multiplier;
  const score =
    playsDisplay * settings.chart_play_weight +
    uniqueDisplay * settings.chart_unique_weight;

  return {
    plays_display: playsDisplay,
    unique_display: uniqueDisplay,
    score,
  };
}
