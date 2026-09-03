import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { dailyFree, monthlyUsage, users } from "@/lib/db/schema";
import { PLAN_LIMITS, type PlanId } from "@/lib/plans";

export { PLAN_LIMITS, PLAN_PRICES } from "@/lib/plans";

export type QuotaContext = {
  ipAddress: string;
  userId?: string;
  userPlan?: PlanId;
};

export type QuotaDecision = {
  allowed: boolean;
  requiresSubscription: boolean;
  reason?: "daily_free_used" | "plan_limit_exceeded" | "subscription_required";
};

function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function monthKey(): string {
  return todayInSaoPaulo().slice(0, 7);
}

export async function evaluateQuota(
  pageCount: number,
  context: QuotaContext,
): Promise<QuotaDecision> {
  if (context.userId && context.userPlan && context.userPlan !== "free") {
    const db = getDb();
    const [usage] = await db
      .select()
      .from(monthlyUsage)
      .where(
        and(
          eq(monthlyUsage.userId, context.userId),
          eq(monthlyUsage.monthKey, monthKey()),
        ),
      )
      .limit(1);

    const limits = PLAN_LIMITS[context.userPlan];
    const pagesUsed = usage?.pagesUsed ?? 0;

    if (pagesUsed + pageCount <= limits.pages) {
      return { allowed: true, requiresSubscription: false };
    }

    return {
      allowed: false,
      requiresSubscription: true,
      reason: "plan_limit_exceeded",
    };
  }

  const db = getDb();
  const usageDate = todayInSaoPaulo();
  const [existing] = await db
    .select()
    .from(dailyFree)
    .where(
      and(
        eq(dailyFree.ipAddress, context.ipAddress),
        eq(dailyFree.usageDate, usageDate),
      ),
    )
    .limit(1);

  if (!existing) {
    return { allowed: true, requiresSubscription: false };
  }

  return {
    allowed: false,
    requiresSubscription: true,
    reason: "daily_free_used",
  };
}

export async function recordUsage(context: QuotaContext, pageCount: number) {
  const db = getDb();

  if (context.userId && context.userPlan && context.userPlan !== "free") {
    const key = monthKey();
    const [existing] = await db
      .select()
      .from(monthlyUsage)
      .where(
        and(
          eq(monthlyUsage.userId, context.userId),
          eq(monthlyUsage.monthKey, key),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(monthlyUsage)
        .set({ pagesUsed: existing.pagesUsed + pageCount })
        .where(eq(monthlyUsage.id, existing.id));
      return;
    }

    await db.insert(monthlyUsage).values({
      userId: context.userId,
      monthKey: key,
      pagesUsed: pageCount,
      scansUsed: 0,
    });
    return;
  }

  await db.insert(dailyFree).values({
    ipAddress: context.ipAddress,
    usageDate: todayInSaoPaulo(),
  });
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
}
