import React from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  BarChart3,
  Compass,
  Heart,
  Home,
  Library,
  ListMusic,
  LockKeyhole,
  Radio,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PlayerBar } from "./PlayerBar";

const navItems = [
  { to: "/", label: "Browse", icon: Compass },
  { to: "/charts", label: "Charts", icon: BarChart3 },
  { to: "/home", label: "Home", icon: Home },
  { to: "/library", label: "Library", icon: Library },
  { to: "/stats", label: "Stats", icon: Sparkles },
  { to: "/dashboard", label: "Artist", icon: Radio },
  { to: "/admin", label: "Admin", icon: LockKeyhole },
];

export function AppShell() {
  const { user, signOut, mode } = useAuth();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#f6eadf_0,#d9cecb_34%,#b8aaa9_100%)] p-4 text-[#282425] md:p-7">
      <section className="mx-auto grid min-h-[calc(100vh-56px)] max-w-7xl overflow-hidden rounded-[30px] bg-white/88 shadow-[0_30px_100px_rgba(57,45,45,0.28)] backdrop-blur-xl md:grid-cols-[238px_1fr]">
        <aside className="bg-[#4b4647] p-6 text-white md:p-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#f4ef62] font-black text-[#2b2b1f]">
              O
            </span>
            <div>
              <h1 className="text-xl font-black">Orbitune</h1>
              <p className="text-xs text-white/50">{mode}</p>
            </div>
          </Link>

          <nav className="mt-11 grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                    isActive ? "bg-black/20 text-white" : "text-white/58 hover:bg-white/8 hover:text-white",
                  ].join(" ")
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-3xl bg-black/18 p-4">
            <div className="flex items-center gap-3">
              <UserRound size={18} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user?.email || "Visitante"}</p>
                <p className="text-xs text-white/45">Sessao musical</p>
              </div>
            </div>
            {user ? (
              <button className="mt-4 w-full rounded-2xl bg-white/10 px-4 py-2 text-sm" onClick={signOut}>
                Sair
              </button>
            ) : (
              <Link className="mt-4 block rounded-2xl bg-[#f4ef62] px-4 py-2 text-center text-sm font-black text-[#2b2b1f]" to="/login">
                Entrar
              </Link>
            )}
          </div>
        </aside>

        <section className="grid min-w-0 grid-rows-[auto_1fr_auto]">
          <header className="flex flex-col gap-4 border-b border-black/5 px-5 py-5 md:flex-row md:items-center md:px-8">
            <label className="flex h-11 flex-1 items-center gap-3 rounded-2xl bg-[#f5f1ef] px-4 text-sm text-black/45">
              <Search size={18} />
              <input
                className="w-full bg-transparent text-[#282425] outline-none placeholder:text-black/35"
                placeholder="Buscar musicas, artistas, playlists"
              />
            </label>
            <div className="flex items-center gap-2 text-sm text-black/45">
              <Heart size={18} />
              <ListMusic size={18} />
            </div>
          </header>

          <div className="min-w-0 overflow-y-auto px-5 py-6 pb-28 md:px-8">
            <Outlet />
          </div>

          <PlayerBar />
        </section>
      </section>
    </main>
  );
}
