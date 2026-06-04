"use client";
import { useState } from "react";
import { BELTS, MODALITIES, formatCurrency, generatePixPayload } from "@/lib/utils";
import QRCode from "qrcode";
import Image from "next/image";

type Event = {
  id: string;
  title: string;
  price: number;
  pixKey?: string | null;
  pixKeyType?: string | null;
};

type Settings = Record<string, string>;

export default function EventRegistrationForm({ event, settings }: { event: Event; settings: Settings }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", belt: "branca", academy: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<{ id: string; pixTxId: string | null } | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [pixPayload, setPixPayload] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao realizar inscrição");
        return;
      }
      setRegistration(data);

      if (event.price > 0 && (event.pixKey || settings.pixKey)) {
        const key = event.pixKey || settings.pixKey;
        const keyType = event.pixKeyType || settings.pixKeyType || "email";
        const txId = data.pixTxId || "GBPENDOTIBA";
        const payload = generatePixPayload(
          key,
          keyType,
          event.price,
          settings.pixName || "Gracie Barra Pendotiba",
          settings.pixCity || "Niteroi",
          txId,
          `Inscricao ${event.title}`
        );
        setPixPayload(payload);
        const qr = await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", width: 300 });
        setQrCode(qr);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (registration) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 border border-green-800">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-2xl font-black text-white">Inscrição Realizada!</h3>
          <p className="text-gray-400 mt-2">Obrigado, {form.name}! Sua inscrição foi confirmada.</p>
        </div>

        {event.price > 0 && qrCode && (
          <div className="bg-gray-950 rounded-xl p-6 border border-gray-800 text-center">
            <h4 className="text-white font-bold text-lg mb-2">Pagamento via PIX</h4>
            <p className="text-gray-400 text-sm mb-4">
              Valor: <strong className="text-white">{formatCurrency(event.price)}</strong>
            </p>
            <div className="flex justify-center mb-4">
              <Image src={qrCode} alt="QR Code PIX" width={200} height={200} className="rounded-lg" />
            </div>
            <p className="text-gray-500 text-xs mb-2">Ou copie o código PIX:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={pixPayload}
                className="flex-1 bg-gray-900 text-gray-300 text-xs px-3 py-2 rounded-lg border border-gray-700 truncate"
              />
              <button
                onClick={() => navigator.clipboard.writeText(pixPayload)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex-shrink-0"
              >
                Copiar
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Após o pagamento, guarde o comprovante. Apresente-o no dia do evento.
            </p>
          </div>
        )}

        {event.price === 0 && (
          <div className="bg-green-950/50 border border-green-800 rounded-xl p-4 text-center">
            <p className="text-green-400 font-semibold">Evento gratuito! Apresente-se no local na data do evento.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
      <h2 className="text-2xl font-black text-white mb-6">Formulário de Inscrição</h2>
      {event.price > 0 && (
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-400 font-semibold">
            Taxa de inscrição: <strong>{formatCurrency(event.price)}</strong>
          </p>
          <p className="text-gray-400 text-sm mt-1">O pagamento será realizado via PIX após a inscrição.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome completo"
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Faixa *</label>
            <select
              value={form.belt}
              onChange={(e) => setForm({ ...form, belt: e.target.value })}
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600 capitalize"
            >
              {BELTS.map((b) => <option key={b} value={b} className="capitalize">{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Academia</label>
            <input
              value={form.academy}
              onChange={(e) => setForm({ ...form, academy: e.target.value })}
              placeholder="Nome da sua academia"
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
            placeholder="Alguma observação?"
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
          {loading ? "Processando..." : event.price > 0 ? `Inscrever-se • ${formatCurrency(event.price)}` : "Confirmar Inscrição Gratuita"}
        </button>
      </form>
    </div>
  );
}
