import { Router } from "express";
import { getSongStats, registerPlay } from "../services/play-service.js";

export const playRouter = Router();

playRouter.post("/", async (req, res, next) => {
  try {
    const result = await registerPlay({
      songId: req.body.song_id,
      userId: req.body.user_id || null,
      sessionId: req.body.session_id,
    });

    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

playRouter.get("/songs/:songId/stats", async (req, res, next) => {
  try {
    const result = await getSongStats(req.params.songId);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});
