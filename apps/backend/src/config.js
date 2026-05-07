export const config = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "*",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  adminPassword: process.env.ADMIN_PASSWORD,
};

export const hasSupabase =
  Boolean(config.supabaseUrl) && Boolean(config.supabaseServiceRoleKey);
