import Link from "next/link";
import Image from "next/image";
import { formatDate, formatCurrency, eventStatusLabel } from "@/lib/utils";

type Event = {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  date: Date;
  location: string;
  status: string;
  registrationOpen: boolean;
  price: number;
  maxParticipants: number | null;
};

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const statusConfig: Record<string, { dot: string; badge: string; label: string }> = {
  open:     { dot: "bg-green-500 animate-pulse", badge: "bg-green-500/15 text-green-400 border border-green-500/30", label: "Inscrições abertas" },
  upcoming: { dot: "bg-blue-400",               badge: "bg-blue-500/15 text-blue-400 border border-blue-500/30",   label: "Em breve" },
  closed:   { dot: "bg-gray-500",               badge: "bg-gray-700/50 text-gray-400 border border-gray-600/30",   label: "Encerrado" },
  finished: { dot: "bg-gray-600",               badge: "bg-gray-700/50 text-gray-500 border border-gray-700/30",   label: "Finalizado" },
};

export default function EventCard({
  event,
  count,
  past = false,
  priority = false,
}: {
  event: Event;
  count: number;
  past?: boolean;
  priority?: boolean;
}) {
  const cfg = statusConfig[event.status] ?? statusConfig.closed;
  const spotsLeft = event.maxParticipants ? event.maxParticipants - count : null;
  const soldOut = spotsLeft !== null && spotsLeft <= 0;
  const canRegister = event.registrationOpen && !soldOut && !past;

  return (
    <Link
      href={`/eventos/${event.id}`}
      className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 ${
        past
          ? "bg-gray-900/60 border border-gray-800/50 opacity-60 cursor-default"
          : "bg-gray-900 border border-gray-800 hover:border-red-600/50 hover:shadow-xl hover:shadow-red-950/20 active:scale-[0.98]"
      }`}
    >
      {/* ── Banner ───────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0">
        {event.bannerUrl ? (
          <div className="relative h-36 sm:h-44">
            <Image
              src={event.bannerUrl}
              alt={event.title}
              fill
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient mais dramático na parte inferior */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />

            {/* Badge de status sobre a imagem */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-red-950/60 via-gray-900 to-gray-900 flex flex-col items-center justify-center gap-2 relative">
            <span className="text-4xl">🏆</span>
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3 min-w-0">

        {/* Título + descrição */}
        <div className="min-w-0">
          <h3 className="text-white font-bold text-base leading-snug group-hover:text-red-400 transition-colors line-clamp-2">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Data + local */}
        <div className="flex flex-col gap-1.5 text-xs text-gray-400">
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-red-500/70"><IconCalendar /></span>
            <span className="truncate font-medium text-gray-300">{formatDate(event.date)}</span>
          </span>
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-red-500/70"><IconPin /></span>
            <span className="truncate">{event.location}</span>
          </span>
        </div>

        {/* Alerta vagas */}
        {!past && spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
          <div className="flex items-center gap-1.5 bg-orange-950/40 border border-orange-800/40 rounded-lg px-2.5 py-1.5">
            <span className="text-orange-400 text-xs">⚡</span>
            <span className="text-orange-400 text-xs font-semibold">
              Últimas {spotsLeft} vaga{spotsLeft > 1 ? "s" : ""}!
            </span>
          </div>
        )}

        {/* Rodapé: preço + botão */}
        <div className="mt-auto pt-3 border-t border-gray-800/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {event.price > 0 ? (
              <p className="text-white font-black text-base">{formatCurrency(event.price)}</p>
            ) : (
              <p className="text-green-400 font-bold text-sm">Gratuito</p>
            )}
            <p className="text-gray-600 text-xs">{count} inscrito{count !== 1 ? "s" : ""}</p>
          </div>

          {!past && (
            <span className={`flex-shrink-0 text-xs font-bold px-4 py-2.5 rounded-xl transition-all min-h-[40px] flex items-center ${
              soldOut
                ? "bg-gray-800 text-gray-500"
                : canRegister
                ? "bg-red-600 text-white group-hover:bg-red-500 shadow-lg shadow-red-900/30"
                : "bg-gray-800 text-gray-400"
            }`}>
              {soldOut ? "Esgotado" : canRegister ? "Inscrever-se →" : "Ver detalhes"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
