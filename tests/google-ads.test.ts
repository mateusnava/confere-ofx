import { afterEach, describe, expect, it, vi } from "vitest";
import { trackGoogleAdsPurchase } from "@/lib/google-ads";

describe("trackGoogleAdsPurchase", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION;
  });

  it("nao dispara sem gtag", () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION = "AW-18438648078/abc";
    expect(() =>
      trackGoogleAdsPurchase({ valueCents: 490, transactionId: "p1" }),
    ).not.toThrow();
  });

  it("nao dispara sem o send_to da conversao", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });
    trackGoogleAdsPurchase({ valueCents: 490, transactionId: "p1" });
    expect(gtag).not.toHaveBeenCalled();
  });

  it("envia conversao com valor e id do Pix", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION = "AW-18438648078/abc";
    trackGoogleAdsPurchase({ valueCents: 490, transactionId: "p1" });
    expect(gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: "AW-18438648078/abc",
      value: 4.9,
      currency: "BRL",
      transaction_id: "p1",
    });
  });
});
