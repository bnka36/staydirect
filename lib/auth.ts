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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.slug = (user as any).slug
        token.plan = (user as any).plan
        token.planExpiresAt = (user as any).planExpiresAt ?? null
        token.isAdmin = (user as any).email === (process.env.ADMIN_EMAIL || 'bnk.a36@gmail.com')
      }
      // Vérifier expiration à chaque refresh du token
      if (token.id && token.planExpiresAt) {
        const expired = new Date(token.planExpiresAt as string) < new Date()
        if (expired) {
          await prisma.user.update({
            where: { id: token.id as string },
            data: { plan: 'starter', planExpiresAt: null },
          })
          token.plan = 'starter'
          token.planExpiresAt = null
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
      }
      return session
    },
  },
}
