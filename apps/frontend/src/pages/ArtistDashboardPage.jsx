import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Disc3, Music2, TrendingUp } from "lucide-react";
import { apiFetch } from "../lib/api";

export function ArtistDashboardPage() {
  const [artists, setArtists] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [artistData, setArtistData] = useState(null);
  const [chart, setChart] = useState([]);

  useEffect(() => {
    apiFetch("/api/artists")
      .then((payload) => {
        setArtists(payload.data || []);
        setSelectedArtistId((payload.data || [])[0]?.id || "");
      })
      .catch(() => setArtists([]));
    apiFetch("/api/charts/hourly")
      .then((payload) => setChart(payload.data || []))
      .catch(() => setChart([]));
  }, []);

  useEffect(() => {
    if (!selectedArtistId) return;
    apiFetch(`/api/artists/${selectedArtistId}`)
      .then((payload) => setArtistData(payload.data))
      .catch(() => setArtistData(null));
  }, [selectedArtistId]);

  const songs = artistData?.songs || [];
  const albums = artistData?.albums || [];
  const chartRows = useMemo(() => {
    return chart.filter((entry) => {
      const song = entry.songs || entry.song || {};
      const artist = song.artist_profiles || {};
      return artist.id === selectedArtistId || song.artist_id === selectedArtistId;
    });
  }, [chart, selectedArtistId]);
  const totalStreams = chartRows.reduce((sum, entry) => sum + Number(entry.plays_display || entry.song?.plays_display || 0), 0);

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">Artist dashboard</p>
          <h2 className="mt-2 text-4xl font-black">Painel do artista</h2>
          <p className="mt-2 text-sm text-black/45">Preview de streams, releases e chart para a artista selecionada.</p>
        </div>
        <select className="h-12 rounded-2xl bg-white px-4 font-bold outline-none shadow-sm" value={selectedArtistId} onChange={(event) => setSelectedArtistId(event.target.value)}>
          {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.stage_name}</option>)}
        </select>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard icon={TrendingUp} label="Streams no chart" value={totalStreams.toLocaleString("pt-BR")} />
        <StatCard icon={Music2} label="Musicas" value={songs.length} />
        <StatCard icon={Disc3} label="Releases" value={albums.length} />
        <StatCard icon={BarChart3} label="Entradas no chart" value={chartRows.length} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <h3 className="font-black">Musicas da artista</h3>
          <div className="mt-4 grid gap-3">
            {songs.map((song) => {
              const chartEntry = chartRows.find((entry) => (entry.songs?.id || entry.song?.id) === song.id);
              return (
                <Link key={song.id} to={`/song/${song.id}`} className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl bg-[#f4f1ef] p-4">
                  <div>
                    <strong>{song.title}</strong>
                    <p className="text-sm text-black/45">{song.genre || "Pop"} - {song.duration_seconds ? formatDuration(song.duration_seconds) : "--"}</p>
                  </div>
                  <span className="text-sm font-black text-black/40">{chartEntry ? `#${chartEntry.position}` : "fora"}</span>
                </Link>
              );
            })}
            {!songs.length && <p className="text-sm text-black/45">Nenhuma musica cadastrada ainda.</p>}
          </div>
        </div>

        <div className="rounded-[28px] bg-[#4b4647] p-6 text-white shadow-sm">
          <h3 className="font-black">Releases</h3>
          <div className="mt-4 grid gap-3">
            {albums.map((album) => (
              <article key={album.id} className="rounded-2xl bg-white/10 p-4">
                <strong>{album.title}</strong>
                <p className="mt-1 text-sm text-white/50">{album.type} - {album.release_date}</p>
              </article>
            ))}
            {!albums.length && <p className="text-sm text-white/50">Nenhum release cadastrado ainda.</p>}
          </div>
        </div>
      </section>
    </section>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-[26px] bg-white p-5 shadow-sm">
      <Icon size={18} className="text-[#a4421f]" />
      <p className="mt-4 text-sm text-black/45">{label}</p>
      <strong className="mt-1 block text-2xl">{value}</strong>
    </article>
  );
}

function formatDuration(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
