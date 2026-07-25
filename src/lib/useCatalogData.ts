"use client";

import { useEffect, useState } from "react";
import type { Category, City } from "@/types/catalog";

export function useCatalogData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/categories").then((r) => r.json()),
      fetch("/api/v1/cities").then((r) => r.json()),
    ])
      .then(([cats, cts]) => {
        setCategories(cats);
        setCities(cts);
      })
      .finally(() => setCarregando(false));
  }, []);

  return { categories, cities, carregando };
}
