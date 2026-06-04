"use client";
import { useState } from "react";
import { MODALITIES } from "@/lib/utils";

type OpenDay = { day: number; label: string; openTime: string; closeTime: string };

// text-base (16px) previne zoom automático no iOS
const inputCls =
  "w-full bg-gray-950 text-white border border-gray-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-red-600 transition-colors";

export default function TrialClassForm({ openDays }: { openDays: OpenDay[] }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", preferredDay: "", preferredTime: "",
    modality: "Jiu-Jitsu", notes: "",
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
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-green-800 text-center">
        <div className="text-5xl mb-4">🥋</div>
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Agendamento Recebido!</h3>
        <p className="text-gray-400 mb-4 text-sm sm:text-base">
          Obrigado, <strong className="text-white">{form.name}</strong>!{" "}
          Entraremos em contato em breve para confirmar sua aula teste.
        </p>
        <p className="text-gray-500 text-sm">Verifique seu email e WhatsApp.</p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setForm({ name: "", email: "", phone: "", preferredDay: "", preferredTime: "", modality: "Jiu-Jitsu", notes: "" });
          }}
          className="mt-6 text-red-400 hover:text-red-300 text-sm min-h-[44px] px-4"
        >
          Fazer outro agendamento
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 sm:p-8 border border-gray-800">
      <h2 className="text-xl sm:text-2xl font-black text-white mb-5">Agendar Aula Gratuita</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="trial-name">
              Nome Completo *
            </label>
            <input
              id="trial-name"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="trial-email">
              Email *
            </label>
            <input
              id="trial-email"
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="trial-phone">
              Telefone/WhatsApp *
            </label>
            <input
              id="trial-phone"
              required
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(21) 99999-9999"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="trial-modality">
              Modalidade *
            </label>
            <select
              id="trial-modality"
              value={form.modality}
              onChange={(e) => setForm({ ...form, modality: e.target.value })}
              className={inputCls}
            >
              {MODALITIES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="trial-day">
              Dia Preferido *
            </label>
            <select
              id="trial-day"
              required
              value={form.preferredDay}
              onChange={(e) => setForm({ ...form, preferredDay: e.target.value })}
              className={inputCls}
            >
              <option value="">Selecione um dia</option>
              {openDays.map((d) => <option key={d.day} value={d.label}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="trial-time">
              Horário Preferido *
            </label>
            <input
              id="trial-time"
              required
              value={form.preferredTime}
              onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
              placeholder="Ex: 19h ou manhã"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="trial-notes">
            Observações
          </label>
          <textarea
            id="trial-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Experiência prévia em artes marciais? Observações de saúde?"
            className={`${inputCls} resize-none`}
          />
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-700 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-base min-h-[52px]"
        >
          {loading ? "Enviando..." : "Agendar Minha Aula Gratuita"}
        </button>
      </form>
    </div>
  );
}
