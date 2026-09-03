import { and, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { payments, sessions, users } from "@/lib/db/schema";

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

class CreditsRequiredError extends Error {
  constructor() {
    super("credits_required");
    this.name = "CreditsRequiredError";
  }
}

type SessionInsert = typeof sessions.$inferInsert;

export async function persistConversion(
  db: Db,
  input: {
    userId: string;
    sessionValues: Omit<SessionInsert, "userId" | "creditSource">;
  },
): Promise<
  | {
      ok: true;
      creditSource: CreditSource;
      session: typeof sessions.$inferSelect;
    }
  | { ok: false; error: "credits_required" }
> {
  try {
    return await db.transaction(async (tx) => {
      const free = await tx
        .update(users)
        .set({ freeConversionUsed: true })
        .where(
          and(eq(users.id, input.userId), eq(users.freeConversionUsed, false)),
        )
        .returning({ id: users.id });

      let creditSource: CreditSource;
      if (free.length > 0) {
        creditSource = "free";
      } else {
        const debit = await tx
          .update(users)
          .set({ credits: sql`${users.credits} - 1` })
          .where(and(eq(users.id, input.userId), sql`${users.credits} >= 1`))
          .returning({ id: users.id });
        if (debit.length === 0) {
          throw new CreditsRequiredError();
        }
        creditSource = "credit";
      }

      const [session] = await tx
        .insert(sessions)
        .values({
          ...input.sessionValues,
          userId: input.userId,
          creditSource,
        })
        .returning();

      return { ok: true, creditSource, session };
    });
  } catch (error) {
    if (error instanceof CreditsRequiredError) {
      return { ok: false, error: "credits_required" };
    }
    throw error;
  }
}

export async function creditPaidPayment(db: Db, mercadoPagoId: string) {
  await db.transaction(async (tx) => {
    const [payment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.mercadoPagoId, mercadoPagoId))
      .limit(1);

    if (!payment || payment.status !== "pending" || !payment.userId) {
      return;
    }

    const kind = parsePackKind(payment.kind);
    if (!kind) {
      return;
    }

    const flipped = await tx
      .update(payments)
      .set({ status: "paid", paidAt: new Date() })
      .where(and(eq(payments.id, payment.id), eq(payments.status, "pending")))
      .returning({ id: payments.id });

    if (flipped.length === 0) {
      return;
    }

    await tx
      .update(users)
      .set({
        credits: sql`${users.credits} + ${CREDIT_PACKS[kind].credits}`,
      })
      .where(eq(users.id, payment.userId));
  });
}
