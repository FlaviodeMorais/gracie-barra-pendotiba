import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";
import { getMpAccessToken } from "@/lib/settings";
import { isFailedPaymentStatus, isPendingPaymentStatus } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const paymentId =
      body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

    if (!paymentId) return NextResponse.json({ received: true });

    const accessToken = await getMpAccessToken();
    if (!accessToken) return NextResponse.json({ received: true });

    const payment = await getPayment(paymentId, accessToken);
    const registrationId = payment.external_reference;
    if (!registrationId) return NextResponse.json({ received: true });

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
    });
    if (!registration) return NextResponse.json({ received: true });

    const paymentStatus = payment.status || "pending";
    const paid = paymentStatus === "approved";
    const reservationExpired = isFailedPaymentStatus(paymentStatus) ? new Date() : registration.reservationExpiresAt;

    await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: {
        paymentStatus,
        paid,
        mpPaymentId: String(payment.id),
        reservationExpiresAt: paid ? null : isPendingPaymentStatus(paymentStatus) ? registration.reservationExpiresAt : reservationExpired,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook Mercado Pago:", error);
    return NextResponse.json({ received: true });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
