import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const select = {
    id: true,
    nome: true,
    codigoPublico: true,
    subscriptionStatus: true,
    trialEndsAt: true,
    currentPeriodEnd: true,
  } as const;

  const [listings, professionals] = await Promise.all([
    prisma.listing.findMany({ where: { ownerId: session.user.id }, select, orderBy: { criadoEm: "asc" } }),
    prisma.professional.findMany({ where: { ownerId: session.user.id }, select, orderBy: { criadoEm: "asc" } }),
  ]);

  const negocios = [
    ...listings.map((l) => ({ ...l, tipo: "listing" as const })),
    ...professionals.map((p) => ({ ...p, tipo: "professional" as const })),
  ];

  return NextResponse.json({ negocios });
}
