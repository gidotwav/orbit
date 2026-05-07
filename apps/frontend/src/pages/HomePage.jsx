import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Sparkles } from "lucide-react";
import { apiFetch } from "../lib/api";
import { ChartList } from "../components/ChartList";

export function HomePage({ personalized = false }) {
  const [chart, setChart] = useState([]);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    apiFetch("/api/charts/hourly")
      .then((payload) => setChart(payload.data || []))
      .catch(() => setChart([]));
    apiFetch("/api/artists")
      .then((payload) => setArtists(payload.data || []))
      .catch(() => setArtists([]));
  }, []);

  return (
    <div className="grid gap-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="relative overflow-hidden rounded-[28px] bg-[#a4421f] p-8 text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.22em]">Curated playlist</p>
          <h2 className="mt-3 max-w-xl text-5xl font-black leading-none">
            {personalized ? "Seu feed musical" : "Blinding Light"}
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/72">
            Charts horarios, debuts dramaticos e campanhas infladas para transformar cada play em evento.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#f4ef62] px-5 py-3 text-sm font-black text-[#282425]">
              <Play size={16} fill="currentColor" /> Play
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-bold">
              <Plus size={16} /> Salvar
            </button>
          </div>
          <div className="absolute right-8 top-8 hidden size-40 rounded-full bg-black/20 ring-[26px] ring-white/10 md:block" />
        </div>

        <aside className="rounded-[28px] bg-[#f4f1ef] p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <h3 className="font-black">Now Playing</h3>
          </div>
          <div className="mt-4 aspect-square rounded-[24px] bg-[linear-gradient(135deg,#2b2a2b,#d97832)]" />
          <h4 className="mt-4 font-black">Snowfall</h4>
          <p className="text-sm text-black/45">Oneheart</p>
        </aside>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-black">Hourly chart</h3>
            <p className="text-sm text-black/45">Atualizado pelo backend em modo Supabase ou demo-local.</p>
          </div>
        </div>
        <ChartList chart={chart.slice(0, 5)} />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-black">Popular artists</h3>
            <p className="text-sm text-black/45">Perfis publicos aprovados pela criadora.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {artists.slice(0, 4).map((artist) => (
            <Link
              key={artist.id}
              to={`/artist/${artist.id}`}
              className="rounded-[26px] bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="mx-auto size-24 rounded-full bg-[linear-gradient(135deg,#4b4647,#f4ef62)]" />
              <h4 className="mt-3 truncate font-black">{artist.stage_name}</h4>
              <p className="text-xs text-black/45">@{artist.instagram || "orbitune"}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
