import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, Instagram, Play } from "lucide-react";
import { apiFetch } from "../lib/api";

export function ArtistProfilePage() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    apiFetch(`/api/artists/${id}`)
      .then((response) => setPayload(response.data))
      .catch(() => setPayload(null));
  }, [id]);

  const artist = payload?.artist;
  const songs = payload?.songs || [];
  const albums = payload?.albums || [];

  if (!artist) {
    return <div className="rounded-[28px] bg-white p-8 text-black/45">Artista nao encontrado.</div>;
  }

  return (
    <div className="grid gap-8">
      <section className="relative overflow-hidden rounded-[30px] bg-[#4b4647] p-8 text-white">
        <div className="absolute right-8 top-8 hidden size-56 rounded-full bg-[#f4ef62]/20 ring-[40px] ring-white/5 md:block" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end">
          <div className="size-40 rounded-[32px] bg-[linear-gradient(135deg,#f4ef62,#9b3e1f)] shadow-xl" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Artist profile</p>
            <h2 className="mt-2 flex items-center gap-3 text-5xl font-black">
              {artist.stage_name}
              {artist.verified && <BadgeCheck className="text-[#f4ef62]" />}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">{artist.bio}</p>
            <div className="mt-5 flex items-center gap-3 text-sm text-white/62">
              <Instagram size={16} /> @{artist.instagram || "orbitune"}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-black">Discografia</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {albums.map((album) => (
            <article key={album.id} className="rounded-[26px] bg-white p-4 shadow-sm">
              <div className="aspect-square rounded-[22px] bg-[linear-gradient(135deg,#b55a32,#f4ef62)]" />
              <h4 className="mt-3 font-black">{album.title}</h4>
              <p className="text-sm text-black/45">{album.type} - {album.release_date}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-black">Musicas</h3>
        <div className="mt-4 grid gap-3">
          {songs.map((song, index) => (
            <Link
              key={song.id}
              to={`/song/${song.id}`}
              className="grid grid-cols-[42px_1fr_auto] items-center gap-4 rounded-3xl bg-white p-4 shadow-sm"
            >
              <strong>#{index + 1}</strong>
              <div>
                <h4 className="font-black">{song.title}</h4>
                <p className="text-sm text-black/45">{song.genre || "Pop"}</p>
              </div>
              <Play size={18} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
