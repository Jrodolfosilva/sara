"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ValidacaoPage() {
  return (
    <Suspense fallback={null}>
      <ValidacaoConteudo />
    </Suspense>
  );
}

function ValidacaoConteudo() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"carregando" | "sucesso" | "erro">("carregando");

  useEffect(() => {
    if (!token) {
      setStatus("erro");
      return;
    }
    fetch(`/api/v1/auth/validacao?token=${encodeURIComponent(token)}`)
      .then((r) => setStatus(r.ok ? "sucesso" : "erro"))
      .catch(() => setStatus("erro"));
  }, [token]);

  return (
    <div className="container max-w-xl py-14">
      <h1 className="mb-6 text-2xl sm:text-3xl">Confirmação de e-mail</h1>

      <div className="surface p-6 sm:p-8">
        {status === "carregando" && (
          <p className="text-sm text-[var(--color-text-muted)]">Confirmando...</p>
        )}
        {status === "sucesso" && (
          <p className="text-sm">
            E-mail confirmado com sucesso!{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--color-primary-cyan)" }}>
              Ir para o login
            </Link>
          </p>
        )}
        {status === "erro" && (
          <p className="text-sm text-[var(--color-accent-coral)]">
            Link inválido ou expirado. Solicite um novo cadastro ou fale conosco.
          </p>
        )}
      </div>
    </div>
  );
}
