"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaForm />
    </Suspense>
  );
}

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!token) {
      setErro("Link inválido — falta o token.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    const res = await fetch("/api/v1/auth/redefinir-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, novaSenha }),
    });
    const data = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setErro(data.error ?? "Não foi possível redefinir a senha.");
      return;
    }

    setSucesso(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="container py-16">
      <h1 className="mb-6 text-2xl sm:text-3xl">Redefinir senha</h1>

      {sucesso ? (
        <p className="surface p-6 text-sm">Senha redefinida! Redirecionando pro login...</p>
      ) : !token ? (
        <p className="surface p-6 text-sm text-[var(--color-accent-coral)]">
          Link inválido.{" "}
          <Link href="/esqueci-senha" style={{ color: "var(--color-primary-cyan)" }} className="font-semibold">
            Solicitar novo link
          </Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="surface flex flex-col gap-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold">Nova senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Confirmar nova senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="input"
            />
          </div>

          {erro && <p className="text-sm text-[var(--color-accent-coral)]">{erro}</p>}

          <button type="submit" disabled={enviando} className="btn btn-accent">
            {enviando ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      )}
    </div>
  );
}
