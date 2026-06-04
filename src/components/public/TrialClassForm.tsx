"use client";
import { useState } from "react";
import { MODALITIES } from "@/lib/utils";

type OpenDay = { day: number; label: string; openTime: string; closeTime: string };

export default function TrialClassForm({ openDays }: { openDays: OpenDay[] }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", preferredDay: "", preferredTime: "", modality: "Jiu-Jitsu", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao agendar aula");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 border border-green-800 text-center">
        <div className="text-5xl mb-4">🥋</div>
        <h3 className="text-2xl font-black text-white mb-2">Agendamento Recebido!</h3>
        <p className="text-gray-400 mb-4">
          Obrigado, <strong className="text-white">{form.name}</strong>! Entraremos em contato em breve para confirmar sua aula teste.
        </p>
        <p className="text-gray-500 text-sm">Verifique seu email e WhatsApp.</p>
        <button
          onClick={() => { setSuccess(false); setForm({ name: "", email: "", phone: "", preferredDay: "", preferredTime: "", modality: "Jiu-Jitsu", notes: "" }); }}
          className="mt-6 text-red-400 hover:text-red-300 text-sm"
        >
          Fazer outro agendamento
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
      <h2 className="text-2xl font-black text-white mb-6">Agendar Aula Gratuita</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Telefone/WhatsApp *</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(21) 99999-9999"
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Modalidade de Interesse *</label>
            <select
              value={form.modality}
              onChange={(e) => setForm({ ...form, modality: e.target.value })}
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600"
            >
              {MODALITIES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Dia Preferido *</label>
            <select
              required
              value={form.preferredDay}
              onChange={(e) => setForm({ ...form, preferredDay: e.target.value })}
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600"
            >
              <option value="">Selecione um dia</option>
              {openDays.map((d) => <option key={d.day} value={d.label}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Horário Preferido *</label>
            <input
              required
              value={form.preferredTime}
              onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
              placeholder="Ex: 19h ou manhã"
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Observações</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Tem alguma experiência em artes marciais? Alguma observação de saúde?"
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-700 rounded-lg p-3 text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
        >
          {loading ? "Enviando..." : "Agendar Minha Aula Gratuita"}
        </button>
      </form>
    </div>
  );
}
