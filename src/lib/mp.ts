import { MercadoPagoConfig, Payment } from "mercadopago";

export type PixCharge = {
  id: string;
  qrCode: string;
  qrCodeBase64: string;
};

function client() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente");
  }
  return new MercadoPagoConfig({ accessToken: token });
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

export async function getPixStatus(
  mercadoPagoId: string,
): Promise<"pending" | "paid" | "failed"> {
  const payment = new Payment(client());
  const current = await payment.get({ id: mercadoPagoId });
  if (current.status === "approved") {
    return "paid";
  }
  if (
    current.status === "rejected" ||
    current.status === "cancelled" ||
    current.status === "expired"
  ) {
    return "failed";
  }
  return "pending";
}
