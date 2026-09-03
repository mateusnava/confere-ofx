import { describe, expect, it } from "vitest";
import { balanceGapLabel, checkBalance, sumCents } from "@/lib/balance";
import type { Statement } from "@/lib/statement";

function makeStatement(
  partial: Partial<Statement> & Pick<Statement, "transactions">,
): Statement {
  return {
    bank: "nubank",
    kind: "conta",
    ...partial,
  };
}

describe("sumCents", () => {
  it("soma 5000-3000+100=2100", () => {
    const statement = makeStatement({
      transactions: [
        { date: "2026-01-01", description: "A", amountCents: 5000 },
        { date: "2026-01-02", description: "B", amountCents: -3000 },
        { date: "2026-01-03", description: "C", amountCents: 100 },
      ],
    });

    expect(sumCents(statement)).toBe(2100);
  });
});

describe("checkBalance", () => {
  it("abertura 10000 + 2000 = 12000 fecha", () => {
    const statement = makeStatement({
      openingBalanceCents: 10000,
      closingBalanceCents: 12000,
      transactions: [
        { date: "2026-01-01", description: "Credito", amountCents: 2000 },
      ],
    });

    expect(checkBalance(statement).ok).toBe(true);
  });

  it("delta 2 nao fecha", () => {
    const statement = makeStatement({
      openingBalanceCents: 10000,
      closingBalanceCents: 12002,
      transactions: [
        { date: "2026-01-01", description: "Credito", amountCents: 2000 },
      ],
    });

    expect(checkBalance(statement).ok).toBe(false);
  });

  it("tolerancia 1 centavo fecha", () => {
    const statement = makeStatement({
      openingBalanceCents: 10000,
      closingBalanceCents: 12001,
      transactions: [
        { date: "2026-01-01", description: "Credito", amountCents: 2000 },
      ],
    });

    expect(checkBalance(statement).ok).toBe(true);
  });

  it("label faltam quando fechamento e maior", () => {
    const statement = makeStatement({
      openingBalanceCents: 10000,
      closingBalanceCents: 12002,
      transactions: [
        { date: "2026-01-01", description: "Credito", amountCents: 2000 },
      ],
    });

    expect(balanceGapLabel(checkBalance(statement))).toBe("Faltam R$ 0,02");
  });

  it("label sem saldos", () => {
    const statement = makeStatement({
      transactions: [
        { date: "2026-01-01", description: "Credito", amountCents: 2000 },
      ],
    });

    expect(balanceGapLabel(checkBalance(statement))).toBe(
      "Sem saldo de abertura ou fechamento para conferir",
    );
  });

  it("sem saldos => nao ok", () => {
    const statement = makeStatement({
      transactions: [
        { date: "2026-01-01", description: "Credito", amountCents: 2000 },
      ],
    });

    expect(checkBalance(statement).ok).toBe(false);
  });
});
