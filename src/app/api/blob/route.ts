import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  createLocalBlobUrl,
  isBlobEnabled,
  storeLocalFile,
} from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export async function GET() {
  return NextResponse.json({
    provider: isBlobEnabled() ? "vercel" : "local",
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return handleLocalUpload(request);
  }

  if (!isBlobEnabled()) {
    return NextResponse.json(
      {
        error:
          "Envio do arquivo falhou. Tente de novo.",
      },
      { status: 400 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...ALLOWED_TYPES],
        maximumSizeInBytes: MAX_BYTES,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ purpose: "convert" }),
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao enviar arquivo",
      },
      { status: 400 },
    );
  }
}

async function handleLocalUpload(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo obrigatorio" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo invalido" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = storeLocalFile(buffer, file.type);
  const url = createLocalBlobUrl(request, id);

  return NextResponse.json({
    provider: "local",
    url,
    pathname: file.name,
    contentType: file.type,
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Endereco do arquivo obrigatorio" },
      { status: 400 },
    );
  }

  if (!isBlobEnabled()) {
    return NextResponse.json({ ok: true });
  }

  await del(url);
  return NextResponse.json({ ok: true });
}
