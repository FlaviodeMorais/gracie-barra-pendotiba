import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldExpireReservation, isPendingPaymentStatus } from "@/lib/payments";
import { getMpAccessToken } from "@/lib/settings";
import { getPayment } from "@/lib/mercadopago";
import { confirmarPagamento } from "@/lib/confirmar-pagamento";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let registration = await prisma.eventRegistration.findUnique({
    where: { id },
    select: {
      paid: true,
      paymentStatus: true,
      reservationExpiresAt: true,
      mpPaymentId: true,
      name: true,
      adults: true,
      children: true,
      totalAmount: true,
    },
  });
  if (!registration) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Expira reservas vencidas
  if (shouldExpireReservation(registration)) {
    registration = await prisma.eventRegistration.update({
      where: { id },
      data: { paymentStatus: "expired", reservationExpiresAt: null },
      select: {
        paid: true,
        paymentStatus: true,
        reservationExpiresAt: true,
        mpPaymentId: true,
        name: true,
        adults: true,
        children: true,
        totalAmount: true,
      },
    });
  }

  // Se ainda pendente e tem mp_payment_id, consulta o MP diretamente
  if (!registration.paid && isPendingPaymentStatus(registration.paymentStatus) && registration.mpPaymentId) {
    try {
      const accessToken = await getMpAccessToken();
      if (accessToken) {
        const payment = await getPayment(registration.mpPaymentId, accessToken);
        if (payment.status && payment.status !== registration.paymentStatus) {
          await confirmarPagamento(id, payment.status, String(payment.id));
          // Relê do banco após confirmação
          const updated = await prisma.eventRegistration.findUnique({
            where: { id },
            select: {
              paid: true,
              paymentStatus: true,
              reservationExpiresAt: true,
              mpPaymentId: true,
              name: true,
              adults: true,
              children: true,
              totalAmount: true,
            },
          });
          if (updated) registration = updated;
        }
      }
    } catch { /* MP indisponível — retorna status do banco */ }
  }

  return NextResponse.json(registration);
}
