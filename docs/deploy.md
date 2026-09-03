# Deploy - Confere OFX

## Neon

1. Crie um projeto Neon e copie `DATABASE_URL` (pooled) e `DATABASE_URL_UNPOOLED`.
2. Rode migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Vercel

Configure as variaveis em `.env.example`:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `BLOB_READ_WRITE_TOKEN`
- `GEMINI_API_KEY` — Google AI API key (Vercel AI SDK + `@ai-sdk/google`)
- `GEMINI_MODEL` — default `gemini-3.6-flash` (Interactions API via `@ai-sdk/google`)
- `MERCADOPAGO_ACCESS_TOKEN`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `CRON_SECRET`
- `APP_URL`

O cron em `vercel.json` executa `/api/cron/purge-blobs` a cada minuto.

## Smoke manual

1. Enviar fixture Nubank nativo e baixar OFX com saldo fechado.
2. Enviar segundo arquivo no mesmo IP e ver paywall de R$ 4,90.
3. Enviar imagem/foto e ver paywall de R$ 9,90 antes do scan.
4. Confirmar que blob some apos convert e sessao expira em 60s.
