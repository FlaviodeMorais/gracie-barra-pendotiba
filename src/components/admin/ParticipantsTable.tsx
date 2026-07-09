"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getPaymentStatusLabel } from "@/lib/payments";

type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  academy: string | null;
  paid: boolean;
  paymentStatus: string;
  checkedIn: boolean;
  notes: string | null;
  pixTxId: string | null;
  createdAt: string;
  reservationExpiresAt?: string | null;
  eventId: string;
  event: { title: string; price: number };
};

type Event = { id: string; title: string; date: string };

type Stats = { total: number; paid: number; pending: number; checkedIn: number };

function paymentBadgeClasses(status: string, paid: boolean) {
  if (paid || status === "paid" || status === "approved" || status === "not_required") {
    return "bg-green-900/50 text-green-400 hover:bg-green-900";
  }
  if (status === "manual_pending") {
    return "bg-orange-900/50 text-orange-300 hover:bg-orange-900";
  }
  if (status === "expired" || status === "cancelled" || status === "rejected") {
    return "bg-red-900/40 text-red-300 hover:bg-red-900";
  }
  return "bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900";
}

export default function ParticipantsTable({
  registrations,
  events,
  stats,
  selectedEventId,
}: {
  registrations: Registration[];
  events: Event[];
  stats: Stats;
  selectedEventId: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState(selectedEventId);
  const [search, setSearch] = useState("");

  const filtered = registrations
    .filter((registration) => !filter || registration.eventId === filter)
    .filter((registration) =>
      !search || registration.name.toLowerCase().includes(search.toLowerCase()) ||
      registration.phone.includes(search)
    );

  const handlePayment = async (id: string, paid: boolean) => {
    await fetch(`/api/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paid,
        paymentStatus: paid ? "paid" : "manual_pending",
        reservationExpiresAt: null,
      }),
    });
    router.refresh();
  };

  const handleCheckIn = async (id: string, checkedIn: boolean) => {
    await fetch(`/api/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkedIn }),
    });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta inscrição?")) return;
    await fetch(`/api/registrations/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Pagos", value: stats.paid, color: "text-green-400" },
          { label: "Pendentes", value: stats.pending, color: "text-yellow-400" },
          { label: "Check-in", value: stats.checkedIn, color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filter}
          onChange={(changeEvent) => {
            setFilter(changeEvent.target.value);
            const url = changeEvent.target.value ? `/admin/participantes?eventId=${changeEvent.target.value}` : "/admin/participantes";
            router.push(url);
          }}
          className="bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
        >
          <option value="">Todos os eventos</option>
          {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
        </select>
        <input
          value={search}
          onChange={(changeEvent) => setSearch(changeEvent.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="flex-1 min-w-48 bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Contato</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Evento</th>
                <th className="px-4 py-3 text-center">Pagamento</th>
                <th className="px-4 py-3 text-center">Check-in</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{registration.name}</p>
                    {registration.academy && <p className="text-gray-500 text-xs">{registration.academy}</p>}
                    <p className="text-gray-600 text-xs">{formatDateTime(registration.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-gray-300">{registration.phone}</p>
                    {registration.reservationExpiresAt && !registration.paid && (
                      <p className="text-gray-500 text-xs">
                        Reserva até {formatDateTime(registration.reservationExpiresAt)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-gray-300 text-xs">{registration.event.title}</p>
                    {registration.event.price > 0 && <p className="text-gray-500 text-xs">{formatCurrency(registration.event.price)}</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handlePayment(registration.id, !registration.paid)}
                      className={`text-xs px-2 py-1 rounded-full font-semibold transition-all ${paymentBadgeClasses(registration.paymentStatus, registration.paid)}`}
                    >
                      {registration.paid ? "✓ Pago" : getPaymentStatusLabel(registration.paymentStatus)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleCheckIn(registration.id, !registration.checkedIn)}
                      className={`text-xs px-2 py-1 rounded-full font-semibold transition-all ${
                        registration.checkedIn
                          ? "bg-blue-900/50 text-blue-400 hover:bg-blue-900"
                          : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                      }`}
                    >
                      {registration.checkedIn ? "✓ Presente" : "Ausente"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button type="button" onClick={() => handleDelete(registration.id)} className="text-red-500 hover:text-red-400 text-xs">
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhum participante encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
