import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const professionalSelect = {
  id: true,
  codigoPublico: true,
  nome: true,
  whatsapp: true,
  email: true,
  instagram: true,
  facebook: true,
  descricao: true,
  bairroAtuacao: true,
  status: true,
  criadoEm: true,
  category: true,
  subcategory: true,
  city: true,
  media: { orderBy: { ordem: "asc" as const } },
} satisfies Prisma.ProfessionalSelect;

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const codigo = request.nextUrl.searchParams.get("codigo")?.trim().toUpperCase();
  if (!codigo) {
    return NextResponse.json({ error: "Informe o código público" }, { status: 400 });
  }

  const [listing, professional] = await Promise.all([
    prisma.listing.findUnique({
      where: { codigoPublico: codigo },
      include: { category: true, subcategory: true, city: true, media: { orderBy: { ordem: "asc" } } },
    }),
    prisma.professional.findUnique({
      where: { codigoPublico: codigo },
      select: professionalSelect,
    }),
  ]);

  if (!listing && !professional) {
    return NextResponse.json({ error: "Nenhum cadastro encontrado com esse código" }, { status: 404 });
  }

  return NextResponse.json({ listing, professional });
}
