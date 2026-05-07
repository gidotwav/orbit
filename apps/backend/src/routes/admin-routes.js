import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { calculateAndSaveChart } from "../services/chart-service.js";
import { getSettings, updateSettings } from "../services/settings-service.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/", (_req, res) => {
  res.json({ ok: true, area: "admin", message: "Painel da criadora conectado." });
});

adminRouter.get("/artists", async (_req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local", data: [] });

    const { data, error } = await supabaseAdmin
      .from("artist_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/artists", async (req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local", data: req.body });

    const { data, error } = await supabaseAdmin
      .from("artist_profiles")
      .insert({
        user_id: req.body.user_id || null,
        stage_name: req.body.stage_name,
        bio: req.body.bio || null,
        photo_url: req.body.photo_url || null,
        instagram: req.body.instagram || null,
        verified: Boolean(req.body.verified),
        approved_at: req.body.approved ? new Date().toISOString() : null,
      })
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/artists/:id", async (req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local" });

    const patch = { ...req.body };
    if ("approved" in patch) {
      patch.approved_at = patch.approved ? new Date().toISOString() : null;
      delete patch.approved;
    }

    const { data, error } = await supabaseAdmin
      .from("artist_profiles")
      .update(patch)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/albums", async (_req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local", data: [] });

    const { data, error } = await supabaseAdmin
      .from("albums")
      .select("*, artist_profiles(stage_name)")
      .order("release_date", { ascending: false });

    if (error) throw error;
    res.json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/albums", async (req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local", data: req.body });

    const normalizedType = normalizeAlbumType(req.body.type);
    const { data, error } = await supabaseAdmin
      .from("albums")
      .insert({
        artist_id: req.body.artist_id,
        title: req.body.title,
        cover_url: req.body.cover_url || null,
        release_date: req.body.release_date || new Date().toISOString().slice(0, 10),
        type: normalizedType,
      })
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/albums/:id", async (req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local" });

    const patch = { ...req.body };
    if (patch.type) patch.type = normalizeAlbumType(patch.type);

    const { data, error } = await supabaseAdmin
      .from("albums")
      .update(patch)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/songs", async (_req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local", data: [] });

    const { data, error } = await supabaseAdmin
      .from("songs")
      .select("*, artist_profiles(stage_name), albums(title)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

function normalizeAlbumType(type) {
  if (type === "single" || type === "EP" || type === "album") return type;
  if (type === "ep") return "EP";
  return "album";
}

adminRouter.post("/songs", async (req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local", data: req.body });

    const { album_id, artist_id, title, duration_seconds, audio_url, cover_url, genre, feat, active } = req.body;
    const { data, error } = await supabaseAdmin
      .from("songs")
      .insert({
        album_id: album_id || null,
        artist_id,
        title,
        duration_seconds,
        audio_url,
        cover_url,
        genre,
        feat: feat || null,
        active: active !== false,
      })
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/songs/:id", async (req, res, next) => {
  try {
    if (!supabaseAdmin) return res.json({ ok: true, source: "demo-local" });

    const { data, error } = await supabaseAdmin
      .from("songs")
      .update(req.body)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ ok: true, source: "supabase", data });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/settings", async (_req, res, next) => {
  try {
    res.json({ ok: true, data: await getSettings() });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/settings", async (req, res, next) => {
  try {
    res.json({ ok: true, data: await updateSettings(req.body) });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/charts/:type/refresh", async (req, res, next) => {
  try {
    const result = await calculateAndSaveChart(req.params.type);
    res.json({ ok: true, refreshed: req.params.type, ...result });
  } catch (error) {
    next(error);
  }
});
