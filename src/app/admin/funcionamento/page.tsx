import { prisma } from "@/lib/prisma";
import OperatingHoursAdmin from "@/components/admin/OperatingHoursAdmin";

export const revalidate = 0;

export default async function FuncionamentoPage() {
  const hours = await prisma.operatingHours.findMany({ orderBy: { day: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Horários de Funcionamento</h1>
      <OperatingHoursAdmin
        hours={hours.map((h) => ({ id: h.id, day: h.day, open: h.open, openTime: h.openTime, closeTime: h.closeTime }))}
      />
    </div>
  );
}
