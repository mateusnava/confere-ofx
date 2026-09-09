import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  getPixStatus: vi.fn(),
  creditPaidPayment: vi.fn(),
  markPaymentFailed: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  getDb: mocks.getDb,
}));

vi.mock("@/lib/credits", () => ({
  creditPaidPayment: mocks.creditPaidPayment,
  markPaymentFailed: mocks.markPaymentFailed,
}));

vi.mock("@/lib/mp", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/mp")>();
  return {
    ...actual,
    getPixStatus: mocks.getPixStatus,
  };
});

import { POST } from "@/app/api/pay/webhook/route";

const secret = "whsec-test";
const dataId = "987654321";
const xRequestId = "req-1";
const ts = "1704908010";
const hash = createHmac("sha256", secret)
  .update(`id:${dataId};request-id:${xRequestId};ts:${ts};`)
  .digest("hex");

function signedHeaders() {
  return {
    "content-type": "application/json",
    "x-signature": `ts=${ts},v1=${hash}`,
    "x-request-id": xRequestId,
  };
}

function webhookRequest(body: unknown, headers?: HeadersInit, url?: string) {
  return new Request(url ?? "http://localhost/api/pay/webhook", {
    method: "POST",
    headers: headers ?? { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/pay/webhook", () => {
  const previousSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERCADOPAGO_WEBHOOK_SECRET = secret;
    mocks.getDb.mockReturnValue({});
    mocks.creditPaidPayment.mockResolvedValue(undefined);
    mocks.markPaymentFailed.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (previousSecret === undefined) {
      delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
    } else {
      process.env.MERCADOPAGO_WEBHOOK_SECRET = previousSecret;
    }
  });

  it("id invalido retorna 400", async () => {
    const response = await POST(
      webhookRequest({ data: { id: "https://evil.test/1" } }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid id" });
    expect(mocks.getPixStatus).not.toHaveBeenCalled();
  });

  it("assinatura errada retorna 401", async () => {
    const response = await POST(
      webhookRequest(
        { data: { id: dataId } },
        {
          "content-type": "application/json",
          "x-signature": `ts=${ts},v1=${"0".repeat(64)}`,
          "x-request-id": xRequestId,
        },
      ),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
    expect(mocks.creditPaidPayment).not.toHaveBeenCalled();
  });

  it("pagamento aprovado credita o pacote", async () => {
    mocks.getPixStatus.mockResolvedValue("paid");

    const response = await POST(
      webhookRequest({ data: { id: dataId } }, signedHeaders()),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mocks.creditPaidPayment).toHaveBeenCalledOnce();
    expect(mocks.markPaymentFailed).not.toHaveBeenCalled();
  });

  it("pagamento recusado marca failed", async () => {
    mocks.getPixStatus.mockResolvedValue("failed");

    const response = await POST(
      webhookRequest({ data: { id: dataId } }, signedHeaders()),
    );

    expect(response.status).toBe(200);
    expect(mocks.markPaymentFailed).toHaveBeenCalledOnce();
    expect(mocks.creditPaidPayment).not.toHaveBeenCalled();
  });

  it("aceita data.id na query", async () => {
    mocks.getPixStatus.mockResolvedValue("pending");

    const response = await POST(
      webhookRequest(
        {},
        signedHeaders(),
        `http://localhost/api/pay/webhook?data.id=${dataId}`,
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.getPixStatus).toHaveBeenCalledWith(dataId);
    expect(mocks.creditPaidPayment).not.toHaveBeenCalled();
    expect(mocks.markPaymentFailed).not.toHaveBeenCalled();
  });
});
