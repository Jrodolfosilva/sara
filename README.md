# Busca Pebas — PWA

Catálogo local de serviços, turismo, comércio, cultura e profissionais de
Parauapebas (PA). Busca + cards com informação básica pra cliente contatar direto.
Expansão planejada para Canaã dos Carajás, Marabá e região de Carajás.

## Documentação

Leia nesta ordem:

1. [`docs/SDD.md`](docs/SDD.md) — documento de design completo: visão, stack, papéis,
   campos de cadastro, fluxo de aprovação, LP, critérios de aceite, pontos em aberto.
2. [`docs/MODELO_DADOS.md`](docs/MODELO_DADOS.md) — entidades e regras de dados.
3. [`docs/API.md`](docs/API.md) — contrato de endpoints `/api/v1`.
4. [`docs/ROADMAP.md`](docs/ROADMAP.md) — visão geral por etapa.
5. [`docs/TASKS.md`](docs/TASKS.md) — checklist prático, marca conforme avança.

## Rodar banco local

```
docker compose up -d
cp .env.example .env
```

Sobe Postgres em `localhost:5432` (usuário/senha/banco: `buscapebas`).

## Schema de banco pronto

`prisma/schema.prisma` — City, Category, Subcategory, User, Listing, Professional, Media.

`prisma/seed.ts` — popula categorias/subcategorias do documento + cidades
(Parauapebas ativa, Canaã dos Carajás e Marabá pré-cadastradas e desativadas).

## Próximo passo

Ainda não há código de aplicação — só design, schema e banco local prontos.
Seguir `docs/TASKS.md` a partir da Etapa 1 (`npx create-next-app`, configurar Prisma).
