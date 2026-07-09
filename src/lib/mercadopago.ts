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
    const error = new Error(data.message || "Erro ao criar pagamento PIX no Mercado Pago") as Error & {
      status?: number;
      cause?: unknown;
    };
    error.status = response.status;
    error.cause = data;
    throw error;
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

const MP_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";

export type MpPreference = {
  id: string;
  initPoint: string;
};

export async function createPreference(params: {
  title: string;
  amount: number;
  payerEmail: string;
  externalReference: string;
  notificationUrl?: string;
  backUrl?: string;
  accessToken: string;
}): Promise<MpPreference> {
  const response = await fetch(MP_PREFERENCES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: params.title,
          quantity: 1,
          unit_price: Number(params.amount.toFixed(2)),
          currency_id: "BRL",
        },
      ],
      payer: { email: params.payerEmail },
      external_reference: params.externalReference,
      notification_url: params.notificationUrl,
      back_urls: params.backUrl
        ? { success: params.backUrl, pending: params.backUrl, failure: params.backUrl }
        : undefined,
      auto_return: params.backUrl ? "approved" : undefined,
      payment_methods: {
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "debit_card" },
          { id: "ticket" },
          { id: "atm" },
        ],
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || "Erro ao criar preferência de pagamento no Mercado Pago") as Error & {
      status?: number;
      cause?: unknown;
    };
    error.status = response.status;
    error.cause = data;
    throw error;
  }

  return { id: data.id, initPoint: data.init_point };
}
