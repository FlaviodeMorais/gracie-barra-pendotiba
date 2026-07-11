import { prisma } from "./prisma";
import { isPendingPaymentStatus, isFailedPaymentStatus } from "./payments";

// Confirma um pagamento no banco a partir dos dados retornados pelo MP.
// Idempotente: se já estiver paid=true, retorna sem reprocessar.
export async function confirmarPagamento(
  registrationId: string,
  paymentStatus: string,
  mpPaymentId: string
): Promise<{ ok: boolean; jaConfirmado?: boolean }> {
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    select: { paid: true, paymentStatus: true, reservationExpiresAt: true },
  });

  if (!registration) return { ok: false };
  if (registration.paid) return { ok: true, jaConfirmado: true };

  const paid = paymentStatus === "approved";
  const reservationExpired = isFailedPaymentStatus(paymentStatus)
    ? new Date()
    : registration.reservationExpiresAt;

  await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: {
      paymentStatus,
      paid,
      mpPaymentId,
      reservationExpiresAt: paid
        ? null
        : isPendingPaymentStatus(paymentStatus)
        ? registration.reservationExpiresAt
        : reservationExpired,
    },
  });

  return { ok: true };
}
