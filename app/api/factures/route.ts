export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  })
  const propertyIds = properties.map(p => p.id)

  const where: any = {
    propertyId: { in: propertyIds },
    status: 'confirmed',
  }
  if (year) {
    const y = parseInt(year)
    where.checkIn = {
      gte: new Date(`${y}-01-01`),
      lt: new Date(`${y + 1}-01-01`),
    }
  }
  if (month && year) {
    const y = parseInt(year)
    const m = parseInt(month)
    where.checkIn = {
      gte: new Date(y, m - 1, 1),
      lt: new Date(y, m, 1),
    }
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: { property: { select: { name: true, city: true } } },
    orderBy: { checkIn: 'desc' },
  })

  return NextResponse.json(reservations)
}
