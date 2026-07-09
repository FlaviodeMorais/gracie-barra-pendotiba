import { prisma } from "@/lib/prisma";
import ParticipantsTable from "@/components/admin/ParticipantsTable";
import { ACTIVE_PENDING_PAYMENT_STATUSES, isReservationActive } from "@/lib/payments";

export const revalidate = 0;

export default async function ParticipantesPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;
  const now = new Date();

  await prisma.eventRegistration.updateMany({
    where: {
      ...(eventId ? { eventId } : {}),
      paid: false,
      paymentStatus: { in: Array.from(ACTIVE_PENDING_PAYMENT_STATUSES) },
      reservationExpiresAt: { lte: now },
    },
    data: {
      paymentStatus: "expired",
      reservationExpiresAt: null,
    },
  });

  const [events, registrations] = await Promise.all([
    prisma.event.findMany({ orderBy: { date: "desc" }, select: { id: true, title: true, date: true } }),
    prisma.eventRegistration.findMany({
      where: eventId ? { eventId } : {},
      orderBy: { createdAt: "desc" },
      include: { event: { select: { title: true, price: true } } },
    }),
  ]);

  const stats = {
    total: registrations.length,
    paid: registrations.filter((registration) => registration.paid).length,
    pending: registrations.filter((registration) => isReservationActive(registration, now)).length,
    checkedIn: registrations.filter((registration) => registration.checkedIn).length,
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Participantes</h1>
      <ParticipantsTable
        registrations={registrations.map((registration) => ({
          ...registration,
          createdAt: registration.createdAt.toISOString(),
          updatedAt: registration.updatedAt.toISOString(),
          reservationExpiresAt: registration.reservationExpiresAt?.toISOString() || null,
        }))}
        events={events.map((event) => ({ ...event, date: event.date.toISOString() }))}
        stats={stats}
        selectedEventId={eventId || ""}
      />
    </div>
  );
}
