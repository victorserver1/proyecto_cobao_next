// app/admin/page.tsx (Server Component)
import { getServerSession } from "next-auth";
import { getAllPosts, getAllPostsAdmin } from "../../actions/post";
import AdminTable from "./AdminTable";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";



export default async function AdminPage() {
  const session = await getServerSession( authOptions);
     const ALL_ROLES = ['administrador', 'publicador', 'locutor']
 

  if(!session) return redirect('/api/auth/signin');
   const roles = session.user?.roles || [];
   const userId = session.user?.id || '';
   console.log(roles)

  if(!roles.includes('administrador') && !roles.includes('publicador')) return (
     <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        No tienes permiso para ver esta página, espera a que un administrador te asigne los permisos necesarios.
      </h1>
    </div>
  )

  const posts = await getAllPostsAdmin(userId)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Gestor de publicaciones
      </h1>

      {/* Componente cliente */}
      <AdminTable posts={posts} />
    </div>
  );
}
