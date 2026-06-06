export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const reservations = await prisma.reservation.findMany({
    where: { property: { userId: session.user.id } },
    include: { property: true },
    orderBy: { checkIn: 'asc' },
  })

  return NextResponse.json(reservations)
}
