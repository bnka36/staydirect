export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@staydirect.fr'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const [users, messages, reservations] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, plan: true, planExpiresAt: true, createdAt: true,
        properties: { select: { id: true, name: true } },
        stripeSubscriptionId: true,
      },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.reservation.findMany({
      where: { status: 'confirmed' },
      select: { totalPrice: true, createdAt: true },
    }),
  ])

  const planCounts = users.reduce((acc, u) => {
    const p = u.plan || 'starter'
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const planRevenue: Record<string, number> = {
    solo: 19,
    petit: 39,
    pro: 69,
  }

  const mrr = users.reduce((sum, u) => {
    return sum + (planRevenue[u.plan || ''] || 0)
  }, 0)

  return NextResponse.json({ users, messages, reservations, planCounts, mrr })
}

// Marquer message comme lu
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }
  const { messageId } = await req.json()
  await prisma.contactMessage.update({ where: { id: messageId }, data: { read: true } })
  return NextResponse.json({ success: true })
}
