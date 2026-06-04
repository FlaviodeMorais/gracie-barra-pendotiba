import { prisma } from "@/lib/prisma";
import TrialAdmin from "@/components/admin/TrialAdmin";

export const revalidate = 0;

export default async function AulasTestePage() {
  const trials = await prisma.trialClass.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Aulas Teste</h1>
      <TrialAdmin trials={trials.map((t) => ({ ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }))} />
    </div>
  );
}
