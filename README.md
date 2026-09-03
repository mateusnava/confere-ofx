# Confere OFX

PDF vira OFX. So sai se o saldo fechar.

## Desenvolvimento

```bash
npm install
npm run db:up          # Postgres local na porta 41783
npm run db:migrate     # aplica migrations
npm run dev
npm run test
npm run typecheck
```

### Postgres local (Docker)

```bash
npm run db:up      # sobe postgres em localhost:41783
npm run db:down    # para o container
npm run db:reset   # apaga volume e recria
```

Credenciais: `confere` / `confere`, database `confere_ofx`.

Em local, **nao precisa** de `BLOB_READ_WRITE_TOKEN`: o upload vai para memoria e expira em 60s. Na Vercel, configure o token para usar Vercel Blob.

**Modelo:** 1 conversao gratis na conta. Depois, creditos via Pix (1 · R$ 4,90 / 10 · R$ 39,90 / 50 · R$ 149).

Landing: `/pdf-para-ofx`

## Stack

Next.js App Router, Drizzle + Neon, Vercel Blob, Vercel AI SDK + Gemini Flash, Mercado Pago Pix, Resend.
