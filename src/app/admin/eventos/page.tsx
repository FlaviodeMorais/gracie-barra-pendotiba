import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, formatCurrency, eventStatusLabel } from "@/lib/utils";
import EventActions from "@/components/admin/EventActions";

export const revalidate = 0;

export default async function AdminEventos() {
  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Eventos</h1>
        <Link href="/admin/eventos/novo" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
          + Novo Evento
        </Link>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const status = eventStatusLabel(event.status);
          return (
            <div key={event.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-bold">{event.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.color}`}>{status.label}</span>
                    {!event.registrationOpen && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">Inscrições fechadas</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📅 {formatDate(event.date)}</span>
                    <span>📍 {event.location}</span>
                    {event.price > 0 && <span>💰 {formatCurrency(event.price)}</span>}
                    <span className="text-blue-400 font-semibold">👥 {event._count.registrations} inscritos</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/eventos/${event.id}`} target="_blank"
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                    Ver página
                  </Link>
                  <Link href={`/admin/participantes?eventId=${event.id}`}
                    className="bg-blue-900/50 hover:bg-blue-800/50 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    Participantes
                  </Link>
                  <Link href={`/admin/eventos/${event.id}`}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                    Editar
                  </Link>
                  <EventActions eventId={event.id} />
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🏆</p>
            <p>Nenhum evento cadastrado</p>
            <Link href="/admin/eventos/novo" className="mt-4 inline-block text-red-400 hover:underline text-sm">Criar primeiro evento</Link>
          </div>
        )}
      </div>
    </div>
  );
}
