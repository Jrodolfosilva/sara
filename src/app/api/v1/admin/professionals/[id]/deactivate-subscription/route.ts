import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const professional = await prisma.professional.update({
    where: { id },
    data: {
      subscriptionStatus: "NONE",
      currentPeriodEnd: null,
    },
  });

  return NextResponse.json({ professional });
}
