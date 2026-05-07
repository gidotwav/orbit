import React, { useState } from "react";
import { apiFetch } from "../lib/api";

export function AdminPage() {
  const [adminPassword, setAdminPassword] = useState("");
  const [status, setStatus] = useState("");

  async function refreshCharts(type) {
    setStatus("Atualizando...");
    try {
      await apiFetch(`/api/admin/charts/${type}/refresh`, {
        method: "POST",
        headers: {
          "x-admin-password": adminPassword,
        },
      });
      setStatus(`Chart ${type} atualizado.`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">Criadora</p>
      <h2 className="mt-2 text-4xl font-black">Admin</h2>

      <div className="mt-6 grid gap-4 rounded-[28px] bg-white p-6 shadow-sm">
        <label className="grid gap-2 text-sm font-bold">
          Senha admin temporaria
          <input
            className="h-12 rounded-2xl bg-[#f4f1ef] px-4 outline-none"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            placeholder="ADMIN_PASSWORD do backend"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          {["hourly", "daily", "weekly"].map((type) => (
            <button
              key={type}
              className="rounded-2xl bg-[#282425] px-5 py-3 text-sm font-black text-white"
              onClick={() => refreshCharts(type)}
            >
              Atualizar {type}
            </button>
          ))}
        </div>

        {status && <p className="text-sm text-black/50">{status}</p>}
      </div>
    </section>
  );
}
