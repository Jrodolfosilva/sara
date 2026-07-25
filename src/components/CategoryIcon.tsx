import {
  Trees,
  ShoppingBag,
  Wrench,
  Stethoscope,
  GraduationCap,
  UtensilsCrossed,
  Wheat,
  Factory,
  MapPin,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  turismo: Trees,
  comercio: ShoppingBag,
  servicos: Wrench,
  saude: Stethoscope,
  educacao: GraduationCap,
  gastronomia: UtensilsCrossed,
  agro: Wheat,
  industria: Factory,
};

export function CategoryIcon({ slug, size = 22 }: { slug: string; size?: number }) {
  const Icon = ICONS[slug] ?? MapPin;
  return <Icon size={size} strokeWidth={2} />;
}

const COVER_PALETTE = [
  "#00426a", // navy
  "#0f766e", // teal
  "#e11d48", // rose
  "#0284c7", // sky
  "#4338ca", // indigo
  "#f59e0b", // amber
  "#15803d", // green
  "#334155", // slate
  "#9333ea", // purple
  "#be123c", // crimson
  "#0ea5e9", // cyan
  "#65a30d", // lime
  "#c2410c", // burnt orange
  "#7c3aed", // violet
];

function hashKey(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Cor sólida da capa do card: varia por subcategoria (não só por categoria) pra não repetir cor entre profissões diferentes de uma mesma categoria. */
export function categoryCoverClass(categorySlug: string, subcategorySlug?: string | null) {
  const key = subcategorySlug ? `${categorySlug}:${subcategorySlug}` : categorySlug;
  return COVER_PALETTE[hashKey(key) % COVER_PALETTE.length];
}
