// app/admin/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NavbarAdmin from "../NavbarAdmin";
 // ajusta la ruta si la pusiste en otro lugar

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }

  // Tipa/normaliza roles; si no existen, lista vacía
  const roles = (session.user as any)?.roles ?? [];
  console.log(roles)

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      {/* Barra superior con tabs y resaltado del activo */}
     

      <main className="py-6">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
             <NavbarAdmin roles={roles} />
             
          {children}
        </div>
      </main>
    </div>
  );
}