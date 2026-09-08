import { describe, expect, it, vi } from "vitest";
import { readUploadedFile } from "@/lib/storage";
import {
  BLOB_ACCESS,
  blobPathnameFor,
  mimeTypeForUpload,
} from "@/lib/storage/upload";

describe("mimeTypeForUpload", () => {
  it("usa o tipo do arquivo quando e permitido", () => {
    expect(mimeTypeForUpload("foto.png", "image/png")).toBe("image/png");
  });

  it("infere PDF pelo nome quando o browser nao manda type", () => {
    expect(mimeTypeForUpload("20260901114641145 (1).pdf", "")).toBe(
      "application/pdf",
    );
  });
});

describe("blobPathnameFor", () => {
  it("remove espaco e parenteses do nome do extrato", () => {
    expect(blobPathnameFor("20260901114641145 (1).pdf")).toBe(
      "extratos/20260901114641145-1.pdf",
    );
  });
});

describe("readUploadedFile", () => {
  it("baixa blob privado pelo SDK autenticado", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("pdf-bytes"));
        controller.close();
      },
    });
    const getBlob = vi.fn().mockResolvedValue({
      statusCode: 200,
      stream,
      headers: new Headers({ "content-type": "application/pdf" }),
      blob: { contentType: "application/pdf", size: 9 },
    });

    const url =
      "https://store.private.blob.vercel-storage.com/extratos/foo.pdf";
    const result = await readUploadedFile(url, { getBlob });

    expect(BLOB_ACCESS).toBe("private");
    expect(getBlob).toHaveBeenCalledWith(url, { access: "private" });
    expect(result.mimeType).toBe("application/pdf");
    expect(result.buffer.toString()).toBe("pdf-bytes");
  });
});
