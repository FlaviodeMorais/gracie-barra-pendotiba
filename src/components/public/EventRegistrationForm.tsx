"use client";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import QRCode from "qrcode";

type Event = {
  id: string;
  title: string;
  price: number;
  pixKey?: string | null;
  pixKeyType?: string | null;
};

type Settings = Record<string, string>;

type RegistrationState = {
  id: string;
  pixTxId: string | null;
  adults: number;
  children: number;
  totalAmount: number;
  paid: boolean;
  paymentStatus: string;
  reservationExpiresAt?: string | null;
} | null;

const inputCls =
  "w-full rounded-lg border border-gray-700 bg-gray-950/80 px-3.5 py-2.5 text-sm text-white transition-colors focus:border-red-600 focus:outline-none";

const activePollingStatuses = new Set(["pending", "in_process", "manual_pending"]);

function formatReservationTime(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function EventRegistrationForm({
  event,
  settings,
}: {
  event: Event;
  settings: Settings;
}) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<RegistrationState>(null);
  const [pixFailed, setPixFailed] = useState(false);
  const [manualConfirmation, setManualConfirmation] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  const totalAmount = event.price * adults;

  useEffect(() => {
    if (!registration || registration.totalAmount === 0 || !activePollingStatuses.has(paymentStatus) || paid) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/registrations/${registration.id}/status`);
        if (!response.ok) return;
        const data = await response.json();
        setPaid(Boolean(data.paid));
        setPaymentStatus(data.paymentStatus || "");
        setRegistration((current) => current ? { ...current, paid: Boolean(data.paid), paymentStatus: data.paymentStatus, reservationExpiresAt: data.reservationExpiresAt } : current);
        if (data.paid || !activePollingStatuses.has(data.paymentStatus)) {
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [registration, paid, paymentStatus]);

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    setLoading(true);
    setError("");
    setPixFailed(false);
    setManualConfirmation(false);
    setQrCode("");
    setPixPayload("");
    setCopied(false);
    setPaid(false);
    setPaymentStatus("");

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, adults, children }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao realizar inscrição");
        return;
      }

      setRegistration(data);
      setPaid(Boolean(data.paid));
      setPaymentStatus(data.paymentStatus || "");

      if (data.totalAmount > 0 && data.mpPix?.qrCodeBase64) {
        setPixPayload(data.mpPix.qrCode);
        setQrCode(`data:image/png;base64,${data.mpPix.qrCodeBase64}`);
      } else if (data.totalAmount > 0 && data.staticPixPayload) {
        setPixPayload(data.staticPixPayload);
        setQrCode(await QRCode.toDataURL(data.staticPixPayload, { errorCorrectionLevel: "M", width: 260 }));
        setManualConfirmation(true);
      } else if (data.totalAmount > 0 && data.mpPixError) {
        setPixFailed(true);
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
    const reservationTime = formatReservationTime(registration.reservationExpiresAt);
    const isExpired = paymentStatus === "expired";
    const isFailed = paymentStatus === "cancelled" || paymentStatus === "rejected";

    return (
      <div className="rounded-xl border border-green-800 bg-gray-900 p-4 sm:p-6">
        <div className="mb-5 text-center">
          <div className="mb-3 text-4xl">✅</div>
          <h3 className="text-lg font-black text-white sm:text-xl">Inscrição Recebida!</h3>
          <p className="mt-2 text-sm text-gray-400">
            Obrigado, <strong className="text-white">{form.name}</strong>!
          </p>
        </div>

        {registration.totalAmount > 0 && paid && (
          <div className="rounded-lg border border-green-800 bg-green-950/50 p-4 text-center">
            <p className="text-sm font-semibold text-green-400">✅ Pagamento confirmado! Nos vemos no evento.</p>
          </div>
        )}

        {registration.totalAmount > 0 && qrCode && !paid && !isExpired && !isFailed && (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 text-center sm:p-5">
            <h4 className="mb-1 text-base font-bold text-white">Pagamento via PIX</h4>
            <div className="mb-4 space-y-1 text-sm text-gray-400">
              <p>{registration.adults} adulto{registration.adults > 1 ? "s" : ""} × {formatCurrency(event.price)} = <strong className="text-white">{formatCurrency(registration.totalAmount)}</strong></p>
              {registration.children > 0 && (
                <p>{registration.children} criança{registration.children > 1 ? "s" : ""} (até 12 anos) — <span className="text-green-400 font-semibold">Gratuito</span></p>
              )}
              {reservationTime && (
                <p className="text-yellow-400">Reserva garantida até {reservationTime}.</p>
              )}
            </div>
            <div className="mb-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR Code PIX" width={200} height={200} className="rounded-lg" />
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
            {manualConfirmation ? (
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                Após o pagamento, guarde o comprovante. A confirmação será feita manualmente pela equipe.
              </p>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-gray-600 animate-pulse">
                Aguardando confirmação do pagamento...
              </p>
            )}
          </div>
        )}

        {registration.totalAmount > 0 && isExpired && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-center">
            <p className="text-sm font-semibold text-red-300">A reserva expirou antes da confirmação do pagamento.</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              Você pode preencher o formulário novamente para gerar um novo PIX e recuperar a vaga, se ela ainda estiver disponível.
            </p>
          </div>
        )}

        {registration.totalAmount > 0 && isFailed && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-center">
            <p className="text-sm font-semibold text-red-300">
              O pagamento foi marcado como {paymentStatus === "cancelled" ? "cancelado" : "recusado"}.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              Tente gerar uma nova inscrição para refazer o PIX.
            </p>
          </div>
        )}

        {registration.totalAmount > 0 && pixFailed && (
          <div className="rounded-lg border border-yellow-800 bg-yellow-950/40 p-4 text-center">
            <p className="text-sm font-semibold text-yellow-400">
              Não foi possível gerar o PIX automaticamente no momento.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              Sua inscrição foi registrada. Para combinar o pagamento de{" "}
              <strong className="text-white">{formatCurrency(registration.totalAmount)}</strong>, entre em contato pelo WhatsApp.
            </p>
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                  `Oi! Me inscrevi no evento "${event.title}" e preciso combinar o pagamento da inscrição.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700"
              >
                Falar no WhatsApp
              </a>
            )}
          </div>
        )}

        {registration.totalAmount === 0 && (
          <div className="rounded-lg border border-green-800 bg-green-950/50 p-4 text-center">
            <p className="text-sm font-semibold text-green-400">
              {event.price === 0 ? "Evento gratuito!" : "Nenhum valor a pagar."} Apresente-se no local na data informada.
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
              Taxa: <strong className="text-white">{formatCurrency(event.price)} por adulto</strong>
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Crianças até 12 anos: entrada gratuita. Pagamento via PIX após a inscrição.</p>
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

        <div className="rounded-xl border border-gray-700 bg-gray-950/60 p-4 space-y-4">
          <p className="text-sm font-semibold text-white">Quantos vão participar?</p>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-300 font-medium">Adultos</p>
              {event.price > 0 && (
                <p className="text-xs text-gray-500">{formatCurrency(event.price)} cada</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg flex items-center justify-center transition-colors">
                −
              </button>
              <span className="text-white font-bold text-lg w-6 text-center">{adults}</span>
              <button type="button" onClick={() => setAdults(adults + 1)}
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg flex items-center justify-center transition-colors">
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-300 font-medium">Crianças <span className="text-gray-500">(até 12 anos)</span></p>
              <p className="text-xs text-green-400">Entrada gratuita</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setChildren(Math.max(0, children - 1))}
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg flex items-center justify-center transition-colors">
                −
              </button>
              <span className="text-white font-bold text-lg w-6 text-center">{children}</span>
              <button type="button" onClick={() => setChildren(children + 1)}
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg flex items-center justify-center transition-colors">
                +
              </button>
            </div>
          </div>

          {event.price > 0 && (
            <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {adults} adulto{adults > 1 ? "s" : ""}
                {children > 0 ? ` + ${children} criança${children > 1 ? "s" : ""}` : ""}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-black text-white">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          )}
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
              ? `Inscrever-se · ${formatCurrency(totalAmount)}`
              : "Confirmar Inscrição Gratuita"}
        </button>
      </form>
    </div>
  );
}
