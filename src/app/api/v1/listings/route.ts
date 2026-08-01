import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { normalizeText } from "@/lib/text";
import { withUniquePublicId } from "@/lib/publicId";
import { gateAssinaturaOwner } from "@/lib/subscriptionGate";

const listingInclude = {
  category: true,
  subcategory: true,
  city: true,
  media: { orderBy: { ordem: "asc" as const } },
} satisfies Prisma.ListingInclude;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("query")?.trim();
  const categoryId = params.get("categoryId") ?? undefined;
  const subcategoryId = params.get("subcategoryId") ?? undefined;
  const cityId = params.get("cityId") ?? undefined;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize") ?? 20)));

  const gateOwner = gateAssinaturaOwner();
  const where: Prisma.ListingWhereInput = {
    status: "APROVADO",
    ...(categoryId && { categoryId }),
    ...(subcategoryId && { subcategoryId }),
    ...(cityId && { cityId }),
    ...(gateOwner && { owner: gateOwner }),
  };

  let items;
  let total;

  if (query) {
    // Contains/insensitive do Postgres ignora capslock mas não acento, então
    // filtra em memória com texto normalizado (sem acento) pra padronizar os dois.
    const normalizedQuery = normalizeText(query);
    const candidates = await prisma.listing.findMany({
      where,
      include: listingInclude,
      orderBy: { criadoEm: "desc" },
    });
    const filtered = candidates.filter((item) =>
      [item.nome, item.descricao, item.category?.nome, item.subcategory?.nome]
        .filter((text): text is string => !!text)
        .some((text) => normalizeText(text).includes(normalizedQuery))
    );
    total = filtered.length;
    items = filtered.slice((page - 1) * pageSize, page * pageSize);
  } else {
    [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: listingInclude,
        orderBy: { criadoEm: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.listing.count({ where }),
    ]);
  }

  return NextResponse.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}

const mediaSchema = z.object({
  tipo: z.enum(["FOTO", "LOGO", "VIDEO"]),
  url: z.string().min(1),
});

const cnpjRegex = /^\d{14}$/;

const createSchema = z.object({
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
  lat: z.number().optional(),
  lng: z.number().optional(),
  horario: z.string().optional(),
  valorHora: z.string().optional(),
  aceitaPix: z.boolean().optional(),
  aceitaCartao: z.boolean().optional(),
  entrega: z.boolean().optional(),
  atendimentoDomiciliar: z.boolean().optional(),
  media: z.array(mediaSchema).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { media, ...data } = parsed.data;

  const listing = await withUniquePublicId("EMP", (codigoPublico) =>
    prisma.listing.create({
      data: {
        ...data,
        email: data.email || undefined,
        codigoPublico,
        ownerId: session.user.id,
        media: media?.length ? { create: media } : undefined,
      },
      include: { media: true, category: true, subcategory: true, city: true },
    })
  );

  if (session.user.role === "USER") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "OWNER" },
    });
  }

  return NextResponse.json(listing, { status: 201 });
}
