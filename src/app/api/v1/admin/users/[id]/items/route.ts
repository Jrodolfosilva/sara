import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const listingSelect = {
  id: true,
  codigoPublico: true,
  nome: true,
  status: true,
  category: true,
  subcategory: true,
  city: true,
} satisfies Prisma.ListingSelect;

const professionalSelect = {
  id: true,
  codigoPublico: true,
  nome: true,
  status: true,
  category: true,
  subcategory: true,
  city: true,
} satisfies Prisma.ProfessionalSelect;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const [listings, professionals] = await Promise.all([
    prisma.listing.findMany({
      where: { ownerId: id },
      select: listingSelect,
      orderBy: { criadoEm: "desc" },
    }),
    prisma.professional.findMany({
      where: { ownerId: id },
      select: professionalSelect,
      orderBy: { criadoEm: "desc" },
    }),
  ]);

  return NextResponse.json({ listings, professionals });
}
