import { Router } from "express";
import { supabaseAuth } from "../lib/supabase.js";

export const authRouter = Router();

authRouter.post("/signup", async (req, res, next) => {
  try {
    if (!supabaseAuth) {
      return res.status(503).json({ ok: false, error: "Supabase Auth nao configurado." });
    }

    const { email, password, username } = req.body;
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: "user",
        },
      },
    });

    if (error) throw error;
    res.json({ ok: true, user: data.user, session: data.session });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/signin", async (req, res, next) => {
  try {
    if (!supabaseAuth) {
      return res.status(503).json({ ok: false, error: "Supabase Auth nao configurado." });
    }

    const { email, password } = req.body;
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error) throw error;
    res.json({ ok: true, user: data.user, session: data.session });
  } catch (error) {
    next(error);
  }
});
