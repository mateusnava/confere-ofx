import { describe, expect, it } from "vitest";
import { checkBalance } from "@/lib/balance";
import {
  exportErrorMessage,
  exportUrl,
  filenameFromDisposition,
} from "@/lib/export/client";
import { toCsv } from "@/lib/export/csv";
import { toOfx } from "@/lib/export/ofx";
import { SESSION_EXPIRED_COPY } from "@/lib/session";
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

  it("404 de export vira aviso de sessao expirada", () => {
    expect(exportErrorMessage(404, { error: "Sessao expirada" })).toBe(
      SESSION_EXPIRED_COPY,
    );
  });

  it("monta URL de export sem sair da pagina", () => {
    expect(exportUrl("abc", "csv")).toBe(
      "/api/export?sessionId=abc&format=csv",
    );
    expect(exportUrl("abc", "ofx", true)).toBe(
      "/api/export?sessionId=abc&format=ofx&ack=1",
    );
  });

  it("lê filename do Content-Disposition", () => {
    expect(
      filenameFromDisposition(
        'attachment; filename="extrato.ofx"',
        "fallback.ofx",
      ),
    ).toBe("extrato.ofx");
    expect(filenameFromDisposition(null, "extrato.csv")).toBe("extrato.csv");
  });
});
