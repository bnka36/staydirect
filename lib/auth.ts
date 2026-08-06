import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.slug = (user as any).slug
        token.isAdmin = (user as any).email === (process.env.ADMIN_EMAIL || 'bnk.a36@gmail.com')
      }
      // Toujours relire plan/businessType depuis la DB pour refléter les changements admin
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, planExpiresAt: true, businessType: true },
        })
        if (dbUser) {
          const expired = dbUser.planExpiresAt && new Date(dbUser.planExpiresAt) < new Date()
          if (expired) {
            await prisma.user.update({ where: { id: token.id as string }, data: { plan: 'starter', planExpiresAt: null } })
            token.plan = 'starter'
            token.planExpiresAt = null
          } else {
            token.plan = dbUser.plan
            token.planExpiresAt = dbUser.planExpiresAt?.toISOString() ?? null
          }
          token.businessType = dbUser.businessType ?? 'meuble'
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.slug = token.slug as string
        session.user.plan = token.plan as string
        session.user.planExpiresAt = token.planExpiresAt as string | null
        session.user.isAdmin = token.isAdmin as boolean
        session.user.businessType = token.businessType as string
      }
      return session
    },
  },
}
