import { prisma } from "@/lib/prisma";
import ParticipantsTable from "@/components/admin/ParticipantsTable";

export const revalidate = 0;

export default async function ParticipantesPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;

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
    paid: registrations.filter((r) => r.paid).length,
    pending: registrations.filter((r) => !r.paid).length,
    checkedIn: registrations.filter((r) => r.checkedIn).length,
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Participantes</h1>
      <ParticipantsTable
        registrations={registrations.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }))}
        events={events.map((e) => ({ ...e, date: e.date.toISOString() }))}
        stats={stats}
        selectedEventId={eventId || ""}
      />
    </div>
  );
}
