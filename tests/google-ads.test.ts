import { afterEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_ADS_ID, trackGoogleAdsPurchase } from "@/lib/google-ads";

describe("trackGoogleAdsPurchase", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("nao dispara sem gtag", () => {
    expect(() =>
      trackGoogleAdsPurchase({ valueCents: 490, transactionId: "p1" }),
    ).not.toThrow();
  });

  it("dispara purchase na tag AW com valor e id do Pix", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });
    trackGoogleAdsPurchase({ valueCents: 490, transactionId: "p1" });
    expect(gtag).toHaveBeenCalledWith("event", "purchase", {
      send_to: GOOGLE_ADS_ID,
      value: 4.9,
      currency: "BRL",
      transaction_id: "p1",
    });
  });
});
