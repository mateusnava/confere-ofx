import type { Statement } from "./statement";

export type BalanceCheck = {
  ok: boolean;
  sumCents: number;
  expectedClosingCents?: number;
  deltaCents?: number;
};

export function sumCents(statement: Statement): number {
  return statement.transactions.reduce(
    (total, tx) => total + tx.amountCents,
    0,
  );
}

export function checkBalance(statement: Statement): BalanceCheck {
  const sum = sumCents(statement);
  const { openingBalanceCents, closingBalanceCents } = statement;

  if (
    openingBalanceCents === undefined ||
    closingBalanceCents === undefined
  ) {
    return { ok: false, sumCents: sum };
  }

  const expectedClosingCents = openingBalanceCents + sum;
  const deltaCents = closingBalanceCents - expectedClosingCents;

  return {
    ok: Math.abs(deltaCents) <= 1,
    sumCents: sum,
    expectedClosingCents,
    deltaCents,
  };
}

function formatReais(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function balanceGapLabel(balance: BalanceCheck): string {
  if (balance.deltaCents === undefined) {
    return "Sem saldo de abertura ou fechamento para conferir";
  }

  const amount = `R$ ${formatReais(Math.abs(balance.deltaCents))}`;
  return balance.deltaCents > 0 ? `Faltam ${amount}` : `Sobram ${amount}`;
}
