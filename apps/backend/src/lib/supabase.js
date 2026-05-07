import { createClient } from "@supabase/supabase-js";
import { config, hasSupabase } from "../config.js";

export const supabaseAdmin = hasSupabase
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

export const supabaseAuth =
  config.supabaseUrl && config.supabaseAnonKey
    ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;
