import { prisma } from "@/lib/prisma";
import ScheduleAdmin from "@/components/admin/ScheduleAdmin";

export const revalidate = 0;

export default async function HorariosPage() {
  const schedules = await prisma.classSchedule.findMany({
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Horário de Aulas</h1>
      <ScheduleAdmin schedules={schedules.map((s) => ({ ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() }))} />
    </div>
  );
}
