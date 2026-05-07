import { Router } from "express";
import { demoAlbums, demoArtists, demoSongs } from "../demo-data.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { getPublishedStatsForSong, getPublishedStatsForSongs } from "../services/published-stats-service.js";

export const publicRouter = Router();

publicRouter.get("/artists", async (_req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ ok: true, source: "demo-local", data: demoArtists });
    }

    const { data, error } = await supabaseAdmin
      .from("artist_profiles")
      .select("*")
      .not("approved_at", "is", null)
      .order("stage_name", { ascending: true });

    if (error) throw error;
    res.json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/artists/:id", async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      const artist = demoArtists.find((entry) => entry.id === req.params.id);
      const albums = demoAlbums.filter((entry) => entry.artist_id === req.params.id);
      const songs = demoSongs
        .filter((entry) => entry.artist_id === req.params.id)
        .map((song) => ({
          ...song,
          plays_display: song.plays_raw * 100,
          unique_display: Math.floor(song.unique_raw / 10) * 10000,
          plays_raw: undefined,
          unique_raw: undefined,
        }));
      return res.json({ ok: true, source: "demo-local", data: { artist, albums, songs } });
    }

    const { data: artist, error: artistError } = await supabaseAdmin
      .from("artist_profiles")
      .select("*")
      .eq("id", req.params.id)
      .not("approved_at", "is", null)
      .single();

    if (artistError) throw artistError;

    const { data: albums, error: albumsError } = await supabaseAdmin
      .from("albums")
      .select("*")
      .eq("artist_id", req.params.id)
      .order("release_date", { ascending: false });

    if (albumsError) throw albumsError;

    const { data: songs, error: songsError } = await supabaseAdmin
      .from("songs")
      .select("*")
      .eq("artist_id", req.params.id)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (songsError) throw songsError;

    const publishedStats = await getPublishedStatsForSongs(songs.map((song) => song.id));
    const songsWithPublishedStats = songs.map((song) => ({
      ...song,
      ...(publishedStats.get(song.id) || emptyPublishedStats()),
    }));

    res.json({ ok: true, source: "supabase", data: { artist, albums, songs: songsWithPublishedStats } });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/songs", async (_req, res, next) => {
  try {
    if (!supabaseAdmin) {
      const songs = demoSongs.map((song) => ({
        ...song,
        plays_display: song.plays_raw * 100,
        unique_display: Math.floor(song.unique_raw / 10) * 10000,
        plays_raw: undefined,
        unique_raw: undefined,
      }));
      return res.json({ ok: true, source: "demo-local", data: songs });
    }

    const { data, error } = await supabaseAdmin
      .from("songs")
      .select("id, title, duration_seconds, cover_url, genre, feat, active, artist_profiles(id, stage_name, photo_url, verified), albums(id, title, type)")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const publishedStats = await getPublishedStatsForSongs(data.map((song) => song.id));
    const songs = data.map((song) => ({
      ...song,
      ...(publishedStats.get(song.id) || emptyPublishedStats()),
    }));

    res.json({ ok: true, source: "supabase", data: songs });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/songs/:id", async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      const song = demoSongs.find((entry) => entry.id === req.params.id);
      const artist = demoArtists.find((entry) => entry.id === song?.artist_id);
      const album = demoAlbums.find((entry) => entry.id === song?.album_id);
      const inflated = song
        ? {
            ...song,
            plays_display: song.plays_raw * 100,
            unique_display: Math.floor(song.unique_raw / 10) * 10000,
            plays_raw: undefined,
            unique_raw: undefined,
          }
        : null;
      return res.json({ ok: true, source: "demo-local", data: { song: inflated, artist, album } });
    }

    const { data, error } = await supabaseAdmin
      .from("songs")
      .select("*, artist_profiles(*), albums(*)")
      .eq("id", req.params.id)
      .eq("active", true)
      .single();

    if (error) throw error;

    const stats = await getPublishedStatsForSong(req.params.id);

    res.json({
      ok: true,
      source: "supabase",
      data: {
        song: {
          ...data,
          plays_display: stats.plays_display,
          unique_display: stats.unique_display,
        },
        artist: data.artist_profiles,
        album: data.albums,
      },
    });
  } catch (error) {
    next(error);
  }
});

function emptyPublishedStats() {
  return {
    chart_type: null,
    chart_position: null,
    plays_display: 0,
    unique_display: 0,
    published_at: null,
  };
}
