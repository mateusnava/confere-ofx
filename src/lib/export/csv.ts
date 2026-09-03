import type { Statement } from "@/lib/statement";

export function toCsv(statement: Statement): string {
  const header = "data,descricao,valor_centavos";
  const rows = statement.transactions.map(
    (tx) =>
      `${tx.date},${JSON.stringify(tx.description)},${tx.amountCents}`,
  );

  return [header, ...rows].join("\n");
}
