import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}
