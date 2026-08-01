"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { Listing, Professional } from "@/types/catalog";
import { categoryCoverClass } from "@/components/CategoryIcon";
import { PerfilConteudo } from "@/components/PerfilConteudo";

type Props =
  | { kind: "empresa"; item: Listing; onClose: () => void }
  | { kind: "profissional"; item: Professional; onClose: () => void };

export function ProfileModal({ kind, item, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
          {kind === "empresa" ? (
            <PerfilConteudo kind="empresa" item={item} />
          ) : (
            <PerfilConteudo kind="profissional" item={item} />
          )}
        </div>
      </div>
    </div>
  );
}
