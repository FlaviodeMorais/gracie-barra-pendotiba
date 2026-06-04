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

// Tailwind v4: SVGs need explicit width/height attrs to be constrained
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 flex-shrink-0">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 flex-shrink-0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function EventCard({
  event,
  count,
  past = false,
}: {
  event: Event;
  count: number;
  past?: boolean;
}) {
  const status = eventStatusLabel(event.status);
  const spotsLeft = event.maxParticipants ? event.maxParticipants - count : null;
  const soldOut = spotsLeft !== null && spotsLeft <= 0;

  return (
    <Link
      href={`/eventos/${event.id}`}
      className={`group flex flex-col bg-gray-900 rounded-2xl overflow-hidden border transition-all duration-200 ${
        past
          ? "border-gray-800 cursor-default"
          : "border-gray-800 hover:border-red-600/60 hover:shadow-lg hover:shadow-red-950/20 hover:-translate-y-0.5"
      }`}
    >
      {/* Banner */}
      {event.bannerUrl ? (
        <div className="relative h-40 flex-shrink-0">
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          <span className={`absolute top-2.5 right-2.5 text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm ${status.color}`}>
            {status.label}
          </span>
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-red-950/40 to-gray-900 flex items-center justify-center flex-shrink-0 relative">
          <span className="text-3xl">🏆</span>
          <span className={`absolute top-2.5 right-2.5 text-xs px-2.5 py-1 rounded-full font-semibold ${status.color}`}>
            {status.label}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5 min-w-0">
        <div className="min-w-0">
          <h3 className="text-white font-bold leading-snug group-hover:text-red-400 transition-colors line-clamp-2 text-sm">
            {event.title}
          </h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{event.description}</p>
        </div>

        {/* Meta — icons with explicit size attrs */}
        <div className="flex flex-col gap-1 text-xs text-gray-400 min-w-0">
          <span className="flex items-center gap-1.5 min-w-0">
            <IconCalendar />
            <span className="truncate">{formatDate(event.date)}</span>
          </span>
          <span className="flex items-center gap-1.5 min-w-0">
            <IconPin />
            <span className="truncate">{event.location}</span>
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs min-w-0">
            {event.price > 0 ? (
              <span className="text-white font-bold">{formatCurrency(event.price)}</span>
            ) : (
              <span className="text-green-400 font-semibold">Gratuito</span>
            )}
            <span className="text-gray-600 truncate">{count} inscrito{count !== 1 ? "s" : ""}</span>
          </div>

          {!past && (
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all ${
                soldOut
                  ? "bg-gray-800 text-gray-500"
                  : event.registrationOpen
                  ? "bg-red-600 text-white group-hover:bg-red-500"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              {soldOut ? "Esgotado" : event.registrationOpen ? "Inscrever-se" : "Ver"}
            </span>
          )}
        </div>

        {!past && spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
          <p className="text-orange-400 text-xs font-semibold">
            ⚡ {spotsLeft} vaga{spotsLeft > 1 ? "s" : ""} restante{spotsLeft > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
