import { describe, expect, it } from "vitest";
import {
  CREDIT_PACKS,
  evaluateCredits,
  formatCredits,
  parsePackKind,
} from "@/lib/credits";

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
