export type ExtractedPage = {
  pageIndex: number;
  text: string;
  hasTextLayer: boolean;
};

export type ExtractedPdf = {
  pages: ExtractedPage[];
  pageCount: number;
  byteSize: number;
};

export class PasswordRequiredError extends Error {
  constructor() {
    super("PASSWORD_REQUIRED");
    this.name = "PasswordRequiredError";
  }
}

export class PdfValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfValidationError";
  }
}

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_PAGES = 50;
const MIN_TEXT_CHARS = 20;

export async function extractPdf(
  buffer: Buffer,
  password?: string,
): Promise<ExtractedPdf> {
  if (buffer.byteLength > MAX_BYTES) {
    throw new PdfValidationError("FILE_TOO_LARGE");
  }

  const { extractText, getDocumentProxy } = await import("unpdf");
  let pdf;

  try {
    pdf = await getDocumentProxy(new Uint8Array(buffer), { password });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("password")) {
      throw new PasswordRequiredError();
    }
    throw error;
  }

  if (pdf.numPages > MAX_PAGES) {
    throw new PdfValidationError("TOO_MANY_PAGES");
  }

  const { text } = await extractText(pdf, { mergePages: false });
  const pageTexts = Array.isArray(text) ? text : [text];

  const pages = pageTexts.map((pageText, pageIndex) => {
    const normalized = pageText.trim();
    return {
      pageIndex,
      text: normalized,
      hasTextLayer: normalized.length >= MIN_TEXT_CHARS,
    };
  });

  return {
    pages,
    pageCount: pdf.numPages,
    byteSize: buffer.byteLength,
  };
}

export function isImageMime(mimeType: string): boolean {
  return mimeType === "image/jpeg" || mimeType === "image/png";
}

export function isPdfMime(mimeType: string): boolean {
  return mimeType === "application/pdf";
}
