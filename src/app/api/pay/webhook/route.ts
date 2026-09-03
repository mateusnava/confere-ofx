import { NextResponse } from "next/server";
import { creditPaidPayment, markPaymentFailed } from "@/lib/credits";
import { getDb } from "@/lib/db/client";
import {
  getPixStatus,
  isMercadoPagoPaymentId,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mp";

export const runtime = "nodejs";

function paymentIdFrom(request: Request, body: { data?: { id?: unknown } }) {
  const fromQuery = new URL(request.url).searchParams.get("data.id");
  if (fromQuery) {
    return fromQuery;
  }
  return body.data?.id != null ? String(body.data.id) : "";
}

export async function POST(request: Request) {
  let body: { type?: string; action?: string; data?: { id?: unknown } } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const mercadoPagoId = paymentIdFrom(request, body);
  if (!isMercadoPagoPaymentId(mercadoPagoId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret) {
    const valid = verifyMercadoPagoWebhookSignature({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId: mercadoPagoId,
      secret,
    });
    if (!valid) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const status = await getPixStatus(mercadoPagoId);
  if (status === "paid") {
    await creditPaidPayment(getDb(), mercadoPagoId);
  } else if (status === "failed") {
    await markPaymentFailed(getDb(), mercadoPagoId);
  }

  return NextResponse.json({ ok: true });
}
