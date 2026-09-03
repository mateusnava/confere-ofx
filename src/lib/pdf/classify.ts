import type { ExtractedPdf } from "./extract";

export type PdfKind = "native" | "scan" | "other";
export type BankId =
  | "nubank"
  | "inter"
  | "itau"
  | "bradesco"
  | "bb"
  | "santander"
  | "c6"
  | "caixa"
  | "other";

export type Classification = {
  kind: PdfKind;
  bank: BankId;
};

const BANK_KEYWORDS: Array<{ bank: BankId; keywords: string[] }> = [
  { bank: "nubank", keywords: ["nu pagamentos", "nubank"] },
  { bank: "inter", keywords: ["banco inter", "inter pagamentos"] },
  { bank: "itau", keywords: ["itaú unibanco", "itau unibanco", "itaú"] },
  { bank: "bradesco", keywords: ["bradesco"] },
  { bank: "bb", keywords: ["banco do brasil"] },
  { bank: "santander", keywords: ["santander"] },
  { bank: "c6", keywords: ["c6 bank", "c6bank"] },
  { bank: "caixa", keywords: ["caixa economica", "caixa econômica"] },
];

export function classify(extracted: ExtractedPdf): Classification {
  const fullText = extracted.pages.map((page) => page.text).join("\n").toLowerCase();

  if (!fullText.trim()) {
    return { kind: "scan", bank: "other" };
  }

  const bank =
    BANK_KEYWORDS.find(({ keywords }) =>
      keywords.some((keyword) => fullText.includes(keyword)),
    )?.bank ?? "other";

  const hasTextLayer = extracted.pages.some((page) => page.hasTextLayer);
  const kind: PdfKind = hasTextLayer ? "native" : "scan";

  if (bank === "other" && kind === "native") {
    return { kind: "other", bank: "other" };
  }

  return { kind, bank };
}

export function classifyImage(): Classification {
  return { kind: "scan", bank: "other" };
}
