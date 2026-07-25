"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { ResultCard } from "@/components/ResultCard";
import type { Listing, Paginated, Professional } from "@/types/catalog";

type Resultado =
  | { kind: "empresa"; item: Listing }
  | { kind: "profissional"; item: Professional };

export default function BuscaPage() {
  return (
    <Suspense fallback={null}>
      <BuscaContent />
    </Suspense>
  );
}

function BuscaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("query") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const cityId = searchParams.get("cityId") ?? "";

  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (categoryId) params.set("categoryId", categoryId);
    if (cityId) params.set("cityId", cityId);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- mostra indicador enquanto refaz a busca
    setCarregando(true);
    Promise.all([
      fetch(`/api/v1/listings?${params.toString()}`).then((r) => r.json()) as Promise<Paginated<Listing>>,
      fetch(`/api/v1/professionals?${params.toString()}`).then((r) => r.json()) as Promise<Paginated<Professional>>,
    ])
      .then(([listings, professionals]) => {
        const combinado: Resultado[] = [
          ...listings.items.map((item) => ({ kind: "empresa" as const, item })),
          ...professionals.items.map((item) => ({ kind: "profissional" as const, item })),
        ].sort((a, b) => (a.item.criadoEm < b.item.criadoEm ? 1 : -1));
        setResultados(combinado);
      })
      .finally(() => setCarregando(false));
  }, [query, categoryId, cityId]);

  function updateFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(`/busca?${params.toString()}`);
  }

  return (
    <>
      <section className="busca-hero" />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <SearchBar
          defaultValue={query}
          categoryId={categoryId}
          onCategoryChange={(v) => updateFilter("categoryId", v)}
          cityId={cityId}
          onCityChange={(v) => updateFilter("cityId", v)}
        />

        <div className="mt-8">
          {carregando && <p className="text-sm text-[var(--color-text-muted)]">Buscando...</p>}

          {!carregando && resultados.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Nada encontrado. Tenta outro termo ou categoria.
            </p>
          )}

          <div className="cards-grid">
            {resultados.map((r) =>
              r.kind === "empresa" ? (
                <ResultCard key={`empresa-${r.item.id}`} kind="empresa" item={r.item} />
              ) : (
                <ResultCard key={`profissional-${r.item.id}`} kind="profissional" item={r.item} />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
