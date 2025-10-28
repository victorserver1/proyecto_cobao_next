'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "administrador" | "publicador" | "locutor";
export default function NavbarAdmin({ roles }: { roles: Role[] }) {
  const pathname = usePathname();

  const items: Array<{ href: string; label: string; roles: Role[] }> = [
    { href: "/admin/noticias", label: "Noticias", roles: ["publicador", "administrador"] },
    { href: "/admin/usuarios", label: "Usuarios", roles: ["administrador"] },
    { href: "/admin/musicdj", label: "Musica", roles: ["administrador"] },
    { href: "/admin/ads", label: "Anuncios", roles: ["administrador"] },
    { href: "/admin/transmision", label: "Transmision", roles: ["locutor", "administrador"] },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-8 overflow-x-auto">
          {items
            .filter(it => it.roles.some(r => roles.includes(r)))
            .map(it => {
              const isActive = pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-red-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-red-300"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
        </div>
      </div>
    </nav>
  );
}