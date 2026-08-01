"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import type { Listing, Professional } from "@/types/catalog";
import { categoryCoverClass } from "@/components/CategoryIcon";
import { ProfileModal } from "@/components/ProfileModal";

type Props =
  | { kind: "empresa"; item: Listing }
  | { kind: "profissional"; item: Professional };

function initials(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function ResultCard({ kind, item }: Props) {
  const [modalAberto, setModalAberto] = useState(false);

  const foto = item.media[0]?.url;
  const subtitulo =
    kind === "empresa"
      ? (item as Listing).endereco
      : (item as Professional).bairroAtuacao ?? (item as Professional).city.nome;
  const cidadeSlug = item.city.slug ?? item.city.id;
  const categoriaSlug = item.subcategory?.slug ?? item.category.slug;
  const href = `/${cidadeSlug}/${categoriaSlug}?id=${item.id}`;

  return (
    <>
      <div className="profile-card">
        <div
          className="profile-cover"
          style={{ background: categoryCoverClass(item.category.slug, item.subcategory?.slug) }}
        >
          <span className="profile-badge">
            <ShieldCheck size={14} /> Verificado
          </span>
        </div>

        <div className="avatar-container">
          <div className="profile-avatar-placeholder">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto} alt={item.nome} className="h-full w-full object-cover" />
            ) : (
              initials(item.nome)
            )}
          </div>
        </div>

        <div className="profile-content">
          <h3 className="profile-name">
            <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
              {item.nome}
            </Link>
          </h3>
          <p className="profile-category">
            {item.category.nome}
            {item.subcategory ? ` · ${item.subcategory.nome}` : ""}
          </p>
          <p className="profile-public-id">{item.codigoPublico}</p>
          <p className="profile-description">{item.descricao}</p>

          <div className="profile-footer">
            <span className="profile-location">
              <MapPin size={14} /> {subtitulo}
            </span>

            <button
              onClick={() => setModalAberto(true)}
              className="btn btn-outline"
              style={{ padding: "6px 16px", fontSize: 13 }}
            >
              Ver Perfil
            </button>
          </div>
        </div>
      </div>

      {modalAberto &&
        (kind === "empresa" ? (
          <ProfileModal kind="empresa" item={item as Listing} onClose={() => setModalAberto(false)} />
        ) : (
          <ProfileModal kind="profissional" item={item as Professional} onClose={() => setModalAberto(false)} />
        ))}
    </>
  );
}
