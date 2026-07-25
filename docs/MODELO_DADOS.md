# Modelo de Dados

Diagrama textual (entidade → campos → relações). Schema executável em `prisma/schema.prisma`.

## City
- id, nome, uf, ativa (bool) — controla quais cidades já aceitam cadastro/aparecem
  na busca. Seed inicial: Parauapebas (ativa=true), Canaã dos Carajás e Marabá
  (ativa=false, prontas pra ligar depois).

## Category
- id, nome, slug, ícone
- relação 1:N com Subcategory

## Subcategory
- id, categoryId (FK), nome, slug

## User
- id, nome, e-mail, senha (hash), role (enum: `USER`, `OWNER`, `ADMIN`), criado_em
- OWNER = dono de Listing e/ou Professional

## Listing (empresa/comércio/turismo/etc.)
- id, ownerId (FK User), cityId (FK), categoryId (FK), subcategoryId (FK)
- nome, descricao, telefone, whatsapp, instagram, facebook, site, email
- endereco, lat, lng, horario (texto livre, ex.: "Seg a Sex 8h-18h")
- aceitaPix (bool), aceitaCartao (bool), entrega (bool), atendimentoDomiciliar (bool)
- status (enum: PENDENTE, APROVADO, REPROVADO), motivoReprovacao (texto, opcional)
- criado_em, atualizado_em
- relações: Media (1:N)

## Professional (profissional autônomo)
- id, ownerId (FK User), cityId (FK), categoryId (FK), subcategoryId (FK)
- nome, cpf (criptografado/hash reversível apenas p/ admin — NUNCA no retorno de API pública)
- dataNascimento (privado, mesma regra do CPF)
- whatsapp, email, instagram, facebook, descricao, bairroAtuacao
- status (enum: PENDENTE, APROVADO, REPROVADO)
- criado_em, atualizado_em
- relações: Media (1:N)

## Media
- id, listingId (FK, nullable), professionalId (FK, nullable), tipo (enum: FOTO, LOGO, VIDEO)
- url (aponta pra `/uploads/...` em disco local na Fase 1; trocar por S3/R2 é só
  mudar de onde vem essa URL, sem mudar o modelo), ordem

## OpeningHours
- id, listingId (FK), diaSemana (0-6), abre (hora), fecha (hora), fechado (bool)

---

## Regras importantes
1. CPF e data de nascimento nunca trafegam em endpoint público — só em
   `/api/v1/professionals/me` (o próprio dono autenticado) e rotas `/admin`.
2. Todo `Listing`/`Professional` novo nasce `PENDENTE` — nunca aparece em busca
   pública até `APROVADO`.
3. `City.ativa = false` bloqueia a cidade de aparecer no seletor de busca/cadastro,
   mas os dados já podem existir no banco — permite pré-cadastrar antes do lançamento
   oficial em Canaã dos Carajás/Marabá.
4. Busca full-text usa `nome + descricao + categoria.nome + subcategoria.nome`
   (Postgres `tsvector`, idioma `portuguese`).
