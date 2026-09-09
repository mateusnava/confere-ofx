import { describe, expect, it, vi, beforeEach } from "vitest";
import { PasswordRequiredError } from "@/lib/pdf/extract";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getUserByEmail: vi.fn(),
  readUploadedFile: vi.fn(),
  deleteUploadedFile: vi.fn(),
  extractPdf: vi.fn(),
  convertExtracted: vi.fn(),
  persistConversion: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/quota", () => ({
  getUserByEmail: mocks.getUserByEmail,
}));

vi.mock("@/lib/storage", () => ({
  readUploadedFile: mocks.readUploadedFile,
  deleteUploadedFile: mocks.deleteUploadedFile,
}));

vi.mock("@/lib/pdf/extract", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/pdf/extract")>();
  return {
    ...actual,
    extractPdf: mocks.extractPdf,
  };
});

vi.mock("@/lib/convert", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/convert")>();
  return {
    ...actual,
    convertExtracted: mocks.convertExtracted,
  };
});

vi.mock("@/lib/credits", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/credits")>();
  return {
    ...actual,
    persistConversion: mocks.persistConversion,
  };
});

vi.mock("@/lib/db/client", () => ({
  getDb: mocks.getDb,
}));

import { POST } from "@/app/api/convert/route";

const paidUser = {
  id: "u1",
  email: "a@b.com",
  credits: 3,
  freeConversionUsed: true,
};

const statement = {
  bank: "nubank" as const,
  kind: "conta" as const,
  openingBalanceCents: 10000,
  closingBalanceCents: 15000,
  transactions: [
    { date: "2026-01-01", description: "Pix", amountCents: 5000 },
  ],
};

function convertRequest(body: unknown) {
  return new Request("http://localhost/api/convert", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/convert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDb.mockReturnValue({});
    mocks.deleteUploadedFile.mockResolvedValue(undefined);
  });

  it("sem login retorna 401", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(
      convertRequest({ blobUrl: "blob://x", mimeType: "image/jpeg" }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthenticated" });
  });

  it("sem creditos retorna 402", async () => {
    mocks.auth.mockResolvedValue({ user: { email: paidUser.email } });
    mocks.getUserByEmail.mockResolvedValue({
      ...paidUser,
      credits: 0,
    });

    const response = await POST(
      convertRequest({ blobUrl: "blob://x", mimeType: "image/jpeg" }),
    );

    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({ error: "credits_required" });
    expect(mocks.readUploadedFile).not.toHaveBeenCalled();
  });

  it("mime invalido retorna 400", async () => {
    mocks.auth.mockResolvedValue({ user: { email: paidUser.email } });
    mocks.getUserByEmail.mockResolvedValue(paidUser);
    mocks.readUploadedFile.mockResolvedValue({
      buffer: Buffer.from("zip"),
    });

    const response = await POST(
      convertRequest({ blobUrl: "blob://x", mimeType: "application/zip" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Tipo de arquivo invalido" });
  });

  it("PDF com senha retorna 400", async () => {
    mocks.auth.mockResolvedValue({ user: { email: paidUser.email } });
    mocks.getUserByEmail.mockResolvedValue(paidUser);
    mocks.readUploadedFile.mockResolvedValue({
      buffer: Buffer.from("%PDF"),
    });
    mocks.extractPdf.mockRejectedValue(new PasswordRequiredError());

    const response = await POST(
      convertRequest({
        blobUrl: "blob://x",
        mimeType: "application/pdf",
      }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/senha/i);
  });

  it("persist sem credito retorna 402", async () => {
    mocks.auth.mockResolvedValue({ user: { email: paidUser.email } });
    mocks.getUserByEmail.mockResolvedValue(paidUser);
    mocks.readUploadedFile.mockResolvedValue({
      buffer: Buffer.from("foto"),
    });
    mocks.convertExtracted.mockResolvedValue({
      statement,
      balance: { ok: true, sumCents: 5000 },
    });
    mocks.persistConversion.mockResolvedValue({
      ok: false,
      error: "credits_required",
    });

    const response = await POST(
      convertRequest({ blobUrl: "blob://x", mimeType: "image/jpeg" }),
    );

    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({ error: "credits_required" });
  });

  it("converte imagem e devolve sessionId", async () => {
    mocks.auth.mockResolvedValue({ user: { email: paidUser.email } });
    mocks.getUserByEmail.mockResolvedValue(paidUser);
    mocks.readUploadedFile.mockResolvedValue({
      buffer: Buffer.from("foto"),
    });
    mocks.convertExtracted.mockResolvedValue({
      statement,
      balance: { ok: true, sumCents: 5000 },
    });
    mocks.persistConversion.mockResolvedValue({
      ok: true,
      creditSource: "credit",
      session: { id: "sess-1" },
    });

    const response = await POST(
      convertRequest({ blobUrl: "blob://x", mimeType: "image/jpeg" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sessionId).toBe("sess-1");
    expect(body.statement.transactions).toHaveLength(1);
    expect(body.balance.ok).toBe(true);
    expect(mocks.deleteUploadedFile).toHaveBeenCalledWith("blob://x");
  });

  it("falha antes de persistir avisa que nada foi cobrado", async () => {
    mocks.auth.mockResolvedValue({ user: { email: paidUser.email } });
    mocks.getUserByEmail.mockResolvedValue(paidUser);
    mocks.readUploadedFile.mockResolvedValue({
      buffer: Buffer.from("foto"),
    });
    mocks.convertExtracted.mockRejectedValue(new Error("llm down"));

    const response = await POST(
      convertRequest({ blobUrl: "blob://x", mimeType: "image/jpeg" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toMatch(/Nada foi cobrado/);
    expect(mocks.persistConversion).not.toHaveBeenCalled();
  });
});
