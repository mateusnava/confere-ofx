import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getUserByEmail } from "@/lib/quota";

export const runtime = "nodejs";

const pendingTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: Request) {
  const body = (await request.json()) as { email: string; plan?: "pro" | "escritorio" };
  const email = body.email.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email obrigatorio" }, { status: 400 });
  }

  const token = randomBytes(24).toString("hex");
  pendingTokens.set(token, {
    email,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const magicLink = `${appUrl}/api/auth/magic?token=${token}${body.plan ? `&plan=${body.plan}` : ""}`;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Confere OFX <onboarding@resend.dev>",
      to: email,
      subject: "Seu link de acesso - Confere OFX",
      html: `<p>Clique para entrar: <a href="${magicLink}">${magicLink}</a></p>`,
    });
  }

  return NextResponse.json({
    ok: true,
    magicLink: process.env.NODE_ENV === "development" ? magicLink : undefined,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const plan = searchParams.get("plan") as "pro" | "escritorio" | null;

  if (!token) {
    return NextResponse.redirect(new URL("/pdf-para-ofx", request.url));
  }

  const pending = pendingTokens.get(token);
  if (!pending || pending.expiresAt < Date.now()) {
    return NextResponse.redirect(new URL("/pdf-para-ofx?auth=expired", request.url));
  }

  pendingTokens.delete(token);
  const db = getDb();
  const existing = await getUserByEmail(pending.email);

  if (existing) {
    if (plan) {
      await db.update(users).set({ plan }).where(eq(users.id, existing.id));
    }
  } else {
    await db.insert(users).values({
      email: pending.email,
      plan: plan ?? "free",
    });
  }

  const response = NextResponse.redirect(new URL("/pdf-para-ofx?auth=ok", request.url));
  response.cookies.set("confere_email", pending.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
