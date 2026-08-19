import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { passaGateAssinatura } from "@/lib/subscriptionGate";
import { PerfilConteudo } from "@/components/PerfilConteudo";
import { categoryCoverClass } from "@/components/CategoryIcon";

const includeCompleto = {
  category: { include: { subcategories: true } },
  subcategory: true,
  city: true,
  media: { orderBy: { ordem: "asc" as const } },
  products: { orderBy: { ordem: "asc" as const } },
  owner: { select: { criadoEm: true, subscriptionStatus: true } },
};

async function buscarItem(id: string) {
  const listing = await prisma.listing.findFirst({
    where: { id, status: "APROVADO" },
    include: includeCompleto,
  });
  if (listing) {
    if (!passaGateAssinatura(listing.owner)) return null;
    return { kind: "empresa" as const, item: listing };
  }

  const professional = await prisma.professional.findFirst({
    where: { id, status: "APROVADO" },
    include: includeCompleto,
  });
  if (professional) {
    if (!passaGateAssinatura(professional.owner)) return null;
    return { kind: "profissional" as const, item: professional };
  }

  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) return {};

  const resultado = await buscarItem(id);
  if (!resultado) return {};

  const { kind, item } = resultado;
  const local = kind === "empresa" ? item.city.nome : (item.bairroAtuacao ?? item.city.nome);
  const title = `${item.nome} — ${item.category.nome} em ${local} | Busca Pebas`;
  const description = item.descricao.slice(0, 155);
  const foto =
    kind === "empresa"
      ? (item.media.find((m) => m.tipo === "LOGO")?.url ?? item.media[0]?.url)
      : item.media[0]?.url;

  return {
    title,
    description,
    openGraph: { title, description, images: foto ? [{ url: foto }] : undefined },
  };
}

export default async function PerfilPublicoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const resultado = await buscarItem(id);
  if (!resultado) notFound();

  const { kind, item } = resultado;
  const capa = categoryCoverClass(item.category.slug, item.subcategory?.slug);

  return (
    <div className="container py-12">
      <div className="modal-card" style={{ margin: "0 auto", maxHeight: "none", overflow: "visible" }}>
        <div className="modal-header-cover" style={{ background: capa }} />
        <div className="modal-body">
          {kind === "empresa" ? (
            <PerfilConteudo kind="empresa" item={{ ...item, criadoEm: item.criadoEm.toISOString() }} />
          ) : (
            <PerfilConteudo
              kind="profissional"
              item={{ ...item, criadoEm: item.criadoEm.toISOString() }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
