import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { ChartList } from "../components/ChartList";

const tabs = [
  {
    id: "hourly",
    label: "Horario",
    title: "Orbit Top Hourly",
    description: "O que explodiu na ultima hora.",
    accent: "from-[#a4421f] to-[#f4ef62]",
  },
  {
    id: "daily",
    label: "Diario",
    title: "Orbit Daily 100",
    description: "Debuts e estabilidade das ultimas 24h.",
    accent: "from-[#4b4647] to-[#d97832]",
  },
  {
    id: "weekly",
    label: "Semanal",
    title: "Orbit Weekly",
    description: "O placar oficial da semana.",
    accent: "from-[#1f2937] to-[#8fbf76]",
  },
];

export function ChartsPage() {
  const [type, setType] = useState("hourly");
  const [chart, setChart] = useState([]);
  const [source, setSource] = useState("...");

  useEffect(() => {
    apiFetch(`/api/charts/${type}`)
      .then((payload) => {
        setChart(payload.data || []);
        setSource(payload.source || "backend");
      })
      .catch(() => {
        setChart([]);
        setSource("offline");
      });
  }, [type]);

  return (
    <div className="grid gap-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">Chart playlists</p>
          <h2 className="mt-2 text-4xl font-black">Charts</h2>
          <p className="mt-2 text-sm text-black/45">Cards de ranking no estilo Spotify. Fonte atual: {source}</p>
        </div>

        <div className="inline-flex rounded-2xl bg-[#f4f1ef] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={[
                "rounded-xl px-4 py-2 text-sm font-bold",
                type === tab.id ? "bg-white shadow-sm" : "text-black/45",
              ].join(" ")}
              onClick={() => setType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={[
              "group overflow-hidden rounded-[28px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5",
              type === tab.id ? "ring-2 ring-[#282425]" : "",
            ].join(" ")}
            onClick={() => setType(tab.id)}
          >
            <div className={`aspect-square rounded-[24px] bg-gradient-to-br ${tab.accent} p-5 text-white`}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">Playlist</p>
              <h3 className="mt-14 text-2xl font-black leading-none">{tab.title}</h3>
            </div>
            <h4 className="mt-4 font-black">{tab.title}</h4>
            <p className="mt-1 text-sm text-black/45">{tab.description}</p>
          </button>
        ))}
      </section>

      <div>
        <div className="mb-4">
          <h3 className="text-2xl font-black">{tabs.find((tab) => tab.id === type)?.title}</h3>
          <p className="mt-1 text-sm text-black/45">Ranking publico com apenas numeros inflados.</p>
        </div>
        <ChartList chart={chart} />
      </div>
    </div>
  );
}
