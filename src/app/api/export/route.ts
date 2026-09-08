import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { BalanceCheck } from "@/lib/balance";
import { getDb } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { toCsv } from "@/lib/export/csv";
import { toXlsx } from "@/lib/export/excel";
import { toOfx } from "@/lib/export/ofx";
import type { Statement } from "@/lib/statement";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const format = searchParams.get("format") ?? "json";

  if (!sessionId) {
    return NextResponse.json({ error: "Sessao obrigatoria" }, { status: 400 });
  }

  const db = getDb();
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Sessao expirada" }, { status: 404 });
  }

  const statement = session.statement as Statement;
  const balance = session.balance as BalanceCheck;

  if (format === "ofx") {
    const acknowledged = searchParams.get("ack") === "1";
    if (!balance.ok && !acknowledged) {
      return NextResponse.json(
        { error: "OFX exige confirmacao porque o saldo nao fecha" },
        { status: 422 },
      );
    }

    const ofx = toOfx(statement, balance);

    return new NextResponse(ofx, {
      headers: {
        "Content-Type": "application/x-ofx",
        "Content-Disposition": 'attachment; filename="extrato.ofx"',
      },
    });
  }

  if (format === "csv") {
    return new NextResponse(toCsv(statement), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="extrato.csv"',
      },
    });
  }

  if (format === "xlsx") {
    const buffer = await toXlsx(statement, balance);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="extrato.xlsx"',
      },
    });
  }

  return NextResponse.json({
    sessionId: session.id,
    statement,
    balance,
    expiresAt: session.expiresAt.toISOString(),
  });
}
