export const RESERVATION_WINDOW_MINUTES = 30;

export const ACTIVE_PENDING_PAYMENT_STATUSES = new Set([
  "pending",
  "in_process",
  "manual_pending",
]);

export const FAILED_PAYMENT_STATUSES = new Set([
  "cancelled",
  "rejected",
  "refunded",
  "charged_back",
  "expired",
]);

export function getReservationExpiration(from = new Date()) {
  return new Date(from.getTime() + RESERVATION_WINDOW_MINUTES * 60 * 1000);
}

export function isPendingPaymentStatus(status: string) {
  return ACTIVE_PENDING_PAYMENT_STATUSES.has(status);
}

export function isFailedPaymentStatus(status: string) {
  return FAILED_PAYMENT_STATUSES.has(status);
}

export function isReservationActive(registration: {
  paid: boolean;
  paymentStatus: string;
  reservationExpiresAt: Date | string | null;
}, now = new Date()) {
  if (registration.paid || !isPendingPaymentStatus(registration.paymentStatus)) return false;
  if (!registration.reservationExpiresAt) return false;
  return new Date(registration.reservationExpiresAt) > now;
}

export function shouldExpireReservation(registration: {
  paid: boolean;
  paymentStatus: string;
  reservationExpiresAt: Date | string | null;
}, now = new Date()) {
  if (registration.paid || !isPendingPaymentStatus(registration.paymentStatus)) return false;
  if (!registration.reservationExpiresAt) return false;
  return new Date(registration.reservationExpiresAt) <= now;
}

export function getPaymentStatusLabel(status: string) {
  switch (status) {
    case "approved":
    case "paid":
    case "not_required":
      return "Pago";
    case "manual_pending":
      return "Aguardando conferência";
    case "pending":
    case "in_process":
      return "Aguardando pagamento";
    case "expired":
      return "Reserva expirada";
    case "cancelled":
      return "Cancelado";
    case "rejected":
      return "Recusado";
    case "refunded":
      return "Estornado";
    case "charged_back":
      return "Chargeback";
    default:
      return status;
  }
}
