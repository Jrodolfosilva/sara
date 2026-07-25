# Roadmap de Implementação — Fase 1 (PWA)

Ordem pensada pra sempre ter algo rodando/testável no fim de cada etapa.

## Etapa 0 — Preparação (poucas horas)
1. Criar repositório git.
2. `docker compose up -d` → sobe Postgres local (arquivo `docker-compose.yml` já pronto).
3. Copiar `.env.example` pra `.env`.
4. (Só no lançamento, não bloqueia dev) definir domínio e hospedagem.

## Etapa 1 — Scaffold do projeto (0.5–1 dia)
1. `npx create-next-app@latest` (TypeScript, Tailwind, App Router).
2. Instalar Prisma, configurar `schema.prisma` (já entregue em `prisma/schema.prisma`).
3. `npx prisma migrate dev --name init`.
4. Configurar Auth.js (NextAuth) com provider Credentials (e-mail/senha).
5. Subir esqueleto no Vercel — confirmar deploy funcionando.

## Etapa 2 — Modelo de dados + seed (0.5 dia)
1. Rodar migration do schema completo.
2. Criar script de seed: categorias/subcategorias da seção 5 do SDD + cidade
   Parauapebas (`ativa=true`) + Canaã dos Carajás/Marabá (`ativa=false`).
3. Validar no Prisma Studio que os dados batem com o documento.

## Etapa 3 — API pública de leitura (1 dia)
1. `GET /api/v1/cities`
2. `GET /api/v1/categories`
3. `GET /api/v1/listings` (com busca full-text + filtros)
4. `GET /api/v1/listings/:id`
5. Testar tudo via Postman/Thunder Client antes de plugar frontend.

## Etapa 4 — Home + busca + listagem (1–2 dias)
1. Página inicial: campo de busca + grade de categorias (dados vindos da API real).
2. Página de resultados de busca (lista + filtro por categoria/cidade).
3. Página de detalhe do cadastro (fotos, contato, mapa, botão WhatsApp).
4. Responsivo mobile-first.

## Etapa 5 — Autenticação (0.5–1 dia)
1. Telas de login/cadastro de usuário.
2. Middleware de proteção de rota por role (`USER`, `OWNER`, `ADMIN`).

## Etapa 6 — Cadastro de empresa e profissional (1–2 dias)
1. Formulário multi-step de cadastro de empresa (campos da seção 6 do SDD).
2. Formulário de cadastro de profissional (seção 7), com CPF/nascimento em campos
   claramente marcados como privados.
3. Upload de mídia (fotos/logo/vídeo) via URL pré-assinada do storage.
4. Ao salvar, `status = PENDENTE`.

## Etapa 7 — Painel administrativo (1–2 dias)
1. Rota `/admin` protegida por role.
2. Fila de pendentes (empresas + profissionais).
3. Aprovar / reprovar (com motivo) / editar / excluir.
4. CRUD de categorias/subcategorias.
5. CRUD de cidades (liga/desliga expansão).

## Etapa 8 — PWA (0.5–1 dia)
1. `manifest.json` + ícones (192/512).
2. Service worker (`next-pwa`), estratégia de cache definida no SDD seção 11.
3. Meta tags iOS (`apple-touch-icon`, `apple-mobile-web-app-capable`).
4. Testar instalação real em: Android/Chrome, iPhone/Safari, desktop/Chrome.
5. Rodar Lighthouse, ajustar até PWA score ≥ 90.

## Etapa 9 — Polimento + QA (1 dia)
1. Revisar critérios de aceite (SDD seção 13) um a um.
2. Testar fluxo completo ponta a ponta: cadastro → aprovação → aparece na busca.
3. Checar que CPF/nascimento nunca vazam em nenhuma resposta pública (teste manual +
   automatizado).
4. Ajustar SEO básico (meta tags, sitemap, robots.txt) — importante pro catálogo ser
   achado no Google.

## Etapa 10 — Lançamento Parauapebas
1. Deploy produção, domínio final, banco de produção.
2. Cadastrar manualmente um lote inicial de negócios (curadoria) pra catálogo não
   nascer vazio.
3. Divulgação local.

## Fase 2 (depois do lançamento, backlog)
- Ativar cidades Canaã dos Carajás / Marabá (`City.ativa = true`) — sem mudança de código.
- Avaliações/reviews.
- Notificação via WhatsApp Business API.
- Selo "profissional verificado".
- App nativo (Expo/React Native) consumindo a mesma API `/api/v1`.

---

Estimativa total Fase 1: ~10–14 dias úteis de um dev full-stack trabalhando sozinho,
sem contar curadoria de conteúdo inicial e possíveis idas e voltas de design.
