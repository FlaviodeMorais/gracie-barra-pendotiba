import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import EventRegistrationForm from "@/components/public/EventRegistrationForm";
import Image from "next/image";
import Link from "next/link";
import { formatDateTime, eventStatusLabel, formatCurrency } from "@/lib/utils";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true, description: true } });
  if (!event) return {};
  return { title: event.title, description: event.description.slice(0, 160) };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, settingsArr] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.siteSettings.findMany(),
  ]);

  if (!event) notFound();

  const settings: Record<string, string> = {};
  settingsArr.forEach((s) => (settings[s.key] = s.value));

  const status = eventStatusLabel(event.status);
  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - event._count.registrations
    : null;
  const soldOut = spotsLeft !== null && spotsLeft <= 0;
  const canRegister = event.registrationOpen && !soldOut;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar settings={settings} />

      <main className="flex-1 pt-14 md:pt-16">
        {/* Banner */}
        {event.bannerUrl ? (
          <div className="relative h-52 md:h-72">
            <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-red-950/30 to-gray-950" />
        )}

        <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8">
          {/* Back */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
            <svg width="16" height="16" className="block flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Todos os eventos
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-white flex-1">{event.title}</h1>
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0 ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
            {[
              { label: "Data", value: formatDateTime(event.date), icon: "📅" },
              { label: "Local", value: event.location, icon: "📍" },
              { label: "Inscrição", value: event.price > 0 ? formatCurrency(event.price) : "Gratuito", icon: event.price > 0 ? "💰" : "✅" },
              {
                label: "Inscritos",
                value: `${event._count.registrations}${event.maxParticipants ? ` / ${event.maxParticipants}` : ""}`,
                icon: "👥",
              },
            ].map((item) => (
              <div key={item.label} className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                <p className="text-gray-500 text-xs mb-1">{item.icon} {item.label}</p>
                <p className="text-white text-sm font-semibold leading-snug">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Spots warning */}
          {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
            <div className="bg-orange-950/40 border border-orange-800/50 rounded-xl px-4 py-2.5 mb-4 text-orange-400 text-sm font-semibold">
              ⚡ Apenas {spotsLeft} vaga{spotsLeft > 1 ? "s" : ""} restante{spotsLeft > 1 ? "s" : ""}!
            </div>
          )}

          {/* Description */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
            <h2 className="text-white font-bold mb-3">Sobre o Evento</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
            {event.address && (
              <p className="text-gray-500 text-xs mt-3">📍 {event.address}</p>
            )}
          </div>

          {/* Registration */}
          {canRegister ? (
            <EventRegistrationForm event={event} settings={settings} />
          ) : (
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
              <p className="text-3xl mb-3">{soldOut ? "😔" : "🔒"}</p>
              <p className="text-white font-bold">
                {soldOut ? "Vagas esgotadas" : "Inscrições encerradas"}
              </p>
              <p className="text-gray-500 text-sm mt-1">Fique atento para os próximos eventos!</p>
              <Link href="/" className="mt-4 inline-block text-red-400 hover:underline text-sm">
                Ver outros eventos
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
