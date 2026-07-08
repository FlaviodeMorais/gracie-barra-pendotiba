const MP_API_URL = "https://api.mercadopago.com/v1/payments";

export type MpPixPayment = {
  id: number;
  status: string;
  qrCodeBase64: string;
  qrCode: string;
};

export async function createPixPayment(params: {
  amount: number;
  description: string;
  payerEmail: string;
  externalReference: string;
  notificationUrl?: string;
  accessToken: string;
}): Promise<MpPixPayment> {
  const { accessToken } = params;

  const response = await fetch(MP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": params.externalReference,
    },
    body: JSON.stringify({
      transaction_amount: Number(params.amount.toFixed(2)),
      description: params.description,
      payment_method_id: "pix",
      external_reference: params.externalReference,
      notification_url: params.notificationUrl,
      payer: { email: params.payerEmail },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Erro ao criar pagamento PIX no Mercado Pago");
  }

  return {
    id: data.id,
    status: data.status,
    qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64 || "",
    qrCode: data.point_of_interaction?.transaction_data?.qr_code || "",
  };
}

export async function getPayment(paymentId: string | number, accessToken: string) {
  const response = await fetch(`${MP_API_URL}/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Erro ao consultar pagamento no Mercado Pago");
  return response.json();
}
