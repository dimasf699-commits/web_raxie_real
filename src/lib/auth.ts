import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const adapter = PrismaAdapter(prisma)
const originalCreateUser = adapter.createUser!

adapter.createUser = async (data) => {
  const user = await originalCreateUser(data)
  
  // Jika email cocok dengan ADMIN_EMAIL, ubah role di database juga
  if (user.email === process.env.ADMIN_EMAIL) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    })
  }

  // Auto-create referral code & points
  await prisma.user.update({
    where: { id: user.id },
    data: {
      loyaltyPoints: {
        create: {
          points: 100, // Welcome bonus
          description: 'Selamat datang di Raxie! Bonus poin pendaftaran.',
        },
      },
    },
  })

  // Send welcome email for OAuth users
  if (user.email) {
    try {
      const { sendWelcomeEmail } = await import('@/lib/email')
      await sendWelcomeEmail(user.email, user.name || 'Pelanggan')
    } catch (e) {
      console.error('[AUTH] Failed to send welcome email', e)
    }
  }

  return user
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            role: true,
          },
        })

        if (!user || !user.password) return null

        const passwordsMatch = await bcrypt.compare(
          parsed.data.password,
          user.password
        )
        if (!passwordsMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // Jika email cocok dengan ADMIN_EMAIL di .env, jadikan ADMIN
        if (user.email && user.email === process.env.ADMIN_EMAIL) {
          token.role = 'ADMIN'
        } else {
          token.role = user.role || 'CUSTOMER' // Paksa yang lain jadi CUSTOMER jika tidak ada
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
