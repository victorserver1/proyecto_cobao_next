// app/music/manage/page.tsx
import { prisma } from "@/lib/prisma";
import MusicListClient from "./MusiListClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ManageMusicPage() {
   const session = await getServerSession( authOptions);

    if(!session) {
        redirect('/api/auth/signin');

    }

     const roles = session.user?.roles || [];
  
const userId = session.user?.id || ''
console.log(userId)
const isAdmin = roles.includes('administrador');
console.log(isAdmin)

    if(!roles.includes('administrador')) return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">
                No tienes permiso para ver esta página, espera a que un administrador te asigne los permisos necesarios.
            </h1>
        </div>  
    )

    
     console.log(userId)
  const items = await prisma.music.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      url: true,
      status: true,
      createdAt: true,
      filePath: true,
    },
  });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mi música</h1>
      <p className="text-sm text-gray-500">Reproduce, archiva, transmite o elimina tus archivos.</p>
      <MusicListClient initialItems={items} />
    </main>
  );
}