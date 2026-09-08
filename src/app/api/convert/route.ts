import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkBalance } from "@/lib/balance";
import { convertExtracted, convertFailureCopy } from "@/lib/convert";
import { evaluateCredits, persistConversion } from "@/lib/credits";
import { getDb } from "@/lib/db/client";
import { classify, classifyImage } from "@/lib/pdf/classify";
import {
  extractPdf,
  isImageMime,
  isPdfMime,
  PasswordRequiredError,
} from "@/lib/pdf/extract";
import { getUserByEmail } from "@/lib/quota";
import { deleteUploadedFile, readUploadedFile } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

function getIpAddress(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function POST(request: Request) {
  let charged = false;
  try {
    const body = (await request.json()) as {
      blobUrl: string;
      mimeType: string;
      password?: string;
    };

    const authSession = await auth();
    const user = authSession?.user?.email
      ? await getUserByEmail(authSession.user.email)
      : undefined;

    const decision = evaluateCredits(
      user
        ? {
            id: user.id,
            credits: user.credits,
            freeConversionUsed: user.freeConversionUsed,
          }
        : undefined,
    );

    if (!decision.allowed) {
      if (decision.error === "unauthenticated") {
        return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
      }
      return NextResponse.json(
        { error: "credits_required" },
        { status: 402 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

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

    const result = await convertExtracted(extracted!, {
      classification,
      fileBuffer,
      mimeType,
    });

    const expiresAt = new Date(Date.now() + 60_000);
    const balance = checkBalance(result.statement);

    const persisted = await persistConversion(getDb(), {
      userId: user.id,
      sessionValues: {
        ipAddress,
        statement: result.statement,
        balance,
        kind: classification.kind,
        bank: classification.bank,
        pageCount: extracted?.pageCount ?? 1,
        paid: true,
        paymentRequiredCents: 0,
        expiresAt,
      },
    });

    if (!persisted.ok) {
      return NextResponse.json(
        { error: "credits_required" },
        { status: 402 },
      );
    }

    charged = true;

    try {
      await deleteUploadedFile(body.blobUrl);
    } catch {
      // Blob cleanup must not hide a charged convert.
    }

    return NextResponse.json({
      sessionId: persisted.session.id,
      statement: result.statement,
      balance,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof PasswordRequiredError) {
      return NextResponse.json(
        { error: "Este PDF pede senha. Informe a senha e tente de novo." },
        { status: 400 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: convertFailureCopy(charged) },
      { status: 500 },
    );
  }
}
