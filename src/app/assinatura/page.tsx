"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";

type Negocio = {
  id: string;
  nome: string;
  codigoPublico: string;
  tipo: "listing" | "professional";
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

  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    setCarregando(true);
    fetch("/api/v1/subscription")
      .then((r) => (r.ok ? r.json() : { negocios: [] }))
      .then((data) => setNegocios(data.negocios ?? []))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carrega negócios ao montar a página
    carregar();
  }, []);

  async function handleAssinar(negocio: Negocio) {
    setErro(null);
    setProcessando(negocio.id);
    try {
      const res = await fetch("/api/v1/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: negocio.tipo, id: negocio.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível iniciar a assinatura.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setProcessando(null);
    }
  }

  async function handleGerenciar() {
    setErro(null);
    setProcessando("portal");
    try {
      const res = await fetch("/api/v1/subscription/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível abrir o portal de cobrança.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setProcessando(null);
    }
  }

  const temAlgumaAssinatura = negocios.some((n) =>
    ["TRIALING", "ACTIVE", "PAST_DUE"].includes(n.subscriptionStatus)
  );

  return (
    <div className="container max-w-2xl py-14">
      <h1 className="mb-2 text-2xl sm:text-3xl">Assinatura</h1>
      <p className="mb-8 text-[var(--color-text-muted)]">
        Cada negócio cadastrado tem sua própria assinatura. Primeiro mês grátis, depois R$ 40/mês por
        negócio para manter em destaque no Busca Pebas.
      </p>

      {statusUrl === "sucesso" && (
        <p className="mb-6 rounded-md p-3 text-sm" style={{ background: "var(--color-primary-cyan)", color: "#fff" }}>
          Assinatura confirmada! Pode levar alguns segundos para atualizar aqui.
        </p>
      )}
      {statusUrl === "cancelado" && (
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">Checkout cancelado.</p>
      )}

      {erro && <p className="mb-4 text-sm text-[var(--color-accent-coral)]">{erro}</p>}

      {carregando && <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>}

      {!carregando && negocios.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">Você ainda não tem nenhum negócio cadastrado.</p>
      )}

      {!carregando && negocios.length > 0 && (
        <div className="flex flex-col gap-4">
          {negocios.map((n) => {
            const podeAssinar = n.subscriptionStatus === "NONE" || n.subscriptionStatus === "CANCELED";
            return (
              <div key={`${n.tipo}-${n.id}`} className="surface flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{n.nome}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {n.codigoPublico} · {n.tipo === "listing" ? "Empresa" : "Profissional"}
                    </p>
                  </div>
                  <span className="rounded px-2 py-1 text-xs font-medium" style={{ background: "var(--color-bg-muted)" }}>
                    {statusLabel[n.subscriptionStatus]}
                  </span>
                </div>

                {n.trialEndsAt && n.subscriptionStatus === "TRIALING" && (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Trial termina em {new Date(n.trialEndsAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
                {n.currentPeriodEnd && (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Próxima cobrança em {new Date(n.currentPeriodEnd).toLocaleDateString("pt-BR")}
                  </p>
                )}

                {podeAssinar && (
                  <button
                    onClick={() => handleAssinar(n)}
                    disabled={processando === n.id}
                    className="btn btn-accent self-start"
                  >
                    {processando === n.id ? "Redirecionando..." : "Assinar — 1º mês grátis, depois R$ 40/mês"}
                  </button>
                )}
              </div>
            );
          })}

          {temAlgumaAssinatura && (
            <button
              onClick={handleGerenciar}
              disabled={processando === "portal"}
              className="btn btn-accent self-start"
            >
              {processando === "portal" ? "Redirecionando..." : "Gerenciar cobrança"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
