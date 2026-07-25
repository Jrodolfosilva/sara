# API — `/api/v1`

Formato: JSON. Auth: `Authorization: Bearer <jwt>` nas rotas privadas.
Todas as respostas de listagem paginadas: `?page=1&pageSize=20`.

## Público

### `GET /api/v1/cities`
Lista cidades com `ativa = true`.

### `GET /api/v1/categories`
Lista categorias com subcategorias aninhadas.

### `GET /api/v1/listings`
Query params: `query`, `categorySlug`, `subcategorySlug`, `citySlug`, `lat`, `lng`, `radiusKm`.
Retorna só `status = APROVADO`. Nunca inclui dados privados.

### `GET /api/v1/listings/:id`
Detalhe de um cadastro aprovado.

### `GET /api/v1/professionals`
Mesma lógica de `listings`, mas nunca retorna `cpfCriptografado` nem `dataNascimento`.

### `GET /api/v1/professionals/:id`
Idem — resposta pública nunca contém CPF/nascimento.

---

## Autenticação

### `POST /api/v1/auth/register`
Body: `{ nome, email, senha }` → cria `User` com role `USER`.

### `POST /api/v1/auth/login`
Body: `{ email, senha }` → retorna JWT.

### `POST /api/v1/auth/logout`
Invalida sessão/token.

---

## Autenticado (role OWNER ou dono do recurso)

### `POST /api/v1/listings`
Cria cadastro de empresa com `status = PENDENTE`. Usuário vira `OWNER` automaticamente.

### `PUT /api/v1/listings/:id`
Só o dono ou admin. Qualquer edição de campo sensível reseta `status` para `PENDENTE`
(reaprovação obrigatória).

### `DELETE /api/v1/listings/:id`
Dono ou admin.

### `POST /api/v1/professionals`
Cria cadastro de profissional, `status = PENDENTE`.

### `GET /api/v1/professionals/me`
Retorna o próprio cadastro do profissional autenticado, incluindo CPF/nascimento
(só pra ele mesmo).

### `PUT /api/v1/professionals/:id`
Dono ou admin.

### `POST /api/v1/media/upload`
Upload de foto/logo/vídeo (gera URL pré-assinada S3/R2, cliente faz upload direto).

---

## Admin (role ADMIN)

### `GET /api/v1/admin/pending`
Lista `Listing` e `Professional` com `status = PENDENTE`.

### `POST /api/v1/admin/listings/:id/approve`
### `POST /api/v1/admin/listings/:id/reject`
Body: `{ motivo }`.

### `POST /api/v1/admin/professionals/:id/approve`
### `POST /api/v1/admin/professionals/:id/reject`

### `GET|POST|PUT|DELETE /api/v1/admin/categories`
### `GET|POST|PUT|DELETE /api/v1/admin/subcategories`

### `GET|POST|PUT /api/v1/admin/cities`
Ativar/desativar cidade — mecanismo de expansão regional.

---

## Regras transversais
- Toda rota de escrita valida payload com Zod antes de tocar no banco.
- Rate limit básico em `/auth/*` e `/listings` (POST) pra evitar spam de cadastro.
- CORS: liberado só pro domínio oficial do PWA na Fase 1 (API não é pública p/ terceiros
  ainda — "preparada para expansão" significa versionada e desacoplada, não aberta).
