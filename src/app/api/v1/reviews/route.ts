import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getClientIp, rateLimit, respostaLimitada } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const listingId = params.get("listingId") ?? undefined;
  const professionalId = params.get("professionalId") ?? undefined;

  if (!listingId && !professionalId) {
    return NextResponse.json({ error: "Informe listingId ou professionalId" }, { status: 400 });
  }

  const where: Prisma.ReviewWhereInput = listingId ? { listingId } : { professionalId };

  const [items, agregado, session] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      include: { author: { select: { nome: true } } },
    }),
    prisma.review.aggregate({ where, _avg: { estrelas: true }, _count: true }),
    auth(),
  ]);

  const jaAvaliado = !!session?.user && items.some((r) => r.authorId === session.user.id);

  return NextResponse.json({
    items,
    media: agregado._avg.estrelas ?? 0,
    total: agregado._count,
    jaAvaliado,
  });
}

const createSchema = z
  .object({
    listingId: z.string().optional(),
    professionalId: z.string().optional(),
    estrelas: z.number().int().min(1).max(5),
    depoimento: z.string().min(5).max(1000),
  })
  .refine((v) => !!v.listingId !== !!v.professionalId, {
    message: "Informe exatamente um: listingId ou professionalId",
  });

export async function POST(request: NextRequest) {
  const limite = rateLimit(`reviews:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!limite.permitido) return respostaLimitada(limite.retryAfterSegundos);

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { listingId, professionalId, estrelas, depoimento } = parsed.data;

  const alvo = listingId
    ? await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true, status: true } })
    : await prisma.professional.findUnique({ where: { id: professionalId }, select: { ownerId: true, status: true } });

  if (!alvo || alvo.status !== "APROVADO") {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (alvo.ownerId === session.user.id) {
    return NextResponse.json({ error: "Não é possível avaliar o próprio cadastro" }, { status: 403 });
  }

  try {
    const review = await prisma.review.create({
      data: {
        listingId,
        professionalId,
        authorId: session.user.id,
        estrelas,
        depoimento,
      },
      include: { author: { select: { nome: true } } },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Você já avaliou este perfil" }, { status: 409 });
    }
    throw error;
  }
}
