import { getAllUsers } from '@/app/actions/user'
import UserRolesPanel from './UserRolesPanel'
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
           const ALL_ROLES = ['administrador', 'publicador', 'locutor']
        const roles = session?.user?.roles || [];
        
        if(!session) return redirect('/api/auth/signin');
      
        if(!roles.includes('administrador')) return (
           <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">
              No tienes permiso para ver esta página, espera a que un administrador te asigne los permisos necesarios.
            </h1>
          </div>
        )
  const users = await getAllUsers()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-xl font-bold mb-4 text-red-900">Gestión de Usuarios</h1>
      <UserRolesPanel users={users} />
    </div>
  )
}
