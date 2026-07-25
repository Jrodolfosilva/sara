import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Gerado por request, não no build: precisa refletir listagens aprovadas
// (mudam o tempo todo) e o banco não está acessível durante `docker build`.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const listings = await prisma.listing.findMany({
    where: { status: "APROVADO" },
    select: { id: true, atualizadoEm: true },
  });

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/busca`, changeFrequency: "daily", priority: 0.8 },
    ...listings.map((l) => ({
      url: `${baseUrl}/empresa/${l.id}`,
      lastModified: l.atualizadoEm,
      changeFrequency: "weekly" as const,
    })),
  ];
}
