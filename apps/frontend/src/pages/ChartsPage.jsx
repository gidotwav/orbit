import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { ChartList } from "../components/ChartList";

const tabs = [
  { id: "hourly", label: "Horario" },
  { id: "daily", label: "Diario" },
  { id: "weekly", label: "Semanal" },
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
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">Orbitune Top 100</p>
          <h2 className="mt-2 text-4xl font-black">Charts</h2>
          <p className="mt-2 text-sm text-black/45">Fonte atual: {source}</p>
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

      <div className="mt-6">
        <ChartList chart={chart} />
      </div>
    </div>
  );
}
