import { prisma } from "@/lib/prisma";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import EventCard from "@/components/public/EventCard";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import Image from "next/image";

export const revalidate = 30;

async function getData() {
  const [events, settingsArr, banners] = await Promise.all([
    prisma.event.findMany({
      orderBy: [
        { status: "asc" }, // open first
        { date: "asc" },
      ],
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.siteSettings.findMany(),
    prisma.banner.findMany({ where: { active: true }, orderBy: { order: "asc" }, take: 1 }),
  ]);

  const settings: Record<string, string> = {};
  settingsArr.forEach((s) => (settings[s.key] = s.value));

  return { events, settings, heroBanner: banners[0] ?? null };
}

export default async function HomePage() {
  const { events, settings, heroBanner } = await getData();

  const openEvents = events.filter((e) => e.status === "open");
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const closedEvents = events.filter((e) => ["closed", "finished"].includes(e.status));

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar settings={settings} />

      {/* Banner hero — só exibido quando o admin cadastrar um banner */}
      {heroBanner && (
        <header className="pt-14 md:pt-16">
          <div className="relative h-44 md:h-60 overflow-hidden">
            <Image src={heroBanner.imageUrl} alt={heroBanner.title ?? "Banner"} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/20 to-gray-950" />
          </div>
        </header>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-16 pt-20 md:pt-22">

        {/* Open registrations */}
        {openEvents.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-white font-bold text-lg">Inscrições Abertas</h2>
              <span className="ml-auto text-xs text-gray-500">{openEvents.length} evento{openEvents.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {openEvents.map((e) => (
                <EventCard key={e.id} event={e} count={e._count.registrations} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingEvents.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className="text-white font-bold text-lg">Em Breve</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((e) => (
                <EventCard key={e.id} event={e} count={e._count.registrations} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {openEvents.length === 0 && upcomingEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-white mb-2">Nenhum evento no momento</h2>
            <p className="text-gray-500 text-sm mb-6">
              Volte em breve — novos eventos serão publicados aqui.
            </p>
            {settings.whatsapp && (
              <WhatsAppButton phone={settings.whatsapp} />
            )}
          </div>
        )}

        {/* Past events */}
        {closedEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-gray-600 font-semibold text-sm uppercase tracking-wider">Eventos Anteriores</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-50">
              {closedEvents.map((e) => (
                <EventCard key={e.id} event={e} count={e._count.registrations} past />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
