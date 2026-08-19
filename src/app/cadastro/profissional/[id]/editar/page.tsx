import { notFound, redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfissionalForm } from "@/components/forms/ProfissionalForm";

const editSelect = {
  id: true,
  codigoPublico: true,
  ownerId: true,
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
  category: { include: { subcategories: true } },
  subcategory: true,
  city: true,
  media: { orderBy: { ordem: "asc" as const } },
  products: { orderBy: { ordem: "asc" as const } },
} satisfies Prisma.ProfessionalSelect;

export default async function EditarProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/cadastro/profissional/${id}/editar`);

  const professional = await prisma.professional.findUnique({ where: { id }, select: editSelect });

  if (!professional) notFound();
  if (professional.ownerId !== session.user.id && session.user.role !== "ADMIN") notFound();

  const { ownerId: _ownerId, ...professionalData } = professional;

  return (
    <ProfissionalForm
      mode="edit"
      professionalId={professional.id}
      initialData={{ ...professionalData, criadoEm: professional.criadoEm.toISOString() }}
    />
  );
}
