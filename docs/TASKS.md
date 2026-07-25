# Tasks — Busca Pebas

Checklist de implementação. Marca `[x]` conforme for concluindo. Ordem importa.

## Etapa 0 — Preparação
- [x] `git init`
- [x] `docker compose up -d` (Postgres local)
- [x] copiar `.env.example` → `.env`

## Etapa 1 — Scaffold
- [x] `npx create-next-app@latest` (TypeScript + Tailwind + App Router)
- [x] instalar Prisma (v6.19.3, pinado — v7 quebra url no schema/driver adapters)
- [x] `npx prisma init` e apontar pro `schema.prisma` já pronto
- [x] instalar Auth.js (Credentials provider)

## Etapa 2 — Banco de dados
- [x] `npx prisma migrate dev --name init`
- [x] rodar `prisma/seed.ts` (categorias + cidades)
- [ ] conferir no Prisma Studio (`npx prisma studio`) — opcional, rodar quando quiser

## Etapa 3 — API pública (leitura)
- [x] `GET /api/v1/cities`
- [x] `GET /api/v1/categories`
- [x] `GET /api/v1/listings` (busca + filtros: query, categoryId, subcategoryId, cityId)
- [x] `GET /api/v1/listings/:id`
- [x] `GET /api/v1/professionals` (nunca expõe CPF/nascimento)
- [x] `GET /api/v1/professionals/:id`

## Etapa 4 — Landing Page / Home
- [x] hero + campo de busca visível sem rolar
- [x] grade de categorias
- [x] cards de resultado (foto, nome, categoria, bairro, botão WhatsApp)
- [x] página de detalhe (fotos, descrição, horário, contato) — mapa fica pro backlog
- [x] CTA "cadastre seu negócio grátis"
- [x] mobile-first (Tailwind responsivo; testar visual no navegador ainda pendente)

## Etapa 5 — Login
- [x] tela de cadastro (nome, e-mail, senha) — `/registro`
- [x] tela de login (e-mail, senha) — `/login`
- [x] proteção de rota por role (middleware: `/admin` exige ADMIN, `/cadastro` exige login)

## Etapa 6 — Cadastro de empresa e profissional
- [x] formulário empresa (campos da seção 6 do SDD)
- [x] formulário profissional autônomo (campos da seção 7 — CPF/nascimento marcados
      privados, sem upload de fotos de trabalho na v1; CPF criptografado AES-256-GCM +
      hash separado só p/ checar duplicidade)
- [x] upload de fotos/logo (empresa) e foto de perfil (profissional) pra `/public/uploads`
      (vídeo por link fica pro backlog, upload de vídeo pesado não é v1)
- [x] salvar sempre com `status = PENDENTE`, testado ponta a ponta (login → cadastro →
      não aparece na busca pública)

## Etapa 7 — Painel admin
- [x] rota `/admin` protegida (role ADMIN)
- [x] fila de pendentes (empresa + profissional)
- [x] aprovar / reprovar (com motivo) / excluir — testado ponta a ponta
- [x] promover 1º admin: `npm run make-admin -- email@exemplo.com`
- [ ] editar cadastro pelo painel — **simplificado pra fora da v1**: por ora,
      reprovar com motivo + pedir reenvio resolve o caso comum
- [ ] CRUD categorias/subcategorias/cidades pelo painel — **simplificado pra fora
      da v1**: taxonomia é gerenciada por código (`prisma/seed.ts`), edita e roda
      seed de novo. Ativar Canaã/Marabá = mudar `ativa` no seed.

## Etapa 8 — PWA
- [x] `manifest.json` + ícones 192/512 (placeholders sólidos gerados por script —
      trocar por logo real antes do lançamento: `node scripts/generate-icons.js`)
- [x] service worker próprio em `public/sw.js` (sem `next-pwa` — Turbopack/Next 16
      não tem plugin webpack estável ainda; SW à mão é simples e sem dependência
      extra: network-first p/ API, cache-first p/ resto)
- [x] meta tags iOS (`apple-touch-icon`)
- [ ] testar instalação real: Android, iPhone, desktop — precisa rodar `npm run build && npm start`
      em HTTPS ou `localhost` e testar no navegador de verdade (não dá pra automatizar por aqui)
- [ ] Lighthouse PWA score ≥ 90 — rodar no Chrome DevTools depois do teste acima

## Etapa 9 — QA final
- [x] fluxo completo: cadastro → aprovação → aparece na busca (testado via API, empresa
      e profissional)
- [x] confirmar CPF/nascimento nunca aparece em resposta pública (testado, também
      bloqueia CPF duplicado)
- [x] SEO básico (title, meta description, `robots.txt`, `sitemap.xml` dinâmico)
- [x] `npm run build` e `npm run lint` limpos
- [x] teste visual no navegador: home, busca, login, painel admin, cadastro de
      empresa (preenchido e enviado de verdade), aprovação e card/detalhe — tudo
      testado ponta a ponta com Chrome real, sem erro no console

## Etapa 10 — Lançamento
- [ ] escolher hospedagem (app + banco produção)
- [ ] deploy produção + domínio
- [ ] cadastrar lote inicial de negócios (curadoria manual)
- [ ] divulgar local
