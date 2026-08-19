"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MapPin, ShieldCheck, Phone, Mail, AtSign, Link2, Globe, Wallet, Star } from "lucide-react";
import type { Listing, Professional, Review } from "@/types/catalog";

type Props =
  | { kind: "empresa"; item: Listing }
  | { kind: "profissional"; item: Professional };

function whatsappLink(numero: string) {
  return `https://wa.me/${numero.replace(/\D/g, "")}`;
}

function initials(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function PerfilConteudo({ kind, item }: Props) {
  const { data: authSession } = useSession();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [mediaEstrelas, setMediaEstrelas] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [jaAvaliado, setJaAvaliado] = useState(false);
  const [carregandoReviews, setCarregandoReviews] = useState(true);

  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [notaHover, setNotaHover] = useState(0);
  const [depoimento, setDepoimento] = useState("");
  const [enviandoReview, setEnviandoReview] = useState(false);
  const [reviewErro, setReviewErro] = useState<string | null>(null);

  const paramKey = kind === "empresa" ? "listingId" : "professionalId";

  function carregarReviews() {
    setCarregandoReviews(true);
    fetch(`/api/v1/reviews?${paramKey}=${item.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setReviews(data.items);
        setMediaEstrelas(data.media);
        setTotalReviews(data.total);
        setJaAvaliado(data.jaAvaliado);
      })
      .finally(() => setCarregandoReviews(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carrega avaliações ao montar
    carregarReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  async function handleEnviarReview() {
    setReviewErro(null);
    if (notaSelecionada < 1) {
      setReviewErro("Selecione de 1 a 5 estrelas.");
      return;
    }
    if (depoimento.trim().length < 5) {
      setReviewErro("Escreva um depoimento com pelo menos 5 caracteres.");
      return;
    }

    setEnviandoReview(true);
    try {
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [paramKey]: item.id,
          estrelas: notaSelecionada,
          depoimento: depoimento.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewErro(data.error ?? "Não foi possível enviar a avaliação.");
        return;
      }
      setDepoimento("");
      setNotaSelecionada(0);
      carregarReviews();
    } finally {
      setEnviandoReview(false);
    }
  }

  const foto = item.media[0]?.url;
  const local = kind === "empresa" ? item.endereco : (item.bairroAtuacao ?? item.city.nome);
  const whatsapp = item.whatsapp;
  const beneficios =
    kind === "empresa"
      ? [
          item.aceitaPix && "Aceita PIX",
          item.aceitaCartao && "Aceita cartão",
          item.entrega && "Faz entrega",
          item.atendimentoDomiciliar && "Atendimento domiciliar",
        ].filter((b): b is string => !!b)
      : [];

  return (
    <>
      <div className="modal-avatar-placeholder">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt={item.nome} className="h-full w-full object-cover" />
        ) : (
          initials(item.nome)
        )}
      </div>

      <h3 style={{ fontSize: 24, marginBottom: 2 }}>{item.nome}</h3>
      <p style={{ color: "var(--color-primary-cyan)", fontWeight: 600, fontSize: 15 }}>
        {item.category.nome}
        {item.subcategory ? ` · ${item.subcategory.nome}` : ""}
      </p>
      <p style={{ color: "var(--color-text-muted)", fontSize: 12, marginBottom: 4 }}>
        {item.codigoPublico}
      </p>

      {!carregandoReviews && totalReviews > 0 && (
        <div className="mb-2 flex items-center gap-1 text-sm">
          <EstrelasExibicao valor={mediaEstrelas} />
          <span style={{ color: "var(--color-text-muted)" }}>
            {mediaEstrelas.toFixed(1)} ({totalReviews} avaliaç{totalReviews === 1 ? "ão" : "ões"})
          </span>
        </div>
      )}

      <p className="modal-bio">{item.descricao}</p>

      <div className="modal-details-grid">
        <div className="modal-detail-item">
          <MapPin size={18} />
          <span>{local}</span>
        </div>
        <div className="modal-detail-item">
          <ShieldCheck size={18} />
          <span>Perfil verificado</span>
        </div>
        {kind === "empresa" && item.telefone && (
          <div className="modal-detail-item">
            <Phone size={18} />
            <span className="truncate">{item.telefone}</span>
          </div>
        )}
        {kind === "empresa" && item.telefoneFixo && (
          <div className="modal-detail-item">
            <Phone size={18} />
            <span className="truncate">{item.telefoneFixo}</span>
          </div>
        )}
        {item.valorHora && (
          <div className="modal-detail-item">
            <Wallet size={18} />
            <span className="truncate">{item.valorHora}</span>
          </div>
        )}
        {item.email && (
          <div className="modal-detail-item">
            <Mail size={18} />
            <span className="truncate">{item.email}</span>
          </div>
        )}
        {item.instagram && (
          <div className="modal-detail-item">
            <AtSign size={18} />
            <span className="truncate">{item.instagram}</span>
          </div>
        )}
        {item.facebook && (
          <div className="modal-detail-item">
            <Link2 size={18} />
            <span className="truncate">{item.facebook}</span>
          </div>
        )}
        {kind === "empresa" && item.site && (
          <div className="modal-detail-item">
            <Globe size={18} />
            <span className="truncate">{item.site}</span>
          </div>
        )}
      </div>

      {beneficios.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          {beneficios.map((b) => (
            <span
              key={b}
              className="pill"
              style={{ background: "var(--color-bg-light)", color: "var(--color-primary-dark)", border: "none" }}
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {item.products.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-lg font-semibold">Produtos</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {item.products.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 rounded-lg border p-3"
                style={{ borderColor: "var(--color-border, #E2E8F0)" }}
              >
                <div
                  className="h-16 w-16 shrink-0 overflow-hidden rounded"
                  style={{ background: "var(--color-bg-light)" }}
                >
                  {p.imagemUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imagemUrl} alt={p.nome} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.nome}</p>
                  {p.descricao && (
                    <p className="line-clamp-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {p.descricao}
                    </p>
                  )}
                  {p.valor && (
                    <p className="mt-1 text-sm font-semibold" style={{ color: "var(--color-primary-cyan)" }}>
                      {p.valor}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {whatsapp && (
        <a
          href={whatsappLink(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-accent"
          style={{ width: "100%", height: 50 }}
        >
          <Phone size={18} /> Entrar em contato via WhatsApp
        </a>
      )}

      <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--color-border, #E2E8F0)" }}>
        <h4 className="mb-3 text-lg font-semibold">Avaliações</h4>

        {authSession?.user ? (
          jaAvaliado ? (
            <p className="mb-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Você já avaliou este perfil.
            </p>
          ) : (
            <div className="mb-6 flex flex-col gap-2">
              <EstrelasInput
                valor={notaHover || notaSelecionada}
                onSelecionar={setNotaSelecionada}
                onHover={setNotaHover}
              />
              <textarea
                value={depoimento}
                onChange={(e) => setDepoimento(e.target.value)}
                placeholder="Conte como foi sua experiência..."
                rows={3}
                className="input"
              />
              {reviewErro && <p className="text-sm text-[var(--color-accent-coral)]">{reviewErro}</p>}
              <button
                onClick={handleEnviarReview}
                disabled={enviandoReview}
                className="btn btn-accent"
                style={{ alignSelf: "flex-start" }}
              >
                {enviandoReview ? "Enviando..." : "Enviar avaliação"}
              </button>
            </div>
          )
        ) : (
          <p className="mb-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <Link href="/login" className="font-semibold" style={{ color: "var(--color-primary-cyan)" }}>
              Faça login
            </Link>{" "}
            para deixar uma avaliação.
          </p>
        )}

        {carregandoReviews ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Carregando avaliações...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Ainda sem avaliações.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <div key={r.id}>
                <div className="flex items-center gap-2">
                  <EstrelasExibicao valor={r.estrelas} />
                  <span className="text-sm font-semibold">{r.author.nome}</span>
                </div>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{r.depoimento}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function EstrelasExibicao({ valor }: { valor: number }) {
  return (
    <span className="flex items-center gap-0.5" style={{ color: "#F59E0B" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} fill={n <= Math.round(valor) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function EstrelasInput({
  valor,
  onSelecionar,
  onHover,
}: {
  valor: number;
  onSelecionar: (n: number) => void;
  onHover: (n: number) => void;
}) {
  return (
    <span className="flex items-center gap-0.5" style={{ color: "#F59E0B" }} onMouseLeave={() => onHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onSelecionar(n)}
          onMouseEnter={() => onHover(n)}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
        >
          <Star size={22} fill={n <= valor ? "currentColor" : "none"} />
        </button>
      ))}
    </span>
  );
}
