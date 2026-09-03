import { describe, expect, it } from "vitest";
import { checkBalance } from "@/lib/balance";
import { toCsv } from "@/lib/export/csv";
import { toOfx } from "@/lib/export/ofx";
import type { Statement } from "@/lib/statement";

const statement: Statement = {
  bank: "nubank",
  kind: "conta",
  openingBalanceCents: 10000,
  closingBalanceCents: 12000,
  transactions: [
    { date: "2026-01-01", description: "Pix", amountCents: 5000 },
    { date: "2026-01-02", description: "Compra", amountCents: -3000 },
  ],
};

describe("export", () => {
  it("gera OFX com TRNAMT 50.00", () => {
    const balance = checkBalance(statement);
    const ofx = toOfx(statement, balance);
    expect(ofx).toContain("<TRNAMT>50.00</TRNAMT>");
  });

  it("toOfx null se saldo nao fecha", () => {
    const broken = {
      ...statement,
      closingBalanceCents: 99999,
    };
    expect(toOfx(broken, checkBalance(broken))).toBeNull();
  });

  it("CSV header data,descricao,valor_centavos", () => {
    expect(toCsv(statement).split("\n")[0]).toBe(
      "data,descricao,valor_centavos",
    );
  });
});
