import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EventForm from "@/components/admin/EventForm";

export default async function EditEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  const initial = {
    id: event.id,
    title: event.title,
    description: event.description,
    bannerUrl: event.bannerUrl || "",
    date: event.date.toISOString().slice(0, 16),
    endDate: event.endDate ? event.endDate.toISOString().slice(0, 16) : "",
    location: event.location,
    address: event.address || "",
    status: event.status,
    registrationOpen: event.registrationOpen,
    price: String(event.price),
    pixKey: event.pixKey || "",
    pixKeyType: event.pixKeyType || "email",
    maxParticipants: event.maxParticipants ? String(event.maxParticipants) : "",
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Editar Evento</h1>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <EventForm initial={initial} />
      </div>
    </div>
  );
}
