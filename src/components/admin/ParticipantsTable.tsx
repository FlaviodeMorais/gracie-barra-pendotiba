"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";

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
  eventId: string;
  event: { title: string; price: number };
};

type Event = { id: string; title: string; date: string };

type Stats = { total: number; paid: number; pending: number; checkedIn: number };

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
    .filter((r) => !filter || r.eventId === filter)
    .filter((r) =>
      !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
    );

  const handlePayment = async (id: string, paid: boolean) => {
    await fetch(`/api/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid, paymentStatus: paid ? "paid" : "pending" }),
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
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            const url = e.target.value ? `/admin/participantes?eventId=${e.target.value}` : "/admin/participantes";
            router.push(url);
          }}
          className="bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
        >
          <option value="">Todos os eventos</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, email ou telefone..."
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
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{r.name}</p>
                    {r.academy && <p className="text-gray-500 text-xs">{r.academy}</p>}
                    <p className="text-gray-600 text-xs">{formatDateTime(r.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-gray-300">{r.email}</p>
                    <p className="text-gray-500 text-xs">{r.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-gray-300 text-xs">{r.event.title}</p>
                    {r.event.price > 0 && <p className="text-gray-500 text-xs">{formatCurrency(r.event.price)}</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handlePayment(r.id, !r.paid)}
                      className={`text-xs px-2 py-1 rounded-full font-semibold transition-all ${
                        r.paid
                          ? "bg-green-900/50 text-green-400 hover:bg-green-900"
                          : "bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900"
                      }`}
                    >
                      {r.paid ? "✓ Pago" : "Pendente"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleCheckIn(r.id, !r.checkedIn)}
                      className={`text-xs px-2 py-1 rounded-full font-semibold transition-all ${
                        r.checkedIn
                          ? "bg-blue-900/50 text-blue-400 hover:bg-blue-900"
                          : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                      }`}
                    >
                      {r.checkedIn ? "✓ Presente" : "Ausente"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button type="button" onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-400 text-xs">
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
