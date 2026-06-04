"use client";
import { useState } from "react";
import { BELTS, formatCurrency, generatePixPayload } from "@/lib/utils";
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

// Classe base para inputs — text-base previne zoom no iOS
const inputCls =
  "w-full bg-gray-950 text-white border border-gray-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-red-600 transition-colors";

export default function EventRegistrationForm({ event, settings }: { event: Event; settings: Settings }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", belt: "branca", academy: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<{ id: string; pixTxId: string | null } | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [copied, setCopied] = useState(false);

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
      if (!res.ok) { setError(data.error || "Erro ao realizar inscrição"); return; }
      setRegistration(data);

      if (event.price > 0 && (event.pixKey || settings.pixKey)) {
        const key = event.pixKey || settings.pixKey;
        const keyType = event.pixKeyType || settings.pixKeyType || "email";
        const payload = generatePixPayload(
          key, keyType, event.price,
          settings.pixName || "Gracie Barra Pendotiba",
          settings.pixCity || "Niteroi",
          data.pixTxId || "GBPENDOTIBA",
          `Inscricao ${event.title}`
        );
        setPixPayload(payload);
        const qr = await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", width: 280 });
        setQrCode(qr);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (registration) {
    return (
      <div className="bg-gray-900 rounded-2xl p-5 sm:p-8 border border-green-800">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-xl sm:text-2xl font-black text-white">Inscrição Confirmada!</h3>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Obrigado, <strong className="text-white">{form.name}</strong>!
          </p>
        </div>

        {event.price > 0 && qrCode && (
          <div className="bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-800 text-center">
            <h4 className="text-white font-bold text-base sm:text-lg mb-1">Pagamento via PIX</h4>
            <p className="text-gray-400 text-sm mb-4">
              Valor: <strong className="text-white">{formatCurrency(event.price)}</strong>
            </p>
            <div className="flex justify-center mb-4">
              <Image src={qrCode} alt="QR Code PIX" width={220} height={220} className="rounded-xl" />
            </div>
            <p className="text-gray-500 text-xs mb-2">Ou copie o código Pix Copia e Cola:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={pixPayload}
                aria-label="Código PIX"
                className="flex-1 bg-gray-900 text-gray-300 text-xs px-3 py-3 rounded-xl border border-gray-700 truncate min-w-0"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-3 rounded-xl text-xs font-bold flex-shrink-0 min-h-[44px] transition-colors ${
                  copied ? "bg-green-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-3 leading-relaxed">
              Após o pagamento, guarde o comprovante e apresente no dia do evento.
            </p>
          </div>
        )}

        {event.price === 0 && (
          <div className="bg-green-950/50 border border-green-800 rounded-xl p-4 text-center">
            <p className="text-green-400 font-semibold text-sm sm:text-base">
              Evento gratuito! Apresente-se no local na data informada.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 sm:p-8 border border-gray-800">
      <h2 className="text-xl sm:text-2xl font-black text-white mb-5">Formulário de Inscrição</h2>

      {event.price > 0 && (
        <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-3 sm:p-4 mb-5 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">💳</span>
          <div>
            <p className="text-red-400 font-semibold text-sm">
              Taxa: <strong className="text-white">{formatCurrency(event.price)}</strong>
            </p>
            <p className="text-gray-500 text-xs mt-0.5">Pagamento via PIX após a inscrição.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="reg-name">
              Nome Completo *
            </label>
            <input
              id="reg-name"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome completo"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="reg-email">
              Email *
            </label>
            <input
              id="reg-email"
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              className={inputCls}
            />
          </div>
        </div>

        {/* Telefone + Faixa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="reg-phone">
              WhatsApp *
            </label>
            <input
              id="reg-phone"
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
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="reg-belt">
              Faixa *
            </label>
            <select
              id="reg-belt"
              value={form.belt}
              onChange={(e) => setForm({ ...form, belt: e.target.value })}
              className={inputCls}
            >
              {BELTS.map((b) => (
                <option key={b} value={b} className="capitalize">
                  {b.charAt(0).toUpperCase() + b.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Academia */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="reg-academy">
            Academia
          </label>
          <input
            id="reg-academy"
            value={form.academy}
            onChange={(e) => setForm({ ...form, academy: e.target.value })}
            placeholder="Nome da sua academia"
            className={inputCls}
          />
        </div>

        {/* Obs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="reg-notes">
            Observações
          </label>
          <textarea
            id="reg-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Alguma observação?"
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
          {loading
            ? "Processando..."
            : event.price > 0
            ? `Inscrever-se · ${formatCurrency(event.price)}`
            : "Confirmar Inscrição Gratuita"}
        </button>
      </form>
    </div>
  );
}
