import { del, get } from "@vercel/blob";
import {
  createLocalBlobUrl,
  deleteLocalFile,
  getLocalFile,
  isLocalBlobUrl,
  parseLocalFileId,
} from "./local";
import { BLOB_ACCESS } from "./upload";

export function isBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readUploadedFile(
  url: string,
  options: { getBlob?: typeof get } = {},
): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const localId = parseLocalFileId(url);
  if (localId) {
    const file = getLocalFile(localId);
    if (!file) {
      throw new Error("Arquivo local expirado ou nao encontrado");
    }

    return {
      buffer: file.buffer,
      mimeType: file.mimeType,
    };
  }

  const getBlob = options.getBlob ?? get;
  const result = await getBlob(url, { access: BLOB_ACCESS });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Nao foi possivel baixar o arquivo");
  }

  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
  const mimeType =
    result.blob.contentType ??
    result.headers.get("content-type") ??
    "application/octet-stream";

  return { buffer, mimeType };
}

export async function deleteUploadedFile(url: string): Promise<void> {
  const localId = parseLocalFileId(url);
  if (localId) {
    deleteLocalFile(localId);
    return;
  }

  if (isLocalBlobUrl(url)) {
    return;
  }

  await del(url);
}

export { createLocalBlobUrl, isLocalBlobUrl, storeLocalFile } from "./local";
export { BLOB_ACCESS, blobPathnameFor, mimeTypeForUpload } from "./upload";
