'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleUserRole, toggleUserActive } from '@/app/actions/user'

export type User = {
  id: string
  name: string | null
  email: string | null
  image?: string | null
  roles: string[]
  isActive: boolean
}

const ROLE_PALETTE: Record<string, string> = {
  administrador: 'bg-red-800/30 text-red-100 border-red-500/40',
  publicador: 'bg-amber-800/30 text-amber-100 border-amber-500/40',
  locutor: 'bg-emerald-800/30 text-emerald-100 border-emerald-500/40',
}

const ALL_ROLES = ['administrador', 'publicador', 'locutor']

export default function UserRolesPanel({ users }: { users: User[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const onToggleRole = (userId: string, role: string) => {
    startTransition(async () => {
      await toggleUserRole(userId, role)
      router.refresh()
    })
  }

  const onToggleActive = (userId: string) => {
    startTransition(async () => {
      await toggleUserActive(userId)
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 md:p-4 border border-red-200">
      {/* ======= Vista MOBILE: Cards (sm) ======= */}
      <div className="space-y-3 md:hidden">
        {users.length === 0 ? (
          <div className="text-center text-gray-400 py-6">No hay usuarios</div>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border border-red-100 bg-red-50/40 p-3"
            >
              {/* Header del card */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {u.name ?? 'Sin nombre'}
                  </div>
                  <div className="text-xs text-gray-600 break-all">
                    {u.email ?? '—'}
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    u.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Roles */}
              <div className="mt-3 flex flex-wrap gap-2">
                {ALL_ROLES.map((role) => {
                  const active = u.roles?.includes(role)
                  return (
                    <button
                      key={role}
                      onClick={() => onToggleRole(u.id, role)}
                      className={`px-2 py-1 rounded border text-[11px] uppercase tracking-wide transition
                        ${active
                          ? ROLE_PALETTE[role] ??
                            'bg-gray-800/30 text-gray-100 border-gray-500/40'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      title={active ? 'Quitar rol' : 'Asignar rol'}
                    >
                      {role}
                    </button>
                  )
                })}
              </div>

              {/* Acción principal */}
              <div className="mt-3">
                <button
                  onClick={() => onToggleActive(u.id)}
                  className={`w-full px-3 py-2 rounded text-sm font-semibold transition
                    ${u.isActive
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-emerald-700 text-white hover:bg-emerald-600'
                    }`}
                >
                  {u.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ======= Vista DESKTOP: Tabla (md+) ======= */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-lg border border-red-100">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="border-b border-red-200 text-red-900 bg-red-50/70">
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Roles</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-6">
                    No hay usuarios
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-red-50 transition"
                  >
                    <td className="py-2.5 px-3 font-medium text-gray-800">
                      <span className="truncate block max-w-[240px]">
                        {u.name ?? 'Sin nombre'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">
                      <span className="truncate block max-w-[260px]">
                        {u.email ?? '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-2">
                        {ALL_ROLES.map((role) => {
                          const active = u.roles?.includes(role)
                          return (
                            <button
                              key={role}
                              onClick={() => onToggleRole(u.id, role)}
                              className={`px-2 py-1 rounded border text-xs uppercase tracking-wide transition
                                ${active
                                  ? ROLE_PALETTE[role] ??
                                    'bg-gray-800/30 text-gray-100 border-gray-500/40'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                              title={active ? 'Quitar rol' : 'Asignar rol'}
                            >
                              {role}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onToggleActive(u.id)}
                        className={`px-3 py-1.5 rounded text-sm font-semibold transition
                          ${u.isActive
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-emerald-700 text-white hover:bg-emerald-600'
                          }`}
                      >
                        {u.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isPending && (
          <div className="mt-3 text-xs text-gray-500">Guardando cambios…</div>
        )}
      </div>
    </div>
  )
}
