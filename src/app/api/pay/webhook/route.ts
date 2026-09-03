import { NextResponse } from "next/server";
import { creditPaidPayment } from "@/lib/credits";
import { getDb } from "@/lib/db/client";
import { getPixStatus } from "@/lib/mp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    type?: string;
    action?: string;
    data?: { id?: string };
  };

  const mercadoPagoId = body.data?.id ? String(body.data.id) : "";
  if (!mercadoPagoId) {
    return NextResponse.json({ ok: true });
  }

  const status = await getPixStatus(mercadoPagoId);
  if (status === "paid") {
    await creditPaidPayment(getDb(), mercadoPagoId);
  }

  return NextResponse.json({ ok: true });
}
