import { MercadoPagoConfig, Payment } from "mercadopago";

export type MpPixPayment = {
  id: number;
  status: string;
  qrCodeBase64: string;
  qrCode: string;
};

function paymentClient(accessToken: string): Payment {
  return new Payment(new MercadoPagoConfig({ accessToken }));
}

export async function createPixPayment(params: {
  amount: number;
  description: string;
  payerEmail: string;
  externalReference: string;
  notificationUrl?: string;
  accessToken: string;
}): Promise<MpPixPayment> {
  try {
    const payment = await paymentClient(params.accessToken).create({
      body: {
        transaction_amount: Number(params.amount.toFixed(2)),
        description: params.description,
        payment_method_id: "pix",
        external_reference: params.externalReference,
        notification_url: params.notificationUrl,
        payer: { email: params.payerEmail },
      },
      requestOptions: { idempotencyKey: params.externalReference },
    });

    return {
      id: payment.id!,
      status: payment.status!,
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || "",
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code || "",
    };
  } catch (error) {
    const mpError = error as { status?: number; message?: string; cause?: unknown };
    const wrapped = new Error(mpError?.message || "Erro ao criar pagamento PIX no Mercado Pago") as Error & {
      status?: number;
      cause?: unknown;
    };
    wrapped.status = mpError?.status;
    wrapped.cause = mpError?.cause;
    throw wrapped;
  }
}

export async function getPayment(paymentId: string | number, accessToken: string) {
  try {
    const payment = await paymentClient(accessToken).get({ id: paymentId });
    return {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference ?? null,
      transaction_amount: payment.transaction_amount ?? 0,
    };
  } catch {
    throw new Error("Erro ao consultar pagamento no Mercado Pago");
  }
}
