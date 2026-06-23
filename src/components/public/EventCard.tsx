import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const statusConfig: Record<string, { dot: string; badge: string; label: string }> = {
  open:     { dot: "bg-green-400", badge: "bg-green-500/15 text-green-300 border-green-500/25",  label: "Inscrições abertas" },
  upcoming: { dot: "bg-blue-400",  badge: "bg-blue-500/15 text-blue-300 border-blue-500/25",     label: "Em breve" },
  closed:   { dot: "bg-gray-500",  badge: "bg-gray-700/60 text-gray-300 border-gray-600/30",     label: "Encerrado" },
  finished: { dot: "bg-gray-600",  badge: "bg-gray-800 text-gray-400 border-gray-700/40",        label: "Finalizado" },
};

function CardContent({ event, count, past, priority, spotsLeft, soldOut, canRegister, priceLabel, actionLabel, status }: {
  event: Event; count: number; past: boolean; priority: boolean;
  spotsLeft: number | null; soldOut: boolean; canRegister: boolean;
  priceLabel: string; actionLabel: string;
  status: { dot: string; badge: string; label: string };
}) {
  return (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-900">
        {event.bannerUrl ? (
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.28),transparent_42%),linear-gradient(135deg,#111827,#030712)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/88 via-gray-950/20 to-transparent" />
        <div className={`absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md sm:text-xs ${status.badge}`}>
          <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${status.dot}`} />
          <span className="truncate">{status.label}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-white transition-colors group-hover:text-red-300">
            {event.title}
          </h3>
          {event.description && (
            <p className="mt-1 hidden text-xs leading-relaxed text-gray-500 line-clamp-2 sm:block">
              {event.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-sm text-gray-400">
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-red-400/80"><IconCalendar /></span>
            <span className="truncate">{formatDate(event.date)}</span>
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-red-400/80"><IconPin /></span>
            <span className="truncate">{event.location}</span>
          </span>
        </div>

        {!past && spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
          <p className="rounded-lg bg-orange-500/10 px-2.5 py-1.5 text-xs font-semibold text-orange-300">
            Últimas {spotsLeft} vaga{spotsLeft > 1 ? "s" : ""}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-800 pt-3">
          <div className="min-w-0">
            <p className={`text-base font-extrabold ${event.price > 0 ? "text-white" : "text-green-300"}`}>
              {priceLabel}
            </p>
            <p className="text-xs text-gray-500">
              {count} inscrito{count !== 1 ? "s" : ""}
            </p>
          </div>
          {!past && (
            <span className={`inline-flex min-h-10 flex-shrink-0 items-center justify-center rounded-lg px-4 text-sm font-bold transition-colors ${
              soldOut ? "bg-gray-800 text-gray-500"
              : canRegister ? "bg-red-600 text-white shadow-lg shadow-red-950/35 group-hover:bg-red-500"
              : "bg-gray-800 text-gray-300"
            }`}>
              {actionLabel}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default function EventCard({ event, count, past = false, priority = false }: {
  event: Event; count: number; past?: boolean; priority?: boolean;
}) {
  const status = statusConfig[event.status] ?? statusConfig.closed;
  const spotsLeft = event.maxParticipants ? event.maxParticipants - count : null;
  const soldOut = spotsLeft !== null && spotsLeft <= 0;
  const canRegister = event.registrationOpen && !soldOut && !past;
  const priceLabel = event.price > 0 ? formatCurrency(event.price) : "Gratuito";
  const actionLabel = soldOut ? "Esgotado" : canRegister ? "Inscrever" : "Ver";
  const shared = { event, count, past, priority, spotsLeft, soldOut, canRegister, priceLabel, actionLabel, status };

  if (past) {
    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/95 opacity-60 cursor-default">
        <CardContent {...shared} />
      </div>
    );
  }

  return (
    <Link
      href={`/eventos/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900/95 transition-all duration-200 hover:border-red-500/50 hover:bg-gray-900 active:scale-[0.99]"
    >
      <CardContent {...shared} />
    </Link>
  );
}
