import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmpresaForm } from "@/components/forms/EmpresaForm";

export default async function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/cadastro/empresa/${id}/editar`);

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      category: { include: { subcategories: true } },
      subcategory: true,
      city: true,
      media: { orderBy: { ordem: "asc" } },
      products: { orderBy: { ordem: "asc" } },
    },
  });

  if (!listing) notFound();
  if (listing.ownerId !== session.user.id && session.user.role !== "ADMIN") notFound();

  return (
    <EmpresaForm
      mode="edit"
      listingId={listing.id}
      initialData={{ ...listing, criadoEm: listing.criadoEm.toISOString() }}
    />
  );
}
