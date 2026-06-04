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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex lg:flex-col`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Image src="/logo-gracie-barra.jpg" alt="Logo" width={40} height={40} className="rounded-full border-2 border-red-600" />
            <div>
              <p className="text-white font-bold text-sm">GRACIE BARRA</p>
              <p className="text-red-500 text-xs font-semibold">Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link href="/" target="_blank" className="flex items-center gap-2 text-gray-500 hover:text-white text-xs px-3 py-2 rounded-lg hover:bg-gray-800 transition-all">
            🌐 Ver Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-gray-500 hover:text-red-400 text-xs px-3 py-2 rounded-lg hover:bg-gray-800 transition-all"
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-4 lg:hidden">
          <button type="button" aria-label="Abrir menu" onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <svg width="24" height="24" className="block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-bold">Painel Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
