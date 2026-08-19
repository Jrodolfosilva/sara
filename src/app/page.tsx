import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/SearchBar";
import { ResultCard } from "@/components/ResultCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { gateAssinaturaOwner } from "@/lib/subscriptionGate";

export const dynamic = "force-dynamic";

const includeCompleto = {
  category: { include: { subcategories: true } },
  subcategory: true,
  city: true,
  media: { orderBy: { ordem: "asc" as const } },
  products: { orderBy: { ordem: "asc" as const } },
};

export default async function Home() {
  const categories = await prisma.category.findMany({ orderBy: { nome: "asc" } });

  const gateOwner = gateAssinaturaOwner();
  const where = { status: "APROVADO" as const, ...(gateOwner && { owner: gateOwner }) };

  const [listingRows, professionalRows] = await Promise.all([
    prisma.listing.findMany({ where, orderBy: { criadoEm: "desc" }, take: 6, include: includeCompleto }),
    prisma.professional.findMany({ where, orderBy: { criadoEm: "desc" }, take: 6, include: includeCompleto }),
  ]);

  const destaques = [
    ...listingRows.map((l) => ({ kind: "empresa" as const, item: { ...l, criadoEm: l.criadoEm.toISOString() } })),
    ...professionalRows.map((p) => ({
      kind: "profissional" as const,
      item: { ...p, criadoEm: p.criadoEm.toISOString() },
    })),
  ]
    .sort((a, b) => (a.item.criadoEm < b.item.criadoEm ? 1 : -1))
    .slice(0, 6);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Encontre os melhores profissionais e empresas de Parauapebas</h1>
          <p className="hero-subtitle">
            Conecte-se com especialistas locais verificados, do comércio ao turismo,
            e chame direto no WhatsApp.
          </p>

          <SearchBar variant="hero" />
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Categorias</h2>
            <p>Escolha uma categoria pra começar sua busca</p>
          </div>

          <div className="categories-grid">
            {categories.map((c) => (
              <Link key={c.id} href={`/busca?categoryId=${c.id}`} className="category-card">
                <div className="category-card-icon">
                  <CategoryIcon slug={c.slug} size={24} />
                </div>
                <span>{c.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {destaques.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Em Destaque</h2>
              <p>Empresas e profissionais locais prontos para atender você</p>
            </div>

            <div className="cards-grid">
              {destaques.map((d) =>
                d.kind === "empresa" ? (
                  <ResultCard key={`empresa-${d.item.id}`} kind="empresa" item={d.item} />
                ) : (
                  <ResultCard key={`profissional-${d.item.id}`} kind="profissional" item={d.item} />
                )
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
