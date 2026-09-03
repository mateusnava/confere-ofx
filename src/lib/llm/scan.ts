import { generateText, Output, type UserContent } from "ai";
import { checkBalance } from "@/lib/balance";
import type { ExtractedPdf } from "@/lib/pdf/extract";
import type { Statement } from "@/lib/statement";
import { getGeminiModel } from "@/lib/llm/google";
import {
  buildBalanceFeedback,
  normalizeLlmStatement,
} from "@/lib/llm/normalize";
import { statementSchema } from "@/lib/llm/schema";

type ScanInput = {
  extracted?: ExtractedPdf;
  imageBuffer?: Buffer;
  mimeType?: string;
};

const MAX_ATTEMPTS = 4;

const SYSTEM_PROMPT = `Voce extrai extratos bancarios brasileiros para JSON estruturado.

REGRAS OBRIGATORIAS:
1. Todos os valores monetarios em CENTAVOS inteiros (R$1,00 = 100, R$50,00 = 5000, R$1.250,18 = 125018).
2. Credito/entrada = amountCents positivo. Debito/saida = amountCents negativo.
3. openingBalanceCents = saldo inicial do periodo. closingBalanceCents = saldo final.
4. Deve fechar: openingBalanceCents + soma(amountCents) = closingBalanceCents (tolerancia 1 centavo).
5. Datas no formato YYYY-MM-DD.
6. Extraia apenas movimentacoes reais do periodo — nao use saldo corrido ou saldo do dia como lancamento.
7. Se o documento agrupa valores por dia ou periodo, represente cada grupo como transacao(oes) coerente(s) com o que aparece no extrato.
8. Conta corrente (kind=conta): lancamentos da conta. Fatura de cartao (kind=fatura): compras negativas, pagamentos/estornos positivos.`;

const USER_PROMPT = `Extraia bank, kind, openingBalanceCents, closingBalanceCents e transactions[{date, description, amountCents}].
Confira a matematica antes de responder.`;

function emptyStatement(): Statement {
  return {
    bank: "other",
    kind: "conta",
    transactions: [],
  };
}

function buildUserContent(input: ScanInput, feedback?: string): UserContent {
  const text =
    input.extracted?.pages.map((page) => page.text).join("\n") ?? "";

  const parts: UserContent = [];

  if (input.imageBuffer && input.mimeType) {
    parts.push({
      type: "file",
      data: input.imageBuffer,
      mediaType: input.mimeType,
    });
  }

  const feedbackLine = feedback ? `\n\nCORRECAO OBRIGATORIA:\n${feedback}` : "";

  parts.push({
    type: "text",
    text: text
      ? `${USER_PROMPT}${feedbackLine}\n\nTexto extraido do PDF:\n${text}`
      : `${USER_PROMPT}${feedbackLine}`,
  });

  return parts;
}

function thinkingLevelForAttempt(attempt: number): "minimal" | "low" | "medium" {
  if (attempt === 0) return "minimal";
  if (attempt <= 2) return "low";
  return "medium";
}

export async function scanWithLlm(input: ScanInput): Promise<Statement> {
  let feedback: string | undefined;
  let lastOutput: Statement | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const result = await generateText({
      model: getGeminiModel(),
      output: Output.object({ schema: statementSchema }),
      messages: [{ role: "user", content: buildUserContent(input, feedback) }],
      system: SYSTEM_PROMPT,
      providerOptions: {
        google: {
          thinkingConfig: { thinkingLevel: thinkingLevelForAttempt(attempt) },
        },
      },
    });

    if (!result.output) {
      continue;
    }

    const normalized = normalizeLlmStatement(result.output);
    lastOutput = normalized;
    const balance = checkBalance(normalized);

    if (balance.ok) {
      return normalized;
    }

    feedback = buildBalanceFeedback(normalized);
  }

  return lastOutput ?? emptyStatement();
}
