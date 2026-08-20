"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Grid3x3 } from "lucide-react";
import { useCatalogData } from "@/lib/useCatalogData";

export function SearchBar({
  defaultValue = "",
  variant = "page",
  categoryId: categoryIdProp,
  onCategoryChange,
  cityId,
  onCityChange,
}: {
  defaultValue?: string;
  variant?: "hero" | "page";
  categoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  cityId?: string;
  onCityChange?: (cityId: string) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [categoryIdState, setCategoryIdState] = useState("");
  const { categories, cities } = useCatalogData();

  const citySelectable = !!onCityChange;
  const categoryId = categoryIdProp ?? categoryIdState;

  function setCategoryId(value: string) {
    if (onCategoryChange) onCategoryChange(value);
    else setCategoryIdState(value);
  }

  const cidadeFixa = cities[0] ? `${cities[0].nome}, ${cities[0].uf}` : "Parauapebas, PA";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (categoryId) params.set("categoryId", categoryId);
    if (citySelectable && cityId) params.set("cityId", cityId);
    router.push(`/busca?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={variant === "page" ? "search-box search-box--full" : "search-box"}
    >
      <div className="search-field">
        <Search size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            variant === "hero"
              ? 'O que você precisa? (ex: Eletricista, Restaurante, Cachoeira)'
              : 'Procure "design gráfico"'
          }
          autoFocus
        />
      </div>

      <div className="search-field">
        <MapPin size={20} />
        {citySelectable ? (
          <select value={cityId} onChange={(e) => onCityChange?.(e.target.value)}>
            <option value="">Todas as cidades</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        ) : (
          <input value={cidadeFixa} disabled readOnly />
        )}
      </div>

      <div className="search-field search-field--category">
        <Grid3x3 size={20} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas Categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-accent search-btn">
        <Search size={18} /> Buscar
      </button>
    </form>
  );
}
