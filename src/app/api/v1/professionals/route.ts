import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { encrypt, hashCpf } from "@/lib/crypto";
import { normalizeText } from "@/lib/text";
import { withUniquePublicId } from "@/lib/publicId";

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
  status: true,
  criadoEm: true,
  category: true,
  subcategory: true,
  city: true,
  media: { orderBy: { ordem: "asc" as const } },
} satisfies Prisma.ProfessionalSelect;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("query")?.trim();
  const categoryId = params.get("categoryId") ?? undefined;
  const subcategoryId = params.get("subcategoryId") ?? undefined;
  const cityId = params.get("cityId") ?? undefined;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize") ?? 20)));

  const where: Prisma.ProfessionalWhereInput = {
    status: "APROVADO",
    ...(categoryId && { categoryId }),
    ...(subcategoryId && { subcategoryId }),
    ...(cityId && { cityId }),
  };

  let items;
  let total;

  if (query) {
    // Contains/insensitive do Postgres ignora capslock mas não acento, então
    // filtra em memória com texto normalizado (sem acento) pra padronizar os dois.
    const normalizedQuery = normalizeText(query);
    const candidates = await prisma.professional.findMany({
      where,
      select: publicSelect,
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
      prisma.professional.findMany({
        where,
        select: publicSelect,
        orderBy: { criadoEm: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.professional.count({ where }),
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

const cpfRegex = /^\d{11}$/;

const createSchema = z.object({
  nome: z.string().min(2),
  cpf: z.string().regex(cpfRegex, "CPF deve ter 11 dígitos, sem pontuação"),
  dataNascimento: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida"),
  whatsapp: z.string().min(8),
  categoryId: z.string(),
  subcategoryId: z.string().optional(),
  cityId: z.string(),
  descricao: z.string().min(10),
  bairroAtuacao: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  fotoPerfilUrl: z.string().optional(),
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

  const { cpf, dataNascimento, fotoPerfilUrl, ...data } = parsed.data;

  const cpfDuplicado = await prisma.professional.findUnique({
    where: { cpfHash: hashCpf(cpf) },
  });
  if (cpfDuplicado) {
    return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });
  }

  const professional = await withUniquePublicId("PRO", (codigoPublico) =>
    prisma.professional.create({
      data: {
        ...data,
        email: data.email || undefined,
        codigoPublico,
        cpfCriptografado: encrypt(cpf),
        cpfHash: hashCpf(cpf),
        dataNascimento: new Date(dataNascimento),
        ownerId: session.user.id,
        media: fotoPerfilUrl ? { create: [{ tipo: "FOTO", url: fotoPerfilUrl, ordem: 0 }] } : undefined,
      },
      select: publicSelect,
    })
  );

  if (session.user.role === "USER") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "OWNER" },
    });
  }

  return NextResponse.json(professional, { status: 201 });
}
