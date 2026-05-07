import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, hasSupabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(hasSupabase);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn({ email, password }) {
    if (!supabase) {
      setSession({
        access_token: "demo-token",
        user: { email, user_metadata: { username: email.split("@")[0] } },
      });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp({ email, password, username }) {
    if (!supabase) {
      setSession({
        access_token: "demo-token",
        user: { email, user_metadata: { username } },
      });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, role: "user" } },
    });
    if (error) throw error;
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      token: session?.access_token || null,
      loading,
      signIn,
      signUp,
      signOut,
      mode: hasSupabase ? "supabase" : "demo-local",
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider.");
  return context;
}
