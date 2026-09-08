import { SESSION_EXPIRED_COPY } from "@/lib/session";

export type ExportFormat = "ofx" | "csv" | "xlsx";

export const EXPORT_FILENAMES: Record<ExportFormat, string> = {
  ofx: "extrato.ofx",
  csv: "extrato.csv",
  xlsx: "extrato.xlsx",
};

export function exportUrl(
  sessionId: string,
  format: ExportFormat,
  acknowledgeUnbalanced = false,
): string {
  const params = new URLSearchParams({ sessionId, format });
  if (format === "ofx" && acknowledgeUnbalanced) {
    params.set("ack", "1");
  }
  return `/api/export?${params.toString()}`;
}

export function filenameFromDisposition(
  header: string | null,
  fallback: string,
): string {
  const match = /filename="([^"]+)"/.exec(header ?? "");
  return match?.[1] ?? fallback;
}

export function exportErrorMessage(
  status: number,
  body: { error?: string } | null,
): string {
  if (status === 404) {
    return SESSION_EXPIRED_COPY;
  }
  return body?.error ?? "Nao foi possivel baixar";
}
