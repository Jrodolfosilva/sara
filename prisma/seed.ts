import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/text";

const prisma = new PrismaClient();

const categorias = [
  {
    nome: "Turismo",
    slug: "turismo",
    subcategorias: ["Cachoeiras", "Trilhas", "Balneários", "Pesca", "Camping", "Guias"],
  },
  {
    nome: "Comércio",
    slug: "comercio",
    subcategorias: ["Supermercados", "Farmácias", "Padarias", "Lojas"],
  },
  {
    nome: "Serviços",
    slug: "servicos",
    subcategorias: ["Eletricista", "Encanador", "Pintor", "Pedreiro", "Soldador"],
  },
  {
    nome: "Saúde",
    slug: "saude",
    subcategorias: ["Clínicas", "Médicos", "Dentistas", "Psicólogos", "Veterinários"],
  },
  {
    nome: "Educação",
    slug: "educacao",
    subcategorias: ["Escolas", "Cursos", "IFPA", "SENAI", "SENAC"],
  },
  {
    nome: "Gastronomia",
    slug: "gastronomia",
    subcategorias: ["Restaurantes", "Hamburguerias", "Cafeterias", "Sorveterias"],
  },
  {
    nome: "Agro",
    slug: "agro",
    subcategorias: ["Queijos", "Mel", "Hortaliças", "Agricultura familiar"],
  },
  {
    nome: "Indústria",
    slug: "industria",
    subcategorias: ["Prestadores", "Metalurgia", "Construção"],
  },
  {
    nome: "Outros",
    slug: "outros",
    subcategorias: ["Outros"],
  },
];

async function main() {
  await prisma.city.upsert({
    where: { nome_uf: { nome: "Parauapebas", uf: "PA" } },
    update: { ativa: true, slug: slugify("Parauapebas") },
    create: { nome: "Parauapebas", uf: "PA", ativa: true, slug: slugify("Parauapebas") },
  });

  await prisma.city.upsert({
    where: { nome_uf: { nome: "Canaã dos Carajás", uf: "PA" } },
    update: { slug: slugify("Canaã dos Carajás") },
    create: { nome: "Canaã dos Carajás", uf: "PA", ativa: false, slug: slugify("Canaã dos Carajás") },
  });

  await prisma.city.upsert({
    where: { nome_uf: { nome: "Marabá", uf: "PA" } },
    update: { slug: slugify("Marabá") },
    create: { nome: "Marabá", uf: "PA", ativa: false, slug: slugify("Marabá") },
  });

  for (const cat of categorias) {
    const categoria = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { nome: cat.nome },
      create: { nome: cat.nome, slug: cat.slug },
    });

    for (const sub of cat.subcategorias) {
      const subSlug = slugify(sub);
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: categoria.id, slug: subSlug } },
        update: { nome: sub },
        create: { nome: sub, slug: subSlug, categoryId: categoria.id },
      });
    }
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
