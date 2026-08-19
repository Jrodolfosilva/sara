"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/uploadFile";
import type { Product } from "@/types/catalog";

export type ProductDraft = {
  nome: string;
  descricao: string;
  valor: string;
  imagemUrl: string | null;
};

const MAX_PRODUCTS = 12;

function toDraft(p: Product): ProductDraft {
  return {
    nome: p.nome,
    descricao: p.descricao ?? "",
    valor: p.valor ?? "",
    imagemUrl: p.imagemUrl,
  };
}

export function useProductsDraft(initialData?: Product[]) {
  return useState<ProductDraft[]>(() => (initialData ?? []).map(toDraft));
}

export function productsToPayload(products: ProductDraft[]) {
  return products
    .filter((p) => p.nome.trim())
    .map((p) => ({
      nome: p.nome.trim(),
      descricao: p.descricao.trim() || undefined,
      valor: p.valor.trim() || undefined,
      imagemUrl: p.imagemUrl || undefined,
    }));
}

export function ProductsEditor({
  products,
  onChange,
}: {
  products: ProductDraft[];
  onChange: (products: ProductDraft[]) => void;
}) {
  const [enviandoIndex, setEnviandoIndex] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function addProduct() {
    onChange([...products, { nome: "", descricao: "", valor: "", imagemUrl: null }]);
  }

  function removeProduct(index: number) {
    onChange(products.filter((_, i) => i !== index));
  }

  function updateProduct(index: number, patch: Partial<ProductDraft>) {
    onChange(products.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  async function handleImageChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoIndex(index);
    setErro(null);
    try {
      const url = await uploadFile(file);
      updateProduct(index, { imagemUrl: url });
    } catch {
      setErro("Falha ao enviar a foto do produto.");
    } finally {
      setEnviandoIndex(null);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">
        Produtos ({products.length}/{MAX_PRODUCTS})
      </label>
      <p className="mb-3 text-xs text-[var(--color-text-muted)]">
        Cadastro básico: foto, nome, descrição e valor — aparecem como cards no seu perfil.
      </p>

      <div className="flex flex-col gap-3">
        {products.map((product, index) => (
          <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[80px_1fr]" style={{ borderColor: "var(--color-border, #E2E8F0)" }}>
            <div>
              <div
                className="mb-1 flex h-20 w-20 items-center justify-center overflow-hidden rounded"
                style={{ background: "var(--color-bg-light)" }}
              >
                {product.imagemUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imagemUrl} alt={product.nome} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)]">sem foto</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
                disabled={enviandoIndex === index}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-2">
              <input
                placeholder="Nome do produto"
                value={product.nome}
                onChange={(e) => updateProduct(index, { nome: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Descrição"
                rows={2}
                value={product.descricao}
                onChange={(e) => updateProduct(index, { descricao: e.target.value })}
                className="input"
              />
              <div className="flex items-center gap-2">
                <input
                  placeholder="Valor (ex: R$ 29,90)"
                  value={product.valor}
                  onChange={(e) => updateProduct(index, { valor: e.target.value })}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="btn btn-outline"
                  style={{ padding: "6px 12px", fontSize: 13, whiteSpace: "nowrap" }}
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {erro && <p className="mt-1 text-xs text-[var(--color-accent-coral)]">{erro}</p>}

      {products.length < MAX_PRODUCTS && (
        <button type="button" onClick={addProduct} className="btn btn-outline mt-3" style={{ padding: "6px 16px", fontSize: 13 }}>
          + Adicionar produto
        </button>
      )}
    </div>
  );
}
