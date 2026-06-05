"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/banners", label: "Banners", icon: "🖼️" },
  { href: "/admin/eventos", label: "Eventos", icon: "🏆" },
  { href: "/admin/participantes", label: "Participantes", icon: "👥" },
  { href: "/admin/horarios", label: "Horário de Aulas", icon: "📅" },
  { href: "/admin/aulas-teste", label: "Aulas Teste", icon: "🥋" },
  { href: "/admin/funcionamento", label: "Funcionamento", icon: "🕐" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

// Barra inferior mobile — apenas os mais usados
const bottomNav = [
  { href: "/admin", label: "Início", icon: "📊" },
  { href: "/admin/eventos", label: "Eventos", icon: "🏆" },
  { href: "/admin/participantes", label: "Inscritos", icon: "👥" },
  { href: "/admin/banners", label: "Banners", icon: "🖼️" },
  { href: "/admin/configuracoes", label: "Config", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = navItems.find(
    (i) => pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href))
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* ── Sidebar desktop ──────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex lg:flex-col`}>
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Image src="/logo-gracie-barra.jpg" alt="Logo" width={38} height={38} className="rounded-full border-2 border-red-600" />
            <div>
              <p className="text-white font-bold text-sm">GRACIE BARRA</p>
              <p className="text-red-500 text-xs font-semibold">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link href="/" target="_blank"
            className="flex items-center gap-2 text-gray-500 hover:text-white text-xs px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-all">
            🌐 Ver Site
          </Link>
          <button type="button" onClick={handleLogout}
            className="flex items-center gap-2 w-full text-gray-500 hover:text-red-400 text-xs px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-all">
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Conteúdo principal ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header mobile */}
        <header className="lg:hidden bg-gray-900 border-b border-gray-800 px-3 py-2.5 flex items-center gap-3 sticky top-0 z-30">
          <button type="button" aria-label="Abrir menu" onClick={() => setSidebarOpen(true)}
            className="text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-800">
            <svg width="20" height="20" className="block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-bold text-sm flex-1">
            {currentPage ? `${currentPage.icon} ${currentPage.label}` : "Painel Admin"}
          </span>
          <Link href="/" target="_blank"
            className="text-gray-500 text-xs px-2 py-1.5 rounded-lg hover:bg-gray-800 hover:text-white transition-all">
            Ver site
          </Link>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 lg:pb-6">
          {children}
        </main>

        {/* ── Bottom nav mobile ─────────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-gray-900 border-t border-gray-800 flex">
          {bottomNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] text-center transition-colors ${
                  active ? "text-red-500" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
