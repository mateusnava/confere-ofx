# Confere OFX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lançar o Confere OFX: Next.js que converte extrato bancário BR (PDF/foto) em OFX/Excel/CSV, só libera OFX se o saldo fechar, com Pix avulso e planos Pro/Escritório.

**Architecture:** Vercel Node (não Edge). Upload no Vercel Blob (TTL 60s) por causa do limite de 4,5 MB. Parsers ouro na function; scan no Gemini Flash com tool de soma. Neon guarda sessão/cota/usuário, nunca o PDF. Mercado Pago no Pix.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind, Vitest, Drizzle + `pg` + `attachDatabasePool`, Neon, Vercel Blob, Mercado Pago, `@google/genai`, `unpdf`, `exceljs`, Resend.

## Global Constraints

- Nome Confere OFX. Frase: "PDF vira OFX. Só sai se o saldo fechar." Landing `/pdf-para-ofx`. Teal `#0F6B5C`. PT-BR.
- Sem PDF no Neon. Blob some em 60s. OFX só se `checkBalance(s).ok`.
- Grátis: 1 nativo/IP/dia. Avulso R$4,90 nativo / R$9,90 scan. Pro R$19,90 (1000 pág + 15 scans). Escritório R$69 (8000 + 40).
- Max 20 MB / 50 páginas. Senha: pedir, não quebrar. LLM só scan/other/parser falho. Aritmética só `sumCents`/`checkBalance`.
- Parsers ouro: Nubank, Inter, Itaú, Bradesco, BB, Santander, C6, Caixa (conta) + fatura Nubank e Inter.
- runtime nodejs, maxDuration 60 no convert. DATABASE_URL pooled; UNPOOLED nas migrations.


## File structure

- src/app/pdf-para-ofx/page.tsx landing SEO
- src/app/api/blob/route.ts upload
- src/app/api/convert/route.ts pipeline
- src/app/api/export/route.ts
- src/app/api/pay/pix/route.ts e webhook
- src/app/api/auth/magic/route.ts
- src/app/api/cron/purge-blobs/route.ts
- src/lib/statement.ts balance.ts quota.ts mp.ts convert.ts
- src/lib/pdf/extract.ts classify.ts
- src/lib/parsers um arquivo por banco
- src/lib/llm/scan.ts
- src/lib/export ofx excel csv
- src/lib/db schema client
- src/components Dropzone Preview PayWall
- tests e tests/fixtures/text

---

### Task 1: Scaffold

- [ ] create-next-app with typescript tailwind app src-dir
- [ ] install drizzle pg exceljs unpdf google genai resend vercel blob functions mercadopago vitest
- [ ] drizzle schema: users sessions daily_free monthly_usage payments
- [ ] tsc and vitest. commit scaffold

### Task 2: Saldo

Files: src/lib/statement.ts src/lib/balance.ts tests/balance.test.ts
Produces: sumCents, checkBalance

- [ ] write tests: soma 5000-3000+100=2100; abertura 10000 + 2000 = 12000 fecha; delta 2 nao fecha; tolerancia 1 centavo fecha; sem saldos => nao ok
- [ ] vitest fail
- [ ] implement reduce in cents, ok if abs(delta)<=1
- [ ] vitest pass. commit feat: conferencia de saldo

### Task 3: PDF extract + classify

Files: src/lib/pdf/extract.ts classify.ts tests/classify.test.ts
Produces: ExtractedPdf {pages: {pageIndex,text,hasTextLayer}[]}; classify => {native, bank}

- [ ] tests: texto Nu Pagamentos => nativo nubank; texto vazio => scan other; Itaú Unibanco => itau
- [ ] extractPdf(buf, password?) via unpdf extractText. page text < 20 chars => hasTextLayer false. throw PASSWORD_REQUIRED. reject >50 pages or >20MB
- [ ] bank keywords: nubank, inter, itau, bradesco, banco do brasil, santander, c6 bank, caixa economica
- [ ] commit feat: extracao e classificacao de PDF

### Task 4: Parser Nubank conta

Files: src/lib/parsers/types.ts nubank-conta.ts registry.ts tests/parsers/nubank-conta.test.ts tests/fixtures/text/nubank-conta.txt
Produces: Parser {id, kind, detect, parse}; runParsers(extracted): Statement | null

- [ ] fixture sintetico: Nu Pagamentos, saldo inicial 100, Pix +50, Boleto -30, saldo final 120
- [ ] test: 2 txs, cents 5000 e -3000, checkBalance.ok true
- [ ] parse DD MMM, R$ virgula, + credito - debito
- [ ] commit feat: parser ouro Nubank conta

### Task 5: Inter conta + faturas Nubank e Inter

- [ ] tres fixtures + tres testes checkBalance.ok e kind correto
- [ ] fatura: opening = fatura anterior, closing = atual
- [ ] registrar em PARSERS. commit feat: parsers Inter e faturas

### Task 6: Itaú Bradesco BB Santander C6 Caixa

Cada banco: fixture 2 lancamentos que fecham, teste verde, arquivo proprio, registro.
- [ ] Itau + Bradesco. commit
- [ ] BB + Santander. commit
- [ ] C6 + Caixa. commit
Nao lancar banco sem teste verde.

### Task 7: convert pipeline + Gemini fallback

Files: src/lib/convert.ts src/lib/llm/scan.ts tests/convert.test.ts
Produces: convertExtracted(extracted) => {statement, balance}

Fluxo: classify. se native e runParsers fecha => parser. senao scanWithLlm.
Gemini Flash. tool check_balance no servidor chama sumCents+checkBalance de verdade. max 2 tentativas. se nao ok, devolve statement (export bloqueia OFX).

- [ ] test parser path: llm nao chamado
- [ ] test fallback: native other, spy llm
- [ ] mock GEMINI. commit feat: pipeline convert com fallback Gemini

### Task 8: Export OFX Excel CSV

Files: src/lib/export/ofx.ts excel.ts csv.ts tests/export.test.ts
Produces: toOfx(s) string|null (null se !ok); toCsv sempre; toXlsx Buffer com aba aviso se !ok

OFX 1.0.2 BANKTRANLIST TRNAMT ponto decimal. FITID = date|description|amountCents|index

- [ ] test OFX tem TRNAMT 50.00; toOfx null se saldo nao fecha; CSV header data,descricao,valor_centavos
- [ ] commit feat: export OFX Excel CSV

### Task 9: Blob upload + convert route + purge 60s

- [ ] POST /api/blob handleUpload vercel blob, pdf jpeg png, max 20MB
- [ ] POST /api/convert {blobUrl, password?} baixa, extract, convert, grava session expiresAt now+60s, APAGA o blob, devolve {sessionId, statement, balance} sem PDF
- [ ] GET /api/export?sessionId&format= le JSON da sessao
- [ ] GET /api/cron/purge-blobs Bearer CRON_SECRET
- [ ] runtime nodejs maxDuration 60. IP = x-forwarded-for. vercel.json cron * * * * *
- [ ] commit feat: convert via Blob e sessao 60s

### Task 10: Cota e paywall

- anonimo nativo: 1 por dia America/Sao_Paulo senao 490 centavos
- anonimo scan: nunca gratis, 990
- pro 1000 paginas + 15 scans; escritorio 8000 + 40
- scan so depois do pagamento
- commit feat: cota e paywall

### Task 11: UI landing

- pagina pdf-para-ofx com dropzone e preview
- commit feat: landing

### Task 12: Pagamentos

- Pix avulso 4,90 ou 9,90 na sessao
- webhook marca pago
- plano mensal por email
- commit feat: pagamentos

### Task 13: Deploy

- migrate Neon, env Vercel, cron de limpeza
- smoke Nubank, segundo arquivo, scan, TTL 60s
- commit chore: deploy

## Done quando

- 8 extratos ouro + 2 faturas fecham saldo
- primeiro nativo anonimo baixa OFX se fechar
- Pix libera scan e extra
- PDF some em 60s
- saldo errado nao gera OFX
