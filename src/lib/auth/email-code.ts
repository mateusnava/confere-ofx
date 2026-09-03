import { createHmac, timingSafeEqual } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users, verificationTokens } from "@/lib/db/schema";
import { getUserByEmail } from "@/lib/quota";

function authSecret() {
  return process.env.AUTH_SECRET ?? "dev-auth-secret";
}

export function hashEmailCode(email: string, code: string) {
  return createHmac("sha256", authSecret())
    .update(`${email}:${code}`)
    .digest("hex");
}

export function codesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function verifyEmailCode(email: string, code: string) {
  const db = getDb();
  const [token] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.email, email))
    .orderBy(desc(verificationTokens.createdAt))
    .limit(1);

  if (!token || token.expiresAt.getTime() < Date.now()) {
    return null;
  }

  if (!codesMatch(token.codeHash, hashEmailCode(email, code))) {
    return null;
  }

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.email, email));

  const existing = await getUserByEmail(email);
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      plan: existing.plan,
    };
  }

  const [created] = await db
    .insert(users)
    .values({ email, plan: "free" })
    .returning();

  return {
    id: created.id,
    email: created.email,
    plan: created.plan,
  };
}
