"use client";

import { useEffect, useState } from "react";
import type { Listing, Professional } from "@/types/catalog";

type Pendentes = { listings: Listing[]; professionals: Professional[] };
type Busca = { listing: Listing | null; professional: Professional | null };

export default function AdminPage() {
  const [dados, setDados] = useState<Pendentes>({ listings: [], professionals: [] });
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/v1/admin/pending");
    if (res.ok) setDados(await res.json());
    setCarregando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carrega fila ao montar a página
    carregar();
  }, []);

  async function aprovar(tipo: "listings" | "professionals", id: string) {
    await fetch(`/api/v1/admin/${tipo}/${id}/approve`, { method: "POST" });
    carregar();
  }

  async function reprovar(tipo: "listings" | "professionals", id: string) {
    const motivo = window.prompt("Motivo da reprovação (opcional):") ?? undefined;
    await fetch(`/api/v1/admin/${tipo}/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });
    carregar();
  }

  async function excluir(tipo: "listings" | "professionals", id: string) {
    if (!window.confirm("Excluir definitivamente este cadastro?")) return;
    await fetch(`/api/v1/admin/${tipo}/${id}`, { method: "DELETE" });
    carregar();
  }

  const total = dados.listings.length + dados.professionals.length;

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">Painel administrativo</h1>

      <BuscaPorCodigo />

      <h2 className="mb-3 mt-10 text-lg font-semibold">Fila de aprovação</h2>

      {carregando && <p className="text-sm text-black/60">Carregando...</p>}

      {!carregando && total === 0 && (
        <p className="text-sm text-black/60">
          Nenhum cadastro pendente no momento.
        </p>
      )}

      {dados.listings.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-base font-semibold">Empresas pendentes ({dados.listings.length})</h3>
          <div className="flex flex-col gap-3">
            {dados.listings.map((l) => (
              <div key={l.id} className="rounded-lg border border-black/10 p-4">
                <p className="font-semibold">{l.nome}</p>
                <p className="text-xs text-black/60">{l.codigoPublico}</p>
                <p className="text-xs text-black/60">
                  {l.category.nome}
                  {l.subcategory ? ` · ${l.subcategory.nome}` : ""} · {l.city.nome}
                </p>
                <p className="mt-1 text-sm">{l.descricao}</p>
                <p className="mt-1 text-xs text-black/60">
                  {l.endereco} {l.whatsapp && `· ${l.whatsapp}`}
                </p>
                <Acoes
                  onAprovar={() => aprovar("listings", l.id)}
                  onReprovar={() => reprovar("listings", l.id)}
                  onExcluir={() => excluir("listings", l.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {dados.professionals.length > 0 && (
        <section>
          <h3 className="mb-3 text-base font-semibold">
            Profissionais pendentes ({dados.professionals.length})
          </h3>
          <div className="flex flex-col gap-3">
            {dados.professionals.map((p) => (
              <div key={p.id} className="rounded-lg border border-black/10 p-4">
                <p className="font-semibold">{p.nome}</p>
                <p className="text-xs text-black/60">{p.codigoPublico}</p>
                <p className="text-xs text-black/60">
                  {p.category.nome}
                  {p.subcategory ? ` · ${p.subcategory.nome}` : ""} ·{" "}
                  {p.bairroAtuacao ?? p.city.nome}
                </p>
                <p className="mt-1 text-sm">{p.descricao}</p>
                <p className="mt-1 text-xs text-black/60">{p.whatsapp}</p>
                <Acoes
                  onAprovar={() => aprovar("professionals", p.id)}
                  onReprovar={() => reprovar("professionals", p.id)}
                  onExcluir={() => excluir("professionals", p.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BuscaPorCodigo() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<Busca | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function buscarCodigo(valor: string) {
    if (!valor.trim()) return;

    setBuscando(true);
    setErro(null);
    setResultado(null);

    const res = await fetch(`/api/v1/admin/search?codigo=${encodeURIComponent(valor.trim())}`);
    if (res.ok) {
      setResultado(await res.json());
    } else {
      const body = await res.json().catch(() => ({}));
      setErro(body.error ?? "Cadastro não encontrado");
    }
    setBuscando(false);
  }

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    buscarCodigo(codigo);
  }

  async function desativar(tipo: "listings" | "professionals", id: string) {
    if (!window.confirm("Desativar este cadastro? Ele deixa de aparecer no site até ser reativado.")) return;
    await fetch(`/api/v1/admin/${tipo}/${id}/deactivate`, { method: "POST" });
    buscarCodigo(codigo);
  }

  async function reativar(tipo: "listings" | "professionals", id: string) {
    await fetch(`/api/v1/admin/${tipo}/${id}/approve`, { method: "POST" });
    buscarCodigo(codigo);
  }

  async function excluir(tipo: "listings" | "professionals", id: string) {
    if (!window.confirm("Excluir definitivamente este cadastro? Essa ação não pode ser desfeita.")) return;
    await fetch(`/api/v1/admin/${tipo}/${id}`, { method: "DELETE" });
    setResultado(null);
    setCodigo("");
  }

  const item = resultado?.listing ?? resultado?.professional;
  const tipo: "listings" | "professionals" | null = resultado?.listing
    ? "listings"
    : resultado?.professional
      ? "professionals"
      : null;

  return (
    <section className="rounded-lg border border-black/10 p-4">
      <h2 className="mb-3 text-lg font-semibold">Buscar por ID público</h2>
      <form onSubmit={buscar} className="flex gap-2">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ex: EMP-AB12CD34"
          className="input flex-1"
        />
        <button type="submit" className="btn btn-accent" disabled={buscando}>
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

      {item && tipo && (
        <div className="mt-4 rounded-lg border border-black/10 p-4">
          <p className="font-semibold">{item.nome}</p>
          <p className="text-xs text-black/60">{item.codigoPublico}</p>
          <p className="text-xs text-black/60">
            {item.category.nome}
            {item.subcategory ? ` · ${item.subcategory.nome}` : ""} · {item.city.nome}
          </p>
          <p className="mt-1 text-sm">{item.descricao}</p>
          <p className="mt-2 text-xs font-semibold uppercase text-black/60">
            Status: {item.status}
          </p>

          <div className="mt-3 flex gap-2 text-sm">
            {item.status !== "APROVADO" && (
              <button
                onClick={() => reativar(tipo, item.id)}
                className="rounded bg-primary px-3 py-1 font-medium text-white hover:bg-primary-hover"
              >
                {item.status === "PENDENTE" ? "Aprovar" : "Reativar"}
              </button>
            )}
            {item.status !== "INATIVO" && (
              <button
                onClick={() => desativar(tipo, item.id)}
                className="rounded border border-black/20 px-3 py-1 hover:bg-black/5"
              >
                Desativar
              </button>
            )}
            <button onClick={() => excluir(tipo, item.id)} className="rounded px-3 py-1 text-red-600 hover:bg-red-50">
              Excluir
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Acoes({
  onAprovar,
  onReprovar,
  onExcluir,
}: {
  onAprovar: () => void;
  onReprovar: () => void;
  onExcluir: () => void;
}) {
  return (
    <div className="mt-3 flex gap-2 text-sm">
      <button
        onClick={onAprovar}
        className="rounded bg-primary px-3 py-1 font-medium text-white hover:bg-primary-hover"
      >
        Aprovar
      </button>
      <button
        onClick={onReprovar}
        className="rounded border border-black/20 px-3 py-1 hover:bg-black/5"
      >
        Reprovar
      </button>
      <button onClick={onExcluir} className="rounded px-3 py-1 text-red-600 hover:bg-red-50">
        Excluir
      </button>
    </div>
  );
}
