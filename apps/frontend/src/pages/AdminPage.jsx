import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Disc3, Music2, RefreshCw, UserPlus } from "lucide-react";
import { apiFetch } from "../lib/api";

const adminHeaders = (password) => ({ "x-admin-password": password });

export function AdminPage() {
  const [adminPassword, setAdminPassword] = useState(localStorage.getItem("orbitune_admin_password") || "");
  const [status, setStatus] = useState("");
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [artistForm, setArtistForm] = useState({
    stage_name: "",
    bio: "",
    instagram: "",
    photo_url: "",
    verified: true,
    approved: true,
  });
  const [albumForm, setAlbumForm] = useState({
    artist_id: "",
    title: "",
    type: "single",
    release_date: new Date().toISOString().slice(0, 10),
    cover_url: "",
  });
  const [songForm, setSongForm] = useState({
    artist_id: "",
    album_id: "",
    title: "",
    feat: "",
    genre: "Pop",
    duration: "03:00",
    audio_url: "",
    cover_url: "",
    active: true,
  });

  const approvedArtists = useMemo(() => artists.filter((artist) => artist.approved_at), [artists]);

  useEffect(() => {
    if (adminPassword) localStorage.setItem("orbitune_admin_password", adminPassword);
  }, [adminPassword]);

  useEffect(() => {
    if (adminPassword) loadAdminData();
  }, [adminPassword]);

  async function loadAdminData() {
    setStatus("Carregando catalogo...");
    try {
      const [artistPayload, albumPayload, songPayload] = await Promise.all([
        apiFetch("/api/admin/artists", { headers: adminHeaders(adminPassword) }),
        apiFetch("/api/admin/albums", { headers: adminHeaders(adminPassword) }),
        apiFetch("/api/admin/songs", { headers: adminHeaders(adminPassword) }),
      ]);
      setArtists(artistPayload.data || []);
      setAlbums(albumPayload.data || []);
      setSongs(songPayload.data || []);
      setStatus("Catalogo carregado.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function createArtist(event) {
    event.preventDefault();
    setStatus("Criando artista...");
    try {
      const payload = await apiFetch("/api/admin/artists", {
        method: "POST",
        headers: adminHeaders(adminPassword),
        body: JSON.stringify(artistForm),
      });
      setArtistForm({ stage_name: "", bio: "", instagram: "", photo_url: "", verified: true, approved: true });
      setStatus(`${payload.data.stage_name} criada e aprovada.`);
      await loadAdminData();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function createAlbum(event) {
    event.preventDefault();
    setStatus("Criando release...");
    try {
      const payload = await apiFetch("/api/admin/albums", {
        method: "POST",
        headers: adminHeaders(adminPassword),
        body: JSON.stringify(albumForm),
      });
      setAlbumForm({
        artist_id: albumForm.artist_id,
        title: "",
        type: "single",
        release_date: new Date().toISOString().slice(0, 10),
        cover_url: "",
      });
      setSongForm((current) => ({ ...current, artist_id: payload.data.artist_id, album_id: payload.data.id }));
      setStatus(`${payload.data.title} criado. Agora voce pode adicionar musicas nele.`);
      await loadAdminData();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function createSong(event) {
    event.preventDefault();
    setStatus("Criando musica...");
    try {
      const payload = await apiFetch("/api/admin/songs", {
        method: "POST",
        headers: adminHeaders(adminPassword),
        body: JSON.stringify({
          ...songForm,
          duration_seconds: durationToSeconds(songForm.duration),
          feat: songForm.feat || null,
          audio_url: songForm.audio_url || "https://example.com/audio/demo.mp3",
          cover_url: songForm.cover_url || selectedAlbum()?.cover_url || null,
        }),
      });
      setSongForm({
        ...songForm,
        title: "",
        feat: "",
        genre: songForm.genre,
        duration: "03:00",
        audio_url: "",
        cover_url: "",
      });
      setStatus(`${payload.data.title} cadastrada. Atualize o chart quando quiser.`);
      await loadAdminData();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function refreshCharts(type) {
    setStatus("Atualizando chart...");
    try {
      await apiFetch(`/api/admin/charts/${type}/refresh`, {
        method: "POST",
        headers: adminHeaders(adminPassword),
      });
      setStatus(`Chart ${type} atualizado.`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  function selectedAlbum() {
    return albums.find((album) => album.id === songForm.album_id);
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">Criadora</p>
          <h2 className="mt-2 text-4xl font-black">Admin Studio</h2>
          <p className="mt-2 text-sm text-black/45">Crie artistas, releases e musicas sem tocar no banco.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-[#282425] px-5 py-3 text-sm font-black text-white" onClick={loadAdminData}>
          <RefreshCw size={16} /> Recarregar
        </button>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm">
        <label className="grid gap-2 text-sm font-bold">
          Senha admin local
          <input
            className="h-12 rounded-2xl bg-[#f4f1ef] px-4 outline-none"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            placeholder="ADMIN_PASSWORD do backend"
          />
        </label>
        {status && <p className="mt-3 text-sm font-bold text-black/50">{status}</p>}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminCard icon={UserPlus} title="1. Criar artista">
          <form className="grid gap-3" onSubmit={createArtist}>
            <TextInput label="Nome artistico" value={artistForm.stage_name} onChange={(value) => setArtistForm({ ...artistForm, stage_name: value })} required placeholder="Gisellezita" />
            <TextInput label="Instagram" value={artistForm.instagram} onChange={(value) => setArtistForm({ ...artistForm, instagram: value })} placeholder="gisellezita" />
            <TextInput label="Foto URL" value={artistForm.photo_url} onChange={(value) => setArtistForm({ ...artistForm, photo_url: value })} placeholder="https://..." />
            <label className="grid gap-2 text-sm font-bold">
              Bio
              <textarea className="min-h-24 rounded-2xl bg-[#f4f1ef] px-4 py-3 outline-none" value={artistForm.bio} onChange={(event) => setArtistForm({ ...artistForm, bio: event.target.value })} />
            </label>
            <CheckInput label="Verificada" checked={artistForm.verified} onChange={(value) => setArtistForm({ ...artistForm, verified: value })} />
            <CheckInput label="Aprovada no catalogo" checked={artistForm.approved} onChange={(value) => setArtistForm({ ...artistForm, approved: value })} />
            <SubmitButton>Criar artista</SubmitButton>
          </form>
        </AdminCard>

        <AdminCard icon={Disc3} title="2. Criar release">
          <form className="grid gap-3" onSubmit={createAlbum}>
            <SelectInput label="Artista" value={albumForm.artist_id} onChange={(value) => {
              setAlbumForm({ ...albumForm, artist_id: value });
              setSongForm((current) => ({ ...current, artist_id: value }));
            }} required>
              <option value="">Selecione</option>
              {approvedArtists.map((artist) => <option key={artist.id} value={artist.id}>{artist.stage_name}</option>)}
            </SelectInput>
            <TextInput label="Titulo do release" value={albumForm.title} onChange={(value) => setAlbumForm({ ...albumForm, title: value })} required placeholder="Gisellezita - The 1st Single" />
            <SelectInput label="Tipo" value={albumForm.type} onChange={(value) => setAlbumForm({ ...albumForm, type: value })}>
              <option value="single">Single</option>
              <option value="EP">EP</option>
              <option value="album">Album</option>
              <option value="deluxe">Deluxe</option>
            </SelectInput>
            <TextInput type="date" label="Data de lancamento" value={albumForm.release_date} onChange={(value) => setAlbumForm({ ...albumForm, release_date: value })} />
            <TextInput label="Capa URL" value={albumForm.cover_url} onChange={(value) => setAlbumForm({ ...albumForm, cover_url: value })} placeholder="https://..." />
            <p className="text-xs leading-5 text-black/45">Deluxe aparece no painel; para virar tipo real no Supabase rode `003_add_deluxe_release_type.sql`.</p>
            <SubmitButton>Criar release</SubmitButton>
          </form>
        </AdminCard>

        <AdminCard icon={Music2} title="3. Adicionar musica">
          <form className="grid gap-3" onSubmit={createSong}>
            <SelectInput label="Artista" value={songForm.artist_id} onChange={(value) => setSongForm({ ...songForm, artist_id: value, album_id: "" })} required>
              <option value="">Selecione</option>
              {approvedArtists.map((artist) => <option key={artist.id} value={artist.id}>{artist.stage_name}</option>)}
            </SelectInput>
            <SelectInput label="Release" value={songForm.album_id} onChange={(value) => setSongForm({ ...songForm, album_id: value })}>
              <option value="">Sem release</option>
              {albums.filter((album) => !songForm.artist_id || album.artist_id === songForm.artist_id).map((album) => (
                <option key={album.id} value={album.id}>{album.title} ({album.type})</option>
              ))}
            </SelectInput>
            <TextInput label="Titulo da musica" value={songForm.title} onChange={(value) => setSongForm({ ...songForm, title: value })} required placeholder="Debut Song" />
            <TextInput label="Feat." value={songForm.feat} onChange={(value) => setSongForm({ ...songForm, feat: value })} placeholder="Opcional" />
            <TextInput label="Genero" value={songForm.genre} onChange={(value) => setSongForm({ ...songForm, genre: value })} />
            <TextInput label="Duracao mm:ss" value={songForm.duration} onChange={(value) => setSongForm({ ...songForm, duration: value })} required />
            <TextInput label="Audio URL" value={songForm.audio_url} onChange={(value) => setSongForm({ ...songForm, audio_url: value })} placeholder="https://..." />
            <TextInput label="Capa URL" value={songForm.cover_url} onChange={(value) => setSongForm({ ...songForm, cover_url: value })} placeholder="usa capa do release se vazio" />
            <CheckInput label="Ativa no chart" checked={songForm.active} onChange={(value) => setSongForm({ ...songForm, active: value })} />
            <SubmitButton>Adicionar musica</SubmitButton>
          </form>
        </AdminCard>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <h3 className="font-black">Artistas aprovadas</h3>
          <div className="mt-4 grid gap-3">
            {approvedArtists.map((artist) => (
              <Link key={artist.id} to={`/artist/${artist.id}`} className="flex items-center justify-between rounded-2xl bg-[#f4f1ef] p-4">
                <div>
                  <strong>{artist.stage_name}</strong>
                  <p className="text-sm text-black/45">@{artist.instagram || "orbitune"}</p>
                </div>
                {artist.verified && <BadgeCheck className="text-[#a4421f]" />}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="font-black">Catalogo</h3>
            <div className="flex flex-wrap gap-2">
              {["hourly", "daily", "weekly"].map((type) => (
                <button key={type} className="rounded-2xl bg-[#282425] px-4 py-2 text-xs font-black text-white" onClick={() => refreshCharts(type)}>
                  Atualizar {type}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {songs.slice(0, 8).map((song) => (
              <Link key={song.id} to={`/song/${song.id}`} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl bg-[#f4f1ef] p-4">
                <div>
                  <strong>{song.title}</strong>
                  <p className="text-sm text-black/45">{song.artist_profiles?.stage_name || "Artista"} - {song.albums?.title || "Single solto"}</p>
                </div>
                <span className="text-xs font-black text-black/40">{song.active ? "chart ON" : "OFF"}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

function AdminCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-[#f4ef62]">
          <Icon size={18} />
        </span>
        <h3 className="font-black">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function TextInput({ label, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input className="h-12 rounded-2xl bg-[#f4f1ef] px-4 outline-none" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} />
    </label>
  );
}

function SelectInput({ label, value, onChange, required = false, children }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <select className="h-12 rounded-2xl bg-[#f4f1ef] px-4 outline-none" value={value} onChange={(event) => onChange(event.target.value)} required={required}>
        {children}
      </select>
    </label>
  );
}

function CheckInput({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm font-bold">
      <input className="size-4 accent-[#a4421f]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function SubmitButton({ children }) {
  return <button className="h-12 rounded-2xl bg-[#282425] font-black text-white">{children}</button>;
}

function durationToSeconds(value) {
  const [minutes = "0", seconds = "0"] = value.split(":");
  return Number(minutes) * 60 + Number(seconds);
}
