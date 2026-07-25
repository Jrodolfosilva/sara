import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encrypt, hashCpf } from "../src/lib/crypto";
import { generatePublicId } from "../src/lib/publicId";

const prisma = new PrismaClient();

const CATEGORY_SLUG = "servicos";
const CITY = { nome: "Parauapebas", uf: "PA" };

type Empresa = {
  nome: string;
  descricao: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
};

type Autonomo = {
  nome: string;
  descricao: string;
  whatsapp: string;
  cpf: string;
  dataNascimento: string;
  bairroAtuacao: string;
};

const dados: Record<string, { empresas: Empresa[]; autonomos: Autonomo[] }> = {
  eletricista: {
    empresas: [
      { nome: "Elétrica Carajás", descricao: "Instalações e manutenções elétricas residenciais e comerciais.", endereco: "Rua dos Ipês, 120, Parauapebas - PA", telefone: "9499990001", whatsapp: "9499990001" },
      { nome: "Amazônia Instalações Elétricas", descricao: "Projetos elétricos, padrão de entrada e quadros de distribuição.", endereco: "Av. Castanhal, 340, Parauapebas - PA", telefone: "9499990002", whatsapp: "9499990002" },
      { nome: "Voltz Serviços Elétricos", descricao: "Manutenção preventiva e corretiva em rede elétrica.", endereco: "Rua Tocantins, 88, Parauapebas - PA", telefone: "9499990003", whatsapp: "9499990003" },
    ],
    autonomos: [
      { nome: "João Pereira", descricao: "Eletricista autônomo, atendimento residencial e comercial.", whatsapp: "9499991001", cpf: "10000000001", dataNascimento: "1985-03-12", bairroAtuacao: "Cidade Nova" },
      { nome: "Marcos Almeida", descricao: "Eletricista predial, instalação de chuveiros e disjuntores.", whatsapp: "9499991002", cpf: "10000000002", dataNascimento: "1990-07-22", bairroAtuacao: "Rio Verde" },
      { nome: "Ricardo Souza", descricao: "Eletricista industrial e residencial, orçamento sem compromisso.", whatsapp: "9499991003", cpf: "10000000003", dataNascimento: "1988-11-05", bairroAtuacao: "Beira Rio" },
    ],
  },
  encanador: {
    empresas: [
      { nome: "Hidro Parauapebas", descricao: "Serviços hidráulicos, desentupimento e reparos em geral.", endereco: "Rua Bela Vista, 45, Parauapebas - PA", telefone: "9499990004", whatsapp: "9499990004" },
      { nome: "Encanamentos Rio Verde", descricao: "Instalação e manutenção de tubulações residenciais.", endereco: "Av. dos Cajueiros, 210, Parauapebas - PA", telefone: "9499990005", whatsapp: "9499990005" },
      { nome: "SOS Encanador PA", descricao: "Atendimento emergencial 24h para vazamentos e entupimentos.", endereco: "Rua Paraná, 15, Parauapebas - PA", telefone: "9499990006", whatsapp: "9499990006" },
    ],
    autonomos: [
      { nome: "Carlos Nunes", descricao: "Encanador autônomo, reparos e instalações hidráulicas.", whatsapp: "9499991004", cpf: "10000000004", dataNascimento: "1983-02-18", bairroAtuacao: "Cidade Jardim" },
      { nome: "Paulo Ferreira", descricao: "Desentupimento e troca de registros e tubulações.", whatsapp: "9499991005", cpf: "10000000005", dataNascimento: "1979-09-30", bairroAtuacao: "Novo Horizonte" },
      { nome: "André Lima", descricao: "Encanador residencial, instalação de caixas d'água.", whatsapp: "9499991006", cpf: "10000000006", dataNascimento: "1992-05-14", bairroAtuacao: "União" },
    ],
  },
  pintor: {
    empresas: [
      { nome: "Cor & Arte Pinturas", descricao: "Pintura residencial e comercial, texturas e grafiatos.", endereco: "Rua das Flores, 77, Parauapebas - PA", telefone: "9499990007", whatsapp: "9499990007" },
      { nome: "Pintou Parauapebas", descricao: "Pintura interna e externa, impermeabilização.", endereco: "Av. Marginal, 500, Parauapebas - PA", telefone: "9499990008", whatsapp: "9499990008" },
      { nome: "Renove Pinturas", descricao: "Serviços de pintura predial e reforma de fachadas.", endereco: "Rua Amapá, 33, Parauapebas - PA", telefone: "9499990009", whatsapp: "9499990009" },
    ],
    autonomos: [
      { nome: "Sérgio Costa", descricao: "Pintor autônomo, orçamento grátis e material próprio.", whatsapp: "9499991007", cpf: "10000000007", dataNascimento: "1987-01-25", bairroAtuacao: "Cidade Nova" },
      { nome: "Fábio Rocha", descricao: "Pintura residencial, textura e grafiato.", whatsapp: "9499991008", cpf: "10000000008", dataNascimento: "1991-06-09", bairroAtuacao: "Rio Verde" },
      { nome: "Diego Martins", descricao: "Pintor predial, serviço rápido e com garantia.", whatsapp: "9499991009", cpf: "10000000009", dataNascimento: "1984-10-02", bairroAtuacao: "Beira Rio" },
    ],
  },
  pedreiro: {
    empresas: [
      { nome: "Construtora Carajás", descricao: "Construção e reforma residencial e comercial.", endereco: "Rua Minas Gerais, 150, Parauapebas - PA", telefone: "9499990010", whatsapp: "9499990010" },
      { nome: "Alicerce Construções", descricao: "Fundação, alvenaria e acabamento em geral.", endereco: "Av. Goiás, 260, Parauapebas - PA", telefone: "9499990011", whatsapp: "9499990011" },
      { nome: "Obra Certa Parauapebas", descricao: "Reformas, ampliações e serviços de acabamento.", endereco: "Rua Bahia, 18, Parauapebas - PA", telefone: "9499990012", whatsapp: "9499990012" },
    ],
    autonomos: [
      { nome: "Antônio Barbosa", descricao: "Pedreiro autônomo, reforma e construção em geral.", whatsapp: "9499991010", cpf: "10000000010", dataNascimento: "1980-04-11", bairroAtuacao: "Cidade Jardim" },
      { nome: "José Ribeiro", descricao: "Pedreiro, serviços de alvenaria e revestimento.", whatsapp: "9499991011", cpf: "10000000011", dataNascimento: "1975-12-19", bairroAtuacao: "Novo Horizonte" },
      { nome: "Wellington Dias", descricao: "Pedreiro autônomo, orçamento sem compromisso.", whatsapp: "9499991012", cpf: "10000000012", dataNascimento: "1993-08-27", bairroAtuacao: "União" },
    ],
  },
  soldador: {
    empresas: [
      { nome: "Solda Forte Carajás", descricao: "Serviços de solda e estrutura metálica.", endereco: "Rua Industrial, 90, Parauapebas - PA", telefone: "9499990013", whatsapp: "9499990013" },
      { nome: "Metalúrgica Amazônia", descricao: "Fabricação e manutenção de estruturas metálicas.", endereco: "Av. dos Metalúrgicos, 400, Parauapebas - PA", telefone: "9499990014", whatsapp: "9499990014" },
      { nome: "Solda & Cia PA", descricao: "Solda em portões, grades e estruturas em geral.", endereco: "Rua Pará, 22, Parauapebas - PA", telefone: "9499990015", whatsapp: "9499990015" },
    ],
    autonomos: [
      { nome: "Edson Cardoso", descricao: "Soldador autônomo, portões e grades sob medida.", whatsapp: "9499991013", cpf: "10000000013", dataNascimento: "1982-07-03", bairroAtuacao: "Cidade Nova" },
      { nome: "Fernando Teixeira", descricao: "Soldador, serviços de estrutura metálica em geral.", whatsapp: "9499991014", cpf: "10000000014", dataNascimento: "1989-02-15", bairroAtuacao: "Rio Verde" },
      { nome: "Luiz Gomes", descricao: "Soldador autônomo, atendimento residencial e industrial.", whatsapp: "9499991015", cpf: "10000000015", dataNascimento: "1986-09-21", bairroAtuacao: "Beira Rio" },
    ],
  },
};

async function main() {
  const city = await prisma.city.upsert({
    where: { nome_uf: CITY },
    update: {},
    create: { ...CITY, ativa: true },
  });

  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (!category) {
    throw new Error(`Categoria "${CATEGORY_SLUG}" não encontrada. Rode "npm run db:seed" primeiro.`);
  }

  const owner = await prisma.user.upsert({
    where: { email: "seed-servicos@buscapebas.local" },
    update: {},
    create: {
      nome: "Seed Serviços",
      email: "seed-servicos@buscapebas.local",
      senhaHash: await bcrypt.hash("seed-servicos-senha", 10),
      role: "OWNER",
    },
  });

  for (const [subSlug, { empresas, autonomos }] of Object.entries(dados)) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug: subSlug } },
    });
    if (!subcategory) {
      console.warn(`Subcategoria "${subSlug}" não encontrada, pulando.`);
      continue;
    }

    for (const empresa of empresas) {
      const existente = await prisma.listing.findFirst({
        where: { nome: empresa.nome, subcategoryId: subcategory.id },
      });
      if (existente) continue;

      await prisma.listing.create({
        data: {
          ownerId: owner.id,
          cityId: city.id,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          codigoPublico: generatePublicId("EMP"),
          nome: empresa.nome,
          descricao: empresa.descricao,
          endereco: empresa.endereco,
          telefone: empresa.telefone,
          whatsapp: empresa.whatsapp,
          status: "APROVADO",
        },
      });
    }

    for (const autonomo of autonomos) {
      const cpfHash = hashCpf(autonomo.cpf);
      const existente = await prisma.professional.findUnique({ where: { cpfHash } });
      if (existente) continue;

      await prisma.professional.create({
        data: {
          ownerId: owner.id,
          cityId: city.id,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          codigoPublico: generatePublicId("PRO"),
          nome: autonomo.nome,
          cpfCriptografado: encrypt(autonomo.cpf),
          cpfHash,
          dataNascimento: new Date(autonomo.dataNascimento),
          whatsapp: autonomo.whatsapp,
          descricao: autonomo.descricao,
          bairroAtuacao: autonomo.bairroAtuacao,
          status: "APROVADO",
        },
      });
    }
  }

  console.log("Seed de Serviços concluído: 3 empresas + 3 autônomos por subcategoria.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
