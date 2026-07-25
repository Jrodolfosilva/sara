import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/SearchBar";
import { ResultCard } from "@/components/ResultCard";
import { CategoryIcon } from "@/components/CategoryIcon";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await prisma.category.findMany({ orderBy: { nome: "asc" } });

  const rows = await prisma.professional.findMany({
    where: { status: "APROVADO" },
    orderBy: { criadoEm: "desc" },
    take: 6,
    include: {
      category: { include: { subcategories: true } },
      subcategory: true,
      city: true,
      media: { orderBy: { ordem: "asc" } },
    },
  });

  const professionals = rows.map((p) => ({ ...p, criadoEm: p.criadoEm.toISOString() }));

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

      {professionals.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Profissionais em Destaque</h2>
              <p>Encontre especialistas locais prontos para atender você</p>
            </div>

            <div className="cards-grid">
              {professionals.map((p) => (
                <ResultCard key={p.id} kind="profissional" item={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
