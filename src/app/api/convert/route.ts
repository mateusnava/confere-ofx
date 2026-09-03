import { NextResponse } from "next/server";
import { checkBalance } from "@/lib/balance";
import { convertExtracted } from "@/lib/convert";
import { getDb } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { classify, classifyImage } from "@/lib/pdf/classify";
import {
  extractPdf,
  isImageMime,
  isPdfMime,
  PasswordRequiredError,
} from "@/lib/pdf/extract";
import { evaluateQuota, getUserByEmail, recordUsage } from "@/lib/quota";
import { deleteUploadedFile, readUploadedFile } from "@/lib/storage";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 60;

function getIpAddress(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      blobUrl: string;
      mimeType: string;
      password?: string;
    };

    const { buffer } = await readUploadedFile(body.blobUrl);
    const ipAddress = getIpAddress(request);
    let classification = classifyImage();
    let extracted;
    let fileBuffer: Buffer | undefined;
    let mimeType = body.mimeType;

    if (isPdfMime(body.mimeType)) {
      extracted = await extractPdf(buffer, body.password);
      classification = classify(extracted);
      fileBuffer = buffer;
      mimeType = "application/pdf";
    } else if (isImageMime(body.mimeType)) {
      fileBuffer = buffer;
      extracted = {
        pages: [],
        pageCount: 1,
        byteSize: buffer.byteLength,
      };
      classification = classifyImage();
    } else {
      return NextResponse.json({ error: "Tipo de arquivo invalido" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const email = cookieStore.get("confere_email")?.value;
    const user = email ? await getUserByEmail(email) : undefined;

    const quota = await evaluateQuota(extracted?.pageCount ?? 1, {
      ipAddress,
      userId: user?.id,
      userPlan: user?.plan,
    });

    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "subscription_required",
          reason: quota.reason,
        },
        { status: 402 },
      );
    }

    const result = await convertExtracted(extracted!, {
      classification,
      fileBuffer,
      mimeType,
    });

    const db = getDb();
    const expiresAt = new Date(Date.now() + 60_000);
    const balance = checkBalance(result.statement);

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user?.id,
        ipAddress,
        statement: result.statement,
        balance,
        kind: classification.kind,
        bank: classification.bank,
        pageCount: extracted?.pageCount ?? 1,
        paid: true,
        paymentRequiredCents: 0,
        expiresAt,
      })
      .returning();

    await deleteUploadedFile(body.blobUrl);

    await recordUsage(
      {
        ipAddress,
        userId: user?.id,
        userPlan: user?.plan,
      },
      extracted?.pageCount ?? 1,
    );

    return NextResponse.json({
      sessionId: session.id,
      statement: result.statement,
      balance,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof PasswordRequiredError) {
      return NextResponse.json({ error: "PASSWORD_REQUIRED" }, { status: 400 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao converter arquivo",
      },
      { status: 500 },
    );
  }
}
