import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Music2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, mode } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (isSignup) {
        await signUp(form);
      } else {
        await signIn(form);
      }
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_30%_10%,#fff7db_0,#daccc8_38%,#a59a9a_100%)] p-5 text-[#282425]">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white/88 shadow-2xl md:grid-cols-[1fr_420px]">
        <div className="hidden bg-[#4b4647] p-10 text-white md:block">
          <Link to="/" className="inline-flex items-center gap-3 text-xl font-black">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#f4ef62] text-[#282425]">
              <Music2 />
            </span>
            Orbitune
          </Link>
          <h1 className="mt-20 max-w-sm text-5xl font-black leading-none">Entre no metaverso musical.</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/58">
            Usuarios podem se cadastrar livremente. Artistas entram por aprovacao da criadora.
          </p>
        </div>

        <form className="grid gap-4 p-7 md:p-10" onSubmit={handleSubmit}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-black/35">{mode}</p>
            <h2 className="mt-2 text-3xl font-black">{isSignup ? "Criar conta" : "Entrar"}</h2>
          </div>

          {isSignup && (
            <label className="grid gap-2 text-sm font-bold">
              Username
              <input
                className="h-12 rounded-2xl bg-[#f4f1ef] px-4 outline-none"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                required
              />
            </label>
          )}

          <label className="grid gap-2 text-sm font-bold">
            Email
            <input
              className="h-12 rounded-2xl bg-[#f4f1ef] px-4 outline-none"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Senha
            <input
              className="h-12 rounded-2xl bg-[#f4f1ef] px-4 outline-none"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>

          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <button className="h-12 rounded-2xl bg-[#282425] font-black text-white">
            {isSignup ? "Cadastrar" : "Entrar"}
          </button>

          <button
            className="text-sm font-bold text-black/45"
            type="button"
            onClick={() => setIsSignup((value) => !value)}
          >
            {isSignup ? "Ja tenho conta" : "Criar conta comum"}
          </button>
        </form>
      </section>
    </main>
  );
}
