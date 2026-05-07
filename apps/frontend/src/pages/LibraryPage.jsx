import React from "react";

export function LibraryPage() {
  return (
    <section>
      <h2 className="text-4xl font-black">Library</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["Liked songs", "Playlists", "Historico"].map((title) => (
          <article key={title} className="rounded-[26px] bg-white p-6 shadow-sm">
            <h3 className="font-black">{title}</h3>
            <p className="mt-2 text-sm text-black/45">Area preparada para a Etapa 5.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
