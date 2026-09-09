import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  getDb: mocks.getDb,
}));

import { GET } from "@/app/api/export/route";

const statement = {
  bank: "nubank" as const,
  kind: "conta" as const,
  openingBalanceCents: 10000,
  closingBalanceCents: 15000,
  transactions: [
    { date: "2026-01-01", description: "Pix", amountCents: 5000 },
  ],
};

const balanced = {
  ok: true,
  sumCents: 5000,
  expectedClosingCents: 15000,
  deltaCents: 0,
};

const unbalanced = {
  ok: false,
  sumCents: 5000,
  expectedClosingCents: 15000,
  deltaCents: 87999,
};

function dbWithSession(session: unknown) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (session ? [session] : []),
        }),
      }),
    }),
  };
}

function exportRequest(query: string) {
  return new Request(`http://localhost/api/export?${query}`);
}

describe("GET /api/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sem sessionId retorna 400", async () => {
    const response = await GET(exportRequest("format=csv"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Sessao obrigatoria" });
  });

  it("sessao inexistente retorna 404", async () => {
    mocks.getDb.mockReturnValue(dbWithSession(null));

    const response = await GET(exportRequest("sessionId=missing"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Sessao expirada" });
  });

  it("sessao expirada retorna 404", async () => {
    mocks.getDb.mockReturnValue(
      dbWithSession({
        id: "sess-1",
        expiresAt: new Date(Date.now() - 1000),
        statement,
        balance: balanced,
      }),
    );

    const response = await GET(exportRequest("sessionId=sess-1&format=csv"));

    expect(response.status).toBe(404);
  });

  it("OFX com saldo aberto sem ack retorna 422", async () => {
    mocks.getDb.mockReturnValue(
      dbWithSession({
        id: "sess-1",
        expiresAt: new Date(Date.now() + 60_000),
        statement,
        balance: unbalanced,
      }),
    );

    const response = await GET(exportRequest("sessionId=sess-1&format=ofx"));

    expect(response.status).toBe(422);
    expect((await response.json()).error).toMatch(/confirmacao/);
  });

  it("OFX com ack baixa mesmo com saldo aberto", async () => {
    mocks.getDb.mockReturnValue(
      dbWithSession({
        id: "sess-1",
        expiresAt: new Date(Date.now() + 60_000),
        statement,
        balance: unbalanced,
      }),
    );

    const response = await GET(
      exportRequest("sessionId=sess-1&format=ofx&ack=1"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/x-ofx");
    expect(await response.text()).toContain("<TRNAMT>50.00</TRNAMT>");
  });

  it("CSV baixa o extrato", async () => {
    mocks.getDb.mockReturnValue(
      dbWithSession({
        id: "sess-1",
        expiresAt: new Date(Date.now() + 60_000),
        statement,
        balance: balanced,
      }),
    );

    const response = await GET(exportRequest("sessionId=sess-1&format=csv"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(await response.text()).toContain("data,descricao,valor_centavos");
  });
});
