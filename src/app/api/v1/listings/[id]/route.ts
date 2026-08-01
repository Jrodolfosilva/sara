import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { passaGateAssinatura } from "@/lib/subscriptionGate";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const listing = await prisma.listing.findFirst({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      city: true,
      media: { orderBy: { ordem: "asc" } },
      owner: { select: { criadoEm: true, subscriptionStatus: true } },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const isOwnerOrAdmin =
    !!session?.user && (session.user.id === listing.ownerId || session.user.role === "ADMIN");

  const visivel = listing.status === "APROVADO" && passaGateAssinatura(listing.owner);

  if (!visivel && !isOwnerOrAdmin) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const { owner: _owner, ...listingSemOwner } = listing;
  return NextResponse.json(listingSemOwner);
}

const mediaSchema = z.object({
  tipo: z.enum(["FOTO", "LOGO", "VIDEO"]),
  url: z.string().min(1),
});

const cnpjRegex = /^\d{14}$/;

const updateSchema = z.object({
  nome: z.string().min(2),
  cnpj: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : undefined))
    .refine((v) => !v || cnpjRegex.test(v), "CNPJ inválido"),
  categoryId: z.string(),
  subcategoryId: z.string().optional(),
  cityId: z.string(),
  descricao: z.string().min(10),
  telefone: z.string().optional(),
  telefoneFixo: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  site: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  endereco: z.string().min(3),
  horario: z.string().optional(),
  valorHora: z.string().optional(),
  aceitaPix: z.boolean().optional(),
  aceitaCartao: z.boolean().optional(),
  entrega: z.boolean().optional(),
  atendimentoDomiciliar: z.boolean().optional(),
  media: z.array(mediaSchema).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.listing.findUnique({ where: { id }, select: { ownerId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (existing.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { media, ...data } = parsed.data;

  if (media) {
    await prisma.media.deleteMany({ where: { listingId: id } });
  }

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...data,
      email: data.email || undefined,
      media: media?.length ? { create: media } : undefined,
    },
    include: { media: { orderBy: { ordem: "asc" } }, category: true, subcategory: true, city: true },
  });

  return NextResponse.json(listing);
}
