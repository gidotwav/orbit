import { supabaseAdmin } from "../lib/supabase.js";

const preferredChartTypes = ["daily", "hourly", "weekly"];

export async function getPublishedStatsForSongs(songIds) {
  const ids = [...new Set((songIds || []).filter(Boolean))];
  if (!supabaseAdmin || !ids.length) return new Map();

  const publishedBySong = new Map();

  for (const chartType of preferredChartTypes) {
    const missingIds = ids.filter((id) => !publishedBySong.has(id));
    if (!missingIds.length) break;

    const snapshotAt = await getLatestSnapshotAt(chartType);
    if (!snapshotAt) continue;

    const { data, error } = await supabaseAdmin
      .from("chart_snapshots")
      .select("song_id, chart_type, position, plays_display, unique_display, snapshot_at")
      .eq("chart_type", chartType)
      .eq("snapshot_at", snapshotAt)
      .in("song_id", missingIds);

    if (error) throw error;
    for (const row of data || []) {
      publishedBySong.set(row.song_id, {
        chart_type: row.chart_type,
        chart_position: row.position,
        plays_display: row.plays_display,
        unique_display: row.unique_display,
        published_at: row.snapshot_at,
      });
    }
  }

  return publishedBySong;
}

export async function getPublishedStatsForSong(songId) {
  const stats = await getPublishedStatsForSongs([songId]);
  return stats.get(songId) || {
    chart_type: null,
    chart_position: null,
    plays_display: 0,
    unique_display: 0,
    published_at: null,
  };
}

async function getLatestSnapshotAt(chartType) {
  const { data, error } = await supabaseAdmin
    .from("chart_snapshots")
    .select("snapshot_at")
    .eq("chart_type", chartType)
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.snapshot_at || null;
}
