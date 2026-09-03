import { describe, expect, it } from "vitest";
import {
  applyPaidPayment,
  chargeConversion,
  CREDIT_PACKS,
  evaluateCredits,
  formatCredits,
  parsePackKind,
} from "@/lib/credits";

const usedUp = {
  id: "u1",
  credits: 0,
  freeConversionUsed: true,
};

describe("CREDIT_PACKS", () => {
  it("tem os tres pacotes da spec", () => {
    expect(CREDIT_PACKS.pack_1).toEqual({
      credits: 1,
      amountCents: 490,
      label: "1 credito",
      price: "R$ 4,90",
    });
    expect(CREDIT_PACKS.pack_10).toEqual({
      credits: 10,
      amountCents: 3990,
      label: "10 creditos",
      price: "R$ 39,90",
    });
    expect(CREDIT_PACKS.pack_50).toEqual({
      credits: 50,
      amountCents: 14900,
      label: "50 creditos",
      price: "R$ 149",
    });
  });
});

describe("evaluateCredits", () => {
  it("sem user => unauthenticated", () => {
    expect(evaluateCredits(undefined)).toEqual({
      allowed: false,
      error: "unauthenticated",
    });
  });

  it("gratis intacta => allowed", () => {
    expect(
      evaluateCredits({
        id: "u1",
        credits: 0,
        freeConversionUsed: false,
      }),
    ).toEqual({ allowed: true });
  });

  it("gratis usada e 3 creditos => allowed", () => {
    expect(
      evaluateCredits({
        id: "u1",
        credits: 3,
        freeConversionUsed: true,
      }),
    ).toEqual({ allowed: true });
  });

  it("gratis usada e 0 creditos => credits_required", () => {
    expect(
      evaluateCredits({
        id: "u1",
        credits: 0,
        freeConversionUsed: true,
      }),
    ).toEqual({ allowed: false, error: "credits_required" });
  });
});

describe("parsePackKind", () => {
  it("aceita so os kinds do catalogo", () => {
    expect(parsePackKind("pack_10")).toBe("pack_10");
    expect(parsePackKind("pro")).toBeUndefined();
    expect(parsePackKind(undefined)).toBeUndefined();
  });
});

describe("formatCredits", () => {
  it("singular e plural", () => {
    expect(formatCredits(0)).toBe("0 creditos");
    expect(formatCredits(1)).toBe("1 credito");
    expect(formatCredits(7)).toBe("7 creditos");
  });
});

describe("chargeConversion", () => {
  it("user novo marca gratis e nao mexe em creditos", () => {
    const result = chargeConversion({
      id: "u1",
      credits: 5,
      freeConversionUsed: false,
    });
    expect(result).toEqual({
      ok: true,
      creditSource: "free",
      account: { id: "u1", credits: 5, freeConversionUsed: true },
    });
  });

  it("gratis usada e 3 creditos => desconta 1", () => {
    const result = chargeConversion({
      id: "u1",
      credits: 3,
      freeConversionUsed: true,
    });
    expect(result).toEqual({
      ok: true,
      creditSource: "credit",
      account: { id: "u1", credits: 2, freeConversionUsed: true },
    });
  });

  it("gratis usada e 0 creditos => credits_required", () => {
    expect(chargeConversion(usedUp)).toEqual({
      ok: false,
      error: "credits_required",
    });
  });

  it("duas cargas com 1 credito => uma passa, saldo 0", () => {
    let account = { id: "u1", credits: 1, freeConversionUsed: true };
    const first = chargeConversion(account);
    expect(first.ok).toBe(true);
    if (first.ok) account = first.account;
    const second = chargeConversion(account);
    expect(second).toEqual({ ok: false, error: "credits_required" });
    expect(account.credits).toBe(0);
  });

  it("duas cargas com gratis e 1 credito => uma gratis, uma credito", () => {
    let account = { id: "u1", credits: 1, freeConversionUsed: false };
    const first = chargeConversion(account);
    expect(first.ok && first.creditSource).toBe("free");
    if (first.ok) account = first.account;
    const second = chargeConversion(account);
    expect(second.ok && second.creditSource).toBe("credit");
    if (second.ok) account = second.account;
    expect(account).toEqual({
      id: "u1",
      credits: 0,
      freeConversionUsed: true,
    });
  });
});

describe("applyPaidPayment", () => {
  const pending = {
    id: "p1",
    userId: "u1",
    kind: "pack_10" as const,
    amountCents: 3990,
    status: "pending" as const,
    mercadoPagoId: "mp-1",
  };

  it("paid de pack_10 soma 10", () => {
    const result = applyPaidPayment(
      { id: "u1", credits: 2, freeConversionUsed: true },
      pending,
    );
    expect(result.account.credits).toBe(12);
    expect(result.payment.status).toBe("paid");
  });

  it("paid de novo no mesmo payment nao soma", () => {
    const once = applyPaidPayment(usedUp, pending);
    const twice = applyPaidPayment(once.account, once.payment);
    expect(twice.account.credits).toBe(10);
  });

  it("failed e pending nao somam", () => {
    expect(
      applyPaidPayment(usedUp, { ...pending, status: "failed" }).account
        .credits,
    ).toBe(0);
  });

  it("usa o kind gravado no payment, nao o claimed", () => {
    const result = applyPaidPayment(usedUp, pending, "pack_50");
    expect(result.account.credits).toBe(10);
  });
});
