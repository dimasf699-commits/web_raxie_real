import { prisma } from '@/lib/prisma'

export async function resolveOrSyncDbUser(sessionUser: {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
}) {
  if (!sessionUser) return null

  // 1. Try finding by ID
  if (sessionUser.id) {
    const userById = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (userById) return userById
  }

  // 2. Try finding by Email
  if (sessionUser.email) {
    const userByEmail = await prisma.user.findUnique({ where: { email: sessionUser.email } })
    if (userByEmail) return userByEmail

    // 3. Auto-provision missing user in database if session email is present
    try {
      const newUser = await prisma.user.create({
        data: {
          ...(sessionUser.id ? { id: sessionUser.id } : {}),
          email: sessionUser.email,
          name: sessionUser.name || 'Pelanggan',
          image: sessionUser.image || null,
          role: sessionUser.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER',
        },
      })
      return newUser
    } catch {
      // Fallback: create with auto-generated cuid if sessionUser.id collided
      return prisma.user.create({
        data: {
          email: sessionUser.email,
          name: sessionUser.name || 'Pelanggan',
          image: sessionUser.image || null,
          role: sessionUser.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER',
        },
      })
    }
  }

  return null
}
