export const CREDIT_PACKS = {
  pack_1: {
    credits: 1,
    amountCents: 490,
    label: "1 credito",
    price: "R$ 4,90",
  },
  pack_10: {
    credits: 10,
    amountCents: 3990,
    label: "10 creditos",
    price: "R$ 39,90",
  },
  pack_50: {
    credits: 50,
    amountCents: 14900,
    label: "50 creditos",
    price: "R$ 149",
  },
} as const;

export type PackKind = keyof typeof CREDIT_PACKS;

export type CreditAccount = {
  id: string;
  credits: number;
  freeConversionUsed: boolean;
};

export type CreditDecision =
  | { allowed: true }
  | { allowed: false; error: "unauthenticated" | "credits_required" };

export function parsePackKind(value: unknown): PackKind | undefined {
  if (value === "pack_1" || value === "pack_10" || value === "pack_50") {
    return value;
  }
  return undefined;
}

export function evaluateCredits(
  account: CreditAccount | undefined,
): CreditDecision {
  if (!account) {
    return { allowed: false, error: "unauthenticated" };
  }
  if (!account.freeConversionUsed || account.credits >= 1) {
    return { allowed: true };
  }
  return { allowed: false, error: "credits_required" };
}

export function formatCredits(count: number): string {
  return count === 1 ? "1 credito" : `${count} creditos`;
}

export type CreditSource = "free" | "credit";

export type ChargeResult =
  | { ok: true; creditSource: CreditSource; account: CreditAccount }
  | { ok: false; error: "credits_required" };

export function chargeConversion(account: CreditAccount): ChargeResult {
  if (!account.freeConversionUsed) {
    return {
      ok: true,
      creditSource: "free",
      account: { ...account, freeConversionUsed: true },
    };
  }
  if (account.credits >= 1) {
    return {
      ok: true,
      creditSource: "credit",
      account: { ...account, credits: account.credits - 1 },
    };
  }
  return { ok: false, error: "credits_required" };
}

export type PaymentRecord = {
  id: string;
  userId: string;
  kind: PackKind;
  amountCents: number;
  status: "pending" | "paid" | "failed";
  mercadoPagoId: string | null;
};

export function applyPaidPayment(
  account: CreditAccount,
  payment: PaymentRecord,
  _claimedKind?: string,
): { account: CreditAccount; payment: PaymentRecord } {
  if (payment.status !== "pending") {
    return { account, payment };
  }
  const pack = CREDIT_PACKS[payment.kind];
  return {
    account: { ...account, credits: account.credits + pack.credits },
    payment: { ...payment, status: "paid" },
  };
}
