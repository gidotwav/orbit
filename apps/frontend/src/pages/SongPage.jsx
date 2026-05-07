import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Pause, Play, Radio } from "lucide-react";
import { apiFetch } from "../lib/api";

export function SongPage() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  useEffect(() => {
    apiFetch(`/api/songs/${id}`)
      .then((response) => setPayload(response.data))
      .catch(() => setPayload(null));
  }, [id]);

  useEffect(() => () => clearTimers(), []);

  const song = payload?.song || payload;
  const artist = payload?.artist || payload?.artist_profiles;
  const album = payload?.album || payload?.albums;

  function playSong() {
    clearTimers();
    setIsPlaying(true);
    playTimerRef.current = window.setTimeout(registerCountedPlay, 10000);
  }

  function pauseSong() {
    clearTimers();
    setIsPlaying(false);
  }

  async function registerCountedPlay() {
    try {
      const sessionId = localStorage.getItem("orbitune_session_id") || crypto.randomUUID();
      localStorage.setItem("orbitune_session_id", sessionId);
      await apiFetch("/api/plays/register", {
        method: "POST",
        body: JSON.stringify({ song_id: id, session_id: sessionId, seconds_listened: 10 }),
      });
    } catch (error) {
      console.warn(error.message);
    }
  }

  function clearTimers() {
    if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
  }

  if (!song) {
    return <div className="rounded-[28px] bg-white p-8 text-black/45">Musica nao encontrada.</div>;
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 rounded-[30px] bg-white p-6 shadow-sm md:grid-cols-[240px_1fr]">
        <div className="aspect-square rounded-[28px] bg-[linear-gradient(135deg,#9b3e1f,#f4ef62)] shadow-xl" />
        <div className="flex flex-col justify-end">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">Single</p>
          <h2 className="mt-2 text-5xl font-black leading-none">{song.title}</h2>
          <p className="mt-4 text-black/50">
            {artist?.id ? <Link to={`/artist/${artist.id}`}>{artist.stage_name}</Link> : song.artist || "Artista"}
            {song.feat ? ` feat. ${song.feat}` : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#282425] px-5 py-3 text-sm font-black text-white"
              onClick={isPlaying ? pauseSong : playSong}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {isPlaying ? "Pausar" : "Play"}
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#f4f1ef] px-5 py-3 text-sm font-bold">
              <Heart size={16} /> Curtir
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Streams" value={Number(song.plays_display || 0).toLocaleString("pt-BR")} />
        <StatCard label="Chart" value={formatChart(song)} />
        <StatCard label="Genero" value={song.genre || "-"} />
        <StatCard label="Duracao" value={formatDuration(song.duration_seconds)} />
      </section>

      <section className="rounded-[28px] bg-[#4b4647] p-6 text-white">
        <div className="flex items-center gap-2">
          <Radio size={18} />
          <h3 className="font-black">Album</h3>
        </div>
        <p className="mt-3 text-white/62">{album?.title || "Single independente"}</p>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[26px] bg-white p-5 shadow-sm">
      <p className="text-sm text-black/45">{label}</p>
      <strong className="mt-2 block text-2xl">{value}</strong>
    </article>
  );
}

function formatDuration(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatChart(song) {
  if (!song.chart_position) return "-";
  const type = {
    hourly: "Hourly",
    daily: "Daily",
    weekly: "Weekly",
  }[song.chart_type] || "Chart";

  return `#${song.chart_position} ${type}`;
}
