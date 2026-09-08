export const BLOB_ACCESS = "private" as const;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const EXT_MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export function mimeTypeForUpload(fileName: string, fileType = ""): string {
  if (ALLOWED_TYPES.has(fileType)) {
    return fileType;
  }

  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MIME[ext] ?? fileType;
}

export function blobPathnameFor(fileName: string): string {
  const mime = mimeTypeForUpload(fileName);
  const ext =
    mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg";
  const stem =
    fileName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "extrato";

  return `extratos/${stem}.${ext}`;
}
