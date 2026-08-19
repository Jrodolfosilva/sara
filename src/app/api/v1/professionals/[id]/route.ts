import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { passaGateAssinatura } from "@/lib/subscriptionGate";

const publicSelect = {
  id: true,
  codigoPublico: true,
  nome: true,
  whatsapp: true,
  email: true,
  instagram: true,
  facebook: true,
  descricao: true,
  bairroAtuacao: true,
  valorHora: true,
  status: true,
  criadoEm: true,
  category: true,
  subcategory: true,
  city: true,
  media: { orderBy: { ordem: "asc" as const } },
  products: { orderBy: { ordem: "asc" as const } },
} satisfies Prisma.ProfessionalSelect;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const meta = await prisma.professional.findUnique({
    where: { id },
    select: {
      ownerId: true,
      status: true,
      owner: { select: { criadoEm: true, subscriptionStatus: true } },
    },
  });
  if (!meta) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const isOwnerOrAdmin =
    !!session?.user && (session.user.id === meta.ownerId || session.user.role === "ADMIN");

  const visivel = meta.status === "APROVADO" && passaGateAssinatura(meta.owner);

  if (!visivel && !isOwnerOrAdmin) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const professional = await prisma.professional.findUnique({ where: { id }, select: publicSelect });
  return NextResponse.json(professional);
}

const productSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  valor: z.string().optional(),
  imagemUrl: z.string().optional(),
});

const updateSchema = z.object({
  nome: z.string().min(2),
  whatsapp: z.string().min(8),
  categoryId: z.string(),
  subcategoryId: z.string().optional(),
  cityId: z.string(),
  descricao: z.string().min(10),
  bairroAtuacao: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  fotoUrls: z.array(z.string()).max(6).optional(),
  valorHora: z.string().optional(),
  products: z.array(productSchema).max(12).optional(),
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
  const existing = await prisma.professional.findUnique({ where: { id }, select: { ownerId: true } });
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

  const { fotoUrls, products, ...data } = parsed.data;

  if (fotoUrls) {
    await prisma.media.deleteMany({ where: { professionalId: id } });
  }
  if (products) {
    await prisma.product.deleteMany({ where: { professionalId: id } });
  }

  const professional = await prisma.professional.update({
    where: { id },
    data: {
      ...data,
      email: data.email || undefined,
      media: fotoUrls?.length
        ? { create: fotoUrls.map((url, i) => ({ tipo: "FOTO" as const, url, ordem: i })) }
        : undefined,
      products: products?.length
        ? { create: products.map((p, i) => ({ ...p, ordem: i })) }
        : undefined,
    },
    select: publicSelect,
  });

  return NextResponse.json(professional);
}
