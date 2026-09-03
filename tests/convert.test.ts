import { describe, expect, it, vi } from "vitest";
import { convertExtracted } from "@/lib/convert";
import type { ExtractedPdf } from "@/lib/pdf/extract";
import type { Statement } from "@/lib/statement";

const sampleExtracted: ExtractedPdf = {
  pages: [
    {
      pageIndex: 0,
      text: "Nu Pagamentos S.A.\nSaldo inicial R$ 100,00\n01 JAN Pix +R$ 50,00",
      hasTextLayer: true,
    },
  ],
  pageCount: 1,
  byteSize: 80,
};

describe("convertExtracted", () => {
  it("sempre usa LLM em PDF nativo", async () => {
    const fallback: Statement = {
      bank: "nubank",
      kind: "conta",
      openingBalanceCents: 10000,
      closingBalanceCents: 12000,
      transactions: [
        { date: "2026-01-01", description: "Pix", amountCents: 5000 },
        { date: "2026-01-02", description: "Boleto", amountCents: -3000 },
      ],
    };

    const scanWithLlmFn = vi.fn().mockResolvedValue(fallback);
    const result = await convertExtracted(sampleExtracted, {
      classification: { kind: "native", bank: "nubank" },
      scanWithLlmFn,
    });

    expect(scanWithLlmFn).toHaveBeenCalledOnce();
    expect(result.balance.ok).toBe(true);
  });

  it("usa LLM em scan ou foto", async () => {
    const fallback: Statement = {
      bank: "other",
      kind: "conta",
      openingBalanceCents: 0,
      closingBalanceCents: 1000,
      transactions: [
        { date: "2026-01-01", description: "Teste", amountCents: 1000 },
      ],
    };

    const scanWithLlmFn = vi.fn().mockResolvedValue(fallback);
    const extracted: ExtractedPdf = {
      pages: [],
      pageCount: 1,
      byteSize: 100,
    };

    const result = await convertExtracted(extracted, {
      classification: { kind: "scan", bank: "other" },
      fileBuffer: Buffer.from("fake"),
      mimeType: "image/jpeg",
      scanWithLlmFn,
    });

    expect(scanWithLlmFn).toHaveBeenCalledOnce();
  });

  it("passa PDF como imagem para o LLM", async () => {
    const scanWithLlmFn = vi.fn().mockResolvedValue({
      bank: "nubank",
      kind: "conta",
      transactions: [{ date: "2026-01-01", description: "Pix", amountCents: 1000 }],
    });

    await convertExtracted(sampleExtracted, {
      classification: { kind: "native", bank: "nubank" },
      fileBuffer: Buffer.from("pdf-bytes"),
      mimeType: "application/pdf",
      scanWithLlmFn,
    });

    expect(scanWithLlmFn).toHaveBeenCalledWith(
      expect.objectContaining({
        imageBuffer: expect.any(Buffer),
        mimeType: "application/pdf",
      }),
    );
  });
});
