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
