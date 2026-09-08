import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import {
  CREDIT_PACKS,
  creditPaidPayment,
  markPaymentFailed,
  parsePackKind,
} from "@/lib/credits";
import { getDb } from "@/lib/db/client";
import { payments, users } from "@/lib/db/schema";
import { createPixCharge, getPixStatus } from "@/lib/mp";
import { getUserByEmail } from "@/lib/quota";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Entre na sua conta" }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "Entre na sua conta" }, { status: 401 });
    }

    const body = (await request.json()) as { kind?: unknown };
    const kind = parsePackKind(body.kind);
    if (!kind) {
      return NextResponse.json({ error: "Pacote invalido" }, { status: 400 });
    }

    const pack = CREDIT_PACKS[kind];
    const db = getDb();
    const [payment] = await db
      .insert(payments)
      .values({
        userId: user.id,
        amountCents: pack.amountCents,
        kind,
        status: "pending",
      })
      .returning();

    let pix;
    try {
      pix = await createPixCharge({
        amountCents: pack.amountCents,
        description: `Confere OFX — ${pack.label}`,
        idempotencyKey: payment.id,
        payerEmail: user.email,
      });
    } catch {
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, payment.id));
      return NextResponse.json({ error: "Falha ao criar Pix" }, { status: 502 });
    }

    await db
      .update(payments)
      .set({ mercadoPagoId: pix.id })
      .where(eq(payments.id, payment.id));

    return NextResponse.json({
      paymentId: payment.id,
      qrCode: pix.qrCode,
      qrCodeBase64: pix.qrCodeBase64,
      amountCents: pack.amountCents,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao criar Pix" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Entre na sua conta" }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "Entre na sua conta" }, { status: 401 });
    }

    const paymentId = new URL(request.url).searchParams.get("paymentId");
    if (!paymentId) {
      return NextResponse.json(
        { error: "Pagamento obrigatorio" },
        { status: 400 },
      );
    }

    const db = getDb();
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment || payment.userId !== user.id) {
      return NextResponse.json({ error: "Pagamento nao encontrado" }, { status: 404 });
    }

    if (payment.status === "pending" && payment.mercadoPagoId) {
      const mpStatus = await getPixStatus(payment.mercadoPagoId);
      if (mpStatus === "paid") {
        await creditPaidPayment(db, payment.mercadoPagoId);
      } else if (mpStatus === "failed") {
        await markPaymentFailed(db, payment.mercadoPagoId);
      }
    }

    const [freshUser] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const [freshPayment] = await db
      .select({ status: payments.status })
      .from(payments)
      .where(eq(payments.id, payment.id))
      .limit(1);

    return NextResponse.json({
      status: freshPayment?.status ?? payment.status,
      credits: freshUser?.credits ?? user.credits,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao consultar Pix" }, { status: 500 });
  }
}
