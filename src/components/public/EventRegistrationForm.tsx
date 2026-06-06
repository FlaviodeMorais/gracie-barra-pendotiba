"use client";
import { useState } from "react";
import { formatCurrency, generatePixPayload } from "@/lib/utils";
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

const inputCls =
  "w-full rounded-lg border border-gray-700 bg-gray-950/80 px-3.5 py-2.5 text-sm text-white transition-colors focus:border-red-600 focus:outline-none";

export default function EventRegistrationForm({
  event,
  settings,
}: {
  event: Event;
  settings: Settings;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<{ id: string; pixTxId: string | null } | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao realizar inscrição");
        return;
      }

      setRegistration(data);

      if (event.price > 0 && (event.pixKey || settings.pixKey)) {
        const payload = generatePixPayload(
          event.pixKey || settings.pixKey,
          event.pixKeyType || settings.pixKeyType || "email",
          event.price,
          settings.pixName || "Gracie Barra Pendotiba",
          settings.pixCity || "Niteroi",
          data.pixTxId || "GBPENDOTIBA",
          `Inscricao ${event.title}`
        );
        setPixPayload(payload);
        setQrCode(await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", width: 260 }));
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
      <div className="rounded-xl border border-green-800 bg-gray-900 p-4 sm:p-6">
        <div className="mb-5 text-center">
          <div className="mb-3 text-4xl">✅</div>
          <h3 className="text-lg font-black text-white sm:text-xl">Inscrição Confirmada!</h3>
          <p className="mt-2 text-sm text-gray-400">
            Obrigado, <strong className="text-white">{form.name}</strong>!
          </p>
        </div>

        {event.price > 0 && qrCode && (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 text-center sm:p-5">
            <h4 className="mb-1 text-base font-bold text-white">Pagamento via PIX</h4>
            <p className="mb-4 text-sm text-gray-400">
              Valor: <strong className="text-white">{formatCurrency(event.price)}</strong>
            </p>
            <div className="mb-4 flex justify-center">
              <Image src={qrCode} alt="QR Code PIX" width={200} height={200} className="rounded-lg" />
            </div>
            <p className="mb-2 text-xs text-gray-500">Ou copie o código Pix Copia e Cola:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={pixPayload}
                aria-label="Código PIX"
                className="min-w-0 flex-1 truncate rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs text-gray-300"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`min-h-10 flex-shrink-0 rounded-lg px-3 text-xs font-bold transition-colors ${
                  copied ? "bg-green-600 text-white" : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-600">
              Após o pagamento, guarde o comprovante e apresente no dia do evento.
            </p>
          </div>
        )}

        {event.price === 0 && (
          <div className="rounded-lg border border-green-800 bg-green-950/50 p-4 text-center">
            <p className="text-sm font-semibold text-green-400">
              Evento gratuito! Apresente-se no local na data informada.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
      <h2 className="mb-4 text-lg font-black text-white sm:text-xl">Formulário de Inscrição</h2>

      {event.price > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-800/50 bg-red-950/30 p-3">
          <span className="flex-shrink-0 text-base">💳</span>
          <div>
            <p className="text-sm font-semibold leading-tight text-red-400">
              Taxa: <strong className="text-white">{formatCurrency(event.price)}</strong>
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Pagamento via PIX após a inscrição.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-300" htmlFor="reg-name">
            Nome Completo *
          </label>
          <input
            id="reg-name"
            required
            autoComplete="name"
            value={form.name}
            onChange={(changeEvent) => setForm({ ...form, name: changeEvent.target.value })}
            placeholder="Seu nome completo"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-300" htmlFor="reg-email">
            Email *
          </label>
          <input
            id="reg-email"
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(changeEvent) => setForm({ ...form, email: changeEvent.target.value })}
            placeholder="seu@email.com"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-300" htmlFor="reg-phone">
            WhatsApp *
          </label>
          <input
            id="reg-phone"
            required
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(changeEvent) => setForm({ ...form, phone: changeEvent.target.value })}
            placeholder="(21) 99999-9999"
            className={inputCls}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-700 bg-red-950/50 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
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
