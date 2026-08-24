import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AssinaturaError, criarCheckoutNegocio } from "@/lib/subscriptionCheckout";

const bodySchema = z.object({
  tipo: z.enum(["listing", "professional"]),
  id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Negócio inválido" }, { status: 400 });
  }
  const { tipo, id } = parsed.data;

  const item =
    tipo === "listing"
      ? await prisma.listing.findUnique({ where: { id }, select: { ownerId: true } })
      : await prisma.professional.findUnique({ where: { id }, select: { ownerId: true } });

  if (!item) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (item.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const url = await criarCheckoutNegocio({ tipo, id, origin: request.nextUrl.origin });
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof AssinaturaError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
