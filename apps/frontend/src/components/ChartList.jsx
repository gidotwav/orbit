import React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Link } from "react-router-dom";

export function ChartList({ chart = [], compact = false }) {
  if (!chart.length) {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-6 text-sm text-black/45">
        Nenhum chart carregado ainda.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {chart.map((entry) => {
        const song = entry.song || entry.songs || {};
        const artistProfile = song.artist_profiles || {};
        const artist = song.artist || artistProfile.stage_name || "Artista";
        const streams = Number(song.plays_display || entry.plays_display || 0);
        const songId = song.id;
        const artistId = song.artist_id || artistProfile.id;

        return (
          <article
            key={`${entry.chart_type}-${entry.position}-${song.id || song.title}`}
            className="grid grid-cols-[42px_48px_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-black/5 bg-white p-3 shadow-sm"
          >
            <strong className="text-center text-lg">#{entry.position}</strong>
            <div className="size-12 rounded-2xl bg-[linear-gradient(135deg,#a4421f,#f4ef62)]" />
            <div className="min-w-0">
              <h4 className="truncate font-black">
                {songId ? <Link to={`/song/${songId}`}>{song.title || "Musica"}</Link> : song.title || "Musica"}
              </h4>
              <p className="truncate text-sm text-black/45">
                {artistId ? <Link to={`/artist/${artistId}`}>{artist}</Link> : artist}
              </p>
            </div>
            <div className="text-right">
              <Variation value={entry.variation} />
              {!compact && <p className="mt-1 text-xs text-black/42">{streams.toLocaleString("pt-BR")} streams</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Variation({ value = "=" }) {
  if (value === "NEW") {
    return <span className="rounded-full bg-[#f4ef62] px-3 py-1 text-xs font-black text-[#282425]">NEW</span>;
  }

  if (value.startsWith("UP")) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-600">
        <ArrowUp size={14} /> {value.replace("UP ", "")}
      </span>
    );
  }

  if (value.startsWith("DOWN")) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-black text-rose-600">
        <ArrowDown size={14} /> {value.replace("DOWN ", "")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-sm font-black text-black/35">
      <Minus size={14} />
    </span>
  );
}
