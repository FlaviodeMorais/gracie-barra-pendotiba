import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import TrialClassForm from "@/components/public/TrialClassForm";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import { prisma } from "@/lib/prisma";
import { DAYS_FULL } from "@/lib/utils";

export const revalidate = 3600;

export default async function AgendarPage() {
  const [settingsArr, hours] = await Promise.all([
    prisma.siteSettings.findMany(),
    prisma.operatingHours.findMany({ orderBy: { day: "asc" } }),
  ]);

  const settings: Record<string, string> = {};
  settingsArr.forEach((s) => (settings[s.key] = s.value));

  const openDays = hours.filter((h) => h.open).map((h) => ({
    day: h.day,
    label: DAYS_FULL[h.day],
    openTime: h.openTime,
    closeTime: h.closeTime,
  }));

  return (
    <>
      <Navbar settings={settings} />
      <main className="min-h-screen bg-gray-950 pt-14 md:pt-16">
        <div className="border-b border-gray-800/60 bg-gray-950 px-4 py-6">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-1 h-8 bg-red-600 rounded-full flex-shrink-0" />
            <div>
              <h1 className="text-xl font-black text-white">Aula Teste Gratuita</h1>
              <p className="text-gray-500 text-sm">Preencha o formulário e entraremos em contato para confirmar.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrialClassForm openDays={openDays} />
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-white font-bold mb-4">Por que treinar conosco?</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  "Instrutores certificados Gracie Barra",
                  "Ambiente seguro e acolhedor",
                  "Turmas para todas as idades",
                  "Aulas para iniciantes e avançados",
                  "Jiu-Jitsu, Muay Thai e mais",
                  "Próximo a Praça Tancredo Neves",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-white font-bold mb-3">Horários de Funcionamento</h3>
              <ul className="space-y-2 text-sm">
                {hours.map((h) => (
                  <li key={h.day} className="flex justify-between text-gray-400">
                    <span>{DAYS_FULL[h.day].slice(0, 3)}</span>
                    <span>{h.open ? `${h.openTime} – ${h.closeTime}` : <span className="text-gray-600">Fechado</span>}</span>
                  </li>
                ))}
              </ul>
            </div>

            {settings.whatsapp && (
              <WhatsAppButton
                phone={settings.whatsapp}
                message="Olá! Gostaria de agendar uma aula teste na Gracie Barra Pendotiba."
                fullWidth
              />
            )}
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
