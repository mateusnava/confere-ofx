import { describe, expect, it } from "vitest";
import { classify } from "@/lib/pdf/classify";
import type { ExtractedPdf } from "@/lib/pdf/extract";

function makeExtracted(text: string): ExtractedPdf {
  return {
    pages: [{ pageIndex: 0, text, hasTextLayer: text.length >= 20 }],
    pageCount: 1,
    byteSize: 1000,
  };
}

describe("classify", () => {
  it("texto Nu Pagamentos => nativo nubank", () => {
    expect(
      classify(makeExtracted("Nu Pagamentos S.A. extrato de conta corrente")),
    ).toEqual({ kind: "native", bank: "nubank" });
  });

  it("texto vazio => scan other", () => {
    expect(classify({ pages: [], pageCount: 0, byteSize: 0 })).toEqual({
      kind: "scan",
      bank: "other",
    });
  });

  it("Itaú Unibanco => itau", () => {
    expect(
      classify(makeExtracted("Itaú Unibanco S.A. extrato bancário mensal")),
    ).toEqual({ kind: "native", bank: "itau" });
  });
});
