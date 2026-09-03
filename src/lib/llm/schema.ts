import { z } from "zod";
import type { StatementKind } from "@/lib/statement";

export const statementSchema = z.object({
  bank: z
    .string()
    .describe("Identificador do banco, ex: itau, bradesco, bb, inter, other"),
  kind: z
    .enum(["conta", "fatura"] satisfies [StatementKind, StatementKind])
    .describe("conta para extrato bancario, fatura para cartao"),
  openingBalanceCents: z
    .number()
    .int()
    .describe("Saldo inicial em centavos inteiros. R$100,00 = 10000"),
  closingBalanceCents: z
    .number()
    .int()
    .describe("Saldo final em centavos inteiros. R$1.250,18 = 125018"),
  transactions: z
    .array(
      z.object({
        date: z
          .string()
          .describe("Data ISO YYYY-MM-DD"),
        description: z.string(),
        amountCents: z
          .number()
          .int()
          .describe("Valor em centavos inteiros. Credito positivo, debito negativo"),
      }),
    )
    .describe("Lista completa de lancamentos do periodo"),
});

export type ParsedStatement = z.infer<typeof statementSchema>;
