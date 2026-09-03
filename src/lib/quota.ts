import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
}

export async function evaluateQuota(
  _pageCount: number,
  _context: unknown,
): Promise<{ allowed: boolean; requiresSubscription: boolean; reason?: string }> {
  return { allowed: true, requiresSubscription: false };
}

export async function recordUsage(_context: unknown, _pageCount: number) {}
