"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegistroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(data?.error === "E-mail já cadastrado" ? data.error : "Não foi possível cadastrar.");
      setCarregando(false);
      return;
    }

    await signIn("credentials", { email, senha, redirect: false });
    setCarregando(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="container py-16">
      <h1 className="mb-6 text-2xl sm:text-3xl">Criar conta</h1>

      <form onSubmit={handleSubmit} className="surface flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-semibold">Nome</label>
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className="input" />
        </div>

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

        <div>
          <label className="mb-1 block text-sm font-semibold">Senha</label>
          <input
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input"
          />
        </div>

        {erro && <p className="text-sm text-[var(--color-accent-coral)]">{erro}</p>}

        <button type="submit" disabled={carregando} className="btn btn-accent">
          {carregando ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <div className="h-px flex-1" style={{ background: "var(--color-border, #E2E8F0)" }} />
        ou
        <div className="h-px flex-1" style={{ background: "var(--color-border, #E2E8F0)" }} />
      </div>

      <button type="button" onClick={() => signIn("google", { callbackUrl: "/" })} className="btn btn-outline w-full">
        Entrar com Google
      </button>
    </div>
  );
}
