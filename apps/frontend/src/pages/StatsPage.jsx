import React from "react";

export function StatsPage() {
  return (
    <section>
      <h2 className="text-4xl font-black">Suas estatisticas</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Minutos", "0"],
          ["Artista favorito", "-"],
          ["Musica top", "-"],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[26px] bg-white p-6 shadow-sm">
            <p className="text-sm text-black/45">{label}</p>
            <strong className="mt-2 block text-3xl">{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
