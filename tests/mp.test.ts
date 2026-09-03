import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { resolveAppBaseUrl } from "@/lib/app-url";
import {
  isMercadoPagoPaymentId,
  mapPixStatus,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mp";

describe("isMercadoPagoPaymentId", () => {
  it("aceita so id numerico", () => {
    expect(isMercadoPagoPaymentId("123456789")).toBe(true);
    expect(isMercadoPagoPaymentId("0")).toBe(true);
  });

  it("rejeita vazio, texto e path", () => {
    expect(isMercadoPagoPaymentId("")).toBe(false);
    expect(isMercadoPagoPaymentId("12e3")).toBe(false);
    expect(isMercadoPagoPaymentId("-1")).toBe(false);
    expect(isMercadoPagoPaymentId("https://evil.test/1")).toBe(false);
  });
});

describe("mapPixStatus", () => {
  it("mapeia approved para paid", () => {
    expect(mapPixStatus("approved")).toBe("paid");
  });

  it("mapeia falha e estorno para failed", () => {
    expect(mapPixStatus("rejected")).toBe("failed");
    expect(mapPixStatus("cancelled")).toBe("failed");
    expect(mapPixStatus("expired")).toBe("failed");
    expect(mapPixStatus("refunded")).toBe("failed");
    expect(mapPixStatus("charged_back")).toBe("failed");
  });

  it("qualquer outro status fica pending", () => {
    expect(mapPixStatus("pending")).toBe("pending");
    expect(mapPixStatus("in_process")).toBe("pending");
    expect(mapPixStatus(undefined)).toBe("pending");
  });
});

describe("verifyMercadoPagoWebhookSignature", () => {
  const secret = "whsec-test";
  const dataId = "987654321";
  const xRequestId = "req-1";
  const ts = "1704908010";
  const hash = createHmac("sha256", secret)
    .update(`id:${dataId};request-id:${xRequestId};ts:${ts};`)
    .digest("hex");

  it("aceita HMAC x-signature do Mercado Pago", () => {
    expect(
      verifyMercadoPagoWebhookSignature({
        xSignature: `ts=${ts},v1=${hash}`,
        xRequestId,
        dataId,
        secret,
      }),
    ).toBe(true);
  });

  it("rejeita assinatura errada ou ausente", () => {
    expect(
      verifyMercadoPagoWebhookSignature({
        xSignature: `ts=${ts},v1=${"0".repeat(64)}`,
        xRequestId,
        dataId,
        secret,
      }),
    ).toBe(false);
    expect(
      verifyMercadoPagoWebhookSignature({
        xSignature: null,
        xRequestId,
        dataId,
        secret,
      }),
    ).toBe(false);
  });
});

describe("resolveAppBaseUrl", () => {
  it("usa APP_URL quando existe", () => {
    expect(resolveAppBaseUrl("https://confere.ofx/", "production")).toBe(
      "https://confere.ofx",
    );
  });

  it("em producao falha sem APP_URL", () => {
    expect(() => resolveAppBaseUrl(undefined, "production")).toThrow(
      "APP_URL ausente",
    );
  });

  it("em dev cai para localhost", () => {
    expect(resolveAppBaseUrl(undefined, "development")).toBe(
      "http://localhost:3000",
    );
  });
});
