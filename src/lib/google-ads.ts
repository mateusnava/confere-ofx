export const GOOGLE_ADS_ID = "AW-18438648078";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGoogleAdsPurchase(input: {
  valueCents: number;
  transactionId: string;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION;
  if (!sendTo) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: sendTo,
    value: input.valueCents / 100,
    currency: "BRL",
    transaction_id: input.transactionId,
  });
}
