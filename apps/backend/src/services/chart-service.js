import { demoSongs } from "../demo-data.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { getSettings, inflateStats } from "./settings-service.js";

const chartPeriods = {
  hourly: { limit: 100 },
  daily: { limit: 100 },
  weekly: { limit: 100 },
};

export function normalizeChartType(type) {
  return ["hourly", "daily", "weekly"].includes(type) ? type : "hourly";
}

export async function getLatestChart(type) {
  const chartType = normalizeChartType(type);

  if (!supabaseAdmin) {
    return { source: "demo-local", data: demoChart(chartType) };
  }

  const { data: latest, error: latestError } = await supabaseAdmin
    .from("chart_snapshots")
    .select("snapshot_at")
    .eq("chart_type", chartType)
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) throw latestError;
  if (!latest?.snapshot_at) return { source: "supabase", data: [] };

  const { data, error } = await supabaseAdmin
    .from("chart_snapshots")
    .select(
      "id, chart_type, position, variation, peak_position, plays_display, unique_display, score, snapshot_at, songs(id, title, duration_seconds, cover_url, genre, feat, artist_profiles(id, stage_name, photo_url, verified))",
    )
    .eq("chart_type", chartType)
    .eq("snapshot_at", latest.snapshot_at)
    .order("position", { ascending: true });

  if (error) throw error;
  return { source: "supabase", data };
}

export async function calculateAndSaveChart(type) {
  const chartType = normalizeChartType(type);

  if (!supabaseAdmin) {
    return { source: "demo-local", data: demoChart(chartType) };
  }

  const settings = await getSettings();
  const period = chartPeriods[chartType];
  const { periodStart, periodEnd, snapshotAt } = getChartWindow(chartType);
  const previousBySong = await getPreviousPositions(chartType);

  const { data: songs, error: songsError } = await supabaseAdmin
    .from("songs")
    .select("id, title, active")
    .eq("active", true);

  if (songsError) throw songsError;

  const rows = [];

  for (const song of songs) {
    const { data: plays, error: playsError } = await supabaseAdmin
      .from("plays")
      .select("id, user_id, session_id")
      .eq("song_id", song.id)
      .gte("played_at", periodStart.toISOString())
      .lte("played_at", periodEnd.toISOString());

    if (playsError) throw playsError;

    const playsRaw = plays.length;
    const uniqueRaw = new Set(
      plays.map((play) => play.user_id || play.session_id).filter(Boolean),
    ).size;

    const inflated = inflateStats({ playsRaw, uniqueRaw, settings });

    rows.push({
      song_id: song.id,
      chart_type: chartType,
      position: 0,
      plays_display: inflated.plays_display,
      unique_display: inflated.unique_display,
      score: inflated.score,
      snapshot_at: snapshotAt.toISOString(),
      peak_position: null,
      variation: "NEW",
      previous_position: null,
      variation_value: null,
      is_new: true,
      plays_raw: playsRaw,
      unique_raw: uniqueRaw,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    });
  }

  const rankedRows = rows
    .sort((a, b) => b.score - a.score)
    .slice(0, period.limit)
    .map((row, index) => {
      const position = index + 1;
      const previous = previousBySong.get(row.song_id);
      const variationValue = previous?.position ? previous.position - position : null;
      const variation = getVariation(previous?.position, position);
      const previousPeak = previous?.peak_position || previous?.position || position;

      return {
        ...row,
        position,
        variation,
        previous_position: previous?.position || null,
        variation_value: variationValue,
        is_new: !previous,
        peak_position: Math.min(previousPeak, position),
      };
    });

  if (rankedRows.length) {
    await upsertChartRows(rankedRows);
  }

  return getLatestChart(chartType);
}

function demoChart(chartType) {
  return demoSongs
    .map((song) => {
      const playsDisplay = song.plays_raw * 100;
      const uniqueDisplay = Math.floor(song.unique_raw / 10) * 10000;
      return {
        ...song,
        plays_display: playsDisplay,
        unique_display: uniqueDisplay,
        score: playsDisplay * 0.6 + uniqueDisplay * 0.4,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((song, index) => ({
      position: index + 1,
      variation: index === 0 ? "NEW" : "=",
      chart_type: chartType,
      snapshot_at: new Date().toISOString(),
      song,
    }));
}

async function upsertChartRows(rows) {
  const { error } = await supabaseAdmin
    .from("chart_snapshots")
    .upsert(rows, { onConflict: "song_id,chart_type,snapshot_at" });

  if (!error) return;

  const missingProfessionalColumns =
    error.message?.includes("previous_position") ||
    error.message?.includes("variation_value") ||
    error.message?.includes("is_new") ||
    error.message?.includes("plays_raw") ||
    error.message?.includes("period_start");

  if (!missingProfessionalColumns) throw error;

  const legacyRows = rows.map((row) => ({
    song_id: row.song_id,
    chart_type: row.chart_type,
    position: row.position,
    plays_display: row.plays_display,
    unique_display: row.unique_display,
    score: row.score,
    snapshot_at: row.snapshot_at,
    peak_position: row.peak_position,
    variation: row.variation,
  }));

  const { error: legacyError } = await supabaseAdmin
    .from("chart_snapshots")
    .upsert(legacyRows, { onConflict: "song_id,chart_type,snapshot_at" });

  if (legacyError) throw legacyError;
}

async function getPreviousPositions(chartType) {
  const { data: latest } = await supabaseAdmin
    .from("chart_snapshots")
    .select("snapshot_at")
    .eq("chart_type", chartType)
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.snapshot_at) return new Map();

  const { data, error } = await supabaseAdmin
    .from("chart_snapshots")
    .select("song_id, position, peak_position")
    .eq("chart_type", chartType)
    .eq("snapshot_at", latest.snapshot_at);

  if (error) throw error;
  return new Map(data.map((row) => [row.song_id, row]));
}

function getVariation(previousPosition, currentPosition) {
  if (!previousPosition) return "NEW";
  const diff = previousPosition - currentPosition;
  if (diff > 0) return `UP ${diff}`;
  if (diff < 0) return `DOWN ${Math.abs(diff)}`;
  return "=";
}

function getChartWindow(chartType) {
  const now = new Date();

  if (chartType === "hourly") {
    const snapshotAt = new Date(now);
    snapshotAt.setMinutes(0, 0, 0);
    return {
      periodStart: new Date(now.getTime() - 60 * 60 * 1000),
      periodEnd: now,
      snapshotAt,
    };
  }

  if (chartType === "daily") {
    const periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);
    return {
      periodStart,
      periodEnd: now,
      snapshotAt: periodStart,
    };
  }

  const periodStart = new Date(now);
  const day = now.getDay();
  const daysSinceMonday = (day + 6) % 7;
  periodStart.setDate(now.getDate() - daysSinceMonday);
  periodStart.setHours(0, 0, 0, 0);

  return {
    periodStart,
    periodEnd: now,
    snapshotAt: periodStart,
  };
}
