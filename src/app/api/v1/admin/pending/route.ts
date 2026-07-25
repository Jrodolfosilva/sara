import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const [listings, professionals] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PENDENTE" },
      include: { category: true, subcategory: true, city: true, media: true },
      orderBy: { criadoEm: "asc" },
    }),
    prisma.professional.findMany({
      where: { status: "PENDENTE" },
      select: {
        id: true,
        codigoPublico: true,
        nome: true,
        whatsapp: true,
        email: true,
        descricao: true,
        bairroAtuacao: true,
        status: true,
        criadoEm: true,
        category: true,
        subcategory: true,
        city: true,
        media: true,
      },
      orderBy: { criadoEm: "asc" },
    }),
  ]);

  return NextResponse.json({ listings, professionals });
}
