type LocalFile = {
  buffer: Buffer;
  mimeType: string;
  expiresAt: number;
};

const store = new Map<string, LocalFile>();

export function storeLocalFile(
  buffer: Buffer,
  mimeType: string,
  ttlMs = 60_000,
): string {
  const id = crypto.randomUUID();
  store.set(id, {
    buffer,
    mimeType,
    expiresAt: Date.now() + ttlMs,
  });
  return id;
}

export function getLocalFile(id: string): LocalFile | null {
  const file = store.get(id);
  if (!file) {
    return null;
  }

  if (file.expiresAt < Date.now()) {
    store.delete(id);
    return null;
  }

  return file;
}

export function deleteLocalFile(id: string): void {
  store.delete(id);
}

export function parseLocalFileId(url: string): string | null {
  const match = url.match(/\/api\/blob\/local\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export function isLocalBlobUrl(url: string): boolean {
  return parseLocalFileId(url) !== null;
}

export function purgeExpiredLocalFiles(): number {
  const now = Date.now();
  let purged = 0;

  for (const [id, file] of store.entries()) {
    if (file.expiresAt < now) {
      store.delete(id);
      purged += 1;
    }
  }

  return purged;
}

export function createLocalBlobUrl(request: Request, id: string): string {
  const origin = new URL(request.url).origin;
  return `${origin}/api/blob/local/${id}`;
}
