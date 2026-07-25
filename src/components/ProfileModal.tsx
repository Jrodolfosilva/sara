"use client";

import { useEffect } from "react";
import { X, MapPin, ShieldCheck, Phone, Mail, AtSign, Link2, Globe } from "lucide-react";
import type { Listing, Professional } from "@/types/catalog";
import { categoryCoverClass } from "@/components/CategoryIcon";

type Props =
  | { kind: "empresa"; item: Listing; onClose: () => void }
  | { kind: "profissional"; item: Professional; onClose: () => void };

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

export function ProfileModal({ kind, item, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const foto = item.media[0]?.url;
  const local = kind === "empresa" ? item.endereco : item.bairroAtuacao ?? item.city.nome;
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
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div
          className="modal-header-cover"
          style={{ background: categoryCoverClass(item.category.slug, item.subcategory?.slug) }}
        >
          <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
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
          <p style={{ color: "var(--color-text-muted)", fontSize: 12, marginBottom: 8 }}>
            {item.codigoPublico}
          </p>

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
        </div>
      </div>
    </div>
  );
}
