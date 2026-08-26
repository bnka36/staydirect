import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      slug: string
      plan: string
      planExpiresAt?: string | null
      isAdmin?: boolean
      impersonatedBy?: string | null
      businessType?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
