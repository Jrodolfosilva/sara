import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const periodoEmDias = 30;
  const currentPeriodEnd = new Date(Date.now() + periodoEmDias * 24 * 60 * 60 * 1000);

  const user = await prisma.user.update({
    where: { id },
    data: {
      subscriptionStatus: "ACTIVE",
      currentPeriodEnd,
    },
  });

  return NextResponse.json({ user });
}
