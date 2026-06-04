import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminDashboard() {
  const [eventCount, trialCount, bannerCount, recentTrials, recentEvents] = await Promise.all([
    prisma.event.count(),
    prisma.trialClass.count(),
    prisma.banner.count({ where: { active: true } }),
    prisma.trialClass.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.event.findMany({
      orderBy: { date: "asc" },
      take: 3,
      where: { status: { in: ["upcoming", "open"] } },
      include: { _count: { select: { registrations: true } } },
    }),
  ]);

  const totalRegistrations = await prisma.eventRegistration.count();
  const pendingPayments = await prisma.eventRegistration.count({ where: { paid: false, paymentStatus: "pending" } });
  const pendingTrials = await prisma.trialClass.count({ where: { status: "pending" } });

  const stats = [
    { label: "Eventos Ativos", value: eventCount, icon: "🏆", href: "/admin/eventos", color: "border-red-700" },
    { label: "Total de Inscrições", value: totalRegistrations, icon: "👥", href: "/admin/participantes", color: "border-blue-700" },
    { label: "Pagamentos Pendentes", value: pendingPayments, icon: "💰", href: "/admin/participantes", color: "border-yellow-700" },
    { label: "Aulas Teste Pendentes", value: pendingTrials, icon: "🥋", href: "/admin/aulas-teste", color: "border-green-700" },
    { label: "Banners Ativos", value: bannerCount, icon: "🖼️", href: "/admin/banners", color: "border-purple-700" },
    { label: "Solicitações de Aula", value: trialCount, icon: "📋", href: "/admin/aulas-teste", color: "border-orange-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className={`bg-gray-900 rounded-xl p-5 border ${stat.color} hover:bg-gray-800 transition-all`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-3xl font-black text-white">{stat.value}</span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Próximos Eventos</h2>
            <Link href="/admin/eventos" className="text-red-400 text-sm hover:underline">Ver todos</Link>
          </div>
          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-950 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-semibold">{e.title}</p>
                    <p className="text-gray-500 text-xs">{formatDate(e.date)}</p>
                  </div>
                  <span className="text-blue-400 text-xs font-bold">{e._count.registrations} inscritos</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum evento próximo</p>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Últimas Solicitações de Aula</h2>
            <Link href="/admin/aulas-teste" className="text-red-400 text-sm hover:underline">Ver todas</Link>
          </div>
          {recentTrials.length > 0 ? (
            <div className="space-y-3">
              {recentTrials.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-950 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.modality} • {t.preferredDay}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    t.status === "pending" ? "bg-yellow-900/50 text-yellow-400" :
                    t.status === "confirmed" ? "bg-green-900/50 text-green-400" :
                    "bg-gray-800 text-gray-400"
                  }`}>{t.status === "pending" ? "Pendente" : t.status === "confirmed" ? "Confirmado" : t.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhuma solicitação ainda</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/admin/banners", label: "Gerenciar Banners", icon: "🖼️" },
          { href: "/admin/eventos/novo", label: "Criar Evento", icon: "➕" },
          { href: "/admin/horarios", label: "Editar Horários", icon: "📅" },
          { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 text-center transition-all">
            <div className="text-2xl mb-2">{a.icon}</div>
            <p className="text-gray-300 text-xs font-medium">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
