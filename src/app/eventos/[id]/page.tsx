import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import EventRegistrationForm from "@/components/public/EventRegistrationForm";
import Image from "next/image";
import Link from "next/link";
import { eventStatusLabel, formatCurrency, formatDateTime } from "@/lib/utils";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: { title: true, description: true },
  });
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
  settingsArr.forEach((setting) => (settings[setting.key] = setting.value));

  const status = eventStatusLabel(event.status);
  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - event._count.registrations
    : null;
  const soldOut = spotsLeft !== null && spotsLeft <= 0;
  const canRegister = event.registrationOpen && !soldOut;

  const details = [
    { label: "Data", value: formatDateTime(event.date), icon: "📅" },
    {
      label: "Inscrição",
      value: event.price > 0 ? formatCurrency(event.price) : "Gratuito",
      icon: event.price > 0 ? "💰" : "✅",
    },
    {
      label: "Inscritos",
      value: `${event._count.registrations}${event.maxParticipants ? ` / ${event.maxParticipants}` : ""}`,
      icon: "👥",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar settings={settings} />

      <main className="flex-1 public-top-offset">
        <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-5 transition-colors"
          >
            <svg width="16" height="16" className="block flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Todos os eventos
          </Link>

          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-2xl font-black leading-tight text-white md:text-3xl">
              {event.title}
            </h1>
            <span className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${status.color}`}>
              {status.label}
            </span>
          </div>

          <section className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
            <div className="relative aspect-[16/9] w-full bg-gray-950">
              {event.bannerUrl ? (
                <Image
                  src={event.bannerUrl}
                  alt={event.title}
                  fill
                  priority
                  className="object-cover object-[center_38%]"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.24),transparent_42%),linear-gradient(135deg,#111827,#030712)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/65 via-transparent to-transparent" />
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 rounded-lg border border-gray-800 bg-gray-950/45 sm:grid-cols-3">
                {details.map((item) => (
                  <div
                    key={item.label}
                    className="min-w-0 border-b border-gray-800 px-3 py-3 sm:border-b-0 sm:border-r sm:last:border-r-0"
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      <span className="mr-1 normal-case">{item.icon}</span>
                      {item.label}
                    </p>
                    <p className="truncate text-sm font-bold leading-snug text-white" title={item.value}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
                <div className="mt-4 rounded-lg border border-orange-800/50 bg-orange-950/40 px-3 py-2.5 text-sm font-semibold text-orange-300">
                  ⚡ Apenas {spotsLeft} vaga{spotsLeft > 1 ? "s" : ""} restante{spotsLeft > 1 ? "s" : ""}!
                </div>
              )}

              {event.address && (
                <div className="mt-5 border-t border-gray-800 pt-5">
                  <p className="text-sm leading-relaxed text-gray-500">
                    <strong className="text-white">Local:</strong> 📍 {event.address}
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="mt-5 mx-auto max-w-xl">
            {canRegister ? (
              <EventRegistrationForm event={event} settings={settings} />
            ) : (
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
                <p className="mb-3 text-3xl">{soldOut ? "😔" : "🔒"}</p>
                <p className="font-bold text-white">
                  {soldOut ? "Vagas esgotadas" : "Inscrições encerradas"}
                </p>
                <p className="mt-1 text-sm text-gray-500">Fique atento para os próximos eventos!</p>
                <Link href="/" className="mt-4 inline-block text-sm text-red-400 hover:underline">
                  Ver outros eventos
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
