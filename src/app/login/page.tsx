"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const res = await signIn("credentials", {
      email,
      senha,
      redirect: false,
    });

    setCarregando(false);

    if (res?.error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="container py-16">
      <h1 className="mb-6 text-2xl sm:text-3xl">Entrar</h1>

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

        <div>
          <label className="mb-1 block text-sm font-semibold">Senha</label>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input"
          />
        </div>

        {erro && <p className="text-sm text-[var(--color-accent-coral)]">{erro}</p>}

        <button type="submit" disabled={carregando} className="btn btn-accent">
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
        Não tem conta?{" "}
        <Link href="/registro" style={{ color: "var(--color-primary-cyan)" }} className="font-semibold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
