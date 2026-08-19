"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import type { Listing, Professional } from "@/types/catalog";

function editarHref(tipo: "listings" | "professionals", id: string) {
  return tipo === "listings" ? `/cadastro/empresa/${id}/editar` : `/cadastro/profissional/${id}/editar`;
}

type Pendentes = { listings: Listing[]; professionals: Professional[] };
type Busca = { listing: Listing | null; professional: Professional | null };

type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: "USER" | "OWNER" | "ADMIN";
  criadoEm: string;
  subscriptionStatus: "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  _count: { listings: number; professionals: number };
};

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Painel administrativo</h1>
      </div>

      <BuscaPorCodigo />

      <Usuarios />

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
                  editarHref={editarHref("listings", l.id)}
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
                  editarHref={editarHref("professionals", p.id)}
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

const STATUS_LABEL: Record<Usuario["subscriptionStatus"], string> = {
  NONE: "Sem assinatura",
  TRIALING: "Em teste",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento atrasado",
  CANCELED: "Cancelada",
  INCOMPLETE: "Incompleta",
};

const STATUS_CLASSE: Record<Usuario["subscriptionStatus"], string> = {
  NONE: "bg-black/10 text-black/60",
  TRIALING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-yellow-100 text-yellow-700",
  CANCELED: "bg-red-100 text-red-700",
  INCOMPLETE: "bg-yellow-100 text-yellow-700",
};

type ItemResumo = {
  id: string;
  codigoPublico: string;
  nome: string;
  status: "PENDENTE" | "APROVADO" | "REPROVADO" | "INATIVO";
  category: { nome: string };
  subcategory: { nome: string } | null;
  city: { nome: string };
};

type ItensUsuario = { listings: ItemResumo[]; professionals: ItemResumo[] };

function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [itens, setItens] = useState<ItensUsuario | null>(null);
  const [carregandoItens, setCarregandoItens] = useState(false);

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/v1/admin/users");
    if (res.ok) {
      const body = await res.json();
      setUsuarios(body.users);
    }
    setCarregando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carrega usuários ao montar a página
    carregar();
  }, []);

  async function ativarAssinatura(id: string) {
    if (!window.confirm("Ativar assinatura manualmente para este usuário por 30 dias?")) return;
    setProcessando(id);
    await fetch(`/api/v1/admin/users/${id}/activate-subscription`, { method: "POST" });
    await carregar();
    setProcessando(null);
  }

  async function desativarAssinatura(id: string) {
    if (!window.confirm("Desativar a assinatura deste usuário?")) return;
    setProcessando(id);
    await fetch(`/api/v1/admin/users/${id}/deactivate-subscription`, { method: "POST" });
    await carregar();
    setProcessando(null);
  }

  async function alternarCadastros(id: string) {
    if (expandido === id) {
      setExpandido(null);
      setItens(null);
      return;
    }
    setExpandido(id);
    setItens(null);
    setCarregandoItens(true);
    const res = await fetch(`/api/v1/admin/users/${id}/items`);
    if (res.ok) setItens(await res.json());
    setCarregandoItens(false);
  }

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Usuários cadastrados ({usuarios.length})</h2>
        <a
          href="/api/v1/admin/users/export"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Exportar usuários (Excel)
        </a>
      </div>

      {carregando && <p className="text-sm text-black/60">Carregando...</p>}

      {!carregando && usuarios.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-black/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Papel</th>
                <th className="px-3 py-2">Cadastrado em</th>
                <th className="px-3 py-2">Assinatura</th>
                <th className="px-3 py-2">Válida até</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <Fragment key={u.id}>
                  <tr className="border-t border-black/10">
                    <td className="px-3 py-2">{u.nome}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_CLASSE[u.subscriptionStatus]}`}>
                        {STATUS_LABEL[u.subscriptionStatus]}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {u.currentPeriodEnd ? new Date(u.currentPeriodEnd).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {u.subscriptionStatus !== "ACTIVE" && (
                          <button
                            onClick={() => ativarAssinatura(u.id)}
                            disabled={processando === u.id}
                            className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                          >
                            Ativar
                          </button>
                        )}
                        {u.subscriptionStatus !== "NONE" && (
                          <button
                            onClick={() => desativarAssinatura(u.id)}
                            disabled={processando === u.id}
                            className="rounded border border-black/20 px-3 py-1 text-xs hover:bg-black/5 disabled:opacity-50"
                          >
                            Desativar
                          </button>
                        )}
                        {(u._count.listings > 0 || u._count.professionals > 0) && (
                          <button
                            onClick={() => alternarCadastros(u.id)}
                            className="rounded border border-black/20 px-3 py-1 text-xs hover:bg-black/5"
                          >
                            {expandido === u.id ? "Ocultar cadastros" : `Ver cadastros (${u._count.listings + u._count.professionals})`}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandido === u.id && (
                    <tr className="border-t border-black/10 bg-black/[0.02]">
                      <td colSpan={7} className="px-3 py-3">
                        {carregandoItens && <p className="text-xs text-black/60">Carregando...</p>}
                        {!carregandoItens && itens && (
                          <div className="flex flex-col gap-2">
                            {[...itens.listings.map((i) => ({ ...i, tipo: "listings" as const })), ...itens.professionals.map((i) => ({ ...i, tipo: "professionals" as const }))].map((item) => (
                              <div
                                key={`${item.tipo}-${item.id}`}
                                className="flex flex-wrap items-center justify-between gap-2 rounded border border-black/10 bg-white px-3 py-2 text-xs"
                              >
                                <div>
                                  <span className="font-semibold">{item.nome}</span>{" "}
                                  <span className="text-black/50">
                                    · {item.codigoPublico} · {item.category.nome}
                                    {item.subcategory ? ` / ${item.subcategory.nome}` : ""} · {item.city.nome}
                                  </span>{" "}
                                  <span className="ml-1 rounded bg-black/10 px-1.5 py-0.5">{item.status}</span>
                                </div>
                                <Link
                                  href={editarHref(item.tipo, item.id)}
                                  className="rounded border border-black/20 px-2 py-1 hover:bg-black/5"
                                >
                                  Editar
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
            <Link
              href={editarHref(tipo, item.id)}
              className="rounded border border-black/20 px-3 py-1 hover:bg-black/5"
            >
              Editar
            </Link>
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
  editarHref,
  onAprovar,
  onReprovar,
  onExcluir,
}: {
  editarHref: string;
  onAprovar: () => void;
  onReprovar: () => void;
  onExcluir: () => void;
}) {
  return (
    <div className="mt-3 flex gap-2 text-sm">
      <Link href={editarHref} className="rounded border border-black/20 px-3 py-1 hover:bg-black/5">
        Editar
      </Link>
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
