import { config } from "../config.js";
import { supabaseAdmin } from "../lib/supabase.js";

export async function requireUser(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token || !supabaseAdmin) {
      return res.status(401).json({ ok: false, error: "Sessao obrigatoria." });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ ok: false, error: "Sessao invalida." });
    }

    req.authUser = data.user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAdmin(req, res, next) {
  try {
    const adminPassword = req.headers["x-admin-password"];

    if (config.adminPassword && adminPassword === config.adminPassword) {
      req.adminAccess = { method: "password" };
      return next();
    }

    const token = getBearerToken(req);
    if (!token || !supabaseAdmin) {
      return res.status(401).json({ ok: false, error: "Acesso admin obrigatorio." });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ ok: false, error: "Sessao admin invalida." });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("id", data.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Somente a criadora pode acessar." });
    }

    req.authUser = data.user;
    req.adminAccess = { method: "supabase-role" };
    next();
  } catch (error) {
    next(error);
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}
