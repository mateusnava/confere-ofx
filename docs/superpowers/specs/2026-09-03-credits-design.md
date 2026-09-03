# Confere OFX — créditos no lugar de assinatura

Data: 2026-09-03  
Status: aprovado em conversa; aguardando revisão do arquivo

## Problema

O produto cobra compromisso mensal (Pro / Escritório) de quem usa extrato de forma irregular — fim de mês, declaração, pedido do contador. A assinatura aumenta fricção e cancelamento. O paywall atual ainda fala em plano mensal e, no código, “ativa” plano via magic link, sem cobrança real.

## Decisão

Pré-pago por créditos. Sem assinatura, sem vencimento, sem menção a IP ou páginas na interface.

- 1 conversão = 1 crédito (qualquer arquivo: nativo ou scan)
- 1 conversão grátis por conta, uma vez na vida (exige login)
- Pacotes: 1 · R$ 4,90 / 10 · R$ 39,90 / 50 · R$ 149
- Pagamento: só Pix (Mercado Pago)
- Crédito some só quando o preview nasce com extrato lido
- Mesmo modelo para pessoa física e escritório; o volume entra no tamanho do pacote

## Fora de escopo

- Cartão, assinatura, recarga automática
- Crédito que vence
- Reembolso automático de dinheiro
- Segurar o PDF na fila enquanto o Pix não confirma
- Preço diferente para scan vs PDF nativo
- Cobrar por página
- Migrar ou apagar de imediato as colunas/tabelas mortas (`plan`, `monthly_usage`, `daily_free`) — param de ser lidas na cota; limpeza é follow-up

## Arquitetura

Saldo simples na conta. Pix soma. Preview bem-sucedido subtrai 1.

Toda decisão de cota e de débito roda no servidor. O cliente só envia o arquivo ou pede um Pix.

### Dados

- `users.credits` — inteiro, padrão 0, não negativo
- `users.free_conversion_used` — boolean, padrão false
- `payments` — já existe; cada compra é um Pix de pacote (`pack_1` | `pack_10` | `pack_50`), `amount_cents` 490 / 3990 / 14900, `status` pending → paid | failed, `mercado_pago_id` único para idempotência
- `sessions.credit_source` — `free` | `credit` na sessão persistida com preview; marca o que aquela conversão gastou

`users.plan` deixa de entrar na cota. `monthly_usage` e `daily_free` deixam de ser consultados ou gravados neste fluxo.

### Cota (uma regra)

1. Sem sessão de usuário → não converte (401).
2. Se `free_conversion_used` é false → pode converter (ainda não marca).
3. Senão, se `credits >= 1` → pode converter (ainda não desconta).
4. Senão → `credits_required`.

Se o user tem grátis intacta e também créditos, consome a grátis primeiro.

### Débito atômico

O desconto e o insert da sessão de preview rodam na mesma transação, e só se o extrato foi lido.

Ordem dentro da transação:

1. Tentar marcar a grátis: `UPDATE users SET free_conversion_used = true WHERE id = ? AND free_conversion_used = false`
2. Se 0 linhas, tentar o crédito: `UPDATE users SET credits = credits - 1 WHERE id = ? AND credits >= 1`
3. Se 0 linhas de novo → rollback, HTTP 402 `credits_required` (corrida entre duas abas). Sem sessão persistida.
4. Se um dos updates pegou linha → insert da sessão com `credit_source` `free` ou `credit` e commit.

Assim, duas abas com grátis intacta: uma usa a grátis; a outra usa 1 crédito se houver, ou vê o wall. Duas abas com 1 crédito e grátis já usada: uma converte, a outra vê o wall.

Falha de leitura (senha, arquivo inválido, ilegível, erro interno) não abre essa transação: não marca grátis e não subtrai crédito.

### Compra (Pix)

1. User logado escolhe pacote → servidor cria `payments` pending com `kind` e `amount_cents` do catálogo (nunca do body solto) e gera o Pix no Mercado Pago.
2. UI mostra QR + copia-e-cola e faz poll leve do status. “Já paguei” só busca status; não credita no cliente.
3. Webhook `paid` + `mercado_pago_id` ainda não creditado → `credits += N` do `kind` gravado e `status = paid`.
4. O mesmo `mercado_pago_id` de novo não soma de novo.
5. Expirou ou falhou → `failed`. Saldo intacto. User gera outro Pix.

## Telas

Nenhuma copy fala em plano, assinatura, IP ou páginas/mês.

**Header.** Logado: “N créditos” + “Comprar créditos” (leva a `/comprar`). Deslogado: “Entrar”.

**Landing `/`.** Grade de 3 pacotes no lugar de Pro/Escritório. Grátis: “1 conversão grátis na sua conta”.

**`/pdf-para-ofx`.** Deslogado que tenta enviar → login/cadastro, arquivo não processa. Logado com grátis ou crédito → dropzone atual. Logado sem os dois → `CreditWall` (substitui `SubscribeWall`): 3 pacotes, Pix, “depois de pagar, envie o PDF de novo”.

**`/comprar`.** Mesmo seletor (`CreditPacks`) + QR. `/perfil` mostra saldo, se a grátis já foi usada, e um histórico curto de Pix (pago / pendente); também embute `CreditPacks`.

**Pix.** QR até o webhook confirmar. Confirmou → saldo atualiza, QR some. Caducou → tenta de novo.

Copy do wall: “Você já usou a conversão grátis. Compre créditos para continuar.”

## Fluxos

### Converter

1. `POST /api/convert` exige user.
2. Avalia cota. Sem saldo → `{ error: "credits_required" }` com HTTP 402.
3. Pipeline atual (blob, parse/LLM, conferência de saldo).
4. Falha → erro, sem débito.
5. Preview ok → débito atômico + `sessions.credit_source`.
6. Export OFX/Excel/CSV daquela sessão: 0 créditos. Recarregar e baixar de novo: 0. Enviar o mesmo PDF outra vez: conversão nova, cobra de novo.

Saldo do extrato que não fecha: preview sai com o aviso de hoje; **já cobrou**, porque o extrato foi lido. OFX continua exigindo o “entendi”.

Sessão de preview expirada: não baixa; converter de novo cobra de novo. Perfil pode ter uma linha: “Se a página expirar, envie o PDF outra vez.”

### Comprar sem estar convertendo

Header ou landing → `/comprar` → Pix → saldo sobe → user volta e solta o PDF.

Não guardar o arquivo enquanto o Pix não cai (blob some em ~60s).

## Erros

| Situação | Comportamento |
| --- | --- |
| Sem login | 401; UI manda entrar. Arquivo não sobe. |
| Sem grátis e sem crédito | 402 `credits_required`; CreditWall. |
| PDF com senha | Pede senha. Não cobrou. |
| Não é extrato / grande demais / leitura quebra | “Não conseguimos ler este extrato. Nada foi cobrado. Tente outro arquivo.” |
| Extrato lido, saldo não fecha | Preview + aviso. Cobrou. |
| Duas abas, 1 crédito | Uma converte; a outra vê o wall. |
| QR sem pagamento | Pending; saldo intacto. |
| Webhook atrasado | Poll continua. |
| Webhook duplicado | Ignora. |
| Pacote trocado no client | Credita o `kind` do `payment` criado no servidor. |
| Dinheiro pago e crédito não caiu | Fonte da verdade: `payments.mercado_pago_id` + status. Ajuste manual, não saldo inventado. |

Crédito não vence. Sem reembolso automático de dinheiro. Mesmo e-mail em outro browser vê o mesmo saldo. Grátis não reseta no mês.

## Catálogo (fonte única no código)

| Pacote | `kind` | Créditos | `amount_cents` | Preço na UI |
| --- | --- | --- | --- | --- |
| Avulso | `pack_1` | 1 | 490 | R$ 4,90 |
| Pacote 10 | `pack_10` | 10 | 3990 | R$ 39,90 |
| Pacote 50 | `pack_50` | 50 | 14900 | R$ 149 |

## Testes

Unitário, sem Mercado Pago real:

- User novo → converte; depois `free_conversion_used = true` e `credits` intactos.
- Grátis usada, `credits = 3` → converte; depois `credits = 2`.
- Grátis usada, `credits = 0` → `credits_required`.
- Grátis intacta e `credits > 0` → consome grátis, créditos iguais.
- Falha (senha / ilegível) → não marca grátis, não desconta.
- Duas conversões simultâneas com 1 crédito (grátis já usada) → uma passa; saldo final 0.
- Duas conversões simultâneas com grátis intacta e 1 crédito → uma consome grátis, a outra 1 crédito.
- Export da mesma sessão → saldo igual.
- Webhook `paid` de `pack_10` → `credits += 10`.
- Mesmo `mercado_pago_id` de novo → saldo igual.
- `failed` / pending → saldo igual.
- Tentativa de creditar `kind` diferente do payment gravado → ignora / usa o gravado.

HTTP:

- Convert sem cookie → 401.
- Convert sem crédito → 402 `{ error: "credits_required" }`.

Remover testes e UI de `subscription_required`, `SubscribeWall`, limites Pro/Escritório e “páginas/mês”.

Manual antes de lançar: conta nova (1 grátis, segundo abre wall); Pix sandbox R$ 4,90 → saldo 1 → converte → saldo 0; header e perfil com o mesmo número; copy sem plano/assinatura/IP.

## Critério de pronto

- Não existe caminho de assinatura na UI.
- Uma conta nova converte uma vez sem pagar e a segunda exige Pix.
- Pix confirmado aumenta o saldo; preview ok diminui 1; falha não mexe.
- Pessoa e escritório compram os mesmos 3 pacotes.
