export type Subcategory = {
  id: string;
  nome: string;
  slug: string;
  categoryId: string;
};

export type Category = {
  id: string;
  nome: string;
  slug: string;
  icone: string | null;
  subcategories: Subcategory[];
};

export type City = {
  id: string;
  nome: string;
  uf: string;
  slug: string | null;
  ativa: boolean;
};

export type Media = {
  id: string;
  tipo: "FOTO" | "LOGO" | "VIDEO";
  url: string;
  ordem: number;
};

export type Listing = {
  id: string;
  codigoPublico: string;
  nome: string;
  cnpj: string | null;
  descricao: string;
  telefone: string | null;
  telefoneFixo: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  site: string | null;
  email: string | null;
  endereco: string;
  lat: number | null;
  lng: number | null;
  horario: string | null;
  valorHora: string | null;
  aceitaPix: boolean;
  aceitaCartao: boolean;
  entrega: boolean;
  atendimentoDomiciliar: boolean;
  status: "PENDENTE" | "APROVADO" | "REPROVADO" | "INATIVO";
  category: Category;
  subcategory: Subcategory | null;
  city: City;
  media: Media[];
  criadoEm: string;
};

export type Professional = {
  id: string;
  codigoPublico: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  descricao: string;
  bairroAtuacao: string | null;
  valorHora: string | null;
  status: "PENDENTE" | "APROVADO" | "REPROVADO" | "INATIVO";
  category: Category;
  subcategory: Subcategory | null;
  city: City;
  media: Media[];
  criadoEm: string;
};

export type Review = {
  id: string;
  estrelas: number;
  depoimento: string;
  criadoEm: string;
  author: { nome: string };
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
