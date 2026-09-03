import { del } from "@vercel/blob";
import {
  createLocalBlobUrl,
  deleteLocalFile,
  getLocalFile,
  isLocalBlobUrl,
  parseLocalFileId,
} from "./local";

export function isBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readUploadedFile(url: string): Promise<{
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

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Nao foi possivel baixar o arquivo");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get("content-type") ?? "application/octet-stream";

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
