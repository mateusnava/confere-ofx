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

  it("gera OFX com aviso se saldo nao fecha", () => {
    const broken = {
      ...statement,
      closingBalanceCents: 99999,
    };
    const ofx = toOfx(broken, checkBalance(broken));
    expect(ofx).toContain("<TRNAMT>50.00</TRNAMT>");
    expect(ofx).toContain("AVISO: saldo nao fecha");
    expect(ofx).toContain("Faltam R$ 879,99");
  });

  it("OFX sem aviso se saldo fecha", () => {
    const ofx = toOfx(statement, checkBalance(statement));
    expect(ofx).not.toContain("AVISO");
  });

  it("CSV header data,descricao,valor_centavos", () => {
    expect(toCsv(statement).split("\n")[0]).toBe(
      "data,descricao,valor_centavos",
    );
  });
});
