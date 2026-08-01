# Pendências — Busca Pebas

Atualizado em 2026-08-01. Lista do que falta configurar ou implementar, sem entrar em detalhe de código (isso está nos commits/PRs).

## 1. Stripe (pagamento) — bloqueado, precisa de ação manual

Código já pronto (checkout, webhook, portal de cobrança, gate de visibilidade por assinatura). Falta só configurar a conta:

- [ ] Ativar conta Stripe em modo produção (dados da empresa, banco pra recebimento)
- [ ] Pegar `STRIPE_SECRET_KEY` (modo live) e colar no `.env` de produção
- [ ] Criar webhook endpoint no dashboard Stripe apontando pra `https://SEUDOMINIO/api/v1/subscription/webhook`, eventos: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` — pegar `STRIPE_WEBHOOK_SECRET`
- [ ] Ativar Customer Portal no dashboard Stripe (Settings → Billing → Customer portal)
- [ ] Confirmar `NEXTAUTH_URL` aponta pro domínio público real (hoje pode estar como localhost)

**Enquanto isso não é feito:** todo mundo aparece no site normal — o gate de visibilidade por assinatura (>40 dias + aprovado exige assinatura ativa) só liga sozinho quando `STRIPE_SECRET_KEY` estiver preenchida.

**Pagamentos extras** (Apple Pay, Google Pay, Pix, boleto) — Stripe já suporta, mas precisa configurar métodos de pagamento habilitados no dashboard depois que a conta estiver ativa. Não é trabalho de código adicional na maior parte dos casos.

## 2. LGPD — Termos de Uso / Política de Privacidade

O app guarda CPF (criptografado), email, WhatsApp, dados de assinatura. Não existem páginas de Termos de Uso nem Política de Privacidade ainda. Precisa de conteúdo jurídico (não é algo que eu deveria redigir sozinho sem revisão) — depois de ter o texto, é rápido criar as páginas e linkar no cadastro/footer.

## 3. Paginação da busca — backend pronto, frontend não conectado

`/api/v1/listings` e `/api/v1/professionals` já suportam `page`/`pageSize`. A tela `/busca` nunca manda esses parâmetros nem tem botão "próxima página" — fica sempre na primeira leva de resultados. Precisa de UI (paginação ou scroll infinito).

## 4. Bug de escopo incerto

"Quando já existe cadastro, redireciona pra login em vez de manter fluxo" — reportado anteriormente, mas o escopo exato nunca foi confirmado com o usuário. Suspeita é que era o dev server travando (resolvido). Confirmar se ainda reproduz antes de investigar mais.

## 5. Nice-to-have, sem urgência

- CI/CD (nenhum configurado — sem testes automatizados rodando em PR)
- CRUD de categorias/subcategorias/cidades pelo painel admin (hoje é só via `prisma/seed.ts`, editar e rodar de novo)
- Ativar cidades Canaã dos Carajás / Marabá quando fizer sentido (`City.ativa = true`, já tem slug pronto)

## Serviços externos já configurados e funcionando

- Brevo (email transacional) — domínio verificado, testado
- Evolution API / Wativo (validação de WhatsApp) — instância "sara" ativa
- MinIO (Easypanel) — storage de uploads (fotos/logos/vídeos), bucket `sara`
- Google OAuth (login social) — client id/secret configurados
- OpenCNPJ (autocomplete de CNPJ no cadastro) — sem chave, gratuito
