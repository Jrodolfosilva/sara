# SDD — Documento de Design de Software
## Busca Pebas — Catálogo Inteligente de Parauapebas

Versão: 1.1
Data: 2026-07-22
Status: Rascunho para implementação (Fase 1 — PWA)

Ideia central, resumida: campo de busca + cards de empresas/profissionais com
informação básica (o que é, onde fica, como contatar) pra cliente decidir e chamar
direto no WhatsApp/telefone. Nada além disso na Fase 1. Foco é local — Parauapebas.

---

## 1. Visão do Produto

Catálogo digital de serviços, turismo, comércio, cultura e profissionais autônomos de
Parauapebas, com arquitetura pronta para expandir a outras cidades da região de Carajás
(Canaã dos Carajás, Marabá, etc.) sem reescrever o sistema.

Fase 1: PWA (Progressive Web App) — site responsivo, instalável em Android, iPhone e
desktop, sem app nativo em loja de aplicativos.

Por que PWA primeiro:
- Um único código para todas as plataformas.
- Instalável (ícone na tela inicial, abre em tela cheia, funciona offline parcialmente).
- Sem burocracia/custo de App Store e Google Play nesta fase.
- Migração futura para app nativo (React Native/Expo) reaproveita a API e o modelo de dados.

---

## 2. Escopo da Fase 1

Incluso:
- Home com busca e categorias.
- Listagem e página de detalhe de empresa/profissional.
- Cadastro público de empresa (com aprovação do admin).
- Cadastro público de profissional autônomo (com aprovação do admin).
- Login (usuário comum, empresa/profissional, admin).
- Painel administrativo (aprovar/reprovar/editar/excluir cadastros, gerenciar categorias).
- API REST versionada (`/api/v1`), documentada, pronta para consumo por um app nativo futuro.
- PWA instalável (manifest + service worker) com funcionamento offline básico (cache do
  shell da aplicação e últimas páginas visitadas).

Fora do escopo da Fase 1 (backlog futuro):
- App nativo (loja).
- Avaliações/reviews de usuários (nota, comentário).
- Chat interno comprador–prestador.
- Pagamento online / assinatura paga para empresas.
- Multi-idioma.
- Notificações push.

---

## 3. Stack Tecnológica (decisão)

| Camada            | Escolha                                  | Motivo |
|--------------------|-------------------------------------------|--------|
| Frontend + PWA     | Next.js 14+ (App Router) + TypeScript + Tailwind CSS | SSR/SEO bom p/ catálogo público, suporte PWA maduro, um único deploy |
| Backend/API        | Next.js Route Handlers (`/api/v1/*`), organizados em camada de serviço isolada | Evita 2 repositórios na Fase 1; camada de serviço isolada permite extrair p/ backend próprio (NestJS/Fastify) depois sem reescrever regra de negócio |
| Banco de dados     | PostgreSQL rodando em Docker local (dev) | Simples, sem custo, sem depender de nuvem pra desenvolver |
| ORM                | Prisma | Migrations versionadas, type-safety, produtivo |
| Autenticação       | Auth.js (NextAuth) — só e-mail/senha (Credentials) | Simples pra fase 1, login social fica pro backlog |
| Armazenamento de mídia (fotos/logo/vídeo) | Disco local (`/public/uploads`) na Fase 1 | Zero configuração extra pra MVP; migrar pra S3/R2 é troca de 1 módulo depois, sem afetar o resto |
| Hospedagem app     | A definir no lançamento (Vercel é o padrão mais simples) | Deploy simples de Next.js, HTTPS automático (exigido p/ PWA) |
| Hospedagem banco   | Docker local em dev; em produção qualquer Postgres gerenciado (Neon/Railway/VPS) | Mesma imagem, troca só a `DATABASE_URL` |
| Mapa/localização   | Google Maps ou OpenStreetMap (Leaflet) | Exibir endereço/localização da empresa |

Simplificação adotada: nada de infraestrutura em nuvem obrigatória pra rodar em dev.
`docker-compose.yml` na raiz sobe o Postgres com um comando. Storage de mídia em disco
local evita configurar bucket/S3 antes de precisar.

---

## 4. Papéis de Usuário (roles)

1. **Visitante** — navega, busca, vê detalhes. Sem login.
2. **Usuário comum** — pode favoritar, avaliar no futuro. Login simples.
3. **Empresa/Profissional** — dono de um cadastro. Pode editar seu próprio cadastro,
   ver estatísticas básicas (views), enviar novo cadastro para aprovação.
4. **Admin** — aprova/reprova cadastros, gerencia categorias, edita/remove qualquer
   cadastro, gerencia usuários, gerencia cidades (para expansão).

---

## 5. Estrutura de Categorias (dado inicial, seed no banco)

- **Turismo**: Cachoeiras, Trilhas, Balneários, Pesca, Camping, Guias
- **Comércio**: Supermercados, Farmácias, Padarias, Lojas
- **Serviços**: Eletricista, Encanador, Pintor, Pedreiro, Soldador
- **Saúde**: Clínicas, Médicos, Dentistas, Psicólogos, Veterinários
- **Educação**: Escolas, Cursos, IFPA, SENAI, SENAC
- **Gastronomia**: Restaurantes, Hamburguerias, Cafeterias, Sorveterias
- **Agro**: Queijos, Mel, Hortaliças, Agricultura familiar
- **Indústria**: Prestadores, Metalurgia, Construção

Modelagem: tabela `Category` (categoria-pai) + `Subcategory` (filha), ambas editáveis
pelo admin sem precisar alterar código — permite adicionar categoria nova sem deploy.

---

## 6. Cadastro de Empresa — Campos

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Nome | texto | sim | |
| Categoria/Subcategoria | seleção | sim | |
| Descrição | texto longo | sim | |
| Telefone | texto | não | |
| WhatsApp | texto | não | formato E.164 p/ link `wa.me` |
| Instagram | texto (usuário/link) | não | |
| Facebook | texto (link) | não | |
| Site | url | não | |
| E-mail | e-mail | não | |
| Endereço | texto | sim | rua, número, bairro |
| Localização | lat/lng | sim | via mapa (clique) ou geocoding do endereço |
| Horário de funcionamento | texto livre | não | ex.: "Seg a Sex 8h-18h, Sáb 8h-12h" — simples, sem grade por dia |
| Fotos | upload múltiplo | não | limite ex.: 8 fotos |
| Logo | upload único | não | |
| Vídeo | upload ou link (YouTube) | não | |
| Forma de pagamento | multi-seleção | não | PIX, Cartão, Dinheiro |
| Entrega | booleano | não | |
| Atendimento domiciliar | booleano | não | |
| Cidade | seleção | sim | permite expansão (Parauapebas, Canaã, Marabá...) |
| Status | enum | sistema | `pendente` \| `aprovado` \| `reprovado` — controlado pelo admin |

---

## 7. Cadastro de Profissional Autônomo — Campos

Campos informados pelo usuário:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Nome | texto | sim | |
| CPF | texto | sim | **não público** — armazenado, nunca exibido/exposto via API pública |
| Data de nascimento | data | sim | usado p/ validar maioridade; não exibido publicamente |
| WhatsApp | texto | sim | principal canal de contato |

Campos adicionais assumidos por analogia ao cadastro de empresa (a confirmar com
você, mas necessários para o profissional aparecer no catálogo do mesmo jeito que
uma empresa):

| Campo | Tipo | Obrigatório |
|---|---|---|
| Categoria/Subcategoria (ex.: Encanador, Eletricista) | seleção | sim |
| Descrição / especialidade | texto | sim |
| Foto de perfil | upload | não |
| Cidade / bairro de atuação | seleção/texto | sim |
| E-mail | e-mail | não |
| Instagram/Facebook | texto | não |
| Status | enum (sistema) | pendente/aprovado/reprovado |

> Nota de privacidade: CPF e data de nascimento ficam no banco criptografados/
> restritos, visíveis só para o próprio profissional e para o admin (uso: validação
> de identidade, futura verificação/selo de "profissional verificado"). Nunca
> retornados pela API pública.

---

## 8. Fluxo de Aprovação

1. Empresa/Profissional preenche formulário público → registro criado com
   `status = pendente`.
2. Admin recebe o item na fila do painel administrativo.
3. Admin aprova (`status = aprovado`, passa a aparecer nas buscas) ou reprova
   (`status = reprovado`, com motivo opcional, autor pode reeditar e reenviar).
4. E-mail/WhatsApp de notificação ao autor sobre o resultado (fase 1: e-mail simples;
   WhatsApp automático fica pra depois, exige API paga tipo WhatsApp Business/Twilio).

---

## 9. Página Inicial (Landing Page)

Home = LP simples e direta, foco 100% local (Parauapebas), sem enrolação institucional.

Estrutura de cima pra baixo:
1. **Hero curto**: nome "Busca Pebas" + frase única (ex.: "Encontre serviços,
   comércio e turismo em Parauapebas") + campo de busca já visível sem rolar a página.
2. **Campo de busca em destaque**: placeholder "O que você procura?" com sugestões
   (encanador, restaurante, cachoeira, guia turístico, hotel, mecânico, artesanato,
   psicólogo, ...). Busca casa contra nome, categoria, subcategoria e descrição
   (full-text Postgres `tsvector`).
3. **Grade de categorias** logo abaixo — ícone + nome, leva pra listagem filtrada.
4. **Cards de destaque** (opcional, alguns cadastros aprovados em grade de exemplo) —
   mostra que o catálogo já tem conteúdo.
5. **CTA final**: "Tem um negócio em Parauapebas? Cadastre grátis" → leva pro
   formulário de cadastro.

Sem seções extras (sem "sobre nós" longo, sem depoimento, sem newsletter). Uma tela,
direto ao ponto, mobile-first.

## 9.1 Card de empresa/profissional (resultado de busca)

Informação mínima pra decisão rápida, sem precisar entrar no detalhe:
- Foto/logo, nome, categoria/subcategoria
- Bairro/endereço curto
- Selo se aceita PIX/entrega/atendimento domiciliar (ícones pequenos)
- Botão direto "Chamar no WhatsApp" e "Ligar" (click-to-call)
- Clique no card abre página de detalhe com descrição completa, fotos, mapa, horário.

---

## 10. Arquitetura da API (preparada para expansão)

Base: `/api/v1/...`, JSON, autenticação via Bearer token (JWT) para rotas privadas.

Endpoints principais (rascunho — detalhado em `docs/API.md`):
- `GET /api/v1/categories`
- `GET /api/v1/listings?query=&category=&city=&lat=&lng=&radius=`
- `GET /api/v1/listings/:id`
- `POST /api/v1/listings` (auth, cria como pendente)
- `PUT /api/v1/listings/:id` (auth, dono ou admin)
- `POST /api/v1/professionals`
- `GET /api/v1/professionals/:id`
- `POST /api/v1/auth/register`, `/login`, `/logout`
- `GET /api/v1/admin/pending` (admin)
- `POST /api/v1/admin/listings/:id/approve` (admin)
- `POST /api/v1/admin/listings/:id/reject` (admin)
- `GET /api/v1/cities` (suporta expansão regional)

Cidade (`City`) é entidade própria desde o início — cadastro/busca já filtram por
cidade, então adicionar Canaã dos Carajás ou Marabá no futuro é só inserir linha na
tabela `City` e liberar cadastro lá, sem mudança de código.

---

## 11. PWA — Requisitos Técnicos

- `manifest.json`: nome, ícones (192/512px), `display: standalone`, cor de tema,
  `start_url`.
- Service worker (via `next-pwa` ou `@ducanh2912/next-pwa`): cache do app shell,
  estratégia "network first" para dados de busca, "cache first" para assets estáticos.
- HTTPS obrigatório (Vercel já fornece).
- Ícone/splash para iOS via meta tags `apple-touch-icon` (iOS não segue manifest 100%).
- Teste de instalabilidade: Lighthouse PWA audit ≥ 90.

---

## 12. Modelo de Dados

Ver `docs/MODELO_DADOS.md` e `prisma/schema.prisma` para o schema completo.

Entidades principais: `User`, `City`, `Category`, `Subcategory`, `Listing` (empresa),
`Professional`, `Media`, `PaymentMethod` (enum), `OpeningHours`.

---

## 13. Critérios de Aceite da Fase 1

- [ ] Usuário visitante consegue buscar e encontrar um negócio/profissional por texto.
- [ ] Usuário visitante consegue navegar por categoria → subcategoria → listagem.
- [ ] Empresa consegue se cadastrar sem precisar de admin durante o preenchimento.
- [ ] Profissional autônomo consegue se cadastrar.
- [ ] Cadastro só aparece publicamente após aprovação do admin.
- [ ] Admin consegue aprovar/reprovar/editar/excluir pelo painel.
- [ ] App é instalável no Android (Chrome), iPhone (Safari "Adicionar à Tela de Início")
      e desktop (Chrome/Edge).
- [ ] Lighthouse PWA score ≥ 90.
- [ ] API responde JSON versionado, sem dado sensível de profissional (CPF/nascimento)
      exposto.

---

## 14. Pontos em Aberto (decidir com você)

1. Provedor de hospedagem definitivo pro lançamento (afeta só a Etapa 10, não bloqueia dev).
2. Confirmar campos extras assumidos no cadastro de profissional autônomo (seção 7).

Resolvido: nome = "Busca Pebas"; login = e-mail/senha; banco = Postgres via Docker
local; mídia = disco local na Fase 1; hospedagem = livre (rodar onde quiser, sem
lock-in); campos do profissional autônomo confirmados (seção 7) — fotos de
trabalhos realizados fica fora da v1, backlog.
