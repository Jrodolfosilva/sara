"use client";

import { useState } from "react";
import Link from "next/link";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await fetch("/api/v1/auth/esqueci-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEnviando(false);
    setEnviado(true);
  }

  return (
    <div className="container py-16">
      <h1 className="mb-6 text-2xl sm:text-3xl">Esqueci minha senha</h1>

      {enviado ? (
        <p className="surface p-6 text-sm">
          Se esse e-mail tiver uma conta com senha cadastrada, enviamos um link de redefinição. Confere sua caixa de entrada (e spam).
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="surface flex flex-col gap-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <button type="submit" disabled={enviando} className="btn btn-accent">
            {enviando ? "Enviando..." : "Enviar link de redefinição"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
        <Link href="/login" style={{ color: "var(--color-primary-cyan)" }} className="font-semibold hover:underline">
          Voltar pro login
        </Link>
      </p>
    </div>
  );
}
