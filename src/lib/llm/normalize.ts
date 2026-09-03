import { checkBalance, sumCents } from "@/lib/balance";
import type { Statement } from "@/lib/statement";

function scaleTransactions(
  statement: Statement,
  factor: number,
): Statement {
  return {
    ...statement,
    transactions: statement.transactions.map((tx) => ({
      ...tx,
      amountCents: Math.round(tx.amountCents * factor),
    })),
  };
}

function looksLikeReaisNotCentavos(statement: Statement): boolean {
  const { openingBalanceCents, closingBalanceCents, transactions } = statement;

  if (
    openingBalanceCents === undefined ||
    closingBalanceCents === undefined ||
    transactions.length === 0
  ) {
    return false;
  }

  const balancesLookLikeCentavos =
    openingBalanceCents >= 1000 || closingBalanceCents >= 1000;
  const txsLookLikeReais = transactions.every(
    (tx) => Math.abs(tx.amountCents) < 100_000,
  );

  return balancesLookLikeCentavos && txsLookLikeReais;
}

export function normalizeLlmStatement(statement: Statement): Statement {
  if (checkBalance(statement).ok) {
    return statement;
  }

  if (looksLikeReaisNotCentavos(statement)) {
    const scaled = scaleTransactions(statement, 100);
    if (checkBalance(scaled).ok) {
      return scaled;
    }
  }

  return statement;
}

export function buildBalanceFeedback(statement: Statement): string {
  const balance = checkBalance(statement);
  const opening = statement.openingBalanceCents;
  const closing = statement.closingBalanceCents;

  if (opening === undefined || closing === undefined) {
    return [
      "Faltam openingBalanceCents e/ou closingBalanceCents.",
      "Busque Saldo inicial e Saldo final no documento.",
      `Transacoes extraidas: ${statement.transactions.length}.`,
    ].join(" ");
  }

  return [
    "Saldo nao fecha.",
    `openingBalanceCents=${opening}, closingBalanceCents=${closing},`,
    `soma transacoes=${balance.sumCents},`,
    `esperado=${balance.expectedClosingCents}, delta=${balance.deltaCents}.`,
    "Valores devem estar em CENTAVOS inteiros (R$100,00=10000).",
    "Nao inclua saldo corrido como lancamento.",
    "Revise todos os lancamentos do periodo e confira a matematica.",
  ].join(" ");
}

export { sumCents };
