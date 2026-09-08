import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/auth";
import {
  CONTACT_TO,
  contactEmailHtml,
  parseContactInput,
} from "@/lib/contact";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = (await request.json().catch(() => ({}))) as {
      name?: unknown;
      email?: unknown;
      message?: unknown;
    };
    const parsed = parseContactInput(body, session?.user?.email);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "Confere OFX <onboarding@resend.dev>",
        to: CONTACT_TO,
        replyTo: parsed.data.email,
        subject: "Contato pelo site - Confere OFX",
        html: contactEmailHtml(parsed.data),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel enviar a mensagem" },
      { status: 500 },
    );
  }
}
