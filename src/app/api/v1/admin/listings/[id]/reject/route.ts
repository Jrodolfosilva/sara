import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const motivo = typeof body.motivo === "string" ? body.motivo : null;

  const listing = await prisma.listing.update({
    where: { id },
    data: { status: "REPROVADO", motivoReprovacao: motivo },
  });

  return NextResponse.json(listing);
}
