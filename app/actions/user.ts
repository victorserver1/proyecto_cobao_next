'use server'

import { prisma } from '@/lib/prisma'

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      roles: true,
      isActive: true,
    },
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
  })
}

/** Agregar un rol si no existe o eliminarlo si ya existe */
export async function toggleUserRole(userId: string, role: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuario no encontrado')

  const roles = new Set(user.roles ?? [])
  roles.has(role) ? roles.delete(role) : roles.add(role)

  await prisma.user.update({
    where: { id: userId },
    data: { roles: Array.from(roles) },
  })
}

/** Activar / desactivar usuario */

export async function toggleUserActive(userId: string,) {
  'use server'
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuario no encontrado')

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  })
}
