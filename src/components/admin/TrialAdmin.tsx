"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";

type Trial = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredDay: string;
  preferredTime: string;
  modality: string;
  status: string;
  notes: string | null;
  createdAt: string;
};

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-900/50 text-yellow-400" },
  confirmed: { label: "Confirmado", color: "bg-green-900/50 text-green-400" },
  cancelled: { label: "Cancelado", color: "bg-red-900/50 text-red-400" },
  completed: { label: "Realizado", color: "bg-blue-900/50 text-blue-400" },
};

export default function TrialAdmin({ trials }: { trials: Trial[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const filtered = trials.filter((t) => filter === "all" || t.status === filter);

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/trial/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { alert("Erro ao atualizar o status. Tente novamente."); return; }
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta aula teste?")) return;
    const res = await fetch(`/api/trial/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Erro ao excluir. Tente novamente."); return; }
    router.refresh();
  };

  const counts = { all: trials.length, pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
  trials.forEach((t) => { counts[t.status as keyof typeof counts] = (counts[t.status as keyof typeof counts] || 0) + 1; });

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries({ all: "Todos", pending: "Pendentes", confirmed: "Confirmados", completed: "Realizados", cancelled: "Cancelados" }).map(([k, v]) => (
          <button type="button" key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === k ? "bg-red-600 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-700"
            }`}>
            {v} ({counts[k as keyof typeof counts] || 0})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t) => {
          const status = statusMap[t.status] || { label: t.status, color: "bg-gray-800 text-gray-400" };
          return (
            <div key={t.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-bold">{t.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>{t.email}</span>
                    <span>{t.phone}</span>
                    <span className="text-red-400 font-medium">{t.modality}</span>
                    <span>📅 {t.preferredDay} às {t.preferredTime}</span>
                    <span className="text-gray-600 text-xs">{formatDateTime(t.createdAt)}</span>
                  </div>
                  {t.notes && <p className="text-gray-500 text-xs mt-1">Obs: {t.notes}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {t.status === "pending" && (
                    <>
                      <button type="button" onClick={() => handleStatus(t.id, "confirmed")}
                        className="bg-green-900/50 hover:bg-green-800/50 text-green-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        Confirmar
                      </button>
                      <button type="button" onClick={() => handleStatus(t.id, "cancelled")}
                        className="bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg text-xs">
                        Cancelar
                      </button>
                    </>
                  )}
                  {t.status === "confirmed" && (
                    <button type="button" onClick={() => handleStatus(t.id, "completed")}
                      className="bg-blue-900/50 hover:bg-blue-800/50 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
                      Marcar Realizado
                    </button>
                  )}
                  <a href={`https://wa.me/55${t.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="bg-green-900/30 hover:bg-green-800/50 text-green-500 px-3 py-1.5 rounded-lg text-xs">
                    WhatsApp
                  </a>
                  <button type="button" onClick={() => handleDelete(t.id)}
                    className="bg-gray-800 hover:bg-red-950/50 text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-lg text-xs transition-colors">
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-3xl mb-2">🥋</p>
            <p>Nenhuma solicitação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
