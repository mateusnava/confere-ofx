export type Transaction = {
  date: string;
  description: string;
  amountCents: number;
};

export type StatementKind = "conta" | "fatura";

export type Statement = {
  bank: string;
  kind: StatementKind;
  openingBalanceCents?: number;
  closingBalanceCents?: number;
  transactions: Transaction[];
};
