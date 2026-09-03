import { createHmac, timingSafeEqual } from "node:crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { appBaseUrl } from "@/lib/app-url";

export type PixCharge = {
  id: string;
  qrCode: string;
  qrCodeBase64: string;
};

export type PixStatus = "pending" | "paid" | "failed";

function client() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente");
  }
  return new MercadoPagoConfig({ accessToken: token });
}

export function isMercadoPagoPaymentId(id: string): boolean {
  return /^\d+$/.test(id);
}

export function mapPixStatus(status: string | undefined | null): PixStatus {
  if (status === "approved") {
    return "paid";
  }
  if (
    status === "rejected" ||
    status === "cancelled" ||
    status === "expired" ||
    status === "refunded" ||
    status === "charged_back"
  ) {
    return "failed";
  }
  return "pending";
}

export function verifyMercadoPagoWebhookSignature(input: {
  xSignature: string | null | undefined;
  xRequestId: string | null | undefined;
  dataId: string;
  secret: string;
}): boolean {
  if (!input.xSignature || !input.xRequestId) {
    return false;
  }

  const parts: Record<string, string> = {};
  for (const part of input.xSignature.split(",")) {
    const [key, ...rest] = part.trim().split("=");
    if (!key || rest.length === 0) {
      continue;
    }
    parts[key.trim()] = rest.join("=").trim();
  }

  const ts = parts.ts;
  const hash = parts.v1;
  if (!ts || !hash) {
    return false;
  }

  const manifest = `id:${input.dataId};request-id:${input.xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", input.secret)
    .update(manifest)
    .digest("hex");

  const received = Buffer.from(hash, "utf8");
  const computed = Buffer.from(expected, "utf8");
  if (received.length !== computed.length) {
    return false;
  }
  return timingSafeEqual(received, computed);
}

export async function createPixCharge(input: {
  amountCents: number;
  description: string;
  idempotencyKey: string;
  payerEmail: string;
}): Promise<PixCharge> {
  const payment = new Payment(client());
  const created = await payment.create({
    body: {
      transaction_amount: input.amountCents / 100,
      description: input.description,
      payment_method_id: "pix",
      notification_url: `${appBaseUrl()}/api/pay/webhook`,
      payer: {
        email: input.payerEmail,
      },
    },
    requestOptions: { idempotencyKey: input.idempotencyKey },
  });

  const qr = created.point_of_interaction?.transaction_data;
  if (!created.id || !qr?.qr_code) {
    throw new Error("Pix sem QR");
  }

  return {
    id: String(created.id),
    qrCode: qr.qr_code,
    qrCodeBase64: qr.qr_code_base64 ?? "",
  };
}

export async function getPixStatus(mercadoPagoId: string): Promise<PixStatus> {
  const payment = new Payment(client());
  const current = await payment.get({ id: mercadoPagoId });
  return mapPixStatus(current.status);
}
