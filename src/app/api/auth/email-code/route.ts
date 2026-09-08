import { NextResponse } from "next/server";
import { Resend } from "resend";
import { issueEmailCode } from "@/lib/auth/email-code";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail obrigatorio" }, { status: 400 });
    }

    const { code } = await issueEmailCode(email);
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "Confere OFX <onboarding@resend.dev>",
        to: email,
        subject: `${code} e seu codigo - Confere OFX`,
        html: `<p>Seu codigo de acesso: <strong>${code}</strong></p><p>Ele vale por 10 minutos.</p>`,
      });
    }

    return NextResponse.json({
      ok: true,
      code:
        process.env.NODE_ENV === "development" && !resendKey ? code : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel enviar o codigo" },
      { status: 500 },
    );
  }
}
