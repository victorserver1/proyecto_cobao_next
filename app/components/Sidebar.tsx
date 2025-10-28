"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Settings, User, LogIn, LogOut } from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function Sidebar() {
  const pathname = usePathname();

  const items: SidebarItem[] = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Publicaciones", href: "/admin", icon: BarChart2 },
    { name: "Configuración", href: "/settings", icon: Settings },
  ];

  const renderItem = (item: SidebarItem, showText: boolean) => {
    const isActive = pathname === item.href
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive
            ? "bg-red-100 text-red-900 font-semibold"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Icon className="w-6 h-6" />
        {showText && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar Desktop (texto + iconos) */}
      <aside className="hidden md:flex flex-col fixed top-20 left-0 w-64 h-[calc(100vh-80px)] bg-white border-r border-gray-200 shadow-sm">
        {/* Header con Avatar */}
        <div className="flex items-center gap-2 p-4 border-b">
          <img
            src="https://ui-avatars.com/api/?name=Luis+Jimenez"
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
          <span className="font-semibold text-sm">Luis Jiménez</span>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {items.map(item => renderItem(item, true))}
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center gap-2 px-3 py-2 w-full rounded-md justify-center bg-gray-800 hover:bg-gray-900 text-white text-sm">
            <LogIn size={18} /> Iniciar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar Móvil (solo iconos) */}
      <aside className="flex md:hidden flex-col fixed top-20 left-0 w-20 h-[calc(100vh-80px)] bg-white border-r border-gray-200 shadow-sm">
        {/* Header con Avatar */}
        <div className="flex items-center justify-center p-4 border-b">
          <img
            src="https://ui-avatars.com/api/?name=Luis+Jimenez"
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>

        <nav className="flex-1 flex flex-col items-center justify-start py-2 space-y-2">
          {items.map(item => renderItem(item, false))}
        </nav>

        <div className="p-4 border-t flex justify-center">
          <button className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-md">
            <LogIn size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
