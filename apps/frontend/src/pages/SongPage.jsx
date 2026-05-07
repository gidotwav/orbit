import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Play, Radio } from "lucide-react";
import { apiFetch } from "../lib/api";

export function SongPage() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [playStatus, setPlayStatus] = useState("");
  const [countdown, setCountdown] = useState(0);
  const playTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

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
    setCountdown(10);
    setPlayStatus("Tocando... play conta em 10s.");

    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(countdownTimerRef.current);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    playTimerRef.current = window.setTimeout(registerCountedPlay, 10000);
  }

  async function registerCountedPlay() {
    setPlayStatus("Registrando play validado...");
    try {
      const sessionId = localStorage.getItem("orbitune_session_id") || crypto.randomUUID();
      localStorage.setItem("orbitune_session_id", sessionId);
      const result = await apiFetch("/api/plays/register", {
        method: "POST",
        body: JSON.stringify({ song_id: id, session_id: sessionId, seconds_listened: 10 }),
      });
      setPlayStatus(result.accepted ? "+100 streams publicos" : "Limite por hora atingido");
    } catch (error) {
      setPlayStatus(error.message);
    }
  }

  function clearTimers() {
    if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
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
              onClick={playSong}
            >
              <Play size={16} fill="currentColor" /> Play
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#f4f1ef] px-5 py-3 text-sm font-bold">
              <Heart size={16} /> Curtir
            </button>
          </div>
          {playStatus && (
            <p className="mt-4 text-sm font-bold text-black/45">
              {playStatus} {countdown > 0 ? `(${countdown}s)` : ""}
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Streams publicos" value={Number(song.plays_display || 0).toLocaleString("pt-BR")} />
        <StatCard label="Unique listeners" value={Number(song.unique_display || 0).toLocaleString("pt-BR")} />
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
