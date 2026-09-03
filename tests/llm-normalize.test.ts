import { describe, expect, it } from "vitest";
import { checkBalance } from "@/lib/balance";
import type { Statement } from "@/lib/statement";
import {
  buildBalanceFeedback,
  normalizeLlmStatement,
} from "@/lib/llm/normalize";

describe("normalizeLlmStatement", () => {
  it("corrige valores em reais quando saldos estao em centavos", () => {
    const llmWrong: Statement = {
      bank: "nubank",
      kind: "conta",
      openingBalanceCents: 10000,
      closingBalanceCents: 15000,
      transactions: [
        { date: "2026-01-01", description: "Entradas", amountCents: 50 },
      ],
    };

    const normalized = normalizeLlmStatement(llmWrong);
    expect(normalized.transactions[0].amountCents).toBe(5000);
    expect(checkBalance(normalized).ok).toBe(true);
  });

  it("nao altera statement que ja fecha", () => {
    const statement: Statement = {
      bank: "nubank",
      kind: "conta",
      openingBalanceCents: 10000,
      closingBalanceCents: 12000,
      transactions: [
        { date: "2026-01-01", description: "Pix", amountCents: 5000 },
        { date: "2026-01-02", description: "Boleto", amountCents: -3000 },
      ],
    };

    expect(normalizeLlmStatement(statement)).toEqual(statement);
  });
});

describe("buildBalanceFeedback", () => {
  it("pede saldos quando faltam", () => {
    const feedback = buildBalanceFeedback({
      bank: "nubank",
      kind: "conta",
      transactions: [{ date: "2026-01-01", description: "Pix", amountCents: 100 }],
    });

    expect(feedback).toContain("openingBalanceCents");
  });
});
