import { NextResponse } from "next/server";
import { getLocalFile } from "@/lib/storage/local";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const file = getLocalFile(id);

  if (!file) {
    return NextResponse.json({ error: "Arquivo expirado" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "private, max-age=60",
    },
  });
}
