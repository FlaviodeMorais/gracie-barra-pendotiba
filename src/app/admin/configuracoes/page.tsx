import { prisma } from "@/lib/prisma";
import SettingsAdmin from "@/components/admin/SettingsAdmin";

export const revalidate = 0;

export default async function ConfiguracoesPage() {
  const settingsArr = await prisma.siteSettings.findMany();
  const settings: Record<string, string> = {};
  settingsArr.forEach((s) => (settings[s.key] = s.value));

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Configurações do Site</h1>
      <SettingsAdmin settings={settings} />
    </div>
  );
}
