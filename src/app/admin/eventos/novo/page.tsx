import { prisma } from "@/lib/prisma";
import EventForm from "@/components/admin/EventForm";

export default async function NovoEventoPage() {
  const settings = await prisma.siteSettings.findMany({
    where: { key: { in: ["pixKey", "pixKeyType"] } },
  });

  const pixKey = settings.find((s) => s.key === "pixKey")?.value ?? "";
  const pixKeyType = settings.find((s) => s.key === "pixKeyType")?.value ?? "phone";

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Novo Evento</h1>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <EventForm defaultPixKey={pixKey} defaultPixKeyType={pixKeyType} />
      </div>
    </div>
  );
}
