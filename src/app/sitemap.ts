import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { gateAssinaturaOwner } from "@/lib/subscriptionGate";

// Gerado por request, não no build: precisa refletir listagens aprovadas
// (mudam o tempo todo) e o banco não está acessível durante `docker build`.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const gateOwner = gateAssinaturaOwner();
  const [listings, professionals] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "APROVADO", ...(gateOwner && { owner: gateOwner }) },
      select: {
        id: true,
        atualizadoEm: true,
        category: { select: { slug: true } },
        subcategory: { select: { slug: true } },
        city: { select: { slug: true } },
      },
    }),
    prisma.professional.findMany({
      where: { status: "APROVADO", ...(gateOwner && { owner: gateOwner }) },
      select: {
        id: true,
        atualizadoEm: true,
        category: { select: { slug: true } },
        subcategory: { select: { slug: true } },
        city: { select: { slug: true } },
      },
    }),
  ]);

  const paraUrl = (item: {
    id: string;
    atualizadoEm: Date;
    category: { slug: string };
    subcategory: { slug: string } | null;
    city: { slug: string | null };
  }) => {
    const cidadeSlug = item.city.slug ?? item.id;
    const categoriaSlug = item.subcategory?.slug ?? item.category.slug;
    return {
      url: `${baseUrl}/${cidadeSlug}/${categoriaSlug}?id=${item.id}`,
      lastModified: item.atualizadoEm,
      changeFrequency: "weekly" as const,
    };
  };

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/busca`, changeFrequency: "daily", priority: 0.8 },
    ...listings.map(paraUrl),
    ...professionals.map(paraUrl),
  ];
}
