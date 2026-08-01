"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";

type Subscription = {
  subscriptionStatus: Status;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
};

const statusLabel: Record<Status, string> = {
  NONE: "Sem assinatura",
  TRIALING: "Período grátis",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento atrasado",
  CANCELED: "Cancelada",
  INCOMPLETE: "Pendente",
};

export default function AssinaturaPage() {
  return (
    <Suspense fallback={null}>
      <AssinaturaConteudo />
    </Suspense>
  );
}

function AssinaturaConteudo() {
  const searchParams = useSearchParams();
  const statusUrl = searchParams.get("status");

  const [assinatura, setAssinatura] = useState<Subscription | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then(setAssinatura)
      .finally(() => setCarregando(false));
  }, []);

  async function handleAssinar() {
    setErro(null);
    setProcessando(true);
    try {
      const res = await fetch("/api/v1/subscription/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível iniciar a assinatura.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setProcessando(false);
    }
  }

  async function handleGerenciar() {
    setErro(null);
    setProcessando(true);
    try {
      const res = await fetch("/api/v1/subscription/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível abrir o portal de cobrança.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setProcessando(false);
    }
  }

  const podeAssinar = !carregando && (!assinatura || assinatura.subscriptionStatus === "NONE" || assinatura.subscriptionStatus === "CANCELED");
  const temAssinatura = !carregando && assinatura && ["TRIALING", "ACTIVE", "PAST_DUE"].includes(assinatura.subscriptionStatus);

  return (
    <div className="container max-w-xl py-14">
      <h1 className="mb-2 text-2xl sm:text-3xl">Assinatura</h1>
      <p className="mb-8 text-[var(--color-text-muted)]">
        Primeiro mês grátis, depois R$ 40/mês para manter seu negócio em destaque no Busca Pebas.
      </p>

      {statusUrl === "sucesso" && (
        <p className="mb-6 rounded-md p-3 text-sm" style={{ background: "var(--color-primary-cyan)", color: "#fff" }}>
          Assinatura confirmada! Pode levar alguns segundos para atualizar aqui.
        </p>
      )}
      {statusUrl === "cancelado" && (
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">Checkout cancelado.</p>
      )}

      <div className="surface flex flex-col gap-4 p-6 sm:p-8">
        {carregando ? (
          <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>
        ) : (
          <>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Status</p>
              <p className="text-lg font-semibold">
                {statusLabel[assinatura?.subscriptionStatus ?? "NONE"]}
              </p>
            </div>

            {assinatura?.trialEndsAt && assinatura.subscriptionStatus === "TRIALING" && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Trial termina em {new Date(assinatura.trialEndsAt).toLocaleDateString("pt-BR")}
              </p>
            )}
            {assinatura?.currentPeriodEnd && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Próxima cobrança em {new Date(assinatura.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </p>
            )}

            {erro && <p className="text-sm text-[var(--color-accent-coral)]">{erro}</p>}

            {podeAssinar && (
              <button onClick={handleAssinar} disabled={processando} className="btn btn-accent">
                {processando ? "Redirecionando..." : "Assinar — 1º mês grátis, depois R$ 40/mês"}
              </button>
            )}

            {temAssinatura && (
              <button onClick={handleGerenciar} disabled={processando} className="btn btn-accent">
                {processando ? "Redirecionando..." : "Gerenciar assinatura"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
