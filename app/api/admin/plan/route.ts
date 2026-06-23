export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'bnk.a36@gmail.com'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { email, plan, days } = await req.json()
  if (!email || !plan) {
    return NextResponse.json({ error: 'email et plan requis' }, { status: 400 })
  }

  const planExpiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null

  const user = await prisma.user.update({
    where: { email },
    data: { plan, planExpiresAt },
    select: { email: true, plan: true, planExpiresAt: true },
  })

  return NextResponse.json({ success: true, user })
}
